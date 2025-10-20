/**
 * 防抖管理器
 * 提供防抖功能，避免频繁的API调用
 */

import type { DebounceManager } from '../types'

/**
 * 防抖项
 */
interface DebounceItem {
  /** 定时器ID */
  timerId: ReturnType<typeof setTimeout>
  /** Promise resolve 函数 */
  resolve: (value: unknown) => void
  /** Promise reject 函数 */
  reject: (reason: unknown) => void
  /** 执行函数 */
  fn: () => Promise<unknown>
  /** 创建时间 */
  createdAt: number
}

/**
 * 防抖管理器实现
 */
export class DebounceManagerImpl implements DebounceManager {
  /** 防抖项映射 */
  private debounceItems = new Map<string, DebounceItem>()
  
  /** 最大防抖项数量 */
  private readonly maxItems = 1000
  
  /** 自动清理定时器 */
  private cleanupTimer: ReturnType<typeof setInterval> | null = null
  
  constructor() {
    // 启动自动清理，每分60秒清理一次过期项
    this.startAutoCleanup()
  }

  /**
   * 执行防抖函数
   */
  async execute<T>(
    key: string,
    fn: () => Promise<T>,
    delay: number,
  ): Promise<T> {
    // 检查是否超过最大限制
    if (this.debounceItems.size >= this.maxItems) {
      // 清理最早的项
      this.cleanupOldest()
    }
    
    return new Promise<T>((resolve, reject) => {
      // 取消之前的防抖
      this.cancel(key)

      // 创建新的防抖项
      const timerId = globalThis.setTimeout(async () => {
        try {
          const result = await fn()
          resolve(result)
        }
        catch (error) {
          reject(error)
        }
        finally {
          // 清理防抖项
          this.debounceItems.delete(key)
        }
      }, delay)

      // 保存防抖项
      this.debounceItems.set(key, {
        timerId,
        resolve: resolve as unknown as (value: unknown) => void,
        reject: reject as unknown as (reason: unknown) => void,
        fn: fn as () => Promise<unknown>,
        createdAt: Date.now(),
      })
    })
  }

  /**
   * 取消防抖
   */
  cancel(key: string): void {
    const item = this.debounceItems.get(key)
    if (item) {
      clearTimeout(item.timerId)
      this.debounceItems.delete(key)
    }
  }

  /**
   * 清除所有防抖
   */
  clear(): void {
    this.debounceItems.forEach((item) => {
      clearTimeout(item.timerId)
    })
    this.debounceItems.clear()
  }

  /**
   * 获取防抖项数量
   */
  size(): number {
    return this.debounceItems.size
  }

  /**
   * 检查是否存在防抖项
   */
  has(key: string): boolean {
    return this.debounceItems.has(key)
  }

  /**
   * 获取所有防抖键
   */
  keys(): string[] {
    return Array.from(this.debounceItems.keys())
  }

  /**
   * 立即执行防抖函数（跳过延迟）
   */
  async flush<T>(key: string): Promise<T | undefined> {
    const item = this.debounceItems.get(key)
    if (!item) {
      return undefined
    }

    // 取消定时器
    clearTimeout(item.timerId)

    try {
      // 立即执行函数
      const result = (await item.fn()) as T
      item.resolve(result)
      return result
    }
    catch (error) {
      item.reject(error)
      throw error
    }
    finally {
      // 清理防抖项
      this.debounceItems.delete(key)
    }
  }

  /**
   * 立即执行所有防抖函数
   */
  async flushAll(): Promise<void> {
    const promises = Array.from(this.debounceItems.keys()).map(key =>
      this.flush(key).catch(() => {
        // 忽略错误，继续执行其他项
      }),
    )
    await Promise.all(promises)
  }

  /**
   * 获取防抖项信息
   */
  getInfo(key: string): { createdAt: number, delay: number } | null {
    const item = this.debounceItems.get(key)
    if (!item) {
      return null
    }

    return {
      createdAt: item.createdAt,
      delay: Date.now() - item.createdAt,
    }
  }

  /**
   * 获取所有防抖项信息
   */
  getAllInfo(): Array<{ key: string, createdAt: number, delay: number }> {
    const result: Array<{ key: string, createdAt: number, delay: number }> = []

    this.debounceItems.forEach((item, key) => {
      result.push({
        key,
        createdAt: item.createdAt,
        delay: Date.now() - item.createdAt,
      })
    })

    return result
  }

  /**
   * 清理过期的防抖项（超过指定时间未执行）
   */
  cleanup(maxAge: number = 60000): void {
    const now = Date.now()
    const toDelete: string[] = []

    this.debounceItems.forEach((item, key) => {
      if (now - item.createdAt > maxAge) {
        clearTimeout(item.timerId)
        item.reject(new Error('Debounce timeout'))
        toDelete.push(key)
      }
    })

    toDelete.forEach((key) => {
      this.debounceItems.delete(key)
    })
  }
  
  /**
   * 清理最早的防抖项
   */
  private cleanupOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()
    
    for (const [key, item] of this.debounceItems) {
      if (item.createdAt < oldestTime) {
        oldestTime = item.createdAt
        oldestKey = key
      }
    }
    
    if (oldestKey) {
      this.cancel(oldestKey)
    }
  }
  
  /**
   * 启动自动清理
   */
  private startAutoCleanup(): void {
    this.cleanupTimer = globalThis.setInterval(() => {
      this.cleanup()
    }, 60000) // 每分钟清理一次
  }
  
  /**
   * 销毁管理器
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.clear()
  }
}

/**
 * 创建防抖函数
 */
export function createDebounceFunction<
  T extends (...args: unknown[]) => Promise<unknown>,
>(fn: T, delay: number, key?: string): T {
  const manager = new DebounceManagerImpl()
  const debounceKey = key || 'default'

  return ((...args: Parameters<T>) => {
    return manager.execute(debounceKey, () => fn(...args), delay)
  }) as T
}

/**
 * 创建带键的防抖函数
 */
export function createKeyedDebounceFunction<
  T extends (...args: unknown[]) => Promise<unknown>,
>(fn: T, delay: number, keyGenerator: (...args: Parameters<T>) => string): T {
  const manager = new DebounceManagerImpl()

  return ((...args: Parameters<T>) => {
    const key = keyGenerator(...args)
    return manager.execute(key, () => fn(...args), delay)
  }) as T
}

/**
 * 防抖装饰器
 */
export function debounce(delay: number, key?: string) {
  return function <T extends (...args: unknown[]) => Promise<unknown>>(
    target: { constructor: { name: string } },
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>,
  ) {
    if (!descriptor.value) {
      return descriptor
    }

    const originalMethod = descriptor.value
    const manager = new DebounceManagerImpl()

    descriptor.value = function (this: unknown, ...args: Parameters<T>) {
      const debounceKey = key || `${target.constructor.name}.${propertyKey}`
      return manager.execute(
        debounceKey,
        () => (originalMethod as (...a: Parameters<T>) => Promise<unknown>).apply(this as never, args),
        delay,
      )
    } as T

    return descriptor
  }
}

/**
 * 带键的防抖装饰器
 */
export function keyedDebounce<T extends (...args: unknown[]) => Promise<unknown>>(
  delay: number,
  keyGenerator: (...args: Parameters<T>) => string,
) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>,
  ) {
    if (!descriptor.value) {
      return descriptor
    }

    const originalMethod = descriptor.value
    const manager = new DebounceManagerImpl()

    descriptor.value = function (this: unknown, ...args: Parameters<T>) {
      const key = keyGenerator(...args)
      return manager.execute(key, () => (originalMethod as (...a: Parameters<T>) => Promise<unknown>).apply(this as never, args), delay)
    } as T

    return descriptor
  }
}
