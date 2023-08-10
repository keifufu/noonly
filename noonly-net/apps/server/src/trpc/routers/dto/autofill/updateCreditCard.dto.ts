import { z } from 'zod'
import { AutofillCreditCardDTO } from './_shared'

export const AutofillUpdateCreditCardInputDTO = z.object({
  id: z.string().length(36),
  name_e: z.string().max(4096).nullable().optional(),
  cardholderName_e: z.string().max(4096).optional(),
  cardNumber_e: z.string().max(4096).optional(),
  securityCode_e: z.string().max(4096).optional(),
  expirationMonth_e: z.string().max(4096).optional(),
  expirationYear_e: z.string().max(4096).optional()
})

export const AutofillUpdateCreditCardOutputDTO = AutofillCreditCardDTO