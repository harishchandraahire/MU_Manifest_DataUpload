// Thin service layer for the PostGlobal.APIs Logistics Controller.
//
// Mail America goes to POST {BASE_URL}/api/logst/postDataUploadByMailAmerica
// (PostDataUploadByMailAmerica action, items shaped like MailAmericaApiItem).
// Skynet goes to POST {BASE_URL}/api/logst/postDataUploadBySkynet
// (PostDataUploadBySkynet action, items shaped like SkynetApiItem). Both
// respond with Output<JArray> where result is an array of UploadResultItem
// (statusCode 1 = success).
//
// The backend writes one row per DB round-trip, sequentially, inside a single
// request/response cycle — so large files are split into chunks (size from
// VITE_UPLOAD_CHUNK_SIZE) and sent as separate sequential requests. This keeps
// each request comfortably under the client timeout and gives the UI real
// per-chunk progress instead of one opaque spinner for the whole file.
//
// IMPORTANT: a 'network' AppError means no HTTP response was ever received —
// it does NOT mean the backend didn't process the chunk. The backend has been
// observed to finish writing a chunk to the DB even after the client gave up
// waiting (timeout / dropped connection). onLog exists specifically so the UI
// can show exactly which chunks were sent and give the user something to
// cross-check against the DB before assuming data loss or re-uploading.
import { postMailAmericaUpload, postSkynetUpload } from '../api/uploadApi'
import { AppError } from '../api/apiError'
import { UPLOAD_CHUNK_SIZE } from '../config/env'
import type {
  MailAmericaApiItem,
  SkynetApiItem,
  UploadApiItem,
  UploadApiResponse,
  UploadResult,
  UploadResultItem,
  UploadProgressCallback,
  UploadLogCallback,
} from '../types/upload.types'

type TrackingRow = Record<string, string>

/** Maps one validated Mail America CSV row (raw template column names) to the API item shape. */
export function toMailAmericaApiItem(row: TrackingRow): MailAmericaApiItem {
  return {
    itemCode: row.EPBarcode,
    originCountry: row['Sender Country'],
    sender: {
      name: row.SenderName,
      address: row.SenderAddress,
      city: row.SenderCity,
      postCode: row.SenderZipCode,
      mobileNumber: row['Sender Mobile Phone'] || undefined,
      emailAddress: row['Shipper Email'] || undefined,
    },
    receiver: {
      name: row.ReceipientName,
      address: row.ReceipientAddress,
      city: row.ReceipientCity,
      postCode: row.ReceipientZipCode,
      mobileNumber: row.ReceipientMobile || undefined,
      emailAddress:
        row.ReceipientEmail && row.ReceipientEmail.trim() !== '0' ? row.ReceipientEmail : undefined,
    },
  }
}

/** Maps one validated Skynet manifest row (raw template column names, see
 * config/skynetSchema.js) to the postDataUploadBySkynet item shape. */
export function toSkynetApiItem(row: TrackingRow): SkynetApiItem {
  return {
    waybillNumber: row['Waybill Number'],
    weight: Number(row.Weight),
    weightUnit: row.WeightUnit || undefined,
    totalValue: row['Total Value'] ? Number(row['Total Value']) : undefined,
    citizenId: row.CitizenId || undefined,
    shipper: {
      company: row['Shipper Company'],
      address1: row['Shipper Address'],
      address2: row.ShipperAddress2 || undefined,
      address3: row.ShipperAddress3 || undefined,
      city: row['Shipper City'] || undefined,
      postalCode: row.ShipperPostalCode || undefined,
      country: row.ShipperCountry,
      phone: row.ShipperPhone || undefined,
      mobile: row.ShipperMobile || undefined,
      email: row.ShipperEmail || undefined,
    },
    consignee: {
      name: row['Consignee Name'],
      address1: row['Consignee Address'],
      address2: row.ConsigneeAddress2 || undefined,
      address3: row.ConsigneeAddress3 || undefined,
      city: row['Consignee City'] || undefined,
      postalCode: row.ConsigneePostalCode || undefined,
      phone: row.ConsigneePhone || undefined,
      mobile: row['Consignee Mobile'] || undefined,
      email: row['Consignee -email'] || undefined,
    },
  }
}

const UPLOADERS: Record<string, (items: UploadApiItem[]) => Promise<UploadApiResponse>> = {
  mailamerica: postMailAmericaUpload as unknown as (items: UploadApiItem[]) => Promise<UploadApiResponse>,
  skynet: postSkynetUpload as unknown as (items: UploadApiItem[]) => Promise<UploadApiResponse>,
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

function isSuccess(statusCode: number | string): boolean {
  return String(statusCode) === '1'
}

export async function uploadTrackingRecords(
  serviceKey: string,
  apiItems: UploadApiItem[],
  onProgress?: UploadProgressCallback,
  onLog?: UploadLogCallback
): Promise<UploadResult> {
  const uploader = UPLOADERS[serviceKey]
  if (!uploader) throw new AppError('upload', `No upload endpoint configured for service "${serviceKey}"`)

  const totalCount = apiItems.length
  const chunks = chunkArray(apiItems, UPLOAD_CHUNK_SIZE)
  const totalChunks = chunks.length
  const results: UploadResultItem[] = []
  let uploadedCount = 0

  onProgress?.({ completedChunks: 0, totalChunks, uploadedCount: 0, totalCount })

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const chunkIndex = i + 1
    const rangeStart = i * UPLOAD_CHUNK_SIZE + 1
    const rangeEnd = rangeStart + chunk.length - 1

    onLog?.({
      chunkIndex,
      totalChunks,
      rangeStart,
      rangeEnd,
      recordCount: chunk.length,
      status: 'pending',
      timestamp: new Date().toISOString(),
    })

    const startedAt = performance.now()
    try {
      const response = await uploader(chunk)
      const durationMs = Math.round(performance.now() - startedAt)
      results.push(...(response.result || []))
      onLog?.({
        chunkIndex,
        totalChunks,
        rangeStart,
        rangeEnd,
        recordCount: chunk.length,
        status: 'success',
        timestamp: new Date().toISOString(),
        message: response.userMessage,
        durationMs,
      })
    } catch (err) {
      const durationMs = Math.round(performance.now() - startedAt)
      const base = err instanceof AppError ? err.message : 'Tracking upload failed.'
      const networkNote =
        err instanceof AppError && err.kind === 'network'
          ? ' No response was received — this does NOT necessarily mean the server did not process it. Check the log and your database before re-uploading to avoid duplicates.'
          : ''

      onLog?.({
        chunkIndex,
        totalChunks,
        rangeStart,
        rangeEnd,
        recordCount: chunk.length,
        status: 'error',
        timestamp: new Date().toISOString(),
        message: base + networkNote,
        durationMs,
      })

      const message =
        uploadedCount > 0
          ? `${base} (${uploadedCount} of ${totalCount} records were uploaded before this failure.)${networkNote}`
          : base + networkNote
      throw new AppError(err instanceof AppError ? err.kind : 'upload', message)
    }

    uploadedCount += chunk.length
    onProgress?.({ completedChunks: chunkIndex, totalChunks, uploadedCount, totalCount })
  }

  const successCount = results.filter((r) => isSuccess(r.statusCode)).length
  const failedCount = results.length - successCount

  return {
    message: `${successCount} success and ${failedCount} failed`,
    results,
  }
}
