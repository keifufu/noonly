import argon2, { argon2id } from 'argon2'
import { getIpFromRequest, getLocationFromRequest as getEstimatedLocationFromRequest, getRawUserAgentFromRequest } from 'src/utils/trackingUtils'
import { JwtAuthGuardProcedure, TokenPayload } from '../middleware/JwtAuthGuard'
import { AuthAuthenticateWithMfaInputDTO, AuthAuthenticateWithMfaOutputDTO } from './dto/auth/authenticateWithMfa.dto'
import { AuthDisableMfaInputDTO, AuthDisableMfaOutputDTO } from './dto/auth/disableMfa.dto'
import { AuthEnableMfaInputDTO, AuthEnableMfaOutputDTO } from './dto/auth/enableMfa.dto'
import { AuthGenerateMfaSecretInputDTO, AuthGenerateMfaSecretOutputDTO } from './dto/auth/generateMfaSecret.dto'
import { AuthLoginInputDTO, AuthLoginOutputDTO } from './dto/auth/login.dto'
import { AuthLogoutInputDTO, AuthLogoutOutputDTO } from './dto/auth/logout.dto'
import { AuthRefreshInputDTO, AuthRefreshOutputDTO } from './dto/auth/refresh.dto'
import { AuthRegisterInputDTO, AuthRegisterOutputDTO } from './dto/auth/register.dto'

import { Prisma, User } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { Request } from 'express'
import { sha256 } from 'js-sha256'
import jwt from 'jsonwebtoken'
import { authenticator } from 'otplib'
import { prisma } from 'src/database/prisma'
import { router } from 'src/trpc/trpc'
import { capitalizeFirstLetter } from 'src/utils/capitalizeFirstLetter'
import { Env } from 'src/utils/env'
import { randomToken } from 'src/utils/randomToken'
import { JwtRefreshGuardProcedure } from '../middleware/JwtRefreshGuard'
import { JwtTwoFactorGuardProcedure } from '../middleware/JwtTwoFactorGuard'
import { RateLimitGuardProcedure } from '../middleware/RateLimitGuard'

export const authRouter = router({
  register: RateLimitGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/auth/register', tags: ['Auth'] } })
    .input(AuthRegisterInputDTO)
    .output(AuthRegisterOutputDTO)
    .query(async ({ ctx, input }) => {
      if (!Env.instance.get('REGISTRATIONS_ENABLED'))
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Registrations are currently disabled' })

      const hashedPassword = await hashPassword(input.password)
      const mfaBackupCodes: string[] = []
      for (let i = 0; i < 16; i++)
        mfaBackupCodes.push(generateMfaBackupCode())

      const { user, session, jwtAccessToken, jwtRefreshToken } = await prisma.$transaction(async (tc) => {
        const user = await tc.user.create({
          data: {
            username: input.username,
            hashedPassword: hashedPassword,
            encKeyStr_e: input.encKeyStr_e,
            mfaBackupCodes: {
              set: mfaBackupCodes
            }
          }
        }).catch((err) => {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `${capitalizeFirstLetter(err.meta.target[0])} is already in use`
          })
        })

        const jwtAccessToken = getJwtAccessToken(user.id)
        const jwtRefreshToken = getJwtRefreshToken(user.id)

        const session = await tc.session.create({
          data: {
            user: {
              connect: {
                id: user.id
              }
            },
            // using sha256 here because we need the output of the hash to always be the same
            hashedRefreshToken: sha256(jwtRefreshToken.jwt.token),
            app: getRawUserAgentFromRequest(ctx.req),
            estimatedLocation: user.enableAdvancedLogs ? getEstimatedLocationFromRequest(ctx.req) : null,
            ipAddress: user.enableAdvancedLogs ? getIpFromRequest(ctx.req) : null
          }
        })

        await createSecurityLog(user, ctx.req, true, 'Sign in success', tc)

        return { user, session, jwtAccessToken, jwtRefreshToken }
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create User' })
      })

      ctx.res.setHeader('Set-Cookie', [jwtAccessToken.cookie, jwtRefreshToken.cookie])

      return { user, session, jwt: jwtAccessToken.jwt }
    }),
  login: RateLimitGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/auth/login', tags: ['Auth'] },
      rateLimit: { max: 5, windowM: 1 } })
    .input(AuthLoginInputDTO)
    .output(AuthLoginOutputDTO)
    .query(async ({ ctx, input }) => {
      const user = await prisma.user.findUnique({ where: { username: input.username } })
      if (!user)
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid username or password' })
      const validPassword = await verifyPassword(user.hashedPassword, input.password).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Invalid login credentials' })
      })

      if (!validPassword) {
        await createSecurityLog(user, ctx.req, false, 'Sign in failed')
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid username or password' })
      }

      if (user.scheduledDeletion) {
        if (input.cancelDeletion) {
          await prisma.user.update({
            where: { id: user.id },
            data: { scheduledDeletion: null }
          }).catch(() => {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update User' })
          })
        } else {
          throw new TRPCError({ code: 'FORBIDDEN', message: `Account is scheduled for deletion on ${user.scheduledDeletion}` })
        }
      }

      const jwtAccessToken = getJwtAccessToken(user.id)
      const jwtRefreshToken = getJwtRefreshToken(user.id)

      const session = await prisma.$transaction(async (tc) => {
        // Delete all sessions with the old Refresh token cookie, if any
        // This is to prevent the user from having multiple sessions from the same browser for example
        // Or multiple sessions from insomnia, etc.
        await tc.session.deleteMany({
          where: {
            userId: user.id,
            hashedRefreshToken: sha256(ctx.req.cookies.Refresh || '')
          }
        })

        const session = await tc.session.create({
          data: {
            user: {
              connect: {
                id: user.id
              }
            },
            // using sha256 here because we need the output of the hash to always be the same
            hashedRefreshToken: sha256(jwtRefreshToken.jwt.token),
            app: getRawUserAgentFromRequest(ctx.req),
            estimatedLocation: user.enableAdvancedLogs ? getEstimatedLocationFromRequest(ctx.req) : null,
            ipAddress: user.enableAdvancedLogs ? getIpFromRequest(ctx.req) : null
          }
        })

        await createSecurityLog(user, ctx.req, true, 'Sign in success', tc)

        return session
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create Session' })
      })

      ctx.res.setHeader('Set-Cookie', [jwtAccessToken.cookie, jwtRefreshToken.cookie])

      return { user, session, jwt: jwtAccessToken.jwt }
    }),
  logout: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/auth/logout', tags: ['Auth'], protect: true } })
    .input(AuthLogoutInputDTO)
    .output(AuthLogoutOutputDTO)
    .query(async ({ ctx }) => {
      await prisma.$transaction(async (tc) => {
        await tc.session.delete({ where: { hashedRefreshToken: sha256(ctx.req.cookies.Refresh || '') } }).catch(() => null)
        await createSecurityLog(ctx.user, ctx.req, true, 'Sign out', tc)
      })
      ctx.res.setHeader('Set-Cookie', getCookiesForLogout())
    }),
  refresh: JwtRefreshGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/auth/refresh', tags: ['Auth'], protect: true } })
    .input(AuthRefreshInputDTO)
    .output(AuthRefreshOutputDTO)
    .query(async ({ ctx }) => {
      const jwtAccessToken = getJwtAccessToken(ctx.user.id)
      const cookies = [jwtAccessToken.cookie]

      const sessionTokenLastUpdatedUnix = Math.floor(Date.parse(ctx.session.updatedAt.toString()) / 1000)
      const currentTimeUnix = Math.floor(Date.now() / 1000)
      const timeSinceLastUpdateInSeconds = currentTimeUnix - sessionTokenLastUpdatedUnix
      const refreshExpirationTime = Env.instance.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')
      const oneDayInSeconds = 86400
      // Update refresh token if it is going to expire in less than one day
      if (timeSinceLastUpdateInSeconds + oneDayInSeconds >= refreshExpirationTime) {
        const jwtRefreshToken = getJwtRefreshToken(ctx.user.id)
        cookies.push(jwtRefreshToken.cookie)
        await prisma.session.update({
          where: { id: ctx.session.id },
          data: {
            hashedRefreshToken: sha256(jwtRefreshToken.jwt.token)
          }
        }).catch(() => {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update Session' })
        })
      }

      ctx.res.setHeader('Set-Cookie', cookies)
      return { user: ctx.user, session: ctx.session, jwt: jwtAccessToken.jwt }
    }),
  generateMfaSecret: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/auth/generate-mfa-secret', tags: ['Auth'], protect: true } })
    .input(AuthGenerateMfaSecretInputDTO)
    .output(AuthGenerateMfaSecretOutputDTO)
    .query(async ({ ctx, input }) => {
      await authenticateWithPassword(ctx.user, ctx.req, input.password)

      if (ctx.user.hasMfaEnabled)
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'MFA is already enabled' })

      const secret = authenticator.generateSecret()
      const otpAuthUrl = authenticator.keyuri(ctx.user.id, Env.instance.get('PROJECT_NAME'), secret)
      await prisma.user.update({
        where: { id: ctx.user.id },
        data: { mfaSecret: secret }
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update User' })
      })

      return { secret, otpAuthUrl }
    }),
  enableMfa: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/auth/enable-mfa', tags: ['Auth'], protect: true } })
    .input(AuthEnableMfaInputDTO)
    .output(AuthEnableMfaOutputDTO)
    .query(async ({ ctx, input }) => {
      if (ctx.user.hasMfaEnabled)
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'MFA is already enabled' })

      const isCodeValid = await isMfaOrBackupCodeValid(input.mfaCode, ctx.user, false)

      if (!isCodeValid)
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid MFA code' })

      await prisma.$transaction(async (tc) => {
        await tc.user.update({
          where: { id: ctx.user.id },
          data: { hasMfaEnabled: true }
        })

        await tc.session.update({
          where: {
            id: ctx.session.id
          },
          data: {
            isMfaAuthenticated: true
          }
        })

        await createSecurityLog(ctx.user, ctx.req, true, 'Enabled MFA', tc)
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update User' })
      })
    }),
  disableMfa: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/auth/disable-mfa', tags: ['Auth'], protect: true } })
    .input(AuthDisableMfaInputDTO)
    .output(AuthDisableMfaOutputDTO)
    .query(async ({ ctx, input }) => {
      if (!ctx.user.hasMfaEnabled)
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'MFA is already disabled' })

      const isCodeValid = await isMfaOrBackupCodeValid(input.mfaOrBackupCode, ctx.user)
      if (!isCodeValid)
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid code' })

      await prisma.$transaction(async (tc) => {
        await tc.user.update({
          where: { id: ctx.user.id },
          data: { hasMfaEnabled: false }
        }).catch(() => {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update User' })
        })

        // Update all sessions to disable isMfaAuthenticated
        await tc.session.updateMany({
          where: { userId: ctx.user.id, isMfaAuthenticated: true },
          data: { isMfaAuthenticated: false }
        }).catch(() => {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update Sessions' })
        })

        await createSecurityLog(ctx.user, ctx.req, true, 'Disabled MFA', tc)
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update User' })
      })
    }),
  authenticateWithMfa: JwtAuthGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/auth/authenticate-mfa', tags: ['Auth'], protect: true },
      rateLimit: { max: 5, windowM: 1 } })
    .input(AuthAuthenticateWithMfaInputDTO)
    .output(AuthAuthenticateWithMfaOutputDTO)
    .query(async ({ ctx, input }) => {
      const isCodeValid = await isMfaOrBackupCodeValid(input.mfaOrBackupCode, ctx.user)
      if (!isCodeValid) {
        await createSecurityLog(ctx.user, ctx.req, false, 'MFA Authentication Failed')
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid code' })
      }

      await prisma.$transaction(async (tc) => {
        await tc.session.update({
          where: { id: ctx.session.id },
          data: { isMfaAuthenticated: true }
        }).catch(() => {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update Session' })
        })

        await createSecurityLog(ctx.user, ctx.req, true, 'MFA Authentication Success', tc)
      })

      const session = { ...ctx.session, isMfaAuthenticated: true, updatedAt: new Date() }
      return { user: ctx.user, session }
    })
})

async function isMfaOrBackupCodeValid(mfaCode: string, user: User, allowBackupCodes = true) {
  const sanitizedCode = mfaCode.split(' ').join('').replaceAll('-', '')
  const validMfa = authenticator.check(sanitizedCode, user.mfaSecret || '')
  if (validMfa) return true
  if (!allowBackupCodes) return false
  // Otherwise check if the code is a backup code
  const isBackupCode = user.mfaBackupCodes.includes(mfaCode)
  if (!isBackupCode) return false
  // If it is a backup code, remove it from the list of valid backup codes and add a new one
  await prisma.user.update({
    where: { id: user.id },
    data: {
      mfaBackupCodes: {
        set: [...user.mfaBackupCodes.filter((code) => code !== mfaCode), generateMfaBackupCode()]
      }
    }
  }).catch(() => {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update User' })
  })
  return true
}

function getJwtAccessToken(userId: string) {
  const payload: TokenPayload = { userId }
  const token = jwt.sign(payload, Env.instance.get('JWT_ACCESS_TOKEN_SECRET'), { expiresIn: Env.instance.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME') })

  return {
    cookie: `Authentication=${token}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=${Env.instance.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')};`,
    jwt: { token, expires: Env.instance.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME') }
  }
}

function getJwtRefreshToken(userId: string) {
  const payload: TokenPayload = { userId }
  const token = jwt.sign(payload, Env.instance.get('JWT_REFRESH_TOKEN_SECRET'), { expiresIn: Env.instance.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME') })
  const cookie = `Refresh=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${Env.instance.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')};`
  return {
    cookie,
    jwt: { token, expires: Env.instance.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME') }
  }
}

export async function getSessionFromRequest(request: Request, userId: string) {
  return await prisma.session.findFirst({ where: { userId: userId, hashedRefreshToken: sha256(request.cookies.Refresh || '') } })
}

function generateMfaBackupCode() {
  return randomToken(8, 'abcdefghijklmnopqrstuvwxyz0123456789')
}

export async function verifyPassword(hashedPassword: string, plainTextPassword: string) {
  try {
    if (await argon2.verify(hashedPassword, plainTextPassword))
      return true
    return false
  } catch (error) {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Invalid login credentials' })
  }
}

export async function authenticateWithPassword(user: User, req: Request, password: string) {
  const isPasswordValid = await verifyPassword(user.hashedPassword, password)
  if (!isPasswordValid) {
    await createSecurityLog(user, req, false, 'Authentication failed')
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid password' })
  }
  await createSecurityLog(user, req, true, 'Authentication success')
}

export async function createSecurityLog(user: User, req: Request, success: boolean, event: string, tc?: Prisma.TransactionClient) {
  if (!user.enableSecurityLogs) return
  await (tc || prisma).securityLog.create({
    data: {
      user: { connect: { id: user.id } },
      success,
      event,
      ipAddress: user.enableAdvancedLogs ? getIpFromRequest(req) : null,
      estimatedLocation: user.enableAdvancedLogs ? getEstimatedLocationFromRequest(req) : null
    }
  }).catch(() => {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create SecurityLog' })
  })
}

function getCookiesForLogout() {
  return [
    'Authentication=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
    'Refresh=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'
  ]
}

export async function hashPassword(password: string) {
  return await argon2.hash(password, { type: argon2id })
}