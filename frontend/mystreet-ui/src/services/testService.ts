import { apiClient } from '../api/client'
import type { BackendStatus } from '../types/backend'

export async function getBackendStatus() {
  const response = await apiClient.get<BackendStatus>('/test')
  return response.data
}