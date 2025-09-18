import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { buildServer } from '../src/server'

const app = buildServer()

describe('Users (admin)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  it('rejects non-authenticated access', async () => {
    const res = await request(app.server).get('/api/users')
    expect(res.status).toBe(401)
  })
})
