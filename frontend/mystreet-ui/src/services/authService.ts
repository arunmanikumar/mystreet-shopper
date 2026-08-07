import { apiClient } from '../api/client'
import { getApiErrorMessage } from '../types/errors'
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '../types/auth'

type AuthApiResponse = {
  token: string
  userId: string
  firstName: string
  lastName: string
  email: string
  isAdmin: boolean
}

function mapAuthResponse(response: AuthApiResponse): AuthResponse {
  const user: AuthUser = {
    userId: response.userId,
    firstName: response.firstName,
    lastName: response.lastName,
    email: response.email,
    isAdmin: response.isAdmin,
  }

  return {
    token: response.token,
    user,
  }
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthApiResponse>('/auth/login', request)
    return mapAuthResponse(response.data)
  } catch (error) {
    throw getApiErrorMessage(error, 'Authentication request failed.')
  }
}

export async function register(request: RegisterRequest): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthApiResponse>('/auth/register', request)
    return mapAuthResponse(response.data)
  } catch (error) {
    throw getApiErrorMessage(error, 'Authentication request failed.')
  }
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout')
  } catch (error) {
    throw getApiErrorMessage(error, 'Authentication request failed.')
  }
}