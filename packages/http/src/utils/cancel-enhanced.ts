/**
 * 增强的请求取消管理器
 * 
 * 提供批量取消、标签分组、超时管理等高级功能
 */

import type { RequestConfig } from '../types'
import { CancelManager, CancelTokenSource, createCancelTokenSource } from './cancel'

/**
 * 增强的取消管理器配置
 */
export interface EnhancedCancelConfig {
  /** 默认超时时间（毫秒） */
  defaultTimeout?: number
  /** 是否自动清理已完成的请求 */
  autoCleanup?: boolean
  /** 清理间隔（毫秒） */
  cleanupInterval?: number
}

/**
 * 请求元数据
 */
interface RequestMetadata {
  source: CancelTokenSource
  tags: Set<string>
  createdAt: number
  config?: RequestConfig
}

/**
 * 增强的取消管理器
 * 
 * 在基础取消管理器之上添加了标签管理、批量操作、统计等功能
 * 
 * @example
 * ```typescript
 * const manager = new EnhancedCancelManager({
 *   defaultTimeout: 30000,
 *   autoCleanup: true
 * })
 * 
 * // 创建带标签的请求
 * const source = manager.create('req1', ['api', 'users', 'high-priority'])
 * 
 * // 批量取消
 * manager.cancelByTag('api') // 取消所有API请求
 * manager.cancelBatch(['req1', 'req2'])
 * 
 * // 取消超时请求
 * manager.cancelTimeout(5000)
 * ```
 */
export class EnhancedCancelManager extends CancelManager {
  private metadata = new Map<string, RequestMetadata>()
  private config: Required<EnhancedCancelConfig>
  private cleanupTimer?: ReturnType<typeof setInterval>

  constructor(config: EnhancedCancelConfig = {}) {
    super()

    this.config = {
      defaultTimeout: config.defaultTimeout || 30000,
      autoCleanup: config.autoCleanup !== false,
      cleanupInterval: config.cleanupInterval || 60000,
    }

    if (this.config.autoCleanup) {
      this.startAutoCleanup()
    }
  }

  /**
   * 创建并注册带标签的取消令牌
   * 
   * @param requestId - 请求ID
   * @param tags - 请求标签（用于分组管理）
   * @param config - 请求配置
   * @returns 取消令牌源
   */
  createWithTags(
    requestId: string,
    tags: string[] = [],
    config?: RequestConfig,
  ): CancelTokenSource {
    const source = createCancelTokenSource()

    this.metadata.set(requestId, {
      source,
      tags: new Set(tags),
      createdAt: Date.now(),
      config,
    })

    // 注册基础取消管理器
    const controller = new AbortController()
    this.register(requestId, controller, source.token)

    return source
  }

  /**
   * 批量取消请求
   * 
   * @param requestIds - 请求ID数组
   * @param reason - 取消原因
   * @returns 成功取消的数量
   */
  cancelBatch(requestIds: string[], reason?: string): number {
    let cancelledCount = 0

    for (const id of requestIds) {
      if (this.metadata.has(id)) {
        this.cancel(id, reason || 'Batch cancelled')
        cancelledCount++
      }
    }

    return cancelledCount
  }

  /**
   * 按标签取消请求
   * 
   * @param tag - 标签名
   * @param reason - 取消原因
   * @returns 成功取消的数量
   */
  cancelByTag(tag: string, reason?: string): number {
    const idsToCancel = this.getRequestIdsByTag(tag)
    return this.cancelBatch(idsToCancel, reason || `Cancelled by tag: ${tag}`)
  }

  /**
   * 按多个标签取消请求（满足任一标签）
   * 
   * @param tags - 标签数组
   * @param reason - 取消原因
   * @returns 成功取消的数量
   */
  cancelByTags(tags: string[], reason?: string): number {
    const idsToCancel = new Set<string>()

    tags.forEach((tag) => {
      this.getRequestIdsByTag(tag).forEach(id => idsToCancel.add(id))
    })

    return this.cancelBatch(Array.from(idsToCancel), reason)
  }

  /**
   * 取消超时的请求
   * 
   * @param timeout - 超时时间（毫秒）
   * @param reason - 取消原因
   * @returns 成功取消的数量
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
   * 取消匹配条件的请求
   * 
   * @param predicate - 条件函数
   * @param reason - 取消原因
   * @returns 成功取消的数量
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
   * 获取指定标签的所有请求ID
   * 
   * @param tag - 标签名
   * @returns 请求ID数组
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
   * 获取按标签分组的请求数量
   * 
   * @returns 标签到数量的映射
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
   * 获取所有活跃请求的详细信息
   * 
   * @returns 请求详情数组
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
   * 
   * @returns 统计数据
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
      oldestRequest: this.getOldestRequest(),
    }
  }

  /**
   * 获取最老的请求信息
   * 
   * @returns 最老请求的信息或 null
   */
  getOldestRequest(): { id: string, age: number, url?: string } | null {
    if (this.metadata.size === 0) {
      return null
    }

    const now = Date.now()
    let oldestId = ''
    let oldestAge = 0
    let oldestUrl: string | undefined

    this.metadata.forEach((meta, id) => {
      const age = now - meta.createdAt
      if (age > oldestAge) {
        oldestAge = age
        oldestId = id
        oldestUrl = meta.config?.url
      }
    })

    return {
      id: oldestId,
      age: oldestAge,
      url: oldestUrl,
    }
  }

  /**
   * 检查请求是否存在
   * 
   * @param requestId - 请求ID
   * @returns 是否存在
   */
  has(requestId: string): boolean {
    return this.metadata.has(requestId)
  }

  /**
   * 获取请求的标签
   * 
   * @param requestId - 请求ID
   * @returns 标签数组
   */
  getTags(requestId: string): string[] {
    const meta = this.metadata.get(requestId)
    return meta ? Array.from(meta.tags) : []
  }

  /**
   * 为请求添加标签
   * 
   * @param requestId - 请求ID
   * @param tags - 要添加的标签
   * @returns 是否成功
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
   * 移除请求的标签
   * 
   * @param requestId - 请求ID
   * @param tags - 要移除的标签
   * @returns 是否成功
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
   * 清理指定请求
   * 
   * @param requestId - 请求ID
   */
  cleanup(requestId: string): void {
    super.cleanup(requestId)
    this.metadata.delete(requestId)
  }

  /**
   * 清理所有已完成的请求
   */
  cleanupAll(): void {
    const idsToCleanup: string[] = []

    this.metadata.forEach((_meta, requestId) => {
      if (this.isCancelled(requestId)) {
        idsToCleanup.push(requestId)
      }
    })

    idsToCleanup.forEach(id => this.cleanup(id))
  }

  /**
   * 启动自动清理
   */
  private startAutoCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupAll()
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
   * 更新配置
   * 
   * @param config - 新配置
   */
  updateConfig(config: Partial<EnhancedCancelConfig>): void {
    const oldAutoCleanup = this.config.autoCleanup

    this.config = { ...this.config, ...config }

    // 处理自动清理配置变化
    if (oldAutoCleanup && !this.config.autoCleanup) {
      this.stopAutoCleanup()
    }
    else if (!oldAutoCleanup && this.config.autoCleanup) {
      this.startAutoCleanup()
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.stopAutoCleanup()
    this.cancelAll('Manager destroyed')
    this.metadata.clear()
  }
}

/**
 * 创建增强的取消管理器
 * 
 * @param config - 配置选项
 * @returns 增强的取消管理器实例
 */
export function createEnhancedCancelManager(
  config?: EnhancedCancelConfig,
): EnhancedCancelManager {
  return new EnhancedCancelManager(config)
}

/**
 * 全局增强取消管理器实例
 */
export const globalEnhancedCancelManager = new EnhancedCancelManager()
