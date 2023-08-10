import { z } from 'zod'
import { PasswordDTO } from './_shared'

export const PasswordRollbackInputDTO = z.object({
  passwordId: z.string().length(36),
  snapshotId: z.string().length(36)
})

export const PasswordRollbackOutputDTO = PasswordDTO