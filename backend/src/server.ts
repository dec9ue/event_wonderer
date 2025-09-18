import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import { env } from './env'
import { config } from './config'
import { PrismaClient } from '@prisma/client'
import { S3Client } from '@aws-sdk/client-s3'

const app = Fastify({ logger: true })

await app.register(cors, { origin: true, credentials: true })
await app.register(cookie, { hook: 'onRequest' })

// Initialize clients
const prisma = new PrismaClient()
const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: `${config.s3.tls ? 'https' : 'http'}://${config.s3.endpoint}:${config.s3.port}`,
  forcePathStyle: true,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
})

app.get('/healthz', async () => {
  // Tiny DB ping
  await prisma.$queryRaw`SELECT 1`;
  return { ok: true }
})

const start = async () => {
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
