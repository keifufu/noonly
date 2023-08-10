import * as z from "zod"

export const AutofillAddressPrismaModel = z.object({
  id: z.string(),
  userId: z.string(),
  name_e: z.string().nullish(),
  street_e: z.string().nullish(),
  city_e: z.string().nullish(),
  state_e: z.string().nullish(),
  zipCode_e: z.string().nullish(),
  country_e: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
