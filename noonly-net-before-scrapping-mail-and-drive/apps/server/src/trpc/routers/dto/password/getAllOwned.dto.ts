import { PasswordDTO } from './_shared'
import { z } from 'zod'

export const PasswordGetAllOwnedInputDTO = z.void()

export const PasswordGetAllOwnedOutputDTO = z.array(PasswordDTO)