import { z } from 'zod'
import { SharedPasswordDTO } from './_shared'

export const PasswordAcceptInviteInputDTO = z.object({
  sharedPasswordId: z.string().length(36),
  sharedUserKey_e: z.string().max(4096)
})

export const PasswordAcceptInviteOutputDTO = SharedPasswordDTO