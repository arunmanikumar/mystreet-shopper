import axios from 'axios'
import { notifyUnauthorized, getStoredToken } from '../utils/authStorage'

const apiUrl = import.meta.env.VITE_API_URL

if (!apiUrl) {
  throw new Error('VITE_API_URL is not configured.')
}

export const apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      notifyUnauthorized()
    }

    return Promise.reject(error)
  },
)