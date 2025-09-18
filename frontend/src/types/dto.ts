export type Role = 'admin' | 'user'
export type ReportStatus = 'open' | 'in_progress' | 'closed'

export type Floor = {
  id: string
  name: string
  imageUrl: string
  widthPx: number
  heightPx: number
  transformJson?: any
  createdAt: string
  updatedAt: string
}
export type FloorList = { items: Floor[] }

export type Tag = { id: string; name: string }
export type TagList = { items: Tag[] }

export type Attachment = {
  id: string
  reportId: string
  type: 'video' | 'audio' | 'image' | 'file'
  objectKey: string
  contentType: string
  bytes: number
  durationSec?: number
  thumbnailKey?: string
  createdAt: string
}

export type Report = {
  id: string
  title: string
  body: string
  status: ReportStatus
  observedAt: string
  geomType: 'point'
  x: number
  y: number
  lat?: number | null
  lng?: number | null
  floorId: string
  createdById: string
  updatedById: string
  createdAt: string
  updatedAt: string
  tags: string[]
}

export type ReportList = { items: Report[]; total: number; page: number; pageSize: number }
