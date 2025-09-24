/**
 * 错误处理插件
 * 提供统一的错误处理、报告和恢复机制
 */

import type { ApiEngine, ApiPlugin } from '../types'
import type { ErrorReporter } from '../utils/ErrorReporter'
import { ApiError, ApiErrorFactory, ApiErrorType, ErrorSeverity } from '../utils/ApiError'
import { createErrorReporter, setGlobalErrorReporter } from '../utils/ErrorReporter'

/**
 * 错误处理插件配置
 */
export interface ErrorHandlingPluginConfig {
  /** 是否启用错误报告 */
  enableReporting?: boolean
  /** 错误报告配置 */
  reporting?: {
    endpoint?: string
    apiKey?: string
    sampleRate?: number
    enableInDevelopment?: boolean
  }
  /** 自动重试配置 */
  autoRetry?: {
    /** 启用自动重试的错误类型 */
    retryableErrors?: ApiErrorType[]
    /** 最大重试次数 */
    maxRetries?: number
    /** 重试延迟 */
    retryDelay?: number
  }
  /** 错误恢复策略 */
  recovery?: {
    /** 网络错误时的降级响应 */
    networkFallback?: (error: ApiError) => any
    /** 服务器错误时的降级响应 */
    serverFallback?: (error: ApiError) => any
    /** 认证错误时的处理 */
    authErrorHandler?: (error: ApiError) => void
  }
  /** 用户通知配置 */
  notification?: {
    /** 是否显示用户友好的错误消息 */
    showUserMessages?: boolean
    /** 自定义通知函数 */
    notifyUser?: (error: ApiError) => void
  }
}

/**
 * 错误处理插件
 */
export function createErrorHandlingPlugin(config: ErrorHandlingPluginConfig = {}): ApiPlugin {
  let errorReporter: ErrorReporter | null = null

  return {
    name: 'errorHandling',
    version: '1.0.0',

    async install(engine: ApiEngine) {
      // 初始化错误报告器
      if (config.enableReporting !== false) {
        errorReporter = createErrorReporter({
          enabled: true,
          enableInDevelopment: config.reporting?.enableInDevelopment ?? false,
          endpoint: config.reporting?.endpoint ?? '',
          apiKey: config.reporting?.apiKey ?? '',
          sampleRate: config.reporting?.sampleRate ?? 1.0,
        })

        // 设置为全局错误报告器
        setGlobalErrorReporter(errorReporter)

        // 设置到引擎
        if ('setErrorReporter' in engine) {
          (engine as any).setErrorReporter(errorReporter)
        }
      }

      // 添加错误中间件
      const existingErrorMiddlewares = engine.config.middlewares?.error || []

      engine.config.middlewares = {
        ...engine.config.middlewares,
        error: [
          ...existingErrorMiddlewares,
          async (error: any, ctx: any) => {
            // 创建增强的错误对象
            const apiError = createEnhancedError(error, ctx)

            // 报告错误
            if (errorReporter) {
              errorReporter.report(apiError)
            }

            // 用户通知
            if (config.notification?.showUserMessages !== false) {
              notifyUser(apiError, config.notification?.notifyUser)
            }

            // 错误恢复
            const recovery = attemptErrorRecovery(apiError, config.recovery)
            if (recovery) {
              return recovery
            }

            // 特殊错误处理
            handleSpecialErrors(apiError, config)

            // 不返回任何值，让错误继续传播
            return undefined
          },
        ],
      }
    },

    async uninstall() {
      if (errorReporter) {
        errorReporter.destroy()
        errorReporter = null
        setGlobalErrorReporter(null)
      }
    },
  }
}

/**
 * 创建增强的错误对象
 */
function createEnhancedError(error: any, context: any): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  // 检查是否是HTTP响应错误
  if (error && typeof error === 'object' && ('response' in error || 'status' in error)) {
    return ApiErrorFactory.fromHttpResponse(error, context)
  }

  // 检查是否是网络错误
  if (error instanceof Error) {
    return ApiErrorFactory.fromNetworkError(error, context)
  }

  // 其他未知错误
  return ApiErrorFactory.fromUnknownError(error, context)
}

/**
 * 尝试错误恢复
 */
function attemptErrorRecovery(error: ApiError, recovery?: ErrorHandlingPluginConfig['recovery']): any {
  if (!recovery) {
    return null
  }

  switch (error.type) {
    case ApiErrorType.NETWORK_ERROR:
      if (recovery.networkFallback) {
        try {
          return recovery.networkFallback(error)
        }
        catch (e) {
          console.warn('Network fallback failed:', e)
        }
      }
      break

    case ApiErrorType.SERVER_ERROR:
      if (recovery.serverFallback) {
        try {
          return recovery.serverFallback(error)
        }
        catch (e) {
          console.warn('Server fallback failed:', e)
        }
      }
      break

    default:
      break
  }

  return null
}

/**
 * 处理特殊错误
 */
function handleSpecialErrors(error: ApiError, config: ErrorHandlingPluginConfig): void {
  switch (error.type) {
    case ApiErrorType.AUTH_ERROR:
      if (config.recovery?.authErrorHandler) {
        try {
          config.recovery.authErrorHandler(error)
        }
        catch (e) {
          console.warn('Auth error handler failed:', e)
        }
      }
      break

    default:
      break
  }
}

/**
 * 通知用户
 */
function notifyUser(error: ApiError, customNotify?: (error: ApiError) => void): void {
  if (customNotify) {
    try {
      customNotify(error)
      return
    }
    catch (e) {
      console.warn('Custom notification failed:', e)
    }
  }

  // 默认通知方式
  if (error.severity === ErrorSeverity.CRITICAL || error.severity === ErrorSeverity.HIGH) {
    // 在浏览器环境中显示通知
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('系统错误', {
          body: error.userMessage,
          icon: '/favicon.ico',
        })
      }
    }

    // 在控制台中显示错误
    console.error(`🚨 ${error.userMessage}`)
    if (error.suggestions.length > 0) {
      console.info('💡 建议解决方案:', error.suggestions)
    }
  }
}

/**
 * 默认错误处理插件实例
 */
export const errorHandlingPlugin = createErrorHandlingPlugin()

/**
 * 创建带配置的错误处理插件
 */
export function withErrorHandling(config: ErrorHandlingPluginConfig = {}) {
  return createErrorHandlingPlugin(config)
}

/**
 * 错误处理工具函数
 */
export const ErrorHandlingUtils = {
  /**
   * 检查错误是否可重试
   */
  isRetryable(error: ApiError): boolean {
    return error.retryable
  },

  /**
   * 获取错误的用户友好消息
   */
  getUserMessage(error: ApiError): string {
    return error.userMessage
  },

  /**
   * 获取错误的建议解决方案
   */
  getSuggestions(error: ApiError): string[] {
    return error.suggestions
  },

  /**
   * 检查错误严重程度
   */
  isCritical(error: ApiError): boolean {
    return error.severity === ErrorSeverity.CRITICAL
  },

  /**
   * 格式化错误信息用于日志
   */
  formatForLogging(error: ApiError): string {
    return `[${error.type}] ${error.message} (Method: ${error.context.methodName})`
  },
}
