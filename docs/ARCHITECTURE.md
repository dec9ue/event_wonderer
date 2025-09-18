# Architecture Overview

This document describes the MVP architecture for Site Patrol & Findings Map.

## System components
- Frontend (SPA): React 18 + Vite 5, served by Nginx in the container.
  - Client-side routing with React Router; Nginx is configured with a SPA fallback to `index.html`.
- Backend API: Node 20, Fastify v4 (TypeScript), Prisma Client, Zod validation.
  - Security: httpOnly JWT cookie auth, CORS restricted to the SPA origin, basic rate limiting, Helmet security headers.
  - Docs: OpenAPI via `@fastify/swagger@^8` and `@fastify/swagger-ui@^4` (compatible with Fastify v4).
- Database: PostgreSQL 16.
- Object Storage: MinIO (S3-compatible) for floor images and attachments.
- Container Orchestration: docker-compose for local/on-prem deployments.

## Runtime topology (default ports)
- Frontend (Nginx): http://localhost:5173 → serves built SPA.
- Backend API: http://localhost:3000 → `/healthz`, `/docs`, `/api/*`.
- MinIO API: http://localhost:9000; MinIO Console: http://localhost:9001.
- PostgreSQL: localhost:5432.

## Core responsibilities
- Frontend
  - Login form, reports map page, admin pages for floors/tags.
  - Talks to backend via JSON over HTTPS (http locally) with credentials included for cookie auth.
- Backend
  - Auth: login/logout, `me` endpoint; sets/clears JWT in httpOnly cookie.
  - CRUD: users (admin), reports, tags, attachments; audit logging.
  - Storage: Presigned PUT/GET URLs to MinIO for uploads/downloads.
- Storage
  - MinIO bucket `attachments` stores all images/files; keys are referenced by application rows.

## Key design decisions
- JWT in httpOnly cookies for simplicity on same-origin setups (CORS allows SPA origin).
- Prisma for schema and access; prefer migrations in prod, `db push` acceptable for early MVP.
- SPA fallback in Nginx to support deep links like `/login`, `/map` without server-side routes.
- Backend image base is Debian Bookworm to satisfy Prisma OpenSSL requirements in containers.

## Error handling & observability
- Consistent error envelope: `{ error: { code, message } }` for known errors.
- Health check at `/healthz`.
- Structured audit logs for report changes.

## Security notes
- Cookies: httpOnly; SameSite=Lax by default; configurable via env.
- Helmet headers and rate limiting enabled.
- Validate inputs with Zod and Fastify schemas.

See also: `SEQUENCES.md` and `DEPLOYMENT.md`.
