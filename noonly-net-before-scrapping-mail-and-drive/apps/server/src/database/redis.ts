import Redis from 'ioredis'
import { Env } from 'src/utils/env'

const redisGlobal = global as typeof global & {
  redis?: Redis
}

export const redis: Redis
  = redisGlobal.redis ||
  new Redis({
    port: Env.instance.get('REDIS_PORT'),
    host: Env.instance.get('REDIS_HOST'),
    password: Env.instance.get('REDIS_PASSWORD')
  })

if (process.env.NODE_ENV !== 'production')
  redisGlobal.redis = redis