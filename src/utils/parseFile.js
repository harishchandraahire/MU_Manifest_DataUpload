/**
 * Parses a CSV or Excel (.xlsx/.xls) file into an array of row objects
 * keyed by the header row, plus the raw header list (in file order).
 *
 * @param {File} file
 * @param {{ delimiter?: string }} [options]
 * @returns {Promise<{ headers: string[], rows: Record<string, string>[] }>}
 */
export function parseFile(file, options = {}) {
  const name = file.name.toLowerCase()

  if (name.endsWith('.csv')) {
    return parseCsv(file, options.delimiter)
  }

  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    return parseExcel(file)
  }

  return Promise.reject(new Error('Unsupported file type. Please upload a .csv or .xlsx file.'))
}

async function parseCsv(file, delimiter) {
  const { default: Papa } = await import('papaparse')
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: delimiter || '', // '' = auto-detect (falls back to , or ;)
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        if (result.errors && result.errors.length) {
          const fatal = result.errors.filter((e) => e.type !== 'FieldMismatch')
          if (fatal.length) {
            reject(new Error(fatal[0].message))
            return
          }
        }
        resolve({
          headers: result.meta.fields || [],
          rows: result.data,
        })
      },
      error: (err) => reject(err),
    })
  })
}

async function parseExcel(file) {
  const XLSX = await import('xlsx')
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read the file.'))
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[firstSheetName]
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false })
        const headers = rows.length
          ? Object.keys(rows[0])
          : (XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] || [])
        resolve({ headers, rows })
      } catch (err) {
        reject(err)
      }
    }
    reader.readAsArrayBuffer(file)
  })
}
