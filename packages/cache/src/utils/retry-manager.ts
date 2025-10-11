/**
 * 重试策略
 */
export type RetryStrategy = 'exponential' | 'linear' | 'fixed' | 'fibonacci'

/**
 * 重试配置
 */
export interface RetryOptions {
  /** 最大重试次数 */
  maxAttempts?: number
  /** 初始延迟（毫秒） */
  initialDelay?: number
  /** 最大延迟（毫秒） */
  maxDelay?: number
  /** 延迟因子 */
  factor?: number
  /** 重试策略 */
  strategy?: RetryStrategy
  /** 是否在重试时添加抖动 */
  jitter?: boolean
  /** 判断是否应该重试的函数 */
  shouldRetry?: (error: Error, attempt: number) => boolean
  /** 重试前的回调 */
  onRetry?: (error: Error, attempt: number) => void
  /** 超时时间（毫秒） */
  timeout?: number
}

/**
 * 重试结果
 */
export interface RetryResult<T> {
  /** 是否成功 */
  success: boolean
  /** 返回值 */
  data?: T
  /** 错误 */
  error?: Error
  /** 尝试次数 */
  attempts: number
  /** 总耗时 */
  totalDuration: number
}

/**
 * 断路器状态
 */
export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

/**
 * 断路器配置
 */
export interface CircuitBreakerOptions {
  /** 失败阈值 */
  failureThreshold?: number
  /** 成功阈值（半开状态） */
  successThreshold?: number
  /** 超时时间（毫秒） */
  timeout?: number
  /** 重置时间（毫秒） */
  resetTimeout?: number
  /** 监控窗口大小 */
  windowSize?: number
}

/**
 * 重试管理器
 * 
 * 提供自动重试、断路器、降级等容错机制
 */
export class RetryManager {
  private readonly defaultOptions: Required<RetryOptions> = {
    maxAttempts: 3,
    initialDelay: 100,
    maxDelay: 10000,
    factor: 2,
    strategy: 'exponential',
    jitter: true,
    shouldRetry: () => true,
    onRetry: () => {},
    timeout: 30000,
  }

  /**
   * 执行带重试的操作
   */
  async retry<T>(
    fn: () => Promise<T>,
    options?: RetryOptions,
  ): Promise<RetryResult<T>> {
    const opts = { ...this.defaultOptions, ...options }
    const startTime = Date.now()
    let lastError: Error | undefined

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
      try {
        // 设置超时
        const result = await this.withTimeout(fn(), opts.timeout)
        
        return {
          success: true,
          data: result,
          attempts: attempt,
          totalDuration: Date.now() - startTime,
        }
      }
      catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        // 检查是否应该重试
        if (attempt === opts.maxAttempts || !opts.shouldRetry(lastError, attempt)) {
          break
        }

        // 调用重试回调
        opts.onRetry(lastError, attempt)

        // 计算延迟
        const delay = this.calculateDelay(attempt, opts)
        await this.sleep(delay)
      }
    }

    return {
      success: false,
      error: lastError,
      attempts: opts.maxAttempts,
      totalDuration: Date.now() - startTime,
    }
  }

  /**
   * 计算重试延迟
   */
  private calculateDelay(attempt: number, options: Required<RetryOptions>): number {
    let delay: number

    switch (options.strategy) {
      case 'exponential':
        delay = Math.min(
          options.initialDelay * options.factor ** (attempt - 1),
          options.maxDelay,
        )
        break

      case 'linear':
        delay = Math.min(
          options.initialDelay * attempt,
          options.maxDelay,
        )
        break

      case 'fibonacci':
        delay = Math.min(
          this.fibonacci(attempt) * options.initialDelay,
          options.maxDelay,
        )
        break

      case 'fixed':
      default:
        delay = options.initialDelay
        break
    }

    // 添加抖动
    if (options.jitter) {
      delay = delay * (0.5 + Math.random())
    }

    return delay
  }

  /**
   * 斐波那契数列
   */
  private fibonacci(n: number): number {
    if (n <= 1) { return n }
    let a = 0
    let b = 1
    for (let i = 2; i <= n; i++) {
      [a, b] = [b, a + b]
    }
    return b
  }

  /**
   * 添加超时
   */
  private async withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timeout')), timeout),
      ),
    ])
  }

  /**
   * 休眠
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * 断路器
 * 
 * 防止故障级联，提供快速失败机制
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = 'CLOSED'
  private failureCount = 0
  private successCount = 0
  private lastFailureTime?: number
  private readonly requests: boolean[] = []

  private readonly options: Required<CircuitBreakerOptions>

  constructor(options: CircuitBreakerOptions = {}) {
    this.options = {
      failureThreshold: 5,
      successThreshold: 3,
      timeout: 10000,
      resetTimeout: 30000,
      windowSize: 10,
      ...options,
    }
  }

  /**
   * 执行操作
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // 检查断路器状态
    if (this.state === 'OPEN') {
      // 检查是否可以进入半开状态
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN'
      }
      else {
        throw new Error('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await this.withTimeout(fn())
      this.onSuccess()
      return result
    }
    catch (error) {
      this.onFailure()
      throw error
    }
  }

  /**
   * 成功处理
   */
  private onSuccess(): void {
    this.recordRequest(true)

    if (this.state === 'HALF_OPEN') {
      this.successCount++
      if (this.successCount >= this.options.successThreshold) {
        this.reset()
      }
    }
  }

  /**
   * 失败处理
   */
  private onFailure(): void {
    this.recordRequest(false)
    this.lastFailureTime = Date.now()

    if (this.state === 'HALF_OPEN') {
      this.trip()
    }
    else if (this.state === 'CLOSED') {
      this.failureCount++
      if (this.getFailureRate() >= this.options.failureThreshold / this.options.windowSize) {
        this.trip()
      }
    }
  }

  /**
   * 记录请求
   */
  private recordRequest(success: boolean): void {
    this.requests.push(success)
    if (this.requests.length > this.options.windowSize) {
      this.requests.shift()
    }
  }

  /**
   * 获取失败率
   */
  private getFailureRate(): number {
    if (this.requests.length === 0) { return 0 }
    const failures = this.requests.filter(r => !r).length
    return failures / this.requests.length
  }

  /**
   * 是否应该尝试重置
   */
  private shouldAttemptReset(): boolean {
    return (
      this.lastFailureTime !== undefined
      && Date.now() - this.lastFailureTime >= this.options.resetTimeout
    )
  }

  /**
   * 触发断路器
   */
  private trip(): void {
    this.state = 'OPEN'
    this.successCount = 0
  }

  /**
   * 重置断路器
   */
  private reset(): void {
    this.state = 'CLOSED'
    this.failureCount = 0
    this.successCount = 0
    this.requests.length = 0
  }

  /**
   * 添加超时
   */
  private async withTimeout<T>(promise: Promise<T>): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timeout')), this.options.timeout),
      ),
    ])
  }

  /**
   * 获取状态
   */
  getState(): CircuitBreakerState {
    return this.state
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    state: CircuitBreakerState
    failureCount: number
    successCount: number
    failureRate: number
  } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      failureRate: this.getFailureRate(),
    }
  }
}

/**
 * 降级处理器
 * 
 * 提供降级策略，当主服务不可用时使用备用方案
 */
export class FallbackHandler<T> {
  private fallbacks: Array<() => Promise<T>> = []

  /**
   * 添加降级方案
   */
  addFallback(fallback: () => Promise<T>): this {
    this.fallbacks.push(fallback)
    return this
  }

  /**
   * 执行操作，失败时尝试降级
   */
  async execute(
    primary: () => Promise<T>,
    options?: {
      onFallback?: (level: number, error: Error) => void
    },
  ): Promise<T> {
    const errors: Error[] = []

    // 尝试主操作
    try {
      return await primary()
    }
    catch (error) {
      errors.push(error instanceof Error ? error : new Error(String(error)))
    }

    // 尝试降级方案
    for (let i = 0; i < this.fallbacks.length; i++) {
      try {
        const result = await this.fallbacks[i]()
        options?.onFallback?.(i + 1, errors[errors.length - 1])
        return result
      }
      catch (error) {
        errors.push(error instanceof Error ? error : new Error(String(error)))
      }
    }

    // 所有方案都失败
    throw new ((globalThis as any).AggregateError || Error)(errors, 'All fallback strategies failed')
  }
}

/**
 * 创建带重试的函数
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: RetryOptions,
): T {
  const retryManager = new RetryManager()
  
  return (async (...args: Parameters<T>) => {
    const result = await retryManager.retry(async () => fn(...args), options)
    if (result.success) {
      return result.data
    }
    throw result.error
  }) as T
}

/**
 * 创建带断路器的函数
 */
export function withCircuitBreaker<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: CircuitBreakerOptions,
): T {
  const circuitBreaker = new CircuitBreaker(options)
  
  return (async (...args: Parameters<T>) => {
    return circuitBreaker.execute(async () => fn(...args))
  }) as T
}

/**
 * 创建带降级的函数
 */
export function withFallback<T>(
  primary: () => Promise<T>,
  ...fallbacks: Array<() => Promise<T>>
): () => Promise<T> {
  const handler = new FallbackHandler<T>()
  fallbacks.forEach(fb => handler.addFallback(fb))
  
  return async () => handler.execute(primary)
}
