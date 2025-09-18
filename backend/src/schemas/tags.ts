import { z } from 'zod'

export const tagBase = z.object({ id: z.string(), name: z.string() })
export const createTagBody = z.object({ name: z.string().min(1) })
export const patchTagBody = z.object({ name: z.string().min(1) })
