import { z } from 'zod'
import { UserDTO } from '../shared'

export const UserVerifyEmailInputDTO = z.object({
  code: z.string()
})

export const UserVerifyEmailOutputDTO = z.object({
  user: UserDTO
})