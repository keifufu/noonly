import { z } from 'zod'

export const IconGetInputDTO = z.object({
  url: z.string()
})

export const IconGetOutputDTO = z.void()