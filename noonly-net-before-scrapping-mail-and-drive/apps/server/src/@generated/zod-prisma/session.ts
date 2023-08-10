import * as z from "zod"

export const SessionPrismaModel = z.object({
  id: z.string(),
  userId: z.string(),
  app: z.string(),
  ipAddress: z.string().nullish(),
  estimatedLocation: z.string().nullish(),
  hashedRefreshToken: z.string(),
  isMfaAuthenticated: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
