import { z } from 'zod'
import { PasswordCategoryDTO } from './_shared'

export const PasswordCreateCategoryInputDTO = z.object({
  name_e: z.string().max(4096)
})

export const PasswordCreateCategoryOutputDTO = PasswordCategoryDTO