import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt'
import { config } from '../config'

declare module 'fastify' {
  interface FastifyInstance {
    signUserToken: (payload: object) => Promise<string>
  }
  interface FastifyRequest {
    user?: { id: string; role: 'admin' | 'user'; email: string; name: string }
  }
}

export const authPlugin = fp(async (app) => {
  await app.register(fastifyJwt, {
    secret: config.jwt.secret,
    cookie: { cookieName: config.jwt.cookieName },
  })

  app.decorate('signUserToken', async (payload: object) => app.jwt.sign(payload))
})
