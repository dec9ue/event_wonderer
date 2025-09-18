const BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3000'

export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE}${path}`
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  if (!res.ok) {
    let msg = `${res.status}`
    try {
      const data = await res.json()
      msg = data?.error?.message || msg
    } catch {}
    if (res.status === 401 && !location.pathname.startsWith('/login')) {
      location.assign('/login')
    }
    throw new Error(msg)
  }
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  // @ts-ignore
  return res.text()
}

;(api as any).get = function get<T = any>(path: string, options: RequestInit = {}) {
  return api<T>(path, { ...options, method: 'GET' })
}
;(api as any).post = function post<T = any>(path: string, body?: any, options: RequestInit = {}) {
  return api<T>(path, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined })
}
;(api as any).patch = function patch<T = any>(path: string, body?: any, options: RequestInit = {}) {
  return api<T>(path, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined })
}
;(api as any).delete = function del<T = any>(path: string, options: RequestInit = {}) {
  return api<T>(path, { ...options, method: 'DELETE' })
}
export default Object.assign(api, { get: (api as any).get, post: (api as any).post, patch: (api as any).patch, delete: (api as any).delete })
