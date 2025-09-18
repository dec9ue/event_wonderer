import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  FRONTEND_ORIGIN: z.string().default('http://localhost:5173'),
  COOKIE_NAME: z.string().default('sid'),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  MINIO_ENDPOINT: z.string(),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_ACCESS_KEY: z.string(),
  MINIO_SECRET_KEY: z.string(),
  MINIO_BUCKET: z.string().default('attachments'),
  MINIO_USE_SSL: z.coerce.boolean().default(false),
  PRESIGNED_TTL_SEC: z.coerce.number().min(10).max(900).default(60),
  MAX_ATTACHMENT_BYTES: z.coerce.number().min(1024).default(50 * 1024 * 1024),
  RATE_LIMIT_MAX: z.coerce.number().min(1).default(200),
  RATE_LIMIT_WINDOW: z.string().default('1 minute')
})

export const env = envSchema.parse(process.env)
