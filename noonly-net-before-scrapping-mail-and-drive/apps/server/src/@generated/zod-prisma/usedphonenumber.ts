import * as z from "zod"

export const UsedPhoneNumberPrismaModel = z.object({
  id: z.string(),
  phoneNumber: z.string(),
  createdAt: z.date(),
})
