import * as z from "zod"

export const SecurityLogPrismaModel = z.object({
  id: z.string(),
  userId: z.string(),
  success: z.boolean(),
  event: z.string(),
  ipAddress: z.string().nullish(),
  estimatedLocation: z.string().nullish(),
  createdAt: z.date(),
})
