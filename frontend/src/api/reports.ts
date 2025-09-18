import api from './client'
import { Report, ReportList } from '../types/dto'

export function listReports(params: Record<string, any>): Promise<ReportList> {
  const usp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    if (Array.isArray(v)) v.forEach((vi) => usp.append(k, String(vi)))
    else usp.set(k, String(v))
  })
  return api.get(`/api/reports?${usp.toString()}`)
}

export function getReport(id: string): Promise<Report> {
  return api.get(`/api/reports/${id}`)
}

export function createReport(body: Partial<Report> & { floorId: string; x: number; y: number; observedAt: string; title: string }): Promise<Report> {
  return api.post('/api/reports', body)
}

export function updateReport(id: string, body: Partial<Report>): Promise<Report> {
  return api.patch(`/api/reports/${id}`, body)
}

export function deleteReport(id: string): Promise<void> {
  return api.delete(`/api/reports/${id}`)
}
