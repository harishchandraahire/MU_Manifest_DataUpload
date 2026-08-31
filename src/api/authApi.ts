import axios from 'axios'
import { TOKEN_CREATE_URL } from './endpoints'
import { AppError } from './apiError'
import { API_BASE_URL, API_CREDENTIALS } from '../config/env'
import { getMachineName } from '../utils/machineName'
import { logger } from '../utils/logger'
import type { TokenCreateRequest, TokenCreateResponse } from '../types/auth.types'

/**
 * Uses its own bare axios instance (not the shared, intercepted axiosClient) so
 * requesting a token never recurses back through the token-attaching interceptor —
 * avoids a circular import between axiosClient/interceptors/authApi entirely.
 */
const authClient = axios.create({ baseURL: API_BASE_URL, timeout: 60000 })

export async function createToken(serviceKey: string): Promise<string> {
  const credentials = API_CREDENTIALS[serviceKey]
  if (!credentials) throw new AppError('auth', `No API credentials configured for service "${serviceKey}"`)

  const body: TokenCreateRequest = {
    Login: credentials.login,
    Password: credentials.password,
    MachineName: getMachineName(),
  }

  let data: TokenCreateResponse
  try {
    const response = await authClient.post<TokenCreateResponse>(TOKEN_CREATE_URL, body)
    data = response.data
  } catch (err) {
    logger.error('[authApi] token request failed', err)
    if (!axios.isAxiosError(err) || !err.response) {
      throw new AppError('network', 'Unable to connect to API server.')
    }
    throw new AppError('auth', 'Authentication failed.')
  }

  if (data.statusCode !== 1 || !data.result) {
    logger.error('[authApi] token response rejected', data)
    throw new AppError('auth', data.exception || 'Authentication failed.')
  }

  return data.result
}
