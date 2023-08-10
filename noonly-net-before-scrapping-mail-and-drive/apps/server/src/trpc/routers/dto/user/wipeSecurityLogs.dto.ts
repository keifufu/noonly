import { z } from 'zod'

export const UserWipeSecurityLogsInputDTO = z.object({
  password: z.string().max(4096)
})

export const UserWipeSecurityLogsOutputDTO = z.void()