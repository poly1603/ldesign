/**
 * 请求执行器模块
 * 
 * 负责实际的请求执行逻辑，包括缓存、并发控制、重试等
 */

import type {
  HttpAdapter,
  RequestConfig,
  ResponseData,
  RetryConfig,
} from '../types'
import type { CacheManager } from '../utils/cache'
import type { ConcurrencyManager } from '../utils/concurrency'
import type { RetryManager } from '../utils/error'
import type { RequestMonitor } from '../utils/monitor'
import type { PriorityQueue } from '../utils/priority'
import { generateId } from '../utils'
import { determinePriority } from '../utils/priority'

/**
 * 请求执行器配置
 */
export interface RequestExecutorConfig {
  /** HTTP适配器 */
  adapter: HttpAdapter
  /** 缓存管理器 */
  cacheManager: CacheManager
  /** 并发管理器 */
  concurrencyManager: ConcurrencyManager
  /** 重试管理器 */
  retryManager: RetryManager
  /** 监控器 */
  monitor: RequestMonitor
  /** 优先级队列 */
  priorityQueue?: PriorityQueue
}

/**
 * 请求执行器
 * 
 * 封装请求执行的核心逻辑
 */
export class RequestExecutor {
  private config: RequestExecutorConfig

  constructor(config: RequestExecutorConfig) {
    this.config = config
  }

  /**
   * 执行请求
   */
  async execute<T = unknown>(
    requestConfig: RequestConfig,
    options?: {
      skipCache?: boolean
      skipRetry?: boolean
      requestId?: string
    },
  ): Promise<ResponseData<T>> {
    const requestId = options?.requestId || generateId()
    
    // 开始监控
    this.config.monitor.startRequest(requestId, requestConfig)

    try {
      // 判断是否使用优先级队列
      const priority = determinePriority(requestConfig)
      
      if (priority !== undefined && this.config.priorityQueue) {
        return await this.executeWithPriority<T>(
          requestConfig,
          requestId,
          priority,
          options,
        )
      }

      // 普通执行
      const response = await this.executeWithRetry<T>(
        requestConfig,
        requestId,
        options,
      )
      
      this.config.monitor.endRequest(requestId, requestConfig, response)
      return response
    } catch (error) {
      this.config.monitor.endRequest(
        requestId,
        requestConfig,
        undefined,
        error as Error,
      )
      throw error
    }
  }

  /**
   * 使用优先级队列执行
   */
  private async executeWithPriority<T>(
    config: RequestConfig,
    requestId: string,
    priority: number,
    options?: {
      skipCache?: boolean
      skipRetry?: boolean
    },
  ): Promise<ResponseData<T>> {
    return this.config.priorityQueue!.enqueue(
      config,
      async () => {
        const response = await this.executeWithRetry<T>(
          config,
          requestId,
          options,
        )
        this.config.monitor.endRequest(requestId, config, response)
        return response
      },
      priority,
    )
  }

  /**
   * 执行带重试的请求
   */
  private async executeWithRetry<T>(
    config: RequestConfig,
    requestId: string,
    options?: {
      skipCache?: boolean
      skipRetry?: boolean
    },
  ): Promise<ResponseData<T>> {
    // 如果启用了重试且未跳过
    const retryConfig = config.retry as RetryConfig | undefined
    if (!options?.skipRetry && retryConfig?.retries && retryConfig.retries > 0) {
      return this.config.retryManager.executeWithRetry(
        () => {
          this.config.monitor.recordRetry(requestId)
          return this.executeSingle<T>(config, options)
        },
        config,
      )
    }

    return this.executeSingle<T>(config, options)
  }

  /**
   * 执行单次请求
   */
  private async executeSingle<T>(
    config: RequestConfig,
    options?: {
      skipCache?: boolean
    },
  ): Promise<ResponseData<T>> {
    // 检查缓存
    if (!options?.skipCache) {
      const cachedResponse = await this.config.cacheManager.get<T>(config)
      if (cachedResponse) {
        return cachedResponse
      }
    }

    // 使用并发控制执行请求
    return this.config.concurrencyManager.execute(
      () => this.performRequest<T>(config),
      config,
    )
  }

  /**
   * 执行实际的请求
   */
  private async performRequest<T>(
    config: RequestConfig,
  ): Promise<ResponseData<T>> {
    // 发送请求
    const response = await this.config.adapter.request<T>(config)

    // 缓存响应
    await this.config.cacheManager.set(config, response)

    return response
  }

  /**
   * 批量执行请求
   */
  async executeBatch<T = unknown>(
    configs: RequestConfig[],
    options?: {
      parallel?: boolean
      maxConcurrency?: number
      continueOnError?: boolean
    },
  ): Promise<Array<{ success: boolean; data?: ResponseData<T>; error?: Error }>> {
    const results: Array<{ success: boolean; data?: ResponseData<T>; error?: Error }> = []

    if (options?.parallel) {
      // 并行执行
      const promises = configs.map(config =>
        this.execute<T>(config)
          .then(data => ({ success: true, data } as const))
          .catch(error => ({ success: false, error } as const)),
      )

      const batchResults = await Promise.all(promises)
      results.push(...batchResults)
    } else {
      // 串行执行
      for (const config of configs) {
        try {
          const data = await this.execute<T>(config)
          results.push({ success: true, data })
        } catch (error) {
          results.push({ success: false, error: error as Error })
          
          if (!options?.continueOnError) {
            break
          }
        }
      }
    }

    return results
  }

  /**
   * 带超时的请求执行
   */
  async executeWithTimeout<T>(
    config: RequestConfig,
    timeout: number,
  ): Promise<ResponseData<T>> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeout}ms`))
      }, timeout)
    })

    return Promise.race([
      this.execute<T>(config),
      timeoutPromise,
    ])
  }

  /**
   * 带取消令牌的请求执行
   */
  async executeWithCancellation<T>(
    config: RequestConfig,
    signal: AbortSignal,
  ): Promise<ResponseData<T>> {
    return new Promise((resolve, reject) => {
      // 监听取消信号
      const onAbort = () => {
        reject(new Error('Request cancelled'))
      }

      if (signal.aborted) {
        onAbort()
        return
      }

      signal.addEventListener('abort', onAbort, { once: true })

      // 执行请求
      this.execute<T>({ ...config, signal })
        .then(resolve)
        .catch(reject)
        .finally(() => {
          signal.removeEventListener('abort', onAbort)
        })
    })
  }

  /**
   * 获取执行器状态
   */
  getStatus() {
    return {
      concurrency: this.config.concurrencyManager.getStatus(),
      cache: {
        size: (this.config.cacheManager as any).getSize?.() || 0,
        hits: this.config.cacheManager.getStats?.()?.hits || 0,
        misses: this.config.cacheManager.getStats?.()?.misses || 0,
      },
      monitor: this.config.monitor.getMetrics?.() || [],
    }
  }

  /**
   * 清理资源
   */
  cleanup() {
    // 清理缓存
    this.config.cacheManager.clear()
    
    // 取消所有等待的请求
    this.config.concurrencyManager.cancelQueue()
    
    // 清理优先级队列
    if (this.config.priorityQueue) {
      (this.config.priorityQueue as any).clear?.()
    }
  }
}

/**
 * 创建请求执行器
 */
export function createRequestExecutor(
  config: RequestExecutorConfig,
): RequestExecutor {
  return new RequestExecutor(config)
}