import { useCallback, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ensureToken } from '../services/tokenService'
import { uploadTrackingRecords } from '../services/uploadService'
import { AppError } from '../api/apiError'
import { saveUploadLog, loadUploadLog, clearUploadLog } from '../utils/uploadLogStorage'
import type { UploadApiItem, UploadResult, UploadChunkProgress, UploadLogEntry } from '../types/upload.types'

const INITIAL_PROGRESS: UploadChunkProgress = {
  completedChunks: 0,
  totalChunks: 0,
  uploadedCount: 0,
  totalCount: 0,
}

/** Mutation for the full "authenticate then upload" flow for one service.
 * Returned mutation shape (isPending/data/error/mutate/reset) matches what
 * ServiceUploadPage already destructures from its previous inline useMutation,
 * plus a live `progress` value and a per-chunk `log` (persisted to
 * localStorage so it survives a reload/crash mid-upload).
 *
 * IMPORTANT: no automatic retry. A chunk that times out client-side may have
 * already been written by the backend (see uploadService's network-error
 * note) — blindly retrying the whole upload would resend already-processed
 * chunks and risks duplicate records, since we have no way to confirm what
 * the server actually received. Failures surface to the caller with the full
 * per-attempt log instead, so a human decides whether/what to resend. Every
 * call to `mutate()` is logged as a new "attempt" — the log accumulates
 * across attempts rather than being wiped, so a manual retry's history stays
 * visible (call `reset()` to clear it when starting a genuinely new file). */
export function useUploadTracking(serviceKey: string) {
  const [progress, setProgress] = useState<UploadChunkProgress>(INITIAL_PROGRESS)
  const [log, setLog] = useState<UploadLogEntry[]>(() => loadUploadLog())
  const logRef = useRef<UploadLogEntry[]>(log)
  const attemptRef = useRef(0)

  const appendLogEntry = useCallback((entry: Omit<UploadLogEntry, 'attempt'>) => {
    const full: UploadLogEntry = { ...entry, attempt: attemptRef.current }
    const existingIndex = logRef.current.findIndex(
      (e) => e.attempt === full.attempt && e.chunkIndex === full.chunkIndex
    )
    const next =
      existingIndex >= 0
        ? logRef.current.map((e, i) => (i === existingIndex ? full : e))
        : [...logRef.current, full]
    logRef.current = next
    saveUploadLog(next)
    setLog(next)
  }, [])

  const mutation = useMutation<UploadResult, AppError, UploadApiItem[]>({
    mutationFn: async (payload) => {
      attemptRef.current += 1
      setProgress({ ...INITIAL_PROGRESS, totalCount: payload.length })
      await ensureToken(serviceKey)
      return uploadTrackingRecords(serviceKey, payload, setProgress, appendLogEntry)
    },
    retry: false,
  })

  const reset = useCallback(() => {
    setProgress(INITIAL_PROGRESS)
    setLog([])
    logRef.current = []
    attemptRef.current = 0
    clearUploadLog()
    mutation.reset()
  }, [mutation])

  return { ...mutation, reset, progress, log }
}
