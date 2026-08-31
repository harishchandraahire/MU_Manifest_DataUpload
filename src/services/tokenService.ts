import { createToken } from '../api/authApi'
import { logger } from '../utils/logger'

const sessionTokenKey = (serviceKey: string) => `${serviceKey}-auth-token`

const inMemoryTokens = new Map<string, string>()
/** Shared per-service by concurrent callers so a cache miss only triggers one token/create call. */
const inFlightTokenPromises = new Map<string, Promise<string>>()

export function getToken(serviceKey: string): string | null {
  const cached = inMemoryTokens.get(serviceKey)
  if (cached) return cached
  const stored = window.sessionStorage.getItem(sessionTokenKey(serviceKey))
  if (stored) {
    inMemoryTokens.set(serviceKey, stored)
    return stored
  }
  return null
}

export function setToken(serviceKey: string, token: string): void {
  inMemoryTokens.set(serviceKey, token)
  window.sessionStorage.setItem(sessionTokenKey(serviceKey), token)
  logger.debug(`[tokenService] token cached for ${serviceKey}`)
}

export function clearToken(serviceKey: string): void {
  inMemoryTokens.delete(serviceKey)
  window.sessionStorage.removeItem(sessionTokenKey(serviceKey))
  logger.debug(`[tokenService] token cleared for ${serviceKey}`)
}

/** Returns the cached token for this service, or requests one — sharing a
 * single in-flight request per service across concurrent callers so a cache
 * miss never fires more than one token/create call at a time. */
export async function ensureToken(serviceKey: string): Promise<string> {
  const cached = getToken(serviceKey)
  if (cached) return cached

  const inFlight = inFlightTokenPromises.get(serviceKey)
  if (inFlight) return inFlight

  const promise = createToken(serviceKey)
    .then((token) => {
      setToken(serviceKey, token)
      return token
    })
    .finally(() => {
      inFlightTokenPromises.delete(serviceKey)
    })

  inFlightTokenPromises.set(serviceKey, promise)
  return promise
}
