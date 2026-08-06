import type { AuthUser } from '../types/auth';

const AUTH_TOKEN_KEY = 'mystreet_token';
const AUTH_USER_KEY = 'mystreet_user';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getStoredToken() {
  if (!canUseStorage()) {
    return null;
  }

  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): AuthUser | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const value = window.localStorage.getItem(AUTH_USER_KEY);
    return value ? (JSON.parse(value) as AuthUser) : null;
  } catch {
    clearStoredAuth();
    return null;
  }
}

export function storeAuth(token: string, user: AuthUser) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch {
    // Ignore storage failures in restricted browser modes.
  }
}

export function clearStoredAuth() {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_USER_KEY);
  } catch {
    // Ignore storage failures.
  }
}