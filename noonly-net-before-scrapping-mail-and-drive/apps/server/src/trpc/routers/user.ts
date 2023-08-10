import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber'
import { authenticateWithPassword, verifyPassword } from './auth'
import { UserChangePasswordInputDTO, UserChangePasswordOutputDTO } from './dto/user/changePassword.dto'
import { UserDeleteAccountInputDTO, UserDeleteAccountOutputDTO } from './dto/user/deleteAccount.dto'
import { UserDeleteSessionInputDTO, UserDeleteSessionOutputDTO } from './dto/user/deleteSession.dto'
import { UserFindByUsernameInputDTO, UserFindByUsernameOutputDTO } from './dto/user/findByUsername.dto'
import { UserGetSessionsInputDTO, UserGetSessionsOutputDTO } from './dto/user/getSessions.dto'
import { UserSendPhoneNumberConfirmationCodeInputDTO, UserSendPhoneNumberConfirmationCodeOutputDTO } from './dto/user/sendPhoneNumberConfirmationCode.dto'
import { UserSetPhoneNumberInputDTO, UserSetPhoneNumberOutputDTO } from './dto/user/setPhoneNumber.dto'
import { UserVerifyPhoneNumberInputDTO, UserVerifyPhoneNumberOutputDTO } from './dto/user/verifyPhoneNumber.dto'

import { TRPCError } from '@trpc/server'
import { prisma } from 'src/database/prisma'
import { Env } from 'src/utils/env'
import { Twilio } from 'twilio'
import { JwtTwoFactorGuardProcedure } from '../middleware/JwtTwoFactorGuard'
import { router } from '../trpc'
import { UserGetSecurityLogsInputDTO, UserGetSecurityLogsOutputDTO } from './dto/user/getSecurityLogs.dto'
import { UserSetEnableAdvancedLogsInputDTO, UserSetEnableAdvancedLogsOutputDTO } from './dto/user/setEnableAdvancedLogs.dto'
import { UserSetEnableSecurityLogsInputDTO, UserSetEnableSecurityLogsOutputDTO } from './dto/user/setEnableSecurityLogs.dto'
import { UserWipeSecurityLogsInputDTO, UserWipeSecurityLogsOutputDTO } from './dto/user/wipeSecurityLogs.dto'

const twilioClient = new Twilio(Env.instance.get('TWILIO_ACCOUNT_SID'), Env.instance.get('TWILIO_AUTH_TOKEN'))

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
  setPhoneNumber: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/user/set-phone-number', tags: ['User'], protect: true } })
    .input(UserSetPhoneNumberInputDTO)
    .output(UserSetPhoneNumberOutputDTO)
    .query(async ({ ctx, input }) => {
      if (ctx.user.phoneNumberLastChanged && new Date(ctx.user.phoneNumberLastChanged).getTime() > Date.now() - (1000 * 60 * 60 * 24 * 30))
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'You can only change your phone number once a month' })

      const phoneNumber = formatPhoneNumber(input.phoneNumber)

      const count = await prisma.usedPhoneNumbers.count({ where: { phoneNumber: phoneNumber } })
      if (count > 0) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Phone number already in use' })

      const user = await prisma.user.update({
        where: { id: ctx.user.id },
        data: { phoneNumber: phoneNumber, isPhoneNumberConfirmed: false }
      })
      return user
    }),
  // Ratelimit for one request every 10 minutes. (Twilio codes expire after 10 minutes)
  sendPhoneNumberConfirmationCode: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/user/send-phone-number-confirmation-code', tags: ['User'], protect: true },
      rateLimit: { max: 1, windowM: 10 } })
    .input(UserSendPhoneNumberConfirmationCodeInputDTO)
    .output(UserSendPhoneNumberConfirmationCodeOutputDTO)
    .query(async ({ ctx }) => {
      if (!ctx.user.phoneNumber)
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'User does not have a phone number' })
      if (ctx.user.isPhoneNumberConfirmed)
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Phone number is already verified' })

      await twilioClient.verify.services(Env.instance.get('TWILIO_VERIFICATION_SERVICE_SID')).verifications.create({
        to: ctx.user.phoneNumber,
        channel: 'sms'
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to send confirmation code' })
      })
    }),
  verifyPhoneNumber: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/user/verify-phone-number', tags: ['User'], protect: true } })
    .input(UserVerifyPhoneNumberInputDTO)
    .output(UserVerifyPhoneNumberOutputDTO)
    .query(async ({ ctx, input }) => {
      if (!ctx.user.phoneNumber)
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'User does not have a phone number' })
      if (ctx.user.isPhoneNumberConfirmed)
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Phone number is already verified' })

      const code = input.code.split(' ').join('').replaceAll('-', '')

      const twilioServiceSid = Env.instance.get('TWILIO_VERIFICATION_SERVICE_SID')
      const result = await twilioClient.verify.services(twilioServiceSid).verificationChecks.create({
        to: ctx.user.phoneNumber,
        code: code
      })

      if (!result.valid || result.status !== 'approved')
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid verification code' })

      const user = await prisma.$transaction(async (tc) => {
        if (ctx.user.phoneNumber)
          await tc.usedPhoneNumbers.create({ data: { phoneNumber: ctx.user.phoneNumber } })

        const user = await tc.user.update({ where: { id: ctx.user.id },
          data: { isPhoneNumberConfirmed: true, phoneNumberLastChanged: new Date() } }).catch(() => {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Failed to update User' })
        })
        return user
      }).catch(() => {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Failed to update User' })
      })

      return user
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
    })
})

function formatPhoneNumber(phoneNumber: string) {
  const util = PhoneNumberUtil.getInstance()
  const number = util.parse(phoneNumber)
  if (!util.isValidNumber(number))
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid phone number' })
  return util.format(number, PhoneNumberFormat.E164)
}