import type { AuthUser } from '../types/auth'

export const AUTH_TOKEN_STORAGE_KEY = 'mystreet_token'
export const AUTH_USER_STORAGE_KEY = 'mystreet_user'

let unauthorizedHandler: (() => void) | null = null

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function safeGetItem(key: string) {
  if (!canUseStorage()) {
    return null
  }

  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string) {
  if (!canUseStorage()) {
    return
  }

  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Ignore storage write failures (privacy mode, quota, or restricted environments).
  }
}

function safeRemoveItem(key: string) {
  if (!canUseStorage()) {
    return
  }

  try {
    window.localStorage.removeItem(key)
  } catch {
    // Ignore storage remove failures.
  }
}

export function getStoredToken() {
  return safeGetItem(AUTH_TOKEN_STORAGE_KEY)
}

export function getStoredUser(): AuthUser | null {
  const value = safeGetItem(AUTH_USER_STORAGE_KEY)

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
  safeSetItem(AUTH_TOKEN_STORAGE_KEY, token)
  safeSetItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))
}

export function clearStoredAuth() {
  safeRemoveItem(AUTH_TOKEN_STORAGE_KEY)
  safeRemoveItem(AUTH_USER_STORAGE_KEY)
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