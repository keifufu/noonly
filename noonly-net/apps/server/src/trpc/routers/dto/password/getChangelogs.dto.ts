import { z } from 'zod'
import { PasswordChangelogPrismaModel } from '../../../../@generated/zod-prisma'

export const PasswordGetChangelogsInputDTO = z.object({
  passwordId: z.string().length(36)
})

export const PasswordGetChangelogsOutputDTO = z.array(PasswordChangelogPrismaModel.omit({
  id: true,
  passwordId: true
}))