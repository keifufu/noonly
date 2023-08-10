import { z } from 'zod'
import { UrlShortenerCategoryDTO } from './_shared'

export const UrlShortenerGetAllCategoriesInputDTO = z.void()

export const UrlShortenerGetAllCategoriesOutputDTO = z.array(UrlShortenerCategoryDTO)