import { env } from './env'

export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  corsOrigin: env.FRONTEND_ORIGIN,
  jwt: {
    secret: env.JWT_SECRET,
    cookieName: env.COOKIE_NAME,
    cookie: {
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE,
      httpOnly: true,
      path: '/',
    } as const,
  },
  db: {
    url: env.DATABASE_URL,
  },
  s3: {
    endpoint: env.MINIO_ENDPOINT,
    port: env.MINIO_PORT,
    accessKeyId: env.MINIO_ACCESS_KEY,
    secretAccessKey: env.MINIO_SECRET_KEY,
    bucket: env.MINIO_BUCKET,
    forcePathStyle: true,
    tls: env.MINIO_USE_SSL,
  },
}
