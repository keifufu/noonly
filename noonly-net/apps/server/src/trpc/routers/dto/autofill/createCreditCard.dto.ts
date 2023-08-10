import { z } from 'zod'
import { AutofillCreditCardDTO } from './_shared'

export const AutofillCreateCreditCardInputDTO = z.object({
  name_e: z.string().max(4096).optional(),
  cardholderName_e: z.string().max(4096),
  cardNumber_e: z.string().max(4096),
  securityCode_e: z.string().max(4096),
  expirationMonth_e: z.string().max(4096),
  expirationYear_e: z.string().max(4096)
})

export const AutofillCreateCreditCardOutputDTO = AutofillCreditCardDTO