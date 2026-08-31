export interface MailAmericaParty {
  name: string
  address: string
  city: string
  postCode: string
  mobileNumber?: string
  emailAddress?: string
}

export interface MailAmericaApiItem {
  itemCode: string
  originCountry: string
  sender: MailAmericaParty
  receiver: MailAmericaParty
}

export interface SkynetShipper {
  company: string
  address1: string
  address2?: string
  address3?: string
  city?: string
  postalCode?: string
  country: string
  phone?: string
  mobile?: string
  email?: string
}

export interface SkynetConsignee {
  name: string
  address1: string
  address2?: string
  address3?: string
  city?: string
  postalCode?: string
  phone?: string
  mobile?: string
  email?: string
}

export interface SkynetApiItem {
  waybillNumber: string
  weight: number
  weightUnit?: string
  totalValue?: number
  citizenId?: string
  shipper: SkynetShipper
  consignee: SkynetConsignee
}

/** Each service maps its own CSV/xlsx rows to its own upload endpoint's item
 * shape — uploadTrackingRecords/UPLOADERS only forward the array along, so
 * they stay untyped at this boundary rather than forcing one shape on all
 * services. */
export type UploadApiItem = Record<string, unknown>

export interface UploadResultItem {
  itemCode: string
  statusCode: number | string
  statusDesc: string
  remark: string
}

export interface UploadApiResponse {
  statusCode: number
  exception: string | null
  userMessage: string
  result: UploadResultItem[]
}

/** UI-facing normalized shape — matches what ServiceUploadPage/UploadSuccessScreen already consume. */
export interface UploadResult {
  message: string
  results: UploadResultItem[]
}

export interface UploadChunkProgress {
  completedChunks: number
  totalChunks: number
  uploadedCount: number
  totalCount: number
}

export type UploadProgressCallback = (progress: UploadChunkProgress) => void

export type UploadLogStatus = 'pending' | 'success' | 'error'

export interface UploadLogEntry {
  attempt: number
  chunkIndex: number
  totalChunks: number
  rangeStart: number
  rangeEnd: number
  recordCount: number
  status: UploadLogStatus
  timestamp: string
  message?: string
  durationMs?: number
}

/** uploadService doesn't know about retry/attempt numbering — that's assigned
 * by the caller (useUploadTracking), which is what actually decides to retry. */
export type UploadLogCallback = (entry: Omit<UploadLogEntry, 'attempt'>) => void
