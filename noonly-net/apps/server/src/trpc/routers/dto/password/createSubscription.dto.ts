import { z } from 'zod'
import { PasswordDTO } from './_shared'

export const PasswordCreateSubscriptionInputDTO = z.object({
  passwordId: z.string().length(36),
  name: z.string().min(1).max(64),
  amount: z.number().positive(),
  currency: z.string().max(6),
  billingPeriod: z.enum(['MONTHLY', 'YEARLY']),
  paymentDate: z.string().optional()
})

export const PasswordCreateSubscriptionOutputDTO = PasswordDTO