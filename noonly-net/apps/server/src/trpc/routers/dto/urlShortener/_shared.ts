import { UrlShortenerCategoryPrismaModel } from '../../../../@generated/zod-prisma'

export const UrlShortenerCategoryDTO = UrlShortenerCategoryPrismaModel.omit({
  userId: true
})