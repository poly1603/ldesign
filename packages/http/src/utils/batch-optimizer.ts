/**
 * 请求批处理优化器
 * 
 * 功能：
 * 1. 自动合并相同端点的请求
 * 2. 智能分组批处理
 * 3. 请求去重和合并
 * 4. 动态批次大小调整
 */

import type { RequestConfig, ResponseData } from '../types'

/**
 * 批处理配置
 */
export interface BatchOptimizerConfig {
  /** 是否启用批处理 */
  enabled?: boolean
  /** 最大批次大小 */
  maxBatchSize?: number
  /** 批处理等待时间（ms） */
  batchWindow?: number
  /** 是否自动合并相同请求 */
  mergeDuplicates?: boolean
  /** 是否启用智能分组 */
  smartGrouping?: boolean
  /** 动态调整批次大小 */
  dynamicBatching?: boolean
}

/**
 * 批处理请求项
 */
interface BatchRequest<T = any> {
  id: string
  config: RequestConfig
  resolve: (value: ResponseData<T>) => void
  reject: (error: Error) => void
  timestamp: number
}

/**
 * 批处理组
 */
interface BatchGroup {
  endpoint: string
  method: string
  requests: BatchRequest[]
  timer?: NodeJS.Timeout
}

/**
 * 批处理统计
 */
export interface BatchStats {
  totalBatches: number
  totalRequests: number
  mergedRequests: number
  averageBatchSize: number
  totalSavedRequests: number
  compressionRatio: number
}

/**
 * 请求批处理优化器
 * 
 * 优化策略：
 * 1. 使用时间窗口收集请求
 * 2. 智能分组相似请求
 * 3. 合并重复请求
 * 4. 动态调整批次大小
 */
export class BatchOptimizer {
  private config: Required<BatchOptimizerConfig>
  private groups = new Map<string, BatchGroup>()
  private stats: BatchStats = {
    totalBatches: 0,
    totalRequests: 0,
    mergedRequests: 0,
    averageBatchSize: 0,
    totalSavedRequests: 0,
    compressionRatio: 1,
  }
  
  // 动态批处理参数
  private currentBatchSize: number
  private successRate = 1.0
  private latencyHistory: number[] = []
  
  // 请求签名缓存
  private signatureCache = new Map<string, string>()
  private readonly MAX_CACHE_SIZE = 1000

  constructor(config: BatchOptimizerConfig = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      maxBatchSize: config.maxBatchSize ?? 10,
      batchWindow: config.batchWindow ?? 50, // 50ms 窗口
      mergeDuplicates: config.mergeDuplicates ?? true,
      smartGrouping: config.smartGrouping ?? true,
      dynamicBatching: config.dynamicBatching ?? true,
    }
    
    this.currentBatchSize = this.config.maxBatchSize
  }

  /**
   * 添加请求到批处理队列
   */
  async addRequest<T = any>(
    config: RequestConfig,
    executor: (config: RequestConfig) => Promise<ResponseData<T>>
  ): Promise<ResponseData<T>> {
    if (!this.config.enabled) {
      return executor(config)
    }

    return new Promise((resolve, reject) => {
      const request: BatchRequest<T> = {
        id: this.generateId(),
        config,
        resolve,
        reject,
        timestamp: Date.now(),
      }

      // 获取或创建批处理组
      const groupKey = this.getGroupKey(config)
      let group = this.groups.get(groupKey)
      
      if (!group) {
        group = this.createGroup(config)
        this.groups.set(groupKey, group)
      }

      // 检查是否可以合并重复请求
      if (this.config.mergeDuplicates) {
        const duplicate = this.findDuplicate(group, config)
        if (duplicate) {
          // 共享结果
          this.shareDuplicateResult(duplicate, request)
          this.stats.mergedRequests++
          this.stats.totalSavedRequests++
          return
        }
      }

      // 添加到组
      group.requests.push(request)
      this.stats.totalRequests++

      // 检查是否应该立即执行
      if (this.shouldExecuteNow(group)) {
        this.executeBatch(group, executor)
      } else {
        // 设置延迟执行
        this.scheduleExecution(group, executor)
      }
    })
  }

  /**
   * 创建批处理组
   */
  private createGroup(config: RequestConfig): BatchGroup {
    const url = new URL(config.url || '')
    return {
      endpoint: `${url.protocol}//${url.host}${url.pathname}`,
      method: config.method || 'GET',
      requests: [],
    }
  }

  /**
   * 获取组键
   */
  private getGroupKey(config: RequestConfig): string {
    if (!this.config.smartGrouping) {
      return 'default'
    }

    const url = new URL(config.url || '')
    const endpoint = `${url.protocol}//${url.host}${url.pathname}`
    const method = config.method || 'GET'
    
    return `${method}:${endpoint}`
  }

  /**
   * 查找重复请求
   */
  private findDuplicate(group: BatchGroup, config: RequestConfig): BatchRequest | null {
    const signature = this.getRequestSignature(config)
    
    for (const request of group.requests) {
      if (this.getRequestSignature(request.config) === signature) {
        return request
      }
    }
    
    return null
  }

  /**
   * 获取请求签名（使用缓存优化）
   */
  private getRequestSignature(config: RequestConfig): string {
    const key = `${config.method}:${config.url}:${JSON.stringify(config.params)}:${JSON.stringify(config.data)}`
    
    let signature = this.signatureCache.get(key)
    if (!signature) {
      signature = this.computeSignature(config)
      
      // 限制缓存大小
      if (this.signatureCache.size >= this.MAX_CACHE_SIZE) {
        const firstKey = this.signatureCache.keys().next().value
        if (firstKey) {
          this.signatureCache.delete(firstKey)
        }
      }
      
      this.signatureCache.set(key, signature)
    }
    
    return signature
  }

  /**
   * 计算请求签名
   */
  private computeSignature(config: RequestConfig): string {
    const parts = [
      config.method || 'GET',
      config.url || '',
      JSON.stringify(config.params || {}),
      JSON.stringify(config.data || {}),
      JSON.stringify(config.headers || {}),
    ]
    
    return parts.join('|')
  }

  /**
   * 共享重复请求结果
   */
  private shareDuplicateResult<T>(
    original: BatchRequest,
    duplicate: BatchRequest<T>
  ): void {
    // 监听原始请求完成
    const originalPromise = new Promise<ResponseData<T>>((resolve, reject) => {
      const originalResolve = original.resolve
      const originalReject = original.reject
      
      original.resolve = (result) => {
        originalResolve(result)
        resolve(result as ResponseData<T>)
      }
      
      original.reject = (error) => {
        originalReject(error)
        reject(error)
      }
    })
    
    originalPromise.then(duplicate.resolve, duplicate.reject)
  }

  /**
   * 判断是否应该立即执行
   */
  private shouldExecuteNow(group: BatchGroup): boolean {
    // 达到最大批次大小
    if (group.requests.length >= this.currentBatchSize) {
      return true
    }
    
    // 第一个请求等待时间过长
    if (group.requests.length > 0) {
      const firstRequest = group.requests[0]
      if (Date.now() - firstRequest.timestamp > this.config.batchWindow * 2) {
        return true
      }
    }
    
    return false
  }

  /**
   * 调度批处理执行
   */
  private scheduleExecution<T>(
    group: BatchGroup,
    executor: (config: RequestConfig) => Promise<ResponseData<T>>
  ): void {
    if (group.timer) {
      return // 已经调度
    }
    
    group.timer = setTimeout(() => {
      this.executeBatch(group, executor)
    }, this.config.batchWindow)
  }

  /**
   * 执行批处理
   */
  private async executeBatch<T>(
    group: BatchGroup,
    executor: (config: RequestConfig) => Promise<ResponseData<T>>
  ): Promise<void> {
    // 清除定时器
    if (group.timer) {
      clearTimeout(group.timer)
      group.timer = undefined
    }
    
    // 取出所有请求
    const requests = group.requests.splice(0)
    if (requests.length === 0) {
      return
    }
    
    // 更新统计
    this.stats.totalBatches++
    const batchStartTime = Date.now()
    
    // 并行执行所有请求
    const promises = requests.map(async (request) => {
      try {
        const result = await executor(request.config)
        request.resolve(result)
        return { success: true }
      } catch (error) {
        request.reject(error as Error)
        return { success: false }
      }
    })
    
    const results = await Promise.all(promises)
    
    // 更新性能指标
    const batchDuration = Date.now() - batchStartTime
    this.updateMetrics(requests.length, batchDuration, results)
    
    // 动态调整批次大小
    if (this.config.dynamicBatching) {
      this.adjustBatchSize()
    }
    
    // 清理空组
    const groupKey = this.getGroupKey(requests[0].config)
    if (group.requests.length === 0) {
      this.groups.delete(groupKey)
    }
  }

  /**
   * 更新性能指标
   */
  private updateMetrics(
    batchSize: number,
    duration: number,
    results: Array<{ success: boolean }>
  ): void {
    // 更新延迟历史
    this.latencyHistory.push(duration / batchSize)
    if (this.latencyHistory.length > 100) {
      this.latencyHistory.shift()
    }
    
    // 计算成功率
    const successCount = results.filter(r => r.success).length
    const currentRate = successCount / results.length
    this.successRate = this.successRate * 0.9 + currentRate * 0.1 // 指数移动平均
    
    // 更新平均批次大小
    const totalBatches = this.stats.totalBatches
    this.stats.averageBatchSize = 
      (this.stats.averageBatchSize * (totalBatches - 1) + batchSize) / totalBatches
    
    // 计算压缩率
    this.stats.compressionRatio = 
      this.stats.totalRequests / (this.stats.totalRequests - this.stats.totalSavedRequests)
  }

  /**
   * 动态调整批次大小
   */
  private adjustBatchSize(): void {
    // 基于成功率调整
    if (this.successRate < 0.8) {
      // 成功率低，减小批次
      this.currentBatchSize = Math.max(1, Math.floor(this.currentBatchSize * 0.8))
    } else if (this.successRate > 0.95) {
      // 成功率高，增大批次
      this.currentBatchSize = Math.min(
        this.config.maxBatchSize,
        Math.floor(this.currentBatchSize * 1.2)
      )
    }
    
    // 基于延迟调整
    if (this.latencyHistory.length > 10) {
      const avgLatency = this.latencyHistory.reduce((a, b) => a + b, 0) / this.latencyHistory.length
      const recentLatency = this.latencyHistory.slice(-10).reduce((a, b) => a + b, 0) / 10
      
      if (recentLatency > avgLatency * 1.5) {
        // 延迟增加，减小批次
        this.currentBatchSize = Math.max(1, Math.floor(this.currentBatchSize * 0.9))
      }
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): BatchStats {
    return { ...this.stats }
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats = {
      totalBatches: 0,
      totalRequests: 0,
      mergedRequests: 0,
      averageBatchSize: 0,
      totalSavedRequests: 0,
      compressionRatio: 1,
    }
    this.latencyHistory = []
    this.successRate = 1.0
  }

  /**
   * 获取当前批次大小
   */
  getCurrentBatchSize(): number {
    return this.currentBatchSize
  }

  /**
   * 清理资源
   */
  destroy(): void {
    // 清理所有定时器
    for (const group of this.groups.values()) {
      if (group.timer) {
        clearTimeout(group.timer)
      }
    }
    
    // 拒绝所有待处理请求
    for (const group of this.groups.values()) {
      for (const request of group.requests) {
        request.reject(new Error('BatchOptimizer destroyed'))
      }
    }
    
    this.groups.clear()
    this.signatureCache.clear()
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * 创建批处理优化器
 */
export function createBatchOptimizer(config?: BatchOptimizerConfig): BatchOptimizer {
  return new BatchOptimizer(config)
}