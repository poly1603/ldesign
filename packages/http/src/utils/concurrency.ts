/**
 * 并发控制管理器
 * 
 * 管理HTTP请求的并发数量和队列处理
 */

import type { ConcurrencyConfig, RequestConfig, ResponseData } from '../types'
import type { DeduplicationStats } from './dedup-manager'
import type { DeduplicationKeyConfig } from './request-dedup'
import { DeduplicationManager } from './dedup-manager'
import { DeduplicationKeyGenerator } from './request-dedup'

/**
 * 请求任务接口
 */
interface RequestTask<T = any> {
  id: string
  execute: () => Promise<ResponseData<T>>
  resolve: (value: ResponseData<T>) => void
  reject: (error: any) => void
  config: RequestConfig
}

/**
 * 并发控制管理器
 */
export class ConcurrencyManager {
  private config: Required<ConcurrencyConfig>
  private activeRequests = new Set<string>()
  private requestQueue: RequestTask[] = []
  private requestCounter = 0
  private processingQueue = false // 防止重复处理队列
  private deduplicationManager: DeduplicationManager
  private keyGenerator: DeduplicationKeyGenerator

  constructor(config: ConcurrencyConfig = {}) {
    this.config = {
      maxConcurrent: config.maxConcurrent ?? 10,
      maxQueueSize: config.maxQueueSize ?? 100,
      deduplication: config.deduplication ?? true,
    }

    // 初始化去重管理器
    this.deduplicationManager = new DeduplicationManager()
    this.keyGenerator = new DeduplicationKeyGenerator({
      includeMethod: true,
      includeUrl: true,
      includeParams: true,
      includeData: false, // 默认不包含请求体，避免大数据影响性能
    })
  }

  /**
   * 执行请求（带并发控制和去重）
   */
  async execute<T = unknown>(
    requestFn: () => Promise<ResponseData<T>>,
    config: RequestConfig,
  ): Promise<ResponseData<T>> {
    // 如果启用了去重功能
    if (this.config?.deduplication) {
      const deduplicationKey = this.keyGenerator.generate(config)

      // 使用去重管理器执行请求
      return this.deduplicationManager.execute(
        deduplicationKey,
        () => this.executeWithConcurrencyControl(requestFn, config),
      )
    }

    // 否则直接使用并发控制
    return this.executeWithConcurrencyControl(requestFn, config)
  }

  /**
   * 带并发控制的请求执行
   */
  private async executeWithConcurrencyControl<T = unknown>(
    requestFn: () => Promise<ResponseData<T>>,
    config: RequestConfig,
  ): Promise<ResponseData<T>> {
    return new Promise<ResponseData<T>>((resolve, reject) => {
      const taskId = this.generateTaskId()

      const task: RequestTask<T> = {
        id: taskId,
        execute: requestFn,
        resolve,
        reject,
        config,
      }

      // 检查队列大小限制
      if (this.requestQueue.length >= this.config?.maxQueueSize) {
        reject(new Error('Request queue is full'))
        return
      }

      // 如果当前并发数未达到限制，直接执行
      if (this.activeRequests.size < this.config?.maxConcurrent) {
        void this.executeTask(task)
      }
      else {
        // 否则加入队列
        this.requestQueue.push(task)
      }
    })
  }

  /**
   * 执行任务
   */
  private async executeTask<T = unknown>(task: RequestTask<T>): Promise<void> {
    this.activeRequests.add(task.id)

    try {
      const result = await task.execute()
      task.resolve(result)
    }
    catch (error) {
      task.reject(error)
    }
    finally {
      this.activeRequests.delete(task.id)
      this.processQueue()
    }
  }

  /**
   * 处理队列中的下一个任务（优化版）
   */
  private processQueue(): void {
    // 防止重复处理
    if (this.processingQueue) {
      return
    }

    this.processingQueue = true

    try {
      // 批量处理多个任务，直到达到并发限制
      while (
        this.requestQueue.length > 0
        && this.activeRequests.size < this.config?.maxConcurrent
      ) {
        const nextTask = this.requestQueue.shift()
        if (nextTask) {
          void this.executeTask(nextTask)
        }
      }
    }
    finally {
      this.processingQueue = false
    }
  }

  /**
   * 取消所有排队的请求
   */
  cancelQueue(reason = 'Queue cancelled'): void {
    const queuedTasks = this.requestQueue.splice(0)
    queuedTasks.forEach((task) => {
      task.reject(new Error(reason))
    })
  }

  /**
   * 获取状态信息
   */
  getStatus(): {
    activeCount: number
    queuedCount: number
    maxConcurrent: number
    maxQueueSize: number
    deduplication: DeduplicationStats
  } {
    return {
      activeCount: this.activeRequests.size,
      queuedCount: this.requestQueue.length,
      maxConcurrent: this.config?.maxConcurrent,
      maxQueueSize: this.config?.maxQueueSize,
      deduplication: this.deduplicationManager.getStats(),
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ConcurrencyConfig>): void {
    Object.assign(this.config, config)

    // 如果降低了最大并发数，需要处理队列
    this.processQueue()
  }

  /**
   * 获取当前配置
   */
  getConfig(): Required<ConcurrencyConfig> {
    return { ...this.config }
  }

  /**
   * 获取去重统计信息
   */
  getDeduplicationStats(): DeduplicationStats {
    return this.deduplicationManager.getStats()
  }

  /**
   * 重置去重统计信息
   */
  resetDeduplicationStats(): void {
    this.deduplicationManager.resetStats()
  }

  /**
   * 检查请求是否正在去重处理中
   */
  isRequestDeduplicating(config: RequestConfig): boolean {
    const key = this.keyGenerator.generate(config)
    return this.deduplicationManager.isRunning(key)
  }

  /**
   * 取消特定的去重请求
   */
  cancelDeduplicatedRequest(config: RequestConfig): void {
    const key = this.keyGenerator.generate(config)
    this.deduplicationManager.cancel(key)
  }

  /**
   * 等待特定去重请求完成
   */
  async waitForDeduplicatedRequest<T = unknown>(config: RequestConfig): Promise<ResponseData<T> | null> {
    const key = this.keyGenerator.generate(config)
    return this.deduplicationManager.waitFor<T>(key)
  }

  /**
   * 获取所有去重任务信息
   */
  getDeduplicationTasksInfo(): Array<{
    key: string
    createdAt: number
    refCount: number
    duration: number
  }> {
    return this.deduplicationManager.getAllTaskInfo()
  }

  /**
   * 清理超时的去重任务
   */
  cleanupTimeoutDeduplicationTasks(timeoutMs: number = 30000): number {
    return this.deduplicationManager.cleanupTimeoutTasks(timeoutMs)
  }

  /**
   * 配置去重键生成器
   */
  configureDeduplicationKeyGenerator(config: DeduplicationKeyConfig): void {
    this.keyGenerator = new DeduplicationKeyGenerator(config)
  }

  /**
   * 生成任务 ID
   */
  private generateTaskId(): string {
    return `task_${++this.requestCounter}_${Date.now()}`
  }
}

/**
 * 创建并发管理器
 */
export function createConcurrencyManager(
  config?: ConcurrencyConfig,
): ConcurrencyManager {
  return new ConcurrencyManager(config)
}

// 导出拆分出去的模块
export { createDeduplicationManager, DeduplicationManager } from './dedup-manager'
export type { DeduplicationStats } from './dedup-manager'
export { createRateLimitManager, RateLimitManager } from './rate-limit'
export { createDeduplicationKeyGenerator, DeduplicationKeyGenerator } from './request-dedup'
export type { DeduplicationKeyConfig } from './request-dedup'
