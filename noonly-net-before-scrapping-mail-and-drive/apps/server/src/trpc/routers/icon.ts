import { IconGetInputDTO, IconGetOutputDTO } from './dto/icon/get'

import { RateLimitGuardProcedure } from '../middleware/RateLimitGuard'
import { router } from '../trpc'

export const iconRouter = router({
  get: RateLimitGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/icon/get', tags: ['Icon'] } })
    .input(IconGetInputDTO)
    .output(IconGetOutputDTO)
    .query(({ ctx, input }) => {
    // sanitize the url to remove anything after the domain and remove the protocol
      const [url] = input.url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')

      // TODO: allow for predefined icons for popular sites
      // the seemingly best way to achieve this, will be having a .json file somewhere on noonly.net
      // like https://noonly.net/public/icons.json
      // which will map the domain to a icon hosted on noonly
      // example: "github.com": "https://noonly.net/public/icons/github.png"

      const googleFaviconUrl = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${url}&size=256`
      ctx.res.redirect(googleFaviconUrl)
    })
})