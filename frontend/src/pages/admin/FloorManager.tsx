import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../../api/client'

type Floor = {
  id: string
  name: string
  imageUrl?: string | null
  widthPx?: number | null
  heightPx?: number | null
}

export default function FloorManager() {
  const [floors, setFloors] = useState<Floor[]>([])
  const [name, setName] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = useMemo(() => floors.find(f => f.id === selectedId) || null, [floors, selectedId])

  async function load() {
    const data = await api<{ items: Floor[] }>('/api/floors')
    setFloors(data.items)
  }

  useEffect(() => { load() }, [])

  async function createFloor(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const f = await api<Floor>('/api/floors', { method: 'POST', body: JSON.stringify({ name }) })
    setName('')
    setFloors([f, ...floors])
  }

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    if (!selected) return
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      alert('Only PNG or JPEG allowed')
      return
    }
    const init = await api<{ url: string; objectKey: string; headers?: Record<string, string> }>(`/api/floors/${selected.id}/image/init-upload`, {
      method: 'POST',
      body: JSON.stringify({ contentType: file.type }),
    })
    await fetch(init.url, { method: 'PUT', body: file, headers: init.headers })
    // read image size
    const img = await readImage(file)
    const updated = await api<Floor>(`/api/floors/${selected.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ imageUrl: init.objectKey, widthPx: img.width, heightPx: img.height })
    })
    setFloors(floors.map(f => f.id === updated.id ? updated : f))
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin: Floor Manager</h2>
      <form onSubmit={createFloor} style={{ marginBottom: 16 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="New floor name" />
        <button type="submit">Create</button>
      </form>
      <div style={{ display: 'flex', gap: 24 }}>
        <ul style={{ width: 280 }}>
          {floors.map(f => (
            <li key={f.id}>
              <button onClick={() => setSelectedId(f.id)} style={{ fontWeight: f.id === selectedId ? 'bold' : 'normal' }}>{f.name}</button>
            </li>
          ))}
        </ul>
        <div style={{ flex: 1 }}>
          {selected ? (
            <div>
              <h3>{selected.name}</h3>
              <div style={{ margin: '8px 0' }}>
                <input type="file" accept="image/png,image/jpeg" onChange={onPickImage} />
              </div>
              <div>
                {selected.imageUrl ? (
                  <p>Image set: {selected.imageUrl} ({selected.widthPx} x {selected.heightPx})</p>
                ) : (
                  <p>No image uploaded.</p>
                )}
              </div>
            </div>
          ) : (
            <p>Select a floor</p>
          )}
        </div>
      </div>
    </div>
  )
}

function readImage(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
      URL.revokeObjectURL(url)
    }
    img.onerror = reject
    img.src = url
  })
}
