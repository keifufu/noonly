import { z } from 'zod'

export const UserSetEnableSecurityLogsInputDTO = z.object({
  password: z.string().max(4096),
  enableSecurityLogs: z.boolean()
})

export const UserSetEnableSecurityLogsOutputDTO = z.void()