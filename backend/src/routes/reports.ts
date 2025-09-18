import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import { requireAuth } from '../middlewares/auth'
import { createReportBody, listReportsQuery, patchReportBody, reportBase } from '../schemas/reports'
import { makeDiff } from '../services/audit'

const reportsRoutes: FastifyPluginAsync = async (app) => {
  // All report routes require authentication
  app.addHook('preHandler', requireAuth)

  app.get('/', async (req: FastifyRequest, reply: FastifyReply) => {
    const parsed = listReportsQuery.safeParse(req.query)
    if (!parsed.success) return reply.status(400).send({ error: { code: 'BAD_REQUEST', message: 'Invalid query', details: parsed.error.flatten() } })
    const { floorId, q, status, from, to, tag, page, pageSize } = parsed.data

    const where: any = {}
    if (floorId) where.floorId = floorId
    if (status) where.status = status
    if (from || to) where.observedAt = { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) }
    if (q) where.OR = [{ title: { contains: q, mode: 'insensitive' } }, { body: { contains: q, mode: 'insensitive' } }]
    if (tag) where.tags = { some: { tag: { name: tag } } }

    const [itemsRaw, total] = await Promise.all([
      req.server.prisma.report.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { observedAt: 'desc' },
        include: { tags: { include: { tag: true } } },
      }),
      req.server.prisma.report.count({ where }),
    ])

    const items = itemsRaw.map((r: any) => ({
      ...r,
      tags: r.tags.map((t: any) => t.tag.name),
    }))

    return { items: items.map((i: any) => reportBase.parse(i)), total, page, pageSize }
  })

  app.get('/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const id = (req.params as any).id as string
    const r = await req.server.prisma.report.findUnique({ where: { id }, include: { tags: { include: { tag: true } } } })
    if (!r) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Report not found' } })
    const report = { ...r, tags: r.tags.map((t: any) => t.tag.name) }
    return reportBase.parse(report)
  })

  app.post('/', async (req: FastifyRequest, reply: FastifyReply) => {
    const parsed = createReportBody.safeParse(req.body)
    if (!parsed.success) return reply.status(400).send({ error: { code: 'BAD_REQUEST', message: 'Invalid body', details: parsed.error.flatten() } })
    const { title, body, status, observedAt, geomType, x, y, lat, lng, floorId, tags } = parsed.data

    const created = await req.server.prisma.report.create({
      data: {
        title,
        body,
        status,
        observedAt,
        geomType,
        x,
        y,
        lat,
        lng,
        floorId,
        createdById: req.user!.id,
        updatedById: req.user!.id,
        ...(tags && tags.length
          ? {
              tags: {
                create: tags.map((name: string) => ({
                  tag: { connectOrCreate: { where: { name }, create: { name } } },
                })),
              },
            }
          : {}),
      },
      include: { tags: { include: { tag: true } } },
    })

    const report = { ...created, tags: created.tags.map((t: any) => t.tag.name) }

    // Audit: create
    const afterFields: Record<string, unknown> = {
      title: report.title,
      body: report.body,
      status: report.status,
      observedAt: report.observedAt,
      geomType: report.geomType,
      x: report.x,
      y: report.y,
      lat: report.lat ?? null,
      lng: report.lng ?? null,
      floorId: report.floorId,
      tags: report.tags,
    }
    await req.server.prisma.auditLog.create({
      data: {
        reportId: report.id,
        actorId: req.user!.id,
        action: 'create',
        diffJson: makeDiff({}, afterFields, Object.keys(afterFields)),
      },
    })

    return reply.status(201).send(reportBase.parse(report))
  })

  app.patch('/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const id = (req.params as any).id as string
    const parsed = patchReportBody.safeParse(req.body)
    if (!parsed.success) return reply.status(400).send({ error: { code: 'BAD_REQUEST', message: 'Invalid body', details: parsed.error.flatten() } })

    const existing = await req.server.prisma.report.findUnique({ where: { id }, include: { tags: { include: { tag: true } } } })
    if (!existing) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Report not found' } })

    // Permission: owner or admin
    const isOwner = existing.createdById === req.user!.id
    const isAdmin = req.user!.role === 'admin'
    if (!isOwner && !isAdmin) return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Not allowed to modify this report' } })

    const data: any = {
      ...parsed.data,
      updatedById: req.user!.id,
    }
    if (parsed.data.tags) {
      data.tags = {
        deleteMany: {},
        create: parsed.data.tags.map((name: string) => ({ tag: { connectOrCreate: { where: { name }, create: { name } } } })),
      }
    }

    const updated = await req.server.prisma.report.update({
      where: { id },
      data,
      include: { tags: { include: { tag: true } } },
    })

    const beforeFields: Record<string, unknown> = {
      title: existing.title,
      body: existing.body,
      status: existing.status,
      observedAt: existing.observedAt,
      geomType: existing.geomType,
      x: existing.x,
      y: existing.y,
      lat: existing.lat ?? null,
      lng: existing.lng ?? null,
      floorId: existing.floorId,
      tags: existing.tags.map((t: any) => t.tag.name),
    }
    const afterFields: Record<string, unknown> = {
      title: updated.title,
      body: updated.body,
      status: updated.status,
      observedAt: updated.observedAt,
      geomType: updated.geomType,
      x: updated.x,
      y: updated.y,
      lat: updated.lat ?? null,
      lng: updated.lng ?? null,
      floorId: updated.floorId,
      tags: updated.tags.map((t: any) => t.tag.name),
    }
    await req.server.prisma.auditLog.create({
      data: {
        reportId: updated.id,
        actorId: req.user!.id,
        action: 'update',
        diffJson: makeDiff(beforeFields, afterFields, Object.keys(afterFields)),
      },
    })

    const report = { ...updated, tags: updated.tags.map((t) => t.tag.name) }
    return reportBase.parse(report)
  })

  app.delete('/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const id = (req.params as any).id as string
    const existing = await req.server.prisma.report.findUnique({ where: { id }, include: { tags: { include: { tag: true } } } })
    if (!existing) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Report not found' } })

    const isOwner = existing.createdById === req.user!.id
    const isAdmin = req.user!.role === 'admin'
    if (!isOwner && !isAdmin) return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Not allowed to delete this report' } })

    const beforeFields: Record<string, unknown> = {
      title: existing.title,
      body: existing.body,
      status: existing.status,
      observedAt: existing.observedAt,
      geomType: existing.geomType,
      x: existing.x,
      y: existing.y,
      lat: existing.lat ?? null,
      lng: existing.lng ?? null,
      floorId: existing.floorId,
      tags: existing.tags.map((t: any) => t.tag.name),
    }

    // Audit first (will be cascaded on delete as per schema)
    await req.server.prisma.auditLog.create({
      data: {
        reportId: existing.id,
        actorId: req.user!.id,
        action: 'delete',
        diffJson: makeDiff(beforeFields, {}, Object.keys(beforeFields)),
      },
    })

    await req.server.prisma.report.delete({ where: { id } })
    return reply.status(204).send()
  })
}

export default reportsRoutes
