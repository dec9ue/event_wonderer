import { z } from 'zod'

export const floorBase = z.object({
  id: z.string(),
  name: z.string(),
  imageUrl: z.string().nullable().optional(),
  widthPx: z.number().nullable().optional(),
  heightPx: z.number().nullable().optional(),
  transformJson: z.any().nullable().optional(),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
})

export const listFloorsResponse = z.object({
  items: z.array(floorBase),
})

export const createFloorBody = z.object({
  name: z.string().min(1),
})

export const patchFloorBody = z.object({
  name: z.string().min(1).optional(),
  imageUrl: z.string().url().optional(),
  widthPx: z.number().int().positive().optional(),
  heightPx: z.number().int().positive().optional(),
  transformJson: z.any().optional(),
})

export const initUploadBody = z.object({
  contentType: z.enum(['image/png', 'image/jpeg']),
})

export const initUploadResponse = z.object({
  url: z.string().url(),
  objectKey: z.string(),
  headers: z.record(z.string()).optional(),
})

export type CreateFloorBody = z.infer<typeof createFloorBody>
export type PatchFloorBody = z.infer<typeof patchFloorBody>
