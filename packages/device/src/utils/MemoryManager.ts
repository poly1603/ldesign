/**
 * 内存管理器 - 统一管理应用内存使用
 * 
 * 特性：
 * - 对象池管理（减少GC压力）
 * - 自动内存监控和清理
 * - 内存泄漏检测
 * - 资源生命周期管理
 */

interface PoolConfig<T = unknown> {
  maxSize: number
  initialSize?: number
  resetFn?: (obj: T) => void
  createFn: () => T
}

interface MemoryStats {
  usedHeapSize: number
  totalHeapSize: number
  heapLimit: number
  external: number
  gcCount: number
  lastGCTime: number
}

/**
 * 对象池实现 - 减少对象创建和GC开销
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private inUse = new Set<T>()
  private createFn: () => T
  private resetFn?: (obj: T) => void
  private maxSize: number

  constructor(config: PoolConfig<T>) {
    this.maxSize = config.maxSize
    this.createFn = config.createFn
    this.resetFn = config.resetFn

    // 预创建对象
    const initialSize = config.initialSize || Math.min(10, config.maxSize)
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn())
    }
  }

  /**
   * 获取对象
   */
  acquire(): T {
    let obj: T

    if (this.pool.length > 0) {
      const popped = this.pool.pop()
      if (!popped) {
        obj = this.createFn()
      } else {
        obj = popped
      }
    } else {
      obj = this.createFn()
    }

    this.inUse.add(obj)
    return obj
  }

  /**
   * 释放对象
   */
  release(obj: T): void {
    if (!this.inUse.has(obj)) {
      return
    }

    this.inUse.delete(obj)

    if (this.resetFn) {
      this.resetFn(obj)
    }

    if (this.pool.length < this.maxSize) {
      this.pool.push(obj)
    }
  }

  /**
   * 清空对象池
   */
  clear(): void {
    this.pool.length = 0
    this.inUse.clear()
  }

  /**
   * 获取池统计信息
   */
  getStats() {
    return {
      poolSize: this.pool.length,
      inUseSize: this.inUse.size,
      totalSize: this.pool.length + this.inUse.size,
      maxSize: this.maxSize
    }
  }
}

/**
 * 内存管理器
 */
export class MemoryManager {
  private static instance: MemoryManager | null = null
  private pools = new Map<string, ObjectPool<unknown>>()
  private memoryCheckInterval: NodeJS.Timeout | null = null
  private gcCallbacks = new Set<() => void>()
  private memoryThreshold = 0.8 // 80%内存使用率触发清理
  private lastGCTime = 0
  private gcCount = 0
  private weakRefs = new Map<string, WeakRef<object>>()
  private finalizationRegistry: FinalizationRegistry<string>

  // 性能统计
  private stats = {
    totalAllocations: 0,
    totalDeallocations: 0,
    gcTriggers: 0,
    memoryPressureEvents: 0
  }

  private constructor() {
    // 创建FinalizationRegistry用于追踪对象回收
    this.finalizationRegistry = new FinalizationRegistry((heldValue) => {
      this.onObjectFinalized(heldValue)
    })

    // 启动内存监控
    this.startMemoryMonitoring()
  }

  /**
   * 获取单例实例
   */
  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager()
    }
    return MemoryManager.instance
  }

  /**
   * 注册对象池
   */
  registerPool<T>(name: string, config: PoolConfig<T>): ObjectPool<T> {
    if (this.pools.has(name)) {
      throw new Error(`Pool "${name}" already exists`)
    }

    const pool = new ObjectPool<T>(config)
    this.pools.set(name, pool as unknown as ObjectPool<unknown>)
    return pool
  }

  /**
   * 获取对象池
   */
  getPool<T>(name: string): ObjectPool<T> | undefined {
    return this.pools.get(name) as ObjectPool<T> | undefined
  }

  /**
   * 从池中获取对象
   */
  acquireFromPool<T>(poolName: string): T | undefined {
    const pool = this.pools.get(poolName)
    return pool?.acquire() as T | undefined
  }

  /**
   * 释放对象到池
   */
  releaseToPool<T>(poolName: string, obj: T): void {
    const pool = this.pools.get(poolName)
    pool?.release(obj)
  }

  /**
   * 注册弱引用对象（用于追踪大对象）
   */
  registerWeakRef<T extends object>(key: string, obj: T): void {
    const weakRef = new WeakRef(obj)
    this.weakRefs.set(key, weakRef)
    
    // 注册到FinalizationRegistry
    this.finalizationRegistry.register(obj, key)
    
    this.stats.totalAllocations++
  }

  /**
   * 获取弱引用对象
   */
  getWeakRef<T>(key: string): T | undefined {
    const weakRef = this.weakRefs.get(key)
    if (weakRef) {
      const obj = weakRef.deref()
      if (!obj) {
        this.weakRefs.delete(key)
      }
      return obj as T
    }
    return undefined
  }

  /**
   * 对象被回收时的回调
   */
  private onObjectFinalized(key: string): void {
    this.weakRefs.delete(key)
    this.stats.totalDeallocations++
  }

  /**
   * 添加GC回调
   */
  addGCCallback(callback: () => void): void {
    this.gcCallbacks.add(callback)
  }

  /**
   * 移除GC回调
   */
  removeGCCallback(callback: () => void): void {
    this.gcCallbacks.delete(callback)
  }

  /**
   * 手动触发垃圾回收（建议）
   */
  suggestGC(): void {
    this.gcCount++
    this.lastGCTime = Date.now()
    this.stats.gcTriggers++

    // 清理所有对象池中的空闲对象（优化：批量处理）
    this.pools.forEach(pool => {
      const stats = pool.getStats()
      // 如果池中空闲对象过多，清理一部分（优化：更激进的清理策略）
      if (stats.poolSize > Math.max(10, stats.inUseSize)) {
        pool.clear()
      }
    })

    // 清理失效的弱引用（优化：直接在迭代中删除，避免创建临时数组）
    this.weakRefs.forEach((ref, key) => {
      if (!ref.deref()) {
        this.weakRefs.delete(key)
      }
    })

    // 触发GC回调（优化：使用for...of以提高性能）
    for (const callback of this.gcCallbacks) {
      try {
        callback()
      } catch (error) {
        console.error('GC callback error:', error)
      }
    }

    // 如果支持，触发浏览器GC
    if (typeof window !== 'undefined' && 'gc' in (window as unknown as { gc?: () => void })) {
      try {
        (window as unknown as { gc?: () => void }).gc?.()
      } catch {}
    }
  }

  /**
   * 获取内存统计信息
   */
  getMemoryStats(): MemoryStats | null {
    if (typeof window === 'undefined' || !(performance as import('../types').ExtendedPerformance).memory) {
      return null
    }

    const memory = (performance as import('../types').ExtendedPerformance).memory
    if (!memory) return null
    return {
      usedHeapSize: memory.usedJSHeapSize,
      totalHeapSize: memory.totalJSHeapSize,
      heapLimit: memory.jsHeapSizeLimit,
      external: 0,
      gcCount: this.gcCount,
      lastGCTime: this.lastGCTime
    }
  }

  /**
   * 检查内存压力
   */
  checkMemoryPressure(): boolean {
    const stats = this.getMemoryStats()
    if (!stats) return false

    const usage = stats.usedHeapSize / stats.heapLimit
    if (usage > this.memoryThreshold) {
      this.stats.memoryPressureEvents++
      return true
    }
    return false
  }

  /**
   * 开始内存监控
   */
  private startMemoryMonitoring(): void {
    if (typeof window === 'undefined') return

    this.memoryCheckInterval = setInterval(() => {
      if (this.checkMemoryPressure()) {
        console.warn('Memory pressure detected, triggering cleanup')
        this.suggestGC()
      }
    }, 30000) // 每30秒检查一次
  }

  /**
   * 停止内存监控
   */
  stopMemoryMonitoring(): void {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval)
      this.memoryCheckInterval = null
    }
  }

  /**
   * 获取管理器统计信息
   */
  getStats() {
    const poolStats: Record<string, unknown> = {}
    this.pools.forEach((pool, name) => {
      poolStats[name] = pool.getStats()
    })

    return {
      ...this.stats,
      pools: poolStats,
      weakRefs: this.weakRefs.size,
      gcCallbacks: this.gcCallbacks.size,
      memoryStats: this.getMemoryStats()
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.stopMemoryMonitoring()
    this.pools.forEach(pool => pool.clear())
    this.pools.clear()
    this.gcCallbacks.clear()
    this.weakRefs.clear()
    MemoryManager.instance = null
  }
}

/**
 * 创建可复用的对象池
 */
export function createReusablePool<T>(
  name: string,
  createFn: () => T,
  resetFn?: (obj: T) => void,
  maxSize = 100
): ObjectPool<T> {
  const manager = MemoryManager.getInstance()
  return manager.registerPool<T>(name, {
    maxSize,
    createFn,
    resetFn,
    initialSize: Math.min(10, maxSize)
  })
}

/**
 * 内存安全的定时器管理
 */
export class SafeTimerManager {
  private timers = new Map<string, NodeJS.Timeout>()
  private intervals = new Map<string, NodeJS.Timeout>()

  /**
   * 设置定时器（自动清理旧的）
   */
  setTimeout(key: string, callback: () => void, delay: number): void {
    this.clearTimeout(key)
    const timer = setTimeout(() => {
      this.timers.delete(key)
      callback()
    }, delay)
    this.timers.set(key, timer)
  }

  /**
   * 清理定时器
   */
  clearTimeout(key: string): void {
    const timer = this.timers.get(key)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(key)
    }
  }

  /**
   * 设置间隔定时器
   */
  setInterval(key: string, callback: () => void, interval: number): void {
    this.clearInterval(key)
    const timer = setInterval(callback, interval)
    this.intervals.set(key, timer)
  }

  /**
   * 清理间隔定时器
   */
  clearInterval(key: string): void {
    const timer = this.intervals.get(key)
    if (timer) {
      clearInterval(timer)
      this.intervals.delete(key)
    }
  }

  /**
   * 清理所有定时器
   */
  clearAll(): void {
    this.timers.forEach(timer => clearTimeout(timer))
    this.intervals.forEach(timer => clearInterval(timer))
    this.timers.clear()
    this.intervals.clear()
  }

  /**
   * 获取活跃定时器数量
   */
  getActiveCount(): { timers: number; intervals: number } {
    return {
      timers: this.timers.size,
      intervals: this.intervals.size
    }
  }
}

// 导出单例实例
export const memoryManager = MemoryManager.getInstance()
export const timerManager = new SafeTimerManager()