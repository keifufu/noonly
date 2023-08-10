import { PasswordDTO, UpdatePasswordDataDTO } from './_shared'

import { z } from 'zod'

export const PasswordUpdateInputDTO = UpdatePasswordDataDTO.extend({
  id: z.string().length(36),
  isAutofillEnabled: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
  categoryId: z.string().length(36).nullable().optional(),
  iconId: z.string().length(36).nullable().optional(),
  sharedPasswordData: z.array(UpdatePasswordDataDTO.extend({
    sharedPasswordId: z.string().length(36)
  })).optional()
})

export const PasswordUpdateOutputDTO = PasswordDTO