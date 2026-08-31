import { motion } from 'framer-motion'
import { downloadCsv } from '../utils/toCsv'

const RESULT_COLUMNS = [
  { key: 'itemCode', label: 'Item Code' },
  { key: 'statusDesc', label: 'Status' },
  { key: 'remark', label: 'Remark' },
]

export default function UploadSuccessScreen({ uploadResult, onUploadAnother, onBackToServices }) {
  const results = uploadResult.results || []
  const failed = results.filter((r) => String(r.statusCode) !== '1')
  const succeeded = results.length - failed.length

  return (
    <motion.div
      className="success-screen"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="success-icon">✓</div>
      <h2 className="success-title">Upload completed successfully</h2>
      <p className="success-subtitle">{uploadResult.message}</p>

      <dl className="confirm-summary success-summary">
        <div>
          <dt>Records processed</dt>
          <dd>{results.length}</dd>
        </div>
        <div>
          <dt>Uploaded</dt>
          <dd className="text-emerald-600 dark:text-emerald-400">{succeeded}</dd>
        </div>
        <div>
          <dt>Failed</dt>
          <dd className="text-red-600 dark:text-red-400">{failed.length}</dd>
        </div>
      </dl>

      {failed.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] text-left">
          <table className="min-w-full divide-y divide-[var(--border)] text-left text-sm">
            <thead className="bg-[var(--surface-soft)]">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-[var(--text-muted)]">Item Code</th>
                <th className="px-3 py-2 text-left font-medium text-[var(--text-muted)]">Status</th>
                <th className="px-3 py-2 text-left font-medium text-[var(--text-muted)]">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
              {failed.map((r, i) => (
                <tr key={`${r.itemCode}-${i}`}>
                  <td className="px-3 py-2 text-left text-[var(--text)]">{r.itemCode}</td>
                  <td className="px-3 py-2 text-left text-red-600">{r.statusDesc || 'failed'}</td>
                  <td className="px-3 py-2 text-left text-[var(--text-muted)]">{r.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="modal-actions mt-6 justify-start">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => downloadCsv('upload-report.csv', RESULT_COLUMNS, results)}
          disabled={!results.length}
        >
          Download Report
        </button>
        <button type="button" className="btn-secondary" onClick={onUploadAnother}>
          Upload Another File
        </button>
        <button type="button" className="btn-primary" onClick={onBackToServices}>
          Go To Dashboard
        </button>
      </div>
    </motion.div>
  )
}
