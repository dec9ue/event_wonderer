# Site Patrol & Findings Map MVP

Multi-user MVP for factory site patrol and findings, with Fastify + Prisma + Postgres + MinIO and React frontend. Designed to run on-prem via docker-compose.

## Stack
- Backend: Node.js 20, TypeScript, Fastify, Prisma, Zod, JWT (httpOnly cookies)
- DB: PostgreSQL 16
- Object storage: MinIO (S3-compatible)
- Frontend: React + Vite + TypeScript
- Dev: ESLint + Prettier
- Container: docker-compose for Postgres/MinIO/backend/frontend

## Getting started

1. Copy env

   cp .env.sample .env

   Optionally adjust credentials/ports.

2. Install dependencies locally (optional, for development without Docker):

   - In backend/: npm install
   - In frontend/: npm install

3. Bring up services

   docker compose up -d --build

   Services:
   - Postgres: localhost:5432
   - MinIO API: http://localhost:9000 (console http://localhost:9001)
   - Backend: http://localhost:3000/healthz
   - Frontend: http://localhost:5173

4. Migrate and seed database

   Run these in the backend container:

   docker compose exec backend npx prisma migrate deploy
   docker compose exec backend npx prisma db seed

   Seed creates:
   - Admin: admin@example.com / Admin123!
   - Sample floor and reports

## Development

- Local dev backend (outside Docker):
  - Set DATABASE_URL to your local Postgres
  - In repo root: npx prisma generate
  - cd backend && npm run dev

- Local dev frontend: cd frontend && npm run dev

## Prisma schema overview

Models included: User, Floor, Report, Attachment, Tag, ReportTag, AuditLog.

Indexes/uniques:
- User.email unique
- Tag.name unique
- Various foreign key indexes for query speed

Referential actions:
- Cascade deletes for child records like attachments and report tags
- Restrict deletion of users referenced by reports or audit logs

## Notes
- MinIO bucket: attachments (create manually in console or via future init script)
- Auth, users, floors, reports, tags, attachments APIs are implemented with JWT cookie auth. Swagger available at /docs.
- Frontend includes a login screen, a map viewer with draggable report markers, and admin pages for floors and tags.

### Environment variables

Key backend env vars (see .env.sample):
- PORT: Backend port (default 3000)
- DATABASE_URL: Postgres connection string
- JWT_SECRET: Secret for signing JWTs
- FRONTEND_ORIGIN: Allowed CORS origin for the SPA
- COOKIE_NAME, COOKIE_SECURE, COOKIE_SAME_SITE: Cookie settings for the JWT
- MINIO_ENDPOINT, MINIO_PORT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET, MINIO_USE_SSL: MinIO config
- PRESIGNED_TTL_SEC: Default TTL for S3 presigned URLs
- MAX_ATTACHMENT_BYTES: Max allowed upload size (bytes)
- RATE_LIMIT_MAX, RATE_LIMIT_WINDOW: Global rate-limit settings

## Floors & Image Uploads

Image storage uses MinIO (S3-compatible) with presigned PUT uploads from the browser.

Flow:
1) Admin creates a Floor via POST /api/floors { name }
2) Admin calls POST /api/floors/:id/image/init-upload with body { contentType: 'image/png'|'image/jpeg' }
3) Backend returns a presigned URL; the browser PUTs the binary file there directly.
4) Backend returns objectKey as an s3:// URI (e.g., s3://attachments/floors/<uuid>.img). Store this value into Floor.imageUrl via PATCH /api/floors/:id along with widthPx/heightPx parsed client-side.

Environment (.env) settings impacting MinIO:

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minio
MINIO_SECRET_KEY=minio123
MINIO_BUCKET=attachments
MINIO_USE_SSL=false

Frontend can set VITE_API_BASE to point to backend (e.g., http://localhost:3000). The Admin “Floor Manager” page lives at /admin/floors and supports listing, creating floors, and uploading images.

## Auth & Users

Endpoints:
- POST /api/auth/login { email, password } → sets httpOnly JWT cookie, returns {id,name,email,role}
- POST /api/auth/logout → clears cookie
- GET /api/auth/me → returns current user

Admin-only user management:
- GET /api/users?page=1&pageSize=20
- POST /api/users { name, email, role, password }
- PATCH /api/users/:id { name?, role?, password? }
- DELETE /api/users/:id

Security:
- JWT in httpOnly cookie (same-site=Lax by default)
- CORS limited to FRONTEND_ORIGIN
- Login rate-limited (5/min/IP)

Docs:
- OpenAPI/Swagger at /docs

## Reports, Tags, Attachments

Reports (auth required):
- GET /api/reports — list with filters: floorId, q (search title/body), status, from, to, tag, page, pageSize
- GET /api/reports/:id — fetch one
- POST /api/reports — create; body includes title, body, status, observedAt, x, y, lat?, lng?, floorId, tags?
- PATCH /api/reports/:id — update; same fields optional; tags array replaces associations when provided
- DELETE /api/reports/:id — delete
- Ownership: creators can modify/delete their own reports; admins can modify/delete any
- Audit: create/update/delete entries are recorded in AuditLog with field diffs

Tags (admin only):
- GET /api/tags — list all
- POST /api/tags — create { name }
- PATCH /api/tags/:id — rename { name }
- DELETE /api/tags/:id — delete

Attachments (auth required; must be report owner or admin):
- POST /api/reports/:id/attachments/init-upload — returns presigned PUT and s3:// objectKey for client upload
- POST /api/reports/:id/attachments/complete — persist attachment row after successful upload
- GET /api/attachments/:id/presigned-get — returns presigned GET URL to download
- DELETE /api/attachments/:id — delete attachment row

Notes
- S3 keys are stored as s3://<bucket>/<key>; server presigns GET/PUT on demand via MinIO.
- Content-type allowlist is enforced for attachments; max size configurable via MAX_ATTACHMENT_BYTES.
- Swagger docs currently cover core routes; reports/tags/attachments docs can be extended further.
