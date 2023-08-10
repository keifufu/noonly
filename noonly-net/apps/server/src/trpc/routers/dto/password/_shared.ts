
import { z } from 'zod'
import { PasswordCategoryPrismaModel, PasswordIconPrismaModel, PasswordPrismaModel, SharedPasswordPrismaModel } from '../../../../@generated/zod-prisma'

export const PasswordDTO = PasswordPrismaModel.omit({
  userId: true,
  snapshotOfPasswordId: true
})

export const SharedPasswordDTO = SharedPasswordPrismaModel.omit({
  inviteKey: true,
  ownerKey: true
})

export const UpdatePasswordDataDTO = z.object({
  data_e: z.string().max(4096),
  note_e: z.string().max(4096).nullable().optional()
})

export const PasswordCategoryDTO = PasswordCategoryPrismaModel.omit({
  userId: true
})

export const PasswordIconDTO = PasswordIconPrismaModel.omit({
  data: true,
  userId: true
})