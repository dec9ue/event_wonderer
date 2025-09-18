import React from 'react'
import { MapContainer, ImageOverlay, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { listFloors, getFloorImageUrl } from '../api/floors'
import { listReports, getReport, createReport, updateReport } from '../api/reports'
import { Report, Floor } from '../types/dto'
import ReportFilters from '../components/ReportFilters'
import ReportDetailPanel from '../components/ReportDetailPanel'

function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = React.useState(value)
  React.useEffect(() => {
    const id = setTimeout(() => setV(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return v
}

export default function ReportsMap() {
  const [floors, setFloors] = React.useState<Floor[]>([])
  const [currentFloorId, setCurrentFloorId] = React.useState<string | null>(null)
  const [floorImageUrl, setFloorImageUrl] = React.useState<string | null>(null)
  const [reports, setReports] = React.useState<Report[]>([])
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [pendingPos, setPendingPos] = React.useState<Record<string, { x: number; y: number }>>({})
  const [filters, setFilters] = React.useState<any>({})
  const debouncedFilters = useDebounced(filters, 300)

  React.useEffect(() => {
    listFloors().then((r) => {
      setFloors(r.items)
      if (!currentFloorId && r.items.length) setCurrentFloorId(r.items[0].id)
    })
  }, [])

  React.useEffect(() => {
    if (!currentFloorId) return
    getFloorImageUrl(currentFloorId).then(({ url }) => setFloorImageUrl(url)).catch(() => setFloorImageUrl(null))
    listReports({ ...debouncedFilters, floorId: currentFloorId }).then((r) => setReports(r.items))
  }, [currentFloorId, debouncedFilters])

  const floor = floors.find((f) => f.id === currentFloorId) || null

  const bounds = React.useMemo(() => {
    if (!floor) return L.latLngBounds([[0, 0], [1, 1]])
    // Use image pixel space as CRS.Simple
    // top-left (0,0) -> [0,0], bottom-right (height,width)
    return L.latLngBounds([[0, 0], [floor.heightPx, floor.widthPx]])
  }, [floor])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 360px', height: '100vh' }}>
      <div style={{ borderRight: '1px solid #ddd', padding: 8 }}>
        <div>
          <label>
            Floor
            <select value={currentFloorId || ''} onChange={(e) => setCurrentFloorId(e.target.value)}>
              {floors.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </label>
        </div>
        <ReportFilters value={filters} onChange={setFilters} />
        <div style={{ marginTop: 8 }}>
          <button onClick={() => {
            // activate drop-pin mode by selecting a temp id
            setSelectedId('new')
          }}>Add report</button>
        </div>
        <ul>
          {reports.map((r) => (
            <li key={r.id} style={{ cursor: 'pointer', padding: 4, background: selectedId === r.id ? '#eef' : 'transparent' }} onClick={() => setSelectedId(r.id)}>
              {r.title} · {r.status}
            </li>
          ))}
        </ul>
      </div>

      <div>
        {floor && floorImageUrl ? (
          <MapContainer style={{ height: '100%', width: '100%' }} crs={L.CRS.Simple} bounds={bounds} zoom={-1} minZoom={-5} maxZoom={2}>
            <ImageOverlay url={floorImageUrl} bounds={bounds} />
            {reports.map((r) => {
              const pending = pendingPos[r.id]
              const yx: [number, number] = [pending?.y ?? r.y, pending?.x ?? r.x]
              return (
                <DraggableMarker key={r.id} position={yx} selected={selectedId === r.id} onDragEnd={(latlng) => {
                  setPendingPos((p) => ({ ...p, [r.id]: { x: latlng.lng, y: latlng.lat } }))
                }} onClick={() => setSelectedId(r.id)} />
              )
            })}
          </MapContainer>
        ) : (
          <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>No floor selected or no image.</div>
        )}
      </div>

      <div style={{ borderLeft: '1px solid #ddd', padding: 8 }}>
        <ReportDetailPanel
          reportId={selectedId}
          pendingPosition={selectedId && pendingPos[selectedId] ? pendingPos[selectedId] : undefined}
          onSavePosition={async (id, pos) => {
            await updateReport(id, { x: pos.x, y: pos.y })
            setPendingPos((p) => {
              const n = { ...p }
              delete n[id]
              return n
            })
            // refresh
            if (currentFloorId) listReports({ ...debouncedFilters, floorId: currentFloorId }).then((r) => setReports(r.items))
          }}
          onDeleted={() => {
            setSelectedId(null)
            if (currentFloorId) listReports({ ...debouncedFilters, floorId: currentFloorId }).then((r) => setReports(r.items))
          }}
        />
      </div>
    </div>
  )
}

function DraggableMarker({ position, selected, onDragEnd, onClick }: { position: [number, number]; selected: boolean; onDragEnd: (latlng: L.LatLng) => void; onClick: () => void }) {
  const markerRef = React.useRef<L.Marker | null>(null)
  useMapEvents({ click() {} })
  return (
    <Marker
      ref={markerRef as any}
      position={position}
      draggable
      eventHandlers={{ dragend: () => { const m = markerRef.current; if (m) onDragEnd(m.getLatLng()) }, click: () => onClick() }}
      icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] })}
    />
  )
}
