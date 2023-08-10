import { z } from 'zod'
import { UrlShortenerCategoryDTO } from './_shared'

export const UrlShortenerUpdateCategoryOrderInputDTO = z.object({
  categories: z.array(z.object({
    id: z.string().length(36),
    order: z.number().min(0)
  }))
})

export const UrlShortenerUpdateCategoryOrderOutputDTO = z.array(UrlShortenerCategoryDTO)