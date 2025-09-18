# Key Sequences

## Login flow
1. User opens SPA `/login`.
2. User submits email/password to POST `/api/auth/login`.
3. Backend verifies credentials; on success, sets httpOnly JWT cookie and returns basic user info.
4. SPA redirects to `/map`.
5. Protected routes call GET `/api/auth/me`; 401 triggers redirect to `/login`.

## Protected route guard
- SPA component calls `/api/auth/me` on mount; if 200, renders children; else redirects to `/login`.

## Floor image upload
1. Admin selects image (client determines contentType and pixel size).
2. Client calls POST `/api/floors/:id/image/init-upload` with `{ contentType }`.
3. Backend returns presigned PUT URL and object key (e.g., `s3://attachments/floors/<uuid>.jpg`).
4. Client PUTs image binary to presigned URL.
5. Client PATCHes `/api/floors/:id` with `{ imageUrl: <s3 uri>, widthPx, heightPx }`.

## Report attachments upload
1. User selects file; client inspects contentType and size.
2. Client POSTs `/api/reports/:id/attachments/init-upload` with `{ contentType, bytes, type }`.
3. Backend returns presigned PUT and objectKey.
4. Client PUTs file to S3.
5. Client POSTs `/api/reports/:id/attachments/complete` with `{ objectKey, contentType, bytes, type, ... }` to persist row.
6. For downloads, client calls GET `/api/attachments/:id/presigned-get` to obtain a temporary URL.

## Audit logging
- On create/update/delete of reports, server records diffs in `AuditLog` with actor, action, and timestamp.
