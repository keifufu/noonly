import { z } from 'zod'

export const PasswordDeleteInputDTO = z.object({
  id: z.string().length(36)
})

export const PasswordDeleteOutputDTO = z.void()