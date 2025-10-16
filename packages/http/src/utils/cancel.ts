import type { RequestConfig } from '../types'
import { ErrorHandler } from './error'

/**
 * 取消令牌接口
 */
export interface CancelToken {
  /** 取消原因 */
  reason?: string
  /** 是否已取消 */
  isCancelled: boolean
  /** 取消回调 */
  promise: Promise<string>
  /** 抛出取消错误 */
  throwIfRequested: () => void
}

/**
 * 取消令牌实现
 */
export class CancelTokenImpl implements CancelToken {
  public isCancelled = false
  public reason?: string
  public promise: Promise<string>

  private resolvePromise!: (reason: string) => void

  constructor() {
    this.promise = new Promise<string>((resolve) => {
      this.resolvePromise = resolve
    })
  }

  /**
   * 取消请求
   */
  cancel(reason = 'Request cancelled'): void {
    if (this.isCancelled) {
      return
    }

    this.isCancelled = true
    this.reason = reason
    this.resolvePromise(reason)
  }

  /**
   * 如果已取消则抛出错误
   */
  throwIfRequested(): void {
    if (this.isCancelled) {
      throw ErrorHandler.createCancelError({} as RequestConfig)
    }
  }
}

/**
 * 取消令牌源
 */
export class CancelTokenSource {
  public token: CancelToken

  constructor() {
    this.token = new CancelTokenImpl()
  }

  /**
   * 取消请求
   */
  cancel(reason?: string): void {
    ;(this.token as CancelTokenImpl).cancel(reason)
  }
}

/**
 * 请求取消管理器
 */
export class CancelManager {
  private requests = new Map<string, AbortController>()
  private cancelTokens = new Map<string, CancelToken>()

  /**
   * 创建取消令牌源
   */
  static source(): CancelTokenSource {
    return new CancelTokenSource()
  }

  /**
   * 注册请求
   */
  register(
    requestId: string,
    controller: AbortController,
    token?: CancelToken,
  ): void {
    this.requests.set(requestId, controller)
    if (token) {
      this.cancelTokens.set(requestId, token)

      // 监听取消令牌
      token.promise
        .then(() => {
          this.cancel(requestId)
        })
        .catch(() => {
          // 忽略错误
        })
    }
  }

  /**
   * 取消指定请求
   */
  cancel(requestId: string, reason = 'Request cancelled'): void {
    const controller = this.requests.get(requestId)
    if (controller) {
      controller.abort()
      this.requests.delete(requestId)
    }

    const token = this.cancelTokens.get(requestId)
    if (token && !token.isCancelled) {
      ;(token as CancelTokenImpl).cancel(reason)
      this.cancelTokens.delete(requestId)
    }
  }

  /**
   * 取消所有请求
   */
  cancelAll(reason = 'All requests cancelled'): void {
    this.requests.forEach((controller, _requestId) => {
      controller.abort()
    })
    this.requests.clear()

    this.cancelTokens.forEach((token, _requestId) => {
      if (!token.isCancelled) {
        ;(token as CancelTokenImpl).cancel(reason)
      }
    })
    this.cancelTokens.clear()
  }

  /**
   * 清理已完成的请求
   */
  cleanup(requestId: string): void {
    this.requests.delete(requestId)
    this.cancelTokens.delete(requestId)
  }

  /**
   * 获取活跃请求数量
   */
  getActiveRequestCount(): number {
    return this.requests.size
  }

  /**
   * 检查请求是否已取消
   */
  isCancelled(requestId: string): boolean {
    const token = this.cancelTokens.get(requestId)
    return token ? token.isCancelled : false
  }

  /**
   * 创建合并的 AbortSignal
   */
  createMergedSignal(signals: (AbortSignal | undefined)[]): AbortSignal {
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
 * 请求元数据
 */
interface RequestMetadata {
  source: CancelTokenSource
  tags: Set<string>
  createdAt: number
  config?: RequestConfig
}

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
 * 增强的取消管理器
 * 
 * 在基础取消管理器之上添加了标签管理、批量操作、统计等功能
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

    if (this.config?.autoCleanup) {
      this.startAutoCleanup()
    }
  }

  /**
   * 创建并注册带标签的取消令牌
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
   */
  cancelByTag(tag: string, reason?: string): number {
    const idsToCancel = this.getRequestIdsByTag(tag)
    return this.cancelBatch(idsToCancel, reason || `Cancelled by tag: ${tag}`)
  }

  /**
   * 按多个标签取消请求（满足任一标签）
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
      oldestRequest: this.getOldestRequest(),
    }
  }

  /**
   * 获取最老的请求信息
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
   */
  has(requestId: string): boolean {
    return this.metadata.has(requestId)
  }

  /**
   * 获取请求的标签
   */
  getTags(requestId: string): string[] {
    const meta = this.metadata.get(requestId)
    return meta ? Array.from(meta.tags) : []
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
   * 移除请求的标签
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
    }, this.config?.cleanupInterval)
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
   */
  updateConfig(config: Partial<EnhancedCancelConfig>): void {
    const oldAutoCleanup = this.config?.autoCleanup

    this.config = { ...this.config, ...config }

    // 处理自动清理配置变化
    if (oldAutoCleanup && !this.config?.autoCleanup) {
      this.stopAutoCleanup()
    }
    else if (!oldAutoCleanup && this.config?.autoCleanup) {
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
 * 全局取消管理器实例（使用增强版）
 */
export const globalCancelManager = new EnhancedCancelManager()

/**
 * 创建取消令牌源
 */
export function createCancelTokenSource(): CancelTokenSource {
  return CancelManager.source()
}

/**
 * 创建增强的取消管理器
 */
export function createEnhancedCancelManager(
  config?: EnhancedCancelConfig,
): EnhancedCancelManager {
  return new EnhancedCancelManager(config)
}

/**
 * 检查是否为取消错误
 */
export function isCancelError(error: any): boolean {
  return (
    error
    && (error.isCancelError
      || error.name === 'AbortError'
      || error.code === 'CANCELED'
      || error.message?.includes('cancelled')
      || error.message?.includes('aborted'))
  )
}

/**
 * 超时取消令牌
 */
export function createTimeoutCancelToken(timeout: number): CancelTokenSource {
  const source = createCancelTokenSource()

  setTimeout(() => {
    source.cancel(`Request timeout after ${timeout}ms`)
  }, timeout)

  return source
}
