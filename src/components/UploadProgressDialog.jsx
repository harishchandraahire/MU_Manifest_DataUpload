import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import UploadLogList from './UploadLogList'

/**
 * Driven by real per-chunk progress (see useUploadTracking/uploadService) —
 * large uploads are split into sequential chunks, so this reflects actual
 * completed/total chunks and records rather than a simulated timer. The log
 * list makes each chunk request visible as it happens, since a client-side
 * error later doesn't necessarily mean earlier (or even that) chunk didn't
 * reach the server.
 *
 * Mount-gated by the caller (only rendered while the upload is pending), so
 * each open cycle gets a fresh mount.
 */
export default function UploadProgressDialog({ total, progress, log = [] }) {
  const totalChunks = progress?.totalChunks ?? 0
  const completedChunks = progress?.completedChunks ?? 0
  const uploadedCount = progress?.uploadedCount ?? 0
  const percent = totalChunks > 0 ? Math.round((completedChunks / totalChunks) * 100) : 0

  return createPortal(
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal-panel modal-panel-sm"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        role="alertdialog"
        aria-busy="true"
        aria-labelledby="upload-progress-title"
      >
        <h2 id="upload-progress-title" className="modal-title">
          Uploading records…
        </h2>
        <p className="modal-body-text">
          {totalChunks > 1
            ? `Chunk ${Math.min(completedChunks + 1, totalChunks)} of ${totalChunks} · ${uploadedCount} of ${total} record(s) sent`
            : `Sending ${total} record(s) to the logistics service.`}
        </p>

        <div className="loading-progress-track mt-4">
          <motion.div
            className="loading-progress-bar"
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
        </div>
        <p className="mt-2 text-right text-xs text-[var(--text-muted)]">
          {uploadedCount} / {total} · {percent}%
        </p>

        {totalChunks > 1 && (
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-medium text-[var(--text-muted)]">Chunk log</p>
            <UploadLogList entries={log} maxHeight={160} />
          </div>
        )}
      </motion.div>
    </motion.div>,
    document.body
  )
}
