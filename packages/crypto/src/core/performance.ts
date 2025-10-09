import type {
  DecryptResult,
  EncryptionAlgorithm,
  EncryptResult,
} from '../types'
import { LRUCache } from '../utils/lru-cache'
import CryptoJS from 'crypto-js'

/**
 * 批量操作接口
 */
export interface BatchOperation {
  id: string
  data: string
  key: string
  algorithm: EncryptionAlgorithm
  options?: any
}

/**
 * 批量操作结果
 */
export interface BatchResult<T> {
  id: string
  result: T
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

  constructor(config: PerformanceOptimizerConfig = {}) {
    const {
      maxCacheSize = 1000,
      cacheTTL = 5 * 60 * 1000, // 默认 5 分钟过期
      enableCache = true,
      maxOperationTimes = 1000,
      autoCleanupInterval = 60 * 1000, // 默认 1 分钟清理一次
      memoryThreshold = 50 * 1024 * 1024, // 默认 50MB
    } = config

    this.enableCache = enableCache
    this.maxOperationTimes = maxOperationTimes
    this.autoCleanupInterval = autoCleanupInterval
    this.memoryThreshold = memoryThreshold

    // 使用 LRU 缓存
    this.resultCache = new LRUCache({
      maxSize: maxCacheSize,
      ttl: cacheTTL,
      updateAgeOnGet: true,
    })

    // 启动自动清理
    if (this.autoCleanupInterval > 0) {
      this.startAutoCleanup()
    }
  }

  /**
   * 批量加密
   * 优化：使用 Promise.all 并行处理，移除未实现的 Worker 代码
   */
  async batchEncrypt(
    operations: BatchOperation[],
  ): Promise<BatchResult<EncryptResult>[]> {
    // 并行处理所有操作
    const promises = operations.map(async (operation) => {
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

    return Promise.all(promises)
  }

  /**
   * 批量解密
   * 优化：使用 Promise.all 并行处理，移除未实现的 Worker 代码
   */
  async batchDecrypt(
    operations: BatchOperation[],
  ): Promise<BatchResult<DecryptResult>[]> {
    // 并行处理所有操作
    const promises = operations.map(async (operation) => {
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

    return Promise.all(promises)
  }

  /**
   * 执行加密操作
   */
  private performEncryption(operation: BatchOperation): EncryptResult {
    const startTime = performance.now()

    try {
      // 这里应该由外部传入具体的加密实现
      // 为了避免循环依赖，暂时返回模拟结果
      const result: EncryptResult = {
        success: true,
        data: `encrypted_${operation.data}`,
        algorithm: operation.algorithm,
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
   */
  private performDecryption(operation: BatchOperation): DecryptResult {
    const startTime = performance.now()

    try {
      // 这里应该由外部传入具体的解密实现
      // 为了避免循环依赖，暂时返回模拟结果
      const result: DecryptResult = {
        success: true,
        data: operation.data.replace('encrypted_', ''),
        algorithm: operation.algorithm,
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
  destroy(): void {
    this.stopAutoCleanup()
    this.clearCache()
    this.operationTimes = []
  }
}
