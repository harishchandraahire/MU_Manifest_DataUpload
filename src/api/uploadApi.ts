import axiosClient from './axiosClient'
import { MAILAMERICA_UPLOAD_URL, SKYNET_UPLOAD_URL } from './endpoints'
import { AppError } from './apiError'
import { logger } from '../utils/logger'
import type { MailAmericaApiItem, SkynetApiItem, UploadApiResponse } from '../types/upload.types'

export async function postMailAmericaUpload(items: MailAmericaApiItem[]): Promise<UploadApiResponse> {
  try {
    const response = await axiosClient.post<UploadApiResponse>(MAILAMERICA_UPLOAD_URL, items)
    return response.data
  } catch (err) {
    if (err instanceof AppError) throw err
    logger.error('[uploadApi] upload request failed', err)
    throw new AppError('upload', 'Tracking upload failed.')
  }
}

export async function postSkynetUpload(items: SkynetApiItem[]): Promise<UploadApiResponse> {
  try {
    const response = await axiosClient.post<UploadApiResponse>(SKYNET_UPLOAD_URL, items)
    return response.data
  } catch (err) {
    if (err instanceof AppError) throw err
    logger.error('[uploadApi] upload request failed', err)
    throw new AppError('upload', 'Tracking upload failed.')
  }
}
