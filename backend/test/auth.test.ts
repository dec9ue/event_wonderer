import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { buildServer } from '../src/server'

const app = buildServer()

describe('Auth', () => {
  beforeAll(async () => {
    // ensure prisma is connected
    await app.ready()
  })

  it('login fails with wrong credentials', async () => {
    const res = await request(app.server)
      .post('/api/auth/login')
      .send({ email: 'no@example.com', password: 'wrong' })
    expect(res.status).toBe(401)
  })

  it('me returns unauthorized when no cookie', async () => {
    const res = await request(app.server).get('/api/auth/me')
    expect(res.status).toBe(401)
  })
})
