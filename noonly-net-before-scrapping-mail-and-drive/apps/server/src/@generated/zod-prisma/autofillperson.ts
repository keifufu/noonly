import * as z from "zod"
import { AutofillPersonGender } from "@prisma/client"

export const AutofillPersonPrismaModel = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().nullish(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  email: z.string().nullish(),
  phone: z.string().nullish(),
  gender: z.nativeEnum(AutofillPersonGender).nullish(),
  birthDay: z.number().int().nullish(),
  birthMonth: z.number().int().nullish(),
  birthYear: z.number().int().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
