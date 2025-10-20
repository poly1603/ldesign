/**
 * @ldesign/router 统一内存管理器
 *
 * 整合基础内存管理和分层缓存功能，提供统一的高性能内存管理方案
 */

import { reactive } from 'vue'

// ==================== 类型定义 ====================

/**
 * 缓存优先级
 */
export enum CachePriority {
  /** 热数据 - L1缓存 */
  HOT = 'hot',
  /** 温数据 - L2缓存 */
  WARM = 'warm',
  /** 冷数据 - L3缓存 */
  COLD = 'cold',
}

/**
 * 缓存项
 */
export interface CacheItem<T = any> {
  key: string
  value: T
  size: number
  priority: CachePriority
  accessCount: number
  lastAccessTime: number
  createTime: number
  ttl?: number
  tags?: string[]
}

/**
 * 内存统计信息
 */
export interface MemoryStats {
  totalMemory: number
  cacheMemory: number
  l1Memory: number
  l2Memory: number
  l3Memory: number
  routeMemory: number
  listenerCount: number
  weakRefCount: number
  cacheHitRate: number
  evictionCount: number
}

/**
 * 统一内存管理配置
 */
export interface UnifiedMemoryConfig {
  // 分层缓存配置
  tieredCache?: {
    enabled?: boolean
    l1Capacity?: number
    l2Capacity?: number
    l3Capacity?: number
    promotionThreshold?: number
    demotionThreshold?: number
  }
  // 内存监控配置
  monitoring?: {
    enabled?: boolean
    interval?: number
    warningThreshold?: number
    criticalThreshold?: number
  }
  // 弱引用配置
  weakRef?: {
    enabled?: boolean
    maxRefs?: number
  }
  // 清理策略
  cleanup?: {
    strategy?: 'aggressive' | 'moderate' | 'conservative'
    autoCleanup?: boolean
    cleanupInterval?: number
  }
}

// ==================== 弱引用管理 ====================

/**
 * 增强的弱引用管理器
 */
class EnhancedWeakRefManager {
  private refs = new Map<string, WeakRef<any>>()
  private registry?: FinalizationRegistry<string>
  private metadata = new Map<string, { size: number, type: string }>()

  constructor() {
    if (typeof FinalizationRegistry !== 'undefined') {
      this.registry = new FinalizationRegistry((key: string) => {
        this.handleFinalization(key)
      })
    }
  }

  /**
   * 创建弱引用（优化版）
   */
  createRef<T extends object>(key: string, target: T, metadata?: any): void {
    // 优化：批量清理旧引用
    if (this.refs.size > 100) {
      this.cleanup()
    }
    
    // 清理旧引用
    this.removeRef(key)

    if (typeof WeakRef !== 'undefined') {
      const ref = new WeakRef(target)
      this.refs.set(key, ref)

      if (this.registry) {
        this.registry.register(target, key)
      }

      if (metadata) {
        this.metadata.set(key, metadata)
      }
    }
  }
  
  /**
   * 清理无效的弱引用
   */
  private cleanup(): void {
    const keysToDelete: string[] = []
    
    for (const [key, ref] of this.refs.entries()) {
      if (!ref.deref()) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => {
      this.refs.delete(key)
      this.metadata.delete(key)
    })
  }

  /**
   * 获取弱引用
   */
  getRef<T extends object>(key: string): T | undefined {
    const ref = this.refs.get(key)
    if (!ref)
      return undefined

    const target = ref.deref()
    if (!target) {
      this.removeRef(key)
      return undefined
    }

    return target as T
  }

  /**
   * 移除弱引用
   */
  removeRef(key: string): boolean {
    const deleted = this.refs.delete(key)
    this.metadata.delete(key)
    return deleted
  }

  /**
   * 处理对象终结
   */
  private handleFinalization(key: string): void {
    this.refs.delete(key)
    this.metadata.delete(key)
  }

  /**
   * 获取统计信息
   */
  getStats(): { count: number, totalSize: number } {
    let totalSize = 0
    this.metadata.forEach((meta) => {
      totalSize += meta.size || 0
    })

    return {
      count: this.refs.size,
      totalSize,
    }
  }

  /**
   * 清理所有引用
   */
  clear(): void {
    this.refs.clear()
    this.metadata.clear()
  }
}

// ==================== 分层缓存管理 ====================

/**
 * 分层缓存管理器
 */
class TieredCacheManager<T = any> {
  private l1Cache = new Map<string, CacheItem<T>>()
  private l2Cache = new Map<string, CacheItem<T>>()
  private l3Cache = new Map<string, CacheItem<T>>()

  private accessPatterns = new Map<string, number[]>()
  private hitCount = 0
  private missCount = 0
  private evictionCount = 0

  private config: {
    enabled: boolean
    l1Capacity: number
    l2Capacity: number
    l3Capacity: number
    promotionThreshold: number
    demotionThreshold: number
  }

  constructor(config: UnifiedMemoryConfig['tieredCache'] = {}) {
    this.config = {
      enabled: true,
      l1Capacity: 20,
      l2Capacity: 50,
      l3Capacity: 100,
      promotionThreshold: 3,
      demotionThreshold: 60000, // 1分钟
      ...config,
    }
  }

  /**
   * 获取缓存项
   */
  get(key: string): T | undefined {
    const now = Date.now()

    // 尝试从各层获取
    let item = this.l1Cache.get(key)
    let fromLevel = 1

    if (!item) {
      item = this.l2Cache.get(key)
      fromLevel = 2
    }

    if (!item) {
      item = this.l3Cache.get(key)
      fromLevel = 3
    }

    if (!item) {
      this.missCount++
      return undefined
    }

    // 更新访问信息
    this.hitCount++
    item.accessCount++
    item.lastAccessTime = now
    this.recordAccess(key, now)

    // 检查是否需要提升
    if (fromLevel > 1) {
      this.checkPromotion(key, item, fromLevel)
    }

    return item.value
  }

  /**
   * 设置缓存项（优化版）
   */
  set(key: string, value: T, options?: {
    priority?: CachePriority
    ttl?: number
    tags?: string[]
    size?: number
  }): void {
    const now = Date.now()
    
    // 优化：自动清理过期项
    if (this.l1Cache.size + this.l2Cache.size + this.l3Cache.size > 100) {
      this.cleanupExpired(now)
    }

    const item: CacheItem<T> = {
      key,
      value,
      size: options?.size || this.estimateSize(value),
      priority: options?.priority || this.determineInitialPriority(key),
      accessCount: 1,
      lastAccessTime: now,
      createTime: now,
      ttl: options?.ttl,
      tags: options?.tags,
    }

    // 根据优先级添加到对应层
    this.addToAppropriateLayer(key, item)
    this.recordAccess(key, now)
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    const deleted = this.l1Cache.delete(key)
      || this.l2Cache.delete(key)
      || this.l3Cache.delete(key)

    if (deleted) {
      this.accessPatterns.delete(key)
    }

    return deleted
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.l1Cache.clear()
    this.l2Cache.clear()
    this.l3Cache.clear()
    this.accessPatterns.clear()
    this.hitCount = 0
    this.missCount = 0
    this.evictionCount = 0
  }

  /**
   * 获取缓存统计
   */
  getStats(): {
    hitRate: number
    l1Size: number
    l2Size: number
    l3Size: number
    totalSize: number
    evictionCount: number
  } {
    const totalAccess = this.hitCount + this.missCount

    return {
      hitRate: totalAccess > 0 ? this.hitCount / totalAccess : 0,
      l1Size: this.l1Cache.size,
      l2Size: this.l2Cache.size,
      l3Size: this.l3Cache.size,
      totalSize: this.l1Cache.size + this.l2Cache.size + this.l3Cache.size,
      evictionCount: this.evictionCount,
    }
  }

  /**
   * 获取内存使用量
   */
  getMemoryUsage(): { l1: number, l2: number, l3: number, total: number } {
    let l1Memory = 0
    let l2Memory = 0
    let l3Memory = 0

    this.l1Cache.forEach(item => l1Memory += item.size)
    this.l2Cache.forEach(item => l2Memory += item.size)
    this.l3Cache.forEach(item => l3Memory += item.size)

    return {
      l1: l1Memory,
      l2: l2Memory,
      l3: l3Memory,
      total: l1Memory + l2Memory + l3Memory,
    }
  }

  /**
   * 优化缓存层级
   */
  optimize(): void {
    const now = Date.now()

    // 清理过期项
    this.cleanupExpired(now)

    // 调整层级
    this.adjustLayers(now)
  }

  // ==================== 私有方法 ====================

  private addToAppropriateLayer(key: string, item: CacheItem<T>): void {
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
  }

  private addToL1(key: string, item: CacheItem<T>): void {
    if (this.l1Cache.size >= this.config.l1Capacity) {
      this.evictFromL1()
    }
    this.l1Cache.set(key, item)
  }

  private addToL2(key: string, item: CacheItem<T>): void {
    if (this.l2Cache.size >= this.config.l2Capacity) {
      this.evictFromL2()
    }
    this.l2Cache.set(key, item)
  }

  private addToL3(key: string, item: CacheItem<T>): void {
    if (this.l3Cache.size >= this.config.l3Capacity) {
      this.evictFromL3()
    }
    this.l3Cache.set(key, item)
  }

  private evictFromL1(): void {
    const victim = this.findEvictionCandidate(this.l1Cache)
    if (victim) {
      const item = this.l1Cache.get(victim)!
      this.l1Cache.delete(victim)
      item.priority = CachePriority.WARM
      this.addToL2(victim, item)
      this.evictionCount++
    }
  }

  private evictFromL2(): void {
    const victim = this.findEvictionCandidate(this.l2Cache)
    if (victim) {
      const item = this.l2Cache.get(victim)!
      this.l2Cache.delete(victim)
      item.priority = CachePriority.COLD
      this.addToL3(victim, item)
      this.evictionCount++
    }
  }

  private evictFromL3(): void {
    const victim = this.findEvictionCandidate(this.l3Cache)
    if (victim) {
      this.l3Cache.delete(victim)
      this.accessPatterns.delete(victim)
      this.evictionCount++
    }
  }

  private findEvictionCandidate(cache: Map<string, CacheItem<T>>): string | null {
    if (cache.size === 0)
      return null

    let minScore = Infinity
    let candidate: string | null = null

    for (const [key, item] of cache.entries()) {
      const timeSinceLastAccess = Date.now() - item.lastAccessTime
      const frequency = item.accessCount / Math.max(1, Date.now() - item.createTime)

      // LFU + LRU 混合策略
      const score = frequency * 1000000 - timeSinceLastAccess

      if (score < minScore) {
        minScore = score
        candidate = key
      }
    }

    return candidate
  }

  private checkPromotion(key: string, item: CacheItem<T>, currentLevel: number): void {
    const recentAccess = this.getRecentAccessCount(key, 10000) // 10秒内的访问

    if (recentAccess >= this.config.promotionThreshold) {
      if (currentLevel === 3) {
        this.l3Cache.delete(key)
        item.priority = CachePriority.WARM
        this.addToL2(key, item)
      }
      else if (currentLevel === 2) {
        this.l2Cache.delete(key)
        item.priority = CachePriority.HOT
        this.addToL1(key, item)
      }
    }
  }

  private recordAccess(key: string, timestamp: number): void {
    const pattern = this.accessPatterns.get(key) || []
    pattern.push(timestamp)

    // 只保留最近2分钟的记录
    const twoMinutesAgo = timestamp - 120000
    const recent = pattern.filter(t => t > twoMinutesAgo)

    this.accessPatterns.set(key, recent)
  }

  private getRecentAccessCount(key: string, windowMs: number): number {
    const pattern = this.accessPatterns.get(key)
    if (!pattern)
      return 0

    const now = Date.now()
    return pattern.filter(t => now - t < windowMs).length
  }

  private determineInitialPriority(key: string): CachePriority {
    const pattern = this.accessPatterns.get(key)
    if (!pattern || pattern.length === 0) {
      return CachePriority.COLD
    }

    const recentCount = this.getRecentAccessCount(key, 30000)
    if (recentCount >= 5)
      return CachePriority.HOT
    if (recentCount >= 2)
      return CachePriority.WARM
    return CachePriority.COLD
  }

  private estimateSize(value: any): number {
    // 优化：更快的大小估算
    if (value === null || value === undefined) return 0
    
    const type = typeof value
    if (type === 'string') return value.length * 2
    if (type === 'number') return 8
    if (type === 'boolean') return 4
    
    if (type === 'object') {
      // 粗略估算，避免序列化开销
      if (Array.isArray(value)) {
        return value.length * 50
      }
      return Object.keys(value).length * 100
    }
    
    return 100
  }

  private cleanupExpired(now: number): void {
    const checkAndClean = (cache: Map<string, CacheItem<T>>) => {
      for (const [key, item] of cache.entries()) {
        if (item.ttl && now - item.createTime > item.ttl) {
          cache.delete(key)
          this.accessPatterns.delete(key)
        }
      }
    }

    checkAndClean(this.l1Cache)
    checkAndClean(this.l2Cache)
    checkAndClean(this.l3Cache)
  }

  private adjustLayers(now: number): void {
    // 检查 L1 中的冷数据，降级到 L2
    for (const [key, item] of this.l1Cache.entries()) {
      if (now - item.lastAccessTime > this.config.demotionThreshold) {
        this.l1Cache.delete(key)
        item.priority = CachePriority.WARM
        this.addToL2(key, item)
      }
    }

    // 检查 L2 中的冷数据，降级到 L3
    for (const [key, item] of this.l2Cache.entries()) {
      if (now - item.lastAccessTime > this.config.demotionThreshold * 2) {
        this.l2Cache.delete(key)
        item.priority = CachePriority.COLD
        this.addToL3(key, item)
      }
    }
  }
  
  /**
   * 获取 L3 缓存的键列表
   */
  getL3Keys(): string[] {
    return Array.from(this.l3Cache.keys())
  }
}

// ==================== 统一内存管理器 ====================

/**
 * 统一内存管理器
 * 整合分层缓存、弱引用管理、内存监控等功能
 */
export class UnifiedMemoryManager {
  private tieredCache: TieredCacheManager
  private weakRefManager: EnhancedWeakRefManager
  private config: Required<UnifiedMemoryConfig>
  private monitorTimer?: number
  private cleanupTimer?: number

  // 响应式状态
  public state = reactive({
    stats: {
      totalMemory: 0,
      cacheMemory: 0,
      l1Memory: 0,
      l2Memory: 0,
      l3Memory: 0,
      routeMemory: 0,
      listenerCount: 0,
      weakRefCount: 0,
      cacheHitRate: 0,
      evictionCount: 0,
    } as MemoryStats,
    isWarning: false,
    isCritical: false,
    lastCleanup: null as Date | null,
  })

  constructor(config?: UnifiedMemoryConfig) {
    this.config = {
      tieredCache: {
        enabled: true,
        l1Capacity: 15,
        l2Capacity: 30,
        l3Capacity: 60,
        promotionThreshold: 2,
        demotionThreshold: 30000, // 30秒
        ...config?.tieredCache,
      },
      monitoring: {
        enabled: true,
        interval: 60000, // 1分钟
        warningThreshold: 10 * 1024 * 1024, // 10MB
        criticalThreshold: 20 * 1024 * 1024, // 20MB
        ...config?.monitoring,
      },
      weakRef: {
        enabled: true,
        maxRefs: 500,
        ...config?.weakRef,
      },
      cleanup: {
        strategy: 'aggressive',
        autoCleanup: true,
        cleanupInterval: 120000, // 2分钟
        ...config?.cleanup,
      },
    }

    this.tieredCache = new TieredCacheManager(this.config.tieredCache)
    this.weakRefManager = new EnhancedWeakRefManager()

    this.initialize()
  }

  // ==================== 公共 API ====================

  /**
   * 获取缓存值
   */
  get<T>(key: string): T | undefined {
    return this.tieredCache.get(key)
  }

  /**
   * 设置缓存值
   */
  set<T>(key: string, value: T, options?: {
    priority?: CachePriority
    ttl?: number
    tags?: string[]
    weak?: boolean
  }): void {
    if (options?.weak && this.config.weakRef.enabled) {
      if (typeof value === 'object' && value !== null) {
        this.weakRefManager.createRef(key, value as any)
        return
      }
    }

    this.tieredCache.set(key, value, options)
    this.updateStats()
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    const deleted = this.tieredCache.delete(key)
    this.weakRefManager.removeRef(key)
    this.updateStats()
    return deleted
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.tieredCache.clear()
    this.weakRefManager.clear()
    this.updateStats()
  }

  /**
   * 创建弱引用
   */
  createWeakRef<T extends object>(key: string, target: T): void {
    if (this.config.weakRef.enabled) {
      this.weakRefManager.createRef(key, target)
      this.updateStats()
    }
  }

  /**
   * 获取弱引用
   */
  getWeakRef<T extends object>(key: string): T | undefined {
    return this.weakRefManager.getRef<T>(key)
  }

  /**
   * 手动触发优化
   */
  optimize(): void {
    this.tieredCache.optimize()
    this.performCleanup()
    this.updateStats()
  }

  /**
   * 获取统计信息
   */
  getStats(): MemoryStats {
    return { ...this.state.stats }
  }

  /**
   * 获取缓存信息
   */
  getCacheInfo(): any {
    const cacheStats = this.tieredCache.getStats()
    const memoryUsage = this.tieredCache.getMemoryUsage()
    const weakRefStats = this.weakRefManager.getStats()

    return {
      cache: cacheStats,
      memory: memoryUsage,
      weakRef: weakRefStats,
    }
  }

  // ==================== 私有方法 ====================

  private initialize(): void {
    if (this.config.monitoring.enabled) {
      this.startMonitoring()
    }

    if (this.config.cleanup.autoCleanup) {
      this.startAutoCleanup()
    }

    this.updateStats()
  }

  private startMonitoring(): void {
    if (typeof window === 'undefined')
      return

    this.monitorTimer = window.setInterval(() => {
      this.updateStats()
      this.checkThresholds()
    }, this.config.monitoring.interval)
  }

  private stopMonitoring(): void {
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer)
      this.monitorTimer = undefined
    }
  }

  private startAutoCleanup(): void {
    if (typeof window === 'undefined')
      return

    this.cleanupTimer = window.setInterval(() => {
      this.performCleanup()
    }, this.config.cleanup.cleanupInterval)
  }

  private stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
  }

  private updateStats(): void {
    const cacheStats = this.tieredCache.getStats()
    const memoryUsage = this.tieredCache.getMemoryUsage()
    const weakRefStats = this.weakRefManager.getStats()

    this.state.stats = {
      totalMemory: this.getJSHeapSize(),
      cacheMemory: memoryUsage.total,
      l1Memory: memoryUsage.l1,
      l2Memory: memoryUsage.l2,
      l3Memory: memoryUsage.l3,
      routeMemory: 0, // 需要从路由器获取
      listenerCount: 0, // 需要从事件系统获取
      weakRefCount: weakRefStats.count,
      cacheHitRate: cacheStats.hitRate,
      evictionCount: cacheStats.evictionCount,
    }
  }

  private getJSHeapSize(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize || 0
    }
    return 0
  }

  private checkThresholds(): void {
    const totalMemory = this.state.stats.totalMemory

    if (totalMemory > this.config.monitoring.criticalThreshold!) {
      this.state.isCritical = true
      this.state.isWarning = true
      this.performCleanup('aggressive')
    }
    else if (totalMemory > this.config.monitoring.warningThreshold!) {
      this.state.isWarning = true
      this.state.isCritical = false
      this.performCleanup('moderate')
    }
    else {
      this.state.isWarning = false
      this.state.isCritical = false
    }
  }

  private performCleanup(level?: 'aggressive' | 'moderate' | 'conservative'): void {
    const strategy = level || this.config.cleanup.strategy
    
    // 优化：根据内存压力动态调整清理策略
    const memoryPressure = this.state.stats.totalMemory / this.config.monitoring.criticalThreshold!
    
    if (memoryPressure > 0.9 || strategy === 'aggressive') {
      // 激进清理：清除大部分缓存
      this.tieredCache.clear()
      this.weakRefManager.clear()
    }
    else if (memoryPressure > 0.7 || strategy === 'moderate') {
      // 中等清理：优化缓存层级，清理L3
      this.tieredCache.optimize()
      // 清理L3缓存的一半
      const l3Keys = this.tieredCache.getL3Keys()
      l3Keys.slice(0, Math.floor(l3Keys.length / 2)).forEach(key => {
        this.tieredCache.delete(key)
      })
    }
    else {
      // 保守清理：仅清理过期项
      this.tieredCache.optimize()
    }

    this.state.lastCleanup = new Date()
    this.updateStats()
    
    // 触发垃圾回收（如果可用）
    if (typeof globalThis !== 'undefined' && typeof (globalThis as any).gc === 'function') {
      (globalThis as any).gc()
    }
  }

  /**
   * 销毁管理器 - 清理所有资源
   */
  destroy(): void {
    // 停止监控定时器
    this.stopMonitoring()
    
    // 停止自动清理定时器
    this.stopAutoCleanup()
    
    // 清空所有缓存
    this.clear()
    
    // 重置状态
    this.state.stats = {
      totalMemory: 0,
      cacheMemory: 0,
      l1Memory: 0,
      l2Memory: 0,
      l3Memory: 0,
      routeMemory: 0,
      listenerCount: 0,
      weakRefCount: 0,
      cacheHitRate: 0,
      evictionCount: 0,
    };
    this.state.isWarning = false;
    this.state.isCritical = false;
    this.state.lastCleanup = null;
  }
}

// ==================== 导出便捷函数 ====================

let defaultManager: UnifiedMemoryManager | null = null

/**
 * 获取默认内存管理器
 */
export function getMemoryManager(config?: UnifiedMemoryConfig): UnifiedMemoryManager {
  if (!defaultManager) {
    defaultManager = new UnifiedMemoryManager(config)
  }
  return defaultManager
}

/**
 * 快速缓存获取
 */
export function cacheGet<T>(key: string): T | undefined {
  return getMemoryManager().get<T>(key)
}

/**
 * 快速缓存设置
 */
export function cacheSet<T>(key: string, value: T, options?: any): void {
  getMemoryManager().set(key, value, options)
}

/**
 * 清理内存
 */
export function cleanupMemory(): void {
  getMemoryManager().optimize()
}

/**
 * 销毁默认内存管理器
 * 应在应用卸载时调用
 */
export function destroyMemoryManager(): void {
  if (defaultManager) {
    defaultManager.destroy()
    defaultManager = null
  }
}
