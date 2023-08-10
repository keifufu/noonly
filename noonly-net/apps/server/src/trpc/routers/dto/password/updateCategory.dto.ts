import { z } from 'zod'
import { PasswordCategoryDTO } from './_shared'

export const PasswordUpdateCategoryInputDTO = z.object({
  id: z.string().length(36),
  name_e: z.string().max(4096)
})

export const PasswordUpdateCategoryOutputDTO = PasswordCategoryDTO