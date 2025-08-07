/**
 * 错误处理模块
 *
 * 提供统一的错误处理机制
 */

import type { RouteLocationNormalized } from '../types'

/**
 * 路由器错误类型
 */
export enum RouterErrorType {
  NAVIGATION_ABORTED = 'NAVIGATION_ABORTED',
  NAVIGATION_CANCELLED = 'NAVIGATION_CANCELLED',
  NAVIGATION_DUPLICATED = 'NAVIGATION_DUPLICATED',
  ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND',
  INVALID_ROUTE = 'INVALID_ROUTE',
  GUARD_REJECTION = 'GUARD_REJECTION',
  COMPONENT_LOAD_ERROR = 'COMPONENT_LOAD_ERROR',
}

/**
 * 路由器错误基类
 */
export class RouterError extends Error {
  public readonly type: RouterErrorType
  public readonly code: string
  public readonly context?: any

  constructor(
    type: RouterErrorType,
    message: string,
    code?: string,
    context?: any
  ) {
    super(message)
    this.name = 'RouterError'
    this.type = type
    this.code = code || type
    this.context = context
  }
}

/**
 * 导航错误
 */
export class NavigationError extends RouterError {
  public readonly from: RouteLocationNormalized
  public readonly to: RouteLocationNormalized

  constructor(
    type: RouterErrorType,
    message: string,
    from: RouteLocationNormalized,
    to: RouteLocationNormalized,
    context?: any
  ) {
    super(type, message, type, context)
    this.name = 'NavigationError'
    this.from = from
    this.to = to
  }
}

/**
 * 组件加载错误
 */
export class ComponentLoadError extends RouterError {
  public readonly componentPath: string

  constructor(message: string, componentPath: string, originalError?: Error) {
    super(
      RouterErrorType.COMPONENT_LOAD_ERROR,
      message,
      'COMPONENT_LOAD_ERROR',
      {
        componentPath,
        originalError,
      }
    )
    this.name = 'ComponentLoadError'
    this.componentPath = componentPath
  }
}

/**
 * 错误处理器接口
 */
export interface ErrorHandler {
  (error: RouterError, context?: any): void
}

/**
 * 错误管理器
 */
export class ErrorManager {
  private handlers = new Map<RouterErrorType, ErrorHandler[]>()
  private globalHandlers: ErrorHandler[] = []

  /**
   * 注册错误处理器
   */
  onError(type: RouterErrorType, handler: ErrorHandler): () => void
  onError(handler: ErrorHandler): () => void
  onError(
    typeOrHandler: RouterErrorType | ErrorHandler,
    handler?: ErrorHandler
  ): () => void {
    if (typeof typeOrHandler === 'function') {
      // 全局错误处理器
      this.globalHandlers.push(typeOrHandler)
      return () => {
        const index = this.globalHandlers.indexOf(typeOrHandler)
        if (index > -1) {
          this.globalHandlers.splice(index, 1)
        }
      }
    } else {
      // 特定类型错误处理器
      const type = typeOrHandler
      const errorHandler = handler!

      if (!this.handlers.has(type)) {
        this.handlers.set(type, [])
      }
      this.handlers.get(type)!.push(errorHandler)

      return () => {
        const handlers = this.handlers.get(type)
        if (handlers) {
          const index = handlers.indexOf(errorHandler)
          if (index > -1) {
            handlers.splice(index, 1)
          }
        }
      }
    }
  }

  /**
   * 处理错误
   */
  handleError(error: RouterError, context?: any): void {
    // 执行特定类型的错误处理器
    const typeHandlers = this.handlers.get(error.type)
    if (typeHandlers) {
      typeHandlers.forEach(handler => {
        try {
          handler(error, context)
        } catch (handlerError) {
          console.error('Error in error handler:', handlerError)
        }
      })
    }

    // 执行全局错误处理器
    this.globalHandlers.forEach(handler => {
      try {
        handler(error, context)
      } catch (handlerError) {
        console.error('Error in global error handler:', handlerError)
      }
    })

    // 如果没有处理器，输出到控制台
    if (typeHandlers?.length === 0 && this.globalHandlers.length === 0) {
      console.error('Unhandled router error:', error)
    }
  }

  /**
   * 创建错误
   */
  createError(
    type: RouterErrorType,
    message: string,
    context?: any
  ): RouterError {
    return new RouterError(type, message, type, context)
  }

  /**
   * 创建导航错误
   */
  createNavigationError(
    type: RouterErrorType,
    message: string,
    from: RouteLocationNormalized,
    to: RouteLocationNormalized,
    context?: any
  ): NavigationError {
    return new NavigationError(type, message, from, to, context)
  }
}

/**
 * 创建错误管理器
 */
export function createErrorManager(): ErrorManager {
  return new ErrorManager()
}
