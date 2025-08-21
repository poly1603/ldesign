import type {
  DecryptResult,
  EncryptionAlgorithm,
  EncryptResult,
} from '../types'

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
  keyCache: number
  resultCache: number
  maxSize: number
  hitRate: number
  totalRequests: number
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  operationsPerSecond: number
  averageLatency: number
  memoryUsage: number
  cacheHitRate: number
}

/**
 * 内存池配置
 */
export interface MemoryPoolConfig {
  maxSize: number
  chunkSize: number
  preAllocate: boolean
}

/**
 * 性能优化工具类
 */
export class PerformanceOptimizer {
  private keyCache = new Map<string, EncryptResult | DecryptResult>()
  private resultCache = new Map<string, EncryptResult | DecryptResult>()
  private maxCacheSize = 1000

  // 性能统计
  private cacheHits = 0
  private cacheMisses = 0
  private totalRequests = 0
  private operationTimes: number[] = []

  // 内存池
  private memoryPool: ArrayBuffer[] = []
  private memoryPoolConfig: MemoryPoolConfig = {
    maxSize: 10,
    chunkSize: 1024 * 1024, // 1MB chunks
    preAllocate: true,
  }

  constructor() {
    if (this.memoryPoolConfig.preAllocate) {
      this.initializeMemoryPool()
    }
  }

  /**
   * 初始化内存池
   */
  private initializeMemoryPool(): void {
    for (let i = 0; i < this.memoryPoolConfig.maxSize; i++) {
      this.memoryPool.push(new ArrayBuffer(this.memoryPoolConfig.chunkSize))
    }
  }

  /**
   * 获取内存块
   */
  private getMemoryChunk(): ArrayBuffer | null {
    return this.memoryPool.pop() || null
  }

  /**
   * 释放内存块
   */
  private releaseMemoryChunk(buffer: ArrayBuffer): void {
    if (this.memoryPool.length < this.memoryPoolConfig.maxSize) {
      this.memoryPool.push(buffer)
    }
  }

  /**
   * 批量加密
   */
  async batchEncrypt(
    operations: BatchOperation[],
  ): Promise<BatchResult<EncryptResult>[]> {
    const results: BatchResult<EncryptResult>[] = []

    // 使用 Web Workers 进行并行处理（如果可用）
    if (typeof Worker !== 'undefined' && operations.length > 10) {
      return this.parallelEncrypt(operations)
    }

    // 串行处理小批量操作
    for (const operation of operations) {
      const cacheKey = this.generateCacheKey('encrypt', operation)
      let result = this.getFromCache(cacheKey)

      if (!result) {
        result = await this.performEncryption(operation)
        this.setCache(cacheKey, result)
      }

      results.push({
        id: operation.id,
        result,
      })
    }

    return results
  }

  /**
   * 批量解密
   */
  async batchDecrypt(
    operations: BatchOperation[],
  ): Promise<BatchResult<DecryptResult>[]> {
    const results: BatchResult<DecryptResult>[] = []

    // 使用 Web Workers 进行并行处理（如果可用）
    if (typeof Worker !== 'undefined' && operations.length > 10) {
      return this.parallelDecrypt(operations)
    }

    // 串行处理小批量操作
    for (const operation of operations) {
      const cacheKey = this.generateCacheKey('decrypt', operation)
      let result = this.getFromCache(cacheKey)

      if (!result) {
        result = await this.performDecryption(operation)
        this.setCache(cacheKey, result)
      }

      results.push({
        id: operation.id,
        result,
      })
    }

    return results
  }

  /**
   * 并行加密（使用 Web Workers）
   */
  private async parallelEncrypt(
    operations: BatchOperation[],
  ): Promise<BatchResult<EncryptResult>[]> {
    // 将操作分组，每个 Worker 处理一组
    const chunkSize = Math.ceil(
      operations.length / navigator.hardwareConcurrency || 4,
    )
    const chunks = this.chunkArray(operations, chunkSize)

    const promises = chunks.map(chunk =>
      this.processChunkWithWorker(chunk, 'encrypt'),
    )
    const results = await Promise.all(promises)

    return results.flat()
  }

  /**
   * 并行解密（使用 Web Workers）
   */
  private async parallelDecrypt(
    operations: BatchOperation[],
  ): Promise<BatchResult<DecryptResult>[]> {
    // 将操作分组，每个 Worker 处理一组
    const chunkSize = Math.ceil(
      operations.length / navigator.hardwareConcurrency || 4,
    )
    const chunks = this.chunkArray(operations, chunkSize)

    const promises = chunks.map(chunk =>
      this.processChunkWithWorker(chunk, 'decrypt'),
    )
    const results = await Promise.all(promises)

    return results.flat()
  }

  /**
   * 使用 Worker 处理数据块
   */
  private async processChunkWithWorker(
    chunk: BatchOperation[],
    operation: 'encrypt' | 'decrypt',
  ): Promise<BatchResult<any>[]> {
    return new Promise((resolve, _reject) => {
      // 在实际实现中，这里会创建和使用 Web Worker
      // 目前使用同步处理作为后备方案
      const results = chunk.map(op => ({
        id: op.id,
        result:
          operation === 'encrypt'
            ? this.performEncryption(op)
            : this.performDecryption(op),
      }))
      resolve(results)
    })
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
    }
    catch (error) {
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
    }
    catch (error) {
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

    // 保持最近1000次操作的记录
    if (this.operationTimes.length > 1000) {
      this.operationTimes.shift()
    }
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(operation: string, data: BatchOperation): string {
    return `${operation}_${data.algorithm}_${data.key}_${data.data}`.substring(
      0,
      100,
    )
  }

  /**
   * 从缓存获取结果
   */
  private getFromCache(key: string): EncryptResult | DecryptResult | undefined {
    this.totalRequests++

    const result = this.resultCache.get(key)
    if (result) {
      this.cacheHits++
      return result
    }
    else {
      this.cacheMisses++
      return undefined
    }
  }

  /**
   * 设置缓存
   */
  private setCache(key: string, value: EncryptResult | DecryptResult): void {
    if (this.resultCache.size >= this.maxCacheSize) {
      // 删除最旧的缓存项
      const firstKey = this.resultCache.keys().next().value
      if (firstKey) {
        this.resultCache.delete(firstKey)
      }
    }
    this.resultCache.set(key, value)
  }

  /**
   * 将数组分块
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.keyCache.clear()
    this.resultCache.clear()
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): CacheStats {
    const hitRate
      = this.totalRequests > 0 ? this.cacheHits / this.totalRequests : 0

    return {
      keyCache: this.keyCache.size,
      resultCache: this.resultCache.size,
      maxSize: this.maxCacheSize,
      hitRate,
      totalRequests: this.totalRequests,
    }
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
    const hitRate
      = this.totalRequests > 0 ? this.cacheHits / this.totalRequests : 0

    return {
      operationsPerSecond: opsPerSecond,
      averageLatency: avgLatency,
      memoryUsage: this.getMemoryUsage(),
      cacheHitRate: hitRate,
    }
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed
    }

    // 浏览器环境的估算
    return this.resultCache.size * 1024 + this.keyCache.size * 512
  }

  /**
   * 优化缓存大小
   */
  optimizeCacheSize(): void {
    const hitRate
      = this.totalRequests > 0 ? this.cacheHits / this.totalRequests : 0

    // 如果命中率低于50%，减少缓存大小
    if (hitRate < 0.5 && this.maxCacheSize > 100) {
      this.maxCacheSize = Math.max(100, Math.floor(this.maxCacheSize * 0.8))
    }
    // 如果命中率高于80%，增加缓存大小
    else if (hitRate > 0.8 && this.maxCacheSize < 5000) {
      this.maxCacheSize = Math.min(5000, Math.floor(this.maxCacheSize * 1.2))
    }
  }

  /**
   * 重置性能统计
   */
  resetStats(): void {
    this.cacheHits = 0
    this.cacheMisses = 0
    this.totalRequests = 0
    this.operationTimes = []
  }
}
