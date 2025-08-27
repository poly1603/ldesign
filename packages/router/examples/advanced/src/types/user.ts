export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  roles?: string[]
  lastLoginAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  error?: string
  user?: User
  token?: string
}
