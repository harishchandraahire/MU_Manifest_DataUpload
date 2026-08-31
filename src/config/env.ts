export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL

/** Each logistics service authenticates with its own API user — keyed by
 * service key so ServiceUploadPage's service.key can look up the right one. */
export const API_CREDENTIALS: Record<string, { login: string; password: string }> = {
  mailamerica: {
    login: import.meta.env.VITE_API_USER_LOGIN_MAILAMERICA,
    password: import.meta.env.VITE_API_USER_PASSWORD_MAILAMERICA,
  },
  skynet: {
    login: import.meta.env.VITE_API_USER_LOGIN_SKYNET,
    password: import.meta.env.VITE_API_USER_PASSWORD_SKYNET,
  },
}

/** Max records sent per upload request. The backend writes one row per DB
 * round-trip inside a single request/response cycle, so very large files
 * are chunked client-side to stay well under the request timeout. */
const parsedChunkSize = Number(import.meta.env.VITE_UPLOAD_CHUNK_SIZE)
export const UPLOAD_CHUNK_SIZE: number = Number.isFinite(parsedChunkSize) && parsedChunkSize > 0 ? parsedChunkSize : 100
