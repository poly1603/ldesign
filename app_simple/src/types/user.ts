/**
 * 用户相关类型定义
 */

/**
 * 用户信息
 */
export interface User {
  id: string
  username: string
  name: string
  email: string
  avatar?: string
  roles: string[]
  permissions?: string[]
  createdAt: string
  updatedAt?: string
}

/**
 * 登录凭证
 */
export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean
}

/**
 * 登录响应
 */
export interface LoginResponse {
  success: boolean
  user?: User
  token?: string
  error?: string
  message?: string
}

/**
 * 用户角色
 */
export enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest'
}

/**
 * 用户权限
 */
export interface Permission {
  id: string
  name: string
  code: string
  description?: string
}