import * as z from "zod"

export const PasswordCategoryPrismaModel = z.object({
  id: z.string(),
  userId: z.string(),
  name_e: z.string(),
  order: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
