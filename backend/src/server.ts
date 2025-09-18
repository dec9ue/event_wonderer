import Fastify, { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import { config } from './config'
import { prismaPlugin } from './plugins/prisma'
import { authPlugin } from './plugins/auth'
import { swaggerPlugin } from './plugins/swagger'
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import floorsRoutes from './routes/floors'
import { s3Plugin } from './plugins/s3'

export const buildServer = () => {
  const app = Fastify({ logger: true })

  // Global error handler
  app.setErrorHandler((err: FastifyError, _req: FastifyRequest, reply: FastifyReply) => {
    const status = (err as any).statusCode ?? 500
    const code = (err as any).code ?? 'INTERNAL_ERROR'
    const message = err.message || 'Unexpected error'
    const details = (err as any).validation || (err as any).details
    reply.status(status).send({ error: { code, message, details } })
  })

  // Core plugins
  app.register(cors, {
    origin: config.corsOrigin,
    credentials: true,
  })
  app.register(cookie)
  app.register(swaggerPlugin)
  app.register(prismaPlugin)
  app.register(authPlugin)
  app.register(s3Plugin)

  // Routes
  app.get('/healthz', async (req) => {
    await req.server.prisma.$queryRaw`SELECT 1`;
    return { ok: true }
  })
  app.register(authRoutes, { prefix: '/api/auth' })
  app.register(userRoutes, { prefix: '/api/users' })
  app.register(floorsRoutes, { prefix: '/api/floors' })

  return app
}

if (import.meta.env?.MODE !== 'test') {
  const app = buildServer()
  app.listen({ port: config.port, host: '0.0.0.0' }).catch((err) => {
    app.log.error(err)
    process.exit(1)
  })
}
