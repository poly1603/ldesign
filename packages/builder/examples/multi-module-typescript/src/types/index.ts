/**
 * 类型定义模块
 */

/**
 * 基础实体接口
 */
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

/**
 * 用户接口
 */
export interface User extends BaseEntity {
  name: string
  email: string
  age?: number
  roles: Role[]
}

/**
 * 角色接口
 */
export interface Role extends BaseEntity {
  name: string
  permissions: Permission[]
}

/**
 * 权限接口
 */
export interface Permission extends BaseEntity {
  name: string
  resource: string
  action: string
}

/**
 * API 响应接口
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * 分页参数接口
 */
export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/**
 * 配置选项类型
 */
export type ConfigOptions = {
  apiUrl: string
  timeout: number
  retries: number
  debug: boolean
}

/**
 * 事件类型枚举
 */
export enum EventType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view'
}

/**
 * 状态枚举
 */
export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended'
}
