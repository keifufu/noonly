import { z } from 'zod'
import { UrlShortenerCategoryDTO } from './_shared'

export const UrlShortenerUpdateCategoryInputDTO = z.object({
  id: z.string().length(36),
  name: z.string().min(1).max(65).optional(),
  emojiIcon: z.string().max(4096).optional()
})

export const UrlShortenerUpdateCategoryOutputDTO = UrlShortenerCategoryDTO