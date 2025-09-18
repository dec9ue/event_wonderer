import { FastifyReply, FastifyRequest } from 'fastify'

export function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  if (!req.user || req.user.role !== 'admin') {
    return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Admin only' } })
  }
}
