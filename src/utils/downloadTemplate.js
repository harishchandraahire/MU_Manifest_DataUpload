import { MAILAMERICA_EXPECTED_HEADERS } from '../config/mailAmericaSchema'
import { SKYNET_EXPECTED_HEADERS } from '../config/skynetSchema'

// Registry mapping service key -> its manifest column headers, for the
// downloadable blank template. Kept in sync with each service's schema so
// the template can never drift from what validation actually expects.
const TEMPLATE_HEADERS = {
  mailamerica: MAILAMERICA_EXPECTED_HEADERS,
  skynet: SKYNET_EXPECTED_HEADERS,
}

export async function downloadServiceTemplate(serviceKey) {
  const headers = TEMPLATE_HEADERS[serviceKey]
  if (!headers) return

  const XLSX = await import('xlsx')
  const worksheet = XLSX.utils.aoa_to_sheet([headers])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
  XLSX.writeFile(workbook, `${serviceKey}-manifest-template.xlsx`)
}
