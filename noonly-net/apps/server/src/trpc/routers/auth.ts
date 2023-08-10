import argon2, { argon2id } from 'argon2'
import { JwtAuthGuardProcedure, addTierLimitsToUser, type TokenPayload } from '../middleware/JwtAuthGuard'
import { AuthAuthenticateWithMfaInputDTO, AuthAuthenticateWithMfaOutputDTO } from './dto/auth/authenticateWithMfa.dto'
import { AuthLoginInputDTO, AuthLoginOutputDTO } from './dto/auth/login.dto'
import { AuthLogoutInputDTO, AuthLogoutOutputDTO } from './dto/auth/logout.dto'
import { AuthRefreshInputDTO, AuthRefreshOutputDTO } from './dto/auth/refresh.dto'
import { AuthRegisterInputDTO, AuthRegisterOutputDTO } from './dto/auth/register.dto'

import { type Prisma, type User } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { type Request } from 'express'
import { sha256 } from 'js-sha256'
import jwt from 'jsonwebtoken'
import { prisma } from '../../database/prisma'
import { redis } from '../../database/redis'
import EmailService from '../../utils/EmailService'
import { capitalizeFirstLetter } from '../../utils/capitalizeFirstLetter'
import { Env } from '../../utils/env'
import { getEstimatedLocationFromRequest, getIpFromRequest, getRawUserAgentFromRequest } from '../../utils/trackingUtils'
import { JwtRefreshGuardProcedure, getRefreshTokenFromRequest } from '../middleware/JwtRefreshGuard'
import { RateLimitGuardProcedure } from '../middleware/RateLimitGuard'
import { router } from '../trpc'

export const authRouter = router({
  register: RateLimitGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/auth/register', tags: ['Auth'] } })
    .input(AuthRegisterInputDTO)
    .output(AuthRegisterOutputDTO)
    .query(async ({ ctx, input }) => {
      if (!Env.instance.get('REGISTRATIONS_ENABLED'))
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Registrations are currently disabled' })

      const hashedPassword = await hashPassword(input.password)
      const { user, session, jwtAccessToken, jwtRefreshToken } = await prisma.$transaction(async (tc) => {
        const user = await tc.user.create({
          data: {
            username: input.username,
            email: input.email,
            hashedPassword: hashedPassword,
            encKeyStr_e: input.encKeyStr_e,
            tierUsage: {
              create: {}
            }
          },
          include: { tierUsage: true }
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
            ipAddress: user.enableAdvancedLogs ? getIpFromRequest(ctx.req) : null,
            isMfaAuthenticated: true // The session after registering should already be authenticated
          }
        }).catch(() => {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create session' })
        })

        await createSecurityLog(user, ctx.req, true, 'Sign in success', tc)

        return { user, session, jwtAccessToken, jwtRefreshToken }
      }).catch((err) => {
        if (err instanceof TRPCError) throw err
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create user' })
      })

      ctx.res.setHeader('Set-Cookie', [jwtAccessToken.cookie, jwtRefreshToken.cookie])
      // Not awaiting this on purpose.
      EmailService.sendVerificationEmail(user)

      return { user: addTierLimitsToUser(user), session, accessJwt: jwtAccessToken.jwt, refreshJwt: jwtRefreshToken.jwt }
    }),
  login: RateLimitGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/auth/login', tags: ['Auth'] },
      rateLimit: { max: 5, windowM: 1 } })
    .input(AuthLoginInputDTO)
    .output(AuthLoginOutputDTO)
    .query(async ({ ctx, input }) => {
      const isLoginEmail = input.login.includes('@')
      const query = isLoginEmail ? { email: input.login } : { username: input.login }
      const user = await prisma.user.findUnique({ where: query, include: { tierUsage: true } })
      if (!user)
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid credentials' })
      const validPassword = await verifyPassword(user.hashedPassword, input.password).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Invalid credentials' })
      })

      if (!validPassword) {
        await createSecurityLog(user, ctx.req, false, 'Sign in failed')
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid credentials' })
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
            hashedRefreshToken: sha256(getRefreshTokenFromRequest(ctx.req))
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
            // so we can query it
            hashedRefreshToken: sha256(jwtRefreshToken.jwt.token),
            app: getRawUserAgentFromRequest(ctx.req),
            estimatedLocation: user.enableAdvancedLogs ? getEstimatedLocationFromRequest(ctx.req) : null,
            ipAddress: user.enableAdvancedLogs ? getIpFromRequest(ctx.req) : null
          }
        })

        await createSecurityLog(user, ctx.req, true, 'Sign in success', tc)
        // Not awaiting this on purpose
        EmailService.sendMfaEmail(user)

        return session
      }).catch((err) => {
        if (err instanceof TRPCError) throw err
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create Session' })
      })

      ctx.res.setHeader('Set-Cookie', [jwtAccessToken.cookie, jwtRefreshToken.cookie])

      return { user: addTierLimitsToUser(user), session, accessJwt: jwtAccessToken.jwt, refreshJwt: jwtRefreshToken.jwt }
    }),
  logout: JwtAuthGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/auth/logout', tags: ['Auth'], protect: true } })
    .input(AuthLogoutInputDTO)
    .output(AuthLogoutOutputDTO)
    .query(async ({ ctx }) => {
      await prisma.$transaction(async (tc) => {
        await tc.session.delete({ where: { hashedRefreshToken: sha256(getRefreshTokenFromRequest(ctx.req)) } }).catch(() => null)
        await createSecurityLog(ctx.user, ctx.req, true, 'Sign out', tc)
      })
      ctx.res.setHeader('Set-Cookie', [
        'Authentication=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
        'Refresh=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'
      ])
    }),
  refresh: JwtRefreshGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/auth/refresh', tags: ['Auth'], protect: true } })
    .input(AuthRefreshInputDTO)
    .output(AuthRefreshOutputDTO)
    .query(async ({ ctx }) => {
      const jwtAccessToken = getJwtAccessToken(ctx.user.id)
      const cookies = [jwtAccessToken.cookie]

      // Update refresh token it it's been issued over a day ago.
      // This prevents it from being updated on every refresh, but makes sure
      // it's updated often enough to remain valid.
      const sessionTokenLastUpdatedUnix = Math.floor(Date.parse(ctx.session.updatedAt.toString()) / 1000)
      const currentTimeUnix = Math.floor(Date.now() / 1000)
      const timeSinceLastUpdateInSeconds = currentTimeUnix - sessionTokenLastUpdatedUnix
      const oneDayInSeconds = 86400
      let newRefreshJwt = null
      if (timeSinceLastUpdateInSeconds >= oneDayInSeconds) {
        const jwtRefreshToken = getJwtRefreshToken(ctx.user.id)
        newRefreshJwt = jwtRefreshToken.jwt
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
      return { user: ctx.user, session: ctx.session, accessJwt: jwtAccessToken.jwt, refreshJwt: newRefreshJwt }
    }),
  authenticateWithMfa: JwtAuthGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/auth/authenticate-mfa', tags: ['Auth'], protect: true },
      rateLimit: { max: 5, windowM: 1 } })
    .input(AuthAuthenticateWithMfaInputDTO)
    .output(AuthAuthenticateWithMfaOutputDTO)
    .query(async ({ ctx, input }) => {
      const code = await redis.get(`EMAIL-MFA-CODE-${ctx.user.email}`)
      const sanitizedInput = input.mfaCode.split(' ').join('').replaceAll('-', '')
      if (code !== sanitizedInput)
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid code' })

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

function getJwtAccessToken(userId: string) {
  const payload: TokenPayload = { userId }
  const token = jwt.sign(payload, Env.instance.get('JWT_ACCESS_TOKEN_SECRET'), { expiresIn: Env.instance.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME') })

  return {
    cookie: `Authentication=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${Env.instance.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')};`,
    jwt: { token, expires: Env.instance.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME') }
  }
}

function getJwtRefreshToken(userId: string) {
  const payload: TokenPayload = { userId }
  const token = jwt.sign(payload, Env.instance.get('JWT_REFRESH_TOKEN_SECRET'), { expiresIn: Env.instance.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME') })
  // Note: Path needs to remain "/", we use the refresh token in getSessionFromRequest,
  // which is used basically everywhere, due to being used in JwtTwoFactorGuard
  const cookie = `Refresh=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${Env.instance.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')};`
  return {
    cookie,
    jwt: { token, expires: Env.instance.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME') }
  }
}

export async function getSessionFromRequest(request: Request, userId: string) {
  return await prisma.session.findFirst({ where: { userId: userId, hashedRefreshToken: sha256(getRefreshTokenFromRequest(request)) } })
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


export async function hashPassword(password: string) {
  return await argon2.hash(password, { type: argon2id })
}