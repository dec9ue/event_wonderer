import api from './client'

export function initUpload(reportId: string, body: { contentType: string; bytes: number; type: 'video'|'audio'|'image'|'file' }) {
  return api.post(`/api/reports/${reportId}/attachments/init-upload`, body)
}

export function completeUpload(reportId: string, body: { objectKey: string; contentType: string; bytes: number; type: 'video'|'audio'|'image'|'file'; durationSec?: number; thumbnailKey?: string }) {
  return api.post(`/api/reports/${reportId}/attachments/complete`, body)
}

export function presignedGet(attachmentId: string): Promise<{ url: string }> {
  return api.get(`/api/attachments/${attachmentId}/presigned-get`)
}

export function deleteAttachment(attachmentId: string) {
  return api.delete(`/api/attachments/${attachmentId}`)
}
