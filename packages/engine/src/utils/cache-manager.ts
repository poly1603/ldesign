/**
 * 高级缓存和内存管理系统
 * 
 * 提供以下功能:
 * - LRU (Least Recently Used) 缓存
 * - TTL (Time To Live) 支持
 * - 内存监控和限制
 * - 对象池管理
 * - 缓存统计和分析
 * - 自动清理策略
 * 
 * @module cache-manager
 */

/**
 * 缓存配置选项
 */
export interface CacheOptions {
  /** 最大缓存条目数 */
  maxSize?: number
  /** 默认TTL（毫秒） */
  defaultTTL?: number
  /** 是否启用统计 */
  enableStats?: boolean
  /** 内存限制（字节） */
  maxMemory?: number
  /** 清理间隔（毫秒） */
  cleanupInterval?: number
  /** 当缓存满时的回调 */
  onEvict?: (key: string, value: any) => void
}

/**
 * 缓存条目
 */
interface CacheEntry<T> {
  /** 缓存值 */
  value: T
  /** 过期时间戳 */
  expiresAt: number
  /** 最后访问时间 */
  lastAccessed: number
  /** 访问次数 */
  accessCount: number
  /** 估计大小（字节） */
  size: number
}

/**
 * 缓存统计
 */
export interface CacheStats {
  /** 总请求数 */
  hits: number
  /** 未命中数 */
  misses: number
  /** 命中率 */
  hitRate: number
  /** 当前条目数 */
  size: number
  /** 总内存使用（字节） */
  memoryUsage: number
  /** 淘汰次数 */
  evictions: number
  /** 过期次数 */
  expirations: number
}

/**
 * LRU缓存实现
 * 
 * @example
 * ```typescript
 * const cache = new LRUCache<string>({
 *   maxSize: 100,
 *   defaultTTL: 60000, // 1分钟
 *   onEvict: (key, value) => console.log(`淘汰: ${key}`)
 * })
 * 
 * // 设置缓存
 * cache.set('user:1', { name: 'John' })
 * 
 * // 获取缓存
 * const user = cache.get('user:1')
 * 
 * // 带TTL的缓存
 * cache.set('temp', data, 5000) // 5秒后过期
 * ```
 */
export class LRUCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>()
  private accessOrder: string[] = []
  private options: Required<CacheOptions>
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    expirations: 0,
  }
  private cleanupTimer?: NodeJS.Timeout
  private totalMemory = 0

  constructor(options: CacheOptions = {}) {
    this.options = {
      maxSize: options.maxSize ?? 1000,
      defaultTTL: options.defaultTTL ?? 0, // 0 = 永不过期
      enableStats: options.enableStats ?? true,
      maxMemory: options.maxMemory ?? 0, // 0 = 无限制
      cleanupInterval: options.cleanupInterval ?? 60000, // 1分钟
      onEvict: options.onEvict ?? (() => {}),
    }

    // 启动定期清理
    if (this.options.cleanupInterval > 0) {
      this.startCleanup()
    }
  }

  /**
   * 设置缓存
   * 
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttl - TTL（毫秒），覆盖默认TTL
   */
  set(key: string, value: T, ttl?: number): void {
    // 检查是否需要淘汰
    if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
      this.evictLRU()
    }

    const now = Date.now()
    const effectiveTTL = ttl ?? this.options.defaultTTL
    const size = this.estimateSize(value)

    // 检查内存限制
    if (this.options.maxMemory > 0) {
      while (
        this.totalMemory + size > this.options.maxMemory &&
        this.cache.size > 0
      ) {
        this.evictLRU()
      }
    }

    // 删除旧值（如果存在）
    if (this.cache.has(key)) {
      const oldEntry = this.cache.get(key)!
      this.totalMemory -= oldEntry.size
    }

    const entry: CacheEntry<T> = {
      value,
      expiresAt: effectiveTTL > 0 ? now + effectiveTTL : Infinity,
      lastAccessed: now,
      accessCount: 0,
      size,
    }

    this.cache.set(key, entry)
    this.totalMemory += size
    this.updateAccessOrder(key)
  }

  /**
   * 获取缓存
   * 
   * @param key - 缓存键
   * @returns 缓存值，如果不存在或已过期返回undefined
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key)

    if (!entry) {
      if (this.options.enableStats) {
        this.stats.misses++
      }
      return undefined
    }

    // 检查是否过期
    if (entry.expiresAt < Date.now()) {
      this.delete(key)
      if (this.options.enableStats) {
        this.stats.misses++
        this.stats.expirations++
      }
      return undefined
    }

    // 更新访问信息
    entry.lastAccessed = Date.now()
    entry.accessCount++
    this.updateAccessOrder(key)

    if (this.options.enableStats) {
      this.stats.hits++
    }

    return entry.value
  }

  /**
   * 检查缓存是否存在且未过期
   */
  has(key: string): boolean {
    return this.get(key) !== undefined
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (entry) {
      this.totalMemory -= entry.size
      this.cache.delete(key)
      this.accessOrder = this.accessOrder.filter((k) => k !== key)
      return true
    }
    return false
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
    this.accessOrder = []
    this.totalMemory = 0
  }

  /**
   * 获取缓存统计
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      size: this.cache.size,
      memoryUsage: this.totalMemory,
      evictions: this.stats.evictions,
      expirations: this.stats.expirations,
    }
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      expirations: 0,
    }
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * 清理过期条目
   */
  cleanup(): number {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.delete(key)
        cleaned++
        if (this.options.enableStats) {
          this.stats.expirations++
        }
      }
    }

    return cleaned
  }

  /**
   * 销毁缓存
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    this.clear()
  }

  /**
   * 淘汰最少使用的条目
   */
  private evictLRU(): void {
    if (this.accessOrder.length === 0) return

    const keyToEvict = this.accessOrder[0]
    const entry = this.cache.get(keyToEvict)

    if (entry) {
      this.options.onEvict(keyToEvict, entry.value)
      this.delete(keyToEvict)
      if (this.options.enableStats) {
        this.stats.evictions++
      }
    }
  }

  /**
   * 更新访问顺序
   */
  private updateAccessOrder(key: string): void {
    this.accessOrder = this.accessOrder.filter((k) => k !== key)
    this.accessOrder.push(key)
  }

  /**
   * 估算值的大小
   */
  private estimateSize(value: T): number {
    try {
      return JSON.stringify(value).length * 2 // 粗略估计（UTF-16）
    } catch {
      return 1024 // 默认1KB
    }
  }

  /**
   * 启动定期清理
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.options.cleanupInterval)
  }
}

/**
 * 对象池配置
 */
export interface ObjectPoolOptions<T> {
  /** 初始大小 */
  initialSize?: number
  /** 最大大小 */
  maxSize?: number
  /** 创建对象的工厂函数 */
  factory: () => T
  /** 重置对象的函数 */
  reset?: (obj: T) => void
  /** 验证对象是否可用 */
  validate?: (obj: T) => boolean
}

/**
 * 对象池实现
 * 用于重用对象，减少GC压力
 * 
 * @example
 * ```typescript
 * // 创建点对象池
 * const pointPool = new ObjectPool({
 *   factory: () => ({ x: 0, y: 0 }),
 *   reset: (point) => {
 *     point.x = 0
 *     point.y = 0
 *   },
 *   initialSize: 50,
 *   maxSize: 200
 * })
 * 
 * // 获取对象
 * const point = pointPool.acquire()
 * point.x = 100
 * point.y = 200
 * 
 * // 归还对象
 * pointPool.release(point)
 * ```
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private options: Required<ObjectPoolOptions<T>>
  private stats = {
    created: 0,
    acquired: 0,
    released: 0,
    reused: 0,
  }

  constructor(options: ObjectPoolOptions<T>) {
    this.options = {
      initialSize: options.initialSize ?? 10,
      maxSize: options.maxSize ?? 100,
      factory: options.factory,
      reset: options.reset ?? (() => {}),
      validate: options.validate ?? (() => true),
    }

    // 预创建对象
    for (let i = 0; i < this.options.initialSize; i++) {
      this.pool.push(this.createObject())
    }
  }

  /**
   * 获取对象
   */
  acquire(): T {
    this.stats.acquired++

    // 尝试从池中获取
    while (this.pool.length > 0) {
      const obj = this.pool.pop()!

      if (this.options.validate(obj)) {
        this.stats.reused++
        return obj
      }
    }

    // 池为空，创建新对象
    return this.createObject()
  }

  /**
   * 归还对象
   */
  release(obj: T): void {
    if (!obj) return

    this.stats.released++

    // 重置对象
    this.options.reset(obj)

    // 如果池未满，放回池中
    if (this.pool.length < this.options.maxSize) {
      this.pool.push(obj)
    }
  }

  /**
   * 批量归还
   */
  releaseAll(objects: T[]): void {
    objects.forEach((obj) => this.release(obj))
  }

  /**
   * 获取池统计
   */
  getStats() {
    return {
      ...this.stats,
      poolSize: this.pool.length,
      reuseRate:
        this.stats.acquired > 0 ? this.stats.reused / this.stats.acquired : 0,
    }
  }

  /**
   * 清空对象池
   */
  clear(): void {
    this.pool = []
  }

  /**
   * 创建新对象
   */
  private createObject(): T {
    this.stats.created++
    return this.options.factory()
  }
}

/**
 * 内存监控器
 * 
 * @example
 * ```typescript
 * const monitor = new MemoryMonitor({
 *   checkInterval: 5000,
 *   threshold: 0.9,
 *   onThresholdExceeded: (usage) => {
 *     console.warn('内存使用超过阈值:', usage)
 *     // 清理缓存等操作
 *   }
 * })
 * 
 * // 获取当前内存使用
 * const usage = monitor.getUsage()
 * ```
 */
export class MemoryMonitor {
  private timer?: NodeJS.Timeout
  private history: number[] = []
  private maxHistorySize = 100
  private options: {
    checkInterval: number
    threshold: number
    onThresholdExceeded?: (usage: number) => void
  }

  constructor(options: {
    checkInterval?: number
    threshold?: number
    onThresholdExceeded?: (usage: number) => void
  } = {}) {
    this.options = {
      checkInterval: options.checkInterval ?? 10000, // 10秒
      threshold: options.threshold ?? 0.9, // 90%
      onThresholdExceeded: options.onThresholdExceeded,
    }

    this.start()
  }

  /**
   * 获取当前内存使用情况
   */
  getUsage(): {
    used: number
    total: number
    percentage: number
    heapUsed: number
    heapTotal: number
    external: number
  } {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const mem = process.memoryUsage()
      return {
        used: mem.heapUsed,
        total: mem.heapTotal,
        percentage: mem.heapUsed / mem.heapTotal,
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
        external: mem.external,
      }
    }

    // 浏览器环境（如果支持）
    if (typeof (performance as any).memory !== 'undefined') {
      const mem = (performance as any).memory
      return {
        used: mem.usedJSHeapSize,
        total: mem.totalJSHeapSize,
        percentage: mem.usedJSHeapSize / mem.totalJSHeapSize,
        heapUsed: mem.usedJSHeapSize,
        heapTotal: mem.totalJSHeapSize,
        external: 0,
      }
    }

    // 不支持
    return {
      used: 0,
      total: 0,
      percentage: 0,
      heapUsed: 0,
      heapTotal: 0,
      external: 0,
    }
  }

  /**
   * 获取内存使用历史
   */
  getHistory(): number[] {
    return [...this.history]
  }

  /**
   * 获取平均内存使用
   */
  getAverageUsage(): number {
    if (this.history.length === 0) return 0
    return this.history.reduce((a, b) => a + b, 0) / this.history.length
  }

  /**
   * 强制垃圾回收（如果可用）
   */
  forceGC(): boolean {
    if (typeof global !== 'undefined' && (global as any).gc) {
      ;(global as any).gc()
      return true
    }
    return false
  }

  /**
   * 启动监控
   */
  start(): void {
    if (this.timer) return

    this.timer = setInterval(() => {
      const usage = this.getUsage()

      // 记录历史
      this.history.push(usage.percentage)
      if (this.history.length > this.maxHistorySize) {
        this.history.shift()
      }

      // 检查阈值
      if (
        usage.percentage > this.options.threshold &&
        this.options.onThresholdExceeded
      ) {
        this.options.onThresholdExceeded(usage.percentage)
      }
    }, this.options.checkInterval)
  }

  /**
   * 停止监控
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = undefined
    }
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    this.stop()
    this.history = []
  }
}

/**
 * 全局缓存管理器
 * 单例模式，管理所有缓存实例
 */
export class CacheManager {
  private static instance: CacheManager
  private caches = new Map<string, LRUCache<any>>()
  private memoryMonitor: MemoryMonitor

  private constructor() {
    this.memoryMonitor = new MemoryMonitor({
      threshold: 0.85,
      onThresholdExceeded: () => {
        this.cleanupAll()
      },
    })
  }

  /**
   * 获取单例实例
   */
  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  /**
   * 创建或获取缓存
   */
  getCache<T = any>(name: string, options?: CacheOptions): LRUCache<T> {
    if (!this.caches.has(name)) {
      this.caches.set(name, new LRUCache<T>(options))
    }
    return this.caches.get(name) as LRUCache<T>
  }

  /**
   * 删除缓存
   */
  removeCache(name: string): boolean {
    const cache = this.caches.get(name)
    if (cache) {
      cache.destroy()
      this.caches.delete(name)
      return true
    }
    return false
  }

  /**
   * 清理所有缓存
   */
  cleanupAll(): void {
    for (const cache of this.caches.values()) {
      cache.cleanup()
    }
  }

  /**
   * 清空所有缓存
   */
  clearAll(): void {
    for (const cache of this.caches.values()) {
      cache.clear()
    }
  }

  /**
   * 获取所有缓存统计
   */
  getAllStats(): Record<string, CacheStats> {
    const stats: Record<string, CacheStats> = {}
    for (const [name, cache] of this.caches.entries()) {
      stats[name] = cache.getStats()
    }
    return stats
  }

  /**
   * 获取内存使用情况
   */
  getMemoryUsage() {
    return this.memoryMonitor.getUsage()
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    for (const cache of this.caches.values()) {
      cache.destroy()
    }
    this.caches.clear()
    this.memoryMonitor.destroy()
  }
}

/**
 * 缓存装饰器工厂
 * 用于方法级别的缓存
 * 
 * @example
 * ```typescript
 * class UserService {
 *   @cacheResult({ ttl: 60000, keyGenerator: (id) => `user:${id}` })
 *   async getUser(id: string) {
 *     return await fetchUser(id)
 *   }
 * }
 * ```
 */
export function cacheResult(options: {
  cacheName?: string
  ttl?: number
  keyGenerator?: (...args: any[]) => string
}) {
  const cacheName = options.cacheName ?? 'default'
  const cache = CacheManager.getInstance().getCache(cacheName, {
    defaultTTL: options.ttl,
  })

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const key = options.keyGenerator
        ? options.keyGenerator(...args)
        : `${propertyKey}:${JSON.stringify(args)}`

      // 尝试从缓存获取
      const cached = cache.get(key)
      if (cached !== undefined) {
        return cached
      }

      // 执行原方法
      const result = await originalMethod.apply(this, args)

      // 缓存结果
      cache.set(key, result, options.ttl)

      return result
    }

    return descriptor
  }
}

/**
 * 导出便捷函数
 */
export const cacheManager = CacheManager.getInstance()

/**
 * 创建缓存
 */
export function createCache<T = any>(
  name: string,
  options?: CacheOptions
): LRUCache<T> {
  return cacheManager.getCache<T>(name, options)
}

/**
 * 创建对象池
 */
export function createObjectPool<T>(
  options: ObjectPoolOptions<T>
): ObjectPool<T> {
  return new ObjectPool<T>(options)
}
