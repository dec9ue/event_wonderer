import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { requireAuth } from '../middlewares/auth'
import { requireAdmin } from '../middlewares/rbac'
import { createTagBody, patchTagBody, tagBase } from '../schemas/tags'

const tagsRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', requireAuth)
  app.addHook('preHandler', requireAdmin)

  app.get('/', async (req: FastifyRequest) => {
    const items = await req.server.prisma.tag.findMany({ orderBy: { name: 'asc' } })
    return { items: items.map((t: any) => tagBase.parse(t)) }
  })

  app.post('/', async (req: FastifyRequest, reply: FastifyReply) => {
    const parsed = createTagBody.safeParse(req.body)
    if (!parsed.success) return reply.status(400).send({ error: { code: 'BAD_REQUEST', message: 'Invalid body', details: parsed.error.flatten() } })
    try {
      const tag = await req.server.prisma.tag.create({ data: parsed.data })
      return reply.status(201).send(tagBase.parse(tag))
    } catch (e: any) {
      if (e.code === 'P2002') return reply.status(409).send({ error: { code: 'TAG_EXISTS', message: 'Tag already exists' } })
      throw e
    }
  })

  app.patch('/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const id = (req.params as any).id as string
    const parsed = patchTagBody.safeParse(req.body)
    if (!parsed.success) return reply.status(400).send({ error: { code: 'BAD_REQUEST', message: 'Invalid body', details: parsed.error.flatten() } })
    try {
      const tag = await req.server.prisma.tag.update({ where: { id }, data: parsed.data })
      return tagBase.parse(tag)
    } catch (e: any) {
      if (e.code === 'P2025') return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Tag not found' } })
      if (e.code === 'P2002') return reply.status(409).send({ error: { code: 'TAG_EXISTS', message: 'Tag already exists' } })
      throw e
    }
  })

  app.delete('/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const id = (req.params as any).id as string
    try {
      await req.server.prisma.tag.delete({ where: { id } })
      return reply.status(204).send()
    } catch (e: any) {
      if (e.code === 'P2025') return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Tag not found' } })
      throw e
    }
  })
}

export default tagsRoutes
