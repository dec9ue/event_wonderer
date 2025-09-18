import fp from 'fastify-plugin'
import sensible from '@fastify/sensible'
import fastifyHelmet from '@fastify/helmet'

export const securityPlugin = fp(async (app) => {
  // Adds useful decorators and http errors
  await app.register(sensible)
  // Helmet-like headers
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: false, // API only; adjust if serving UI
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })

  // Redact sensitive headers from logs
  app.addHook('onRequest', async (req) => {
    if (req.headers.authorization) {
      req.headers.authorization = '[REDACTED]'
    }
  })
})
