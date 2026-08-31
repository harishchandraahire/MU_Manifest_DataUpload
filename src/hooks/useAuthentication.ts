import { useMutation } from '@tanstack/react-query'
import { ensureToken } from '../services/tokenService'

/** Exposes token acquisition as its own mutation, mainly so useUploadTracking
 * can await it as a distinct step before uploading (and so the UI could surface
 * a separate "Authenticating…" state later if ever needed). */
export function useEnsureToken() {
  return useMutation({
    mutationFn: ensureToken,
    retry: 0,
  })
}
