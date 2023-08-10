import * as z from "zod"

export const UsedPhoneNumbersPrismaModel = z.object({
  id: z.string(),
  phoneNumber: z.string(),
  createdAt: z.date(),
})
