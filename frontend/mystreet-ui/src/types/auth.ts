export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  firstName: string
  lastName: string
  email: string
  password: string
}

export type AuthUser = {
  userId: string
  firstName: string
  lastName: string
  email: string
  isAdmin: boolean
}

export type AuthResponse = {
  token: string
  user: AuthUser
}