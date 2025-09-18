import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import crypto from 'crypto'
import { requireAuth } from '../middlewares/auth'
import { initReportAttachmentBody, initReportAttachmentResponse, completeReportAttachmentBody } from '../schemas/attachments'
import { config } from '../config'

function randomKey(prefix = 'attachments/') {
  return `${prefix}${crypto.randomUUID()}`
}

const attachmentsRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', requireAuth)

  // Init upload for a given report
  app.post('/reports/:id/attachments/init-upload', async (req: FastifyRequest, reply: FastifyReply) => {
    const reportId = (req.params as any).id as string
    const parsed = initReportAttachmentBody.safeParse(req.body)
    if (!parsed.success) return reply.status(400).send({ error: { code: 'BAD_REQUEST', message: 'Invalid body', details: parsed.error.flatten() } })

    const report = await req.server.prisma.report.findUnique({ where: { id: reportId } })
    if (!report) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Report not found' } })

    // Permission: owner or admin
    const isOwner = report.createdById === req.user!.id
    const isAdmin = req.user!.role === 'admin'
    if (!isOwner && !isAdmin) return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Not allowed' } })

    const key = randomKey('attachments/')
    const { url, headers } = await req.server.presignPutObject({ bucket: config.s3.bucket, key, contentType: parsed.data.contentType, expiresInSec: 60 })
    const objectKey = `s3://${config.s3.bucket}/${key}`
    return initReportAttachmentResponse.parse({ url, objectKey, headers })
  })

  // Complete upload and persist record
  app.post('/reports/:id/attachments/complete', async (req: FastifyRequest, reply: FastifyReply) => {
    const reportId = (req.params as any).id as string
    const parsed = completeReportAttachmentBody.safeParse(req.body)
    if (!parsed.success) return reply.status(400).send({ error: { code: 'BAD_REQUEST', message: 'Invalid body', details: parsed.error.flatten() } })

    const report = await req.server.prisma.report.findUnique({ where: { id: reportId } })
    if (!report) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Report not found' } })
    const isOwner = report.createdById === req.user!.id
    const isAdmin = req.user!.role === 'admin'
    if (!isOwner && !isAdmin) return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Not allowed' } })

    const att = await req.server.prisma.attachment.create({
      data: {
        reportId,
        type: parsed.data.type,
        objectKey: parsed.data.objectKey,
        contentType: parsed.data.contentType,
        bytes: parsed.data.bytes,
        durationSec: parsed.data.durationSec,
        thumbnailKey: parsed.data.thumbnailKey,
      },
    })
    return reply.status(201).send(att)
  })

  // Presign a GET for the attachment
  app.get('/attachments/:id/presigned-get', async (req: FastifyRequest, reply: FastifyReply) => {
    const id = (req.params as any).id as string
    const att = await req.server.prisma.attachment.findUnique({ where: { id } })
    if (!att) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Attachment not found' } })

    const report = await req.server.prisma.report.findUnique({ where: { id: att.reportId } })
    if (!report) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Report not found' } })
    const isOwner = report.createdById === req.user!.id
    const isAdmin = req.user!.role === 'admin'
    if (!isOwner && !isAdmin) return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Not allowed' } })

    const match = att.objectKey.match(/^s3:\/\/(.+?)\/(.+)$/)
    if (!match) return reply.status(400).send({ error: { code: 'BAD_OBJECT_KEY', message: 'Invalid object key' } })
    const [, bucket, key] = match
    const { url } = await req.server.presignGetObject({ bucket, key, expiresInSec: 60 })
    return { url }
  })

  // Delete attachment
  app.delete('/attachments/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const id = (req.params as any).id as string
    const att = await req.server.prisma.attachment.findUnique({ where: { id } })
    if (!att) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Attachment not found' } })
    const report = await req.server.prisma.report.findUnique({ where: { id: att.reportId } })
    if (!report) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Report not found' } })
    const isOwner = report.createdById === req.user!.id
    const isAdmin = req.user!.role === 'admin'
    if (!isOwner && !isAdmin) return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Not allowed' } })

    await req.server.prisma.attachment.delete({ where: { id } })
    return reply.status(204).send()
  })
}

export default attachmentsRoutes
