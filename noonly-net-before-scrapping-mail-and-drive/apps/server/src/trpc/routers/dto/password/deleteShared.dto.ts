import { z } from 'zod'

export const PasswordDeleteSharedInputDTO = z.object({
  sharedPasswordId: z.string().length(36)
})

export const PasswordDeleteSharedOutputDTO = z.void()