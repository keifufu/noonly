import { z } from 'zod'

export const UserChangeEmailInputDTO = z.object({
  email: z.string().email(),
  code: z.string(),
  password: z.string().max(4096)
})

export const UserChangeEmailOutputDTO = z.void()