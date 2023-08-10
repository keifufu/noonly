import { z } from 'zod'

export const PasswordGetIconInputDTO = z.object({
  id: z.string().length(36)
})

export const PasswordGetIconOutputDTO = z.void()