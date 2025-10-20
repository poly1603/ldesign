/**
 * Store 实例池
 * 用于管理和复用 Store 实例，减少内存分配
 */

import type { BaseStore } from './BaseStore'

export interface StorePoolOptions {
  maxSize?: number
  maxIdleTime?: number
  enableGC?: boolean
}

export class StorePool {
  private static instance: StorePool
  private pools = new Map<
    string,
    {
      instances: BaseStore[]
      lastUsed: Map<BaseStore, number>
    }
  >()

  private options: Required<StorePoolOptions> = {
    maxSize: 20, // 优化：降低最大池大小，减少内存占用
    maxIdleTime: 300000, // 5分钟
    enableGC: true,
  }

  private gcTimer?: NodeJS.Timeout

  private constructor(options?: StorePoolOptions) {
    if (options) {
      this.options = { ...this.options, ...options }
    }

    if (this.options.enableGC) {
      this.startGC()
    }
  }

  static getInstance(options?: StorePoolOptions): StorePool {
    if (!StorePool.instance) {
      StorePool.instance = new StorePool(options)
    }
    return StorePool.instance
  }

  /**
   * 获取 Store 实例（优化版：快速路径优化）
   */
  getStore<T extends BaseStore>(
    storeClass: new (id: string, ...args: any[]) => T,
    id: string,
    ...args: any[]
  ): T {
    const className = storeClass.name
    const pool = this.pools.get(className)

    // 快速路径：从池中获取实例
    if (pool) {
      const instances = pool.instances
      if (instances.length > 0) {
        const instance = instances.pop() as T
        pool.lastUsed.set(instance, Date.now())

        // 使用更安全的方式重新初始化实例
        // 调用内部的重置方法而不是直接修改私有属性
        if (typeof (instance as any)._reinitialize === 'function') {
          (instance as any)._reinitialize(id, ...args)
        } else {
          // 如果没有_reinitialize方法，调用$reset并重设状态
          instance.$reset()
        }

        return instance
      }
    }

    // 慢速路径：创建新实例
    const StoreClass = storeClass
    const instance = new StoreClass(id, ...args)
    this.trackInstance(className, instance)
    return instance
  }

  /**
   * 归还 Store 实例到池中
   */
  returnStore<T extends BaseStore>(instance: T): void {
    const className = instance.constructor.name
    let pool = this.pools.get(className)

    if (!pool) {
      pool = {
        instances: [],
        lastUsed: new Map(),
      }
      this.pools.set(className, pool)
    }

    // 检查池大小限制
    if (pool.instances.length >= this.options.maxSize) {
      // 池已满，销毁实例
      instance.$dispose()
      return
    }

    // 重置实例状态
    instance.$reset()

    // 归还到池中
    pool.instances.push(instance)
    pool.lastUsed.set(instance, Date.now())
  }

  /**
   * 跟踪实例
   */
  private trackInstance(className: string, instance: BaseStore): void {
    let pool = this.pools.get(className)
    if (!pool) {
      pool = {
        instances: [],
        lastUsed: new Map(),
      }
      this.pools.set(className, pool)
    }
    pool.lastUsed.set(instance, Date.now())
  }

  /**
   * 启动垃圾回收
   */
  private startGC(): void {
    this.gcTimer = setInterval(() => {
      this.collectGarbage()
    }, this.options.maxIdleTime / 2)
  }

  /**
   * 垃圾回收
   */
  private collectGarbage(): void {
    const now = Date.now()

    for (const [className, pool] of this.pools.entries()) {
      const instancesToRemove: BaseStore[] = []

      for (const [instance, lastUsed] of pool.lastUsed.entries()) {
        if (now - lastUsed > this.options.maxIdleTime) {
          instancesToRemove.push(instance)
        }
      }

      // 移除过期实例
      for (const instance of instancesToRemove) {
        const index = pool.instances.indexOf(instance)
        if (index !== -1) {
          pool.instances.splice(index, 1)
        }
        pool.lastUsed.delete(instance)
        instance.$dispose()
      }

      // 如果池为空，移除池
      if (pool.instances.length === 0 && pool.lastUsed.size === 0) {
        this.pools.delete(className)
      }
    }
  }

  /**
   * 获取池统计信息
   */
  getStats(): {
    totalPools: number
    totalInstances: number
    poolDetails: Array<{
      className: string
      poolSize: number
      activeInstances: number
    }>
  } {
    const poolDetails = Array.from(this.pools.entries()).map(
      ([className, pool]) => ({
        className,
        poolSize: pool.instances.length,
        activeInstances: pool.lastUsed.size - pool.instances.length,
      }),
    )

    return {
      totalPools: this.pools.size,
      totalInstances: poolDetails.reduce(
        (sum, detail) => sum + detail.poolSize + detail.activeInstances,
        0,
      ),
      poolDetails,
    }
  }

  /**
   * 清空所有池
   */
  clear(): void {
    for (const [, pool] of this.pools.entries()) {
      for (const instance of pool.instances) {
        instance.$dispose()
      }
      pool.instances.length = 0
      pool.lastUsed.clear()
    }
    this.pools.clear()
  }

  /**
   * 销毁池管理器
   */
  destroy(): void {
    if (this.gcTimer) {
      clearInterval(this.gcTimer)
      this.gcTimer = undefined
    }
    this.clear()
  }

  /**
   * 预热池
   */
  warmUp<T extends BaseStore>(
    storeClass: new (id: string, ...args: any[]) => T,
    count: number,
    ...args: any[]
  ): void {
    const className = storeClass.name
    let pool = this.pools.get(className)

    if (!pool) {
      pool = {
        instances: [],
        lastUsed: new Map(),
      }
      this.pools.set(className, pool)
    }

    for (let i = 0; i < count; i++) {
      const StoreClass = storeClass
      const instance = new StoreClass(`warmup-${i}`, ...args)
      pool.instances.push(instance)
      pool.lastUsed.set(instance, Date.now())
    }
  }

  /**
   * 设置池选项
   */
  setOptions(options: Partial<StorePoolOptions>): void {
    this.options = { ...this.options, ...options }

    if (options.enableGC !== undefined) {
      if (options.enableGC && !this.gcTimer) {
        this.startGC()
      }
      else if (!options.enableGC && this.gcTimer) {
        clearInterval(this.gcTimer)
        this.gcTimer = undefined
      }
    }
  }
}

/**
 * 获取默认的 Store 池实例
 */
export function useStorePool(options?: StorePoolOptions): StorePool {
  return StorePool.getInstance(options)
}

/**
 * Store 池装饰器
 * 自动管理 Store 实例的生命周期
 */
export function PooledStore(options?: StorePoolOptions) {
  return function <T extends new (...args: any[]) => BaseStore>(
    constructor: T,
  ) {
    const pool = StorePool.getInstance(options)

    return class extends constructor {
      constructor(...args: any[]) {
        super(...args)

        // 在实例销毁时自动归还到池中
        const originalDispose = this.$dispose.bind(this)
        this.$dispose = () => {
          originalDispose()
          pool.returnStore(this)
        }
      }
    } as T
  }
}
