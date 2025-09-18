import React, { useMemo } from 'react'
import FloorManager from './pages/admin/FloorManager'

export default function App() {
  const route = useMemo(() => window.location.pathname, [])
  return (
    <div style={{ padding: 24 }}>
      <h1>Site Patrol & Findings Map</h1>
      <nav style={{ marginBottom: 12 }}>
        <a href="/">Home</a> | <a href="/admin/floors">Admin: Floor Manager</a>
      </nav>
      {route === '/admin/floors' ? (
        <FloorManager />
      ) : (
        <p>Frontend placeholder is up. Backend health at /healthz.</p>
      )}
    </div>
  )
}
