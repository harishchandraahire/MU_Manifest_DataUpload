import type { UploadLogEntry } from '../types/upload.types'

function formatLine(entry: UploadLogEntry): string {
  const range = `records ${entry.rangeStart}-${entry.rangeEnd} (${entry.recordCount})`
  const duration = entry.durationMs != null ? ` in ${entry.durationMs}ms` : ''
  const statusLabel = entry.status === 'success' ? 'SUCCESS' : entry.status === 'error' ? 'ERROR' : 'PENDING'
  const detail = entry.message ? ` — ${entry.message}` : ''
  return `[${entry.timestamp}] chunk ${entry.chunkIndex}/${entry.totalChunks} · ${range} · ${statusLabel}${duration}${detail}`
}

/** Downloads the upload log as a plain-text .log file, one line per chunk attempt. */
export function downloadUploadLog(entries: UploadLogEntry[], filename = 'upload-log.log'): void {
  const lines = entries.map(formatLine)
  const content = lines.length ? lines.join('\n') : 'No upload attempts logged.'

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
