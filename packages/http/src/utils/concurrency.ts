import type { ConcurrencyConfig, RequestConfig, ResponseData } from '@/types'

/**
 * 请求任务接口
 */
interface RequestTask<T = any> {
  id: string
  execute: () => Promise<ResponseData<T>>
  resolve: (value: ResponseData<T>) => void
  reject: (error: any) => void
  config: RequestConfig
}

/**
 * 并发控制管理器
 */
export class ConcurrencyManager {
  private config: Required<ConcurrencyConfig>
  private activeRequests = new Set<string>()
  private requestQueue: RequestTask[] = []
  private requestCounter = 0

  constructor(config: ConcurrencyConfig = {}) {
    this.config = {
      maxConcurrent: config.maxConcurrent ?? 10,
      maxQueueSize: config.maxQueueSize ?? 100,
    }
  }

  /**
   * 执行请求（带并发控制）
   */
  async execute<T = any>(
    requestFn: () => Promise<ResponseData<T>>,
    config: RequestConfig
  ): Promise<ResponseData<T>> {
    return new Promise<ResponseData<T>>((resolve, reject) => {
      const taskId = this.generateTaskId()
      
      const task: RequestTask<T> = {
        id: taskId,
        execute: requestFn,
        resolve,
        reject,
        config,
      }

      // 检查队列大小限制
      if (this.requestQueue.length >= this.config.maxQueueSize) {
        reject(new Error('Request queue is full'))
        return
      }

      // 如果当前并发数未达到限制，直接执行
      if (this.activeRequests.size < this.config.maxConcurrent) {
        this.executeTask(task)
      } else {
        // 否则加入队列
        this.requestQueue.push(task)
      }
    })
  }

  /**
   * 执行任务
   */
  private async executeTask<T>(task: RequestTask<T>): Promise<void> {
    this.activeRequests.add(task.id)

    try {
      const result = await task.execute()
      task.resolve(result)
    } catch (error) {
      task.reject(error)
    } finally {
      this.activeRequests.delete(task.id)
      this.processQueue()
    }
  }

  /**
   * 处理队列中的下一个任务
   */
  private processQueue(): void {
    if (
      this.requestQueue.length > 0 &&
      this.activeRequests.size < this.config.maxConcurrent
    ) {
      const nextTask = this.requestQueue.shift()
      if (nextTask) {
        this.executeTask(nextTask)
      }
    }
  }

  /**
   * 取消所有排队的请求
   */
  cancelQueue(reason = 'Queue cancelled'): void {
    const queuedTasks = this.requestQueue.splice(0)
    queuedTasks.forEach((task) => {
      task.reject(new Error(reason))
    })
  }

  /**
   * 获取状态信息
   */
  getStatus(): {
    activeCount: number
    queuedCount: number
    maxConcurrent: number
    maxQueueSize: number
  } {
    return {
      activeCount: this.activeRequests.size,
      queuedCount: this.requestQueue.length,
      maxConcurrent: this.config.maxConcurrent,
      maxQueueSize: this.config.maxQueueSize,
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ConcurrencyConfig>): void {
    Object.assign(this.config, config)
    
    // 如果降低了最大并发数，需要处理队列
    this.processQueue()
  }

  /**
   * 获取当前配置
   */
  getConfig(): Required<ConcurrencyConfig> {
    return { ...this.config }
  }

  /**
   * 生成任务 ID
   */
  private generateTaskId(): string {
    return `task_${++this.requestCounter}_${Date.now()}`
  }
}

/**
 * 请求去重管理器
 */
export class DeduplicationManager {
  private pendingRequests = new Map<string, Promise<ResponseData>>()

  /**
   * 执行请求（带去重）
   */
  async execute<T = any>(
    key: string,
    requestFn: () => Promise<ResponseData<T>>
  ): Promise<ResponseData<T>> {
    // 检查是否有相同的请求正在进行
    const existingRequest = this.pendingRequests.get(key)
    if (existingRequest) {
      return existingRequest as Promise<ResponseData<T>>
    }

    // 创建新的请求
    const requestPromise = requestFn()
      .finally(() => {
        // 请求完成后清理
        this.pendingRequests.delete(key)
      })

    this.pendingRequests.set(key, requestPromise)
    return requestPromise
  }

  /**
   * 取消指定请求
   */
  cancel(key: string): void {
    this.pendingRequests.delete(key)
  }

  /**
   * 取消所有请求
   */
  cancelAll(): void {
    this.pendingRequests.clear()
  }

  /**
   * 获取待处理请求数量
   */
  getPendingCount(): number {
    return this.pendingRequests.size
  }

  /**
   * 获取所有待处理请求的键
   */
  getPendingKeys(): string[] {
    return Array.from(this.pendingRequests.keys())
  }
}

/**
 * 速率限制管理器
 */
export class RateLimitManager {
  private requests: number[] = []
  private maxRequests: number
  private timeWindow: number

  constructor(maxRequests = 100, timeWindow = 60000) {
    this.maxRequests = maxRequests
    this.timeWindow = timeWindow
  }

  /**
   * 检查是否可以发送请求
   */
  canMakeRequest(): boolean {
    const now = Date.now()
    
    // 清理过期的请求记录
    this.requests = this.requests.filter(
      timestamp => now - timestamp < this.timeWindow
    )

    return this.requests.length < this.maxRequests
  }

  /**
   * 记录请求
   */
  recordRequest(): void {
    this.requests.push(Date.now())
  }

  /**
   * 获取下次可以请求的时间
   */
  getNextAvailableTime(): number {
    if (this.canMakeRequest()) {
      return 0
    }

    const oldestRequest = Math.min(...this.requests)
    return oldestRequest + this.timeWindow - Date.now()
  }

  /**
   * 等待直到可以发送请求
   */
  async waitForAvailability(): Promise<void> {
    const waitTime = this.getNextAvailableTime()
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  /**
   * 重置计数器
   */
  reset(): void {
    this.requests = []
  }

  /**
   * 获取当前状态
   */
  getStatus(): {
    currentRequests: number
    maxRequests: number
    timeWindow: number
    nextAvailableTime: number
  } {
    return {
      currentRequests: this.requests.length,
      maxRequests: this.maxRequests,
      timeWindow: this.timeWindow,
      nextAvailableTime: this.getNextAvailableTime(),
    }
  }
}

/**
 * 创建并发管理器
 */
export function createConcurrencyManager(config?: ConcurrencyConfig): ConcurrencyManager {
  return new ConcurrencyManager(config)
}

/**
 * 创建去重管理器
 */
export function createDeduplicationManager(): DeduplicationManager {
  return new DeduplicationManager()
}

/**
 * 创建速率限制管理器
 */
export function createRateLimitManager(
  maxRequests?: number,
  timeWindow?: number
): RateLimitManager {
  return new RateLimitManager(maxRequests, timeWindow)
}
