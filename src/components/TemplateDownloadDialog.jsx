import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function TemplateDownloadDialog({ open, serviceName, onConfirm, onCancel }) {
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
            aria-labelledby="confirm-template-download-title"
          >
            <h2 id="confirm-template-download-title" className="modal-title">
              Download template
            </h2>
            <p className="modal-body-text">
              Do you want to download the {serviceName} manifest template?
            </p>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onCancel}>
                No
              </button>
              <button type="button" className="btn-primary" onClick={onConfirm} autoFocus>
                Yes, download
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
