import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { AppError } from './apiError'
import { TOKEN_CREATE_URL, MAILAMERICA_UPLOAD_URL, SKYNET_UPLOAD_URL } from './endpoints'
import { ensureToken, clearToken } from '../services/tokenService'
import { logger } from '../utils/logger'
import type { TokenCreateResponse } from '../types/auth.types'

function isTokenCreateRequest(config: InternalAxiosRequestConfig): boolean {
  return Boolean(config.url && config.url.includes(TOKEN_CREATE_URL))
}

/** Each upload endpoint belongs to one service — resolve which one from the
 * request URL so the request can be authenticated with that service's own
 * token/credentials rather than a single global one. */
function resolveServiceKey(config: InternalAxiosRequestConfig): string {
  const url = config.url || ''
  if (url.includes(MAILAMERICA_UPLOAD_URL)) return 'mailamerica'
  if (url.includes(SKYNET_UPLOAD_URL)) return 'skynet'
  throw new AppError('upload', `Unable to resolve service for request URL "${url}"`)
}

export function attachInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use(async (config) => {
    if (isTokenCreateRequest(config)) return config

    const serviceKey = resolveServiceKey(config)
    const token = await ensureToken(serviceKey)
    config.headers.set('token', token)
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<TokenCreateResponse>) => {
      if (error instanceof AppError) return Promise.reject(error)

      if (!error.response) {
        logger.error('[interceptors] network error', error)
        return Promise.reject(new AppError('network', 'Unable to connect to API server.'))
      }

      if (error.response.status === 401) {
        try {
          if (error.config) clearToken(resolveServiceKey(error.config))
        } catch {
          // request URL didn't match a known service — nothing cached to clear
        }
        logger.error('[interceptors] auth rejected, token cleared', error.response.data)
        return Promise.reject(new AppError('auth', 'Authentication failed.'))
      }

      const exception = error.response.data?.exception
      if (exception) {
        logger.error('[interceptors] api exception', exception)
        return Promise.reject(new AppError('api', exception))
      }

      return Promise.reject(error)
    }
  )
}
