import { z } from 'zod'

export const PasswordShareWithUserInputDTO = z.object({
  passwordId: z.string().length(36),
  userId: z.string().length(36),
  // Password Data, re-encrypted
  data_e: z.string().max(4096),
  note_e: z.string().max(4096).nullable().optional(), // Should be nulled by client if shareNote is false
  // Sharing specific stuff, since the client decides the inviteKey, at least have a length restriction
  inviteKey: z.string().length(24),
  ownerKey_e: z.string().max(4096),
  shareNote: z.boolean(),
  inviteMessage_e: z.string().max(4096).optional()
})

export const PasswordShareWithUserOutputDTO = z.void()