import { authenticateWithPassword, createSecurityLog, verifyPassword } from './auth'
import { UserChangePasswordInputDTO, UserChangePasswordOutputDTO } from './dto/user/changePassword.dto'
import { UserDeleteAccountInputDTO, UserDeleteAccountOutputDTO } from './dto/user/deleteAccount.dto'
import { UserDeleteSessionInputDTO, UserDeleteSessionOutputDTO } from './dto/user/deleteSession.dto'
import { UserFindByUsernameInputDTO, UserFindByUsernameOutputDTO } from './dto/user/findByUsername.dto'
import { UserGetSessionsInputDTO, UserGetSessionsOutputDTO } from './dto/user/getSessions.dto'

import { TRPCError } from '@trpc/server'
import { prisma } from '../../database/prisma'
import { redis } from '../../database/redis'
import EmailService from '../../utils/EmailService'
import { sanitizeAuthCode } from '../../utils/sanitizeAuthCode'
import { JwtAuthGuardProcedure } from '../middleware/JwtAuthGuard'
import { JwtTwoFactorGuardProcedure } from '../middleware/JwtTwoFactorGuard'
import { router } from '../trpc'
import { UserChangeEmailInputDTO, UserChangeEmailOutputDTO } from './dto/user/changeEmail.dto'
import { UserChangeUsernameInputDTO, UserChangeUsernameOutputDTO } from './dto/user/changeUsername.dto'
import { UserGetSecurityLogsInputDTO, UserGetSecurityLogsOutputDTO } from './dto/user/getSecurityLogs.dto'
import { UserSendMfaEmailInputDTO, UserSendMfaEmailOutputDTO } from './dto/user/sendMfaEmail.dto'
import { UserSendVerificationEmailInputDTO, UserSendVerificationEmailOutputDTO } from './dto/user/sendVerificationEmail.dto'
import { UserSetEnableAdvancedLogsInputDTO, UserSetEnableAdvancedLogsOutputDTO } from './dto/user/setEnableAdvancedLogs.dto'
import { UserSetEnableSecurityLogsInputDTO, UserSetEnableSecurityLogsOutputDTO } from './dto/user/setEnableSecurityLogs.dto'
import { UserVerifyEmailInputDTO, UserVerifyEmailOutputDTO } from './dto/user/verifyEmail.dto'
import { UserWipeSecurityLogsInputDTO, UserWipeSecurityLogsOutputDTO } from './dto/user/wipeSecurityLogs.dto'

export const userRouter = router({
  findByUsername: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/user/find-by-username', tags: ['User'], protect: true } })
    .input(UserFindByUsernameInputDTO)
    .output(UserFindByUsernameOutputDTO)
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({ where: { username: input.username } })
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
      return user
    }),
  getSessions: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/user/get-sessions', tags: ['User'], protect: true } })
    .input(UserGetSessionsInputDTO)
    .output(UserGetSessionsOutputDTO)
    .query(async ({ ctx }) => {
      const sessions = await prisma.session.findMany({ where: { userId: ctx.user.id } })
      return sessions
    }),
  deleteSession: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/user/delete-session', tags: ['User'], protect: true } })
    .input(UserDeleteSessionInputDTO)
    .output(UserDeleteSessionOutputDTO)
    .query(async ({ input }) => {
      await prisma.session.delete({ where: { id: input.sessionId } }).catch(() => {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Failed to delete Session' })
      })
    }),
  getSecurityLogs: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/user/get-security-logs', tags: ['User'], protect: true } })
    .input(UserGetSecurityLogsInputDTO)
    .output(UserGetSecurityLogsOutputDTO)
    .query(async ({ ctx }) => {
      const securityLogs = await prisma.securityLog.findMany({ where: { userId: ctx.user.id } })
      return securityLogs
    }),
  wipeSecurityLogs: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/user/wipe-security-logs', tags: ['User'], protect: true } })
    .input(UserWipeSecurityLogsInputDTO)
    .output(UserWipeSecurityLogsOutputDTO)
    .query(async ({ ctx, input }) => {
      await authenticateWithPassword(ctx.user, ctx.req, input.password)

      await prisma.securityLog.deleteMany({ where: { userId: ctx.user.id } })
    }),
  setEnableSecurityLogs: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/user/set-enable-security-logs', tags: ['User'], protect: true } })
    .input(UserSetEnableSecurityLogsInputDTO)
    .output(UserSetEnableSecurityLogsOutputDTO)
    .query(async ({ ctx, input }) => {
      await authenticateWithPassword(ctx.user, ctx.req, input.password)

      if (input.enableSecurityLogs === false)
        await prisma.securityLog.deleteMany({ where: { userId: ctx.user.id } })
      await prisma.user.update({ where: { id: ctx.user.id }, data: { enableSecurityLogs: input.enableSecurityLogs } })
    }),
  setEnableAdvancedLogs: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/user/set-enable-advanced-logs', tags: ['User'], protect: true } })
    .input(UserSetEnableAdvancedLogsInputDTO)
    .output(UserSetEnableAdvancedLogsOutputDTO)
    .query(async ({ ctx, input }) => {
      await authenticateWithPassword(ctx.user, ctx.req, input.password)

      await prisma.user.update({ where: { id: ctx.user.id }, data: { enableAdvancedLogs: input.enableAdvancedLogs } })
    }),
  changePassword: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/user/change-password', tags: ['User'], protect: true },
      rateLimit: { max: 3, windowM: 60 } })
    .input(UserChangePasswordInputDTO)
    .output(UserChangePasswordOutputDTO)
    .query(async (/* { ctx, input } */) => {
      // TODO: Implement this
      // if (!input.currentPassword && !input.recoveryCode)
      //   throw new TRPCError({ code: 'BAD_REQUEST', message: 'You must provide your current password or a recovery code' })

      // let _unencryptedPassword
      // if (input.currentPassword) {
      //   // Verify that currentPassword matches with the user's password
      //   const encryptedPassword = encryptPassword(input.currentPassword, input.newPassword)
      //   const validPassword = await verifyPassword(ctx.user.hashedPassword, encryptedPassword)
      //   if (validPassword)
      //     _unencryptedPassword = input.currentPassword
      // }

      // if (input.recoveryCode) {
      //   // Decrypt pewrc with recoveryCode. It it fails, the recovery code is invalid
      //   const decryptedPassword = decryptPassword(ctx.user.pewrc, input.recoveryCode)
      //   if (decryptedPassword)
      //     _unencryptedPassword = decryptedPassword
      // }

      // if (!_unencryptedPassword)
      //   throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid password or recovery code' })

      // await blockerStore.setBlocked(ctx.user.id, true, 'Access blocked while password reset is in progress')
      // await reEncryptUserData(ctx.user.id, _unencryptedPassword, input.newPassword)

      // const newEncryptedAndHashedPassword = await hashPassword(encryptPassword(input.newPassword, input.newPassword))
      // const newPewrc = encryptPassword(_unencryptedPassword, input.newRecoveryCode)
      // await prisma.user.update({ where: { id: ctx.user.id },
      //   data: { hashedPassword: newEncryptedAndHashedPassword, pewrc: newPewrc } }).catch(() => {
      //   throw new TRPCError({ code: 'BAD_REQUEST', message: 'Failed to update User' })
      // })
      // await blockerStore.setBlocked(ctx.user.id, false)
    }),
  deleteAccount: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/user/delete-account', tags: ['User'], protect: true } })
    .input(UserDeleteAccountInputDTO)
    .output(UserDeleteAccountOutputDTO)
    .query(async ({ ctx, input }) => {
      const validPassword = await verifyPassword(ctx.user.hashedPassword, input.password)
      if (!validPassword)
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid password' })

      const oneWeekFromNow = new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000))
      await prisma.$transaction([
        prisma.user.update({ where: { id: ctx.user.id }, data: { scheduledDeletion: oneWeekFromNow } }),
        prisma.session.deleteMany({ where: { userId: ctx.user.id } })
      ]).catch(() => {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Failed to schedule account deletion' })
      })
    }),
  verifyEmail: JwtAuthGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/user/verify-email', tags: ['User'], protect: true } })
    .input(UserVerifyEmailInputDTO)
    .output(UserVerifyEmailOutputDTO)
    .query(async ({ ctx, input }) => {
      const code = await redis.get(`EMAIL-VERIFICATION-CODE-${ctx.user.email}`)
      const sanitizedInput = input.code.split(' ').join('').replaceAll('-', '')
      if (code !== sanitizedInput)
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid code' })

      await redis.del(`EMAIL-VERIFICATION-CODE-${ctx.user.email}`)
      await prisma.$transaction(async (tc) => {
        await tc.session.update({
          where: { id: ctx.session.id },
          data: { isMfaAuthenticated: true }
        }).catch(() => {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update Session' })
        })

        await tc.user.update({
          where: { id: ctx.user.id },
          data: {
            isEmailConfirmed: true
          }
        })

        await createSecurityLog(ctx.user, ctx.req, true, 'Email Verification Success', tc)
      })

      const user = { ...ctx.user, isEmailConfirmed: true }
      return { user }
    }),
  sendVerificationEmail: JwtAuthGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/user/send-verification-email', tags: ['User'], protect: true },
      rateLimit: { max: 10, windowM: 1 } })
    .input(UserSendVerificationEmailInputDTO)
    .output(UserSendVerificationEmailOutputDTO)
    .query(async ({ ctx }) => {
      await EmailService.sendVerificationEmail(ctx.user, true)
    }),
  sendMfaEmail: JwtAuthGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/user/send-mfa-email', tags: ['User'], protect: true },
      rateLimit: { max: 10, windowM: 1 } })
    .input(UserSendMfaEmailInputDTO)
    .output(UserSendMfaEmailOutputDTO)
    .query(async ({ ctx }) => {
      await EmailService.sendMfaEmail(ctx.user, true)
    }),
  changeEmail: JwtAuthGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/user/change-email', tags: ['User'], protect: true },
      rateLimit: { max: 1, windowS: 30 } })
    .input(UserChangeEmailInputDTO)
    .output(UserChangeEmailOutputDTO)
    .query(async ({ ctx, input }) => {
      const isValid = await verifyPassword(ctx.user.hashedPassword, input.password)
      if (!isValid) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid password' })

      const code = await redis.get(`EMAIL-VERIFICATION-CODE-${ctx.user.email}`)
      if (code !== sanitizeAuthCode(input.code))
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid code' })

      prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          email: input.email,
          isEmailConfirmed: true
        }
      })
    }),
  changeUsername: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/user/change-username', tags: ['User'], protect: true } })
    .input(UserChangeUsernameInputDTO)
    .output(UserChangeUsernameOutputDTO)
    .query(async ({ ctx, input }) => {
      const isValid = await verifyPassword(ctx.user.hashedPassword, input.password)
      if (!isValid) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid password' })

      prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          username: input.username,
          isEmailConfirmed: true
        }
      })
    })
})