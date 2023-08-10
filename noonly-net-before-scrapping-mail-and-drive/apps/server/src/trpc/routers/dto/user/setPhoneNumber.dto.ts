import { z } from 'zod'
import { UserDTO } from '../shared'

export const UserSetPhoneNumberInputDTO = z.object({
  phoneNumber: z.string().max(24) // No validation here since we format it later
})

export const UserSetPhoneNumberOutputDTO = UserDTO