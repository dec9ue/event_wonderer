import { z } from 'zod'

export const reportStatus = z.enum(['open', 'in_progress', 'closed'])
export const geomType = z.enum(['point'])

export const reportBase = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  status: reportStatus,
  observedAt: z.string().or(z.date()),
  geomType: geomType,
  x: z.number(),
  y: z.number(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  floorId: z.string(),
  createdById: z.string(),
  updatedById: z.string(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  tags: z.array(z.string()).default([]),
})

export const listReportsQuery = z.object({
  floorId: z.string().optional(),
  q: z.string().optional(),
  status: reportStatus.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  tag: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
})

export const createReportBody = z.object({
  title: z.string().min(1),
  body: z.string().default(''),
  status: reportStatus.default('open'),
  observedAt: z.coerce.date(),
  geomType: geomType.default('point'),
  x: z.number(),
  y: z.number(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  floorId: z.string(),
  tags: z.array(z.string()).optional(),
})

export const patchReportBody = z.object({
  title: z.string().min(1).optional(),
  body: z.string().optional(),
  status: reportStatus.optional(),
  observedAt: z.coerce.date().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  tags: z.array(z.string()).optional(),
})

export type ListReportsQuery = z.infer<typeof listReportsQuery>
export type CreateReportBody = z.infer<typeof createReportBody>
export type PatchReportBody = z.infer<typeof patchReportBody>
