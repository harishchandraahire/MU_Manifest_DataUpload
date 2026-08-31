/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_USER_LOGIN_MAILAMERICA: string
  readonly VITE_API_USER_PASSWORD_MAILAMERICA: string
  readonly VITE_API_USER_LOGIN_SKYNET: string
  readonly VITE_API_USER_PASSWORD_SKYNET: string
  readonly VITE_UPLOAD_CHUNK_SIZE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
