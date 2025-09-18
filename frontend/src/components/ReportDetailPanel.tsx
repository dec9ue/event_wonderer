import React from 'react'
import { getReport, updateReport, deleteReport } from '../api/reports'
import { Report } from '../types/dto'

export default function ReportDetailPanel({ reportId, pendingPosition, onSavePosition, onDeleted }: {
  reportId: string | null
  pendingPosition?: { x: number; y: number }
  onSavePosition: (id: string, pos: { x: number; y: number }) => Promise<void>
  onDeleted: () => void
}) {
  const [report, setReport] = React.useState<Report | null>(null)
  const [dirty, setDirty] = React.useState(false)
  React.useEffect(() => {
    if (!reportId || reportId === 'new') { setReport(null); setDirty(false); return }
    getReport(reportId).then(setReport)
  }, [reportId])

  if (!reportId) return <div>Select a report</div>
  if (reportId === 'new') return <div>Click on the map to place a new report (todo)</div>
  if (!report) return <div>Loading…</div>

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div>
        <label>Title
          <input value={report.title} onChange={(e) => { setReport({ ...report, title: e.target.value }); setDirty(true) }} />
        </label>
      </div>
      <div>
        <label>Body
          <textarea value={report.body} onChange={(e) => { setReport({ ...report, body: e.target.value }); setDirty(true) }} />
        </label>
      </div>
      <div>
        <label>Status
          <select value={report.status} onChange={(e) => { setReport({ ...report, status: e.target.value as any }); setDirty(true) }}>
            <option value="open">open</option>
            <option value="in_progress">in_progress</option>
            <option value="closed">closed</option>
          </select>
        </label>
      </div>
      <div>
        <label>Observed At
          <input type="datetime-local" value={report.observedAt.slice(0,16)} onChange={(e) => { setReport({ ...report, observedAt: e.target.value }); setDirty(true) }} />
        </label>
      </div>
      {pendingPosition && (
        <div style={{ display: 'flex', gap: 8 }}>
          <span>New position: x={pendingPosition.x.toFixed(1)}, y={pendingPosition.y.toFixed(1)}</span>
          <button onClick={() => onSavePosition(report.id, pendingPosition)}>Save position</button>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button disabled={!dirty} onClick={async () => { if (!report) return; const { id, ...rest } = report; const saved = await updateReport(report.id, rest); setReport(saved); setDirty(false) }}>Save</button>
        <button style={{ color: 'red' }} onClick={async () => { if (!confirm('Delete this report?')) return; await deleteReport(report.id); onDeleted() }}>Delete</button>
      </div>
    </div>
  )
}
