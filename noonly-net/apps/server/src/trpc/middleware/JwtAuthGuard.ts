import { middleware, publicProcedure } from '../trpc'

import { TRPCError } from '@trpc/server'
import { type Request } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../../database/prisma'
import { getUserLimits } from '../../utils/TierLimits'
import { Env } from '../../utils/env'
import { type UserWithTierLimits, type UserWithTierUsage } from '../context'
import { getSessionFromRequest } from '../routers/auth'
import { RateLimitGuard } from './RateLimitGuard'

export interface TokenPayload {
  userId: string
}

export function getAccessTokenFromRequest(request: Request) {
  let accessToken = request.cookies.Authentication || request.headers.authorization
  if (accessToken?.startsWith('Bearer '))
    accessToken = accessToken.split(' ')[1]
  return accessToken ?? ''
}

export const addTierLimitsToUser = (user: UserWithTierUsage): UserWithTierLimits => ({
  ...user,
  tierLimits: getUserLimits(user)
})

const JwtAuthGuard = middleware(async ({ next, ctx }) => {
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

  if (!user?.isEmailConfirmed && !ctx.req.path.toLowerCase().includes('email') && !ctx.req.path.includes('logout'))
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Email is not confirmed' })

  const session = await getSessionFromRequest(ctx.req, user.id)
  if (!session)
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'No session found' })

  // Update: the comment below is outdated, we use this for routes such as /logout and /sendVerificationEmail /verifyEmail changeEmail
  // where the user can either be mfa authenticated or not.
  /*
     * JwtAuthGuard is only being used on endpoints where a user needs to confirm 2FA of some sort.
     * So if they are already twoFactorAuthenticated then they don't need access to those endpoints anymore
     */
  // if (session.isMfaAuthenticated)
  // throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Already two factor authenticated' })

  return next({
    ctx: {
      ...ctx,
      user: addTierLimitsToUser(user),
      session
    }
  })
})

// Make sure the auth guards are called before the rate limit guard
export const JwtAuthGuardProcedure = publicProcedure.use(JwtAuthGuard).use(RateLimitGuard)