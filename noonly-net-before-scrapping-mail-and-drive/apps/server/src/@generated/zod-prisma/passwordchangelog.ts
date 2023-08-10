import * as z from "zod"

export const PasswordChangelogPrismaModel = z.object({
  id: z.string(),
  message: z.string(),
  snapshotId: z.string().nullish(),
  createdAt: z.date(),
  ZDONTUSE_passwordId: z.string(),
})
