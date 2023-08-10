import { z } from 'zod'
import { PasswordDTO } from './_shared'

export const PasswordUpdateSubscriptionInputDTO = z.object({
  subscriptionId: z.string().length(36),
  name: z.string().min(1).max(64).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().max(6).optional(),
  billingPeriod: z.enum(['MONTHLY', 'YEARLY']).optional(),
  paymentDate: z.date().optional()
})

export const PasswordUpdateSubscriptionOutputDTO = PasswordDTO