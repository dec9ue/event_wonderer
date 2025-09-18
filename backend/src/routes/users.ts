import { FastifyPluginAsync } from 'fastify'
import bcrypt from 'bcrypt'
import { requireAuth } from '../middlewares/auth'
import { requireAdmin } from '../middlewares/rbac'
import { createUserBody, listUsersQuery, patchUserBody } from '../schemas/users'

const userRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', requireAuth)
  app.addHook('preHandler', requireAdmin)

  app.get('/', async (req, reply) => {
    const parsed = listUsersQuery.safeParse(req.query)
    if (!parsed.success) return reply.status(400).send({ error: { code: 'BAD_REQUEST', message: 'Invalid query', details: parsed.error.flatten() } })
    const { page, pageSize } = parsed.data
    const [items, total] = await Promise.all([
      req.server.prisma.user.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
      }),
      req.server.prisma.user.count(),
    ])
    return { items, total, page, pageSize }
  })

  app.post('/', async (req, reply) => {
    const parsed = createUserBody.safeParse(req.body)
    if (!parsed.success) return reply.status(400).send({ error: { code: 'BAD_REQUEST', message: 'Invalid body', details: parsed.error.flatten() } })
    const { name, email, role, password } = parsed.data
    const password_hash = await bcrypt.hash(password, 10)
    try {
      const user = await req.server.prisma.user.create({
        data: { name, email, role, password_hash },
        select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
      })
      return reply.status(201).send(user)
    } catch (e: any) {
      if (e.code === 'P2002') {
        return reply.status(409).send({ error: { code: 'EMAIL_TAKEN', message: 'Email already in use' } })
      }
      throw e
    }
  })

  app.patch('/:id', async (req, reply) => {
    const id = (req.params as any).id as string
    const parsed = patchUserBody.safeParse(req.body)
    if (!parsed.success) return reply.status(400).send({ error: { code: 'BAD_REQUEST', message: 'Invalid body', details: parsed.error.flatten() } })
    const data: any = { ...parsed.data }
    if (data.password) {
      data.password_hash = await bcrypt.hash(data.password, 10)
      delete data.password
    }
    try {
      const user = await req.server.prisma.user.update({
        where: { id },
        data,
        select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
      })
      return user
    } catch (e: any) {
      if (e.code === 'P2025') return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'User not found' } })
      throw e
    }
  })

  app.delete('/:id', async (req, reply) => {
    const id = (req.params as any).id as string
    try {
      await req.server.prisma.user.delete({ where: { id } })
      return reply.status(204).send()
    } catch (e: any) {
      if (e.code === 'P2025') return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'User not found' } })
      throw e
    }
  })
}

export default userRoutes
