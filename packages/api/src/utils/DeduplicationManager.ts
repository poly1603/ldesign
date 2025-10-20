/**
 * 去重管理器
 * 提供请求去重功能，避免重复的API调用
 */

import type { DeduplicationManager } from '../types'

/**
 * 去重项
 */
interface DeduplicationItem<T = unknown> {
  /** Promise 实例 */
  promise: Promise<T>
  /** 创建时间 */
  createdAt: number
  /** 引用计数 */
  refCount: number
}

/**
 * 去重管理器实现
 */
export class DeduplicationManagerImpl implements DeduplicationManager {
  /** 去重项映射 */
  private deduplicationItems = new Map<string, DeduplicationItem>()

  /** 清理定时器 */
  private cleanupTimer: ReturnType<typeof setInterval> | null = null

  constructor() {
    // 启动清理定时器
    this.startCleanupTimer()
  }

  /**
   * 执行去重函数
   */
  async execute<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // 检查是否已有相同的请求在进行中
    const existingItem = this.deduplicationItems.get(key)
    if (existingItem) {
      // 增加引用计数
      existingItem.refCount++
      return existingItem.promise as Promise<T>
    }

    // 检查是否超过最大限制
    if (this.deduplicationItems.size >= 500) {
      this.cleanupStale()
    }

    // 创建新的请求
    const promise = this.createDeduplicatedPromise(key, fn)

    // 保存去重项
    this.deduplicationItems.set(key, {
      promise,
      createdAt: Date.now(),
      refCount: 1,
    })

    return promise
  }

  /**
   * 清除去重缓存
   */
  clear(): void {
    this.deduplicationItems.clear()
  }

  /**
   * 清除指定键的去重缓存
   */
  clearKey(key: string): void {
    this.deduplicationItems.delete(key)
  }

  /**
   * 获取去重项数量
   */
  size(): number {
    return this.deduplicationItems.size
  }

  /**
   * 检查是否存在去重项
   */
  has(key: string): boolean {
    return this.deduplicationItems.has(key)
  }

  /**
   * 获取所有去重键
   */
  keys(): string[] {
    return Array.from(this.deduplicationItems.keys())
  }

  /**
   * 获取去重项信息
   */
  getInfo(
    key: string,
  ): { createdAt: number, refCount: number, age: number } | null {
    const item = this.deduplicationItems.get(key)
    if (!item) {
      return null
    }

    return {
      createdAt: item.createdAt,
      refCount: item.refCount,
      age: Date.now() - item.createdAt,
    }
  }

  /**
   * 获取所有去重项信息
   */
  getAllInfo(): Array<{
    key: string
    createdAt: number
    refCount: number
    age: number
  }> {
    const result: Array<{
      key: string
      createdAt: number
      refCount: number
      age: number
    }> = []

    this.deduplicationItems.forEach((item, key) => {
      result.push({
        key,
        createdAt: item.createdAt,
        refCount: item.refCount,
        age: Date.now() - item.createdAt,
      })
    })

    return result
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalItems: number
    totalRefCount: number
    averageRefCount: number
    oldestItemAge: number
  } {
    const items = Array.from(this.deduplicationItems.values())
    const now = Date.now()

    const totalItems = items.length
    const totalRefCount = items.reduce((sum, item) => sum + item.refCount, 0)
    const averageRefCount = totalItems > 0 ? totalRefCount / totalItems : 0
    const oldestItemAge
      = items.length > 0
        ? Math.max(...items.map(item => now - item.createdAt))
        : 0

    return {
      totalItems,
      totalRefCount,
      averageRefCount,
      oldestItemAge,
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clear()
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }

  /**
   * 创建去重的 Promise
   */
  private createDeduplicatedPromise<T>(
    key: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    return fn()
      .then((result) => {
        // 请求成功，清理去重项
        this.deduplicationItems.delete(key)
        return result
      })
      .catch((error) => {
        // 请求失败，清理去重项
        this.deduplicationItems.delete(key)
        throw error
      })
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    // 每分钟清理一次过期的去重项
    this.cleanupTimer = globalThis.setInterval(() => {
      this.cleanup()
    }, 60 * 1000)
  }

  /**
   * 清理过期的去重项
   */
  private cleanup(maxAge: number = 5 * 60 * 1000): void {
    const now = Date.now()
    const toDelete: string[] = []

    this.deduplicationItems.forEach((item, key) => {
      if (now - item.createdAt > maxAge) {
        toDelete.push(key)
      }
    })

    toDelete.forEach((key) => {
      this.deduplicationItems.delete(key)
    })
  }
  
  /**
   * 清理过早的去重项
   */
  private cleanupStale(): void {
    const items = Array.from(this.deduplicationItems.entries())
    
    // 按创建时间排序
    items.sort((a, b) => a[1].createdAt - b[1].createdAt)
    
    // 删除前20%的项
    const removeCount = Math.ceil(items.length * 0.2)
    for (let i = 0; i < removeCount; i++) {
      this.deduplicationItems.delete(items[i][0])
    }
  }
}

/**
 * 创建去重函数
 */
export function createDeduplicatedFunction<
  T extends (...args: unknown[]) => Promise<unknown>,
>(fn: T, keyGenerator?: (...args: Parameters<T>) => string): T {
  const manager = new DeduplicationManagerImpl()
  const defaultKeyGenerator = (...args: Parameters<T>) => JSON.stringify(args)

  return ((...args: Parameters<T>) => {
    const key = keyGenerator
      ? keyGenerator(...args)
      : defaultKeyGenerator(...args)
    return manager.execute(key, () => fn(...args))
  }) as T
}

/**
 * 去重装饰器
 */
export function deduplicate(keyGenerator?: (...args: unknown[]) => string) {
  return function <T extends (...args: unknown[]) => Promise<unknown>>(
    target: { constructor: { name: string } },
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>,
  ) {
    if (!descriptor.value) {
      return descriptor
    }

    const originalMethod = descriptor.value
    const manager = new DeduplicationManagerImpl()
    const defaultKeyGenerator = (...args: Parameters<T>) =>
      `${target.constructor.name}.${propertyKey}:${JSON.stringify(args)}`

    descriptor.value = function (this: unknown, ...args: Parameters<T>) {
      const key = keyGenerator
        ? keyGenerator(...args)
        : defaultKeyGenerator(...args)
      return manager.execute(key, () => (originalMethod as (...a: Parameters<T>) => Promise<unknown>).apply(this as never, args))
    } as T

    return descriptor
  }
}

/**
 * 基于类的去重装饰器
 */
export function classBasedDeduplicate<
  T extends (...args: unknown[]) => Promise<unknown>,
>(keyGenerator?: (...args: Parameters<T>) => string) {
  const manager = new DeduplicationManagerImpl()

  return function (
    target: unknown,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>,
  ) {
    if (!descriptor.value) {
      return descriptor
    }

    const originalMethod = descriptor.value
    const defaultKeyGenerator = (...args: Parameters<T>) =>
      `${propertyKey}:${JSON.stringify(args)}`

    descriptor.value = function (this: unknown, ...args: Parameters<T>) {
      const key = keyGenerator
        ? keyGenerator(...args)
        : defaultKeyGenerator(...args)
      return manager.execute(key, () => (originalMethod as (...a: Parameters<T>) => Promise<unknown>).apply(this as never, args))
    } as T

    return descriptor
  }
}

/**
 * 全局去重管理器实例
 */
export const globalDeduplicationManager = new DeduplicationManagerImpl()

/**
 * 使用全局去重管理器的便捷函数
 */
export function deduplicateGlobally<T>(
  key: string,
  fn: () => Promise<T>,
): Promise<T> {
  return globalDeduplicationManager.execute(key, fn)
}
