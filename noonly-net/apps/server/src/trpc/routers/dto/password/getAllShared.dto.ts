import { SharedPasswordDTO } from './_shared'
import { z } from 'zod'

export const PasswordGetAllSharedInputDTO = z.void()

export const PasswordGetAllSharedOutputDTO = z.array(SharedPasswordDTO)