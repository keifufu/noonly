import { z } from 'zod'

export const UrlShortenerDeleteCategoryInputDTO = z.object({
  id: z.string().length(36)
})

export const UrlShortenerDeleteCategoryOutputDTO = z.void()