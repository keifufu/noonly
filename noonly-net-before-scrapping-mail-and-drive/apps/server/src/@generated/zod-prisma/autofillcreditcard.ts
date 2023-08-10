import * as z from "zod"

export const AutofillCreditCardPrismaModel = z.object({
  id: z.string(),
  userId: z.string(),
  name_e: z.string().nullish(),
  cardholderName_e: z.string(),
  cardNumber_e: z.string(),
  securityCode_e: z.string(),
  expirationMonth_e: z.string(),
  expirationYear_e: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
