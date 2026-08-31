import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { downloadCsv } from '../utils/toCsv'

function EditableRow({ record, columns, onCancel, onSave }) {
  const [values, setValues] = useState(() => ({ ...record.data }))

  return (
    <div className="invalid-row-edit">
      {columns
        .filter((col) => record.fieldErrors[col.key])
        .map((col) => (
          <label key={col.key} className="invalid-row-edit-field">
            <span>{col.label}</span>
            <input
              type="text"
              value={values[col.key] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [col.key]: e.target.value }))}
            />
          </label>
        ))}
      <div className="modal-actions justify-start">
        <button type="button" className="btn-secondary btn-sm" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn-primary btn-sm" onClick={() => onSave(values)}>
          Save &amp; Revalidate
        </button>
      </div>
    </div>
  )
}

export default function InvalidRecordsPanel({
  open,
  records,
  columns,
  onClose,
  onViewDetails,
  onRemove,
  onBulkRemove,
  onRevalidate,
}) {
  const [selected, setSelected] = useState(() => new Set())
  const [editingRow, setEditingRow] = useState(null)

  function toggleSelected(rowNumber) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(rowNumber)) next.delete(rowNumber)
      else next.add(rowNumber)
      return next
    })
  }

  function handleBulkRemove() {
    onBulkRemove([...selected])
    setSelected(new Set())
  }

  function exportInvalidRecords() {
    const exportColumns = [{ key: 'rowNumber', label: 'Row #' }, ...columns]
    downloadCsv(
      'invalid-records.csv',
      exportColumns,
      records.map((r) => ({ rowNumber: r.rowNumber, ...r.data }))
    )
  }

  function downloadErrorReport() {
    downloadCsv(
      'invalid-records-errors.csv',
      [
        { key: 'rowNumber', label: 'Row #' },
        { key: 'EPBarcode', label: 'Barcode' },
        { key: 'errors', label: 'Validation Error' },
      ],
      records.map((r) => ({
        rowNumber: r.rowNumber,
        EPBarcode: r.data.EPBarcode,
        errors: Object.values(r.fieldErrors).join('; '),
      }))
    )
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="drawer-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="invalid-records-title"
          >
            <div className="drawer-header">
              <h2 id="invalid-records-title" className="modal-title">
                Invalid records ({records.length})
              </h2>
              <button type="button" className="btn-secondary btn-sm" onClick={onClose} aria-label="Close panel">
                ✕
              </button>
            </div>

            <div className="drawer-toolbar">
              <button type="button" className="btn-secondary btn-sm" onClick={exportInvalidRecords} disabled={!records.length}>
                Export Invalid Records
              </button>
              <button type="button" className="btn-secondary btn-sm" onClick={downloadErrorReport} disabled={!records.length}>
                Download Error Report
              </button>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={handleBulkRemove}
                disabled={selected.size === 0}
              >
                Remove Selected ({selected.size})
              </button>
            </div>

            <div className="drawer-body">
              {records.length === 0 && <p className="text-sm text-[var(--text-muted)]">No invalid records.</p>}
              {records.map((record) => (
                <div key={record.rowNumber} className="invalid-row-card">
                  <div className="invalid-row-card-header">
                    <input
                      type="checkbox"
                      checked={selected.has(record.rowNumber)}
                      onChange={() => toggleSelected(record.rowNumber)}
                      aria-label={`Select row ${record.rowNumber}`}
                    />
                    <span className="font-medium text-[var(--text)]">
                      Row {record.rowNumber} · {record.data.EPBarcode || 'no barcode'}
                    </span>
                  </div>
                  <ul className="invalid-row-errors">
                    {Object.entries(record.fieldErrors).map(([key, message]) => (
                      <li key={key}>{message}</li>
                    ))}
                  </ul>

                  {editingRow === record.rowNumber ? (
                    <EditableRow
                      record={record}
                      columns={columns}
                      onCancel={() => setEditingRow(null)}
                      onSave={(values) => {
                        onRevalidate(record.rowNumber, values)
                        setEditingRow(null)
                      }}
                    />
                  ) : (
                    <div className="invalid-row-actions">
                      <button type="button" className="btn-secondary btn-sm" onClick={() => onViewDetails(record)}>
                        View Details
                      </button>
                      <button type="button" className="btn-secondary btn-sm" onClick={() => setEditingRow(record.rowNumber)}>
                        Edit
                      </button>
                      <button type="button" className="btn-secondary btn-sm" onClick={() => onRemove(record.rowNumber)}>
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
