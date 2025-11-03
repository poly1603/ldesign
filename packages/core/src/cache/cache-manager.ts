/**
 * 缓存管理器实现
 *
 * 提供高性能的缓存管理功能，支持多种淘汰策略和内存优化。
 *
 * 主要特性：
 * - 双向链表实现的 LRU，O(1) 时间复杂度
 * - 支持多种淘汰策略（LRU/LFU/FIFO）
 * - 内存占用估算和限制
 * - 自动清理过期数据
 * - 缓存预热和批量操作
 *
 * @packageDocumentation
 */

import type { CacheConfig, CacheEntry, CacheManager, CacheStats } from '../types'
import { CacheError, ErrorCodes } from '../errors'

/**
 * 双向链表节点
 */
interface LRUNode<T = any> {
  key: string
  value: T
  prev: LRUNode<T> | null
  next: LRUNode<T> | null
  entry: CacheEntry<T>
}

/**
 * 估算数据大小（字节）
 * 
 * @param value - 要估算的值
 * @returns 估算的字节数
 */
function estimateSize(value: any): number {
  if (value === null || value === undefined) {
    return 0
  }

  const type = typeof value

  switch (type) {
    case 'boolean':
      return 4
    case 'number':
      return 8
    case 'string':
      return value.length * 2 // UTF-16 编码
    case 'object':
      if (Array.isArray(value)) {
        return value.reduce((sum, item) => sum + estimateSize(item), 40)
      }
      // 对象：估算键和值的大小
      return Object.entries(value).reduce(
        (sum, [k, v]) => sum + k.length * 2 + estimateSize(v),
        40 // 对象本身的开销
      )
    default:
      return 40 // 默认估算
  }
}

/**
 * 核心缓存管理器实现
 * 
 * @example
 * ```typescript
 * const cache = new CoreCacheManager({
 *   maxSize: 100,
 *   maxMemory: 10 * 1024 * 1024, // 10MB
 *   strategy: 'lru',
 *   defaultTTL: 300000 // 5分钟
 * })
 * 
 * // 设置缓存
 * cache.set('user:123', userData, 60000)
 * 
 * // 获取缓存
 * const user = cache.get('user:123')
 * 
 * // 批量预热
 * await cache.warmup([
 *   { key: 'config', loader: () => fetchConfig() },
 *   { key: 'user', loader: () => fetchUser() }
 * ])
 * ```
 */
/**
 * 内存压力级别
 */
interface MemoryPressureLevel {
  level: 'normal' | 'moderate' | 'high' | 'critical'
  usageRatio: number
  timestamp: number
}

export class CoreCacheManager implements CacheManager {
  private cache = new Map<string, LRUNode>()
  private config: Required<CacheConfig>
  private cleanupTimer?: ReturnType<typeof setInterval>

  // LRU 双向链表
  private head: LRUNode | null = null
  private tail: LRUNode | null = null

  // 内存使用统计
  private memoryUsage = 0

  // 统计信息
  private stats: CacheStats = {
    size: 0,
    hits: 0,
    misses: 0,
    hitRate: 0,
    evictions: 0,
  }

  // 内存压力监控
  private memoryPressure: MemoryPressureLevel = {
    level: 'normal',
    usageRatio: 0,
    timestamp: Date.now()
  }
  private memoryMonitorTimer?: ReturnType<typeof setInterval>

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: config.maxSize ?? 100,
      defaultTTL: config.defaultTTL ?? 300000, // 5分钟
      strategy: config.strategy ?? 'lru',
      cleanupInterval: config.cleanupInterval ?? 60000, // 1分钟
      maxMemory: config.maxMemory,
      warnOnLargeCacheSize: config.warnOnLargeCacheSize ?? 1000,
    }

    // 启动定期清理
    this.startCleanup()

    // 启动内存监控
    if (this.isMemoryAPIAvailable()) {
      this.startMemoryMonitoring()
    }
  }

  /**
   * 设置缓存
   * 
   * @param key - 缓存键（不能为空）
   * @param value - 缓存值
   * @param ttl - 过期时间（毫秒），0 表示永不过期
   * 
   * @throws 如果 key 为空
   * 
   * @example
   * ```typescript
   * // 缓存 5 分钟
   * cache.set('user:123', userData, 300000)
   * 
   * // 永久缓存
   * cache.set('config', configData, 0)
   * ```
   */
  set<T = any>(key: string, value: T, ttl?: number): void {
    // 参数验证
    if (!key || key.trim().length === 0) {
      throw new CacheError(
        ErrorCodes.CACHE_INVALID_KEY,
        '缓存键不能为空',
        key,
        {
          suggestions: [
            '提供一个非空字符串作为缓存键',
            '检查缓存键是否正确格式化'
          ]
        }
      )
    }

    const now = Date.now()
    const effectiveTTL = ttl ?? this.config.defaultTTL

    // 估算内存大小
    const valueSize = estimateSize(value)

    const entry: CacheEntry<T> = {
      value,
      expires: effectiveTTL > 0 ? now + effectiveTTL : undefined,
      createdAt: now,
      accessCount: 0,
      lastAccessed: now,
      size: valueSize,
    }

    // 检查内存限制
    if (this.config.maxMemory) {
      const newMemoryUsage = this.memoryUsage + valueSize
      if (newMemoryUsage > this.config.maxMemory) {
        // 先尝试清理过期项
        this.cleanup()

        // 如果还是超限，驱逐项
        while (this.memoryUsage + valueSize > this.config.maxMemory && this.cache.size > 0) {
          this.evict()
        }
      }
    }

    // 检查容量限制
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evict()
    }

    // 如果 key 已存在，先删除旧节点
    if (this.cache.has(key)) {
      const oldNode = this.cache.get(key)!
      this.memoryUsage -= oldNode.entry.size || 0
      this.removeNode(oldNode)
    }

    // 创建新节点并添加到链表头部
    const node: LRUNode<T> = {
      key,
      value,
      entry,
      prev: null,
      next: null,
    }

    this.addToHead(node)
    this.cache.set(key, node)
    this.memoryUsage += valueSize

    this.updateStats()
    this.checkCacheSize()
  }

  /**
   * 获取缓存
   * 
   * @param key - 缓存键
   * @returns 缓存值，如果不存在或已过期则返回 undefined
   * 
   * @example
   * ```typescript
   * const user = cache.get<User>('user:123')
   * if (user) {
   *   console.log('缓存命中:', user.name)
   * } else {
   *   console.log('缓存未命中')
   * }
   * ```
   */
  get<T = any>(key: string): T | undefined {
    const node = this.cache.get(key) as LRUNode<T> | undefined

    if (!node) {
      this.stats.misses++
      this.updateStats()
      return undefined
    }

    // 检查是否过期
    if (node.entry.expires && Date.now() > node.entry.expires) {
      this.delete(key)
      this.stats.misses++
      this.updateStats()
      return undefined
    }

    // 更新访问信息
    node.entry.accessCount++
    node.entry.lastAccessed = Date.now()

    // LRU 策略：移到链表头部
    if (this.config.strategy === 'lru') {
      this.moveToHead(node)
    }

    this.stats.hits++
    this.updateStats()

    return node.value
  }

  /**
   * 检查缓存是否存在且未过期
   * 
   * @param key - 缓存键
   * @returns 是否存在
   */
  has(key: string): boolean {
    const node = this.cache.get(key)
    if (!node)
      return false

    // 检查是否过期
    if (node.entry.expires && Date.now() > node.entry.expires) {
      this.delete(key)
      return false
    }

    return true
  }

  /**
   * 删除缓存
   * 
   * @param key - 缓存键
   * @returns 是否删除成功
   */
  delete(key: string): boolean {
    const node = this.cache.get(key)
    if (!node)
      return false

    this.memoryUsage -= node.entry.size || 0
    this.removeNode(node)
    this.cache.delete(key)
    this.updateStats()

    return true
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
    this.head = null
    this.tail = null
    this.memoryUsage = 0
    this.updateStats()
  }

  /**
   * 获取缓存大小
   * 
   * @returns 缓存项数量
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 获取所有键
   * 
   * @returns 缓存键数组
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 批量设置缓存
   *
   * @param entries - 键值对数组
   * @param ttl - 过期时间（毫秒）
   */
  setMany(entries: Array<[string, any]>, ttl?: number): void {
    for (const [key, value] of entries) {
      this.set(key, value, ttl)
    }
  }

  /**
   * 批量获取缓存
   *
   * @param keys - 缓存键数组
   * @returns 值数组（不存在的键返回 undefined）
   */
  getMany<T = any>(keys: string[]): Array<T | undefined> {
    return keys.map(key => this.get<T>(key))
  }

  /**
   * 批量删除缓存
   *
   * @param keys - 缓存键数组
   */
  deleteMany(keys: string[]): void {
    for (const key of keys) {
      this.delete(key)
    }
  }

  /**
   * 获取缓存统计信息
   *
   * @returns 统计信息
   */
  getStats(): CacheStats {
    return {
      ...this.stats,
      memoryUsage: this.memoryUsage,
    }
  }

  /**
   * 批量预热缓存
   * 
   * 适用于应用启动时预加载常用数据。
   * 
   * @param loaders - 加载器配置数组
   * 
   * @example
   * ```typescript
   * await cache.warmup([
   *   { 
   *     key: 'config', 
   *     loader: async () => await fetchConfig(),
   *     ttl: 3600000 // 1小时
   *   },
   *   { 
   *     key: 'user', 
   *     loader: async () => await fetchUser() 
   *   }
   * ])
   * ```
   */
  async warmup(
    loaders: Array<{
      key: string
      loader: () => Promise<any> | any
      ttl?: number
    }>
  ): Promise<void> {
    const results = await Promise.allSettled(
      loaders.map(async ({ key, loader, ttl }) => {
        try {
          const value = await loader()
          this.set(key, value, ttl)
        }
        catch (error) {
          console.error(`Failed to warmup cache for key "${key}":`, error)
        }
      })
    )

    const failed = results.filter(r => r.status === 'rejected').length
    if (failed > 0) {
      console.warn(`Cache warmup completed with ${failed} failures`)
    }
  }

  /**
   * 清理过期缓存
   * 
   * 遍历所有缓存项，删除已过期的项。
   */
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.cache.forEach((node, key) => {
      if (node.entry.expires && now > node.entry.expires) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => this.delete(key))

    if (keysToDelete.length > 0) {
      console.debug(`Cleaned up ${keysToDelete.length} expired cache entries`)
    }
  }

  /**
   * 驱逐缓存项
   * 
   * 根据配置的策略驱逐一个缓存项。
   */
  private evict(): void {
    if (this.cache.size === 0)
      return

    let keyToEvict: string | undefined

    switch (this.config.strategy) {
      case 'lru':
        // LRU: 删除链表尾部（最少最近使用）
        if (this.tail) {
          keyToEvict = this.tail.key
        }
        break

      case 'lfu':
        // LFU: 删除访问次数最少的
        let minAccessCount = Infinity
        this.cache.forEach((node, key) => {
          if (node.entry.accessCount < minAccessCount) {
            minAccessCount = node.entry.accessCount
            keyToEvict = key
          }
        })
        break

      case 'fifo':
        // FIFO: 删除创建时间最早的
        let oldestTime = Infinity
        this.cache.forEach((node, key) => {
          if (node.entry.createdAt < oldestTime) {
            oldestTime = node.entry.createdAt
            keyToEvict = key
          }
        })
        break
    }

    if (keyToEvict) {
      this.delete(keyToEvict)
      this.stats.evictions++
    }
  }

  /**
   * 添加节点到链表头部
   */
  private addToHead(node: LRUNode): void {
    node.prev = null
    node.next = this.head

    if (this.head) {
      this.head.prev = node
    }

    this.head = node

    if (!this.tail) {
      this.tail = node
    }
  }

  /**
   * 从链表中移除节点
   */
  private removeNode(node: LRUNode): void {
    if (node.prev) {
      node.prev.next = node.next
    }
    else {
      this.head = node.next
    }

    if (node.next) {
      node.next.prev = node.prev
    }
    else {
      this.tail = node.prev
    }
  }

  /**
   * 将节点移到链表头部
   */
  private moveToHead(node: LRUNode): void {
    if (node === this.head)
      return

    this.removeNode(node)
    this.addToHead(node)
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    this.stats.size = this.cache.size
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0
  }

  /**
   * 检查缓存大小并警告
   */
  private checkCacheSize(): void {
    if (
      this.config.warnOnLargeCacheSize
      && this.cache.size >= this.config.warnOnLargeCacheSize
    ) {
      console.warn(
        `Cache size (${this.cache.size}) exceeds warning threshold (${this.config.warnOnLargeCacheSize}). ` +
        `Consider increasing maxSize or reducing cache usage.`
      )
    }
  }

  /**
   * 启动定期清理
   */
  private startCleanup(): void {
    if (this.config.cleanupInterval > 0) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup()
      }, this.config.cleanupInterval)

      // 防止定时器阻止进程退出
      if (this.cleanupTimer.unref) {
        this.cleanupTimer.unref()
      }
    }
  }

  /**
   * 停止定期清理
   */
  private stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
  }

  /**
   * 检查内存 API 是否可用
   */
  private isMemoryAPIAvailable(): boolean {
    return typeof performance !== 'undefined' &&
           'memory' in performance &&
           typeof (performance as any).memory === 'object'
  }

  /**
   * 启动内存监控
   */
  private startMemoryMonitoring(): void {
    this.memoryMonitorTimer = setInterval(() => {
      this.checkMemoryPressure()
    }, 30000) // 每 30 秒检查一次

    if (this.memoryMonitorTimer.unref) {
      this.memoryMonitorTimer.unref()
    }
  }

  /**
   * 停止内存监控
   */
  private stopMemoryMonitoring(): void {
    if (this.memoryMonitorTimer) {
      clearInterval(this.memoryMonitorTimer)
      this.memoryMonitorTimer = undefined
    }
  }

  /**
   * 检查内存压力
   */
  private checkMemoryPressure(): void {
    const memory = (performance as any).memory
    if (!memory) return

    const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit
    const previousLevel = this.memoryPressure.level

    // 确定压力级别
    let level: MemoryPressureLevel['level']
    if (usageRatio > 0.95) {
      level = 'critical'
    } else if (usageRatio > 0.85) {
      level = 'high'
    } else if (usageRatio > 0.7) {
      level = 'moderate'
    } else {
      level = 'normal'
    }

    this.memoryPressure = {
      level,
      usageRatio,
      timestamp: Date.now()
    }

    // 级别变化时响应
    if (level !== previousLevel) {
      this.respondToMemoryPressure(level)
    }
  }

  /**
   * 响应内存压力
   */
  private respondToMemoryPressure(level: MemoryPressureLevel['level']): void {
    switch (level) {
      case 'critical':
        console.warn('检测到严重内存压力,执行激进清理')
        this.cleanup() // 清理过期项
        this.shrinkCache(0.5) // 清理 50% 的缓存
        break

      case 'high':
        console.warn('检测到高内存压力,执行适度清理')
        this.cleanup()
        this.shrinkCache(0.3) // 清理 30% 的缓存
        break

      case 'moderate':
        console.info('检测到中等内存压力,执行轻度清理')
        this.cleanup()
        break

      case 'normal':
        // 正常状态,无需操作
        break
    }
  }

  /**
   * 收缩缓存
   *
   * @param ratio - 收缩比例 (0-1)
   */
  private shrinkCache(ratio: number): void {
    const targetSize = Math.floor(this.cache.size * (1 - ratio))

    while (this.cache.size > targetSize) {
      this.evict()
    }

    console.debug(`缓存已收缩至 ${this.cache.size} 项 (减少 ${ratio * 100}%)`)
  }

  /**
   * 获取当前内存压力状态
   */
  getMemoryPressure(): MemoryPressureLevel {
    return { ...this.memoryPressure }
  }

  /**
   * 初始化
   */
  async init(): Promise<void> {
    // 初始化逻辑（如果需要）
  }

  /**
   * 销毁
   *
   * 清理所有资源，停止定时器。
   */
  async destroy(): Promise<void> {
    this.stopCleanup()
    this.stopMemoryMonitoring()
    this.clear()
  }
}

/**
 * 创建缓存管理器
 * 
 * @param config - 缓存配置
 * @returns 缓存管理器实例
 * 
 * @example
 * ```typescript
 * const cache = createCacheManager({
 *   maxSize: 500,
 *   defaultTTL: 300000,
 *   strategy: 'lru'
 * })
 * ```
 */
export function createCacheManager(config?: CacheConfig): CacheManager {
  return new CoreCacheManager(config)
}
