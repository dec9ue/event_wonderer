# User Guide — Site Patrol & Findings Map

This guide walks through typical tasks: logging in, viewing the map, creating and managing reports, using attachments, and admin pages.

- App URL: http://localhost:5173
- Login: admin@example.com / Admin123! (seeded account for demo)

## 1) Sign in
1. Open http://localhost:5173/login
2. Enter your email and password.
3. Click "Login". If successful, you’ll be taken to the map.

If you see "Unauthorized" or are returned to the login screen, check your email/password or contact an admin.

## 2) Map overview (Reports Map)
- Access: http://localhost:5173/map (requires login)
- Main elements:
  - Floor selector (if multiple floors exist)
  - Map canvas with existing report markers
  - Toolbar for filters and creating reports

Tips:
- Hover or click markers to view report details.
- Use filters to narrow results (status, date range, tags, text search).

## 3) Create a new report
1. On the map, click the location where the finding should be placed.
2. In the create dialog, fill required fields:
   - Title, Status, Observed At
   - Coordinates are captured from the click (x/y on floor; lat/lng optional)
   - Floor is preselected if viewing a floor
   - Optional tags and description
3. Save to create the report. Your report appears as a marker on the map.

## 4) Edit or delete a report
1. Click a report marker to open its details.
2. Click "Edit" to modify fields like title, status, tags, or description.
3. Click "Delete" to remove the report (you must be the creator or an admin).

Audit: Changes are tracked in the audit log for accountability.

## 5) Attachments (photos, videos, audio, files)
1. Open a report’s details and choose "Add attachment".
2. Select a file; the app requests a one-time upload URL.
3. The file is uploaded directly to storage; then it’s recorded with the report.
4. To download, use the "Download" action (generates a temporary link).
5. To remove, click "Delete" next to the attachment (owner or admin only).

Supported types: image, video, audio, file. Size limits and types are enforced by the server.

## 6) Tags
- Tags help categorize reports. You can filter by tags on the map.
- Admins can manage the tag list (see Admin → Tags).

## 7) Floors (Admin)
- Access: http://localhost:5173/admin/floors (admin only)
- Add a floor:
  1. Click "New Floor" and enter a name.
  2. Upload a floor image (PNG/JPEG). The app will use a direct upload.
  3. Provide width/height if prompted so the map scales correctly.
- Edit floor: update name or image.

## 8) Tags Management (Admin)
- Access: http://localhost:5173/admin/tags (admin only)
- Create, rename, or delete tags.

## 9) Sign out
- Use the logout action in the app menu to end your session.

## Troubleshooting
- I’m redirected to the login page: Your session may have expired. Log in again.
- Upload fails: Ensure file type and size meet the allowed limits.
- I can’t edit/delete a report: You must be the creator or have admin role.
- I don’t see the floor image: Ask an admin to upload a floor image for the selected floor.

## Keyboard/UX tips
- Use the browser’s back/forward to navigate between views; the app supports deep links.
- On the map, zoom and pan to locate reports; click markers for details.
