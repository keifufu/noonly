/* eslint-disable prefer-destructuring */

import { initTRPC, TRPCError } from '@trpc/server'
import { Context } from 'src/trpc/context'
import superjson from 'superjson'
import { OpenApiMeta } from 'trpc-openapi'
import { ZodError } from 'zod'
import { RateLimitMeta } from './middleware/RateLimitGuard'

// Exporting this to be able to use it in trpc-openapi
export function errorFormatter(error: TRPCError) {
  if (error.code === 'BAD_REQUEST' && error.cause instanceof ZodError) {
    return {
      message: error.cause.issues[0].message,
      code: 'BAD_REQUEST'
    }
  } else {
    return {
      message: error.message,
      code: error.code
    }
  }
}

const t = initTRPC.meta<OpenApiMeta<RateLimitMeta>>().context<Context>().create({
  transformer: superjson,
  errorFormatter({ error }) {
    return errorFormatter(error)
  }
})

// We explicitly export the methods we use here.
// This allows us to create reusable & protected base procedures.
export const middleware = t.middleware
export const router = t.router
export const publicProcedure = t.procedure