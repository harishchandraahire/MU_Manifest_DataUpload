// Central registry of logistics services supported by the upload SPA.

export const SERVICES = [
  {
    key: 'mailamerica',
    name: 'Mail America',
    serviceCode: '161',
    description: 'Upload the Mail America manifest (EPBarcode / sender / recipient details).',
    enabled: true,
  },
  {
    key: 'skynet',
    name: 'Skynet',
    serviceCode: '168',
    description: 'Upload the Skynet manifest (waybill / shipper / consignee details).',
    enabled: true,
  },
]

export function getServiceByKey(key) {
  return SERVICES.find((s) => s.key === key)
}
