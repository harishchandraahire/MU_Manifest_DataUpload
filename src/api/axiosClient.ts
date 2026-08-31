import axios from 'axios'
import { API_BASE_URL } from '../config/env'
import { attachInterceptors } from './interceptors'

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
})

attachInterceptors(axiosClient)

export default axiosClient
