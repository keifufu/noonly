import { z } from 'zod'
import { PasswordDTO } from './_shared'

export const PasswordDeleteSubscriptionInputDTO = z.object({
  id: z.string().length(36)
})

export const PasswordDeleteSubscriptionOutputDTO = PasswordDTO