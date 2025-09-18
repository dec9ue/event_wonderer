import React from 'react'
import { login, me } from '../api/auth'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = React.useState('admin@example.com')
  const [password, setPassword] = React.useState('Admin123!')
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await login({ email, password })
      await me()
      nav('/map', { replace: true })
    } catch (e: any) {
      setError(e?.message || 'Login failed')
    }
  }

  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
      <form onSubmit={onSubmit} style={{ width: 320, display: 'grid', gap: 12 }}>
        <h1>Sign in</h1>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        <button type="submit">Login</button>
      </form>
    </div>
  )
}
