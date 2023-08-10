import { z } from 'zod'

export const AutofillDeletePersonalInfoInputDTO = z.object({
  id: z.string().length(36)
})

export const AutofillDeletePersonalInfoOutputDTO = z.void()