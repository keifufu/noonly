import { UrlShortenerCategoryPrismaModel } from 'src/@generated/zod-prisma'

export const UrlShortenerCategoryDTO = UrlShortenerCategoryPrismaModel.omit({
  userId: true
})