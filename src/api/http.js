import axios from 'axios'
import { getAuthToken, clearAuthToken } from '../utils/authToken'

function normalizeBaseUrl(url) {
  if (!url) return ''
  return url.endsWith('/') ? url.slice(0, -1) : url
}

// Postman base: https://tesoro-app-production.up.railway.app/api
// Override via VITE_API_BASE_URL (recommended for dev/staging).
const baseURL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL || 'https://tesoro-app-production.up.railway.app/api',
)

export const http = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status
    if (status === 401) clearAuthToken()
    return Promise.reject(err)
  },
)
