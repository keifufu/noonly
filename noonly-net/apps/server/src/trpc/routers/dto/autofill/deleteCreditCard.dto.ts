import { z } from 'zod'

export const AutofillDeleteCreditCardInputDTO = z.object({
  id: z.string().length(36)
})

export const AutofillDeleteCreditCardOutputDTO = z.void()