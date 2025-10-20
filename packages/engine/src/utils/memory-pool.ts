/**
 * 内存池管理系统
 * 通过对象池技术减少内存分配和垃圾回收压力
 */

export interface PoolableObject {
  reset?: () => void
}

export class ObjectPool<T extends PoolableObject> {
  private pool: T[] = []
  private inUse = new WeakSet<T>()
  private created = 0
  private maxCreated: number
  private lastCleanup = Date.now()
  private readonly CLEANUP_INTERVAL = 60000 // 1 minute
  
  constructor(
    private factory: () => T,
    private options: {
      maxSize?: number
      preAllocate?: number
      resetOnRelease?: boolean
      maxCreated?: number  // Maximum objects ever created
    } = {}
  ) {
    const { preAllocate = 0, maxCreated = 10000 } = options
    this.maxCreated = maxCreated
    
    // 预分配对象
    const allocateCount = Math.min(preAllocate, this.maxCreated)
    for (let i = 0; i < allocateCount; i++) {
      this.pool.push(this.createObject())
    }
  }

  /**
   * 从池中获取对象
   */
  acquire(): T | null {
    // Periodic cleanup
    this.maybeCleanup()
    
    let obj = this.pool.pop()
    
    if (!obj) {
      // Check if we've hit the creation limit
      if (this.created >= this.maxCreated) {
        console.warn(`ObjectPool: Hit max created limit (${this.maxCreated})`)
        return null
      }
      obj = this.createObject()
    }
    
    this.inUse.add(obj)
    return obj
  }

  /**
   * 释放对象回池
   */
  release(obj: T): void {
    if (!this.inUse.has(obj)) {
      return // 对象不是从这个池中获取的
    }
    
    this.inUse.delete(obj)
    
    // 重置对象状态
    if (this.options.resetOnRelease !== false && obj.reset) {
      obj.reset()
    }
    
    // 检查池大小限制
    const maxSize = this.options.maxSize || 1000
    if (this.pool.length < maxSize) {
      this.pool.push(obj)
    }
  }

  /**
   * 批量释放对象
   */
  releaseAll(objects: T[]): void {
    for (const obj of objects) {
      this.release(obj)
    }
  }

  /**
   * 清空池
   */
  clear(): void {
    // Reset all pooled objects if they have reset method
    for (const obj of this.pool) {
      if (obj.reset) {
        obj.reset()
      }
    }
    this.pool.length = 0
    this.created = 0
    // WeakSet 会自动清理
  }
  
  /**
   * Perform periodic cleanup
   */
  private maybeCleanup(): void {
    const now = Date.now()
    if (now - this.lastCleanup > this.CLEANUP_INTERVAL) {
      this.lastCleanup = now
      // Trim pool if it's too large
      const maxSize = this.options.maxSize || 1000
      if (this.pool.length > maxSize) {
        const toRemove = this.pool.length - maxSize
        this.pool.splice(0, toRemove)
      }
    }
  }

  /**
   * 获取池统计信息
   */
  getStats(): {
    poolSize: number
    created: number
    available: number
  } {
    return {
      poolSize: this.pool.length,
      created: this.created,
      available: this.pool.length
    }
  }

  private createObject(): T {
    if (this.created >= this.maxCreated) {
      throw new Error(`Cannot create more objects, limit reached: ${this.maxCreated}`)
    }
    this.created++
    return this.factory()
  }
}

/**
 * 通用内存池管理器
 */
export class MemoryPoolManager {
  private pools = new Map<string, ObjectPool<any>>()
  private readonly MAX_POOLS = 100  // Limit number of pools

  /**
   * 注册新的对象池
   */
  registerPool<T extends PoolableObject>(
    name: string,
    factory: () => T,
    options?: {
      maxSize?: number
      preAllocate?: number
      resetOnRelease?: boolean
      maxCreated?: number
    }
  ): ObjectPool<T> {
    if (this.pools.has(name)) {
      throw new Error(`Pool "${name}" already exists`)
    }
    
    if (this.pools.size >= this.MAX_POOLS) {
      console.warn(`MemoryPoolManager: Reached max pools limit (${this.MAX_POOLS})`)
      // Remove oldest pool
      const firstKey = this.pools.keys().next().value
      if (firstKey) {
        this.pools.get(firstKey)?.clear()
        this.pools.delete(firstKey)
      }
    }
    
    const pool = new ObjectPool(factory, options)
    this.pools.set(name, pool)
    return pool
  }

  /**
   * 获取对象池
   */
  getPool<T extends PoolableObject>(name: string): ObjectPool<T> | undefined {
    return this.pools.get(name)
  }

  /**
   * 获取所有池的统计信息
   */
  getAllStats(): Record<string, {
    poolSize: number
    created: number
    available: number
  }> {
    const stats: Record<string, any> = {}
    
    for (const [name, pool] of this.pools) {
      stats[name] = pool.getStats()
    }
    
    return stats
  }

  /**
   * 清理所有池
   */
  clearAll(): void {
    for (const pool of this.pools.values()) {
      pool.clear()
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clearAll()
    this.pools.clear()
  }
}

/**
 * 数组池 - 专门用于数组的内存池
 */
export class ArrayPool<T> {
  private pools = new Map<number, T[][]>()
  private readonly MAX_ARRAY_SIZE = 10000  // Maximum array size to pool
  private readonly MAX_POOLS_PER_SIZE = 100  // Max arrays per size

  /**
   * 获取指定大小的数组
   */
  acquire(size: number): T[] {
    // Don't pool very large arrays
    if (size > this.MAX_ARRAY_SIZE) {
      return Array.from({ length: size }) as T[]
    }
    
    const pool = this.getPoolForSize(size)
    const array = pool.pop()
    
    if (array) {
      return array
    }
    
    return Array.from({ length: size }) as T[]
  }

  /**
   * 释放数组回池
   */
  release(array: T[]): void {
    const size = array.length
    
    // Don't pool very large arrays
    if (size > this.MAX_ARRAY_SIZE) {
      return
    }
    
    // 清空数组内容
    array.length = 0
    
    const pool = this.getPoolForSize(size)
    
    // 限制每个尺寸的池大小
    if (pool.length < this.MAX_POOLS_PER_SIZE) {
      pool.push(array)
    }
  }

  private getPoolForSize(size: number): T[][] {
    let pool = this.pools.get(size)
    
    if (!pool) {
      // Limit total number of size pools
      if (this.pools.size >= 50) {
        // Remove least recently used size pool
        const firstKey = this.pools.keys().next().value
        if (firstKey !== undefined) {
          this.pools.delete(firstKey)
        }
      }
      pool = []
      this.pools.set(size, pool)
    }
    
    return pool
  }

  /**
   * 清理所有数组池
   */
  clear(): void {
    this.pools.clear()
  }
}

/**
 * 字符串构建器池 - 优化字符串拼接
 */
export class StringBuilderPool {
  private pool: StringBuilder[] = []
  private maxPoolSize = 50

  acquire(): StringBuilder {
    const builder = this.pool.pop() || new StringBuilder()
    return builder
  }

  release(builder: StringBuilder): void {
    builder.clear()
    
    if (this.pool.length < this.maxPoolSize) {
      this.pool.push(builder)
    }
  }
}

export class StringBuilder implements PoolableObject {
  private parts: string[] = []
  private readonly MAX_PARTS = 1000  // Prevent unbounded growth

  append(str: string): this {
    if (this.parts.length >= this.MAX_PARTS) {
      // Consolidate when too many parts
      const consolidated = this.parts.join('')
      this.parts.length = 0
      this.parts.push(consolidated)
    }
    this.parts.push(str)
    return this
  }

  toString(): string {
    return this.parts.join('')
  }

  clear(): void {
    this.parts.length = 0
  }

  reset(): void {
    this.clear()
  }
}

// 全局内存池管理器实例
let globalMemoryPoolManager: MemoryPoolManager | undefined

export function getGlobalMemoryPoolManager(): MemoryPoolManager {
  if (!globalMemoryPoolManager) {
    globalMemoryPoolManager = new MemoryPoolManager()
    
    // 注册常用的对象池
    globalMemoryPoolManager.registerPool('event', () => ({
      type: '',
      data: null,
      reset() {
        this.type = ''
        this.data = null
      }
    }), {
      maxSize: 100,
      preAllocate: 10,
      resetOnRelease: true
    })
    
    globalMemoryPoolManager.registerPool('promise', () => ({
      resolve: null as any,
      reject: null as any,
      reset() {
        this.resolve = null
        this.reject = null
      }
    }), {
      maxSize: 50,
      preAllocate: 5,
      resetOnRelease: true
    })
  }
  
  return globalMemoryPoolManager
}

// 导出便捷函数
export const memoryPool = {
  acquire<T extends PoolableObject>(poolName: string): T | undefined {
    const manager = getGlobalMemoryPoolManager()
    const pool = manager.getPool<T>(poolName)
    const acquired = (pool ? pool.acquire() : undefined) as unknown as T | null | undefined
    return acquired === null ? undefined : acquired
  },
  
  release<T extends PoolableObject>(poolName: string, obj: T): void {
    const manager = getGlobalMemoryPoolManager()
    const pool = manager.getPool<T>(poolName)
    pool?.release(obj)
  },
  
  getStats(poolName?: string): any {
    const manager = getGlobalMemoryPoolManager()
    if (poolName) {
      const pool = manager.getPool(poolName)
      return pool?.getStats()
    }
    return manager.getAllStats()
  }
}

/**
 * 使用装饰器自动管理对象池
 */
export function Poolable(poolName: string) {
  return function (constructor: any) {
    const originalConstructor = constructor
    
    // 新的构造函数
    function newConstructor(...args: any[]) {
      const manager = getGlobalMemoryPoolManager()
      let pool = manager.getPool(poolName)
      
      if (!pool) {
        pool = manager.registerPool(poolName, () => new (originalConstructor as any)(...args), {
          maxSize: 100,
          resetOnRelease: true
        })
      }
      
      return pool.acquire()
    }
    
    // 复制原型
    newConstructor.prototype = originalConstructor.prototype
    
    // 添加释放方法
    newConstructor.prototype.release = function() {
      const manager = getGlobalMemoryPoolManager()
      const pool = manager.getPool(poolName)
      pool?.release(this)
    }
    
    return newConstructor as any
  }
}