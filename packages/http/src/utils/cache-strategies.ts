/**
 * 缓存策略模块
 * 
 * 提供各种缓存策略和统计功能
 */

import type { RequestConfig, ResponseData } from '../types'

/**
 * 缓存统计信息
 */
export interface CacheStats {
  /** 命中次数 */
  hits: number
  /** 未命中次数 */
  misses: number
  /** 命中率 */
  hitRate: number
  /** 缓存大小 */
  size: number
  /** 总内存使用量（字节） */
  memoryUsage: number
  /** 最近访问的键 */
  recentKeys: string[]
  /** 最热门的键 */
  hotKeys: Array<{ key: string; accessCount: number }>
}

/**
 * 缓存策略接口
 */
export interface CacheStrategy {
  /** 策略名称 */
  name: string
  /** 是否应该缓存该响应 */
  shouldCache: (config: RequestConfig, response: ResponseData) => boolean
  /** 获取缓存TTL */
  getTTL: (config: RequestConfig, response: ResponseData) => number
  /** 生成缓存键 */
  generateKey: (config: RequestConfig) => string
}

/**
 * LRU缓存策略
 */
export class LRUCacheStrategy implements CacheStrategy {
  name = 'lru'
  private maxSize: number
  private accessOrder = new Map<string, number>()
  private counter = 0

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  shouldCache(config: RequestConfig, response: ResponseData): boolean {
    // 只缓存成功的GET请求
    return config.method === 'GET' && response.status >= 200 && response.status < 300
  }

  getTTL(_config: RequestConfig, response: ResponseData): number {
    // 根据响应头决定TTL
    const cacheControl = response.headers?.['cache-control']
    if (cacheControl) {
      const maxAge = this.parseMaxAge(cacheControl)
      if (maxAge) {
        return maxAge * 1000
      }
    }
    // 默认5分钟
    return 5 * 60 * 1000
  }

  generateKey(config: RequestConfig): string {
    const { method = 'GET', url = '', params = {} } = config
    const paramStr = Object.keys(params).sort()
      .map(k => `${k}=${params[k]}`)
      .join('&')
    return `${method}:${url}${paramStr ? `?${paramStr}` : ''}`
  }

  /**
   * 记录访问顺序
   */
  recordAccess(key: string): void {
    this.accessOrder.set(key, this.counter++)
    // 超过容量则淘汰最久未使用项
    if (this.accessOrder.size > this.maxSize) {
      this.evict()
    }
  }

  /**
   * 获取最近最少使用的键
   */
  getLRUKey(): string | null {
    if (this.accessOrder.size === 0) return null
    
    let lruKey = ''
    let minCount = Number.MAX_SAFE_INTEGER
    
    for (const [key, count] of this.accessOrder) {
      if (count < minCount) {
        minCount = count
        lruKey = key
      }
    }
    
    return lruKey
  }

  /**
   * 淘汰LRU项
   */
  evict(): string | null {
    const lruKey = this.getLRUKey()
    if (lruKey) {
      this.accessOrder.delete(lruKey)
    }
    return lruKey
  }

  private parseMaxAge(cacheControl: string): number | null {
    const match = cacheControl.match(/max-age=(\d+)/)
    return match ? Number.parseInt(match[1], 10) : null
  }
}

/**
 * LFU缓存策略
 */
export class LFUCacheStrategy implements CacheStrategy {
  name = 'lfu'
  private frequency = new Map<string, number>()
  private maxSize: number

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  shouldCache(config: RequestConfig, response: ResponseData): boolean {
    return config.method === 'GET' && response.status >= 200 && response.status < 300
  }

  getTTL(_config: RequestConfig, _response: ResponseData): number {
    return 10 * 60 * 1000 // 10分钟
  }

  generateKey(config: RequestConfig): string {
    const { method = 'GET', url = '', params = {} } = config
    const paramStr = JSON.stringify(params)
    return `${method}:${url}:${paramStr}`
  }

  /**
   * 记录访问频率
   */
  recordAccess(key: string): void {
    const count = this.frequency.get(key) || 0
    this.frequency.set(key, count + 1)
    // 超过容量则淘汰最少使用项
    if (this.frequency.size > this.maxSize) {
      this.evict()
    }
  }

  /**
   * 获取最少使用的键
   */
  getLFUKey(): string | null {
    if (this.frequency.size === 0) return null
    
    let lfuKey = ''
    let minFreq = Number.MAX_SAFE_INTEGER
    
    for (const [key, freq] of this.frequency) {
      if (freq < minFreq) {
        minFreq = freq
        lfuKey = key
      }
    }
    
    return lfuKey
  }

  /**
   * 淘汰LFU项
   */
  evict(): string | null {
    const lfuKey = this.getLFUKey()
    if (lfuKey) {
      this.frequency.delete(lfuKey)
    }
    return lfuKey
  }
}

/**
 * TTL缓存策略
 */
export class TTLCacheStrategy implements CacheStrategy {
  name = 'ttl'
  private defaultTTL: number

  constructor(defaultTTL = 5 * 60 * 1000) {
    this.defaultTTL = defaultTTL
  }

  shouldCache(_config: RequestConfig, response: ResponseData): boolean {
    // 不缓存错误响应
    return response.status >= 200 && response.status < 400
  }

  getTTL(config: RequestConfig, response: ResponseData): number {
    // 优先使用配置中的TTL
    const ttl = (config as any)?.cache?.ttl as number | undefined
    if (ttl) {
      return ttl
    }

    // 然后使用响应头中的缓存控制
    const cacheControl = response.headers?.['cache-control']
    if (cacheControl) {
      if (cacheControl.includes('no-cache') || cacheControl.includes('no-store')) {
        return 0
      }
      const maxAge = this.parseMaxAge(cacheControl)
      if (maxAge) {
        return maxAge * 1000
      }
    }

    // 使用默认TTL
    return this.defaultTTL
  }

  generateKey(config: RequestConfig): string {
    return `${config.method}:${config.url}:${Date.now()}`
  }

  private parseMaxAge(cacheControl: string): number | null {
    const match = cacheControl.match(/max-age=(\d+)/)
    return match ? Number.parseInt(match[1], 10) : null
  }
}

/**
 * 智能缓存策略（基于机器学习预测）
 */
export class SmartCacheStrategy implements CacheStrategy {
  name = 'smart'
  private accessHistory = new Map<string, number[]>()
  private hitRates = new Map<string, number>()

  shouldCache(config: RequestConfig, response: ResponseData): boolean {
    // 基于历史命中率决定是否缓存
    const key = this.generateKey(config)
    const hitRate = this.hitRates.get(key) || 0

    // 如果命中率高于30%，则缓存
    if (hitRate > 0.3) {
      return true
    }

    // 对于新请求，默认缓存GET请求
    return config.method === 'GET' && response.status === 200
  }

  getTTL(config: RequestConfig, _response: ResponseData): number {
    // 基于访问模式预测TTL
    const key = this.generateKey(config)
    const history = this.accessHistory.get(key) || []

    if (history.length >= 2) {
      // 计算平均访问间隔
      const intervals: number[] = []
      for (let i = 1; i < history.length; i++) {
        intervals.push(history[i] - history[i - 1])
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length

      // TTL设置为平均间隔的2倍
      return Math.min(avgInterval * 2, 30 * 60 * 1000) // 最长30分钟
    }

    // 默认5分钟
    return 5 * 60 * 1000
  }

  generateKey(config: RequestConfig): string {
    const { method = 'GET', url = '' } = config
    // 忽略查询参数，只关注端点
    const baseUrl = url.split('?')[0]
    return `${method}:${baseUrl}`
  }

  /**
   * 记录访问历史
   */
  recordAccess(key: string, hit: boolean): void {
    // 更新访问历史
    const history = this.accessHistory.get(key) || []
    history.push(Date.now())
    
    // 只保留最近10次访问
    if (history.length > 10) {
      history.shift()
    }
    
    this.accessHistory.set(key, history)

    // 更新命中率
    const currentRate = this.hitRates.get(key) || 0
    const newRate = hit 
      ? currentRate * 0.9 + 0.1  // 命中时增加
      : currentRate * 0.9         // 未命中时衰减
    this.hitRates.set(key, newRate)
  }
}

/**
 * 缓存统计收集器
 */
export class CacheStatsCollector {
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    size: 0,
    memoryUsage: 0,
    recentKeys: [],
    hotKeys: [],
  }

  private accessLog = new Map<string, number>()
  private maxRecentKeys = 10
  private maxHotKeys = 10

  /**
   * 记录缓存命中
   */
  recordHit(key: string): void {
    this.stats.hits++
    this.updateHitRate()
    this.recordAccess(key)
  }

  /**
   * 记录缓存未命中
   */
  recordMiss(key: string): void {
    this.stats.misses++
    this.updateHitRate()
    this.updateRecentKeys(key)
  }

  /**
   * 记录缓存访问
   */
  private recordAccess(key: string): void {
    const count = this.accessLog.get(key) || 0
    this.accessLog.set(key, count + 1)
    
    this.updateRecentKeys(key)
    this.updateHotKeys()
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0
  }

  /**
   * 更新最近访问的键
   */
  private updateRecentKeys(key: string): void {
    // 移除已存在的键
    const index = this.stats.recentKeys.indexOf(key)
    if (index > -1) {
      this.stats.recentKeys.splice(index, 1)
    }

    // 添加到开头
    this.stats.recentKeys.unshift(key)

    // 限制数量
    if (this.stats.recentKeys.length > this.maxRecentKeys) {
      this.stats.recentKeys = this.stats.recentKeys.slice(0, this.maxRecentKeys)
    }
  }

  /**
   * 更新热门键
   */
  private updateHotKeys(): void {
    this.stats.hotKeys = Array.from(this.accessLog.entries())
      .map(([key, count]) => ({ key, accessCount: count }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, this.maxHotKeys)
  }

  /**
   * 更新缓存大小
   */
  updateSize(size: number): void {
    this.stats.size = size
  }

  /**
   * 更新内存使用量
   */
  updateMemoryUsage(bytes: number): void {
    this.stats.memoryUsage = bytes
  }

  /**
   * 获取统计信息
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * 重置统计
   */
  reset(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      size: 0,
      memoryUsage: 0,
      recentKeys: [],
      hotKeys: [],
    }
    this.accessLog.clear()
  }
}

/**
 * 创建缓存策略
 */
export function createCacheStrategy(
  type: 'lru' | 'lfu' | 'ttl' | 'smart' = 'lru',
  options?: any
): CacheStrategy {
  switch (type) {
    case 'lfu':
      return new LFUCacheStrategy(options?.maxSize)
    case 'ttl':
      return new TTLCacheStrategy(options?.defaultTTL)
    case 'smart':
      return new SmartCacheStrategy()
    case 'lru':
    default:
      return new LRUCacheStrategy(options?.maxSize)
  }
}