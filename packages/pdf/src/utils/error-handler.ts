/**
 * 错误处理系统
 * 提供完整的错误类型定义和处理策略
 */

import type {
  PdfError,
  ErrorHandler,
  ErrorRecoveryStrategy
} from '../types'
import { ErrorCode } from '../types'

/**
 * 错误恢复策略实现
 */
const recoveryStrategies: Record<ErrorCode, ErrorRecoveryStrategy> = {
  [ErrorCode.LOAD_ERROR]: {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2,
    fallbackAction: 'show_error_message'
  },
  [ErrorCode.PARSE_ERROR]: {
    maxRetries: 1,
    retryDelay: 500,
    backoffMultiplier: 1,
    fallbackAction: 'show_error_message'
  },
  [ErrorCode.RENDER_ERROR]: {
    maxRetries: 2,
    retryDelay: 800,
    backoffMultiplier: 1.5,
    fallbackAction: 'render_placeholder'
  },
  [ErrorCode.CACHE_ERROR]: {
    maxRetries: 1,
    retryDelay: 200,
    backoffMultiplier: 1,
    fallbackAction: 'clear_cache'
  },
  [ErrorCode.WORKER_ERROR]: {
    maxRetries: 2,
    retryDelay: 1500,
    backoffMultiplier: 2,
    fallbackAction: 'restart_worker'
  },
  [ErrorCode.NETWORK_ERROR]: {
    maxRetries: 5,
    retryDelay: 2000,
    backoffMultiplier: 2,
    fallbackAction: 'show_offline_message'
  },
  [ErrorCode.PERMISSION_ERROR]: {
    maxRetries: 0,
    retryDelay: 0,
    backoffMultiplier: 1,
    fallbackAction: 'show_permission_error'
  },
  [ErrorCode.MEMORY_ERROR]: {
    maxRetries: 1,
    retryDelay: 3000,
    backoffMultiplier: 1,
    fallbackAction: 'reduce_quality'
  },
  [ErrorCode.TIMEOUT_ERROR]: {
    maxRetries: 2,
    retryDelay: 1000,
    backoffMultiplier: 1.5,
    fallbackAction: 'increase_timeout'
  },
  [ErrorCode.VALIDATION_ERROR]: {
    maxRetries: 0,
    retryDelay: 0,
    backoffMultiplier: 1,
    fallbackAction: 'show_validation_error'
  },
  [ErrorCode.UNKNOWN_ERROR]: {
    maxRetries: 1,
    retryDelay: 1000,
    backoffMultiplier: 1,
    fallbackAction: 'show_generic_error'
  },
  [ErrorCode.LOAD_FAILED]: {
    maxRetries: 2,
    retryDelay: 1500,
    backoffMultiplier: 2,
    fallbackAction: 'show_error_message'
  },
  [ErrorCode.INVALID_PDF]: {
    maxRetries: 0,
    retryDelay: 0,
    backoffMultiplier: 1,
    fallbackAction: 'show_invalid_pdf_error'
  },
  [ErrorCode.PASSWORD_REQUIRED]: {
    maxRetries: 0,
    retryDelay: 0,
    backoffMultiplier: 1,
    fallbackAction: 'prompt_password'
  },
  [ErrorCode.RENDER_FAILED]: {
    maxRetries: 2,
    retryDelay: 800,
    backoffMultiplier: 1.5,
    fallbackAction: 'render_placeholder'
  },
  [ErrorCode.CANVAS_ERROR]: {
    maxRetries: 1,
    retryDelay: 500,
    backoffMultiplier: 1,
    fallbackAction: 'fallback_renderer'
  },
  [ErrorCode.WEBGL_ERROR]: {
    maxRetries: 1,
    retryDelay: 500,
    backoffMultiplier: 1,
    fallbackAction: 'disable_webgl'
  },
  [ErrorCode.PAGE_NOT_FOUND]: {
    maxRetries: 0,
    retryDelay: 0,
    backoffMultiplier: 1,
    fallbackAction: 'show_page_error'
  },
  [ErrorCode.INVALID_PAGE_NUMBER]: {
    maxRetries: 0,
    retryDelay: 0,
    backoffMultiplier: 1,
    fallbackAction: 'show_page_error'
  },
  [ErrorCode.WORKER_TIMEOUT]: {
    maxRetries: 2,
    retryDelay: 2000,
    backoffMultiplier: 2,
    fallbackAction: 'restart_worker'
  },
  [ErrorCode.INVALID_ARGUMENT]: {
    maxRetries: 0,
    retryDelay: 0,
    backoffMultiplier: 1,
    fallbackAction: 'show_validation_error'
  }
}

/**
 * 错误处理器实现
 */
export class PdfErrorHandler implements ErrorHandler {
  private errorCounts = new Map<ErrorCode, number>()
  private lastErrors = new Map<ErrorCode, number>()
  private errorCallbacks = new Map<ErrorCode, Array<(error: PdfError) => void>>()
  private globalErrorCallback?: (error: PdfError) => void
  
  /**
   * 处理错误
   */
  handleError(error: PdfError): void {
    // 标准化错误
    const standardizedError = this.standardizeError(error)
    
    // 记录错误
    this.recordError(standardizedError)
    
    // 执行错误回调
    this.executeErrorCallbacks(standardizedError)
    
    // 日志记录
    this.logError(standardizedError)
  }

  /**
   * 获取错误恢复策略
   */
  getRecoveryStrategy(errorCode: ErrorCode): ErrorRecoveryStrategy {
    return recoveryStrategies[errorCode] || recoveryStrategies[ErrorCode.UNKNOWN_ERROR]
  }

  /**
   * 注册错误回调
   */
  onError(errorCode: ErrorCode, callback: (error: PdfError) => void): void {
    if (!this.errorCallbacks.has(errorCode)) {
      this.errorCallbacks.set(errorCode, [])
    }
    this.errorCallbacks.get(errorCode)!.push(callback)
  }

  /**
   * 注册全局错误回调
   */
  onGlobalError(callback: (error: PdfError) => void): void {
    this.globalErrorCallback = callback
  }

  /**
   * 移除错误回调
   */
  removeErrorCallback(errorCode: ErrorCode, callback: (error: PdfError) => void): void {
    const callbacks = this.errorCallbacks.get(errorCode)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): Record<ErrorCode, number> {
    const stats: Record<string, number> = {}
    for (const [code, count] of this.errorCounts.entries()) {
      stats[code] = count
    }
    return stats as Record<ErrorCode, number>
  }

  /**
   * 清除错误统计
   */
  clearErrorStats(): void {
    this.errorCounts.clear()
    this.lastErrors.clear()
  }

  /**
   * 检查是否应该重试
   */
  shouldRetry(errorCode: ErrorCode, currentRetries: number): boolean {
    const strategy = this.getRecoveryStrategy(errorCode)
    return currentRetries < strategy.maxRetries
  }

  /**
   * 计算重试延迟
   */
  calculateRetryDelay(errorCode: ErrorCode, retryCount: number): number {
    const strategy = this.getRecoveryStrategy(errorCode)
    return strategy.retryDelay * Math.pow(strategy.backoffMultiplier, retryCount)
  }

  // ============================================================================
  // 私有方法
  // ============================================================================

  /**
   * 标准化错误
   */
  private standardizeError(error: Error | PdfError): PdfError {
    if (this.isPdfError(error)) {
      return error
    }

    // 根据错误消息推断错误类型
    const errorCode = this.inferErrorCode(error)
    
    const pdfError = error as PdfError
    pdfError.code = errorCode
    pdfError.timestamp = Date.now()
    pdfError.context = pdfError.context || {}
    
    return pdfError
  }

  /**
   * 检查是否为PDF错误
   */
  private isPdfError(error: any): error is PdfError {
    return error && typeof error.code === 'string' && Object.values(ErrorCode).includes(error.code)
  }

  /**
   * 推断错误代码
   */
  private inferErrorCode(error: Error): ErrorCode {
    const message = error.message.toLowerCase()
    
    if (message.includes('network') || message.includes('fetch')) {
      return ErrorCode.NETWORK_ERROR
    }
    if (message.includes('permission') || message.includes('access')) {
      return ErrorCode.PERMISSION_ERROR
    }
    if (message.includes('memory') || message.includes('out of memory')) {
      return ErrorCode.MEMORY_ERROR
    }
    if (message.includes('timeout')) {
      return ErrorCode.TIMEOUT_ERROR
    }
    if (message.includes('parse') || message.includes('invalid')) {
      return ErrorCode.PARSE_ERROR
    }
    if (message.includes('render')) {
      return ErrorCode.RENDER_ERROR
    }
    if (message.includes('load')) {
      return ErrorCode.LOAD_ERROR
    }
    if (message.includes('cache')) {
      return ErrorCode.CACHE_ERROR
    }
    if (message.includes('worker')) {
      return ErrorCode.WORKER_ERROR
    }
    if (message.includes('validation') || message.includes('validate')) {
      return ErrorCode.VALIDATION_ERROR
    }
    
    return ErrorCode.UNKNOWN_ERROR
  }

  /**
   * 记录错误
   */
  private recordError(error: PdfError): void {
    const count = this.errorCounts.get(error.code) || 0
    this.errorCounts.set(error.code, count + 1)
    this.lastErrors.set(error.code, Date.now())
  }

  /**
   * 执行错误回调
   */
  private executeErrorCallbacks(error: PdfError): void {
    // 执行特定错误类型的回调
    const callbacks = this.errorCallbacks.get(error.code)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(error)
        } catch (callbackError) {
          console.error('Error in error callback:', callbackError)
        }
      })
    }
    
    // 执行全局错误回调
    if (this.globalErrorCallback) {
      try {
        this.globalErrorCallback(error)
      } catch (callbackError) {
        console.error('Error in global error callback:', callbackError)
      }
    }
  }

  /**
   * 记录错误日志
   */
  private logError(error: PdfError): void {
    const errorInfo = {
      code: error.code,
      message: error.message,
      timestamp: error.timestamp,
      context: error.context,
      stack: error.stack
    }
    
    console.error('[PdfErrorHandler] Error occurred:', errorInfo)
  }
}

/**
 * 创建PDF错误
 */
export function createPdfError(
  code: ErrorCode,
  message: string,
  context?: Record<string, any>
): PdfError {
  const error = new Error(message) as PdfError
  error.code = code
  error.timestamp = Date.now()
  error.context = context || {}
  return error
}

/**
 * 包装异步函数以处理错误
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorHandler: ErrorHandler,
  errorCode?: ErrorCode
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      const pdfError = error instanceof Error ? error as PdfError : new Error(String(error)) as PdfError
      if (errorCode && !pdfError.code) {
        pdfError.code = errorCode
      }
      errorHandler.handleError(pdfError)
      throw pdfError
    }
  }
}

/**
 * 重试函数
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  errorHandler: ErrorHandler,
  errorCode: ErrorCode,
  maxRetries?: number
): Promise<T> {
  const strategy = errorHandler.getRecoveryStrategy(errorCode)
  const retries = maxRetries ?? strategy.maxRetries
  
  let lastError: Error
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt === retries) {
        // 最后一次尝试失败
        const pdfError = lastError as PdfError
        pdfError.code = errorCode
        errorHandler.handleError(pdfError)
        throw pdfError
      }
      
      // 计算延迟并等待
      const delay = errorHandler.calculateRetryDelay(errorCode, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

/**
 * 默认错误处理器实例
 */
export const defaultErrorHandler = new PdfErrorHandler()

/**
 * 全局错误处理器设置
 */
export function setupGlobalErrorHandling(errorHandler: ErrorHandler = defaultErrorHandler): void {
  // 处理未捕获的Promise拒绝
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      const error = createPdfError(
        ErrorCode.UNKNOWN_ERROR,
        `Unhandled promise rejection: ${event.reason}`,
        { reason: event.reason }
      )
      errorHandler.handleError(error)
    })
    
    // 处理未捕获的错误
    window.addEventListener('error', (event) => {
      const error = createPdfError(
        ErrorCode.UNKNOWN_ERROR,
        `Unhandled error: ${event.message}`,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error
        }
      )
      errorHandler.handleError(error)
    })
  }
}