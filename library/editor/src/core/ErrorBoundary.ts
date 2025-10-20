/**
 * 错误边界
 * 捕获和处理插件错误，防止影响整个编辑器
 */

import { EventEmitter } from './EventEmitter'
import { createLogger } from '../utils/logger'

const logger = createLogger('ErrorBoundary')

export interface ErrorInfo {
  error: Error
  source: string
  timestamp: number
  recovered: boolean
  context?: Record<string, any>
}

export interface ErrorBoundaryConfig {
  maxErrors?: number
  recoveryAttempts?: number
  reportErrors?: boolean
  onError?: (info: ErrorInfo) => void
}

/**
 * 错误边界类
 */
export class ErrorBoundary extends EventEmitter {
  private config: ErrorBoundaryConfig
  private errors: ErrorInfo[] = []
  private errorCounts: Map<string, number> = new Map()
  private maxHistorySize: number = 100
  
  constructor(config: ErrorBoundaryConfig = {}) {
    super()
    this.config = {
      maxErrors: 10,
      recoveryAttempts: 3,
      reportErrors: true,
      ...config
    }
  }
  
  /**
   * 捕获错误
   */
  captureError(error: Error, source: string, context?: Record<string, any>): ErrorInfo {
    const info: ErrorInfo = {
      error,
      source,
      timestamp: Date.now(),
      recovered: false,
      context
    }
    
    // 记录错误
    this.errors.push(info)
    
    // 限制历史记录大小
    if (this.errors.length > this.maxHistorySize) {
      this.errors.shift()
    }
    
    // 更新错误计数
    const count = (this.errorCounts.get(source) || 0) + 1
    this.errorCounts.set(source, count)
    
    // 记录日志
    logger.error(`Error in ${source}:`, error)
    if (context) {
      logger.error('Context:', context)
    }
    
    // 触发回调
    if (this.config.onError) {
      this.config.onError(info)
    }
    
    // 触发事件
    this.emit('error', info)
    
    // 检查是否超过最大错误数
    if (count >= this.config.maxErrors!) {
      this.emit('max-errors-exceeded', { source, count })
      logger.warn(`Source "${source}" has exceeded max errors (${count})`)
    }
    
    return info
  }
  
  /**
   * 包装函数，自动捕获错误
   */
  wrap<T extends (...args: any[]) => any>(
    fn: T,
    source: string,
    fallback?: (...args: Parameters<T>) => ReturnType<T>
  ): T {
    return ((...args: Parameters<T>) => {
      try {
        const result = fn(...args)
        
        // 处理Promise
        if (result instanceof Promise) {
          return result.catch(error => {
            this.captureError(error, source)
            
            if (fallback) {
              return fallback(...args)
            }
            
            throw error
          })
        }
        
        return result
      } catch (error) {
        this.captureError(error as Error, source)
        
        if (fallback) {
          return fallback(...args)
        }
        
        throw error
      }
    }) as T
  }
  
  /**
   * 尝试恢复
   */
  async tryRecover<T>(
    fn: () => T | Promise<T>,
    source: string,
    options: {
      attempts?: number
      delay?: number
      onRetry?: (attempt: number, error: Error) => void
    } = {}
  ): Promise<T> {
    const attempts = options.attempts || this.config.recoveryAttempts!
    const delay = options.delay || 1000
    
    let lastError: Error
    
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const result = await fn()
        
        // 恢复成功
        if (attempt > 1) {
          logger.info(`Recovered from error in ${source} after ${attempt} attempts`)
          this.emit('recovered', { source, attempts: attempt })
        }
        
        return result
      } catch (error) {
        lastError = error as Error
        
        // 记录错误
        this.captureError(lastError, source, {
          attempt,
          totalAttempts: attempts
        })
        
        if (attempt < attempts) {
          if (options.onRetry) {
            options.onRetry(attempt, lastError)
          }
          
          // 等待后重试
          await new Promise(resolve => setTimeout(resolve, delay * attempt))
        }
      }
    }
    
    // 所有尝试都失败
    logger.error(`Failed to recover from error in ${source} after ${attempts} attempts`)
    this.emit('recovery-failed', { source, attempts })
    
    throw lastError!
  }
  
  /**
   * 获取错误历史
   */
  getErrors(source?: string): ErrorInfo[] {
    if (source) {
      return this.errors.filter(e => e.source === source)
    }
    return [...this.errors]
  }
  
  /**
   * 获取错误计数
   */
  getErrorCount(source?: string): number {
    if (source) {
      return this.errorCounts.get(source) || 0
    }
    return Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0)
  }
  
  /**
   * 获取错误率
   */
  getErrorRate(source: string, timeWindow: number = 60000): number {
    const now = Date.now()
    const recentErrors = this.errors.filter(e => 
      e.source === source && (now - e.timestamp) <= timeWindow
    )
    
    return recentErrors.length / (timeWindow / 1000) // 每秒错误数
  }
  
  /**
   * 检查源是否健康
   */
  isHealthy(source: string): boolean {
    const count = this.errorCounts.get(source) || 0
    const rate = this.getErrorRate(source)
    
    return count < this.config.maxErrors! && rate < 1
  }
  
  /**
   * 重置错误计数
   */
  resetErrors(source?: string): void {
    if (source) {
      this.errorCounts.delete(source)
      this.errors = this.errors.filter(e => e.source !== source)
    } else {
      this.errorCounts.clear()
      this.errors = []
    }
  }
  
  /**
   * 生成错误报告
   */
  generateReport(): string {
    const totalErrors = this.getErrorCount()
    const sources = Array.from(this.errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
    
    let report = `错误边界报告\n`
    report += `=============\n\n`
    report += `总错误数: ${totalErrors}\n`
    report += `错误源数: ${sources.length}\n\n`
    
    report += `错误统计:\n`
    sources.forEach(([source, count]) => {
      const rate = this.getErrorRate(source).toFixed(2)
      const healthy = this.isHealthy(source) ? '✓' : '✗'
      report += `  ${healthy} ${source}: ${count} (${rate}/s)\n`
    })
    
    report += `\n最近错误:\n`
    this.errors.slice(-10).forEach(error => {
      const time = new Date(error.timestamp).toLocaleTimeString()
      report += `  [${time}] ${error.source}: ${error.error.message}\n`
    })
    
    return report
  }
  
  /**
   * 清理
   */
  destroy(): void {
    this.errors = []
    this.errorCounts.clear()
    this.removeAllListeners()
  }
}

// 全局实例
let globalBoundary: ErrorBoundary | null = null

/**
 * 获取全局错误边界
 */
export function getErrorBoundary(config?: ErrorBoundaryConfig): ErrorBoundary {
  if (!globalBoundary) {
    globalBoundary = new ErrorBoundary(config)
  }
  return globalBoundary
}

/**
 * 便捷函数：捕获错误
 */
export function captureError(error: Error, source: string, context?: Record<string, any>): void {
  getErrorBoundary().captureError(error, source, context)
}

/**
 * 便捷函数：包装函数
 */
export function withErrorBoundary<T extends (...args: any[]) => any>(
  fn: T,
  source: string,
  fallback?: (...args: Parameters<T>) => ReturnType<T>
): T {
  return getErrorBoundary().wrap(fn, source, fallback)
}





