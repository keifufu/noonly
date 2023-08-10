import { PasswordChangelogPrismaModel } from 'src/@generated/zod-prisma'
import { z } from 'zod'

export const PasswordGetChangelogsInputDTO = z.object({
  passwordId: z.string().length(36)
})

export const PasswordGetChangelogsOutputDTO = z.array(PasswordChangelogPrismaModel.omit({
  id: true,
  passwordId: true
}))