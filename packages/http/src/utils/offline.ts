/**
 * 离线请求队列功能
 * 在网络离线时缓存请求，网络恢复后自动重试
 */

import type { RequestConfig, ResponseData } from '../types'

/**
 * 离线队列配置
 */
export interface OfflineQueueConfig {
  /** 是否启用离线队列 */
  enabled?: boolean
  /** 最大队列大小 */
  maxQueueSize?: number
  /** 持久化存储键 */
  storageKey?: string
  /** 是否使用持久化存储 */
  persistent?: boolean
  /** 自动重试间隔（毫秒） */
  retryInterval?: number
  /** 最大重试次数 */
  maxRetries?: number
}

/**
 * 离线请求项
 */
interface OfflineRequestItem {
  id: string
  config: RequestConfig
  timestamp: number
  retries: number
  resolve: (value: ResponseData) => void
  reject: (error: any) => void
}

/**
 * 离线队列统计
 */
export interface OfflineQueueStats {
  /** 队列中的请求数 */
  queuedCount: number
  /** 已处理的请求数 */
  processedCount: number
  /** 失败的请求数 */
  failedCount: number
  /** 成功率 */
  successRate: number
}

/**
 * 离线请求队列管理器
 * 
 * 功能：
 * 1. 自动检测网络状态
 * 2. 离线时缓存请求
 * 3. 网络恢复后自动重试
 * 4. 支持持久化存储
 * 5. 智能重试策略
 */
export class OfflineQueueManager {
  private config: Required<OfflineQueueConfig>
  private queue: Map<string, OfflineRequestItem> = new Map()
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true
  private retryTimer?: ReturnType<typeof setTimeout>
  private stats: OfflineQueueStats = {
    queuedCount: 0,
    processedCount: 0,
    failedCount: 0,
    successRate: 1,
  }

  constructor(config: OfflineQueueConfig = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      maxQueueSize: config.maxQueueSize ?? 100,
      storageKey: config.storageKey ?? 'http_offline_queue',
      persistent: config.persistent ?? true,
      retryInterval: config.retryInterval ?? 5000,
      maxRetries: config.maxRetries ?? 3,
    }

    // 监听网络状态变化
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this))
      window.addEventListener('offline', this.handleOffline.bind(this))
    }

    // 从持久化存储恢复队列
    if (this.config?.persistent) {
      this.loadQueue()
    }
  }

  /**
   * 添加请求到离线队列
   */
  async enqueue<T = any>(config: RequestConfig): Promise<ResponseData<T>> {
    if (!this.config?.enabled) {
      throw new Error('Offline queue is disabled')
    }

    if (this.queue.size >= this.config?.maxQueueSize) {
      throw new Error('Offline queue is full')
    }

    return new Promise((resolve, reject) => {
      const id = this.generateId()
      const item: OfflineRequestItem = {
        id,
        config,
        timestamp: Date.now(),
        retries: 0,
        resolve: resolve as any,
        reject,
      }

      this.queue.set(id, item)
      this.stats.queuedCount++

      // 持久化队列
      if (this.config?.persistent) {
        this.saveQueue()
      }

      // 如果在线，立即尝试处理
      if (this.isOnline) {
        this.processQueue()
      }
    })
  }

  /**
   * 处理队列中的请求
   */
  private async processQueue(): Promise<void> {
    if (!this.isOnline || this.queue.size === 0) {
      return
    }

    const items = Array.from(this.queue.values())

    for (const item of items) {
      try {
        // 这里需要实际的 HTTP 客户端来执行请求
        // 为了避免循环依赖，这里只是模拟
        const response = await this.executeRequest(item.config)
        
        item.resolve(response)
        this.queue.delete(item.id)
        this.stats.processedCount++
      }
      catch (error) {
        item.retries++

        if (item.retries >= this.config?.maxRetries) {
          item.reject(error)
          this.queue.delete(item.id)
          this.stats.failedCount++
        }
      }
    }

    this.updateStats()

    // 持久化队列
    if (this.config?.persistent) {
      this.saveQueue()
    }

    // 如果还有请求，继续重试
    if (this.queue.size > 0) {
      this.scheduleRetry()
    }
  }

  /**
   * 执行请求（需要注入实际的 HTTP 客户端）
   */
  private async executeRequest(_config: RequestConfig): Promise<ResponseData> {
    // 这里应该使用实际的 HTTP 客户端
    throw new Error('Request executor not configured')
  }

  /**
   * 调度重试
   */
  private scheduleRetry(): void {
    if (this.retryTimer) {
      return
    }

    this.retryTimer = setTimeout(() => {
      this.retryTimer = undefined
      this.processQueue()
    }, this.config?.retryInterval)
  }

  /**
   * 处理网络上线事件
   */
  private handleOnline(): void {
    this.isOnline = true
    this.processQueue()
  }

  /**
   * 处理网络离线事件
   */
  private handleOffline(): void {
    this.isOnline = false
  }

  /**
   * 保存队列到持久化存储
   */
  private saveQueue(): void {
    if (typeof localStorage === 'undefined') {
      return
    }

    try {
      const data = Array.from(this.queue.values()).map(item => ({
        id: item.id,
        config: item.config,
        timestamp: item.timestamp,
        retries: item.retries,
      }))

      localStorage.setItem(this.config?.storageKey, JSON.stringify(data))
    }
    catch (error) {
      console.warn('Failed to save offline queue:', error)
    }
  }

  /**
   * 从持久化存储加载队列
   */
  private loadQueue(): void {
    if (typeof localStorage === 'undefined') {
      return
    }

    try {
      const data = localStorage.getItem(this.config?.storageKey)
      if (!data) {
        // 没有存储的队列数据
      }

      // 注意：这里无法恢复 resolve 和 reject 函数
      // 实际使用时需要重新创建 Promise
      // const items = JSON.parse(data)
    }
    catch (error) {
      console.warn('Failed to load offline queue:', error)
    }
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    const total = this.stats.processedCount + this.stats.failedCount
    this.stats.successRate = total > 0
      ? this.stats.processedCount / total
      : 1
  }

  /**
   * 获取统计信息
   */
  getStats(): OfflineQueueStats {
    return {
      ...this.stats,
      queuedCount: this.queue.size,
    }
  }

  /**
   * 清空队列
   */
  clear(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
      this.retryTimer = undefined
    }

    this.queue.forEach((item) => {
      item.reject(new Error('Queue cleared'))
    })

    this.queue.clear()

    if (this.config?.persistent && typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.config?.storageKey)
    }
  }

  /**
   * 获取网络状态
   */
  isNetworkOnline(): boolean {
    return this.isOnline
  }

  /**
   * 销毁离线队列管理器
   */
  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline.bind(this))
      window.removeEventListener('offline', this.handleOffline.bind(this))
    }

    this.clear()
  }
}

/**
 * 创建离线队列管理器
 */
export function createOfflineQueueManager(config?: OfflineQueueConfig): OfflineQueueManager {
  return new OfflineQueueManager(config)
}

