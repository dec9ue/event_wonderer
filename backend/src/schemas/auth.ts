import { z } from 'zod'

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const meResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
})

export type LoginBody = z.infer<typeof loginBodySchema>
export type MeResponse = z.infer<typeof meResponseSchema>
