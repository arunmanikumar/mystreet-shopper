import type { AuthUser } from '../types/auth'

export const AUTH_TOKEN_STORAGE_KEY = 'mystreet_token'
export const AUTH_USER_STORAGE_KEY = 'mystreet_user'

let unauthorizedHandler: (() => void) | null = null

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getStoredToken() {
  if (!canUseStorage()) {
    return null
  }

  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
}

export function getStoredUser(): AuthUser | null {
  if (!canUseStorage()) {
    return null
  }

  const value = window.localStorage.getItem(AUTH_USER_STORAGE_KEY)

  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as AuthUser
  } catch {
    clearStoredAuth()
    return null
  }
}

export function storeAuth(token: string, user: AuthUser) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
  window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))
}

export function clearStoredAuth() {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
}

export function notifyUnauthorized() {
  clearStoredAuth()
  unauthorizedHandler?.()
}

export function registerUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler

  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = null
    }
  }
}