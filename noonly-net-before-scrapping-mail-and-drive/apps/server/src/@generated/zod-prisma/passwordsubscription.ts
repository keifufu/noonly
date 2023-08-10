import * as z from "zod"
import { PasswordSubscriptionBillingPeriod } from "@prisma/client"

export const PasswordSubscriptionPrismaModel = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number(),
  currency: z.string(),
  billingPeriod: z.nativeEnum(PasswordSubscriptionBillingPeriod),
  paymentDate: z.date().nullish(),
  passwordId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
