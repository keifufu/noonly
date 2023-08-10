import { middleware, publicProcedure } from '../trpc'

import { TRPCError } from '@trpc/server'
import jwt from 'jsonwebtoken'
import { prisma } from 'src/database/prisma'
import { Env } from 'src/utils/env'
import { getSessionFromRequest } from '../routers/auth'
import { TokenPayload } from './JwtAuthGuard'
import { RateLimitGuard } from './RateLimitGuard'

const JwtRefreshGuard = middleware(async ({ next, ctx }) => {
  const refreshToken = ctx.req.cookies?.Refresh || ''
  let payload
  try {
    payload = jwt.verify(refreshToken, Env.instance.get('JWT_REFRESH_TOKEN_SECRET')) as TokenPayload
  } catch (err) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' })
  }

  const session = await getSessionFromRequest(ctx.req, payload.userId)
  if (!session)
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'No session found' })

  const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { limits: true } })
  if (!user)
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'No user with given id found' })

  return next({
    ctx: {
      ...ctx,
      user,
      session
    }
  })
})

// Make sure the auth guards are called before the rate limit guard
export const JwtRefreshGuardProcedure = publicProcedure.use(JwtRefreshGuard).use(RateLimitGuard)