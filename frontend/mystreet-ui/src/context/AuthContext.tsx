import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { login as loginRequest, logout as logoutRequest, register as registerRequest } from '../services/authService'
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '../types/auth'
import {
  clearStoredAuth,
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_USER_STORAGE_KEY,
  getStoredToken,
  getStoredUser,
  registerUnauthorizedHandler,
  storeAuth,
} from '../utils/authStorage'

type AuthContextValue = {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (request: LoginRequest) => Promise<AuthResponse>
  register: (request: RegisterRequest) => Promise<AuthResponse>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser())

  useEffect(() => {
    if (token && !user) {
      clearStoredAuth()
      setToken(null)
    }
  }, [token, user])

  useEffect(() => {
    const unregister = registerUnauthorizedHandler(() => {
      setToken(null)
      setUser(null)
    })

    return unregister
  }, [])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_TOKEN_STORAGE_KEY && event.key !== AUTH_USER_STORAGE_KEY) {
        return
      }

      setToken(getStoredToken())
      setUser(getStoredUser())
    }

    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const applyAuth = (response: AuthResponse) => {
    setToken(response.token)
    setUser(response.user)
    storeAuth(response.token, response.user)
    return response
  }

  const handleLogin = async (request: LoginRequest) => {
    const response = await loginRequest(request)
    return applyAuth(response)
  }

  const handleRegister = async (request: RegisterRequest) => {
    const response = await registerRequest(request)
    return applyAuth(response)
  }

  const handleLogout = async () => {
    try {
      await logoutRequest()
    } finally {
      clearStoredAuth()
      setToken(null)
      setUser(null)
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isAdmin: Boolean(user?.isAdmin),
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
    }),
    [token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}