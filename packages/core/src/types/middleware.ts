/**
 * 中间件系统类型定义
 */

/**
 * 中间件请求对象
 */
export interface MiddlewareRequest {
  method?: string
  url?: string
  headers?: Record<string, string>
  body?: unknown
  params?: Record<string, string>
  query?: Record<string, string>
  [key: string]: unknown
}

/**
 * 中间件响应对象
 */
export interface MiddlewareResponse {
  status?: number
  statusText?: string
  headers?: Record<string, string>
  body?: unknown
  [key: string]: unknown
}

/**
 * 中间件上下文
 */
export interface MiddlewareContext {
  request?: MiddlewareRequest
  response?: MiddlewareResponse
  error?: Error
  [key: string]: unknown
}

/**
 * 中间件下一个函数类型
 */
export type MiddlewareNext = () => Promise<void> | void

/**
 * 中间件函数类型
 */
export type MiddlewareFunction = (
  context: MiddlewareContext,
  next: MiddlewareNext
) => Promise<void> | void

/**
 * 中间件接口
 */
export interface Middleware {
  name: string
  handler: MiddlewareFunction
  priority?: number
}

/**
 * 中间件管理器接口
 */
export interface MiddlewareManager {
  /** 注册中间件 */
  use: (middleware: Middleware) => void
  /** 移除中间件 */
  remove: (name: string) => void
  /** 获取中间件 */
  get: (name: string) => Middleware | undefined
  /** 获取所有中间件 */
  getAll: () => Middleware[]
  /** 执行中间件管道 */
  execute(context: MiddlewareContext): Promise<void>
  /** 执行特定中间件 */
  execute(name: string, context: MiddlewareContext): Promise<unknown>

  /** 初始化和销毁 */
  init?(): Promise<void>
  destroy?(): Promise<void>
}

