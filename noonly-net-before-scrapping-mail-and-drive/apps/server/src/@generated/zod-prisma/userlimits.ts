import * as z from "zod"

export const UserLimitsPrismaModel = z.object({
  id: z.string(),
  bytesUsed: z.bigint(),
  currentPasswords: z.number().int(),
  currentCustomIcons: z.number().int(),
  currentSubscriptions: z.number().int(),
})
