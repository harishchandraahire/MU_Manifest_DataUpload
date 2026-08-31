import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function ConfirmationDialog({ open, total, valid, invalid, onConfirm, onCancel }) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="modal-panel modal-panel-sm"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-upload-title"
          >
            <h2 id="confirm-upload-title" className="modal-title">
              Confirm upload
            </h2>
            <p className="modal-body-text">Are you sure you want to upload these records?</p>

            <dl className="confirm-summary">
              <div>
                <dt>Total records</dt>
                <dd>{total}</dd>
              </div>
              <div>
                <dt>Valid records</dt>
                <dd className="text-emerald-600 dark:text-emerald-400">{valid}</dd>
              </div>
              <div>
                <dt>Invalid records</dt>
                <dd className="text-red-600 dark:text-red-400">{invalid}</dd>
              </div>
            </dl>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={onConfirm} autoFocus>
                Upload {valid} record(s)
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
