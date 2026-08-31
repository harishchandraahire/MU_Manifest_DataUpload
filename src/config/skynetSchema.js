// Column schema for the Skynet manifest file, derived from the client-provided
// template (MRU Manifest 065.xlsx) and matched against the tested
// postDataUploadBySkynet endpoint / Ins_Track_Skynet_Items_Data stored proc.

export const SKYNET_DELIMITER = ','

const isBlank = (value) => value === undefined || value === null || String(value).trim() === ''
const isEmailValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

// order matters: this drives the preview table column order too
export const SKYNET_COLUMNS = [
  {
    key: 'Waybill Number',
    label: 'Waybill Number',
    required: true,
    validate: (value) => (isBlank(value) ? 'Waybill number should not be blank' : null),
  },
  { key: 'Consignee Name', label: 'Consignee Name', required: true },
  { key: 'ParcelType', label: 'Parcel Type', required: false },
  { key: 'Currency', label: 'Currency', required: false },
  {
    key: 'Total Value',
    label: 'Total Value',
    required: false,
    validate: (value) => {
      if (isBlank(value)) return null
      return Number.isFinite(Number(value)) ? null : 'Total value should be numeric'
    },
  },
  { key: 'Description of Goods', label: 'Description of Goods', required: false },
  { key: 'FreightType', label: 'Freight Type', required: false },
  { key: 'Quantity', label: 'Quantity', required: false },
  {
    key: 'Weight',
    label: 'Weight',
    required: true,
    validate: (value) => {
      if (isBlank(value)) return 'Weight should be numeric'
      const num = Number(value)
      if (!Number.isFinite(num)) return 'Weight should be numeric'
      return num > 0 ? null : 'Weight should be greater than 0'
    },
  },
  { key: 'WeightUnit', label: 'Weight Unit', required: false },
  { key: 'ChargeableWeight', label: 'Chargeable Weight', required: false },
  { key: 'Volume', label: 'Volume', required: false },
  { key: 'Remarks', label: 'Remarks', required: false },
  {
    key: 'Shipper Company',
    label: 'Shipper Company',
    required: true,
    validate: (value) => (isBlank(value) ? 'Shipper company should not be blank' : null),
  },
  {
    key: 'Shipper Address',
    label: 'Shipper Address',
    required: true,
    validate: (value) => (isBlank(value) ? 'Shipper address should not be blank' : null),
  },
  { key: 'ShipperAddress2', label: 'Shipper Address 2', required: false },
  { key: 'ShipperAddress3', label: 'Shipper Address 3', required: false },
  { key: 'ShipperPostalCode', label: 'Shipper Postal Code', required: false },
  { key: 'Shipper City', label: 'Shipper City', required: false },
  {
    key: 'ShipperCountry',
    label: 'Shipper Country',
    required: true,
    validate: (value) => (isBlank(value) ? 'Shipper country should not be blank' : null),
  },
  { key: 'ShipperPhone', label: 'Shipper Phone', required: false },
  { key: 'ShipperMobile', label: 'Shipper Mobile', required: false },
  {
    key: 'ShipperEmail',
    label: 'Shipper Email',
    required: false,
    validate: (value) => (isBlank(value) || isEmailValid(value) ? null : 'Invalid email format'),
  },
  { key: 'Consignee First Name', label: 'Consignee First Name', required: false },
  {
    key: 'Consignee Address',
    label: 'Consignee Address',
    required: true,
    validate: (value) => (isBlank(value) ? 'Consignee address should not be blank' : null),
  },
  { key: 'ConsigneeAddress2', label: 'Consignee Address 2', required: false },
  { key: 'ConsigneeAddress3', label: 'Consignee Address 3', required: false },
  { key: 'ConsigneePostalCode', label: 'Consignee Postal Code', required: false },
  { key: 'Consignee City', label: 'Consignee City', required: false },
  { key: 'ConsigneeCountry', label: 'Consignee Country', required: false },
  { key: 'ConsigneePhone', label: 'Consignee Phone', required: false },
  { key: 'Consignee Mobile', label: 'Consignee Mobile', required: false },
  {
    key: 'Consignee -email',
    label: 'Consignee Email',
    required: false,
    validate: (value) => (isBlank(value) || isEmailValid(value) ? null : 'Invalid email format'),
  },
  { key: 'CitizenId', label: 'Citizen Id', required: false },
]

export const SKYNET_EXPECTED_HEADERS = SKYNET_COLUMNS.map((c) => c.key)
