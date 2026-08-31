import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function RowDetailsModal({ record, columns, onClose }) {
  return createPortal(
    <AnimatePresence>
      {record && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-panel"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="row-details-title"
          >
            <div className="modal-header">
              <h2 id="row-details-title" className="modal-title">
                Row {record.rowNumber} details
              </h2>
              <span className={record.isValid ? 'pill pill-emerald' : 'pill pill-red'}>
                {record.isValid ? 'Valid' : `${Object.keys(record.fieldErrors).length} error(s)`}
              </span>
            </div>

            <dl className="row-detail-list">
              {columns.map((col) => {
                const error = record.fieldErrors[col.key]
                return (
                  <div key={col.key} className="row-detail-item">
                    <dt>{col.label}</dt>
                    <dd className={error ? 'text-red-600 dark:text-red-400' : ''}>
                      {String(record.data[col.key] ?? '') || '—'}
                      {error && <span className="row-detail-error">{error}</span>}
                    </dd>
                  </div>
                )
              })}
            </dl>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
