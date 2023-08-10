import { z } from 'zod'
import { RateLimitGuardProcedure } from '../middleware/RateLimitGuard'
import { router } from '../trpc'
import { authRouter } from './auth'
import { autofillRouter } from './autofill'
import { iconRouter } from './icon'
import { passwordRouter } from './password'
import { screenshotRouter } from './screenshot'
import { urlShortenerRouter } from './urlShortener'
import { userRouter } from './user'

export const appRouter = router({
  alive: RateLimitGuardProcedure
    .meta({ openapi: { method: 'GET', path: '/alive', tags: ['General'] }, rateLimit: { max: 10, windowMs: 5000 } })
    .input(z.void({}))
    .output(z.string())
    .query(() => 'yay!'),
  auth: authRouter,
  autofill: autofillRouter,
  icon: iconRouter,
  password: passwordRouter,
  screenshot: screenshotRouter,
  urlShortener: urlShortenerRouter,
  user: userRouter
})

export type AppRouter = typeof appRouter;