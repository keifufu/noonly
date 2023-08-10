import { z } from 'zod'

const PasswordSharedUserStateDTO = z.object({
  sharedPasswordId: z.string().length(36),
  userId: z.string().length(36),
  username: z.string(),
  isPending: z.boolean(),
  shareNote: z.boolean(),
  createdAt: z.date()
})

export type PasswordSharedUserState = z.infer<typeof PasswordSharedUserStateDTO>

export const PasswordGetSharedUsersInputDTO = z.object({
  id: z.string().length(36)
})

export const PasswordGetSharedUsersOutputDTO = z.array(PasswordSharedUserStateDTO)