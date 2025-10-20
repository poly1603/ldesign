/**
 * 请求批处理器 - 将多个请求合并为一个批量请求
 */

export interface BatchConfig {
  /** 批量大小 */
  maxBatchSize: number
  /** 批处理延迟(毫秒) */
  batchDelay: number
  /** 是否启用 */
  enabled: boolean
}

export interface BatchRequest {
  id: string
  method: string
  params?: unknown
  resolve: (result: any) => void
  reject: (error: any) => void
  timestamp: number
}

/**
 * 请求批处理器
 */
export class RequestBatcher {
  private pendingRequests = new Map<string, BatchRequest[]>()
  private batchTimers = new Map<string, ReturnType<typeof setTimeout>>()
  private config: Required<BatchConfig>
  
  private stats = {
    totalRequests: 0,
    batchedRequests: 0,
    batchCount: 0,
    averageBatchSize: 0,
  }

  constructor(config: Partial<BatchConfig> = {}) {
    this.config = {
      maxBatchSize: 10,
      batchDelay: 50,
      enabled: true,
      ...config,
    }
  }

  /**
   * 添加请求到批处理队列
   */
  async add<T>(
    batchKey: string,
    requestId: string,
    method: string,
    params?: unknown,
    batchExecutor?: (requests: BatchRequest[]) => Promise<Map<string, any>>
  ): Promise<T> {
    if (!this.config.enabled) {
      // 批处理未启用，直接执行
      throw new Error('Batch processing is not enabled')
    }

    this.stats.totalRequests++

    return new Promise<T>((resolve, reject) => {
      const request: BatchRequest = {
        id: requestId,
        method,
        params,
        resolve,
        reject,
        timestamp: Date.now(),
      }

      // 获取或创建批次
      if (!this.pendingRequests.has(batchKey)) {
        this.pendingRequests.set(batchKey, [])
      }
      
      const batch = this.pendingRequests.get(batchKey)!
      batch.push(request)

      // 如果批次达到最大大小，立即执行
      if (batch.length >= this.config.maxBatchSize) {
        this.executeBatch(batchKey, batchExecutor)
      } else {
        // 否则，设置延迟执行
        this.scheduleBatch(batchKey, batchExecutor)
      }
    })
  }

  /**
   * 调度批处理执行
   */
  private scheduleBatch(
    batchKey: string,
    executor?: (requests: BatchRequest[]) => Promise<Map<string, any>>
  ): void {
    // 如果已有定时器，不重复设置
    if (this.batchTimers.has(batchKey)) {
      return
    }

    const timer = setTimeout(() => {
      this.executeBatch(batchKey, executor)
    }, this.config.batchDelay)

    this.batchTimers.set(batchKey, timer)
  }

  /**
   * 执行批处理
   */
  private async executeBatch(
    batchKey: string,
    executor?: (requests: BatchRequest[]) => Promise<Map<string, any>>
  ): Promise<void> {
    // 清除定时器
    const timer = this.batchTimers.get(batchKey)
    if (timer) {
      clearTimeout(timer)
      this.batchTimers.delete(batchKey)
    }

    // 获取待处理的请求
    const requests = this.pendingRequests.get(batchKey)
    if (!requests || requests.length === 0) {
      return
    }

    // 清空批次
    this.pendingRequests.delete(batchKey)

    // 更新统计
    this.stats.batchedRequests += requests.length
    this.stats.batchCount++
    this.stats.averageBatchSize = this.stats.batchedRequests / this.stats.batchCount

    // 执行批量请求
    try {
      if (!executor) {
        throw new Error('No batch executor provided')
      }

      const results = await executor(requests)
      
      // 分发结果到各个请求
      for (const request of requests) {
        const result = results.get(request.id)
        if (result !== undefined) {
          if (result instanceof Error) {
            request.reject(result)
          } else {
            request.resolve(result)
          }
        } else {
          request.reject(new Error('No result for request'))
        }
      }
    } catch (error) {
      // 批量请求失败，拒绝所有请求
      for (const request of requests) {
        request.reject(error)
      }
    }
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this.stats,
      pendingBatches: this.pendingRequests.size,
      scheduledBatches: this.batchTimers.size,
      efficiency: this.stats.totalRequests > 0
        ? this.stats.batchedRequests / this.stats.totalRequests
        : 0,
    }
  }

  /**
   * 清空所有待处理的批次
   */
  clear(): void {
    // 取消所有定时器
    for (const timer of this.batchTimers.values()) {
      clearTimeout(timer)
    }
    this.batchTimers.clear()

    // 拒绝所有待处理的请求
    for (const requests of this.pendingRequests.values()) {
      for (const request of requests) {
        request.reject(new Error('Batcher cleared'))
      }
    }
    this.pendingRequests.clear()
  }

  /**
   * 强制执行所有待处理的批次
   */
  async flush(
    executor?: (requests: BatchRequest[]) => Promise<Map<string, any>>
  ): Promise<void> {
    const batchKeys = Array.from(this.pendingRequests.keys())
    
    await Promise.all(
      batchKeys.map(key => this.executeBatch(key, executor))
    )
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<BatchConfig>): void {
    Object.assign(this.config, config)
  }
}

/**
 * GraphQL 请求合并器
 */
export class GraphQLBatcher {
  private batcher: RequestBatcher

  constructor(config?: Partial<BatchConfig>) {
    this.batcher = new RequestBatcher(config)
  }

  /**
   * 添加 GraphQL 查询到批处理
   */
  async addQuery<T>(
    query: string,
    variables?: Record<string, any>,
    executor?: (queries: Array<{ query: string, variables?: Record<string, any> }>) => Promise<any[]>
  ): Promise<T> {
    const requestId = this.generateRequestId(query, variables)
    
    const batchExecutor = async (requests: BatchRequest[]) => {
      if (!executor) {
        throw new Error('No GraphQL executor provided')
      }

      const queries = requests.map(r => ({
        query: r.method,
        variables: r.params as Record<string, any>,
      }))

      const results = await executor(queries)
      
      const resultMap = new Map<string, any>()
      requests.forEach((request, index) => {
        resultMap.set(request.id, results[index])
      })
      
      return resultMap
    }

    return this.batcher.add<T>(
      'graphql',
      requestId,
      query,
      variables,
      batchExecutor
    )
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(query: string, variables?: Record<string, any>): string {
    return `${query.substring(0, 50)}_${JSON.stringify(variables || {})}`
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return this.batcher.getStats()
  }

  /**
   * 清空批处理器
   */
  clear(): void {
    this.batcher.clear()
  }
}

/**
 * REST API 请求合并器
 */
export class RestBatcher {
  private batcher: RequestBatcher

  constructor(config?: Partial<BatchConfig>) {
    this.batcher = new RequestBatcher({
      maxBatchSize: 20,
      batchDelay: 100,
      ...config,
    })
  }

  /**
   * 添加 REST 请求到批处理
   */
  async addRequest<T>(
    url: string,
    method: string,
    data?: unknown,
    executor?: (requests: Array<{ url: string, method: string, data?: unknown }>) => Promise<any[]>
  ): Promise<T> {
    const requestId = `${method}:${url}`
    const batchKey = this.getBatchKey(url, method)
    
    const batchExecutor = async (requests: BatchRequest[]) => {
      if (!executor) {
        throw new Error('No REST executor provided')
      }

      const restRequests = requests.map(r => ({
        url: r.id.split(':')[1],
        method: r.id.split(':')[0],
        data: r.params,
      }))

      const results = await executor(restRequests)
      
      const resultMap = new Map<string, any>()
      requests.forEach((request, index) => {
        resultMap.set(request.id, results[index])
      })
      
      return resultMap
    }

    return this.batcher.add<T>(
      batchKey,
      requestId,
      method,
      data,
      batchExecutor
    )
  }

  /**
   * 获取批次键（相同端点的请求批量处理）
   */
  private getBatchKey(url: string, method: string): string {
    // 提取基础URL（去掉查询参数）
    const baseUrl = url.split('?')[0]
    return `${method}:${baseUrl}`
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return this.batcher.getStats()
  }

  /**
   * 清空批处理器
   */
  clear(): void {
    this.batcher.clear()
  }
}