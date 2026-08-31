// Column schema for the Mail America manifest file, derived from the client-provided
// templates (MANIFEST_M_062_1.csv / MANIFEST_M_063.csv). Source files use ";"
// as the delimiter and carry a header row with these exact column names.

export const MAILAMERICA_DELIMITER = ';'

// order matters: this drives the preview table column order too
export const MAILAMERICA_COLUMNS = [
  {
    key: 'EPBarcode',
    label: 'EP Barcode',
    required: true,
    validate: (value, ctx) => {
      if (!value) return 'Barcode is required'
      if (!/^[A-Z0-9]{6,20}$/i.test(value)) return 'Barcode format looks invalid'
      if (ctx.duplicateBarcodes.has(value)) return 'Duplicate barcode in this file'
      return null
    },
  },
  { key: 'SenderName', label: 'Sender Name', required: true },
  { key: 'SenderAddress', label: 'Sender Address', required: true },
  {
    key: 'SenderZipCode',
    label: 'Sender Zip',
    required: true,
    validate: (value) => (!value ? 'Sender zip is required' : null),
  },
  { key: 'SenderCity', label: 'Sender City', required: true },
  {
    key: 'Sender Country',
    label: 'Sender Country',
    required: true,
    validate: (value) => {
      if (!value) return 'Sender country is required'
      if (!/^[A-Z]{2}$/i.test(value.trim())) return 'Expected a 2-letter country code'
      return null
    },
  },
  { key: 'Sender Mobile Phone', label: 'Sender Mobile', required: false },
  {
    key: 'Shipper Email',
    label: 'Shipper Email',
    required: false,
    validate: (value) => {
      if (!value) return null
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : 'Invalid email format'
    },
  },
  { key: 'ReceipientName', label: 'Recipient Name', required: true },
  { key: 'ReceipientAddress', label: 'Recipient Address', required: true },
  { key: 'ReceipientCity', label: 'Recipient City', required: true },
  {
    key: 'ReceipientZipCode',
    label: 'Recipient Zip',
    required: true,
    validate: (value) => (!value ? 'Recipient zip is required' : null),
  },
  {
    key: 'ReceipientMobile',
    label: 'Recipient Mobile',
    required: true,
    validate: (value) => {
      if (!value) return 'Recipient mobile is required'
      const digits = value.replace(/[^0-9]/g, '')
      return digits.length >= 5 ? null : 'Recipient mobile looks too short'
    },
  },
  {
    key: 'ReceipientEmail',
    label: 'Recipient Email',
    required: false,
    validate: (value) => {
      if (!value || value.trim() === '0') return null
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : 'Invalid email format'
    },
  },
]

export const MAILAMERICA_EXPECTED_HEADERS = MAILAMERICA_COLUMNS.map((c) => c.key)
