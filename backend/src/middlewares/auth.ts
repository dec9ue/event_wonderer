import { FastifyReply, FastifyRequest } from 'fastify'

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  try {
    const payload = await req.jwtVerify<{ id: string; role: 'admin' | 'user'; email: string; name: string }>()
    req.user = payload
  } catch {
    return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } })
  }
}
