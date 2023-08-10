import { z } from 'zod'
import { SharedPasswordDTO } from './_shared'

export const PasswordUpdateSharedInputDTO = z.object({
  id: z.string().length(36),
  name_e: z.string().max(4096).optional(),
  note_e: z.string().max(4096).optional(),
  isAutofillEnabled: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  categoryId: z.string().length(36).nullable().optional(),
  iconId: z.string().length(36).nullable().optional()
})

export const PasswordUpdateSharedOutputDTO = SharedPasswordDTO