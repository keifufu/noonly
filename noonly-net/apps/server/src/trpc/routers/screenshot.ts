import { RateLimitGuardProcedure } from '../middleware/RateLimitGuard'
import { router } from '../trpc'

export const screenshotRouter = router({
  // view: RateLimitGuardProcedure
  // .meta({ openapi: { method: 'GET', path: '/url-shortener/visit', tags: ['Url Shortener'] }, rateLimit: { max: 10, windowMs: 5000 } })
  // .input(UrlShortenerVisitInputDTO)
  // .output(UrlShortenerVisitOutputDTO)
  // .query(async ({ ctx, input }) => {
  // ctx.res.send('sex')
  // })
})