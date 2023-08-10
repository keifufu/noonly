
import { z } from 'zod'
import { SecurityLogPrismaModel, SessionPrismaModel, TierUsagePrismaModel, UserPrismaModel } from '../../../@generated/zod-prisma'
import { TierLimitsDTO } from '../../../utils/TierLimits'

export const UserDTO = UserPrismaModel.omit({
  hashedPassword: true,
  sessions: true,
  securityLogs: true,
  tierUsageId: true
}).extend({
  email: z.string().transform((val) => {
    if (!val) return val
    return val.replace(/(\w{3})[\w.-]+@([\w.]+\w)/, '$1***@$2')
  }).nullish(),
  tierLimits: TierLimitsDTO
}).extend({
  tierUsage: TierUsagePrismaModel
})

export const SessionDTO = SessionPrismaModel.omit({
  userId: true,
  hashedRefreshToken: true
})

export const SecurityLogDTO = SecurityLogPrismaModel.omit({
  userId: true
})