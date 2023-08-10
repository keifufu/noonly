import * as z from "zod"
import { Tier } from "@prisma/client"

export const UserPrismaModel = z.object({
  id: z.string(),
  username: z.string(),
  hashedPassword: z.string(),
  encKeyStr_e: z.string(),
  phoneNumber: z.string().nullish(),
  isPhoneNumberConfirmed: z.boolean(),
  phoneNumberLastChanged: z.date().nullish(),
  mfaSecret: z.string().nullish(),
  mfaBackupCodes: z.string().array(),
  hasMfaEnabled: z.boolean(),
  tier: z.nativeEnum(Tier),
  enableSecurityLogs: z.boolean(),
  enableAdvancedLogs: z.boolean(),
  sendCrashReports: z.boolean(),
  scheduledDeletion: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  encryptionKey_e: z.string(),
  userLimitsId: z.string(),
})
