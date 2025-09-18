import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt'
import type { FastifyJWT } from '@fastify/jwt'
import { config } from '../config'
import { FastifyInstance } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    signUserToken: (payload: FastifyJWT['payload']) => Promise<string>
  }
}

export const authPlugin = fp(async (app: FastifyInstance) => {
  await app.register(fastifyJwt, {
    secret: config.jwt.secret,
    cookie: { cookieName: config.jwt.cookieName, signed: false },
  })

  app.decorate('signUserToken', async (payload: FastifyJWT['payload']) => app.jwt.sign(payload))
})
