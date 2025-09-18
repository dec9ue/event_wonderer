import { z } from 'zod'

export const userBase = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
})

export const listUsersQuery = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
})

export const createUserBody = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'user']).default('user'),
  password: z.string().min(6),
})

export const patchUserBody = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['admin', 'user']).optional(),
  password: z.string().min(6).optional(),
})

export type ListUsersQuery = z.infer<typeof listUsersQuery>
export type CreateUserBody = z.infer<typeof createUserBody>
export type PatchUserBody = z.infer<typeof patchUserBody>
