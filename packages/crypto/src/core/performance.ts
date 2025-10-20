import type {
  DecryptResult,
  EncryptionAlgorithm,
  EncryptResult,
} from '../types'
import CryptoJS from 'crypto-js'
import { LRUCache } from '../utils/lru-cache'

/**
 * 批量操作接口
 */
export interface BatchOperation {
  id: string
  data: string
  key: string
  algorithm: EncryptionAlgorithm
  options?: Record<string, unknown>
}

/**
 * 批量操作结果
 */
export interface BatchResult<T> {
  id: string
  result: T
}

/**
 * Worker Pool 接口
 */
interface WorkerPoolInterface {
  batchEncrypt: (operations: Array<{
    data: string
    key: string
    algorithm: string
    options?: Record<string, unknown>
  }>) => Promise<EncryptResult[]>
  batchDecrypt: (operations: Array<{
    data: string
    key: string
    algorithm: string
    options?: Record<string, unknown>
  }>) => Promise<DecryptResult[]>
  terminate: () => Promise<void>
  getStats: () => Record<string, unknown>
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  size: number
  maxSize: number
  hitRate: number
  totalRequests: number
  hits: number
  misses: number
  evictions: number
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  operationsPerSecond: number
  averageLatency: number
  memoryUsage: number
  cacheHitRate: number
  cacheSize: number
}

/**
 * 性能优化配置
 */
export interface PerformanceOptimizerConfig {
  /** 最大缓存数量 */
  maxCacheSize?: number
  /** 缓存过期时间（毫秒），0 表示永不过期 */
  cacheTTL?: number
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 最大操作时间记录数 */
  maxOperationTimes?: number
  /** 自动清理间隔（毫秒），0 表示禁用自动清理 */
  autoCleanupInterval?: number
  /** 内存使用阈值（字节），超过此值将触发清理 */
  memoryThreshold?: number
  /** 是否启用 Worker 并行处理 */
  enableWorker?: boolean
  /** Worker 线程池大小 */
  workerPoolSize?: number
  /** 批量操作最大并发数 */
  maxConcurrency?: number
}

/**
 * 性能优化工具类
 *
 * 提供高性能的缓存和批量操作支持
 * 优化点：
 * - 使用 LRU 缓存替代简单 Map
 * - 优化缓存键生成算法
 * - 移除未使用的内存池
 * - 添加缓存过期机制
 */
export class PerformanceOptimizer {
  private resultCache: LRUCache<string, EncryptResult | DecryptResult>
  private operationTimes: number[] = []
  private maxOperationTimes: number
  private enableCache: boolean
  private autoCleanupInterval: number
  private memoryThreshold: number
  private cleanupTimer?: NodeJS.Timeout | number
  private enableWorker: boolean
  private workerPool: WorkerPoolInterface | null
  private maxConcurrency: number

  constructor(config: PerformanceOptimizerConfig = {}) {
    const {
      maxCacheSize = 1000,
      cacheTTL = 5 * 60 * 1000, // 默认 5 分钟过期
      enableCache = true,
      maxOperationTimes = 1000,
      autoCleanupInterval = 60 * 1000, // 默认 1 分钟清理一次
      memoryThreshold = 50 * 1024 * 1024, // 默认 50MB
      enableWorker = false,
      // workerPoolSize, // 未使用，Worker池在Web平台中暂不支持
      maxConcurrency = 10, // 默认最大 10 个并发
    } = config

    this.enableCache = enableCache
    this.maxOperationTimes = maxOperationTimes
    this.autoCleanupInterval = autoCleanupInterval
    this.memoryThreshold = memoryThreshold
    this.enableWorker = enableWorker
    this.workerPool = null
    this.maxConcurrency = maxConcurrency

    // 使用 LRU 缓存
    this.resultCache = new LRUCache({
      maxSize: maxCacheSize,
      ttl: cacheTTL,
      updateAgeOnGet: true,
    })

    // Worker池在Web平台中需要特殊处理
    if (this.enableWorker) {
      // 暂时禁用Worker池，需要配置打包工具
      console.warn('Worker pool is not available in browser environment')
      this.enableWorker = false
    }

    // 启动自动清理
    if (this.autoCleanupInterval > 0) {
      this.startAutoCleanup()
    }
  }

  /**
   * 批量加密
   * 优化：支持 Worker 并行处理或主线程并行处理
   */
  async batchEncrypt(
    operations: BatchOperation[],
  ): Promise<BatchResult<EncryptResult>[]> {
    // 如果启用 Worker 且 Worker 池可用
    if (this.enableWorker && this.workerPool) {
      try {
        // 使用 Worker 池批量加密
        const workerOps = operations.map(op => ({
          data: op.data,
          key: op.key,
          algorithm: op.algorithm,
          options: op.options,
        }))
        
        const results = await this.workerPool.batchEncrypt(workerOps)
        
        return operations.map((op, index) => ({
          id: op.id,
          result: results[index],
        }))
      } catch (error) {
        console.warn('Worker batch encrypt failed, falling back to main thread:', error)
        // 失败时降级到主线程处理
      }
    }

    // 主线程并发控制处理
    const tasks = operations.map(operation => async () => {
      const cacheKey = this.generateCacheKey('encrypt', operation)
      let result = this.getFromCache(cacheKey) as EncryptResult | undefined

      if (!result) {
        result = await this.performEncryption(operation)
        this.setCache(cacheKey, result)
      }

      return {
        id: operation.id,
        result,
      }
    })

    return this.runWithConcurrencyControl(tasks)
  }

  /**
   * 批量解密
   * 优化：支持 Worker 并行处理或主线程并行处理
   */
  async batchDecrypt(
    operations: BatchOperation[],
  ): Promise<BatchResult<DecryptResult>[]> {
    // 如果启用 Worker 且 Worker 池可用
    if (this.enableWorker && this.workerPool) {
      try {
        // 使用 Worker 池批量解密
        const workerOps = operations.map(op => ({
          data: op.data,
          key: op.key,
          algorithm: op.algorithm,
          options: op.options,
        }))
        
        const results = await this.workerPool.batchDecrypt(workerOps)
        
        return operations.map((op, index) => ({
          id: op.id,
          result: results[index],
        }))
      } catch (error) {
        console.warn('Worker batch decrypt failed, falling back to main thread:', error)
        // 失败时降级到主线程处理
      }
    }

    // 主线程并发控制处理
    const tasks = operations.map(operation => async () => {
      const cacheKey = this.generateCacheKey('decrypt', operation)
      let result = this.getFromCache(cacheKey) as DecryptResult | undefined

      if (!result) {
        result = await this.performDecryption(operation)
        this.setCache(cacheKey, result)
      }

      return {
        id: operation.id,
        result,
      }
    })

    return this.runWithConcurrencyControl(tasks)
  }

  /**
   * 并发控制执行任务
   * 优化：限制同时执行的任务数量，避免资源耗尽
   * 优化：使用 Array.from 预分配结果数组，减少动态扩容
   * @param tasks 任务数组
   * @returns Promise 结果数组
   */
  private async runWithConcurrencyControl<T>(tasks: (() => Promise<T>)[]): Promise<T[]> {
    const results: T[] = Array.from({length: tasks.length})
    const executing: Set<Promise<void>> = new Set()

    for (let index = 0; index < tasks.length; index++) {
      const task = tasks[index]

      // 创建任务执行 Promise
      const promise = Promise.resolve().then(async () => {
        results[index] = await task()
      })

      // 任务完成后从执行集合中移除
      const cleanup = promise.finally(() => {
        executing.delete(cleanup)
      })

      executing.add(cleanup)

      // 当达到最大并发数时，等待任意一个任务完成
      if (executing.size >= this.maxConcurrency) {
        await Promise.race(executing)
      }
    }

    // 等待所有剩余任务完成
    await Promise.all(executing)

    return results
  }

  /**
   * 执行加密操作
   * 优化：使用真实的加密实现
   */
  private async performEncryption(operation: BatchOperation): Promise<EncryptResult> {
    const startTime = performance.now()

    try {
      // 动态导入算法实现，避免循环依赖
      let result: EncryptResult
      
      switch (operation.algorithm.toUpperCase()) {
        case 'AES': {
          // 使用动态导入避免循环依赖
          const { aes } = await import('../algorithms')
          result = aes.encrypt(operation.data, operation.key, operation.options)
          break
        }
        case 'RSA': {
          const { rsa } = await import('../algorithms')
          result = rsa.encrypt(operation.data, operation.key, operation.options)
          break
        }
        case 'DES': {
          const { des } = await import('../algorithms')
          result = des.encrypt(operation.data, operation.key, operation.options)
          break
        }
        case '3DES': {
          const { des3 } = await import('../algorithms')
          result = des3.encrypt(operation.data, operation.key, operation.options)
          break
        }
        case 'BLOWFISH': {
          const { blowfish } = await import('../algorithms')
          result = blowfish.encrypt(operation.data, operation.key, operation.options)
          break
        }
        default:
          result = {
            success: false,
            data: '',
            algorithm: operation.algorithm,
            error: `Unsupported algorithm: ${operation.algorithm}`,
          }
      }

      const endTime = performance.now()
      this.recordOperationTime(endTime - startTime)

      return result
    } catch (error) {
      const endTime = performance.now()
      this.recordOperationTime(endTime - startTime)

      return {
        success: false,
        data: '',
        algorithm: operation.algorithm,
        error:
          error instanceof Error ? error.message : 'Unknown encryption error',
      }
    }
  }

  /**
   * 执行解密操作
   * 优化：使用真实的解密实现
   */
  private async performDecryption(operation: BatchOperation): Promise<DecryptResult> {
    const startTime = performance.now()

    try {
      // 动态导入算法实现，避免循环依赖
      let result: DecryptResult
      
      switch (operation.algorithm.toUpperCase()) {
        case 'AES': {
          const { aes } = await import('../algorithms')
          result = aes.decrypt(operation.data, operation.key, operation.options)
          break
        }
        case 'RSA': {
          const { rsa } = await import('../algorithms')
          result = rsa.decrypt(operation.data, operation.key, operation.options)
          break
        }
        case 'DES': {
          const { des } = await import('../algorithms')
          result = des.decrypt(operation.data, operation.key, operation.options)
          break
        }
        case '3DES': {
          const { des3 } = await import('../algorithms')
          result = des3.decrypt(operation.data, operation.key, operation.options)
          break
        }
        case 'BLOWFISH': {
          const { blowfish } = await import('../algorithms')
          result = blowfish.decrypt(operation.data, operation.key, operation.options)
          break
        }
        default:
          result = {
            success: false,
            data: '',
            algorithm: operation.algorithm,
            error: `Unsupported algorithm: ${operation.algorithm}`,
          }
      }

      const endTime = performance.now()
      this.recordOperationTime(endTime - startTime)

      return result
    } catch (error) {
      const endTime = performance.now()
      this.recordOperationTime(endTime - startTime)

      return {
        success: false,
        data: '',
        algorithm: operation.algorithm,
        error:
          error instanceof Error ? error.message : 'Unknown decryption error',
      }
    }
  }

  /**
   * 记录操作时间
   */
  private recordOperationTime(time: number): void {
    this.operationTimes.push(time)

    // 保持最近 N 次操作的记录
    if (this.operationTimes.length > this.maxOperationTimes) {
      this.operationTimes.shift()
    }
  }

  /**
   * 生成缓存键
   * 优化：使用哈希算法生成固定长度的键，避免冲突和内存浪费
   */
  private generateCacheKey(operation: string, data: BatchOperation): string {
    // 构建原始键
    const rawKey = `${operation}:${data.algorithm}:${data.key}:${data.data}:${JSON.stringify(data.options || {})}`

    // 使用 MD5 生成固定长度的哈希键
    const hash = CryptoJS.MD5(rawKey).toString()
    return hash
  }

  /**
   * 从缓存获取结果
   */
  private getFromCache(key: string): EncryptResult | DecryptResult | undefined {
    if (!this.enableCache) {
      return undefined
    }
    return this.resultCache.get(key)
  }

  /**
   * 设置缓存
   */
  private setCache(key: string, value: EncryptResult | DecryptResult): void {
    if (!this.enableCache) {
      return
    }
    this.resultCache.set(key, value)
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.resultCache.clear()
  }

  /**
   * 清理过期缓存
   */
  cleanupCache(): number {
    return this.resultCache.cleanup()
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): CacheStats {
    return this.resultCache.getStats()
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const avgLatency
      = this.operationTimes.length > 0
        ? this.operationTimes.reduce((sum, time) => sum + time, 0)
        / this.operationTimes.length
        : 0

    const opsPerSecond = avgLatency > 0 ? 1000 / avgLatency : 0
    const stats = this.resultCache.getStats()

    return {
      operationsPerSecond: opsPerSecond,
      averageLatency: avgLatency,
      memoryUsage: this.getMemoryUsage(),
      cacheHitRate: stats.hitRate,
      cacheSize: stats.size,
    }
  }

  /**
   * 获取内存使用情况
   * 优化：更准确的内存估算
   */
  private getMemoryUsage(): number {
    // eslint-disable-next-line node/prefer-global/process
    if (typeof process !== 'undefined' && process.memoryUsage) {
      // eslint-disable-next-line node/prefer-global/process
      return process.memoryUsage().heapUsed
    }

    // 浏览器环境的估算
    // 每个缓存项约 1KB（包括键和值）
    return this.resultCache.size * 1024
  }

  /**
   * 重置性能统计
   */
  resetStats(): void {
    this.resultCache.resetStats()
    this.operationTimes = []
  }

  /**
   * 启动自动清理
   */
  private startAutoCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.performCleanup()
    }, this.autoCleanupInterval)
  }

  /**
   * 停止自动清理
   */
  stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer as number)
      this.cleanupTimer = undefined
    }
  }

  /**
   * 执行清理
   */
  private performCleanup(): void {
    // 清理过期的缓存项
    this.resultCache.cleanup()

    // 检查内存使用
    const memoryUsage = this.getMemoryUsage()

    // 如果内存使用超过阈值，清理一半的缓存
    if (memoryUsage > this.memoryThreshold) {
      const stats = this.resultCache.getStats()
      const targetSize = Math.floor(stats.size / 2)
      const keys = this.resultCache.keys()

      // 删除最旧的一半缓存
      for (let i = 0; i < keys.length - targetSize; i++) {
        this.resultCache.delete(keys[i])
      }
    }
  }

  /**
   * 销毁优化器
   */
  async destroy(): Promise<void> {
    this.stopAutoCleanup()
    this.clearCache()
    this.operationTimes = []
    
    // 销毁 Worker 池
    if (this.workerPool) {
      try {
        await this.workerPool.terminate()
        this.workerPool = null
      } catch (error) {
        console.warn('Failed to terminate worker pool:', error)
      }
    }
  }

  /**
   * 获取 Worker 池统计信息
   */
  getWorkerStats(): Record<string, unknown> | null {
    if (this.workerPool) {
      return this.workerPool.getStats()
    }
    return null
  }
}
