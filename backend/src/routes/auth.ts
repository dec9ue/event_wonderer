import { FastifyPluginAsync } from 'fastify'
import rateLimit from '@fastify/rate-limit'
import bcrypt from 'bcrypt'
import { loginBodySchema, meResponseSchema } from '../schemas/auth'
import { config } from '../config'

const authRoutes: FastifyPluginAsync = async (app) => {
  await app.register(rateLimit, {
    max: 5,
    timeWindow: '1 minute',
    keyGenerator: (req) => req.ip,
  })

  app.post('/login', {
    schema: {
      body: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string' }, password: { type: 'string' } } },
      response: { 200: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, email: { type: 'string' }, role: { type: 'string', enum: ['admin', 'user'] } } } },
    },
  }, async (req, reply) => {
    const parsed = loginBodySchema.safeParse(req.body)
    if (!parsed.success) return reply.status(400).send({ error: { code: 'BAD_REQUEST', message: 'Invalid body', details: parsed.error.flatten() } })
    const { email, password } = parsed.data
    const user = await req.server.prisma.user.findUnique({ where: { email } })
    if (!user) return reply.status(401).send({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } })
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return reply.status(401).send({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } })
    const token = await app.signUserToken({ id: user.id, role: user.role, email: user.email, name: user.name })
    reply.setCookie(config.jwt.cookieName, token, {
      httpOnly: true,
      sameSite: config.jwt.cookie.sameSite,
      secure: config.jwt.cookie.secure,
      path: config.jwt.cookie.path,
    })
    return reply.send(meResponseSchema.parse({ id: user.id, name: user.name, email: user.email, role: user.role }))
  })

  app.post('/logout', async (_req, reply) => {
    reply.clearCookie(config.jwt.cookieName, { path: config.jwt.cookie.path })
    return { ok: true }
  })

  app.get('/me', async (req, reply) => {
    try {
      const payload = await req.jwtVerify<{ id: string }>()
      const user = await req.server.prisma.user.findUnique({ where: { id: payload.id } })
      if (!user) return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Invalid session' } })
      return meResponseSchema.parse({ id: user.id, name: user.name, email: user.email, role: user.role })
    } catch {
      return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } })
    }
  })
}

export default authRoutes
