import { z } from 'zod'

export const UserFindByUsernameInputDTO = z.object({
  username: z.string().min(3).max(24)
})

export const UserFindByUsernameOutputDTO = z.object({
  id: z.string(),
  username: z.string()
}).nullable()