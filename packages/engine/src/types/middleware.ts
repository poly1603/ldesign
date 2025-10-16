/**
 * 中间件类型定义
 * 包含中间件、中间件管理器等相关类型
 */

// 中间件请求对象（兼容性类型）
export interface MiddlewareRequest {
  method?: string
  url?: string
  headers?: Record<string, string>
  body?: unknown
  params?: Record<string, string>
  query?: Record<string, string>
  [key: string]: unknown
}

// 中间件响应对象（兼容性类型）
export interface MiddlewareResponse {
  status?: number
  statusText?: string
  headers?: Record<string, string>
  body?: unknown
  [key: string]: unknown
}

// 中间件上下文
export interface MiddlewareContext {
  request?: MiddlewareRequest
  response?: MiddlewareResponse
  error?: Error
  [key: string]: unknown
}

// 中间件下一个函数类型
export type MiddlewareNext = () => Promise<void> | void

// 中间件函数类型
export type MiddlewareFunction = (
  context: MiddlewareContext,
  next: MiddlewareNext
) => Promise<void> | void

// 中间件接口
export interface Middleware {
  name: string
  handler: MiddlewareFunction
  priority?: number
}

// 中间件管理器接口
export interface MiddlewareManager {
  use: (middleware: Middleware) => void
  remove: (name: string) => void
  get: (name: string) => Middleware | undefined
  getAll: () => Middleware[]
  execute(context: MiddlewareContext): Promise<void>
  execute(name: string, context: MiddlewareContext): Promise<unknown>
}

// 中间件管道接口
export interface MiddlewarePipeline {
  add: (middleware: Middleware) => void
  remove: (name: string) => void
  execute: (context: MiddlewareContext) => Promise<void>
  clear: () => void
  getMiddleware: () => Middleware[]
}

// 中间件错误处理接口
export interface MiddlewareErrorHandler {
  onError: (error: Error, context: MiddlewareContext) => void
  setErrorHandler: (
    handler: (error: Error, context: MiddlewareContext) => void
  ) => void
  getErrorHandler: () =>
    | ((error: Error, context: MiddlewareContext) => void)
    | undefined
}

// 中间件性能监控接口
export interface MiddlewarePerformanceMonitor {
  startMeasure: (middlewareName: string) => void
  endMeasure: (middlewareName: string) => number
  getMetrics: () => Record<string, number>
  getReport: () => Record<string, unknown>
  clearMetrics: () => void
}

// 中间件验证接口
export interface MiddlewareValidator {
  validate: (middleware: Middleware) => { valid: boolean; errors: string[] }
  validatePipeline: (middleware: Middleware[]) => {
    valid: boolean
    errors: string[]
  }
  getValidationRules: () => Record<string, unknown>
  setValidationRules: (rules: Record<string, unknown>) => void
}

// 中间件热重载接口
export interface MiddlewareHotReload {
  enable: () => void
  disable: () => void
  isEnabled: () => boolean
  reload: (middlewareName: string) => Promise<void>
  watch: (middlewarePath: string) => void
  unwatch: (middlewarePath: string) => void
  onReload: (callback: (middlewareName: string) => void) => () => void
}

// 中间件统计接口
export interface MiddlewareStats {
  total: number
  executed: number
  errors: number
  averageExecutionTime: number
  lastExecuted: number
  byPriority: Record<number, number>
  byName: Record<
    string,
    { executions: number; errors: number; avgTime: number }
  >
}
