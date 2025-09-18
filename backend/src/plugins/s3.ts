import fp from 'fastify-plugin'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { config } from '../config'

declare module 'fastify' {
  interface FastifyInstance {
    s3: S3Client
    presignPutObject: (params: { bucket: string; key: string; contentType: string; expiresInSec?: number }) => Promise<{ url: string; headers: Record<string, string> }>
  }
}

export const s3Plugin = fp(async (app) => {
  const s3 = new S3Client({
    region: 'us-east-1',
    endpoint: `${config.s3.tls ? 'https' : 'http'}://${config.s3.endpoint}:${config.s3.port}`,
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.s3.accessKeyId,
      secretAccessKey: config.s3.secretAccessKey,
    },
  })

  app.decorate('s3', s3)

  app.decorate('presignPutObject', async ({ bucket, key, contentType, expiresInSec = 60 }) => {
    const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType })
    const url = await getSignedUrl(s3, command, { expiresIn: expiresInSec })
    return { url, headers: { 'Content-Type': contentType } }
  })
})
