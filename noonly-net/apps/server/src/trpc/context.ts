import type * as trpcExpress from '@trpc/server/adapters/express'

import { type Session, type TierUsage, type User } from '@prisma/client'
import { type Request, type Response } from 'express'

import { type inferAsyncReturnType } from '@trpc/server'
import { type TTierLimits } from '../utils/TierLimits'

export type UserWithTierUsage = User & {
  tierUsage: TierUsage
}

export type UserWithTierLimits = UserWithTierUsage & {
  tierLimits: TTierLimits
}

type ContextOptionalUserAndSession = {
  user: UserWithTierLimits | null
  session: Session | null
  req: Request
  res: Response
}

export function createContext(opts: trpcExpress.CreateExpressContextOptions) {
  return {
    user: null,
    session: null,
    req: opts.req,
    res: opts.res
  } as ContextOptionalUserAndSession
}

export type Context = inferAsyncReturnType<typeof createContext>