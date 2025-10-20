/**
 * 增强取消管理器模块
 * 
 * 提供高级请求取消管理功能
 */

import type { RequestConfig } from '../types'
import type { CancelToken, CancelTokenImpl  } from './cancel-token'


/**
 * 请求元数据
 */
export interface RequestMetadata {
  /** 创建时间 */
  createdAt: number
  /** 标签集合 */
  tags: Set<string>
  /** 请求配置 */
  config?: RequestConfig
  /** 关联的控制器 */
  controller: AbortController
  /** 关联的令牌 */
  token?: CancelToken
}

/**
 * 取消策略
 */
export interface CancelStrategy {
  /** 策略名称 */
  name: string
  /** 评估是否应该取消 */
  shouldCancel: (metadata: RequestMetadata, requestId: string) => boolean
  /** 获取取消原因 */
  getReason?: (metadata: RequestMetadata) => string
}

/**
 * 增强取消管理器
 */
export class EnhancedCancelManager {
  private metadata = new Map<string, RequestMetadata>()
  private strategies = new Map<string, CancelStrategy>()
  
  // 内置策略
  private readonly builtInStrategies: Record<string, CancelStrategy> = {
    timeout: {
      name: 'timeout',
      shouldCancel: (metadata: RequestMetadata) => {
        const maxAge = 60000 // 60秒超时
        return Date.now() - metadata.createdAt > maxAge
      },
      getReason: (metadata: RequestMetadata) => {
        const age = Date.now() - metadata.createdAt
        return `Request timeout: ${age}ms`
      },
    },
    duplicate: {
      name: 'duplicate',
      shouldCancel: (metadata: RequestMetadata, _requestId: string) => {
        // 检查是否有相同URL的新请求
        let hasDuplicate = false
        this.metadata.forEach((meta, _id) => {
          if (meta !== metadata && 
              meta.config?.url === metadata.config?.url &&
              meta.createdAt > metadata.createdAt) {
            hasDuplicate = true
          }
        })
        return hasDuplicate
      },
      getReason: () => 'Cancelled due to duplicate request',
    },
  }

  constructor() {
    // 注册内置策略
    Object.values(this.builtInStrategies).forEach(strategy => {
      this.addStrategy(strategy)
    })
  }

  /**
   * 注册请求
   */
  register(
    requestId: string,
    controller: AbortController,
    options?: {
      token?: CancelToken
      tags?: string[]
      config?: RequestConfig
    },
  ): void {
    const metadata: RequestMetadata = {
      createdAt: Date.now(),
      tags: new Set(options?.tags || []),
      config: options?.config,
      controller,
      token: options?.token,
    }

    this.metadata.set(requestId, metadata)

    // 如果有令牌，监听取消
    if (options?.token) {
      options.token.promise
        .then(() => {
          this.cancel(requestId)
        })
        .catch(() => {
          // 忽略错误
        })
    }
  }

  /**
   * 取消请求
   */
  cancel(requestId: string, reason = 'Request cancelled'): boolean {
    const metadata = this.metadata.get(requestId)
    if (!metadata) {
      return false
    }

    metadata.controller.abort(reason)
    
    if (metadata.token && !metadata.token.isCancelled) {
      (metadata.token as CancelTokenImpl).cancel(reason)
    }

    this.metadata.delete(requestId)
    return true
  }

  /**
   * 批量取消
   */
  cancelBatch(requestIds: string[], reason?: string): number {
    let cancelledCount = 0
    
    requestIds.forEach(id => {
      if (this.cancel(id, reason)) {
        cancelledCount++
      }
    })

    return cancelledCount
  }

  /**
   * 按标签取消
   */
  cancelByTags(tags: string[], reason?: string): number {
    const idsToCancel = new Set<string>()

    tags.forEach(tag => {
      this.getRequestIdsByTag(tag).forEach(id => idsToCancel.add(id))
    })

    return this.cancelBatch(Array.from(idsToCancel), reason)
  }

  /**
   * 按策略取消
   */
  cancelByStrategy(strategyName: string, reason?: string): number {
    const strategy = this.strategies.get(strategyName)
    if (!strategy) {
      return 0
    }

    const idsToCancel: string[] = []

    this.metadata.forEach((meta, id) => {
      if (strategy.shouldCancel(meta, id)) {
        idsToCancel.push(id)
      }
    })

    const finalReason = reason || 
      (strategy.getReason ? 
        idsToCancel.map(id => strategy.getReason!(this.metadata.get(id)!))[0] : 
        `Cancelled by strategy: ${strategyName}`)

    return this.cancelBatch(idsToCancel, finalReason)
  }

  /**
   * 取消超时请求
   */
  cancelTimeout(timeout: number, reason?: string): number {
    const now = Date.now()
    const idsToCancel: string[] = []

    this.metadata.forEach((meta, requestId) => {
      if (now - meta.createdAt > timeout) {
        idsToCancel.push(requestId)
      }
    })

    return this.cancelBatch(
      idsToCancel,
      reason || `Timeout exceeded: ${timeout}ms`,
    )
  }

  /**
   * 条件取消
   */
  cancelWhere(
    predicate: (metadata: RequestMetadata, requestId: string) => boolean,
    reason?: string,
  ): number {
    const idsToCancel: string[] = []

    this.metadata.forEach((meta, requestId) => {
      if (predicate(meta, requestId)) {
        idsToCancel.push(requestId)
      }
    })

    return this.cancelBatch(idsToCancel, reason)
  }

  /**
   * 取消所有请求
   */
  cancelAll(reason = 'All requests cancelled'): number {
    const count = this.metadata.size

    this.metadata.forEach((_meta, id) => {
      this.cancel(id, reason)
    })

    return count
  }

  /**
   * 清理已完成的请求
   */
  cleanup(requestId: string): void {
    this.metadata.delete(requestId)
  }

  /**
   * 自动清理老旧请求
   */
  autoCleanup(maxAge = 5 * 60 * 1000): number {
    const now = Date.now()
    const idsToRemove: string[] = []

    this.metadata.forEach((meta, id) => {
      if (now - meta.createdAt > maxAge) {
        idsToRemove.push(id)
      }
    })

    idsToRemove.forEach(id => {
      this.metadata.delete(id)
    })

    return idsToRemove.length
  }

  /**
   * 添加策略
   */
  addStrategy(strategy: CancelStrategy): void {
    this.strategies.set(strategy.name, strategy)
  }

  /**
   * 移除策略
   */
  removeStrategy(name: string): boolean {
    return this.strategies.delete(name)
  }

  /**
   * 获取策略
   */
  getStrategy(name: string): CancelStrategy | undefined {
    return this.strategies.get(name)
  }

  /**
   * 获取所有策略名称
   */
  getStrategyNames(): string[] {
    return Array.from(this.strategies.keys())
  }

  /**
   * 应用所有策略
   */
  applyStrategies(): number {
    let totalCancelled = 0

    this.strategies.forEach((_strategy, name) => {
      totalCancelled += this.cancelByStrategy(name)
    })

    return totalCancelled
  }

  /**
   * 获取指定标签的所有请求ID
   */
  getRequestIdsByTag(tag: string): string[] {
    const ids: string[] = []

    this.metadata.forEach((meta, requestId) => {
      if (meta.tags.has(tag)) {
        ids.push(requestId)
      }
    })

    return ids
  }

  /**
   * 获取请求数量统计
   */
  getRequestCountByTag(): Map<string, number> {
    const counts = new Map<string, number>()

    this.metadata.forEach((meta) => {
      meta.tags.forEach((tag) => {
        counts.set(tag, (counts.get(tag) || 0) + 1)
      })
    })

    return counts
  }

  /**
   * 获取活跃请求
   */
  getActiveRequests(): Array<{
    id: string
    tags: string[]
    age: number
    url?: string
  }> {
    const now = Date.now()
    const requests: Array<{
      id: string
      tags: string[]
      age: number
      url?: string
    }> = []

    this.metadata.forEach((meta, id) => {
      requests.push({
        id,
        tags: Array.from(meta.tags),
        age: now - meta.createdAt,
        url: meta.config?.url,
      })
    })

    return requests
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const now = Date.now()
    let totalAge = 0
    let oldestAge = 0
    const tagCounts = this.getRequestCountByTag()

    this.metadata.forEach((meta) => {
      const age = now - meta.createdAt
      totalAge += age
      oldestAge = Math.max(oldestAge, age)
    })

    return {
      active: this.metadata.size,
      byTag: Object.fromEntries(tagCounts),
      averageAge: this.metadata.size > 0 ? totalAge / this.metadata.size : 0,
      oldestAge,
      strategies: this.getStrategyNames(),
    }
  }

  /**
   * 为请求添加标签
   */
  addTags(requestId: string, ...tags: string[]): boolean {
    const meta = this.metadata.get(requestId)
    if (!meta) {
      return false
    }

    tags.forEach(tag => meta.tags.add(tag))
    return true
  }

  /**
   * 移除请求标签
   */
  removeTags(requestId: string, ...tags: string[]): boolean {
    const meta = this.metadata.get(requestId)
    if (!meta) {
      return false
    }

    tags.forEach(tag => meta.tags.delete(tag))
    return true
  }

  /**
   * 获取请求标签
   */
  getTags(requestId: string): string[] {
    const meta = this.metadata.get(requestId)
    return meta ? Array.from(meta.tags) : []
  }

  /**
   * 检查请求是否存在
   */
  has(requestId: string): boolean {
    return this.metadata.has(requestId)
  }

  /**
   * 获取请求元数据
   */
  getMetadata(requestId: string): RequestMetadata | undefined {
    return this.metadata.get(requestId)
  }

  /**
   * 获取活跃请求数量
   */
  getActiveRequestCount(): number {
    return this.metadata.size
  }

  /**
   * 创建合并的 AbortSignal
   */
  static createMergedSignal(signals: (AbortSignal | undefined)[]): AbortSignal {
    const validSignals = signals.filter(
      (signal): signal is AbortSignal => signal !== undefined,
    )

    if (validSignals.length === 0) {
      return new AbortController().signal
    }

    if (validSignals.length === 1) {
      return validSignals[0]!
    }

    // 创建一个新的控制器来合并多个信号
    const controller = new AbortController()

    const abortHandler = () => {
      controller.abort()
    }

    validSignals.forEach((signal) => {
      if (signal.aborted) {
        controller.abort()
        return
      }
      signal.addEventListener('abort', abortHandler, { once: true })
    })

    return controller.signal
  }
}

/**
 * 创建增强取消管理器
 */
export function createEnhancedCancelManager(): EnhancedCancelManager {
  return new EnhancedCancelManager()
}