import { z } from 'zod'
import { PasswordCategoryDTO } from './_shared'

export const PasswordUpdateCategoryOrderInputDTO = z.object({
  categories: z.array(z.object({
    id: z.string().length(36),
    order: z.number().min(0)
  }))
})

export const PasswordUpdateCategoryOrderOutputDTO = z.array(PasswordCategoryDTO)