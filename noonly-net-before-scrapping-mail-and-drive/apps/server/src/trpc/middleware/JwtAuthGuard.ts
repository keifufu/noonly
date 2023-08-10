import { middleware, publicProcedure } from '../trpc'

import { TRPCError } from '@trpc/server'
import { Request } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from 'src/database/prisma'
import { Env } from 'src/utils/env'
import { getSessionFromRequest } from '../routers/auth'
import { RateLimitGuard } from './RateLimitGuard'

export interface TokenPayload {
  userId: string
}

export function getAccessTokenFromRequest(request: Request) {
  let accessToken = ''
  if (Env.instance.get('ALLOW_COOKIE_AUTH') && request.cookies.Authentication)
    accessToken = request.cookies.Authentication
  else if (request.headers.authorization && request.headers.authorization.startsWith('Bearer '))
    [, accessToken] = request.headers.authorization.split(' ')

  return accessToken
}

const JwtAuthGuard = middleware(async ({ next, ctx }) => {
  const accessToken = getAccessTokenFromRequest(ctx.req)
  let payload
  try {
    payload = jwt.verify(accessToken, Env.instance.get('JWT_ACCESS_TOKEN_SECRET')) as TokenPayload
  } catch (err) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid or expired authentication token' })
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { limits: true } })
  if (!user)
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'No user with given id found' })

  if (!user?.isPhoneNumberConfirmed && !ctx.req.path.includes('phone-number'))
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Phone number is not confirmed' })

  const session = await getSessionFromRequest(ctx.req, user.id)
  if (!session)
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'No session found' })

  /*
     * JwtAuthGuard is only being used on endpoints where a user needs to confirm 2FA of some sort.
     * So if they are already twoFactorAuthenticated then they don't need access to those endpoints anymore
     */
  if (session.isMfaAuthenticated)
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Already two factor authenticated' })

  return next({
    ctx: {
      ...ctx,
      user,
      session
    }
  })
})

// Make sure the auth guards are called before the rate limit guard
export const JwtAuthGuardProcedure = publicProcedure.use(JwtAuthGuard).use(RateLimitGuard)