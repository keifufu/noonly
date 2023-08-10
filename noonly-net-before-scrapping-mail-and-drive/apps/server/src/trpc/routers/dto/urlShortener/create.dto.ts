import { UrlShortenerPrismaModel } from 'src/@generated/zod-prisma/urlshortener'
import { z } from 'zod'

export const UrlShortenerCreateInputDTO = z.object({
  // key is only set for custom URLs
  key: z.string().min(3).max(32).optional(),
  destinationUrl: z.string().max(4096).url(),
  // expiration date is null if the URL never expires
  expirationDate: z.string().nullable(),
  maxClicks: z.number().optional(),
  isTrackingEnabled: z.boolean().optional(),
  showIntermissionPage: z.boolean().optional()
})

export const UrlShortenerCreateOutputDTO = UrlShortenerPrismaModel