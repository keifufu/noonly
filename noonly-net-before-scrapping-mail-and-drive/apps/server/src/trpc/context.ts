import * as trpcExpress from '@trpc/server/adapters/express'

import { Session, User } from '@prisma/client'
import { Request, Response } from 'express'

import { inferAsyncReturnType } from '@trpc/server'

type ContextOptionalUserAndSession = {
  user: User | null
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