/**
 * 高级缓存服务
 * 提供多种缓存策略和智能缓存管理
 */

import type {
  CacheConfig,
  CacheItem,
  EventData,
  EventListener,
} from '../types'

/**
 * 缓存统计信息
 */
interface CacheStats {
  hits: number
  misses: number
  evictions: number
  totalSize: number
  itemCount: number
  hitRate: number
  memoryUsage: number
}

/**
 * 高级缓存服务类
 */
export class CacheService<T = any> {
  private config: Required<CacheConfig>
  private cache = new Map<string, CacheItem<T>>()
  private accessOrder: string[] = [] // LRU 访问顺序
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalSize: 0,
    itemCount: 0,
    hitRate: 0,
    memoryUsage: 0,
  }

  private listeners = new Map<string, EventListener[]>()
  private cleanupTimer: NodeJS.Timeout | null = null

  constructor(config: CacheConfig = {}) {
    this.config = this.normalizeConfig(config)
    this.startCleanupTimer()
  }

  /**
   * 标准化配置
   */
  private normalizeConfig(config: CacheConfig): Required<CacheConfig> {
    return {
      enabled: config.enabled ?? true,
      strategy: config.strategy ?? 'lru',
      maxSize: config.maxSize ?? 50,
      ttl: config.ttl ?? 30 * 60 * 1000, // 30分钟
      persistent: config.persistent ?? false,
      keyPrefix: config.keyPrefix ?? 'template:',
    }
  }

  /**
   * 获取缓存项
   */
  get(key: string): T | null {
    if (!this.config.enabled) {
      this.stats.misses++
      return null
    }

    const fullKey = this.getFullKey(key)
    const item = this.cache.get(fullKey)

    if (!item) {
      this.stats.misses++
      this.updateHitRate()
      return null
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.delete(key)
      this.stats.misses++
      this.updateHitRate()
      return null
    }

    // 更新访问信息
    this.updateAccessInfo(item)
    this.updateAccessOrder(fullKey)

    this.stats.hits++
    this.updateHitRate()

    this.emit('cache:hit', { key, item })
    return item.value
  }

  /**
   * 设置缓存项
   */
  set(key: string, value: T, customTTL?: number): void {
    if (!this.config.enabled) {
      return
    }

    const fullKey = this.getFullKey(key)
    const size = this.calculateSize(value)
    const ttl = customTTL ?? this.config.ttl

    // 检查是否需要清理空间
    this.ensureSpace(size)

    const item: CacheItem<T> = {
      key: fullKey,
      value,
      createdAt: Date.now(),
      accessedAt: Date.now(),
      accessCount: 1,
      expiresAt: ttl > 0 ? Date.now() + ttl : undefined,
      size,
    }

    // 如果键已存在，先删除旧的
    if (this.cache.has(fullKey)) {
      this.delete(key, false)
    }

    this.cache.set(fullKey, item)
    this.updateAccessOrder(fullKey)
    this.updateStats(size)

    this.emit('cache:set', { key, item })
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string): boolean {
    if (!this.config.enabled) {
      return false
    }

    const fullKey = this.getFullKey(key)
    const item = this.cache.get(fullKey)

    if (!item) {
      return false
    }

    if (this.isExpired(item)) {
      this.delete(key)
      return false
    }

    return true
  }

  /**
   * 删除缓存项
   */
  delete(key: string, updateStats = true): boolean {
    const fullKey = this.getFullKey(key)
    const item = this.cache.get(fullKey)

    if (!item) {
      return false
    }

    this.cache.delete(fullKey)
    this.removeFromAccessOrder(fullKey)

    if (updateStats) {
      this.updateStats(-item.size!)
    }

    this.emit('cache:delete', { key, item })
    return true
  }

  /**
   * 清空缓存
   */
  clear(): void {
    const itemCount = this.cache.size
    this.cache.clear()
    this.accessOrder = []
    this.stats.totalSize = 0
    this.stats.itemCount = 0

    this.emit('cache:clear', { itemCount })
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    return Array.from(this.cache.keys()).map(key =>
      key.startsWith(this.config.keyPrefix)
        ? key.slice(this.config.keyPrefix.length)
        : key,
    )
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * 清理过期项
   */
  cleanup(): number {
    let cleanedCount = 0
    const now = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key)
        this.removeFromAccessOrder(key)
        this.updateStats(-item.size!)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      this.emit('cache:cleanup', { cleanedCount })
    }

    return cleanedCount
  }

  /**
   * 预热缓存
   */
  async warmup(entries: Array<{ key: string, value: T, ttl?: number }>): Promise<void> {
    for (const entry of entries) {
      this.set(entry.key, entry.value, entry.ttl)
    }

    this.emit('cache:warmup', { count: entries.length })
  }

  /**
   * 获取内存使用情况
   */
  getMemoryUsage(): {
    totalSize: number
    itemCount: number
    averageItemSize: number
    maxSize: number
    usagePercentage: number
  } {
    const totalSize = this.stats.totalSize
    const itemCount = this.stats.itemCount
    const averageItemSize = itemCount > 0 ? totalSize / itemCount : 0
    const maxSize = this.config.maxSize
    const usagePercentage = maxSize > 0 ? (itemCount / maxSize) * 100 : 0

    return {
      totalSize,
      itemCount,
      averageItemSize,
      maxSize,
      usagePercentage,
    }
  }

  /**
   * 导出缓存数据
   */
  export(): Array<{ key: string, value: T, metadata: Omit<CacheItem<T>, 'value'> }> {
    return Array.from(this.cache.entries()).map(([key, item]) => ({
      key: key.startsWith(this.config.keyPrefix)
        ? key.slice(this.config.keyPrefix.length)
        : key,
      value: item.value,
      metadata: {
        key: item.key,
        createdAt: item.createdAt,
        accessedAt: item.accessedAt,
        accessCount: item.accessCount,
        expiresAt: item.expiresAt,
        size: item.size,
      },
    }))
  }

  /**
   * 导入缓存数据
   */
  import(data: Array<{ key: string, value: T, metadata?: Partial<CacheItem<T>> }>): void {
    for (const entry of data) {
      const item: CacheItem<T> = {
        key: this.getFullKey(entry.key),
        value: entry.value,
        createdAt: entry.metadata?.createdAt ?? Date.now(),
        accessedAt: entry.metadata?.accessedAt ?? Date.now(),
        accessCount: entry.metadata?.accessCount ?? 1,
        expiresAt: entry.metadata?.expiresAt,
        size: entry.metadata?.size ?? this.calculateSize(entry.value),
      }

      // 检查是否过期
      if (!this.isExpired(item)) {
        this.cache.set(item.key, item)
        this.updateAccessOrder(item.key)
        this.updateStats(item.size!)
      }
    }

    this.emit('cache:import', { count: data.length })
  }

  // ==================== 私有方法 ====================

  /**
   * 获取完整键名
   */
  private getFullKey(key: string): string {
    return `${this.config.keyPrefix}${key}`
  }

  /**
   * 检查项是否过期
   */
  private isExpired(item: CacheItem<T>): boolean {
    return item.expiresAt ? Date.now() > item.expiresAt : false
  }

  /**
   * 更新访问信息
   */
  private updateAccessInfo(item: CacheItem<T>): void {
    item.accessedAt = Date.now()
    item.accessCount++
  }

  /**
   * 更新访问顺序（LRU）
   */
  private updateAccessOrder(key: string): void {
    if (this.config.strategy !== 'lru') {
      return
    }

    // 移除旧位置
    this.removeFromAccessOrder(key)
    // 添加到末尾（最近使用）
    this.accessOrder.push(key)
  }

  /**
   * 从访问顺序中移除
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
  }

  /**
   * 确保有足够空间
   */
  private ensureSpace(newItemSize: number): void {
    while (this.cache.size >= this.config.maxSize) {
      this.evictOne()
    }
  }

  /**
   * 驱逐一个项
   */
  private evictOne(): void {
    let keyToEvict: string | null = null

    switch (this.config.strategy) {
      case 'lru':
        keyToEvict = this.accessOrder[0] || null
        break

      case 'fifo':
        keyToEvict = this.cache.keys().next().value || null
        break

      case 'ttl':
        keyToEvict = this.findEarliestExpiring()
        break

      default:
        keyToEvict = this.cache.keys().next().value || null
    }

    if (keyToEvict) {
      const item = this.cache.get(keyToEvict)
      this.cache.delete(keyToEvict)
      this.removeFromAccessOrder(keyToEvict)

      if (item) {
        this.updateStats(-item.size!)
        this.stats.evictions++
        this.emit('cache:evict', { key: keyToEvict, item })
      }
    }
  }

  /**
   * 查找最早过期的项
   */
  private findEarliestExpiring(): string | null {
    let earliestKey: string | null = null
    let earliestTime = Infinity

    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt && item.expiresAt < earliestTime) {
        earliestTime = item.expiresAt
        earliestKey = key
      }
    }

    return earliestKey
  }

  /**
   * 计算项大小
   */
  private calculateSize(value: T): number {
    try {
      return JSON.stringify(value).length
    }
    catch {
      return 1 // 默认大小
    }
  }

  /**
   * 更新统计信息
   */
  private updateStats(sizeDelta: number): void {
    this.stats.totalSize += sizeDelta
    this.stats.itemCount = this.cache.size
    this.stats.memoryUsage = this.stats.totalSize
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    if (this.config.ttl > 0) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup()
      }, Math.min(this.config.ttl / 4, 60000)) // 最多每分钟清理一次
    }
  }

  /**
   * 事件发射器
   */
  private emit(type: string, data: any): void {
    const eventData: EventData = {
      type: type as any,
      timestamp: Date.now(),
      data,
    }

    const listeners = this.listeners.get(type) || []
    listeners.forEach((listener) => {
      try {
        listener(eventData)
      }
      catch (error) {
        console.error(`Error in cache event listener for ${type}:`, error)
      }
    })
  }

  /**
   * 添加事件监听器
   */
  on(type: string, listener: EventListener): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type)!.push(listener)
  }

  /**
   * 移除事件监听器
   */
  off(type: string, listener: EventListener): void {
    const listeners = this.listeners.get(type)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 清理资源
   */
  dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }

    this.clear()
    this.listeners.clear()
  }
}
