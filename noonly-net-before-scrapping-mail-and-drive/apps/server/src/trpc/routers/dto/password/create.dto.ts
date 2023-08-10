import { z } from 'zod'
import { PasswordDTO } from './_shared'

export const PasswordCreateInputDTO = z.object({
  data_e: z.string().max(4096),
  isAutofillEnabled: z.boolean().optional()
})

export const PasswordCreateOutputDTO = PasswordDTO