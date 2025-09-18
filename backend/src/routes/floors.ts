import { FastifyPluginAsync } from 'fastify'
import crypto from 'crypto'
import { requireAuth } from '../middlewares/auth'
import { requireAdmin } from '../middlewares/rbac'
import { createFloorBody, floorBase, initUploadBody, initUploadResponse, listFloorsResponse, patchFloorBody } from '../schemas/floors'
import { config } from '../config'

function randomKey(prefix = 'floors/') {
  return `${prefix}${crypto.randomUUID()}.img`
}

const floorsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (req) => {
    const items = await req.server.prisma.floor.findMany({ orderBy: { createdAt: 'desc' } })
    return listFloorsResponse.parse({ items })
  })

  app.get('/:id', async (req, reply) => {
    const id = (req.params as any).id as string
    const floor = await req.server.prisma.floor.findUnique({ where: { id } })
    if (!floor) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Floor not found' } })
    return floorBase.parse(floor)
  })

  // Admin protected
  app.post('/', { preHandler: [requireAuth, requireAdmin] }, async (req, reply) => {
    const parsed = createFloorBody.safeParse(req.body)
    if (!parsed.success) return reply.status(400).send({ error: { code: 'BAD_REQUEST', message: 'Invalid body', details: parsed.error.flatten() } })
    const floor = await req.server.prisma.floor.create({ data: parsed.data })
    return reply.status(201).send(floorBase.parse(floor))
  })

  app.patch('/:id', { preHandler: [requireAuth, requireAdmin] }, async (req, reply) => {
    const id = (req.params as any).id as string
    const parsed = patchFloorBody.safeParse(req.body)
    if (!parsed.success) return reply.status(400).send({ error: { code: 'BAD_REQUEST', message: 'Invalid body', details: parsed.error.flatten() } })
    try {
      const floor = await req.server.prisma.floor.update({ where: { id }, data: parsed.data })
      return floorBase.parse(floor)
    } catch (e: any) {
      if (e.code === 'P2025') return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Floor not found' } })
      throw e
    }
  })

  app.delete('/:id', { preHandler: [requireAuth, requireAdmin] }, async (req, reply) => {
    const id = (req.params as any).id as string
    try {
      await req.server.prisma.floor.delete({ where: { id } })
      return reply.status(204).send()
    } catch (e: any) {
      if (e.code === 'P2025') return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Floor not found' } })
      throw e
    }
  })

  // Presigned upload init
  app.post('/:id/image/init-upload', { preHandler: [requireAuth, requireAdmin] }, async (req, reply) => {
    const id = (req.params as any).id as string
    const parsed = initUploadBody.safeParse(req.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'BAD_REQUEST', message: 'Invalid body', details: parsed.error.flatten() } })
    }
    const floor = await req.server.prisma.floor.findUnique({ where: { id } })
    if (!floor) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Floor not found' } })

    const key = randomKey('floors/')
    const { url, headers } = await req.server.presignPutObject({
      bucket: config.s3.bucket,
      key,
      contentType: parsed.data.contentType,
      expiresInSec: 60,
    })

    // s3:// style URL to store in DB after client PUT succeeds
    const objectUrl = `s3://${config.s3.bucket}/${key}`
    return initUploadResponse.parse({ url, objectKey: objectUrl, headers })
  })
}

export default floorsRoutes
