/**
 * 内存管理器 - 提供内存监控、压力检测和自动清理功能
 */

import type { SerializableValue, StorageEngine } from '../types'
import { DATA_SIZE, MEMORY_CONFIG, TIME_INTERVALS, UTF8_SIZE } from '../constants/performance'

/**
 * 内存使用统计
 */
export interface MemoryStats {
  /** 总内存使用量（字节） */
  totalUsed: number
  /** 内存限制（字节） */
  limit: number
  /** 使用百分比 */
  usagePercentage: number
  /** 各引擎内存使用 */
  engineUsage: Map<StorageEngine, number>
  /** 缓存项数量 */
  itemCount: number
  /** 内存压力级别 */
  pressureLevel: 'low' | 'medium' | 'high' | 'critical'
  /** 最后清理时间 */
  lastCleanupTime: number
  /** 清理次数 */
  cleanupCount: number
}

/**
 * 内存管理配置
 */
export interface MemoryManagerConfig {
  /** 最大内存限制（字节） */
  maxMemory?: number
  /** 高压力阈值（百分比） */
  highPressureThreshold?: number
  /** 危急压力阈值（百分比） */
  criticalPressureThreshold?: number
  /** 自动清理间隔（毫秒） */
  autoCleanupInterval?: number
  /** 启用自动压力响应 */
  enableAutoPressureResponse?: boolean
}

/**
 * 内存池 - 用于对象复用
 */
class ObjectPool<T> {
  private pool: T[] = []
  private maxSize: number
  private factory: () => T
  private reset: (obj: T) => void

  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    maxSize = 100
  ) {
    this.factory = factory
    this.reset = reset
    this.maxSize = maxSize
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    return this.factory()
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.reset(obj)
      this.pool.push(obj)
    }
  }

  clear(): void {
    this.pool = []
  }

  get size(): number {
    return this.pool.length
  }
}

/**
 * 内存管理器
 */
export class MemoryManager {
  private config: Required<MemoryManagerConfig>
  private currentUsage = 0
  private engineUsage = new Map<StorageEngine, number>()
  private itemCount = 0
  private cleanupCount = 0
  private lastCleanupTime = 0
  private cleanupTimer?: number
  
  // 对象池
  private metadataPool: ObjectPool<any>
  private cacheItemPool: ObjectPool<any>
  
  // WeakMap用于避免内存泄漏
  private objectSizeCache = new WeakMap<object, number>()
  
  // 内存压力回调
  private pressureCallbacks = new Set<(level: MemoryStats['pressureLevel']) => void>()

  constructor(config: MemoryManagerConfig = {}) {
    this.config = {
      maxMemory: config.maxMemory || MEMORY_CONFIG.MAX_DEFAULT,
      highPressureThreshold: config.highPressureThreshold || MEMORY_CONFIG.HIGH_PRESSURE_THRESHOLD,
      criticalPressureThreshold: config.criticalPressureThreshold || MEMORY_CONFIG.CRITICAL_PRESSURE_THRESHOLD,
      autoCleanupInterval: config.autoCleanupInterval || TIME_INTERVALS.CLEANUP_INTERVAL_DEFAULT,
      enableAutoPressureResponse: config.enableAutoPressureResponse ?? true
    }

    // 初始化对象池
    this.metadataPool = new ObjectPool(
      () => ({}),
      (obj) => {
        for (const key in obj) {
      delete (obj as any)[key]
        }
      }
    )

    this.cacheItemPool = new ObjectPool(
      () => ({ value: null, metadata: null }),
      (obj) => {
        obj.value = null
        obj.metadata = null
      }
    )

    // 启动自动清理
    if (this.config.autoCleanupInterval > 0) {
      this.startAutoCleanup()
    }
  }

  /**
   * 更新内存使用量
   */
  updateUsage(delta: number, engine?: StorageEngine): void {
    this.currentUsage = Math.max(0, this.currentUsage + delta)
    
    if (engine) {
      const current = this.engineUsage.get(engine) || 0
      this.engineUsage.set(engine, Math.max(0, current + delta))
    }

    // 检查内存压力
    if (this.config.enableAutoPressureResponse) {
      this.checkMemoryPressure()
    }
  }

  /**
   * 更新项目计数
   */
  updateItemCount(delta: number): void {
    this.itemCount = Math.max(0, this.itemCount + delta)
  }

  /**
   * 获取内存统计
   */
  getStats(): MemoryStats {
    const usagePercentage = this.currentUsage / this.config.maxMemory
    
    return {
      totalUsed: this.currentUsage,
      limit: this.config.maxMemory,
      usagePercentage,
      engineUsage: new Map(this.engineUsage),
      itemCount: this.itemCount,
      pressureLevel: this.getPressureLevel(usagePercentage),
      lastCleanupTime: this.lastCleanupTime,
      cleanupCount: this.cleanupCount
    }
  }

  /**
   * 获取压力级别
   */
  private getPressureLevel(usagePercentage: number): MemoryStats['pressureLevel'] {
    if (usagePercentage >= this.config.criticalPressureThreshold) {
      return 'critical'
    }
    if (usagePercentage >= this.config.highPressureThreshold) {
      return 'high'
    }
    if (usagePercentage >= MEMORY_CONFIG.MEDIUM_PRESSURE_THRESHOLD) {
      return 'medium'
    }
    return 'low'
  }

  /**
   * 检查内存压力并触发响应
   */
  private checkMemoryPressure(): void {
    const stats = this.getStats()
    
    // 通知压力监听器
    this.pressureCallbacks.forEach(callback => {
      try {
        callback(stats.pressureLevel)
      } catch (error) {
        console.error('Memory pressure callback error:', error)
      }
    })

    // 自动响应高压力
    if (stats.pressureLevel === 'critical') {
      this.emergencyCleanup()
    } else if (stats.pressureLevel === 'high' && 
               Date.now() - this.lastCleanupTime > TIME_INTERVALS.HIGH_PRESSURE_CLEANUP_INTERVAL) {
      this.performCleanup()
    }
  }

  /**
   * 执行清理
   */
  private performCleanup(): void {
    this.lastCleanupTime = Date.now()
    this.cleanupCount++
    
    // 清理对象池中多余的对象
    if (this.metadataPool.size > MEMORY_CONFIG.POOL_CLEANUP_THRESHOLD) {
      this.metadataPool.clear()
    }
    if (this.cacheItemPool.size > MEMORY_CONFIG.POOL_CLEANUP_THRESHOLD) {
      this.cacheItemPool.clear()
    }

    // 触发垃圾回收（如果可用）
    if (typeof globalThis !== 'undefined' && (globalThis as any).gc) {
      try {
        (globalThis as any).gc()
      } catch {
        // 忽略错误
      }
    }
  }

  /**
   * 紧急清理
   */
  private emergencyCleanup(): void {
    console.warn('[MemoryManager] Emergency cleanup triggered due to critical memory pressure')
    
    // 清空所有对象池
    this.metadataPool.clear()
    this.cacheItemPool.clear()
    
    // 执行常规清理
    this.performCleanup()
  }

  /**
   * 启动自动清理
   */
  private startAutoCleanup(): void {
    const interval = this.config.autoCleanupInterval
    
    const setIntervalFn = 
      typeof window !== 'undefined' ? window.setInterval : globalThis.setInterval

    this.cleanupTimer = setIntervalFn(() => {
      const stats = this.getStats()
      if (stats.pressureLevel !== 'low') {
        this.performCleanup()
      }
    }, interval) as unknown as number
  }

  /**
   * 计算对象大小（优化版）
   */
  calculateObjectSize(obj: SerializableValue): number {
    // 基本类型
    if (obj === null || obj === undefined) return DATA_SIZE.NULL_SIZE
    if (typeof obj === 'boolean') return DATA_SIZE.BOOLEAN_SIZE
    if (typeof obj === 'number') return DATA_SIZE.NUMBER_SIZE
    if (typeof obj === 'string') return this.calculateStringSize(obj)
    
    // 对象类型 - 使用缓存
    if (typeof obj === 'object') {
      const cached = this.objectSizeCache.get(obj)
      if (cached !== undefined) return cached
      
      let size = 0
      
      if (Array.isArray(obj)) {
        size = DATA_SIZE.ARRAY_OVERHEAD
        for (const item of obj) {
          size += this.calculateObjectSize(item)
        }
      } else {
        size = DATA_SIZE.OBJECT_OVERHEAD
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            size += this.calculateStringSize(key)
            size += this.calculateObjectSize((obj as any)[key])
          }
        }
      }
      
      this.objectSizeCache.set(obj, size)
      return size
    }
    
    return DATA_SIZE.NUMBER_SIZE // 默认
  }

  /**
   * 计算字符串大小（UTF-8）优化版本
   */
  private calculateStringSize(str: string): number {
    let size = DATA_SIZE.STRING_OVERHEAD
    const len = str.length
    
    // 批量处理以提高性能
    for (let i = 0; i < len; i++) {
      const code = str.charCodeAt(i)
      // 优化：使用常量和条件运算符
      size += code < UTF8_SIZE.ASCII_MAX 
        ? UTF8_SIZE.ONE_BYTE 
        : code < UTF8_SIZE.TWO_BYTE_MAX 
          ? UTF8_SIZE.TWO_BYTES 
          : code < UTF8_SIZE.THREE_BYTE_MAX 
            ? UTF8_SIZE.THREE_BYTES 
            : UTF8_SIZE.FOUR_BYTES
    }
    return size
  }

  /**
   * 注册压力监听器
   */
  onPressure(callback: (level: MemoryStats['pressureLevel']) => void): () => void {
    this.pressureCallbacks.add(callback)
    return () => this.pressureCallbacks.delete(callback)
  }

  /**
   * 获取对象池中的元数据对象
   */
  acquireMetadata(): any {
    return this.metadataPool.acquire()
  }

  /**
   * 释放元数据对象到池中
   */
  releaseMetadata(obj: any): void {
    this.metadataPool.release(obj)
  }

  /**
   * 获取对象池中的缓存项对象
   */
  acquireCacheItem(): any {
    return this.cacheItemPool.acquire()
  }

  /**
   * 释放缓存项对象到池中
   */
  releaseCacheItem(obj: any): void {
    this.cacheItemPool.release(obj)
  }

  /**
   * 检查是否有足够的内存
   */
  hasEnoughMemory(required: number): boolean {
    return this.currentUsage + required <= this.config.maxMemory
  }

  /**
   * 请求内存分配
   */
  requestMemory(size: number): boolean {
    if (this.hasEnoughMemory(size)) {
      return true
    }

    // 尝试清理以获得足够空间
    this.performCleanup()
    return this.hasEnoughMemory(size)
  }

  /**
   * 重置内存统计
   */
  reset(): void {
    this.currentUsage = 0
    this.engineUsage.clear()
    this.itemCount = 0
    this.cleanupCount = 0
    this.lastCleanupTime = 0
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    if (this.cleanupTimer) {
      const clearIntervalFn = 
        typeof window !== 'undefined' ? window.clearInterval : globalThis.clearInterval
      clearIntervalFn(this.cleanupTimer)
      this.cleanupTimer = undefined
    }

    this.metadataPool.clear()
    this.cacheItemPool.clear()
    this.pressureCallbacks.clear()
    this.engineUsage.clear()
  }
}

/**
 * 创建内存管理器实例
 */
export function createMemoryManager(config?: MemoryManagerConfig): MemoryManager {
  return new MemoryManager(config)
}