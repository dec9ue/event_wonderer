import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { buildServer } from '../src/server'

const app = buildServer()

async function loginAsAdmin() {
  const res = await request(app.server).post('/api/auth/login').send({ email: 'admin@example.com', password: 'Admin123!' })
  expect(res.status).toBe(200)
  const cookie = res.headers['set-cookie'][0]
  return cookie
}

describe('Reports', () => {
  let cookie: string
  let floorId: string
  beforeAll(async () => {
    await app.ready()
    cookie = await loginAsAdmin()
    const floors = await request(app.server).get('/api/floors').set('cookie', cookie)
    floorId = floors.body.items[0].id
  })

  it('CRUD and filters', async () => {
    // Create
    const created = await request(app.server).post('/api/reports').set('cookie', cookie).send({
      title: 'Leak near pump', body: 'Small leak', status: 'open', observedAt: new Date().toISOString(), geomType: 'point', x: 10, y: 20, floorId,
      tags: ['safety', 'urgent']
    })
    expect(created.status).toBe(201)
    const id = created.body.id

    // Read
    const got = await request(app.server).get(`/api/reports/${id}`).set('cookie', cookie)
    expect(got.status).toBe(200)
    expect(got.body.tags).toContain('safety')

    // Update
    const patched = await request(app.server).patch(`/api/reports/${id}`).set('cookie', cookie).send({ title: 'Leak near main pump', status: 'in_progress' })
    expect(patched.status).toBe(200)
    expect(patched.body.title).toContain('main')

    // Filters
    const listByTag = await request(app.server).get(`/api/reports?floorId=${floorId}&tag=safety`).set('cookie', cookie)
    expect(listByTag.status).toBe(200)
    expect(listByTag.body.items.some((r: any) => r.id === id)).toBe(true)

    const listByKeyword = await request(app.server).get(`/api/reports?floorId=${floorId}&q=main`).set('cookie', cookie)
    expect(listByKeyword.status).toBe(200)
    expect(listByKeyword.body.items.some((r: any) => r.id === id)).toBe(true)

    // Delete
    const del = await request(app.server).delete(`/api/reports/${id}`).set('cookie', cookie)
    expect(del.status).toBe(204)
  })
})
