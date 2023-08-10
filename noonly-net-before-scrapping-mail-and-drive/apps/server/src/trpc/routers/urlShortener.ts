import { getIpFromRequest, getLocationFromRequest, getRawUserAgentFromRequest, getUniqueIdentifierFromRequest } from 'src/utils/trackingUtils'
import { UrlShortenerCreateInputDTO, UrlShortenerCreateOutputDTO } from './dto/urlShortener/create.dto'
import { UrlShortenerCreateCategoryInputDTO, UrlShortenerCreateCategoryOutputDTO } from './dto/urlShortener/createCategory.dto'
import { UrlShortenerDeleteInputDTO, UrlShortenerDeleteOutputDTO } from './dto/urlShortener/delete.dto'
import { UrlShortenerDeleteCategoryInputDTO, UrlShortenerDeleteCategoryOutputDTO } from './dto/urlShortener/deleteCategory.dto'
import { UrlShortenerGetAllInputDTO, UrlShortenerGetAllOutputDTO } from './dto/urlShortener/getAll.dto'
import { UrlShortenerGetAllCategoriesInputDTO, UrlShortenerGetAllCategoriesOutputDTO } from './dto/urlShortener/getAllCategories.dto'
import { UrlShortenerGetClicksInputDTO, UrlShortenerGetClicksOutputDTO } from './dto/urlShortener/getClicks.dto'
import { UrlShortenerUpdateInputDTO, UrlShortenerUpdateOutputDTO } from './dto/urlShortener/update.dto'
import { UrlShortenerUpdateCategoryInputDTO, UrlShortenerUpdateCategoryOutputDTO } from './dto/urlShortener/updateCategory.dto'
import { UrlShortenerUpdateCategoryOrderInputDTO, UrlShortenerUpdateCategoryOrderOutputDTO } from './dto/urlShortener/updateCategoryOrder.dto'
import { UrlShortenerVisitInputDTO, UrlShortenerVisitOutputDTO } from './dto/urlShortener/visitUrlShortener.dto'

import { TRPCError } from '@trpc/server'
import { nanoid } from 'nanoid'
import { prisma } from 'src/database/prisma'
import { redis } from 'src/database/redis'
import { getUserLimits } from 'src/utils/TierLimits'
import { JwtTwoFactorGuardProcedure } from '../middleware/JwtTwoFactorGuard'
import { RateLimitGuardProcedure } from '../middleware/RateLimitGuard'
import { router } from '../trpc'

const blacklistedUserAgents = [
  'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)'
]

// Store to prevent one user from spamming the clicks
// Allows for 1 click per 60 seconds
class UrlShortenerClickStore {
  _getKey(key: string) {
    return `url-shortener-clicks:${key}`
  }

  async setClicked(key: string) {
    await redis.set(this._getKey(key), 'true', 'EX', 60)
  }

  async isAllowed(key: string) {
    return await redis.exists(this._getKey(key))
  }
}

const urlShortenerClickStore = new UrlShortenerClickStore()

export const urlShortenerRouter = router({
  visit: RateLimitGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/url-shortener/visit', tags: ['Url Shortener'] }, rateLimit: { max: 10, windowMs: 5000 } })
    .input(UrlShortenerVisitInputDTO)
    .output(UrlShortenerVisitOutputDTO)
    .query(async ({ ctx, input }) => {
      const urlShortener = await prisma.urlShortener.findUnique({ where: { key: input.key } })
      if (!urlShortener) throw new TRPCError({ code: 'NOT_FOUND', message: 'The URL was not found' })
      // Throw error if URL has reached max clicks
      if (urlShortener.maxClicks && urlShortener.clickCount >= urlShortener.maxClicks)
        throw new TRPCError({ code: 'FORBIDDEN', message: 'This URL has reached its maximum amount of clicks; Check back later!' })
      // The URL has no expiration date set if it's unlimited length
      if (urlShortener.expirationDate && urlShortener.expirationDate < new Date()) throw new TRPCError({ code: 'FORBIDDEN', message: 'This URL has expired' })
      // Increase clicks if the user has not counted towards a click in the last 60 seconds
      if (await urlShortenerClickStore.isAllowed(getUniqueIdentifierFromRequest(ctx.req)) && !blacklistedUserAgents.includes(getRawUserAgentFromRequest(ctx.req))) {
        // Mark the user has having clicked (prevents `isAllowed` being true for the next 5 seconds)
        await urlShortenerClickStore.setClicked(getUniqueIdentifierFromRequest(ctx.req))
        // Update clickCount and create advanced clicking metrics if tracking is enabled
        if (urlShortener.isTrackingEnabled) {
          await prisma.urlShortener.update({ where: { key: input.key },
            data: {
              clickCount: { increment: 1 },
              clicks: {
                create: {
                  ipAddress: getIpFromRequest(ctx.req),
                  location: getLocationFromRequest(ctx.req),
                  userAgent: getRawUserAgentFromRequest(ctx.req)
                }
              }
            } }).catch(() => null)
        } else {
          // Else, just update the clickCount
          await prisma.urlShortener.update({ where: { key: input.key }, data: { clickCount: { increment: 1 } } }).catch(() => null)
        }
      }

      if (urlShortener.showIntermissionPage) {
        ctx.res.setHeader('Content-Type', 'text/html')
        ctx.res.send(makeIntermissionPage(urlShortener.destinationUrl))
        throw new TRPCError({ code: 'TIMEOUT', message: 'Intermission page' })
      } else {
        ctx.res.redirect(urlShortener.destinationUrl)
      }
    }),
  getClicks: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/url-shortener/get-clicks', tags: ['Url Shortener'], protect: true } })
    .input(UrlShortenerGetClicksInputDTO)
    .output(UrlShortenerGetClicksOutputDTO)
    .query(async ({ ctx, input }) => {
      const count = await prisma.urlShortener.count({ where: { id: input.urlShortenerId, userId: ctx.user.id } })
      if (count === 0)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Url Shortener not found' })

      const clicks = await prisma.urlShortenerClick.findMany({ select: {
        location: true,
        userAgent: true,
        createdAt: true
      }, where: { urlShortenerId: input.urlShortenerId } })

      return clicks
    }),
  getAll: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/url-shortener/get-all', tags: ['Url Shortener'], protect: true } })
    .input(UrlShortenerGetAllInputDTO)
    .output(UrlShortenerGetAllOutputDTO)
    .query(async ({ ctx }) => {
      const urlShorteners = await prisma.urlShortener.findMany({ where: { userId: ctx.user.id } })
      return urlShorteners
    }),
  getAllCategories: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/url-shortener/get-all-categories', tags: ['Url Shortener'], protect: true } })
    .input(UrlShortenerGetAllCategoriesInputDTO)
    .output(UrlShortenerGetAllCategoriesOutputDTO)
    .query(async ({ ctx }) => {
      const urlShortenerCategories = await prisma.urlShortenerCategory.findMany({ where: { userId: ctx.user.id } })
      return urlShortenerCategories
    }),
  create: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/url-shortener/create', tags: ['Url Shortener'], protect: true } })
    .input(UrlShortenerCreateInputDTO)
    .output(UrlShortenerCreateOutputDTO)
    .query(async ({ ctx, input }) => {
      const limits = getUserLimits(ctx.user)
      const isCustomKey = !!input.key
      const isUnlimitedLengthUrl = !input.expirationDate
      const isTrackingEnabled = limits.urlShortener.clickTracking ? (input.isTrackingEnabled ?? true) : false

      // Check if the expirationDate exceeds the maxExpirationDays
      if (input.expirationDate && new Date(input.expirationDate) > new Date(Date.now() + (limits.urlShortener.maxExpirationDays * 24 * 60 * 60 * 1000)))
        throw new TRPCError({ code: 'FORBIDDEN', message: 'The expiration date exceeds the maximum allowed' })

      // Check if the user has reached their limit for custom URLs
      if (isCustomKey) {
        // Get all urls with a custom key and an expirationDate in the past
        const customUrls = await prisma.urlShortener.count({ where: { userId: ctx.user.id, isCustomKey: true, expirationDate: { lte: new Date() } } })
        if (customUrls >= limits.urlShortener.maxActiveCustomUrls)
          throw new TRPCError({ code: 'FORBIDDEN', message: `You have reached your limit for custom URLs (${limits.urlShortener.maxActiveCustomUrls})` })
      }

      // Check if the user has reached their limit for unlimited length URLs
      if (isUnlimitedLengthUrl) {
        // Get all urls with a unset expirationDate
        const unlimitedLengthUrls = await prisma.urlShortener.count({ where: { userId: ctx.user.id, expirationDate: null } })
        if (unlimitedLengthUrls >= limits.urlShortener.maxUnlimitedLengthUrls)
          throw new TRPCError({ code: 'FORBIDDEN', message: `You have reached your limit for unlimited length URLs (${limits.urlShortener.maxUnlimitedLengthUrls})` })
      }

      // Check if the user has reached their limit for total URLs
      const totalUrls = await prisma.urlShortener.count({ where: { userId: ctx.user.id } })
      if (totalUrls >= limits.urlShortener.maxTotalUrls)
        throw new TRPCError({ code: 'FORBIDDEN', message: `You have reached the maximum amount of shorteners (${limits.urlShortener.maxTotalUrls})` })

      const urlShortener = await prisma.urlShortener.create({
        data: {
          userId: ctx.user.id,
          destinationUrl: input.destinationUrl,
          key: input.key ?? nanoid(5),
          isCustomKey,
          expirationDate: input.expirationDate && new Date(input.expirationDate),
          maxClicks: input.maxClicks,
          showIntermissionPage: input.showIntermissionPage,
          isTrackingEnabled
        }
      }).catch((err) => {
        console.log(err)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create Url Shortener' })
      })

      return urlShortener
    }),
  update: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/url-shortener/update', tags: ['Url Shortener'], protect: true } })
    .input(UrlShortenerUpdateInputDTO)
    .output(UrlShortenerUpdateOutputDTO)
    .query(async ({ ctx, input }) => {
      const urlShortener = await prisma.urlShortener.findUnique({ where: { id: input.id, userId: ctx.user.id } })
      if (!urlShortener) throw new TRPCError({ code: 'NOT_FOUND', message: 'The URL Shortener was not found' })

      const limits = getUserLimits(ctx.user)
      const isTrackingEnabled = limits.urlShortener.clickTracking ? input.isTrackingEnabled : false
      const isUnlimitedLengthUrl = !input.expirationDate

      // Check if the expirationDate exceeds the maxExpirationDays
      if (input.expirationDate && input.expirationDate > new Date(Date.now() + (limits.urlShortener.maxExpirationDays * 24 * 60 * 60 * 1000)))
        throw new TRPCError({ code: 'FORBIDDEN', message: 'The expiration date exceeds the maximum allowed' })

      // Check if the user has reached their limit for unlimited length URLs
      if (isUnlimitedLengthUrl) {
        // Get all urls with a unset expirationDate
        const unlimitedLengthUrls = await prisma.urlShortener.count({ where: { userId: ctx.user.id, expirationDate: null } })
        if (unlimitedLengthUrls >= limits.urlShortener.maxUnlimitedLengthUrls)
          throw new TRPCError({ code: 'FORBIDDEN', message: `You have reached your limit for unlimited length URLs (${limits.urlShortener.maxUnlimitedLengthUrls})` })
      }

      const category = input.categoryId === null ? { disconnect: true } : input.categoryId ? { connect: { id: input.categoryId } } : {}
      const updatedUrlShortener = await prisma.urlShortener.update({
        where: { id: input.id, userId: ctx.user.id },
        data: {
          expirationDate: input.expirationDate && new Date(input.expirationDate),
          maxClicks: input.maxClicks,
          showIntermissionPage: input.showIntermissionPage,
          isTrackingEnabled,
          category: category
        }
      }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update Url Shortener' })
      })

      return updatedUrlShortener
    }),
  delete: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/url-shortener/delete', tags: ['Url Shortener'], protect: true } })
    .input(UrlShortenerDeleteInputDTO)
    .output(UrlShortenerDeleteOutputDTO)
    .query(async ({ ctx, input }) => {
      await prisma.urlShortener.delete({ where: { id: input.id, userId: ctx.user.id } }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete Url Shortener' })
      })
    }),
  createCategory: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/url-shortener/create-category', tags: ['Url Shortener'], protect: true } })
    .input(UrlShortenerCreateCategoryInputDTO)
    .output(UrlShortenerCreateCategoryOutputDTO)
    .query(async ({ ctx, input }) => {
      const highestOrder = await prisma.urlShortenerCategory.findFirst({ where: { userId: ctx.user.id }, orderBy: { order: 'desc' }, select: { order: true } })
      const category = await prisma.urlShortenerCategory.create({
        data: {
          userId: ctx.user.id,
          name: input.name,
          emojiIcon: input.emojiIcon,
          order: (highestOrder?.order || 0) + 1
        }
      }).catch((err) => {
        if (err.code === 'P2002')
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Category with that name already exists' })
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update Category' })
      })

      return category
    }),
  updateCategory: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/url-shortener/update-category', tags: ['Url Shortener'], protect: true } })
    .input(UrlShortenerUpdateCategoryInputDTO)
    .output(UrlShortenerUpdateCategoryOutputDTO)
    .query(async ({ ctx, input }) => {
      const category = await prisma.urlShortenerCategory.update({
        where: { id: input.id, userId: ctx.user.id },
        data: {
          name: input.name,
          emojiIcon: input.emojiIcon
        }
      }).catch((err) => {
        if (err.code === 'P2002')
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Category with that name already exists' })
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update Category' })
      })

      return category
    }),
  updateCategoryOrder: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/url-shortener/update-category-order', tags: ['Url Shortener'], protect: true } })
    .input(UrlShortenerUpdateCategoryOrderInputDTO)
    .output(UrlShortenerUpdateCategoryOrderOutputDTO)
    .query(async ({ input, ctx }) => {
      await prisma.$transaction(input.categories.map((e) => prisma.urlShortenerCategory.update({
        where: { id: e.id, userId: ctx.user.id },
        data: { order: e.order }
      }))).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update Categories' })
      })
      const categories = await prisma.urlShortenerCategory.findMany({ where: { userId: ctx.user.id } })
      return categories
    }),
  deleteCategory: JwtTwoFactorGuardProcedure
    .meta({ openapi: { method: 'POST', path: '/url-shortener/delete-category', tags: ['Url Shortener'], protect: true } })
    .input(UrlShortenerDeleteCategoryInputDTO)
    .output(UrlShortenerDeleteCategoryOutputDTO)
    .query(async ({ ctx, input }) => {
      await prisma.urlShortenerCategory.delete({ where: { id: input.id, userId: ctx.user.id } }).catch(() => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete Url Shortener Category' })
      })
    })
})

function makeIntermissionPage(destinationUrl: string) {
  let url = destinationUrl
  if (!destinationUrl.startsWith('http')) url = `https://${destinationUrl}`
  url = encodeURI(destinationUrl)

  return `
  <html>
  <head>
    <title>Redirecting...</title>
    <script>
      let countdown = 5
      setInterval(() => {
        if (countdown === 1) return redirect()
        countdown--
        document.getElementById('countdown').innerHTML = countdown
      }, 1000)
      function redirect() {
        window.location.href = '${url}'
      }
    </script>
  </head>
  <body>
    <p>Redirecting to <a href="${url}">${url}</a>...</p>
    <div>in </div>
    <div id="countdown">5</div>
    <div> seconds</div>
    <button onclick="redirect()">Skip</button>
  </body>
</html>
  `
}