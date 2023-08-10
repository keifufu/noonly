import { z } from 'zod'
import { SharedPasswordDTO } from './_shared'

export const PasswordGetInvitesInputDTO = z.void()

export const PasswordGetInvitesOutputDTO = z.array(SharedPasswordDTO.pick({
  id: true,
  ownerUsername: true,
  inviteMessage_e: true,
  site_e: true
}).extend({
  inviteKey: z.string().nullable()
}))