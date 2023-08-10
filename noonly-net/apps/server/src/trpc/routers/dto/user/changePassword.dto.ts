import { z } from 'zod'

export const UserChangePasswordInputDTO = z.object({
  recoveryCode: z.string().max(4096).optional(),
  currentPassword: z.string().max(4096).optional(),
  newPassword: z.string().max(4096),
  newRecoveryCode: z.string().max(4096)
})

export const UserChangePasswordOutputDTO = z.void()