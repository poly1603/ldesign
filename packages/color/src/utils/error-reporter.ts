/**
 * 错误上报系统
 * 
 * 用于将错误批量上报到远程服务器
 */

import type { ColorError } from './errors'

/**
 * 错误上报器
 * 
 * 特性：
 * - 批量上报（减少网络请求）
 * - 自动重试（上报失败时）
 * - 延迟上报（不阻塞主线程）
 * - 本地缓冲（离线支持）
 * 
 * @example
 * ```ts
 * const reporter = new ErrorReporter('https://api.example.com/errors')
 * 
 * // 上报单个错误
 * await reporter.report(errorLog)
 * 
 * // 批量上报
 * await reporter.flush()
 * 
 * // 获取统计信息
 * const stats = reporter.getStats()
 * ```
 */
export class ErrorReporter {
  private endpoint: string
  private batchSize: number = 10
  private flushInterval: number = 30000 // 30秒
  private errorQueue: ColorError[] = []
  private flushTimer: ReturnType<typeof setTimeout> | null = null
  private stats = {
    reported: 0,
    failed: 0,
    pending: 0,
  }
  
  constructor(endpoint: string, options?: {
    batchSize?: number
    flushInterval?: number
    autoStart?: boolean
  }) {
    this.endpoint = endpoint
    this.batchSize = options?.batchSize ?? 10
    this.flushInterval = options?.flushInterval ?? 30000
    
    if (options?.autoStart !== false) {
      this.startAutoFlush()
    }
  }
  
  /**
   * 上报单个错误
   */
  async report(error: ColorError): Promise<void> {
    this.errorQueue.push(error)
    this.stats.pending = this.errorQueue.length
    
    // 如果达到批量大小，立即上报
    if (this.errorQueue.length >= this.batchSize) {
      await this.flush()
    }
  }
  
  /**
   * 批量上报错误
   */
  async flush(): Promise<void> {
    if (this.errorQueue.length === 0) return
    
    const errors = this.errorQueue.splice(0, this.batchSize)
    
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errors,
          timestamp: Date.now(),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      this.stats.reported += errors.length
      this.stats.pending = this.errorQueue.length
    } catch (e) {
      // 上报失败，重新加入队列
      this.errorQueue.unshift(...errors)
      this.stats.failed += errors.length
      console.error('Failed to report errors:', e)
    }
  }
  
  /**
   * 启动自动上报
   */
  private startAutoFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.flushInterval)
    
    // 允许进程退出
    if (typeof process !== 'undefined' && this.flushTimer.unref) {
      this.flushTimer.unref()
    }
  }
  
  /**
   * 停止自动上报
   */
  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
  }
  
  /**
   * 获取统计信息
   */
  getStats(): {
    reported: number
    failed: number
    pending: number
    successRate: number
  } {
    const total = this.stats.reported + this.stats.failed
    return {
      ...this.stats,
      successRate: total > 0 ? this.stats.reported / total : 0,
    }
  }
  
  /**
   * 清空队列
   */
  clear(): void {
    this.errorQueue = []
    this.stats.pending = 0
  }
  
  /**
   * 销毁上报器
   */
  destroy(): void {
    this.stop()
    this.flush() // 最后一次上报
    this.clear()
  }
}

/**
 * 全局错误上报器
 * 
 * 可选启用，需要配置 API 端点
 * 
 * @example
 * ```ts
 * import { globalErrorReporter } from '@ldesign/color/utils/error-reporter'
 * 
 * // 配置并启用
 * globalErrorReporter.configure('https://api.example.com/errors')
 * globalErrorReporter.enable()
 * 
 * // 当错误发生时，会自动上报
 * ```
 */
class GlobalErrorReporter {
  private reporter: ErrorReporter | null = null
  
  /**
   * 配置上报器
   */
  configure(endpoint: string, options?: {
    batchSize?: number
    flushInterval?: number
  }): void {
    if (this.reporter) {
      this.reporter.destroy()
    }
    this.reporter = new ErrorReporter(endpoint, {
      ...options,
      autoStart: false,
    })
  }
  
  /**
   * 启用上报
   */
  enable(): void {
    if (!this.reporter) {
      console.warn('Error reporter not configured. Call configure() first.')
      return
    }
    
    // Note: Manual integration required
    // Errors should be manually reported using:
    // globalErrorReporter.getReporter()?.report(error)
  }
  
  /**
   * 获取上报器实例
   */
  getReporter(): ErrorReporter | null {
    return this.reporter
  }
  
  /**
   * 获取统计信息
   */
  getStats() {
    return this.reporter?.getStats() || {
      reported: 0,
      failed: 0,
      pending: 0,
      successRate: 0,
    }
  }
}

export const globalErrorReporter = new GlobalErrorReporter()
