import { UrlShortenerClickPrismaModel } from 'src/@generated/zod-prisma'
import { z } from 'zod'

export const UrlShortenerGetClicksInputDTO = z.object({
  urlShortenerId: z.string().length(36)
})

export const UrlShortenerGetClicksOutputDTO = z.array(UrlShortenerClickPrismaModel.pick({
  location: true,
  userAgent: true,
  createdAt: true
}))