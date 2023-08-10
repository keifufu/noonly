import * as z from "zod"

export const MailAddressPrismaModel = z.object({
  id: z.string(),
  userId: z.string(),
  email: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
