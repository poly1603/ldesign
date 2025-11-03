/**
 * 对象池工具
 * 
 * 通过对象复用减少 GC 压力,提升性能
 * 
 * @packageDocumentation
 */

/**
 * 对象池配置
 */
export interface ObjectPoolConfig<T> {
  /** 对象工厂函数 */
  factory: () => T
  /** 对象重置函数 */
  reset: (obj: T) => void
  /** 初始池大小 */
  initialSize?: number
  /** 最大池大小 */
  maxSize?: number
  /** 是否启用统计 */
  enableStats?: boolean
}

/**
 * 对象池统计信息
 */
export interface ObjectPoolStats {
  /** 池中可用对象数 */
  poolSize: number
  /** 正在使用的对象数 */
  inUseSize: number
  /** 总对象数 */
  totalSize: number
  /** 复用率 (%) */
  reuseRate: number
  /** 总获取次数 */
  acquireCount: number
  /** 总释放次数 */
  releaseCount: number
  /** 创建次数 */
  createCount: number
}

/**
 * 通用对象池
 * 
 * 提供对象复用机制,减少 GC 压力
 * 
 * @example
 * ```typescript
 * // 创建事件对象池
 * const eventPool = new ObjectPool({
 *   factory: () => ({ type: '', data: null, timestamp: 0 }),
 *   reset: (obj) => {
 *     obj.type = ''
 *     obj.data = null
 *     obj.timestamp = 0
 *   },
 *   initialSize: 20,
 *   maxSize: 100
 * })
 * 
 * // 获取对象
 * const event = eventPool.acquire()
 * event.type = 'click'
 * event.data = { x: 100, y: 200 }
 * 
 * // 使用完毕后释放
 * eventPool.release(event)
 * 
 * // 查看统计
 * console.log(eventPool.getStats())
 * ```
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private inUse = new Set<T>()
  private config: Required<ObjectPoolConfig<T>>
  private stats = {
    acquireCount: 0,
    releaseCount: 0,
    createCount: 0,
  }

  constructor(config: ObjectPoolConfig<T>) {
    this.config = {
      factory: config.factory,
      reset: config.reset,
      initialSize: config.initialSize ?? 10,
      maxSize: config.maxSize ?? 100,
      enableStats: config.enableStats ?? true,
    }

    // 预创建对象
    this.prewarm(this.config.initialSize)
  }

  /**
   * 预热对象池
   * 
   * @param count - 预创建对象数量
   */
  prewarm(count: number): void {
    for (let i = 0; i < count; i++) {
      const obj = this.config.factory()
      this.pool.push(obj)
      if (this.config.enableStats) {
        this.stats.createCount++
      }
    }
  }

  /**
   * 获取对象
   * 
   * @returns 对象实例
   */
  acquire(): T {
    if (this.config.enableStats) {
      this.stats.acquireCount++
    }

    let obj = this.pool.pop()

    if (!obj) {
      // 池中没有可用对象,创建新对象
      obj = this.config.factory()
      if (this.config.enableStats) {
        this.stats.createCount++
      }
    }

    this.inUse.add(obj)
    return obj
  }

  /**
   * 释放对象
   * 
   * @param obj - 要释放的对象
   */
  release(obj: T): void {
    if (!this.inUse.has(obj)) {
      console.warn('尝试释放未被获取的对象')
      return
    }

    if (this.config.enableStats) {
      this.stats.releaseCount++
    }

    this.inUse.delete(obj)

    // 重置对象状态
    try {
      this.config.reset(obj)
    } catch (error) {
      console.error('对象重置失败:', error)
      // 重置失败的对象不放回池中
      return
    }

    // 如果池未满,放回池中
    if (this.pool.length < this.config.maxSize) {
      this.pool.push(obj)
    }
    // 否则让对象被 GC 回收
  }

  /**
   * 批量获取对象
   * 
   * @param count - 获取数量
   * @returns 对象数组
   */
  acquireBatch(count: number): T[] {
    const objects: T[] = []
    for (let i = 0; i < count; i++) {
      objects.push(this.acquire())
    }
    return objects
  }

  /**
   * 批量释放对象
   * 
   * @param objects - 对象数组
   */
  releaseBatch(objects: T[]): void {
    objects.forEach(obj => this.release(obj))
  }

  /**
   * 清空对象池
   */
  clear(): void {
    this.pool = []
    this.inUse.clear()
  }

  /**
   * 获取统计信息
   * 
   * @returns 统计信息
   */
  getStats(): ObjectPoolStats {
    const totalSize = this.pool.length + this.inUse.size
    const reuseRate = this.stats.createCount > 0
      ? ((this.stats.acquireCount - this.stats.createCount) / this.stats.acquireCount) * 100
      : 0

    return {
      poolSize: this.pool.length,
      inUseSize: this.inUse.size,
      totalSize,
      reuseRate: Math.max(0, reuseRate),
      acquireCount: this.stats.acquireCount,
      releaseCount: this.stats.releaseCount,
      createCount: this.stats.createCount,
    }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      acquireCount: 0,
      releaseCount: 0,
      createCount: 0,
    }
  }

  /**
   * 销毁对象池
   */
  destroy(): void {
    this.clear()
    this.resetStats()
  }
}

/**
 * 对象池管理器
 * 
 * 管理多个对象池
 */
export class ObjectPoolManager {
  private pools = new Map<string, ObjectPool<any>>()

  /**
   * 创建对象池
   * 
   * @param name - 池名称
   * @param config - 池配置
   */
  createPool<T>(name: string, config: ObjectPoolConfig<T>): ObjectPool<T> {
    if (this.pools.has(name)) {
      throw new Error(`对象池 "${name}" 已存在`)
    }

    const pool = new ObjectPool(config)
    this.pools.set(name, pool)
    return pool
  }

  /**
   * 获取对象池
   * 
   * @param name - 池名称
   * @returns 对象池实例
   */
  getPool<T>(name: string): ObjectPool<T> | undefined {
    return this.pools.get(name)
  }

  /**
   * 删除对象池
   * 
   * @param name - 池名称
   */
  deletePool(name: string): boolean {
    const pool = this.pools.get(name)
    if (pool) {
      pool.destroy()
      return this.pools.delete(name)
    }
    return false
  }

  /**
   * 获取所有池的统计信息
   * 
   * @returns 统计信息映射
   */
  getAllStats(): Map<string, ObjectPoolStats> {
    const stats = new Map<string, ObjectPoolStats>()
    this.pools.forEach((pool, name) => {
      stats.set(name, pool.getStats())
    })
    return stats
  }

  /**
   * 清空所有对象池
   */
  clearAll(): void {
    this.pools.forEach(pool => pool.clear())
  }

  /**
   * 销毁所有对象池
   */
  destroyAll(): void {
    this.pools.forEach(pool => pool.destroy())
    this.pools.clear()
  }
}

/**
 * 全局对象池管理器实例
 */
export const globalPoolManager = new ObjectPoolManager()

