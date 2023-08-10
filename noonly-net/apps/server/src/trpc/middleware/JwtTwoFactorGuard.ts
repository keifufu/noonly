import { middleware, publicProcedure } from '../trpc'

import { TRPCError } from '@trpc/server'
import jwt from 'jsonwebtoken'
import { prisma } from '../../database/prisma'
import { Env } from '../../utils/env'
import { blockerStore } from '../../utils/reEncryptUserData'
import { getSessionFromRequest } from '../routers/auth'
import { addTierLimitsToUser, getAccessTokenFromRequest, type TokenPayload } from './JwtAuthGuard'
import { RateLimitGuard } from './RateLimitGuard'

const JwtTwoFactorGuard = middleware(async ({ next, ctx }) => {
  const accessToken = getAccessTokenFromRequest(ctx.req)
  let payload
  try {
    payload = jwt.verify(accessToken, Env.instance.get('JWT_ACCESS_TOKEN_SECRET')) as TokenPayload
  } catch (err) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid or expired authentication token' })
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { tierUsage: true } })
  if (!user)
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'No user with given id found' })

  if (!user.isEmailConfirmed && !ctx.req.path.toLowerCase().includes('email'))
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Email is not confirmed' })

  const session = await getSessionFromRequest(ctx.req, user.id)
  if (!session)
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'No session found' })

  // Block access to all routes if blockerStore says so (used to re-encryption of data for example)
  const { blocked, reason } = await blockerStore.isBlocked(user.id)
  if (blocked)
    throw new TRPCError({ code: 'UNAUTHORIZED', message: reason })

  if (session.isMfaAuthenticated) {
    return next({
      ctx: {
        ...ctx,
        user: addTierLimitsToUser(user),
        session
      }
    })
  } else {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Two factor authentication failed' })
  }
})

// Make sure the auth guards are called before the rate limit guard
export const JwtTwoFactorGuardProcedure = publicProcedure.use(JwtTwoFactorGuard).use(RateLimitGuard)