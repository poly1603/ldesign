/**
 * 批量处理和并发控制模块
 * 优化大量操作的性能，控制并发数量，防止系统过载
 */

export interface BatchOptions {
  batchSize?: number
  concurrency?: number
  delay?: number
  onProgress?: (progress: number, total: number) => void
  onError?: (error: Error, item: any, index: number) => void
}

export interface QueueOptions {
  concurrency?: number
  timeout?: number
  retries?: number
  retryDelay?: number
}

/**
 * 批量处理器
 */
export class BatchProcessor {
  /**
   * 批量处理数组 - 优化内存使用
   */
  static async processInBatches<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>,
    options: BatchOptions = {}
  ): Promise<R[]> {
    const {
      batchSize = Math.min(100, Math.max(10, Math.floor(items.length / 10))), // 动态调整批次大小
      delay = 0,
      onProgress
    } = options

    const results: R[] = []
    const totalBatches = Math.ceil(items.length / batchSize)

    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize
      const end = Math.min(start + batchSize, items.length)
      const batch = items.slice(start, end)

      try {
        const batchResults = await processor(batch)
        results.push(...batchResults)

        if (onProgress) {
          onProgress(end, items.length)
        }

        if (delay > 0 && i < totalBatches - 1) {
          await this.sleep(delay)
        }
      } catch (error) {
        throw new Error(`Batch processing failed at batch ${i + 1}: ${error}`)
      }
    }

    return results
  }

  /**
   * 并发处理数组
   */
  static async processConcurrently<T, R>(
    items: T[],
    processor: (item: T, index: number) => Promise<R>,
    options: BatchOptions = {}
  ): Promise<R[]> {
    const {
      concurrency = 5,
      onProgress,
      onError
    } = options

    const results: R[] = Array.from({length: items.length})
    let completed = 0
    let currentIndex = 0

    const workers: Promise<void>[] = []

    const worker = async (): Promise<void> => {
      while (currentIndex < items.length) {
        const index = currentIndex++
        const item = items[index]

        try {
          results[index] = await processor(item, index)
        } catch (error) {
          if (onError) {
            onError(error as Error, item, index)
          } else {
            throw error
          }
        }

        completed++
        if (onProgress) {
          onProgress(completed, items.length)
        }
      }
    }

    // 创建工作协程
    for (let i = 0; i < Math.min(concurrency, items.length); i++) {
      workers.push(worker())
    }

    await Promise.all(workers)

    return results
  }

  /**
   * 分块处理大数组
   */
  static async* chunk<T>(
    items: T[],
    chunkSize: number
  ): AsyncGenerator<T[], void, unknown> {
    for (let i = 0; i < items.length; i += chunkSize) {
      yield items.slice(i, i + chunkSize)
    }
  }

  /**
   * 延迟执行
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * 任务队列 - 控制并发执行
 */
export class TaskQueue<T = any> {
  private queue: Array<{
    task: () => Promise<T>
    resolve: (value: T) => void
    reject: (error: Error) => void
  }> = []
  private running = 0
  private paused = false
  private options: Required<QueueOptions>

  constructor(options: QueueOptions = {}) {
    this.options = {
      concurrency: options.concurrency ?? 3,
      timeout: options.timeout ?? 30000,
      retries: options.retries ?? 3,
      retryDelay: options.retryDelay ?? 1000
    }
  }

  /**
   * 添加任务到队列
   */
  add<R = T>(task: () => Promise<R>): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        task: task as any,
        resolve: resolve as any,
        reject
      })

      if (!this.paused) {
        this.processNext()
      }
    })
  }

  /**
   * 批量添加任务
   */
  addAll<R = T>(tasks: Array<() => Promise<R>>): Promise<R[]> {
    const promises = tasks.map(task => this.add(task))
    return Promise.all(promises)
  }

  /**
   * 暂停队列
   */
  pause(): void {
    this.paused = true
  }

  /**
   * 恢复队列
   */
  resume(): void {
    this.paused = false
    this.processNext()
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue = []
  }

  /**
   * 获取队列状态
   */
  getStatus(): {
    pending: number
    running: number
    paused: boolean
  } {
    return {
      pending: this.queue.length,
      running: this.running,
      paused: this.paused
    }
  }

  private async processNext(): Promise<void> {
    if (this.paused || this.running >= this.options.concurrency || this.queue.length === 0) {
      return
    }

    const item = this.queue.shift()
    if (!item) return

    this.running++

    try {
      const result = await this.executeWithRetry(item.task)
      item.resolve(result)
    } catch (error) {
      item.reject(error as Error)
    } finally {
      this.running--
      this.processNext()
    }
  }

  private async executeWithRetry(task: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined

    for (let i = 0; i < this.options.retries; i++) {
      try {
        return await this.executeWithTimeout(task)
      } catch (error) {
        lastError = error as Error
        if (i < this.options.retries - 1) {
          await this.sleep(this.options.retryDelay)
        }
      }
    }

    throw lastError || new Error('Task failed')
  }

  private executeWithTimeout(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('Task timeout')),
        this.options.timeout
      )

      task()
        .then(result => {
          clearTimeout(timer)
          resolve(result)
        })
        .catch(error => {
          clearTimeout(timer)
          reject(error)
        })
    })
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * 限流器 - 控制操作频率
 */
export class RateLimiter {
  private tokens: number
  private lastRefill: number
  private queue: Array<() => void> = []

  constructor(
    private maxTokens: number,
    private refillRate: number // 每秒补充的令牌数
  ) {
    this.tokens = maxTokens
    this.lastRefill = Date.now()
    this.startRefillTimer()
  }

  /**
   * 获取令牌
   */
  async acquire(count = 1): Promise<void> {
    this.refill()

    if (this.tokens >= count) {
      this.tokens -= count
      return
    }

    // 等待令牌
    return new Promise(resolve => {
      this.queue.push(() => {
        this.tokens -= count
        resolve()
      })
    })
  }

  /**
   * 尝试获取令牌（非阻塞）
   */
  tryAcquire(count = 1): boolean {
    this.refill()

    if (this.tokens >= count) {
      this.tokens -= count
      return true
    }

    return false
  }

  private refill(): void {
    const now = Date.now()
    const elapsed = (now - this.lastRefill) / 1000
    const tokensToAdd = Math.floor(elapsed * this.refillRate)

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd)
      this.lastRefill = now
      this.processQueue()
    }
  }

  private processQueue(): void {
    while (this.queue.length > 0 && this.tokens > 0) {
      const task = this.queue.shift()
      if (task) task()
    }
  }

  private startRefillTimer(): void {
    setInterval(() => {
      this.refill()
    }, 1000 / this.refillRate)
  }
}

/**
 * 数据流处理器 - 处理大量数据流
 */
export class StreamProcessor<T, R> {
  private buffer: T[] = []
  private processing = false

  constructor(
    private processor: (items: T[]) => Promise<R[]>,
    private options: {
      bufferSize?: number
      flushInterval?: number
      onFlush?: (results: R[]) => void
    } = {}
  ) {
    const { flushInterval = 1000 } = options

    // 定期刷新缓冲区
    setInterval(() => {
      this.flush()
    }, flushInterval)
  }

  /**
   * 添加数据到流
   */
  async add(item: T): Promise<void> {
    this.buffer.push(item)

    const bufferSize = this.options.bufferSize ?? 100
    if (this.buffer.length >= bufferSize) {
      await this.flush()
    }
  }

  /**
   * 批量添加数据
   */
  async addBatch(items: T[]): Promise<void> {
    this.buffer.push(...items)

    const bufferSize = this.options.bufferSize ?? 100
    if (this.buffer.length >= bufferSize) {
      await this.flush()
    }
  }

  /**
   * 刷新缓冲区
   */
  async flush(): Promise<void> {
    if (this.processing || this.buffer.length === 0) {
      return
    }

    this.processing = true
    const items = this.buffer.splice(0, this.buffer.length)

    try {
      const results = await this.processor(items)
      if (this.options.onFlush) {
        this.options.onFlush(results)
      }
    } finally {
      this.processing = false
    }
  }

  /**
   * 获取缓冲区状态
   */
  getStatus(): {
    bufferSize: number
    processing: boolean
  } {
    return {
      bufferSize: this.buffer.length,
      processing: this.processing
    }
  }
}

/**
 * 并发控制装饰器
 */
export function Concurrent(limit = 1) {
  const queue = new TaskQueue({ concurrency: limit })

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      return queue.add(() => originalMethod.apply(this, args))
    }

    return descriptor
  }
}

/**
 * 限流装饰器
 */
export function RateLimit(maxCalls: number, perSeconds: number) {
  const limiter = new RateLimiter(maxCalls, maxCalls / perSeconds)

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      await limiter.acquire()
      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}