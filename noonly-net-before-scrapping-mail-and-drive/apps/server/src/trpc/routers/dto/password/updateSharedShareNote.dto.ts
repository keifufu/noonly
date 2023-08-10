import { z } from 'zod'

export const PasswordUpdateSharedShareNoteInputDTO = z.object({
  sharedPasswordId: z.string().length(36),
  shareNote: z.boolean(),
  note_e: z.string().max(4096).nullable().optional()
})

export const PasswordUpdateSharedShareNoteOutputDTO = z.void()