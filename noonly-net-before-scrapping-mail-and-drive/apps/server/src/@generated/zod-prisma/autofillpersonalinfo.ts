import * as z from "zod"
import { AutofillPersonalInfoGender } from "@prisma/client"

export const AutofillPersonalInfoPrismaModel = z.object({
  id: z.string(),
  userId: z.string(),
  name_e: z.string().nullish(),
  firstName_e: z.string().nullish(),
  lastName_e: z.string().nullish(),
  email_e: z.string().nullish(),
  phone_e: z.string().nullish(),
  gender: z.nativeEnum(AutofillPersonalInfoGender).nullish(),
  birthDay_e: z.string().nullish(),
  birthMonth_e: z.string().nullish(),
  birthYear_e: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
