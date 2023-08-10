import { UrlShortenerPrismaModel } from 'src/@generated/zod-prisma/urlshortener'
import { z } from 'zod'

export const UrlShortenerUpdateInputDTO = z.object({
  id: z.string().length(36),
  categoryId: z.string().length(36).nullable().optional(),
  // expiration date is null if the URL never expires
  expirationDate: z.date().nullable().optional(),
  maxClicks: z.number().optional(),
  isTrackingEnabled: z.boolean().optional(),
  showIntermissionPage: z.boolean().optional()
})

export const UrlShortenerUpdateOutputDTO = UrlShortenerPrismaModel