import * as z from "zod"

export const UrlShortenerPrismaModel = z.object({
  id: z.string(),
  userId: z.string(),
  key: z.string(),
  isCustomKey: z.boolean(),
  expirationDate: z.date().nullish(),
  isTrackingEnabled: z.boolean(),
  clickCount: z.number().int(),
  maxClicks: z.number().int().nullish(),
  showIntermissionPage: z.boolean(),
  destinationUrl: z.string(),
  categoryId: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
