/**
 * 性能优化管理器
 * 
 * 负责表格的性能优化，包括增量更新、懒加载、缓存管理等
 * 提供高效的数据处理和渲染优化策略
 */

import type { TableRow, TableId } from '../types'
import { EventManager } from './EventManager'

/**
 * 性能优化配置
 */
export interface PerformanceConfig {
  /** 是否启用增量更新 */
  enableIncrementalUpdate?: boolean
  /** 是否启用懒加载 */
  enableLazyLoading?: boolean
  /** 是否启用数据缓存 */
  enableDataCache?: boolean
  /** 是否启用渲染缓存 */
  enableRenderCache?: boolean
  /** 批量更新大小 */
  batchUpdateSize?: number
  /** 缓存最大大小 */
  maxCacheSize?: number
  /** 懒加载阈值 */
  lazyLoadThreshold?: number
  /** 防抖延迟 */
  debounceDelay?: number
  /** 节流间隔 */
  throttleInterval?: number
}

/**
 * 数据变更记录
 */
interface DataChangeRecord<T = any> {
  type: 'add' | 'update' | 'remove'
  keys: TableId[]
  data?: T[]
  timestamp: number
}

/**
 * 缓存项
 */
interface CacheItem<T = any> {
  data: T
  timestamp: number
  accessCount: number
  lastAccess: number
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 总数据量 */
  totalDataCount: number
  /** 缓存命中率 */
  cacheHitRate: number
  /** 平均渲染时间 */
  averageRenderTime: number
  /** 增量更新次数 */
  incrementalUpdateCount: number
  /** 懒加载次数 */
  lazyLoadCount: number
  /** 内存使用量 */
  memoryUsage: number
}

/**
 * 性能优化管理器实现类
 */
export class PerformanceManager<T extends TableRow = TableRow> {
  /** 配置 */
  private config: Required<PerformanceConfig>

  /** 事件管理器 */
  private eventManager: EventManager

  /** 数据变更记录 */
  private changeRecords: DataChangeRecord<T>[] = []

  /** 数据缓存 */
  private dataCache: Map<string, CacheItem<T[]>> = new Map()

  /** 渲染缓存 */
  private renderCache: Map<string, CacheItem<string>> = new Map()

  /** 待处理的更新队列 */
  private updateQueue: Array<() => void> = []

  /** 批量更新定时器 */
  private batchUpdateTimer: number | null = null

  /** 性能指标 */
  private metrics: PerformanceMetrics = {
    totalDataCount: 0,
    cacheHitRate: 0,
    averageRenderTime: 0,
    incrementalUpdateCount: 0,
    lazyLoadCount: 0,
    memoryUsage: 0
  }

  /** 渲染时间记录 */
  private renderTimes: number[] = []

  /** 缓存访问统计 */
  private cacheStats = {
    hits: 0,
    misses: 0
  }

  /**
   * 构造函数
   * @param config 性能优化配置
   */
  constructor(config: PerformanceConfig = {}) {
    this.config = {
      enableIncrementalUpdate: true,
      enableLazyLoading: true,
      enableDataCache: true,
      enableRenderCache: true,
      batchUpdateSize: 100,
      maxCacheSize: 1000,
      lazyLoadThreshold: 500,
      debounceDelay: 100,
      throttleInterval: 16,
      maxChangeRecords: 1000,
      ...config
    }

    this.eventManager = new EventManager()
  }

  /**
   * 记录数据变更
   */
  recordDataChange(type: 'add' | 'update' | 'remove', keys: TableId[], data?: T[]): void {
    if (!this.config.enableIncrementalUpdate) return

    const record: DataChangeRecord<T> = {
      type,
      keys,
      data,
      timestamp: Date.now()
    }

    this.changeRecords.push(record)

    // 限制记录数量
    if (this.changeRecords.length > this.config.maxChangeRecords) {
      this.changeRecords = this.changeRecords.slice(-Math.floor(this.config.maxChangeRecords / 2))
    }

    this.metrics.incrementalUpdateCount++
  }

  /**
   * 获取增量更新数据
   */
  getIncrementalUpdates(since: number): DataChangeRecord<T>[] {
    return this.changeRecords.filter(record => record.timestamp > since)
  }

  /**
   * 缓存数据
   */
  cacheData(key: string, data: T[]): void {
    if (!this.config.enableDataCache) return

    // 检查缓存大小限制
    if (this.dataCache.size >= this.config.maxCacheSize) {
      this.evictLeastRecentlyUsed(this.dataCache)
    }

    const cacheItem: CacheItem<T[]> = {
      data: [...data],
      timestamp: Date.now(),
      accessCount: 0,
      lastAccess: Date.now()
    }

    this.dataCache.set(key, cacheItem)
  }

  /**
   * 获取缓存数据
   */
  getCachedData(key: string): T[] | null {
    if (!this.config.enableDataCache) return null

    const cacheItem = this.dataCache.get(key)
    if (cacheItem) {
      cacheItem.accessCount++
      cacheItem.lastAccess = Date.now()
      this.cacheStats.hits++
      return [...cacheItem.data]
    }

    this.cacheStats.misses++
    return null
  }

  /**
   * 缓存渲染结果
   */
  cacheRender(key: string, html: string): void {
    if (!this.config.enableRenderCache) return

    // 检查缓存大小限制
    if (this.renderCache.size >= this.config.maxCacheSize) {
      this.evictLeastRecentlyUsed(this.renderCache)
    }

    const cacheItem: CacheItem<string> = {
      data: html,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccess: Date.now()
    }

    this.renderCache.set(key, cacheItem)
  }

  /**
   * 获取缓存的渲染结果
   */
  getCachedRender(key: string): string | null {
    if (!this.config.enableRenderCache) return null

    const cacheItem = this.renderCache.get(key)
    if (cacheItem) {
      cacheItem.accessCount++
      cacheItem.lastAccess = Date.now()
      this.cacheStats.hits++
      return cacheItem.data
    }

    this.cacheStats.misses++
    return null
  }

  /**
   * 添加批量更新任务
   */
  addBatchUpdate(updateFn: () => void): void {
    this.updateQueue.push(updateFn)

    if (this.updateQueue.length >= this.config.batchUpdateSize) {
      this.flushBatchUpdates()
    } else if (!this.batchUpdateTimer) {
      this.batchUpdateTimer = window.setTimeout(() => {
        this.flushBatchUpdates()
      }, this.config.debounceDelay)
    }
  }

  /**
   * 执行批量更新
   * @private
   */
  private flushBatchUpdates(): void {
    if (this.batchUpdateTimer) {
      clearTimeout(this.batchUpdateTimer)
      this.batchUpdateTimer = null
    }

    if (this.updateQueue.length === 0) return

    const startTime = performance.now()

    // 执行所有更新
    const updates = [...this.updateQueue]
    this.updateQueue = []

    updates.forEach(updateFn => {
      try {
        updateFn()
      } catch (error) {
        console.error('批量更新执行错误:', error)
      }
    })

    const endTime = performance.now()
    this.recordRenderTime(endTime - startTime)

    // 触发批量更新完成事件
    this.eventManager.emit('batch-update-complete', {
      updateCount: updates.length,
      duration: endTime - startTime
    })
  }

  /**
   * 懒加载数据
   */
  async lazyLoadData(
    loader: (offset: number, limit: number) => Promise<T[]>,
    offset: number,
    limit: number
  ): Promise<T[]> {
    if (!this.config.enableLazyLoading) {
      return loader(offset, limit)
    }

    const cacheKey = `lazy_${offset}_${limit}`
    const cached = this.getCachedData(cacheKey)

    if (cached) {
      return cached
    }

    try {
      const data = await loader(offset, limit)
      this.cacheData(cacheKey, data)
      this.metrics.lazyLoadCount++

      // 触发懒加载完成事件
      this.eventManager.emit('lazy-load-complete', {
        offset,
        limit,
        dataCount: data.length
      })

      return data
    } catch (error) {
      console.error('懒加载数据失败:', error)
      throw error
    }
  }

  /**
   * 记录渲染时间
   * @private
   */
  private recordRenderTime(time: number): void {
    this.renderTimes.push(time)

    // 限制记录数量
    if (this.renderTimes.length > 100) {
      this.renderTimes = this.renderTimes.slice(-50)
    }

    // 更新平均渲染时间
    this.metrics.averageRenderTime =
      this.renderTimes.reduce((sum, time) => sum + time, 0) / this.renderTimes.length
  }

  /**
   * 清除最近最少使用的缓存项
   * @private
   */
  private evictLeastRecentlyUsed<K>(cache: Map<string, CacheItem<K>>): void {
    let lruKey = ''
    let lruTime = Date.now()

    for (const [key, item] of cache.entries()) {
      if (item.lastAccess < lruTime) {
        lruTime = item.lastAccess
        lruKey = key
      }
    }

    if (lruKey) {
      cache.delete(lruKey)
    }
  }

  /**
   * 更新性能指标
   */
  updateMetrics(totalDataCount: number): void {
    this.metrics.totalDataCount = totalDataCount
    this.metrics.cacheHitRate =
      this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) || 0
    this.metrics.memoryUsage = this.estimateMemoryUsage()
  }

  /**
   * 估算内存使用量
   * @private
   */
  private estimateMemoryUsage(): number {
    let usage = 0

    // 估算数据缓存内存使用
    for (const item of this.dataCache.values()) {
      usage += JSON.stringify(item.data).length * 2 // 粗略估算
    }

    // 估算渲染缓存内存使用
    for (const item of this.renderCache.values()) {
      usage += item.data.length * 2
    }

    return usage
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * 清除所有缓存
   */
  clearCache(): void {
    this.dataCache.clear()
    this.renderCache.clear()
    this.cacheStats = { hits: 0, misses: 0 }
  }

  /**
   * 清除过期缓存
   */
  clearExpiredCache(maxAge: number = 300000): void { // 默认5分钟
    const now = Date.now()

    // 清除过期的数据缓存
    for (const [key, item] of this.dataCache.entries()) {
      if (now - item.timestamp > maxAge) {
        this.dataCache.delete(key)
      }
    }

    // 清除过期的渲染缓存
    for (const [key, item] of this.renderCache.entries()) {
      if (now - item.timestamp > maxAge) {
        this.renderCache.delete(key)
      }
    }
  }

  /**
   * 添加事件监听器
   */
  on(eventName: string, listener: (data: any) => void): void {
    this.eventManager.on(eventName, listener)
  }

  /**
   * 移除事件监听器
   */
  off(eventName: string, listener?: (data: any) => void): void {
    this.eventManager.off(eventName, listener)
  }

  /**
   * 销毁性能管理器
   */
  destroy(): void {
    if (this.batchUpdateTimer) {
      clearTimeout(this.batchUpdateTimer)
      this.batchUpdateTimer = null
    }

    this.clearCache()
    this.updateQueue = []
    this.changeRecords = []
    this.renderTimes = []
    this.eventManager.destroy()
  }
}
