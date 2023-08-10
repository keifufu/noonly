import * as z from "zod"

export const UserKeyPrismaModel = z.object({
  id: z.string(),
  userId: z.string(),
  privateKey_e: z.string(),
  publicKey: z.string(),
  createdAt: z.date(),
})
