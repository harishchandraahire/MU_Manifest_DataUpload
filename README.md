# Mauritius Tracking Data Upload

A single-page app for logistics partners (Mail America, Skynet, ...) to upload their tracking
manifest (CSV/XLSX), validate it against that partner's column schema, and push the valid rows to
the PostGlobal.APIs Logistics Controller in chunks.

## How it works

1. Pick a service on the landing page.
2. Drop a `.csv` or `.xlsx` file matching that service's manifest template.
3. The file is parsed and validated client-side against the service's column schema — required
   fields, formats (email, numeric weight, etc.) — and shown in a preview grid with per-row errors.
4. Invalid rows can be fixed inline, removed individually, or bulk-removed; only valid rows are
   uploaded.
5. On confirm, valid rows are mapped to that service's API item shape and POSTed in chunks
   (`VITE_UPLOAD_CHUNK_SIZE` rows per request) to the service's upload endpoint, authenticated with
   a per-service token obtained from `token/create`.
6. Per-chunk progress and a persisted log (survives a reload/crash mid-upload) are shown so a
   partial failure can be cross-checked against the database before re-uploading, since a network
   error does not guarantee the backend didn't already process that chunk.

## Setup

```bash
npm install
cp .env.example .env   # if present — otherwise create .env, see below
npm run dev
```

## Environment variables

```env
VITE_API_BASE_URL=https://gated.postglobal.online/mu/apis/logistics

# Each service authenticates with its own API user/password.
VITE_API_USER_LOGIN_MAILAMERICA=
VITE_API_USER_PASSWORD_MAILAMERICA=
VITE_API_USER_LOGIN_SKYNET=
VITE_API_USER_PASSWORD_SKYNET=

# Max rows sent per upload request (backend writes one row per DB round-trip
# per request, so large files are chunked client-side).
VITE_UPLOAD_CHUNK_SIZE=100
```

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — production build
- `npm run preview` — preview a production build locally
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`

## Supported services

| Service      | Key           | Service Code | Upload endpoint                              |
|--------------|---------------|--------------|-----------------------------------------------|
| Mail America | `mailamerica` | 161          | `POST /api/logst/postDataUploadByMailAmerica` |
| Skynet       | `skynet`      | 168          | `POST /api/logst/postDataUploadBySkynet`      |

### Adding a new service

1. Add its column schema (a `config/<service>Schema.js` file — see `skynetSchema.js` /
   `mailAmericaSchema.js` for the shape: `*_COLUMNS`, `*_EXPECTED_HEADERS`, `*_DELIMITER`).
2. Add a row → API item mapper (`to<Service>ApiItem`) and an uploader (`post<Service>Upload`) in
   `services/uploadService.ts` / `api/uploadApi.ts`, plus its upload URL in `api/endpoints.ts`.
3. Add its API item type to `types/upload.types.ts`.
4. Register it in `config/services.js` (key, name, service code, description, `enabled: true`) and
   in `SCHEMAS` inside `components/ServiceUploadPage.jsx`.
5. Add its login/password to `.env` (`VITE_API_USER_LOGIN_<SERVICE>` /
   `VITE_API_USER_PASSWORD_<SERVICE>`) — `config/env.ts`'s `API_CREDENTIALS` map picks these up by
   service key automatically.

## Tech stack

- React 19 + Vite
- Tailwind CSS v4
- TanStack Query (upload mutation), TanStack Table/Virtual (large record grids)
- `papaparse` (CSV) / `xlsx` (Excel) for file parsing
- Axios, with a request interceptor that resolves the calling service from the request URL and
  attaches that service's cached (or freshly requested) auth token

## Project structure

```
src/
  api/            axios client, interceptors, auth + upload endpoint calls
  components/     pages (service selection, upload) and UI pieces (grid, dialogs, drop zone, ...)
  config/         per-service manifest schemas, service registry, env access
  context/        theme (light/dark) context
  hooks/          useUploadTracking — the auth + chunked upload mutation
  services/       tokenService (per-service token cache) + uploadService (mapping/chunking)
  types/          shared TS types for upload/auth payloads
  utils/          file parsing, record validation, upload log persistence
```
