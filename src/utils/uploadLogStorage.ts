import type { UploadLogEntry } from '../types/upload.types'

const STORAGE_KEY = 'tracking-upload-log'

/** Persisted so the log survives a page reload/crash — the scenario that
 * actually matters here: a request can error out client-side (timeout,
 * dropped connection) while the backend keeps processing and completes
 * successfully. The log is the only record of what was actually sent. */
export function saveUploadLog(entries: UploadLogEntry[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // localStorage full/unavailable — log stays in memory for this session only.
  }
}

export function loadUploadLog(): UploadLogEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as UploadLogEntry[]) : []
  } catch {
    return []
  }
}

export function clearUploadLog(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
