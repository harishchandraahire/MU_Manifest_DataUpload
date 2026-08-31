const STATUS_ICON = { pending: '…', success: '✓', error: '✕' }
const STATUS_CLASS = { pending: 'upload-log-pending', success: 'upload-log-success', error: 'upload-log-error' }

export default function UploadLogList({ entries, maxHeight = 220 }) {
  if (!entries.length) {
    return <p className="text-xs text-[var(--text-muted)]">No chunks sent yet.</p>
  }

  const showAttempt = entries.some((e) => e.attempt > 1)

  return (
    <ul className="upload-log-list" style={{ maxHeight }}>
      {entries.map((entry) => (
        <li key={`${entry.attempt}-${entry.chunkIndex}`} className={`upload-log-row ${STATUS_CLASS[entry.status]}`}>
          <span className="upload-log-icon">{STATUS_ICON[entry.status]}</span>
          <span className="upload-log-text">
            {showAttempt && `Attempt ${entry.attempt} · `}
            Chunk {entry.chunkIndex}/{entry.totalChunks} · records {entry.rangeStart}-{entry.rangeEnd} (
            {entry.recordCount})
            {entry.status === 'pending' && ' · sending…'}
            {entry.status === 'success' && entry.durationMs != null && ` · sent in ${entry.durationMs}ms`}
            {entry.status === 'error' && entry.message && ` · ${entry.message}`}
          </span>
        </li>
      ))}
    </ul>
  )
}
