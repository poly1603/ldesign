/**
 * Enhanced Error Handling System
 * 
 * Comprehensive error boundaries and recovery mechanisms
 */

import type { Component } from 'vue'
import { defineComponent, h, ref, computed } from 'vue'

/**
 * Template error types
 */
export enum TemplateErrorType {
  LOAD_ERROR = 'LOAD_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  TIMEOUT = 'TIMEOUT',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Template error class with enhanced details
 */
export class TemplateError extends Error {
  public readonly type: TemplateErrorType
  public readonly code: string
  public readonly details?: Record<string, any>
  public readonly retryable: boolean
  public readonly timestamp: Date
  public readonly context?: {
    category?: string
    device?: string
    template?: string
    [key: string]: any
  }

  constructor(
    message: string,
    type: TemplateErrorType = TemplateErrorType.UNKNOWN,
    options?: {
      code?: string
      details?: Record<string, any>
      retryable?: boolean
      context?: Record<string, any>
      cause?: Error
    }
  ) {
    super(message)
    this.name = 'TemplateError'
    this.type = type
    this.code = options?.code || type
    this.details = options?.details
    this.retryable = options?.retryable ?? true
    this.timestamp = new Date()
    this.context = options?.context
    
    // Set cause if provided (ES2022)
    if (options?.cause) {
      (this as any).cause = options.cause
    }
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TemplateError)
    }
  }
  
  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    switch (this.type) {
      case TemplateErrorType.LOAD_ERROR:
        return '模板加载失败，请稍后重试'
      case TemplateErrorType.NOT_FOUND:
        return '找不到请求的模板'
      case TemplateErrorType.NETWORK_ERROR:
        return '网络连接失败，请检查网络设置'
      case TemplateErrorType.PARSE_ERROR:
        return '模板解析错误，请联系管理员'
      case TemplateErrorType.TIMEOUT:
        return '加载超时，请重试'
      case TemplateErrorType.PERMISSION_DENIED:
        return '没有访问该模板的权限'
      default:
        return '发生未知错误'
    }
  }
  
  /**
   * Get recovery suggestions
   */
  getRecoverySuggestions(): string[] {
    const suggestions: string[] = []
    
    switch (this.type) {
      case TemplateErrorType.NETWORK_ERROR:
        suggestions.push('检查网络连接')
        suggestions.push('尝试刷新页面')
        suggestions.push('稍后重试')
        break
      case TemplateErrorType.NOT_FOUND:
        suggestions.push('检查模板名称是否正确')
        suggestions.push('使用默认模板')
        suggestions.push('联系技术支持')
        break
      case TemplateErrorType.TIMEOUT:
        suggestions.push('检查网络速度')
        suggestions.push('减少并发请求')
        suggestions.push('稍后重试')
        break
      case TemplateErrorType.PERMISSION_DENIED:
        suggestions.push('检查用户权限')
        suggestions.push('联系管理员')
        break
      default:
        suggestions.push('刷新页面重试')
        suggestions.push('清除浏览器缓存')
        suggestions.push('联系技术支持')
    }
    
    return suggestions
  }
  
  /**
   * Convert to plain object for serialization
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      code: this.code,
      details: this.details,
      retryable: this.retryable,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack
    }
  }
}

/**
 * Error recovery strategies
 */
export interface ErrorRecoveryStrategy {
  canRecover(error: TemplateError): boolean
  recover(error: TemplateError): Promise<void>
  priority: number
}

/**
 * Default recovery strategies
 */
export const defaultRecoveryStrategies: ErrorRecoveryStrategy[] = [
  {
    // Retry strategy for network errors
    canRecover: (error) => error.type === TemplateErrorType.NETWORK_ERROR && error.retryable,
    recover: async (error) => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      // Retry logic would be implemented by the caller
    },
    priority: 1
  },
  {
    // Fallback to default template
    canRecover: (error) => error.type === TemplateErrorType.NOT_FOUND,
    recover: async (error) => {
      // Load default template instead
      if (error.context?.category) {
        // This would be handled by the template manager
      }
    },
    priority: 2
  },
  {
    // Clear cache and retry
    canRecover: (error) => error.type === TemplateErrorType.PARSE_ERROR,
    recover: async (error) => {
      // Clear cache
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('template-cache')
      }
    },
    priority: 3
  }
]

/**
 * Error recovery manager
 */
export class ErrorRecoveryManager {
  private strategies: ErrorRecoveryStrategy[] = []
  private retryCount = new Map<string, number>()
  private readonly maxRetries = 3
  
  constructor(strategies: ErrorRecoveryStrategy[] = defaultRecoveryStrategies) {
    this.strategies = [...strategies].sort((a, b) => a.priority - b.priority)
  }
  
  /**
   * Add recovery strategy
   */
  addStrategy(strategy: ErrorRecoveryStrategy) {
    this.strategies.push(strategy)
    this.strategies.sort((a, b) => a.priority - b.priority)
  }
  
  /**
   * Attempt to recover from error
   */
  async recover(error: TemplateError): Promise<boolean> {
    const errorKey = `${error.type}-${error.code}`
    const retries = this.retryCount.get(errorKey) || 0
    
    if (retries >= this.maxRetries) {
      return false
    }
    
    for (const strategy of this.strategies) {
      if (strategy.canRecover(error)) {
        try {
          await strategy.recover(error)
          this.retryCount.set(errorKey, retries + 1)
          return true
        } catch (recoveryError) {
          console.error('Recovery strategy failed:', recoveryError)
        }
      }
    }
    
    return false
  }
  
  /**
   * Reset retry count
   */
  resetRetryCount(error?: TemplateError) {
    if (error) {
      const errorKey = `${error.type}-${error.code}`
      this.retryCount.delete(errorKey)
    } else {
      this.retryCount.clear()
    }
  }
}

/**
 * Create error boundary component
 */
export function createErrorBoundary(options?: {
  onError?: (error: TemplateError) => void
  fallback?: Component
  recovery?: ErrorRecoveryManager
}) {
  return defineComponent({
    name: 'TemplateErrorBoundary',
    props: {
      tag: {
        type: String,
        default: 'div'
      }
    },
    setup(props, { slots }) {
      const error = ref<TemplateError | null>(null)
      const recovering = ref(false)
      
      const hasError = computed(() => error.value !== null)
      
      const handleError = async (err: Error) => {
        // Convert to TemplateError if needed
        const templateError = err instanceof TemplateError 
          ? err 
          : new TemplateError(err.message, TemplateErrorType.UNKNOWN, {
              cause: err
            })
        
        error.value = templateError
        options?.onError?.(templateError)
        
        // Attempt recovery if available
        if (options?.recovery && !recovering.value) {
          recovering.value = true
          const recovered = await options.recovery.recover(templateError)
          if (recovered) {
            error.value = null
          }
          recovering.value = false
        }
      }
      
      const retry = () => {
        error.value = null
        // Force re-render
      }
      
      const renderError = () => {
        if (options?.fallback) {
          return h(options.fallback, {
            error: error.value,
            retry,
            recovering: recovering.value
          })
        }
        
        // Default error UI
        return h('div', { class: 'template-error-boundary' }, [
          h('div', { class: 'error-icon' }, '⚠️'),
          h('h3', error.value?.getUserMessage()),
          h('p', { class: 'error-details' }, error.value?.message),
          error.value?.retryable && h('button', {
            class: 'error-retry-btn',
            onClick: retry
          }, recovering.value ? '恢复中...' : '重试'),
          h('details', { class: 'error-suggestions' }, [
            h('summary', '解决建议'),
            h('ul', error.value?.getRecoverySuggestions().map(
              suggestion => h('li', suggestion)
            ))
          ])
        ])
      }
      
      // Provide error handler to children
      // Children can call this via inject
      provide('handleError', handleError)
      
      return () => {
        if (hasError.value) {
          return renderError()
        }
        
        try {
          return h(props.tag, slots.default?.())
        } catch (err) {
          handleError(err as Error)
          return renderError()
        }
      }
    }
  })
}

/**
 * Global error handler
 */
export class GlobalTemplateErrorHandler {
  private static instance: GlobalTemplateErrorHandler
  private errorLog: TemplateError[] = []
  private readonly maxLogSize = 100
  private listeners: Set<(error: TemplateError) => void> = new Set()
  
  private constructor() {}
  
  static getInstance(): GlobalTemplateErrorHandler {
    if (!GlobalTemplateErrorHandler.instance) {
      GlobalTemplateErrorHandler.instance = new GlobalTemplateErrorHandler()
    }
    return GlobalTemplateErrorHandler.instance
  }
  
  /**
   * Log error
   */
  logError(error: TemplateError) {
    this.errorLog.push(error)
    
    // Keep log size under control
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift()
    }
    
    // Notify listeners
    this.listeners.forEach(listener => listener(error))
    
    // Send to remote logging if in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToRemote(error)
    }
  }
  
  /**
   * Get error log
   */
  getErrorLog(): TemplateError[] {
    return [...this.errorLog]
  }
  
  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = []
  }
  
  /**
   * Subscribe to errors
   */
  subscribe(listener: (error: TemplateError) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
  
  /**
   * Send error to remote logging service
   */
  private async sendToRemote(error: TemplateError) {
    // Implement remote logging
    // This is a placeholder
    try {
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   body: JSON.stringify(error.toJSON())
      // })
    } catch {
      // Silently fail remote logging
    }
  }
  
  /**
   * Get error statistics
   */
  getStatistics() {
    const stats = {
      total: this.errorLog.length,
      byType: {} as Record<TemplateErrorType, number>,
      retryable: 0,
      recent: this.errorLog.slice(-10)
    }
    
    for (const error of this.errorLog) {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1
      if (error.retryable) stats.retryable++
    }
    
    return stats
  }
}

// Export singleton instance
export const globalErrorHandler = GlobalTemplateErrorHandler.getInstance()

import { provide } from 'vue'