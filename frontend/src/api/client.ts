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
    throw new Error(msg)
  }
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  // @ts-ignore
  return res.text()
}
