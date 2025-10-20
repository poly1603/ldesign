/**
 * 内存优化工具集
 * 提供全面的内存管理和优化功能
 */

import type { Logger } from '../types'

// ============================================
// 内存优化配置
// ============================================

export interface MemoryOptimizationConfig {
  // 内存限制
  maxMemory?: number // 最大内存使用量（MB）
  warningThreshold?: number // 警告阈值（0-1）
  criticalThreshold?: number // 临界阈值（0-1）
  
  // 垃圾回收
  gcInterval?: number // GC间隔（ms）
  autoGC?: boolean // 自动垃圾回收
  
  // 对象池
  enableObjectPooling?: boolean // 启用对象池
  poolMaxSize?: number // 对象池最大大小
  
  // 弱引用
  enableWeakRefs?: boolean // 启用弱引用优化
  
  // 回调
  onMemoryWarning?: (usage: MemoryUsage) => void
  onMemoryCritical?: (usage: MemoryUsage) => void
}

export interface MemoryUsage {
  used: number
  total: number
  percentage: number
  heap: {
    used: number
    total: number
    limit: number
  }
}

// ============================================
// 对象池实现
// ============================================

export class ObjectPool<T extends object> {
  private pool: T[] = []
  private inUse = new WeakSet<T>()
  private factory: () => T
  private reset: (obj: T) => void
  private maxSize: number
  private created = 0
  private recycled = 0
  
  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    maxSize = 50 // 减少默认池大小
  ) {
    this.factory = factory
    this.reset = reset
    this.maxSize = maxSize
  }
  
  /**
   * 获取对象
   */
  acquire(): T {
    let obj: T
    if (this.pool.length > 0) {
      obj = this.pool.pop()!
      this.recycled++
    } else {
      obj = this.factory()
      this.created++
    }
    if (typeof obj === 'object' && obj !== null) {
      this.inUse.add(obj)
    }
    return obj
  }
  
  /**
   * 释放对象
   */
  release(obj: T): void {
    // 检查对象是否正在使用中
    if (typeof obj === 'object' && obj !== null) {
      if (!this.inUse.has(obj)) {
        console.warn('Attempting to release object that was not acquired from pool')
        return
      }
      this.inUse.delete(obj)
    }
    
    if (this.pool.length < this.maxSize) {
      this.reset(obj)
      this.pool.push(obj)
    }
  }
  
  /**
   * 清空对象池
   */
  clear(): void {
    // 重置所有池中的对象
    for (const obj of this.pool) {
      if (typeof obj === 'object' && obj !== null) {
        // 清理对象引用，帮助垃圾回收
        for (const key in obj) {
          try {
            delete (obj as any)[key]
          } catch {}
        }
      }
    }
    this.pool.length = 0
    this.created = 0
    this.recycled = 0
  }
  
  /**
   * 获取池大小
   */
  size(): number {
    return this.pool.length
  }
  
  /**
   * 预填充对象池
   */
  prefill(count: number): void {
    const fillCount = Math.min(count, Math.floor(this.maxSize * 0.5)) // 只预填充50%
    for (let i = 0; i < fillCount && this.pool.length < fillCount; i++) {
      const obj = this.factory()
      this.created++
      this.pool.push(obj)
    }
  }
  
  /**
   * 获取统计信息
   */
  getStats(): { size: number; created: number; recycled: number; efficiency: number } {
    return {
      size: this.pool.length,
      created: this.created,
      recycled: this.recycled,
      efficiency: this.created > 0 ? (this.recycled / (this.created + this.recycled)) * 100 : 0
    }
  }
}

// ============================================
// 弱引用缓存
// ============================================

export class WeakRefCache<K extends object, V extends object> {
  private cache = new WeakMap<K, WeakRef<V>>()
  private registry?: any
  
  constructor(onCleanup?: (key: K) => void) {
    if (typeof (globalThis as any).FinalizationRegistry !== 'undefined' && onCleanup) {
      this.registry = new (globalThis as any).FinalizationRegistry(onCleanup)
    }
  }
  
  /**
   * 设置缓存值
   */
  set(key: K, value: V): void {
    const ref = new WeakRef(value)
    this.cache.set(key, ref)
    
    if (this.registry && typeof value === 'object' && value !== null) {
      this.registry.register(value as object, key)
    }
  }
  
  /**
   * 获取缓存值
   */
  get(key: K): V | undefined {
    const ref = this.cache.get(key)
    if (ref) {
      const value = ref.deref()
      if (value === undefined) {
        // 弱引用已被回收
        this.cache.delete(key)
      }
      return value
    }
    return undefined
  }
  
  /**
   * 检查缓存是否存在
   */
  has(key: K): boolean {
    const ref = this.cache.get(key)
    if (ref) {
      const value = ref.deref()
      if (value === undefined) {
        this.cache.delete(key)
        return false
      }
      return true
    }
    return false
  }
  
  /**
   * 删除缓存
   */
  delete(key: K): boolean {
    return this.cache.delete(key)
  }
}

// ============================================
// 内存优化器
// ============================================

export class MemoryOptimizer {
  private config: Required<MemoryOptimizationConfig>
  private gcTimer?: number
  private objectPools = new Map<string, ObjectPool<any>>()
  private weakCaches = new Map<string, WeakRefCache<any, any>>()
  private logger?: Logger
  private isMonitoring = false
  private lastGCTime = 0
  private memoryCheckTimer?: number
  
  constructor(config: MemoryOptimizationConfig = {}, logger?: Logger) {
    this.config = {
      maxMemory: config.maxMemory ?? 256, // 减少到256MB
      warningThreshold: config.warningThreshold ?? 0.6, // 更早预警
      criticalThreshold: config.criticalThreshold ?? 0.8, // 更早触发清理
      gcInterval: config.gcInterval ?? 30000, // 30秒
      autoGC: config.autoGC ?? true,
      enableObjectPooling: config.enableObjectPooling ?? true,
      poolMaxSize: config.poolMaxSize ?? 50, // 减少池大小
      enableWeakRefs: config.enableWeakRefs ?? true,
      onMemoryWarning: config.onMemoryWarning ?? (() => {}),
      onMemoryCritical: config.onMemoryCritical ?? (() => {})
    }
    this.logger = logger
    
    if (this.config.autoGC) {
      this.startAutoGC()
    }
    
    // 启动内存监控
    this.startMemoryMonitoring()
  }
  
  /**
   * 获取内存使用情况
   */
  getMemoryUsage(): MemoryUsage {
    // 浏览器环境
    if (typeof window !== 'undefined' && (window.performance as any)?.memory) {
      const memory = (window.performance as any).memory
      return {
        used: memory.usedJSHeapSize / 1024 / 1024,
        total: memory.jsHeapSizeLimit / 1024 / 1024,
        percentage: memory.usedJSHeapSize / memory.jsHeapSizeLimit,
        heap: {
          used: memory.usedJSHeapSize / 1024 / 1024,
          total: memory.totalJSHeapSize / 1024 / 1024,
          limit: memory.jsHeapSizeLimit / 1024 / 1024
        }
      }
    }
    
    // 无法获取内存信息
    return {
      used: 0,
      total: this.config.maxMemory,
      percentage: 0,
      heap: { used: 0, total: 0, limit: this.config.maxMemory }
    }
  }
  
  /**
   * 检查内存状态
   */
  checkMemory(): void {
    const usage = this.getMemoryUsage()
    
    if (usage.percentage > this.config.criticalThreshold) {
      this.logger?.error('Memory usage critical', usage)
      this.config.onMemoryCritical(usage)
      this.forceGC()
    } else if (usage.percentage > this.config.warningThreshold) {
      this.logger?.warn('Memory usage warning', usage)
      this.config.onMemoryWarning(usage)
    }
  }
  
  /**
   * 创建对象池
   */
  createObjectPool<T extends object>(
    name: string,
    factory: () => T,
    reset: (obj: T) => void,
    maxSize?: number
  ): ObjectPool<T> {
    if (!this.config.enableObjectPooling) {
      throw new Error('Object pooling is disabled')
    }
    
    const pool = new ObjectPool(
      factory,
      reset,
      maxSize ?? this.config.poolMaxSize
    )
    
    this.objectPools.set(name, pool)
    return pool
  }
  
  /**
   * 获取对象池
   */
  getObjectPool<T extends object>(name: string): ObjectPool<T> | undefined {
    return this.objectPools.get(name)
  }
  
  /**
   * 创建弱引用缓存
   */
  createWeakCache<K extends object, V extends object>(
    name: string,
    onCleanup?: (key: K) => void
  ): WeakRefCache<K, V> {
    if (!this.config.enableWeakRefs) {
      throw new Error('Weak references are disabled')
    }
    
    const cache = new WeakRefCache<K, V>(onCleanup)
    this.weakCaches.set(name, cache)
    return cache
  }
  
  /**
   * 获取弱引用缓存
   */
  getWeakCache<K extends object, V extends object>(name: string): WeakRefCache<K, V> | undefined {
    return this.weakCaches.get(name)
  }
  
  /**
   * 强制垃圾回收
   */
  forceGC(): void {
    const now = Date.now()
    
    // 避免频繁GC
    if (now - this.lastGCTime < 1000) {
      return
    }
    
    this.lastGCTime = now
    
    // Node.js环境
    if (typeof (globalThis as any).gc === 'function') {
      (globalThis as any).gc()
      this.logger?.debug('Manual GC triggered')
    }
    
    // 清理对象池
    for (const pool of this.objectPools.values()) {
      pool.clear()
    }
    
    this.logger?.debug('Memory cleanup completed')
  }
  
  /**
   * 启动自动垃圾回收
   */
  private startAutoGC(): void {
    if (this.gcTimer) {
      window.clearInterval(this.gcTimer)
    }
    
    this.gcTimer = window.setInterval(() => {
      this.checkMemory()
      // 清理不活跃的对象池
      this.cleanupInactivePools()
    }, this.config.gcInterval)
  }
  
  /**
   * 启动内存监控
   */
  private startMemoryMonitoring(): void {
    if (this.memoryCheckTimer) {
      window.clearInterval(this.memoryCheckTimer)
    }
    
    // 更频繁的内存检查
    this.memoryCheckTimer = window.setInterval(() => {
      const usage = this.getMemoryUsage()
      if (usage.percentage > this.config.warningThreshold) {
        this.optimizeMemory()
      }
    }, 10000) // 每10秒检查一次
  }
  
  /**
   * 清理不活跃的对象池
   */
  private cleanupInactivePools(): void {
    for (const [name, pool] of this.objectPools) {
      const stats = pool.getStats()
      // 如果池的效率低于30%，减小其大小
      if (stats.efficiency < 30 && stats.size > 10) {
        const toRemove = Math.floor(stats.size * 0.5)
        for (let i = 0; i < toRemove; i++) {
          pool.acquire() // 取出对象但不放回
        }
        this.logger?.debug(`Reduced pool ${name} size by ${toRemove}`)
      }
    }
  }
  
  /**
   * 优化内存使用
   */
  private optimizeMemory(): void {
    // 清理对象池
    for (const pool of this.objectPools.values()) {
      const stats = pool.getStats()
      if (stats.size > 20) {
        pool.clear()
      }
    }
    
    // 触发垃圾回收
    this.forceGC()
  }
  
  /**
   * 优化数组内存使用
   */
  optimizeArray<T>(arr: T[]): T[] {
    // 如果数组太大，考虑分片处理
    if (arr.length > 10000) {
      this.logger?.debug(`Large array detected: ${arr.length} items`)
    }
    
    // 移除undefined和null值
    return arr.filter(item => item !== undefined && item !== null)
  }
  
  /**
   * 优化对象内存使用
   */
  optimizeObject<T extends object>(obj: T): T {
    // 移除undefined值的属性
    const optimized = {} as T
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key]
        if (value !== undefined) {
          optimized[key] = value
        }
      }
    }
    
    return optimized
  }
  
  /**
   * 分片处理大数据
   */
  async processInChunks<T, R>(
    data: T[],
    processor: (chunk: T[]) => R | Promise<R>,
    chunkSize = 1000
  ): Promise<R[]> {
    const results: R[] = []
    
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize)
      const result = await processor(chunk)
      results.push(result)
      
      // 每处理几个chunk就检查一次内存
      if (i % (chunkSize * 5) === 0) {
        this.checkMemory()
      }
    }
    
    return results
  }
  
  /**
   * 延迟加载
   */
  createLazyLoader<T>(loader: () => T | Promise<T>): () => Promise<T> {
    let cached: T | undefined
    let loading = false
    let promise: Promise<T> | undefined
    
    return async () => {
      if (cached !== undefined) {
        return cached
      }
      
      if (loading && promise) {
        return promise
      }
      
      loading = true
      promise = Promise.resolve(loader()).then(result => {
        cached = result
        loading = false
        promise = undefined
        return result
      })
      
      return promise
    }
  }
  
  /**
   * 获取统计信息
   */
  getStats(): {
    memory: MemoryUsage
    objectPools: { name: string; size: number }[]
    weakCaches: string[]
  } {
    return {
      memory: this.getMemoryUsage(),
      objectPools: Array.from(this.objectPools.entries()).map(([name, pool]) => ({
        name,
        size: pool.size()
      })),
      weakCaches: Array.from(this.weakCaches.keys())
    }
  }
  
  /**
   * 销毁优化器
   */
  destroy(): void {
    if (this.gcTimer) {
      clearInterval(this.gcTimer)
      this.gcTimer = undefined
    }
    
    if (this.memoryCheckTimer) {
      clearInterval(this.memoryCheckTimer)
      this.memoryCheckTimer = undefined
    }
    
    // 清理对象池
    for (const pool of this.objectPools.values()) {
      pool.clear()
    }
    this.objectPools.clear()
    
    // 清理弱引用缓存
    this.weakCaches.clear()
    
    this.isMonitoring = false
  }
}

// ============================================
// 内存泄漏检测器
// ============================================

export class MemoryLeakDetector {
  private snapshots: Array<{
    timestamp: number
    heapUsed: number
    objects: number
  }> = []
  private maxSnapshots = 100
  private leakThreshold = 10 // MB
  private checkInterval = 5000 // 5秒
  private timer?: number
  private objectCounts = new Map<string, number>()
  
  /**
   * 开始检测
   */
  start(): void {
    if (this.timer) return
    
    this.timer = window.setInterval(() => {
      this.takeSnapshot()
      this.analyzeSnapshots()
    }, this.checkInterval)
  }
  
  /**
   * 停止检测
   */
  stop(): void {
    if (this.timer) {
      window.clearInterval(this.timer)
      this.timer = undefined
    }
  }
  
  /**
   * 拍摄内存快照
   */
  private takeSnapshot(): void {
    const usage = this.getHeapUsage()
    
    this.snapshots.push({
      timestamp: Date.now(),
      heapUsed: usage.heapUsed,
      objects: this.countObjects()
    })
    
    // 限制快照数量
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift()
    }
  }
  
  /**
   * 分析快照
   */
  private analyzeSnapshots(): void {
    if (this.snapshots.length < 10) return
    
    // 计算内存增长趋势
    const recent = this.snapshots.slice(-10)
    const growth = recent[recent.length - 1].heapUsed - recent[0].heapUsed
    
    if (growth > this.leakThreshold) {
      console.warn(`Potential memory leak detected: ${growth.toFixed(2)}MB growth`)
    }
  }
  
  /**
   * 获取堆使用情况
   */
  private getHeapUsage(): { heapUsed: number } {
    if (typeof window !== 'undefined' && (window.performance as any)?.memory) {
      const memory = (window.performance as any).memory
      return { heapUsed: memory.usedJSHeapSize / 1024 / 1024 }
    }
    
    return { heapUsed: 0 }
  }
  
  /**
   * 统计对象数量
   */
  private countObjects(): number {
    // 简化实现，实际应该使用更复杂的对象追踪
    return this.objectCounts.size
  }
  
  /**
   * 追踪对象
   */
  trackObject(id: string): void {
    const count = this.objectCounts.get(id) || 0
    this.objectCounts.set(id, count + 1)
  }
  
  /**
   * 取消追踪对象
   */
  untrackObject(id: string): void {
    const count = this.objectCounts.get(id) || 0
    if (count <= 1) {
      this.objectCounts.delete(id)
    } else {
      this.objectCounts.set(id, count - 1)
    }
  }
  
  /**
   * 获取报告
   */
  getReport(): {
      snapshots: any
    possibleLeaks: string[]
    recommendation: string
  } {
    const possibleLeaks: string[] = []
    
    // 检查持续增长的对象
    for (const [id, count] of this.objectCounts) {
      if (count > 100) {
        possibleLeaks.push(`Object ${id}: ${count} instances`)
      }
    }
    
    return {
      snapshots: this.snapshots.slice(-20),
      possibleLeaks,
      recommendation: possibleLeaks.length > 0
        ? 'Review object lifecycle and ensure proper cleanup'
        : 'No obvious memory leaks detected'
    }
  }
  
  /**
   * 清理
   */
  destroy(): void {
    this.stop()
    this.snapshots = []
    this.objectCounts.clear()
  }
}

// ============================================
// 工厂函数
// ============================================

export function createMemoryOptimizer(
  config?: MemoryOptimizationConfig,
  logger?: Logger
): MemoryOptimizer {
  return new MemoryOptimizer(config, logger)
}

export function createMemoryLeakDetector(): MemoryLeakDetector {
  return new MemoryLeakDetector()
}

// ============================================
// 默认导出
// ============================================

export default {
  MemoryOptimizer,
  MemoryLeakDetector,
  ObjectPool,
  WeakRefCache,
  createMemoryOptimizer,
  createMemoryLeakDetector
}