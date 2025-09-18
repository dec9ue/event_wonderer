import api from './client'

export type Me = { id: string; name: string; email: string; role: 'admin' | 'user' }

export async function me(): Promise<Me> {
  return api.get('/api/auth/me')
}

export async function login(body: { email: string; password: string }) {
  return api.post('/api/auth/login', body)
}

export async function logout() {
  return api.post('/api/auth/logout', {})
}
