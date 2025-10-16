import type { Component } from 'vue'
import type { ErrorHandler, ErrorInfo, ErrorManager, Logger } from '../types'

// 错误恢复策略接口
export interface RecoveryStrategy {
  canRecover: (error: ErrorInfo) => boolean
  recover: (error: ErrorInfo) => Promise<boolean>
  priority: number
}

// 错误分类枚举
export enum ErrorCategory {
  NETWORK = 'network',
  COMPONENT = 'component',
  PLUGIN = 'plugin',
  STATE = 'state',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  UNKNOWN = 'unknown',
}

export class ErrorManagerImpl implements ErrorManager {
  private errorHandlers = new Set<ErrorHandler>()
  private errors: ErrorInfo[] = []
  private maxErrors = 100
  private errorCounts = new Map<string, number>()
  private recoveryStrategies = new Map<string, RecoveryStrategy>()
  private lastErrorTime = 0
  private errorBurst = 0

  constructor(private logger?: Logger) {
    this.setupDefaultRecoveryStrategies()
  }

  onError(handler: ErrorHandler): void {
    this.errorHandlers.add(handler)
  }

  offError(handler: ErrorHandler): void {
    this.errorHandlers.delete(handler)
  }

  captureError(error: Error, component?: unknown, info?: string): void {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      component,
      info,
      timestamp: Date.now(),
      level: 'error',
    }

    // 检测错误爆发
    this.detectErrorBurst()

    // 分类错误
    const category = this.categorizeError(errorInfo)

    // 统计错误
    this.updateErrorStats(errorInfo, category)

    // 添加到错误列表
    this.addError(errorInfo)

    // 尝试自动恢复
    this.attemptRecovery(errorInfo)

    // 通知所有错误处理器
    this.notifyHandlers(errorInfo)
  }

  private addError(errorInfo: ErrorInfo): void {
    this.errors.unshift(errorInfo)

    // 限制错误数量
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors)
    }
  }

  private notifyHandlers(errorInfo: ErrorInfo): void {
    for (const handler of this.errorHandlers) {
      try {
        handler(errorInfo)
      } catch (handlerError) {
        this.logger?.error('Error in error handler:', handlerError)
      }
    }
  }

  getErrors(): ErrorInfo[] {
    return [...this.errors]
  }

  hasErrors(): boolean {
    return this.errors.length > 0
  }

  clearErrors(): void {
    this.errors = []
  }

  // 处理错误（兼容方法）
  handle(error: Error, context?: string): void {
    this.captureError(error, undefined, context)
  }

  // 设置最大错误数量
  setMaxErrors(max: number): void {
    this.maxErrors = max
    if (this.errors.length > max) {
      this.errors = this.errors.slice(0, max)
    }
  }

  // 获取最大错误数量
  getMaxErrors(): number {
    return this.maxErrors
  }

  // 按级别获取错误
  getErrorsByLevel(level: ErrorInfo['level']): ErrorInfo[] {
    return this.errors.filter(error => error.level === level)
  }

  // 按时间范围获取错误
  getErrorsByTimeRange(startTime: number, endTime: number): ErrorInfo[] {
    return this.errors.filter(
      error => error.timestamp >= startTime && error.timestamp <= endTime
    )
  }

  // 获取最近的错误
  getRecentErrors(count: number): ErrorInfo[] {
    return this.errors.slice(0, count)
  }

  // 搜索错误
  searchErrors(query: string): ErrorInfo[] {
    const lowerQuery = query.toLowerCase()
    return this.errors.filter(
      error =>
        error.message.toLowerCase().includes(lowerQuery) ||
        (error.stack && error.stack.toLowerCase().includes(lowerQuery)) ||
        (error.info && error.info.toLowerCase().includes(lowerQuery))
    )
  }

  // 获取错误统计
  getErrorStats(): {
    total: number
    byLevel: Record<string, number>
    recent24h: number
    recentHour: number
  } {
    const now = Date.now()
    const hour = 60 * 60 * 1000
    const day = 24 * hour

    const byLevel: Record<string, number> = {
      error: 0,
      warn: 0,
      info: 0,
    }

    let recent24h = 0
    let recentHour = 0

    for (const error of this.errors) {
      byLevel[error.level]++

      if (now - error.timestamp <= day) {
        recent24h++
      }

      if (now - error.timestamp <= hour) {
        recentHour++
      }
    }

    return {
      total: this.errors.length,
      byLevel,
      recent24h,
      recentHour,
    }
  }

  // 导出错误日志
  exportErrors(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.errors, null, 2)
    } else {
      const headers = ['timestamp', 'level', 'message', 'stack', 'info']
      const rows = this.errors.map(error => [
        new Date(error.timestamp).toISOString(),
        error.level,
        `"${error.message.replace(/"/g, '""')}"`,
        `"${(error.stack || '').replace(/"/g, '""')}"`,
        `"${(error.info || '').replace(/"/g, '""')}"`,
      ])

      return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    }
  }

  // 创建错误报告
  createErrorReport(): {
    summary: ReturnType<ErrorManagerImpl['getErrorStats']>
    recentErrors: ErrorInfo[]
    topErrors: Array<{ message: string; count: number }>
  } {
    const summary = this.getErrorStats()
    const recentErrors = this.getRecentErrors(10)

    // 统计最常见的错误
    const errorCounts = new Map<string, number>()
    for (const error of this.errors) {
      const count = errorCounts.get(error.message) || 0
      errorCounts.set(error.message, count + 1)
    }

    const topErrors = Array.from(errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([message, count]) => ({ message, count }))

    return {
      summary,
      recentErrors,
      topErrors,
    }
  }

  // 设置默认恢复策略
  private setupDefaultRecoveryStrategies(): void {
    // 网络错误恢复策略
    this.recoveryStrategies.set('network', {
      canRecover: error =>
        error.message.includes('network') || error.message.includes('fetch'),
      recover: async error => {
        this.logger?.info('Attempting network error recovery', error)
        // 简单的重试逻辑
        return new Promise(resolve => setTimeout(() => resolve(true), 1000))
      },
      priority: 1,
    })

    // 组件错误恢复策略
    this.recoveryStrategies.set('component', {
      canRecover: error => !!error.component,
      recover: async error => {
        this.logger?.info('Attempting component error recovery', error)
        // 组件重新渲染逻辑
        return true
      },
      priority: 2,
    })
  }

  // 检测错误爆发
  private detectErrorBurst(): void {
    const now = Date.now()
    const timeDiff = now - this.lastErrorTime

    if (timeDiff < 1000) {
      // 1秒内
      this.errorBurst++
      if (this.errorBurst > 10) {
        this.logger?.warn('Error burst detected', { count: this.errorBurst })
      }
    } else {
      this.errorBurst = 1
    }

    this.lastErrorTime = now
  }

  // 分类错误
  private categorizeError(error: ErrorInfo): ErrorCategory {
    const message = error.message.toLowerCase()

    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('xhr')
    ) {
      return ErrorCategory.NETWORK
    }

    if (error.component) {
      return ErrorCategory.COMPONENT
    }

    if (message.includes('plugin')) {
      return ErrorCategory.PLUGIN
    }

    if (message.includes('state') || message.includes('store')) {
      return ErrorCategory.STATE
    }

    if (
      message.includes('security') ||
      message.includes('xss') ||
      message.includes('csrf')
    ) {
      return ErrorCategory.SECURITY
    }

    if (
      message.includes('performance') ||
      message.includes('memory') ||
      message.includes('timeout')
    ) {
      return ErrorCategory.PERFORMANCE
    }

    return ErrorCategory.UNKNOWN
  }

  // 更新错误统计
  private updateErrorStats(error: ErrorInfo, category: ErrorCategory): void {
    const key = `${category}:${error.message}`
    const count = this.errorCounts.get(key) || 0
    this.errorCounts.set(key, count + 1)

    // 如果同一错误频繁出现，记录警告
    if (count > 5) {
      this.logger?.warn('Frequent error detected', {
        category,
        message: error.message,
        count: count + 1,
      })
    }
  }

  // 尝试自动恢复
  private async attemptRecovery(error: ErrorInfo): Promise<boolean> {
    const strategies = Array.from(this.recoveryStrategies.values())
      .filter(strategy => strategy.canRecover(error))
      .sort((a, b) => a.priority - b.priority)

    for (const strategy of strategies) {
      try {
        const recovered = await strategy.recover(error)
        if (recovered) {
          this.logger?.info('Error recovery successful', error)
          return true
        }
      } catch (recoveryError) {
        this.logger?.error('Error recovery failed', recoveryError)
      }
    }

    return false
  }

  // 获取错误分类统计
  getCategoryStats(): Record<ErrorCategory, number> {
    const stats = {} as Record<ErrorCategory, number>

    for (const category of Object.values(ErrorCategory)) {
      stats[category] = 0
    }

    for (const [key, count] of this.errorCounts) {
      const category = key.split(':')[0] as ErrorCategory
      if (category in stats) {
        stats[category] += count
      }
    }

    return stats
  }
}

export function createErrorManager(logger?: Logger): ErrorManager {
  return new ErrorManagerImpl(logger)
}

  // 预定义的错误处理器
export const errorHandlers = {
  // 控制台错误处理器
  console: (errorInfo: ErrorInfo) => {
    const errorData = {
      message: errorInfo.message,
      timestamp: new Date(errorInfo.timestamp).toISOString(),
      component: errorInfo.component,
      info: errorInfo.info,
      stack: errorInfo.stack,
    }

    if (errorInfo.level === 'error') {
      console.error('Engine Error:', errorData)
    } else if (errorInfo.level === 'warn') {
      console.warn('Engine Warning:', errorData)
    } else {
      console.info('Engine Info:', errorData)
    }
  },

  // 通知错误处理器
  notification: (notificationManager: { show: (options: { type: string; title: string; message: string; duration?: number }) => void }) => (errorInfo: ErrorInfo) => {
    if (errorInfo.level === 'error') {
      notificationManager.show({
        type: 'error',
        title: 'Application Error',
        message: errorInfo.message,
        duration: 5000,
      })
    }
  },

  // 远程上报错误处理器
  remote:
    (config: { endpoint: string; apiKey?: string }) =>
      async (errorInfo: ErrorInfo) => {
        try {
          const payload = {
            ...errorInfo,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date(errorInfo.timestamp).toISOString(),
          }

          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          }

          if (config.apiKey) {
            headers.Authorization = `Bearer ${config.apiKey}`
          }

          await fetch(config.endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
          })
        } catch (error) {
          console.error('Failed to report error to remote service:', error)
        }
      },

  // 本地存储错误处理器
  localStorage:
    (key = 'engine-errors') =>
      (errorInfo: ErrorInfo) => {
        try {
          const stored = localStorage.getItem(key)
          const errors = stored ? JSON.parse(stored) : []

          errors.unshift(errorInfo)

          // 限制存储的错误数量
          if (errors.length > 50) {
            errors.splice(50)
          }

          localStorage.setItem(key, JSON.stringify(errors))
        } catch (error) {
          console.error('Failed to store error in localStorage:', error)
        }
      },
}

// 错误边界组件工厂
export function createErrorBoundary(errorManager: ErrorManager) {
  return {
    name: 'ErrorBoundary',
    data() {
      return {
        hasError: false,
        error: null as Error | null,
      }
    },
    errorCaptured(error: Error, component: Component, info: string) {
      ; (this as unknown as { hasError: boolean; error: Error | null }).hasError = true
        ; (this as unknown as { hasError: boolean; error: Error | null }).error = error

      // 捕获错误到错误管理器
      errorManager.captureError(error, component, info)

      // 阻止错误继续传播
      return false
    },
    render() {
      const self = this as unknown as { hasError: boolean; error: Error | null; $slots: { fallback?: (arg: { error: Error | null }) => unknown; default?: () => unknown } }
      if (self.hasError) {
        return (
          self.$slots.fallback?.({ error: self.error }) ||
          'Something went wrong. Please try again.'
        )
      }

      return self.$slots.default?.()
    },
  }
}
