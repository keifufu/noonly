import { z } from 'zod'
import { UrlShortenerCategoryDTO } from './_shared'

export const UrlShortenerCreateCategoryInputDTO = z.object({
  name: z.string().min(1).max(64),
  emojiIcon: z.string().max(4096)
})

export const UrlShortenerCreateCategoryOutputDTO = UrlShortenerCategoryDTO