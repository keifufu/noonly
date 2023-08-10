import * as z from "zod"
import { SubscriptionBillingPeriod } from "@prisma/client"

export const SubscriptionPrismaModel = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number(),
  currency: z.string(),
  billingPeriod: z.nativeEnum(SubscriptionBillingPeriod),
  paymentDate: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
