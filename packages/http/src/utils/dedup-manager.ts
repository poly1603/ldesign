/**
 * 请求去重管理器
 * 
 * 防止相同请求重复发送，自动合并处理
 */

import type { ResponseData } from '../types'

/**
 * 去重任务信息
 */
interface DeduplicationTask<T = unknown> {
  /** 任务 Promise */
  promise: Promise<ResponseData<T>>
  /** 创建时间 */
  createdAt: number
  /** 引用计数 */
  refCount: number
  /** 任务键 */
  key: string
}

/**
 * 去重统计信息
 */
export interface DeduplicationStats {
  /** 执行的请求数 */
  executions: number
  /** 去重的请求数 */
  duplications: number
  /** 节省的请求数 */
  savedRequests: number
  /** 去重率 */
  deduplicationRate: number
  /** 当前待处理请求数 */
  pendingCount: number
}

/**
 * 去重管理器配置
 */
export interface DeduplicationManagerConfig {
  /** 最大待处理请求数 */
  maxPendingRequests?: number
  /** 清理间隔（毫秒） */
  cleanupInterval?: number
  /** 请求超时时间（毫秒） */
  requestTimeout?: number
  /** 是否启用自动清理 */
  autoCleanup?: boolean
}

/**
 * 请求去重管理器
 * 
 * 特性：
 * - 自动合并相同请求
 * - LRU 缓存策略
 * - 自动清理过期请求
 * - 统计信息跟踪
 */
export class DeduplicationManager {
  private pendingRequests = new Map<string, DeduplicationTask>()
  private stats = {
    executions: 0,
    duplications: 0,
    savedRequests: 0,
  }
  private config: Required<DeduplicationManagerConfig>
  private cleanupTimer?: ReturnType<typeof setTimeout>

  constructor(config: DeduplicationManagerConfig = {}) {
    this.config = {
      maxPendingRequests: config.maxPendingRequests ?? 1000,
      cleanupInterval: config.cleanupInterval ?? 30000,
      requestTimeout: config.requestTimeout ?? 60000,
      autoCleanup: config.autoCleanup ?? true,
    }

    if (this.config.autoCleanup) {
      this.startAutoCleanup()
    }
  }

  /**
   * 执行请求（带去重，性能优化）
   */
  async execute<T = unknown>(
    key: string,
    requestFn: () => Promise<ResponseData<T>>,
  ): Promise<ResponseData<T>> {
    // 检查是否有相同的请求正在进行（使用Map.has更快）
    if (this.pendingRequests.has(key)) {
      const existingTask = this.pendingRequests.get(key)!
      // 增加引用计数
      existingTask.refCount++
      this.stats.duplications++
      this.stats.savedRequests++

      return existingTask.promise as Promise<ResponseData<T>>
    }

    // 检查是否达到最大待处理请求数
    if (this.pendingRequests.size >= this.config.maxPendingRequests) {
      this.cleanupOldestRequest()
    }

    // 创建新的请求
    const requestPromise = requestFn().finally(() => {
      // 请求完成后清理
      this.pendingRequests.delete(key)
    })

    const task: DeduplicationTask<T> = {
      promise: requestPromise,
      createdAt: Date.now(),
      refCount: 1,
      key,
    }

    this.pendingRequests.set(key, task)
    this.stats.executions++

    return requestPromise
  }

  /**
   * 启动自动清理
   */
  private startAutoCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupTimeoutTasks(this.config.requestTimeout)
    }, this.config.cleanupInterval)
  }

  /**
   * 停止自动清理
   */
  stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
  }

  /**
   * 清理最旧的请求（LRU）
   */
  private cleanupOldestRequest(): void {
    let oldestKey: string | null = null
    let oldestTime = Number.POSITIVE_INFINITY

    for (const [key, task] of this.pendingRequests) {
      if (task.createdAt < oldestTime) {
        oldestTime = task.createdAt
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.pendingRequests.delete(oldestKey)
    }
  }

  /**
   * 清理超时的请求
   */
  cleanupTimeoutTasks(timeoutMs: number): number {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, task] of this.pendingRequests) {
      if (now - task.createdAt > timeoutMs) {
        this.pendingRequests.delete(key)
        cleanedCount++
      }
    }

    return cleanedCount
  }

  /**
   * 取消指定请求
   */
  cancel(key: string): boolean {
    return this.pendingRequests.delete(key)
  }

  /**
   * 取消所有请求
   */
  cancelAll(): void {
    this.pendingRequests.clear()
  }

  /**
   * 检查请求是否正在进行
   */
  isRunning(key: string): boolean {
    return this.pendingRequests.has(key)
  }

  /**
   * 等待指定请求完成
   */
  async waitFor<T = unknown>(key: string): Promise<ResponseData<T> | null> {
    const task = this.pendingRequests.get(key)
    if (!task) {
      return null
    }

    try {
      return await task.promise as ResponseData<T>
    } catch {
      return null
    }
  }

  /**
   * 等待所有请求完成
   */
  async waitForAll(): Promise<void> {
    const promises = Array.from(this.pendingRequests.values()).map(
      task => task.promise.catch(() => {}), // 忽略错误
    )

    await Promise.all(promises)
  }

  /**
   * 获取任务信息
   */
  getTaskInfo(key: string): {
    key: string
    createdAt: number
    refCount: number
    duration: number
  } | null {
    const task = this.pendingRequests.get(key)
    if (!task) {
      return null
    }

    return {
      key: task.key,
      createdAt: task.createdAt,
      refCount: task.refCount,
      duration: Date.now() - task.createdAt,
    }
  }

  /**
   * 获取所有任务信息
   */
  getAllTaskInfo(): Array<{
    key: string
    createdAt: number
    refCount: number
    duration: number
  }> {
    return Array.from(this.pendingRequests.values()).map(task => ({
      key: task.key,
      createdAt: task.createdAt,
      refCount: task.refCount,
      duration: Date.now() - task.createdAt,
    }))
  }

  /**
   * 获取统计信息
   */
  getStats(): DeduplicationStats {
    const totalRequests = this.stats.executions + this.stats.duplications
    return {
      executions: this.stats.executions,
      duplications: this.stats.duplications,
      savedRequests: this.stats.savedRequests,
      deduplicationRate: totalRequests > 0 ? this.stats.duplications / totalRequests : 0,
      pendingCount: this.pendingRequests.size,
    }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      executions: 0,
      duplications: 0,
      savedRequests: 0,
    }
  }

  /**
   * 获取待处理请求数量
   */
  getPendingCount(): number {
    return this.pendingRequests.size
  }

  /**
   * 获取所有待处理请求的键
   */
  getPendingKeys(): string[] {
    return Array.from(this.pendingRequests.keys())
  }

  /**
   * 获取引用计数最高的请求
   */
  getMostReferencedTask(): {
    key: string
    refCount: number
  } | null {
    let maxRefCount = 0
    let mostReferencedKey = ''

    for (const [key, task] of this.pendingRequests) {
      if (task.refCount > maxRefCount) {
        maxRefCount = task.refCount
        mostReferencedKey = key
      }
    }

    return maxRefCount > 0 ? { key: mostReferencedKey, refCount: maxRefCount } : null
  }

  /**
   * 获取运行时间最长的请求
   */
  getLongestRunningTask(): {
    key: string
    duration: number
  } | null {
    let maxDuration = 0
    let longestKey = ''

    const now = Date.now()
    for (const [key, task] of this.pendingRequests) {
      const duration = now - task.createdAt
      if (duration > maxDuration) {
        maxDuration = duration
        longestKey = key
      }
    }

    return maxDuration > 0 ? { key: longestKey, duration: maxDuration } : null
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<DeduplicationManagerConfig>): void {
    Object.assign(this.config, config)
    
    // 如果改变了自动清理设置
    if (config.autoCleanup !== undefined) {
      if (config.autoCleanup && !this.cleanupTimer) {
        this.startAutoCleanup()
      } else if (!config.autoCleanup && this.cleanupTimer) {
        this.stopAutoCleanup()
      }
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.stopAutoCleanup()
    this.pendingRequests.clear()
    this.resetStats()
  }
}

/**
 * 创建去重管理器
 */
export function createDeduplicationManager(
  config?: DeduplicationManagerConfig,
): DeduplicationManager {
  return new DeduplicationManager(config)
}

/**
 * 全局去重管理器实例
 */
export const globalDeduplicationManager = new DeduplicationManager()