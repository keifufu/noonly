import { z } from 'zod'

export const PasswordDeleteCategoryInputDTO = z.object({
  id: z.string().length(36)
})

export const PasswordDeleteCategoryOutputDTO = z.void()