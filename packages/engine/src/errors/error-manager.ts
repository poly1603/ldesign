import type { Component } from 'vue'
import type { ErrorManager, ErrorInfo, ErrorHandler, Logger } from '../types'

export class ErrorManagerImpl implements ErrorManager {
  private errorHandlers = new Set<ErrorHandler>()
  private errors: ErrorInfo[] = []
  private maxErrors = 100

  constructor(_logger?: Logger) {
    // logger参数保留用于未来扩展
  }

  onError(handler: ErrorHandler): void {
    this.errorHandlers.add(handler)
  }

  offError(handler: ErrorHandler): void {
    this.errorHandlers.delete(handler)
  }

  captureError(error: Error, component?: Component, info?: string): void {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      component,
      info,
      timestamp: Date.now(),
      level: 'error'
    }

    // 添加到错误列表
    this.addError(errorInfo)

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
        console.error('Error in error handler:', handlerError)
      }
    }
  }

  getErrors(): ErrorInfo[] {
    return [...this.errors]
  }

  clearErrors(): void {
    this.errors = []
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
    return this.errors.filter(error => 
      error.timestamp >= startTime && error.timestamp <= endTime
    )
  }

  // 获取最近的错误
  getRecentErrors(count: number): ErrorInfo[] {
    return this.errors.slice(0, count)
  }

  // 搜索错误
  searchErrors(query: string): ErrorInfo[] {
    const lowerQuery = query.toLowerCase()
    return this.errors.filter(error => 
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
      info: 0
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
      recentHour
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
        `"${(error.info || '').replace(/"/g, '""')}"`
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
      topErrors
    }
  }
}

export function createErrorManager(logger?: Logger): ErrorManager {
  return new ErrorManagerImpl(logger)
}

// 预定义的错误处理器
export const errorHandlers = {
  // 控制台错误处理器
  console: (errorInfo: ErrorInfo) => {
    const method = errorInfo.level === 'error' ? 'error' : 
                  errorInfo.level === 'warn' ? 'warn' : 'info'
    
    console[method]('Engine Error:', {
      message: errorInfo.message,
      timestamp: new Date(errorInfo.timestamp).toISOString(),
      component: errorInfo.component,
      info: errorInfo.info,
      stack: errorInfo.stack
    })
  },

  // 通知错误处理器
  notification: (notificationManager: any) => (errorInfo: ErrorInfo) => {
    if (errorInfo.level === 'error') {
      notificationManager.show({
        type: 'error',
        title: 'Application Error',
        message: errorInfo.message,
        duration: 5000
      })
    }
  },

  // 远程上报错误处理器
  remote: (config: { endpoint: string; apiKey?: string }) => async (errorInfo: ErrorInfo) => {
    try {
      const payload = {
        ...errorInfo,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date(errorInfo.timestamp).toISOString()
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      if (config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`
      }

      await fetch(config.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })
    } catch (error) {
      console.error('Failed to report error to remote service:', error)
    }
  },

  // 本地存储错误处理器
  localStorage: (key = 'engine-errors') => (errorInfo: ErrorInfo) => {
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
  }
}

// 错误边界组件工厂
export function createErrorBoundary(errorManager: ErrorManager) {
  return {
    name: 'ErrorBoundary',
    data() {
      return {
        hasError: false,
        error: null as Error | null
      }
    },
    errorCaptured(error: Error, component: Component, info: string) {
      (this as any).hasError = true;
      (this as any).error = error
      
      // 捕获错误到错误管理器
      errorManager.captureError(error, component, info)
      
      // 阻止错误继续传播
      return false
    },
    render() {
      const self = this as any
      if (self.hasError) {
        return self.$slots.fallback?.({ error: self.error }) || 
               'Something went wrong. Please try again.'
      }
      
      return self.$slots.default?.()
    }
  }
}