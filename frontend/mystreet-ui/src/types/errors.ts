import axios from 'axios'
import type { ApiErrorResponse } from './api'

export class ApiServiceError extends Error {
  statusCode: number | null
  code: string | null

  constructor(message: string, statusCode: number | null = null, code: string | null = null) {
    super(message)
    this.name = 'ApiServiceError'
    this.statusCode = statusCode
    this.code = code
  }
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const message = error.response?.data.message?.trim()
    const statusCode = error.response?.status ?? null
    const code = error.response?.data.error?.trim() ?? null

    return new ApiServiceError(message || fallbackMessage, statusCode, code)
  }

  if (error instanceof Error) {
    return new ApiServiceError(error.message || fallbackMessage)
  }

  return new ApiServiceError(fallbackMessage)
}
