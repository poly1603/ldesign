/**
 * HTTP开发工具
 *
 * 提供请求监控、性能分析、调试等开发工具
 */

import type { HttpClient, HttpError, RequestConfig, ResponseData } from '../types'
import { logger } from '../utils/logger'

// 浏览器兼容的 process.env 访问
const isBrowser = typeof window !== 'undefined'
const env = isBrowser ? (import.meta.env || {}) : (globalThis.process?.env || {})

/**
 * 请求记录
 */
export interface RequestRecord {
  id: string
  timestamp: number
  config: RequestConfig
  duration?: number
  response?: ResponseData<any>
  error?: HttpError
  status: 'pending' | 'success' | 'error' | 'cancelled'
}

/**
 * 开发工具配置
 */
export interface DevToolsConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 最大记录数 */
  maxRecords?: number
  /** 是否显示console */
  showConsole?: boolean
  /** 是否在浏览器console显示 */
  logToConsole?: boolean
  /** 性能阈值(ms) */
  performanceThreshold?: number
}

/**
 * HTTP开发工具
 *
 * @example
 * ```typescript
 * // 创建开发工具
 * const devtools = new HttpDevTools({
 *   enabled: process.env.NODE_ENV === 'development',
 *   maxRecords: 100
 * })
 *
 * // 附加到客户端
 * devtools.attach(client)
 *
 * // 查看请求记录
 * )
 *
 * // 查看统计
 * )
 *
 * // 导出数据
 * devtools.export()
 * ```
 */
export class HttpDevTools {
  private config: Required<DevToolsConfig>
  private records: RequestRecord[] = []
  private client: HttpClient | null = null
  private interceptorIds: { request: number, response: number, error: number } | null = null

  constructor(config: DevToolsConfig = {}) {
    this.config = {
      enabled: config.enabled ?? (env.NODE_ENV !== 'production' && env.MODE !== 'production'),
      maxRecords: config.maxRecords ?? 100,
      showConsole: config.showConsole ?? true,
      logToConsole: config.logToConsole ?? true,
      performanceThreshold: config.performanceThreshold ?? 1000,
    }

    // 在浏览器中暴露到window
    if (typeof window !== 'undefined' && this.config?.enabled) {
      ; (window as any).__HTTP_DEVTOOLS__ = this
    }
  }

  /**
   * 附加到HTTP客户端
   */
  attach(client: HttpClient): void {
    if (!this.config?.enabled || this.client) {
      return
    }

    this.client = client

    // 添加拦截器
    const requestId = client.addRequestInterceptor((config: RequestConfig) => {
      this.onRequestStart(config)
      return config
    })

    const responseId = client.addResponseInterceptor((response: ResponseData<any>) => {
      this.onRequestSuccess(response)
      return response
    }, (error: HttpError) => {
      this.onRequestError(error)
      throw error
    })

    this.interceptorIds = {
      request: requestId,
      response: responseId,
      error: -1,
    }

    if (this.config?.logToConsole) {
      logger.info('DevTools attached to HTTP client')
    }
  }

  /**
   * 分离
   */
  detach(): void {
    if (!this.client || !this.interceptorIds) {
      return
    }

    this.client.removeRequestInterceptor(this.interceptorIds.request)
    this.client.removeResponseInterceptor(this.interceptorIds.response)

    this.client = null
    this.interceptorIds = null

    if (this.config?.logToConsole) {
      logger.info('DevTools detached from HTTP client')
    }
  }

  /**
   * 请求开始
   */
  private onRequestStart(config: RequestConfig): void {
    const id = this.generateId()
    const record: RequestRecord = {
      id,
      timestamp: Date.now(),
      config,
      status: 'pending',
    }

      // 保存到配置中,用于后续匹配
      ; (config as any).__devtools_id__ = id

    this.addRecord(record)

    if (this.config?.logToConsole) {
      logger.group(`➡️ ${config.method?.toUpperCase()} ${config.url}`)
      logger.debug('Config:', config)
      logger.groupEnd()
    }
  }

  /**
   * 请求成功
   */
  private onRequestSuccess(response: ResponseData<any>): void {
    const id = (response.config as any).__devtools_id__
    if (!id) return

    const record = this.findRecord(id)
    if (!record) return

    record.duration = Date.now() - record.timestamp
    record.response = response
    record.status = 'success'

    if (this.config?.logToConsole) {
      const isSlow = record.duration > this.config?.performanceThreshold
      const emoji = isSlow ? '🐌' : '✅'

      logger.group(
        `${emoji} ${response.config.method?.toUpperCase()} ${response.config.url} (${record.duration}ms)`,
      )
      logger.debug('Status:', response.status)
      logger.debug('Data:', response.data)
      if (isSlow) {
        logger.warn(`慢请求警告: 耗时 ${record.duration}ms`)
      }
      logger.groupEnd()
    }
  }

  /**
   * 请求失败
   */
  private onRequestError(error: HttpError): void {
    const id = (error.config as any).__devtools_id__
    if (!id) return

    const record = this.findRecord(id)
    if (!record) return

    record.duration = Date.now() - record.timestamp
    record.error = error
    record.status = 'error'

    if (this.config?.logToConsole) {
      logger.group(
        `❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} (${record.duration}ms)`,
      )
      logger.error('Error:', error.message)
      logger.error('Details:', error)
      logger.groupEnd()
    }
  }

  /**
   * 添加记录
   */
  private addRecord(record: RequestRecord): void {
    this.records.unshift(record)

    // 限制记录数量
    if (this.records.length > this.config?.maxRecords) {
      this.records = this.records.slice(0, this.config?.maxRecords)
    }
  }

  /**
   * 查找记录
   */
  private findRecord(id: string): RequestRecord | undefined {
    return this.records.find(r => r.id === id)
  }

  /**
   * 生成ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取所有记录
   */
  getRecords(): RequestRecord[] {
    return [...this.records]
  }

  /**
   * 获取失败的请求
   */
  getFailedRequests(): RequestRecord[] {
    return this.records.filter(r => r.status === 'error')
  }

  /**
   * 获取慢请求
   */
  getSlowRequests(): RequestRecord[] {
    return this.records.filter(
      r => r.duration && r.duration > this.config?.performanceThreshold,
    )
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const stats = {
      total: this.records.length,
      pending: 0,
      success: 0,
      error: 0,
      cancelled: 0,
      averageDuration: 0,
      slowRequests: 0,
    }

    let totalDuration = 0
    let completedCount = 0

    this.records.forEach((record) => {
      stats[record.status]++

      if (record.duration) {
        totalDuration += record.duration
        completedCount++

        if (record.duration > this.config?.performanceThreshold) {
          stats.slowRequests++
        }
      }
    })

    if (completedCount > 0) {
      stats.averageDuration = Math.round(totalDuration / completedCount)
    }

    return stats
  }

  /**
   * 清除所有记录
   */
  clear(): void {
    this.records = []
    if (this.config?.logToConsole) {
      logger.info('DevTools records cleared')
    }
  }

  /**
   * 导出数据为JSON
   */
  export(): string {
    const data = {
      records: this.records,
      stats: this.getStats(),
      exportedAt: new Date().toISOString(),
    }
    return JSON.stringify(data, null, 2)
  }

  /**
   * 下载导出文件
   */
  download(): void {
    if (typeof window === 'undefined') {
      logger.warn('Download is only available in browser')
      return
    }

    const json = this.export()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `http-devtools-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    logger.info('DevTools data exported')
  }

  /**
   * 在浏览器console打印统计
   */
  printStats(): void {
    const stats = this.getStats()

    // 使用 console.group/groupEnd 是允许的（调试工具特性）
    console.group('HTTP DevTools Statistics')
    console.info(`Total Requests: ${stats.total}`)
    console.info(`Pending: ${stats.pending}`)
    console.info(`Success: ${stats.success}`)
    console.info(`Error: ${stats.error}`)
    console.info(`Cancelled: ${stats.cancelled}`)
    console.info(`Average Duration: ${stats.averageDuration}ms`)
    console.info(`Slow Requests: ${stats.slowRequests}`)
    console.groupEnd()
  }
}

/**
 * 创建开发工具
 */
export function createDevTools(config?: DevToolsConfig): HttpDevTools {
  return new HttpDevTools(config)
}

/**
 * 全局开发工具实例
 */
export const globalDevTools = new HttpDevTools()

/**
 * 在浏览器console中可用的快捷命令
 */
if (typeof window !== 'undefined') {
  ; (window as any).httpDevTools = {
    getRecords: () => globalDevTools.getRecords(),
    getStats: () => globalDevTools.getStats(),
    printStats: () => globalDevTools.printStats(),
    clear: () => globalDevTools.clear(),
    export: () => globalDevTools.download(),
  }
}
