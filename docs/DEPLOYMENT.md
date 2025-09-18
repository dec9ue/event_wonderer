# Deployment & Operations

## Environments
- Local/on-prem via docker-compose.
- Node 20 base images.

## Bring-up
```
cp .env.sample .env
# Optionally edit credentials and ports

docker compose up -d --build

# Initialize schema (first run or no migrations)
docker compose exec backend npx prisma db push
# Seed data
/docker compose exec backend npx prisma db seed
```

Services:
- Frontend: http://localhost:5173 (SPA; `/login`, `/map`)
- Backend: http://localhost:3000 (health: `/healthz`, docs: `/docs`)
- MinIO: http://localhost:9000 (console: http://localhost:9001)
- Postgres: localhost:5432

## MinIO
- Create bucket `attachments` in the console on first run (or change `MINIO_BUCKET`).
- Backend uses MinIO with access/secret keys from env; SSL disabled by default locally.

## Configuration
- See `.env.sample` and README for all variables.
- Frontend can set `VITE_API_BASE` (defaults to `http://localhost:3000`).

## Database migrations
- For production and CI, prefer Prisma migrations:
```
docker compose exec backend npx prisma migrate deploy
```
- For early development without migrations, `db push` is acceptable.

## Images & builds
- Backend Dockerfile uses `node:20-bookworm-slim` and installs build deps for bcrypt and Prisma (OpenSSL).
- Frontend Dockerfile builds with `node:20-alpine`, serves with Nginx; custom `nginx.conf` provides SPA fallback.

## Health & logs
- Backend health: GET `/healthz`.
- Docker logs: `docker compose logs -f backend` / `frontend`.

## Troubleshooting
- Frontend 404 on deep links: ensure `nginx.conf` has `try_files ... /index.html` and container rebuilt.
- Prisma OpenSSL errors in Alpine: use Debian base image (already configured).
- `401 Unauthorized` after login: verify cookie domain/samesite settings and that requests use `credentials: 'include'`.
