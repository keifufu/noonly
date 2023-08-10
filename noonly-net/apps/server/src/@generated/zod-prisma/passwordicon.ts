import * as z from "zod"

export const PasswordIconPrismaModel = z.object({
  id: z.string(),
  userId: z.string(),
  data: z.unknown(),
  createdAt: z.date(),
})
