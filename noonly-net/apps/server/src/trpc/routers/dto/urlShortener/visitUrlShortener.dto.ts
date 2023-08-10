import { z } from 'zod'

export const UrlShortenerVisitInputDTO = z.object({
  key: z.string()
})

export const UrlShortenerVisitOutputDTO = z.void()