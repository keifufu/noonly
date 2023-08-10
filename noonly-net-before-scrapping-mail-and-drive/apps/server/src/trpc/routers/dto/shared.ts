import { SecurityLogPrismaModel, SessionPrismaModel, UserPrismaModel } from 'src/@generated/zod-prisma'

import { z } from 'zod'

export const UserDTO = UserPrismaModel.omit({
  hashedPassword: true,
  sessions: true,
  mfaBackupCodes: true,
  mfaSecret: true,
  securityLogs: true
}).extend({
  phoneNumber: z.string().transform((val) => {
    if (!val) return val
    // Replace all but the last 4 digits with asterisks
    return val.replace(/.(?=.{4})/g, '*')
  }).nullish()
})

export const SessionDTO = SessionPrismaModel.omit({
  userId: true,
  hashedRefreshToken: true
})

export const SecurityLogDTO = SecurityLogPrismaModel.omit({
  userId: true
})