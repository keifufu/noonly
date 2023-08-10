import { z } from 'zod'
import { UrlShortenerClickPrismaModel } from '../../../../@generated/zod-prisma'

export const UrlShortenerGetClicksInputDTO = z.object({
  urlShortenerId: z.string().length(36)
})

export const UrlShortenerGetClicksOutputDTO = z.array(UrlShortenerClickPrismaModel.pick({
  location: true,
  userAgent: true,
  createdAt: true
}))