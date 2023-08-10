import { z } from 'zod'

export const AutofillDeleteAddressInputDTO = z.object({
  id: z.string().length(36)
})

export const AutofillDeleteAddressOutputDTO = z.void()