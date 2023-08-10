import { z } from 'zod'

export const UserSetEnableAdvancedLogsInputDTO = z.object({
  password: z.string().max(4096),
  enableAdvancedLogs: z.boolean()
})

export const UserSetEnableAdvancedLogsOutputDTO = z.void()