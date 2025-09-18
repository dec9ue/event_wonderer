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
- JWT and auth routes are not implemented yet; this is infra + data model base.
- Frontend is a placeholder; future work will add map UI and auth flows.

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
