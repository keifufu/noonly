import { UrlShortenerPrismaModel } from 'src/@generated/zod-prisma'
import { z } from 'zod'

export const UrlShortenerGetAllInputDTO = z.void()

export const UrlShortenerGetAllOutputDTO = z.array(UrlShortenerPrismaModel)