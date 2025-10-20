/**
 * Object Pool
 * 
 * 对象池实现，用于减少频繁对象创建的 GC 压力
 * 
 * 特性：
 * - 自动对象回收和复用
 * - 配置化的池大小
 * - 统计信息监控
 * - 线程安全（单线程优化）
 * 
 * @example
 * ```ts
 * import { EncryptResultPool } from '@ldesign/crypto'
 * 
 * const pool = new EncryptResultPool({ maxSize: 100 })
 * const result = pool.acquire()
 * // 使用 result
 * pool.release(result)
 * ```
 */

import type { DecryptResult, EncryptResult } from '../types'

/**
 * 对象池配置
 */
export interface ObjectPoolOptions {
  /** 最大池大小 */
  maxSize?: number
  /** 是否启用统计 */
  enableStats?: boolean
  /** 对象创建工厂函数 */
  factory?: () => unknown
  /** 对象重置函数 */
  reset?: (obj: unknown) => void
}

/**
 * 对象池统计信息
 */
export interface ObjectPoolStats {
  /** 当前池大小 */
  size: number
  /** 最大池大小 */
  maxSize: number
  /** 获取次数 */
  acquires: number
  /** 释放次数 */
  releases: number
  /** 命中次数（从池中获取） */
  hits: number
  /** 未命中次数（新创建） */
  misses: number
  /** 命中率 */
  hitRate: number
  /** 丢弃次数（池满时） */
  discards: number
}

/**
 * 通用对象池
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private readonly maxSize: number
  private readonly enableStats: boolean
  private readonly factory: () => T
  private readonly resetFn: (obj: T) => void

  // 统计信息
  private acquires = 0
  private releases = 0
  private hits = 0
  private misses = 0
  private discards = 0

  constructor(options: ObjectPoolOptions & { factory: () => T, reset: (obj: T) => void }) {
    this.maxSize = options.maxSize ?? 100
    this.enableStats = options.enableStats ?? true
    this.factory = options.factory
    this.resetFn = options.reset
  }

  /**
   * 从池中获取对象
   */
  acquire(): T {
    if (this.enableStats) {
      this.acquires++
    }

    const obj = this.pool.pop()
    
    if (obj) {
      if (this.enableStats) {
        this.hits++
      }
      return obj
    }

    if (this.enableStats) {
      this.misses++
    }
    return this.factory()
  }

  /**
   * 释放对象回池
   */
  release(obj: T): void {
    if (this.enableStats) {
      this.releases++
    }

    // 重置对象状态
    this.resetFn(obj)

    // 如果池未满，放入池中
    if (this.pool.length < this.maxSize) {
      this.pool.push(obj)
    } else {
      if (this.enableStats) {
        this.discards++
      }
      // 池已满，让对象被 GC 回收
    }
  }

  /**
   * 清空池
   */
  clear(): void {
    this.pool = []
  }

  /**
   * 获取统计信息
   */
  getStats(): ObjectPoolStats {
    const totalRequests = this.hits + this.misses
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0

    return {
      size: this.pool.length,
      maxSize: this.maxSize,
      acquires: this.acquires,
      releases: this.releases,
      hits: this.hits,
      misses: this.misses,
      hitRate,
      discards: this.discards,
    }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.acquires = 0
    this.releases = 0
    this.hits = 0
    this.misses = 0
    this.discards = 0
  }

  /**
   * 获取当前池大小
   */
  get size(): number {
    return this.pool.length
  }

  /**
   * 预热池（预先创建对象）
   */
  prewarm(count: number): void {
    const createCount = Math.min(count, this.maxSize - this.pool.length)
    for (let i = 0; i < createCount; i++) {
      this.pool.push(this.factory())
    }
  }
}

/**
 * EncryptResult 对象池
 */
export class EncryptResultPool extends ObjectPool<EncryptResult> {
  constructor(options: Omit<ObjectPoolOptions, 'factory' | 'reset'> = {}) {
    const factoryFn = (): EncryptResult => ({
      success: false,
      data: '',
      algorithm: '',
    })
    
    const resetFn = (obj: EncryptResult): void => {
      obj.success = false
      obj.data = ''
      obj.algorithm = ''
      obj.mode = undefined
      obj.keySize = undefined
      obj.iv = undefined
      obj.error = undefined
    }
    
    super({
      ...options,
      factory: factoryFn,
      reset: resetFn,
    } as ObjectPoolOptions & { factory: () => EncryptResult, reset: (obj: EncryptResult) => void })
  }

  /**
   * 创建成功的加密结果
   */
  createSuccess(data: string, algorithm: string, extras?: Partial<EncryptResult>): EncryptResult {
    const result = this.acquire()
    result.success = true
    result.data = data
    result.algorithm = algorithm
    
    if (extras) {
      if (extras.mode !== undefined) result.mode = extras.mode
      if (extras.keySize !== undefined) result.keySize = extras.keySize
      if (extras.iv !== undefined) result.iv = extras.iv
    }
    
    return result
  }

  /**
   * 创建失败的加密结果
   */
  createFailure(algorithm: string, error: string): EncryptResult {
    const result = this.acquire()
    result.success = false
    result.data = ''
    result.algorithm = algorithm
    result.error = error
    return result
  }
}

/**
 * DecryptResult 对象池
 */
export class DecryptResultPool extends ObjectPool<DecryptResult> {
  constructor(options: Omit<ObjectPoolOptions, 'factory' | 'reset'> = {}) {
    const factoryFn = (): DecryptResult => ({
      success: false,
      data: '',
      algorithm: '',
    })
    
    const resetFn = (obj: DecryptResult): void => {
      obj.success = false
      obj.data = ''
      obj.algorithm = ''
      obj.mode = undefined
      obj.error = undefined
    }
    
    super({
      ...options,
      factory: factoryFn,
      reset: resetFn,
    } as ObjectPoolOptions & { factory: () => DecryptResult, reset: (obj: DecryptResult) => void })
  }

  /**
   * 创建成功的解密结果
   */
  createSuccess(data: string, algorithm: string, mode?: string): DecryptResult {
    const result = this.acquire()
    result.success = true
    result.data = data
    result.algorithm = algorithm
    if (mode) result.mode = mode
    return result
  }

  /**
   * 创建失败的解密结果
   */
  createFailure(algorithm: string, error: string, mode?: string): DecryptResult {
    const result = this.acquire()
    result.success = false
    result.data = ''
    result.algorithm = algorithm
    result.error = error
    if (mode) result.mode = mode
    return result
  }
}

/**
 * 全局对象池实例
 */
export const globalEncryptResultPool = new EncryptResultPool({ maxSize: 200 })
export const globalDecryptResultPool = new DecryptResultPool({ maxSize: 200 })

/**
 * 便捷函数：获取加密结果对象
 */
export function acquireEncryptResult(): EncryptResult {
  return globalEncryptResultPool.acquire()
}

/**
 * 便捷函数：释放加密结果对象
 */
export function releaseEncryptResult(result: EncryptResult): void {
  globalEncryptResultPool.release(result)
}

/**
 * 便捷函数：获取解密结果对象
 */
export function acquireDecryptResult(): DecryptResult {
  return globalDecryptResultPool.acquire()
}

/**
 * 便捷函数：释放解密结果对象
 */
export function releaseDecryptResult(result: DecryptResult): void {
  globalDecryptResultPool.release(result)
}

/**
 * 便捷函数：创建成功的加密结果
 */
export function createEncryptSuccess(
  data: string,
  algorithm: string,
  extras?: Partial<EncryptResult>,
): EncryptResult {
  return globalEncryptResultPool.createSuccess(data, algorithm, extras)
}

/**
 * 便捷函数：创建失败的加密结果
 */
export function createEncryptFailure(algorithm: string, error: string): EncryptResult {
  return globalEncryptResultPool.createFailure(algorithm, error)
}

/**
 * 便捷函数：创建成功的解密结果
 */
export function createDecryptSuccess(
  data: string,
  algorithm: string,
  mode?: string,
): DecryptResult {
  return globalDecryptResultPool.createSuccess(data, algorithm, mode)
}

/**
 * 便捷函数：创建失败的解密结果
 */
export function createDecryptFailure(
  algorithm: string,
  error: string,
  mode?: string,
): DecryptResult {
  return globalDecryptResultPool.createFailure(algorithm, error, mode)
}

/**
 * 获取所有池的统计信息
 */
export function getAllPoolStats(): {
  encryptResults: ObjectPoolStats
  decryptResults: ObjectPoolStats
} {
  return {
    encryptResults: globalEncryptResultPool.getStats(),
    decryptResults: globalDecryptResultPool.getStats(),
  }
}

/**
 * 清空所有池
 */
export function clearAllPools(): void {
  globalEncryptResultPool.clear()
  globalDecryptResultPool.clear()
}
