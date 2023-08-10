import { z } from 'zod'

export const PasswordGetSharedUpdateInformationInputDTO = z.object({
  passwordId: z.string().length(36)
})

export const PasswordGetSharedUpdateInformationOutputDTO = z.array(z.object({
  sharedPasswordId: z.string(),
  key_e: z.string()
}))