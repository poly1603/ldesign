/**
 * 批量操作管理器
 * 
 * 优化批量翻译操作，提供智能批处理和缓存策略
 * 
 * @author LDesign Team
 * @version 2.0.0
 */

import { TimeUtils } from '../utils/common'
import type { TranslationParams } from './types'

/**
 * 批量配置接口
 */
export interface BatchConfig {
  /** 批量大小 */
  batchSize: number
  /** 批量延迟（毫秒） */
  batchDelay: number
  /** 最大等待时间（毫秒） */
  maxWaitTime: number
  /** 是否启用智能批处理 */
  enableSmartBatching: boolean
  /** 是否启用并行处理 */
  enableParallel: boolean
  /** 最大并行数 */
  maxParallel: number
}

/**
 * 批量请求接口
 */
interface BatchRequest {
  id: string
  key: string
  params?: TranslationParams
  resolve: (value: string) => void
  reject: (error: Error) => void
  timestamp: number
  priority: number
}

/**
 * 批量结果接口
 */
export interface BatchResult {
  success: Record<string, string>
  failed: Record<string, Error>
  duration: number
  cacheHits: number
  cacheMisses: number
}

/**
 * 批量统计接口
 */
export interface BatchStats {
  totalRequests: number
  totalBatches: number
  averageBatchSize: number
  averageProcessingTime: number
  cacheHitRate: number
  errorRate: number
}

/**
 * 批量操作管理器类
 */
export class BatchManager {
  private config: BatchConfig
  private pendingRequests = new Map<string, BatchRequest>()
  private batchTimer?: NodeJS.Timeout
  private stats: BatchStats
  private requestCounter = 0

  constructor(config: Partial<BatchConfig> = {}) {
    this.config = {
      batchSize: 50,
      batchDelay: 10, // 10ms
      maxWaitTime: 100, // 100ms
      enableSmartBatching: true,
      enableParallel: true,
      maxParallel: 3,
      ...config
    }

    this.stats = {
      totalRequests: 0,
      totalBatches: 0,
      averageBatchSize: 0,
      averageProcessingTime: 0,
      cacheHitRate: 0,
      errorRate: 0
    }
  }

  /**
   * 添加翻译请求到批量队列
   */
  addRequest(
    key: string,
    params?: TranslationParams,
    priority: number = 1
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const id = `${++this.requestCounter}-${TimeUtils.now()}`
      
      const request: BatchRequest = {
        id,
        key,
        params,
        resolve,
        reject,
        timestamp: TimeUtils.now(),
        priority
      }

      this.pendingRequests.set(id, request)
      this.stats.totalRequests++

      // 调度批处理
      this.scheduleBatch()
    })
  }

  /**
   * 立即执行批量翻译
   */
  async flushBatch(): Promise<BatchResult> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = undefined
    }

    return this.processBatch()
  }

  /**
   * 获取批量统计
   */
  getStats(): BatchStats {
    return { ...this.stats }
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      totalBatches: 0,
      averageBatchSize: 0,
      averageProcessingTime: 0,
      cacheHitRate: 0,
      errorRate: 0
    }
  }

  /**
   * 获取待处理请求数量
   */
  getPendingCount(): number {
    return this.pendingRequests.size
  }

  /**
   * 清理过期请求
   */
  cleanup(): void {
    const now = TimeUtils.now()
    const maxAge = this.config.maxWaitTime * 2

    for (const [id, request] of this.pendingRequests) {
      if (now - request.timestamp > maxAge) {
        request.reject(new Error('Request timeout'))
        this.pendingRequests.delete(id)
      }
    }
  }

  /**
   * 调度批处理
   */
  private scheduleBatch(): void {
    // 如果已经有定时器，检查是否需要立即执行
    if (this.batchTimer) {
      if (this.shouldFlushImmediately()) {
        this.flushBatch()
      }
      return
    }

    // 设置新的定时器
    this.batchTimer = setTimeout(() => {
      this.processBatch()
    }, this.config.batchDelay)
  }

  /**
   * 判断是否应该立即刷新批次
   */
  private shouldFlushImmediately(): boolean {
    const pendingCount = this.pendingRequests.size
    
    // 达到批量大小
    if (pendingCount >= this.config.batchSize) {
      return true
    }

    // 有高优先级请求
    const hasHighPriority = Array.from(this.pendingRequests.values())
      .some(request => request.priority > 5)
    
    if (hasHighPriority && pendingCount > 0) {
      return true
    }

    // 最老的请求等待时间过长
    const now = TimeUtils.now()
    const oldestRequest = Array.from(this.pendingRequests.values())
      .reduce((oldest, current) => 
        current.timestamp < oldest.timestamp ? current : oldest
      )

    if (now - oldestRequest.timestamp > this.config.maxWaitTime) {
      return true
    }

    return false
  }

  /**
   * 处理批量请求
   */
  private async processBatch(): Promise<BatchResult> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = undefined
    }

    const requests = Array.from(this.pendingRequests.values())
    this.pendingRequests.clear()

    if (requests.length === 0) {
      return {
        success: {},
        failed: {},
        duration: 0,
        cacheHits: 0,
        cacheMisses: 0
      }
    }

    const startTime = TimeUtils.now()
    
    // 按优先级排序
    requests.sort((a, b) => b.priority - a.priority)

    const result: BatchResult = {
      success: {},
      failed: {},
      duration: 0,
      cacheHits: 0,
      cacheMisses: 0
    }

    try {
      if (this.config.enableParallel && requests.length > this.config.maxParallel) {
        // 并行处理
        await this.processParallel(requests, result)
      } else {
        // 串行处理
        await this.processSerial(requests, result)
      }
    } catch (error) {
      // 处理所有失败的请求
      for (const request of requests) {
        request.reject(error as Error)
        result.failed[request.key] = error as Error
      }
    }

    const endTime = TimeUtils.now()
    result.duration = endTime - startTime

    // 更新统计
    this.updateStats(requests.length, result)

    return result
  }

  /**
   * 串行处理请求
   */
  private async processSerial(
    requests: BatchRequest[],
    result: BatchResult
  ): Promise<void> {
    for (const request of requests) {
      try {
        // 这里应该调用实际的翻译函数
        // 为了演示，我们使用模拟的翻译逻辑
        const translation = await this.translateSingle(request.key, request.params)
        
        request.resolve(translation)
        result.success[request.key] = translation
        result.cacheMisses++
      } catch (error) {
        request.reject(error as Error)
        result.failed[request.key] = error as Error
      }
    }
  }

  /**
   * 并行处理请求
   */
  private async processParallel(
    requests: BatchRequest[],
    result: BatchResult
  ): Promise<void> {
    const chunks = this.chunkArray(requests, this.config.maxParallel)
    
    for (const chunk of chunks) {
      const promises = chunk.map(async (request) => {
        try {
          const translation = await this.translateSingle(request.key, request.params)
          request.resolve(translation)
          result.success[request.key] = translation
          result.cacheMisses++
        } catch (error) {
          request.reject(error as Error)
          result.failed[request.key] = error as Error
        }
      })

      await Promise.all(promises)
    }
  }

  /**
   * 单个翻译（模拟）
   * 在实际使用中，这应该调用真正的翻译函数
   */
  private async translateSingle(
    key: string,
    params?: TranslationParams
  ): Promise<string> {
    // 模拟异步翻译
    await new Promise(resolve => setTimeout(resolve, 1))
    
    // 这里应该调用实际的翻译逻辑
    // 返回模拟的翻译结果
    return `translated_${key}`
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
   * 更新统计信息
   */
  private updateStats(batchSize: number, result: BatchResult): void {
    this.stats.totalBatches++
    
    // 更新平均批量大小
    this.stats.averageBatchSize = 
      (this.stats.averageBatchSize * (this.stats.totalBatches - 1) + batchSize) / 
      this.stats.totalBatches

    // 更新平均处理时间
    this.stats.averageProcessingTime = 
      (this.stats.averageProcessingTime * (this.stats.totalBatches - 1) + result.duration) / 
      this.stats.totalBatches

    // 更新缓存命中率
    const totalOperations = result.cacheHits + result.cacheMisses
    if (totalOperations > 0) {
      const currentHitRate = result.cacheHits / totalOperations
      this.stats.cacheHitRate = 
        (this.stats.cacheHitRate * (this.stats.totalBatches - 1) + currentHitRate) / 
        this.stats.totalBatches
    }

    // 更新错误率
    const errorCount = Object.keys(result.failed).length
    const currentErrorRate = errorCount / batchSize
    this.stats.errorRate = 
      (this.stats.errorRate * (this.stats.totalBatches - 1) + currentErrorRate) / 
      this.stats.totalBatches
  }

  /**
   * 设置翻译函数
   * 允许外部设置实际的翻译函数
   */
  setTranslateFunction(
    translateFn: (key: string, params?: TranslationParams) => Promise<string>
  ): void {
    this.translateSingle = translateFn
  }
}

/**
 * 创建批量管理器实例
 */
export function createBatchManager(config?: Partial<BatchConfig>): BatchManager {
  return new BatchManager(config)
}
