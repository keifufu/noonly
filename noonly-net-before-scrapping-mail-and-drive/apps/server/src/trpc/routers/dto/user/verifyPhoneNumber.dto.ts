import { z } from 'zod'
import { UserDTO } from '../shared'

export const UserVerifyPhoneNumberInputDTO = z.object({
  code: z.string().max(24)
})

export const UserVerifyPhoneNumberOutputDTO = UserDTO