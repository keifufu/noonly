import { PasswordIconDTO } from './_shared'
import { z } from 'zod'

export const PasswordGetAllIconsInputDTO = z.void()

export const PasswordGetAllIconsOutputDTO = z.array(PasswordIconDTO)