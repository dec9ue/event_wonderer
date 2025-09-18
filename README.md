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
