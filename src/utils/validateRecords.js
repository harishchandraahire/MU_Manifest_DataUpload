/**
 * Runs a column schema (see config/mailAmericaSchema.js) against parsed rows.
 * Returns each row annotated with per-field errors plus a summary.
 */
function buildDuplicateBarcodeContext(rows) {
  const barcodeCounts = new Map()
  rows.forEach((row) => {
    const val = (row.EPBarcode || '').trim()
    if (!val) return
    barcodeCounts.set(val, (barcodeCounts.get(val) || 0) + 1)
  })
  const duplicateBarcodes = new Set(
    [...barcodeCounts.entries()].filter(([, count]) => count > 1).map(([val]) => val)
  )
  return { duplicateBarcodes }
}

function validateRow(row, columns, ctx) {
  const fieldErrors = {}

  columns.forEach((col) => {
    const raw = row[col.key]
    const value = typeof raw === 'string' ? raw.trim() : raw

    if (col.required && (value === undefined || value === null || value === '')) {
      fieldErrors[col.key] = `${col.label} is required`
      return
    }

    if (typeof col.validate === 'function') {
      const err = col.validate(value, ctx)
      if (err) fieldErrors[col.key] = err
    }
  })

  return fieldErrors
}

export function validateRecords(rows, columns) {
  const ctx = buildDuplicateBarcodeContext(rows)

  let validCount = 0
  let invalidCount = 0

  const validated = rows.map((row, index) => {
    const fieldErrors = validateRow(row, columns, ctx)
    const isValid = Object.keys(fieldErrors).length === 0
    if (isValid) validCount += 1
    else invalidCount += 1

    return {
      rowNumber: index + 1,
      data: row,
      fieldErrors,
      isValid,
    }
  })

  return {
    records: validated,
    summary: {
      total: rows.length,
      valid: validCount,
      invalid: invalidCount,
    },
  }
}

/**
 * Re-runs validation for a single edited row against the full current record
 * set (so duplicate-barcode checks stay accurate). Returns the same shape as
 * one entry of `validateRecords(...).records`.
 */
export function revalidateRow(rowData, columns, allRecords) {
  const ctx = buildDuplicateBarcodeContext(allRecords.map((r) => r.data))
  const fieldErrors = validateRow(rowData, columns, ctx)
  return {
    data: rowData,
    fieldErrors,
    isValid: Object.keys(fieldErrors).length === 0,
  }
}

/** Confirms the uploaded file actually has the columns the schema expects. */
export function checkHeaders(headers, expectedHeaders) {
  const normalizedFound = new Set(headers.map((h) => h.trim()))
  const missing = expectedHeaders.filter((h) => !normalizedFound.has(h))
  return { ok: missing.length === 0, missing }
}
