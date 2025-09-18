import React from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import Login from './pages/Login'
import ReportsMap from './pages/ReportsMap'
import FloorManager from './pages/admin/FloorManager'
import TagsAdmin from './pages/admin/TagsAdmin'
import { me } from './api/auth'

function Protected() {
  const [ok, setOk] = React.useState<boolean | null>(null)
  React.useEffect(() => {
    me().then(() => setOk(true)).catch(() => setOk(false))
  }, [])
  if (ok === null) return <div>Loading…</div>
  return ok ? <Outlet /> : <Navigate to="/login" replace />
}

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    element: <Protected />,
    children: [
      { path: '/', element: <Navigate to="/map" replace /> },
      { path: '/map', element: <ReportsMap /> },
      { path: '/admin/floors', element: <FloorManager /> },
      { path: '/admin/tags', element: <TagsAdmin /> },
    ],
  },
])
