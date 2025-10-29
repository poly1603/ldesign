/**
 * API 相关类型定义
 */

/**
 * API 响应基础接口
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: ApiError
  timestamp: number
}

/**
 * API 错误信息
 */
export interface ApiError {
  code: string
  message: string
  details?: any
  stack?: string
}

/**
 * 分页查询参数
 */
export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * 分页响应数据
 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * 查询过滤器
 */
export interface QueryFilter {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like' | 'between'
  value: any
}

/**
 * WebSocket 消息类型
 */
export type WSMessageType =
  | 'tool-progress'
  | 'tool-log'
  | 'tool-status'
  | 'tool-start'
  | 'tool-complete'
  | 'tool-error'
  | 'build-start'
  | 'build-progress'
  | 'build-complete'
  | 'build-error'
  | 'test-start'
  | 'test-progress'
  | 'test-complete'
  | 'test-error'
  | 'workflow-start'
  | 'workflow-step'
  | 'workflow-complete'
  | 'workflow-error'
  | 'server-status'
  | 'ping'
  | 'pong'

/**
 * WebSocket 消息
 */
export interface WSMessage<T = any> {
  type: WSMessageType
  data: T
  timestamp: number
  id?: string
}

/**
 * HTTP 方法
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

/**
 * 请求选项
 */
export interface RequestOptions {
  method?: HttpMethod
  headers?: Record<string, string>
  params?: Record<string, any>
  data?: any
  timeout?: number
  signal?: AbortSignal
}


