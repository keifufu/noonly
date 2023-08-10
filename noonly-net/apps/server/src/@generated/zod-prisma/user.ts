import * as z from "zod"
import { Tier } from "@prisma/client"

export const UserPrismaModel = z.object({
  id: z.string(),
  email: z.string(),
  isEmailConfirmed: z.boolean(),
  username: z.string(),
  hashedPassword: z.string(),
  encKeyStr_e: z.string(),
  enableSecurityLogs: z.boolean(),
  enableAdvancedLogs: z.boolean(),
  sendCrashReports: z.boolean(),
  scheduledDeletion: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tier: z.nativeEnum(Tier),
  tierUsageId: z.string(),
})
