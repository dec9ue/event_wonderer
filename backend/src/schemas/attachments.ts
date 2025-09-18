import { z } from 'zod'

export const attachmentType = z.enum(['video', 'audio', 'image', 'file'])

export const initReportAttachmentBody = z.object({
  contentType: z.string().regex(/^image\/(png|jpeg)$|^video\//).or(z.literal('audio/mpeg')).or(z.literal('application/pdf')),
  bytes: z.number().int().positive().max(50 * 1024 * 1024),
  type: attachmentType,
})

export const initReportAttachmentResponse = z.object({
  url: z.string().url(),
  objectKey: z.string(),
  headers: z.record(z.string()).optional(),
})

export const completeReportAttachmentBody = z.object({
  objectKey: z.string(),
  contentType: z.string(),
  bytes: z.number().int().positive(),
  type: attachmentType,
  durationSec: z.number().positive().optional(),
  thumbnailKey: z.string().optional(),
})
