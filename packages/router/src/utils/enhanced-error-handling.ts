/**
 * @ldesign/router 增强的错误处理系统
 *
 * 提供更精确的错误类型、错误边界和恢复策略
 */

import type { RouteLocationNormalized } from '../types'

// ==================== 错误码枚举 ====================

/**
 * 路由错误码
 */
export enum RouterErrorCode {
  /** 导航被取消 */
  NAVIGATION_CANCELLED = 'NAVIGATION_CANCELLED',
  /** 重复导航 */
  NAVIGATION_DUPLICATED = 'NAVIGATION_DUPLICATED',
  /** 路由未找到 */
  ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND',
  /** 无效的参数 */
  INVALID_PARAMS = 'INVALID_PARAMS',
  /** 守卫拒绝 */
  GUARD_REJECTED = 'GUARD_REJECTED',
  /** 重定向过多 */
  TOO_MANY_REDIRECTS = 'TOO_MANY_REDIRECTS',
  /** 导航超时 */
  NAVIGATION_TIMEOUT = 'NAVIGATION_TIMEOUT',
  /** 组件加载失败 */
  COMPONENT_LOAD_FAILED = 'COMPONENT_LOAD_FAILED',
  /** 权限不足 */
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  /** 未授权 */
  UNAUTHORIZED = 'UNAUTHORIZED',
  /** 无效的路由配置 */
  INVALID_ROUTE_CONFIG = 'INVALID_ROUTE_CONFIG',
  /** 内部错误 */
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

// ==================== 自定义错误类 ====================

/**
 * 路由器基础错误类
 */
export class RouterError extends Error {
  /** 错误码 */
  public readonly code: RouterErrorCode
  /** 错误详情 */
  public readonly details?: any
  /** 错误发生的时间戳 */
  public readonly timestamp: number
  /** 错误堆栈（增强版） */
  public readonly stackTrace?: string

  constructor(
    code: RouterErrorCode,
    message: string,
    details?: any
  ) {
    super(message)
    this.name = 'RouterError'
    this.code = code
    this.details = details
    this.timestamp = Date.now()
    this.stackTrace = this.stack

    // 确保 instanceof 正常工作
    Object.setPrototypeOf(this, RouterError.prototype)
  }

  /**
   * 转换为 JSON 格式
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stackTrace,
    }
  }

  /**
   * 转换为可读字符串
   */
  toString(): string {
    return `[${this.code}] ${this.message}${
      this.details ? `\n详情: ${JSON.stringify(this.details, null, 2)}` : ''
    }`
  }
}

/**
 * 导航取消错误
 */
export class NavigationCancelledError extends RouterError {
  constructor(
    public readonly from: RouteLocationNormalized,
    public readonly to: RouteLocationNormalized,
    reason?: string
  ) {
    super(
      RouterErrorCode.NAVIGATION_CANCELLED,
      reason || '导航被取消',
      { from: from.path, to: to.path }
    )
    this.name = 'NavigationCancelledError'
    Object.setPrototypeOf(this, NavigationCancelledError.prototype)
  }
}

/**
 * 导航重复错误
 */
export class NavigationDuplicatedError extends RouterError {
  constructor(
    public readonly location: RouteLocationNormalized
  ) {
    super(
      RouterErrorCode.NAVIGATION_DUPLICATED,
      '尝试导航到当前路由',
      { path: location.path }
    )
    this.name = 'NavigationDuplicatedError'
    Object.setPrototypeOf(this, NavigationDuplicatedError.prototype)
  }
}

/**
 * 路由未找到错误
 */
export class RouteNotFoundError extends RouterError {
  constructor(
    public readonly path: string,
    public readonly name?: string | symbol
  ) {
    super(
      RouterErrorCode.ROUTE_NOT_FOUND,
      `路由未找到: ${name ? `名称="${String(name)}"` : `路径="${path}"`}`,
      { path, name }
    )
    this.name = 'RouteNotFoundError'
    Object.setPrototypeOf(this, RouteNotFoundError.prototype)
  }
}

/**
 * 守卫拒绝错误
 */
export class GuardRejectedError extends RouterError {
  constructor(
    public readonly guardName: string,
    public readonly from: RouteLocationNormalized,
    public readonly to: RouteLocationNormalized,
    reason?: string
  ) {
    super(
      RouterErrorCode.GUARD_REJECTED,
      `守卫 "${guardName}" 拒绝了导航${reason ? `: ${reason}` : ''}`,
      { guardName, from: from.path, to: to.path }
    )
    this.name = 'GuardRejectedError'
    Object.setPrototypeOf(this, GuardRejectedError.prototype)
  }
}

/**
 * 组件加载失败错误
 */
export class ComponentLoadFailedError extends RouterError {
  constructor(
    public readonly componentPath: string,
    public readonly originalError?: Error
  ) {
    super(
      RouterErrorCode.COMPONENT_LOAD_FAILED,
      `组件加载失败: ${componentPath}`,
      { componentPath, originalError: originalError?.message }
    )
    this.name = 'ComponentLoadFailedError'
    Object.setPrototypeOf(this, ComponentLoadFailedError.prototype)
  }
}

// ==================== 恢复策略 ====================

/**
 * 恢复动作类型
 */
export type RecoveryActionType =
  | 'redirect' // 重定向到其他路由
  | 'fallback' // 回退到之前的路由
  | 'retry' // 重试当前导航
  | 'ignore' // 忽略错误继续
  | 'abort' // 终止导航

/**
 * 恢复动作
 */
export interface RecoveryAction {
  /** 动作类型 */
  type: RecoveryActionType
  /** 目标路由（用于 redirect 和 fallback） */
  to?: RouteLocationNormalized | string
  /** 重试次数（用于 retry） */
  maxRetries?: number
  /** 重试延迟（毫秒） */
  retryDelay?: number
  /** 自定义处理函数 */
  handler?: () => Promise<void> | void
}

/**
 * 导航上下文
 */
export interface NavigationContext {
  /** 来源路由 */
  from: RouteLocationNormalized
  /** 目标路由 */
  to: RouteLocationNormalized
  /** 错误对象 */
  error?: Error
  /** 重试次数 */
  retryCount?: number
}

// ==================== 错误边界 ====================

/**
 * 错误边界配置
 */
export interface ErrorBoundaryConfig {
  /** 默认恢复策略 */
  defaultRecovery?: RecoveryAction
  /** 自定义错误处理器 */
  errorHandlers?: Map<RouterErrorCode, (error: RouterError, context: NavigationContext) => RecoveryAction | Promise<RecoveryAction>>
  /** 错误日志记录器 */
  logger?: (error: Error, context: NavigationContext) => void
  /** 是否在开发模式下显示详细错误 */
  verbose?: boolean
}

/**
 * 错误边界
 * 提供统一的错误处理和恢复机制
 */
export class ErrorBoundary {
  private config: Required<ErrorBoundaryConfig>
  private retryCounters = new Map<string, number>()

  constructor(config?: ErrorBoundaryConfig) {
    this.config = {
      defaultRecovery: {
        type: 'fallback',
        to: '/',
      },
      errorHandlers: new Map(),
      logger: console.error,
      verbose: process.env.NODE_ENV === 'development',
      ...config,
    }
  }

  /**
   * 处理导航错误
   */
  async handleNavigationError(
    error: Error,
    context: NavigationContext
  ): Promise<RecoveryAction> {
    // 记录错误
    this.logError(error, context)

    // 如果是 RouterError，使用特定处理器
    if (error instanceof RouterError) {
      return this.handleRouterError(error, context)
    }

    // 处理未知错误
    return this.handleUnknownError(error, context)
  }

  /**
   * 处理路由器错误
   */
  private async handleRouterError(
    error: RouterError,
    context: NavigationContext
  ): Promise<RecoveryAction> {
    // 查找自定义处理器
    const customHandler = this.config.errorHandlers.get(error.code)
    if (customHandler) {
      return await customHandler(error, context)
    }

    // 使用内置策略
    switch (error.code) {
      case RouterErrorCode.ROUTE_NOT_FOUND:
        return { type: 'redirect', to: '/404' }

      case RouterErrorCode.GUARD_REJECTED:
        return { type: 'fallback', to: context.from }

      case RouterErrorCode.PERMISSION_DENIED:
      case RouterErrorCode.UNAUTHORIZED:
        return { type: 'redirect', to: '/login' }

      case RouterErrorCode.COMPONENT_LOAD_FAILED:
        return this.handleComponentLoadError(error as ComponentLoadFailedError, context)

      case RouterErrorCode.NAVIGATION_DUPLICATED:
        return { type: 'ignore' }

      case RouterErrorCode.TOO_MANY_REDIRECTS:
        return { type: 'fallback', to: context.from }

      default:
        return this.config.defaultRecovery
    }
  }

  /**
   * 处理组件加载错误
   */
  private handleComponentLoadError(
    error: ComponentLoadFailedError,
    context: NavigationContext
  ): RecoveryAction {
    const retryKey = error.componentPath
    const retryCount = this.retryCounters.get(retryKey) || 0

    // 最多重试3次
    if (retryCount < 3) {
      this.retryCounters.set(retryKey, retryCount + 1)
      return {
        type: 'retry',
        maxRetries: 3,
        retryDelay: 1000 * (retryCount + 1), // 递增延迟
      }
    }

    // 重试失败，回退
    this.retryCounters.delete(retryKey)
    return { type: 'fallback', to: context.from }
  }

  /**
   * 处理未知错误
   */
  private async handleUnknownError(
    error: Error,
    _context: NavigationContext
  ): Promise<RecoveryAction> {
    // 尝试从错误中提取有用信息
    if (error.message.includes('timeout')) {
      return {
        type: 'retry',
        maxRetries: 2,
        retryDelay: 2000,
      }
    }

    if (error.message.includes('network')) {
      return {
        type: 'redirect',
        to: '/offline',
      }
    }

    // 默认策略
    return this.config.defaultRecovery
  }

  /**
   * 记录错误
   */
  private logError(error: Error, context: NavigationContext): void {
    if (this.config.verbose) {
      console.group('🔴 Router Error')
      console.error('Error:', error)
      console.log('Context:', {
        from: context.from.path,
        to: context.to.path,
        retryCount: context.retryCount,
      })
      console.groupEnd()
    }

    this.config.logger(error, context)
  }

  /**
   * 注册自定义错误处理器
   */
  registerHandler(
    code: RouterErrorCode,
    handler: (error: RouterError, context: NavigationContext) => RecoveryAction | Promise<RecoveryAction>
  ): void {
    this.config.errorHandlers.set(code, handler)
  }

  /**
   * 移除错误处理器
   */
  removeHandler(code: RouterErrorCode): boolean {
    return this.config.errorHandlers.delete(code)
  }

  /**
   * 清除重试计数器
   */
  clearRetryCounters(): void {
    this.retryCounters.clear()
  }
}

// ==================== 工厂函数 ====================

/**
 * 创建路由器错误
 */
export function createRouterError(
  code: RouterErrorCode,
  message: string,
  details?: any
): RouterError {
  return new RouterError(code, message, details)
}

/**
 * 创建错误边界实例
 */
export function createErrorBoundary(config?: ErrorBoundaryConfig): ErrorBoundary {
  return new ErrorBoundary(config)
}

// ==================== 类型守卫 ====================

/**
 * 检查是否为路由器错误
 */
export function isRouterError(error: unknown): error is RouterError {
  return error instanceof RouterError
}

/**
 * 检查是否为特定代码的路由器错误
 */
export function isRouterErrorOfType(
  error: unknown,
  code: RouterErrorCode
): error is RouterError {
  return isRouterError(error) && error.code === code
}

// ==================== 错误恢复辅助函数 ====================

/**
 * 带重试的异步函数包装器
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number
    retryDelay?: number
    onRetry?: (attempt: number, error: Error) => void
  }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3
  const retryDelay = options?.retryDelay ?? 1000

  let lastError: Error | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    }
    catch (error) {
      lastError = error as Error

      if (attempt < maxRetries) {
        options?.onRetry?.(attempt + 1, lastError)
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
      }
    }
  }

  throw lastError
}

/**
 * 带超时的异步函数包装器
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeout: number,
  timeoutError?: Error
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(timeoutError || new RouterError(
          RouterErrorCode.NAVIGATION_TIMEOUT,
          `Operation timed out after ${timeout}ms`
        )),
        timeout
      )
    ),
  ])
}
