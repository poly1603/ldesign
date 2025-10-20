/**
 * 对象池工具类 - 用于复用对象，减少内存分配和垃圾回收
 */

export interface PoolOptions<T> {
  maxSize?: number
  preAllocate?: number
  factory: () => T
  reset?: (obj: T) => void
  validate?: (obj: T) => boolean
}

/**
 * 通用对象池
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private readonly maxSize: number
  private readonly factory: () => T
  private readonly reset?: (obj: T) => void
  private readonly validate?: (obj: T) => boolean
  private totalCreated = 0
  private totalAcquired = 0
  private totalReleased = 0

  constructor(options: PoolOptions<T>) {
    this.maxSize = options.maxSize ?? 100
    this.factory = options.factory
    this.reset = options.reset
    this.validate = options.validate

    // 预分配对象
    const preAllocate = Math.min(options.preAllocate ?? 0, this.maxSize)
    for (let i = 0; i < preAllocate; i++) {
      this.pool.push(this.factory())
      this.totalCreated++
    }
  }

  /**
   * 获取对象
   */
  acquire(): T {
    this.totalAcquired++
    
    // 优先从池中获取
    while (this.pool.length > 0) {
      const obj = this.pool.pop()!
      if (!this.validate || this.validate(obj)) {
        return obj
      }
    }

    // 创建新对象
    this.totalCreated++
    return this.factory()
  }

  /**
   * 释放对象
   */
  release(obj: T): void {
    if (!obj) return
    
    this.totalReleased++
    
    // 验证对象是否有效
    if (this.validate && !this.validate(obj)) {
      return
    }

    // 检查池是否已满
    if (this.pool.length >= this.maxSize) {
      return
    }

    // 重置对象
    this.reset?.(obj)
    
    // 放回池中
    this.pool.push(obj)
  }

  /**
   * 批量释放对象
   */
  releaseMany(objects: T[]): void {
    for (const obj of objects) {
      this.release(obj)
    }
  }

  /**
   * 清空池
   */
  clear(): void {
    this.pool.length = 0
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      poolSize: this.pool.length,
      maxSize: this.maxSize,
      totalCreated: this.totalCreated,
      totalAcquired: this.totalAcquired,
      totalReleased: this.totalReleased,
      reuseRate: this.totalAcquired > 0 
        ? `${((this.totalAcquired - this.totalCreated) / this.totalAcquired * 100).toFixed(2)  }%`
        : '0%'
    }
  }

  /**
   * 缩减池大小
   */
  shrink(targetSize: number = Math.floor(this.maxSize / 2)): void {
    while (this.pool.length > targetSize) {
      this.pool.pop()
    }
  }
}

/**
 * 创建数组池
 */
export function createArrayPool<T>(maxSize = 50): ObjectPool<T[]> {
  return new ObjectPool<T[]>({
    maxSize,
    factory: () => [],
    reset: (arr) => { arr.length = 0 },
    validate: (arr) => Array.isArray(arr)
  })
}

/**
 * 创建对象池
 */
export function createObjectPool<T extends Record<string, any>>(
  factory: () => T,
  maxSize = 50
): ObjectPool<T> {
  return new ObjectPool({
    maxSize,
    factory,
    reset: (obj) => {
      for (const key in obj) {
        delete obj[key]
      }
    }
  })
}

/**
 * 创建 Map 池
 */
export function createMapPool<K, V>(maxSize = 50): ObjectPool<Map<K, V>> {
  return new ObjectPool({
    maxSize,
    factory: () => new Map<K, V>(),
    reset: (map) => map.clear(),
    validate: (map) => map instanceof Map
  })
}

/**
 * 创建 Set 池
 */
export function createSetPool<T>(maxSize = 50): ObjectPool<Set<T>> {
  return new ObjectPool({
    maxSize,
    factory: () => new Set<T>(),
    reset: (set) => set.clear(),
    validate: (set) => set instanceof Set
  })
}

/**
 * 全局池管理器
 */
class PoolManager {
  private pools = new Map<string, ObjectPool<any>>()

  register<T>(name: string, pool: ObjectPool<T>): void {
    this.pools.set(name, pool)
  }

  get<T>(name: string): ObjectPool<T> | undefined {
    return this.pools.get(name)
  }

  clearAll(): void {
    for (const pool of this.pools.values()) {
      pool.clear()
    }
  }

  getStats() {
    const stats: Record<string, any> = {}
    for (const [name, pool] of this.pools.entries()) {
      stats[name] = pool.getStats()
    }
    return stats
  }
}

export const poolManager = new PoolManager()