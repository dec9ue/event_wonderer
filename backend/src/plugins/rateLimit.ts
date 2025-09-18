import fp from 'fastify-plugin'
import rateLimit from '@fastify/rate-limit'
import { env } from '../env'

export const rateLimitPlugin = fp(async (app) => {
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
    keyGenerator: (req) => req.ip,
  })
})
