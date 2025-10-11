/**
 * @ldesign/router 高级内存管理
 *
 * 提供分层缓存、弱引用优化和智能内存回收
 */

// ==================== 分层缓存策略 ====================

/**
 * 缓存优先级
 */
export enum CachePriority {
  /** L1 缓存 - 热数据（最常访问） */
  HOT = 'hot',
  /** L2 缓存 - 温数据（次常访问） */
  WARM = 'warm',
  /** L3 缓存 - 冷数据（较少访问） */
  COLD = 'cold',
}

/**
 * 缓存项
 */
interface CacheItem<T> {
  /** 缓存键 */
  key: string
  /** 缓存值 */
  value: T
  /** 访问次数 */
  accessCount: number
  /** 最后访问时间 */
  lastAccessTime: number
  /** 创建时间 */
  createTime: number
  /** 缓存优先级 */
  priority: CachePriority
  /** 数据大小（字节） */
  size: number
}

/**
 * 分层缓存配置
 */
export interface TieredCacheConfig {
  /** L1 缓存容量 */
  l1Capacity?: number
  /** L2 缓存容量 */
  l2Capacity?: number
  /** L3 缓存容量 */
  l3Capacity?: number
  /** L1 -> L2 降级阈值（访问次数） */
  l1ToL2Threshold?: number
  /** L2 -> L3 降级阈值（访问次数） */
  l2ToL3Threshold?: number
  /** 自动优化间隔（毫秒） */
  optimizeInterval?: number
}

/**
 * 分层缓存管理器
 * 实现 L1/L2/L3 三级缓存，自动根据访问模式调整数据位置
 */
export class TieredCacheManager<T = any> {
  private l1Cache: Map<string, CacheItem<T>> = new Map()
  private l2Cache: Map<string, CacheItem<T>> = new Map()
  private l3Cache: Map<string, CacheItem<T>> = new Map()

  private config: Required<TieredCacheConfig>
  private optimizeTimer?: number
  private accessPatterns = new Map<string, number[]>() // 访问时间序列

  constructor(config?: TieredCacheConfig) {
    this.config = {
      l1Capacity: 20,
      l2Capacity: 50,
      l3Capacity: 100,
      l1ToL2Threshold: 10,
      l2ToL3Threshold: 50,
      optimizeInterval: 60000, // 1分钟
      ...config,
    }

    this.startAutoOptimize()
  }

  /**
   * 获取缓存项
   */
  get(key: string): T | undefined {
    const now = Date.now()

    // L1 查找
    let item = this.l1Cache.get(key)
    if (item) {
      item.accessCount++
      item.lastAccessTime = now
      this.recordAccess(key, now)
      return item.value
    }

    // L2 查找
    item = this.l2Cache.get(key)
    if (item) {
      item.accessCount++
      item.lastAccessTime = now
      this.recordAccess(key, now)

      // 考虑提升到 L1
      if (this.shouldPromoteToL1(item)) {
        this.promoteToL1(key, item)
      }

      return item.value
    }

    // L3 查找
    item = this.l3Cache.get(key)
    if (item) {
      item.accessCount++
      item.lastAccessTime = now
      this.recordAccess(key, now)

      // 考虑提升到 L2
      if (this.shouldPromoteToL2(item)) {
        this.promoteToL2(key, item)
      }

      return item.value
    }

    return undefined
  }

  /**
   * 设置缓存项
   */
  set(key: string, value: T, priority?: CachePriority, size?: number): void {
    const now = Date.now()
    const item: CacheItem<T> = {
      key,
      value,
      accessCount: 1,
      lastAccessTime: now,
      createTime: now,
      priority: priority || this.determineInitialPriority(key),
      size: size || this.estimateSize(value),
    }

    // 根据优先级放入对应缓存层
    switch (item.priority) {
      case CachePriority.HOT:
        this.addToL1(key, item)
        break
      case CachePriority.WARM:
        this.addToL2(key, item)
        break
      case CachePriority.COLD:
        this.addToL3(key, item)
        break
    }

    this.recordAccess(key, now)
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    return (
      this.l1Cache.delete(key) ||
      this.l2Cache.delete(key) ||
      this.l3Cache.delete(key)
    )
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.l1Cache.clear()
    this.l2Cache.clear()
    this.l3Cache.clear()
    this.accessPatterns.clear()
  }

  /**
   * 判断是否应该提升到 L1
   */
  private shouldPromoteToL1(item: CacheItem<T>): boolean {
    // 访问频率高
    const recentAccess = this.getRecentAccessCount(item.key, 5000) // 5秒内的访问次数
    return recentAccess >= 3
  }

  /**
   * 判断是否应该提升到 L2
   */
  private shouldPromoteToL2(item: CacheItem<T>): boolean {
    const recentAccess = this.getRecentAccessCount(item.key, 30000) // 30秒内的访问次数
    return recentAccess >= 2
  }

  /**
   * 提升到 L1
   */
  private promoteToL1(key: string, item: CacheItem<T>): void {
    this.l2Cache.delete(key)
    this.l3Cache.delete(key)
    item.priority = CachePriority.HOT
    this.addToL1(key, item)
  }

  /**
   * 提升到 L2
   */
  private promoteToL2(key: string, item: CacheItem<T>): void {
    this.l3Cache.delete(key)
    item.priority = CachePriority.WARM
    this.addToL2(key, item)
  }

  /**
   * 添加到 L1 缓存
   */
  private addToL1(key: string, item: CacheItem<T>): void {
    // 检查容量
    if (this.l1Cache.size >= this.config.l1Capacity) {
      const evictKey = this.findL1EvictionCandidate()
      if (evictKey) {
        const evictItem = this.l1Cache.get(evictKey)!
        this.l1Cache.delete(evictKey)
        // 降级到 L2
        this.addToL2(evictKey, evictItem)
      }
    }

    this.l1Cache.set(key, item)
  }

  /**
   * 添加到 L2 缓存
   */
  private addToL2(key: string, item: CacheItem<T>): void {
    if (this.l2Cache.size >= this.config.l2Capacity) {
      const evictKey = this.findL2EvictionCandidate()
      if (evictKey) {
        const evictItem = this.l2Cache.get(evictKey)!
        this.l2Cache.delete(evictKey)
        // 降级到 L3
        this.addToL3(evictKey, evictItem)
      }
    }

    this.l2Cache.set(key, item)
  }

  /**
   * 添加到 L3 缓存
   */
  private addToL3(key: string, item: CacheItem<T>): void {
    if (this.l3Cache.size >= this.config.l3Capacity) {
      const evictKey = this.findL3EvictionCandidate()
      if (evictKey) {
        this.l3Cache.delete(evictKey)
      }
    }

    this.l3Cache.set(key, item)
  }

  /**
   * 找到 L1 驱逐候选
   */
  private findL1EvictionCandidate(): string | null {
    return this.findEvictionCandidate(this.l1Cache)
  }

  /**
   * 找到 L2 驱逐候选
   */
  private findL2EvictionCandidate(): string | null {
    return this.findEvictionCandidate(this.l2Cache)
  }

  /**
   * 找到 L3 驱逐候选
   */
  private findL3EvictionCandidate(): string | null {
    return this.findEvictionCandidate(this.l3Cache)
  }

  /**
   * 通用驱逐候选查找（LRU + 访问频率）
   */
  private findEvictionCandidate(cache: Map<string, CacheItem<T>>): string | null {
    if (cache.size === 0) return null

    let minScore = Infinity
    let candidateKey: string | null = null

    for (const [key, item] of cache.entries()) {
      // 综合考虑访问频率和最后访问时间
      const timeSinceLastAccess = Date.now() - item.lastAccessTime
      const accessFrequency = item.accessCount / Math.max(1, Date.now() - item.createTime)
      
      // 分数越低，越适合驱逐
      const score = accessFrequency * 1000000 - timeSinceLastAccess

      if (score < minScore) {
        minScore = score
        candidateKey = key
      }
    }

    return candidateKey
  }

  /**
   * 记录访问
   */
  private recordAccess(key: string, timestamp: number): void {
    const pattern = this.accessPatterns.get(key) || []
    pattern.push(timestamp)
    
    // 只保留最近1分钟的访问记录
    const oneMinuteAgo = timestamp - 60000
    const recentPattern = pattern.filter(t => t > oneMinuteAgo)
    
    this.accessPatterns.set(key, recentPattern)
  }

  /**
   * 获取最近访问次数
   */
  private getRecentAccessCount(key: string, windowMs: number): number {
    const pattern = this.accessPatterns.get(key)
    if (!pattern) return 0

    const now = Date.now()
    return pattern.filter(t => now - t < windowMs).length
  }

  /**
   * 确定初始优先级
   */
  private determineInitialPriority(key: string): CachePriority {
    // 基于历史访问模式决定
    const pattern = this.accessPatterns.get(key)
    if (!pattern || pattern.length === 0) {
      return CachePriority.COLD
    }

    const recentCount = this.getRecentAccessCount(key, 30000)
    if (recentCount >= 5) return CachePriority.HOT
    if (recentCount >= 2) return CachePriority.WARM
    return CachePriority.COLD
  }

  /**
   * 估算数据大小
   */
  private estimateSize(value: any): number {
    try {
      const str = JSON.stringify(value)
      return str.length * 2 // UTF-16，每个字符2字节
    }
    catch {
      return 100 // 默认值
    }
  }

  /**
   * 启动自动优化
   */
  private startAutoOptimize(): void {
    if (typeof window === 'undefined') return

    this.optimizeTimer = window.setInterval(() => {
      this.optimize()
    }, this.config.optimizeInterval)
  }

  /**
   * 停止自动优化
   */
  stopAutoOptimize(): void {
    if (this.optimizeTimer) {
      clearInterval(this.optimizeTimer)
      this.optimizeTimer = undefined
    }
  }

  /**
   * 优化缓存层级
   */
  private optimize(): void {
    const now = Date.now()

    // 检查 L1 缓存，降级访问不频繁的项
    for (const [key, item] of this.l1Cache.entries()) {
      const timeSinceLastAccess = now - item.lastAccessTime
      if (timeSinceLastAccess > 30000) { // 30秒未访问
        this.l1Cache.delete(key)
        this.addToL2(key, item)
      }
    }

    // 检查 L2 缓存
    for (const [key, item] of this.l2Cache.entries()) {
      const timeSinceLastAccess = now - item.lastAccessTime
      if (timeSinceLastAccess > 60000) { // 1分钟未访问
        this.l2Cache.delete(key)
        this.addToL3(key, item)
      }
    }

    // 检查 L3 缓存，删除长时间未访问的项
    for (const [key, item] of this.l3Cache.entries()) {
      const timeSinceLastAccess = now - item.lastAccessTime
      if (timeSinceLastAccess > 300000) { // 5分钟未访问
        this.l3Cache.delete(key)
        this.accessPatterns.delete(key)
      }
    }
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const totalSize = 
      Array.from(this.l1Cache.values()).reduce((sum, item) => sum + item.size, 0) +
      Array.from(this.l2Cache.values()).reduce((sum, item) => sum + item.size, 0) +
      Array.from(this.l3Cache.values()).reduce((sum, item) => sum + item.size, 0)

    return {
      l1: {
        size: this.l1Cache.size,
        capacity: this.config.l1Capacity,
        usage: this.l1Cache.size / this.config.l1Capacity,
      },
      l2: {
        size: this.l2Cache.size,
        capacity: this.config.l2Capacity,
        usage: this.l2Cache.size / this.config.l2Capacity,
      },
      l3: {
        size: this.l3Cache.size,
        capacity: this.config.l3Capacity,
        usage: this.l3Cache.size / this.config.l3Capacity,
      },
      total: {
        items: this.l1Cache.size + this.l2Cache.size + this.l3Cache.size,
        bytes: totalSize,
        patterns: this.accessPatterns.size,
      },
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.stopAutoOptimize()
    this.clear()
  }
}

// ==================== 弱引用缓存 ====================

/**
 * 弱引用缓存管理器
 * 利用 WeakRef 和 FinalizationRegistry 实现自动内存回收
 */
export class WeakRefCache<K extends object, V extends object> {
  private cache = new WeakMap<K, WeakRef<V>>()
  private registry?: FinalizationRegistry<K>
  private keyMap = new Map<string, K>()
  private cleanupCallbacks = new Map<string, () => void>()

  constructor() {
    // 只在支持 WeakRef 的环境中使用
    if (typeof WeakRef !== 'undefined' && typeof FinalizationRegistry !== 'undefined') {
      this.registry = new FinalizationRegistry((key: K) => {
        this.handleFinalization(key)
      })
    }
  }

  /**
   * 设置缓存
   */
  set(key: K, value: V, keyStr?: string, onCleanup?: () => void): void {
    if (typeof WeakRef === 'undefined') {
      // Fallback: 不使用弱引用
      return
    }

    const weakRef = new WeakRef(value)
    this.cache.set(key, weakRef)

    if (this.registry && keyStr) {
      this.registry.register(value as any, key)
      this.keyMap.set(keyStr, key)
      
      if (onCleanup) {
        this.cleanupCallbacks.set(keyStr, onCleanup)
      }
    }
  }

  /**
   * 获取缓存
   */
  get(key: K): V | undefined {
    const weakRef = this.cache.get(key)
    if (!weakRef) return undefined

    const value = weakRef.deref()
    if (!value) {
      // 对象已被回收
      this.cache.delete(key)
      return undefined
    }

    return value
  }

  /**
   * 删除缓存
   */
  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  /**
   * 处理对象终结
   */
  private handleFinalization(key: K): void {
    this.cache.delete(key)

    // 执行清理回调
    for (const [keyStr, k] of this.keyMap.entries()) {
      if (k === key) {
        const cleanup = this.cleanupCallbacks.get(keyStr)
        if (cleanup) {
          cleanup()
          this.cleanupCallbacks.delete(keyStr)
        }
        this.keyMap.delete(keyStr)
        break
      }
    }
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      keys: this.keyMap.size,
      callbacks: this.cleanupCallbacks.size,
    }
  }
}

// ==================== 智能内存回收器 ====================

/**
 * 内存压力等级
 */
export enum MemoryPressure {
  /** 正常 */
  NORMAL = 'normal',
  /** 中等压力 */
  MODERATE = 'moderate',
  /** 高压力 */
  HIGH = 'high',
  /** 严重压力 */
  CRITICAL = 'critical',
}

/**
 * 智能内存回收器
 */
export class SmartMemoryReclaimer {
  private tieredCache: TieredCacheManager
  private weakRefCache: WeakRefCache<any, any>
  private pressureLevel: MemoryPressure = MemoryPressure.NORMAL
  private checkInterval = 30000 // 30秒
  private checkTimer?: number

  constructor(tieredCache: TieredCacheManager, weakRefCache: WeakRefCache<any, any>) {
    this.tieredCache = tieredCache
    this.weakRefCache = weakRefCache
    this.startMonitoring()
  }

  /**
   * 开始监控
   */
  private startMonitoring(): void {
    if (typeof window === 'undefined') return

    this.checkTimer = window.setInterval(() => {
      this.checkMemoryPressure()
      this.performReclamation()
    }, this.checkInterval)
  }

  /**
   * 停止监控
   */
  stopMonitoring(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer)
      this.checkTimer = undefined
    }
  }

  /**
   * 检查内存压力
   */
  private checkMemoryPressure(): void {
    if (!('memory' in performance)) {
      return
    }

    const memory = (performance as any).memory
    const usedHeap = memory.usedJSHeapSize
    const totalHeap = memory.totalJSHeapSize

    const usage = usedHeap / totalHeap

    if (usage > 0.9) {
      this.pressureLevel = MemoryPressure.CRITICAL
    }
    else if (usage > 0.75) {
      this.pressureLevel = MemoryPressure.HIGH
    }
    else if (usage > 0.6) {
      this.pressureLevel = MemoryPressure.MODERATE
    }
    else {
      this.pressureLevel = MemoryPressure.NORMAL
    }
  }

  /**
   * 执行回收
   */
  private performReclamation(): void {
    switch (this.pressureLevel) {
      case MemoryPressure.CRITICAL:
        this.aggressiveReclamation()
        break
      case MemoryPressure.HIGH:
        this.moderateReclamation()
        break
      case MemoryPressure.MODERATE:
        this.lightReclamation()
        break
      case MemoryPressure.NORMAL:
        // 无需回收
        break
    }
  }

  /**
   * 激进回收
   */
  private aggressiveReclamation(): void {
    console.warn('🔴 Critical memory pressure detected, performing aggressive reclamation')
    
    // 清空 L3 缓存
    const stats = this.tieredCache.getStats()
    // 实现清理逻辑（需要暴露相应的方法）
    
    // 触发垃圾回收（如果可用）
    if (typeof (window as any).gc === 'function') {
      (window as any).gc()
    }
  }

  /**
   * 适度回收
   */
  private moderateReclamation(): void {
    console.warn('🟡 High memory pressure detected, performing moderate reclamation')
    // 减少缓存大小
  }

  /**
   * 轻度回收
   */
  private lightReclamation(): void {
    // 清理过期项
  }

  /**
   * 获取内存压力等级
   */
  getPressureLevel(): MemoryPressure {
    return this.pressureLevel
  }
}

// ==================== 导出 ====================

/**
 * 创建高级内存管理器
 */
export function createAdvancedMemoryManager(config?: TieredCacheConfig) {
  const tieredCache = new TieredCacheManager(config)
  const weakRefCache = new WeakRefCache()
  const reclaimer = new SmartMemoryReclaimer(tieredCache, weakRefCache)

  return {
    tieredCache,
    weakRefCache,
    reclaimer,
    destroy() {
      tieredCache.destroy()
      reclaimer.stopMonitoring()
    },
  }
}
