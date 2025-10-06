/**
 * @ldesign/router 内存管理器
 *
 * 提供内存监控、弱引用管理和自动清理功能
 */

// ==================== 类型声明 ====================

// 声明 WeakRef 和 FinalizationRegistry 类型（如果不存在）
interface WeakRefLike<T extends object> {
  deref: () => T | undefined
}

interface FinalizationRegistryLike<T> {
  register: (target: object, heldValue: T, unregisterToken?: object) => void
  unregister: (unregisterToken: object) => boolean
}

// ==================== 内存监控接口 ====================

/**
 * 内存使用统计
 */
export interface MemoryStats {
  /** 总内存使用量（字节） */
  totalMemory: number
  /** 路由记录内存使用量 */
  routeMemory: number
  /** 缓存内存使用量 */
  cacheMemory: number
  /** 事件监听器数量 */
  listenerCount: number
  /** 弱引用数量 */
  weakRefCount: number
  /** 垃圾回收次数 */
  gcCount: number
}

/**
 * 内存阈值配置
 */
export interface MemoryThresholds {
  /** 警告阈值（MB） */
  warning: number
  /** 严重阈值（MB） */
  critical: number
  /** 最大缓存大小（MB） */
  maxCache: number
  /** 最大监听器数量 */
  maxListeners: number
}

/**
 * 清理策略
 */
export type CleanupStrategy = 'aggressive' | 'moderate' | 'conservative'

// ==================== 弱引用管理器 ====================

/**
 * 弱引用包装器
 */
export class WeakRefWrapper<T extends object> {
  private weakRef: WeakRefLike<T> | null = null
  private finalizer: FinalizationRegistryLike<string> | null = null
  private key: string
  private target: T | undefined // fallback 存储

  constructor(target: T, key: string, onFinalize?: (key: string) => void) {
    this.key = key

    // 检查是否支持 WeakRef
    if (typeof (globalThis as any).WeakRef !== 'undefined') {
      this.weakRef = new (globalThis as any).WeakRef(target) as WeakRefLike<T>

      if (typeof (globalThis as any).FinalizationRegistry !== 'undefined') {
        this.finalizer = new (globalThis as any).FinalizationRegistry(
          (heldValue: string) => {
            onFinalize?.(heldValue)
          },
        ) as FinalizationRegistryLike<string>
        this.finalizer.register(target, key)
      }
    }
    else {
      // Fallback: 直接存储引用（不是真正的弱引用）
      this.target = target
      console.warn('WeakRef not supported, using fallback storage')
    }
  }

  get(): T | undefined {
    if (this.weakRef) {
      return this.weakRef.deref()
    }
    return this.target
  }

  getKey(): string {
    return this.key
  }

  cleanup(): void {
    if (this.finalizer && this.weakRef) {
      try {
        this.finalizer.unregister(this.weakRef as any)
      }
      catch {
        // 忽略清理错误
      }
    }
    this.target = undefined
  }
}

/**
 * 弱引用管理器
 */
export class WeakRefManager {
  private refs = new Map<string, WeakRefWrapper<any>>()
  private cleanupCallbacks = new Map<string, () => void>()

  /**
   * 创建弱引用
   */
  createWeakRef<T extends object>(
    target: T,
    key: string,
    onCleanup?: () => void,
  ): WeakRefWrapper<T> {
    // 清理已存在的引用
    this.removeWeakRef(key)

    const wrapper = new WeakRefWrapper(target, key, (finalizedKey) => {
      this.handleFinalization(finalizedKey)
    })

    this.refs.set(key, wrapper)

    if (onCleanup) {
      this.cleanupCallbacks.set(key, onCleanup)
    }

    return wrapper
  }

  /**
   * 获取弱引用
   */
  getWeakRef<T extends object>(key: string): T | undefined {
    const wrapper = this.refs.get(key) as WeakRefWrapper<T> | undefined
    if (!wrapper)
      return undefined

    const target = wrapper.get()
    if (!target) {
      // 对象已被垃圾回收，清理引用
      this.removeWeakRef(key)
      return undefined
    }

    return target
  }

  /**
   * 移除弱引用
   */
  removeWeakRef(key: string): boolean {
    const wrapper = this.refs.get(key)
    if (!wrapper)
      return false

    wrapper.cleanup()
    this.refs.delete(key)

    const cleanup = this.cleanupCallbacks.get(key)
    if (cleanup) {
      cleanup()
      this.cleanupCallbacks.delete(key)
    }

    return true
  }

  /**
   * 清理所有弱引用
   */
  clear(): void {
    for (const [key] of this.refs) {
      this.removeWeakRef(key)
    }
  }

  /**
   * 获取弱引用统计
   */
  getStats(): { count: number, keys: string[] } {
    return {
      count: this.refs.size,
      keys: Array.from(this.refs.keys()),
    }
  }

  /**
   * 处理对象终结
   */
  private handleFinalization(key: string): void {
    this.refs.delete(key)

    const cleanup = this.cleanupCallbacks.get(key)
    if (cleanup) {
      cleanup()
      this.cleanupCallbacks.delete(key)
    }
  }
}

// ==================== 内存监控器 ====================

/**
 * 内存监控器
 */
export class MemoryMonitor {
  private stats: MemoryStats = {
    totalMemory: 0,
    routeMemory: 0,
    cacheMemory: 0,
    listenerCount: 0,
    weakRefCount: 0,
    gcCount: 0,
  }

  private thresholds: MemoryThresholds = {
    warning: 30, // 30MB (优化：更早触发清理)
    critical: 60, // 60MB (优化：降低严重阈值)
    maxCache: 10, // 10MB (优化：减少缓存上限)
    maxListeners: 500, // 优化：减少监听器上限
  }

  private listeners = new Set<EventListener>()
  private monitoringInterval: number | undefined
  private onWarning?: (stats: MemoryStats) => void
  private onCritical?: (stats: MemoryStats) => void

  constructor(
    thresholds?: Partial<MemoryThresholds>,
    callbacks?: {
      onWarning?: (stats: MemoryStats) => void
      onCritical?: (stats: MemoryStats) => void
    },
  ) {
    if (thresholds) {
      this.thresholds = { ...this.thresholds, ...thresholds }
    }

    if (callbacks) {
      if (callbacks.onWarning) {
        this.onWarning = callbacks.onWarning
      }
      if (callbacks.onCritical) {
        this.onCritical = callbacks.onCritical
      }
    }
  }

  /**
   * 开始监控（优化：增加默认间隔以减少CPU占用）
   */
  startMonitoring(interval: number = 60000): void {
    this.stopMonitoring()

    this.monitoringInterval = window.setInterval(() => {
      this.updateStats()
      this.checkThresholds()
    }, interval)

    // 立即执行一次
    this.updateStats()
  }

  /**
   * 停止监控
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = undefined
    }
  }

  /**
   * 更新统计信息（优化：减少不必要的GC调用）
   */
  updateStats(): void {
    // 获取性能信息（如果可用）
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.stats.totalMemory = memory.usedJSHeapSize || 0
    }

    this.stats.listenerCount = this.listeners.size

    // 优化：只在内存压力大时触发GC
    if ('gc' in window && typeof (window as any).gc === 'function') {
      const totalMB = this.stats.totalMemory / (1024 * 1024)
      if (totalMB > this.thresholds.warning) {
        ; (window as any).gc()
        this.stats.gcCount++
      }
    }
  }

  /**
   * 检查阈值
   */
  private checkThresholds(): void {
    const totalMB = this.stats.totalMemory / (1024 * 1024)
    const cacheMB = this.stats.cacheMemory / (1024 * 1024)

    if (
      totalMB > this.thresholds.critical
      || cacheMB > this.thresholds.maxCache
    ) {
      this.onCritical?.(this.stats)
    }
    else if (totalMB > this.thresholds.warning) {
      this.onWarning?.(this.stats)
    }

    if (this.stats.listenerCount > this.thresholds.maxListeners) {
      console.warn(`事件监听器数量过多: ${this.stats.listenerCount}`)
    }
  }

  /**
   * 注册事件监听器
   */
  registerListener(listener: EventListener): void {
    this.listeners.add(listener)
  }

  /**
   * 注销事件监听器
   */
  unregisterListener(listener: EventListener): void {
    this.listeners.delete(listener)
  }

  /**
   * 获取统计信息
   */
  getStats(): MemoryStats {
    return { ...this.stats }
  }

  /**
   * 设置缓存内存使用量
   */
  setCacheMemory(bytes: number): void {
    this.stats.cacheMemory = bytes
  }

  /**
   * 设置路由内存使用量
   */
  setRouteMemory(bytes: number): void {
    this.stats.routeMemory = bytes
  }

  /**
   * 设置弱引用数量
   */
  setWeakRefCount(count: number): void {
    this.stats.weakRefCount = count
  }
}

// ==================== 内存管理器 ====================

/**
 * 内存管理器
 */
export class MemoryManager {
  private weakRefManager: WeakRefManager
  private memoryMonitor: MemoryMonitor
  private cleanupStrategy: CleanupStrategy = 'moderate'

  constructor(
    thresholds?: Partial<MemoryThresholds>,
    strategy: CleanupStrategy = 'moderate',
  ) {
    this.weakRefManager = new WeakRefManager()
    this.memoryMonitor = new MemoryMonitor(thresholds, {
      onWarning: stats => this.handleMemoryWarning(stats),
      onCritical: stats => this.handleMemoryCritical(stats),
    })
    this.cleanupStrategy = strategy
  }

  /**
   * 开始内存管理
   */
  start(): void {
    this.memoryMonitor.startMonitoring()
  }

  /**
   * 停止内存管理
   */
  stop(): void {
    this.memoryMonitor.stopMonitoring()
    this.weakRefManager.clear()
  }

  /**
   * 获取弱引用管理器
   */
  getWeakRefManager(): WeakRefManager {
    return this.weakRefManager
  }

  /**
   * 获取内存监控器
   */
  getMemoryMonitor(): MemoryMonitor {
    return this.memoryMonitor
  }

  /**
   * 处理内存警告
   */
  private handleMemoryWarning(stats: MemoryStats): void {
    // 只在开发模式下输出内存警告
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      console.warn('内存使用量警告:', stats)
    }

    if (this.cleanupStrategy === 'aggressive') {
      this.performCleanup('moderate')
    }
  }

  /**
   * 处理内存严重警告
   */
  private handleMemoryCritical(stats: MemoryStats): void {
    console.error('内存使用量严重警告:', stats)
    this.performCleanup(this.cleanupStrategy)
  }

  /**
   * 执行清理
   */
  private performCleanup(level: CleanupStrategy): void {
    switch (level) {
      case 'aggressive':
        // 激进清理：清理所有可清理的内容
        this.weakRefManager.clear()
        break
      case 'moderate':
        // 适度清理：清理部分内容
        // 这里可以添加具体的清理逻辑
        break
      case 'conservative':
        // 保守清理：只清理明确过期的内容
        // 这里可以添加具体的清理逻辑
        break
    }
  }
}
