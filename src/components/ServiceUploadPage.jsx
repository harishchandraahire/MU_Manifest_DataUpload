import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import FileDropZone from './FileDropZone'
import DataGrid from './DataGrid'
import UploadStepper from './UploadStepper'
import ValidationSummary from './ValidationSummary'
import InvalidRecordsPanel from './InvalidRecordsPanel'
import RowDetailsModal from './RowDetailsModal'
import ConfirmationDialog from './ConfirmationDialog'
import UploadProgressDialog from './UploadProgressDialog'
import UploadSuccessScreen from './UploadSuccessScreen'
import UploadLogPanel from './UploadLogPanel'
import { parseFile } from '../utils/parseFile'
import { validateRecords, checkHeaders, revalidateRow } from '../utils/validateRecords'
import { toMailAmericaApiItem, toSkynetApiItem } from '../services/uploadService'
import { useUploadTracking } from '../hooks/useUploadTracking'
import { MAILAMERICA_COLUMNS, MAILAMERICA_EXPECTED_HEADERS, MAILAMERICA_DELIMITER } from '../config/mailAmericaSchema'
import { SKYNET_COLUMNS, SKYNET_EXPECTED_HEADERS, SKYNET_DELIMITER } from '../config/skynetSchema'

// Registry mapping service key -> its column schema.
const SCHEMAS = {
  mailamerica: {
    columns: MAILAMERICA_COLUMNS,
    expectedHeaders: MAILAMERICA_EXPECTED_HEADERS,
    delimiter: MAILAMERICA_DELIMITER,
    toApiItem: toMailAmericaApiItem,
  },
  skynet: {
    columns: SKYNET_COLUMNS,
    expectedHeaders: SKYNET_EXPECTED_HEADERS,
    delimiter: SKYNET_DELIMITER,
    toApiItem: toSkynetApiItem,
  },
}

export default function ServiceUploadPage({ service, onBack, theme = 'light' }) {
  const schema = SCHEMAS[service.key]

  const [fileName, setFileName] = useState('')
  const [parseError, setParseError] = useState('')
  const [validated, setValidated] = useState(null) // { records, summary }
  const [isParsing, setIsParsing] = useState(false)
  const [removedRowNumbers, setRemovedRowNumbers] = useState(() => new Set())
  const [invalidPanelOpen, setInvalidPanelOpen] = useState(false)
  const [detailsRecord, setDetailsRecord] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const uploadMutation = useUploadTracking(service.key)

  const activeRecords = useMemo(
    () => (validated ? validated.records.filter((r) => !removedRowNumbers.has(r.rowNumber)) : []),
    [validated, removedRowNumbers]
  )

  const summary = useMemo(() => {
    const total = activeRecords.length
    const valid = activeRecords.filter((r) => r.isValid).length
    return { total, valid, invalid: total - valid }
  }, [activeRecords])

  const validRecords = useMemo(() => activeRecords.filter((r) => r.isValid), [activeRecords])
  const invalidRecords = useMemo(() => activeRecords.filter((r) => !r.isValid), [activeRecords])

  const currentStep = !validated ? 'Upload' : uploadMutation.data ? 'Submit' : 'Review'

  async function handleFileSelected(file) {
    setParseError('')
    uploadMutation.reset()
    setValidated(null)
    setRemovedRowNumbers(new Set())
    setFileName(file.name)
    setIsParsing(true)

    try {
      const { headers, rows } = await parseFile(file, { delimiter: schema.delimiter })

      const headerCheck = checkHeaders(headers, schema.expectedHeaders)
      if (!headerCheck.ok) {
        setParseError(
          `This file doesn't match the ${service.name} template. Missing column(s): ${headerCheck.missing.join(', ')}`
        )
        setIsParsing(false)
        return
      }

      if (!rows.length) {
        setParseError('No data rows were found in this file.')
        setIsParsing(false)
        return
      }

      const result = validateRecords(rows, schema.columns)
      setValidated(result)
    } catch (err) {
      setParseError(err.message || 'Failed to read this file.')
    } finally {
      setIsParsing(false)
    }
  }

  function handleUpload() {
    if (!validRecords.length) return
    const payload = validRecords.map((r) => schema.toApiItem(r.data))
    uploadMutation.mutate(payload)
  }

  function resetFile() {
    setFileName('')
    setValidated(null)
    setParseError('')
    setRemovedRowNumbers(new Set())
    uploadMutation.reset()
  }

  function handleRemoveRow(rowNumber) {
    setRemovedRowNumbers((prev) => new Set(prev).add(rowNumber))
  }

  function handleBulkRemove(rowNumbers) {
    setRemovedRowNumbers((prev) => {
      const next = new Set(prev)
      rowNumbers.forEach((n) => next.add(n))
      return next
    })
  }

  function handleRevalidate(rowNumber, values) {
    const updated = revalidateRow(values, schema.columns, activeRecords)
    setValidated((prev) => ({
      ...prev,
      records: prev.records.map((r) => (r.rowNumber === rowNumber ? { ...r, ...updated } : r)),
    }))
  }

  return (
    <div className={`theme-panel ${theme === 'dark' ? 'theme-panel-dark' : 'theme-panel-light'} mx-auto max-w-6xl px-6 py-10`}>
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to services
      </button>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">{service.name} — Tracking Data Upload</h1>
          {service.serviceCode && (
            <p className="text-sm text-[var(--text-muted)]">Service Code: {service.serviceCode}</p>
          )}
        </div>
        {validated && !uploadMutation.data && (
          <button
            type="button"
            onClick={resetFile}
            className="rounded-md border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-1.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-soft)]"
          >
            Choose a different file
          </button>
        )}
      </div>

      <UploadStepper currentStep={currentStep} />

      {!validated && (
        <div className="mt-6">
          <FileDropZone
            onFileSelected={handleFileSelected}
            fileName={isParsing ? 'Reading file…' : fileName}
            theme={theme}
          />
        </div>
      )}

      {parseError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {parseError}
        </div>
      )}

      {validated && !uploadMutation.data && (
        <div className="mt-6 space-y-4">
          <ValidationSummary
            total={summary.total}
            valid={summary.valid}
            invalid={summary.invalid}
            onInvalidClick={() => setInvalidPanelOpen(true)}
          />
          <p className="text-sm text-[var(--text-muted)]">from {fileName}</p>

          <DataGrid columns={schema.columns} records={activeRecords} onRowClick={setDetailsRecord} />

          {uploadMutation.error && (
            <div className="space-y-3">
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {uploadMutation.error.message || 'Upload failed.'}
              </div>
              <UploadLogPanel entries={uploadMutation.log} defaultOpen />
            </div>
          )}

          <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <p className="text-sm text-[var(--text-muted)]">
              {uploadMutation.error
                ? `Clicking Upload again will resend all ${validRecords.length} valid record(s) from the start — this does not retry automatically. Check the log above and your database for the chunks already marked successful before resending, to avoid duplicates.`
                : summary.invalid > 0
                  ? `Only the ${summary.valid} valid record(s) will be uploaded. Fix the source file and re-upload to include the rest.`
                  : `All ${summary.valid} record(s) passed validation.`}
            </p>
            <button
              type="button"
              disabled={!validRecords.length || uploadMutation.isPending}
              onClick={() => setConfirmOpen(true)}
              className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Upload {validRecords.length} record(s)
            </button>
          </div>
        </div>
      )}

      {uploadMutation.data && (
        <div className="mt-6 space-y-3">
          <UploadSuccessScreen
            uploadResult={uploadMutation.data}
            onUploadAnother={resetFile}
            onBackToServices={onBack}
          />
          <UploadLogPanel entries={uploadMutation.log} />
        </div>
      )}

      <InvalidRecordsPanel
        open={invalidPanelOpen}
        records={invalidRecords}
        columns={schema.columns}
        onClose={() => setInvalidPanelOpen(false)}
        onViewDetails={setDetailsRecord}
        onRemove={handleRemoveRow}
        onBulkRemove={handleBulkRemove}
        onRevalidate={handleRevalidate}
      />

      <RowDetailsModal record={detailsRecord} columns={schema.columns} onClose={() => setDetailsRecord(null)} />

      <ConfirmationDialog
        open={confirmOpen}
        total={summary.total}
        valid={summary.valid}
        invalid={summary.invalid}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          handleUpload()
        }}
      />

      <AnimatePresence>
        {uploadMutation.isPending && (
          <UploadProgressDialog
            total={validRecords.length}
            progress={uploadMutation.progress}
            log={uploadMutation.log}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
