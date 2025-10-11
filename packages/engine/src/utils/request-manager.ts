/**
 * 请求重试和超时管理器
 * 🔄 提供智能的请求重试、超时控制和错误处理
 */

/**
 * 重试策略
 */
export type RetryStrategy = 'exponential' | 'linear' | 'fixed'

/**
 * 请求配置
 */
export interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
  retries?: number
  retryDelay?: number
  retryStrategy?: RetryStrategy
  retryCondition?: (error: Error, attempt: number) => boolean
  onRetry?: (attempt: number, error: Error) => void
  signal?: AbortSignal
}

/**
 * 请求结果
 */
export interface RequestResult<T = unknown> {
  data?: T
  error?: Error
  status?: number
  headers?: Headers
  attempts: number
  totalTime: number
  success: boolean
}

/**
 * 请求管理器配置
 */
export interface RequestManagerConfig {
  defaultTimeout?: number
  defaultRetries?: number
  defaultRetryDelay?: number
  defaultRetryStrategy?: RetryStrategy
  maxConcurrent?: number
}

/**
 * 请求管理器类
 */
export class RequestManager {
  private config: Required<RequestManagerConfig>
  private activeRequests: Map<string, AbortController> = new Map()
  private requestQueue: Array<() => Promise<void>> = []
  private runningCount = 0

  constructor(config: RequestManagerConfig = {}) {
    this.config = {
      defaultTimeout: 30000,
      defaultRetries: 3,
      defaultRetryDelay: 1000,
      defaultRetryStrategy: 'exponential',
      maxConcurrent: 6,
      ...config,
    }
  }

  /**
   * 执行请求（带重试和超时）
   */
  async request<T = unknown>(config: RequestConfig): Promise<RequestResult<T>> {
    const startTime = performance.now()
    const {
      url,
      method = 'GET',
      headers = {},
      body,
      timeout = this.config.defaultTimeout,
      retries = this.config.defaultRetries,
      retryDelay = this.config.defaultRetryDelay,
      retryStrategy = this.config.defaultRetryStrategy,
      retryCondition,
      onRetry,
      signal,
    } = config

    let attempts = 0
    let lastError: Error | undefined

    while (attempts <= retries) {
      attempts++

      try {
        const controller = new AbortController()
        const requestId = `${method}-${url}-${Date.now()}`
        this.activeRequests.set(requestId, controller)

        // 设置超时
        const timeoutId = setTimeout(() => {
          controller.abort()
        }, timeout)

        // 合并信号
        const combinedSignal = signal
          ? this.combineSignals([signal, controller.signal])
          : controller.signal

        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: combinedSignal,
        })

        clearTimeout(timeoutId)
        this.activeRequests.delete(requestId)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        const totalTime = performance.now() - startTime

        return {
          data,
          status: response.status,
          headers: response.headers,
          attempts,
          totalTime,
          success: true,
        }
      } catch (error) {
        lastError = error as Error

        // 检查是否应该重试
        const shouldRetry = retryCondition
          ? retryCondition(lastError, attempts)
          : this.shouldRetry(lastError, attempts, retries)

        if (!shouldRetry) {
          break
        }

        // 调用重试回调
        if (onRetry) {
          onRetry(attempts, lastError)
        }

        // 等待重试延迟
        if (attempts <= retries) {
          const delay = this.calculateDelay(attempts, retryDelay, retryStrategy)
          await this.sleep(delay)
        }
      }
    }

    const totalTime = performance.now() - startTime

    return {
      error: lastError,
      attempts,
      totalTime,
      success: false,
    }
  }

  /**
   * GET请求
   */
  async get<T = unknown>(
    url: string,
    config?: Omit<RequestConfig, 'url' | 'method'>
  ): Promise<RequestResult<T>> {
    return this.request<T>({ url, method: 'GET', ...config })
  }

  /**
   * POST请求
   */
  async post<T = unknown>(
    url: string,
    body?: unknown,
    config?: Omit<RequestConfig, 'url' | 'method' | 'body'>
  ): Promise<RequestResult<T>> {
    return this.request<T>({ url, method: 'POST', body, ...config })
  }

  /**
   * PUT请求
   */
  async put<T = unknown>(
    url: string,
    body?: unknown,
    config?: Omit<RequestConfig, 'url' | 'method' | 'body'>
  ): Promise<RequestResult<T>> {
    return this.request<T>({ url, method: 'PUT', body, ...config })
  }

  /**
   * DELETE请求
   */
  async delete<T = unknown>(
    url: string,
    config?: Omit<RequestConfig, 'url' | 'method'>
  ): Promise<RequestResult<T>> {
    return this.request<T>({ url, method: 'DELETE', ...config })
  }

  /**
   * 批量请求（带并发控制）
   */
  async batch<T = unknown>(
    configs: RequestConfig[]
  ): Promise<RequestResult<T>[]> {
    const results: RequestResult<T>[] = []
    const queue = [...configs]

    while (queue.length > 0 || this.runningCount > 0) {
      while (this.runningCount < this.config.maxConcurrent && queue.length > 0) {
        const config = queue.shift()!
        this.runningCount++

        this.request<T>(config)
          .then(result => {
            results.push(result)
          })
          .finally(() => {
            this.runningCount--
          })
      }

      await this.sleep(10)
    }

    return results
  }

  /**
   * 取���所有活动请求
   */
  cancelAll(): void {
    this.activeRequests.forEach(controller => {
      controller.abort()
    })
    this.activeRequests.clear()
  }

  /**
   * 取消指定请求
   */
  cancel(requestId: string): boolean {
    const controller = this.activeRequests.get(requestId)
    if (controller) {
      controller.abort()
      this.activeRequests.delete(requestId)
      return true
    }
    return false
  }

  /**
   * 获取活动请求数量
   */
  getActiveCount(): number {
    return this.activeRequests.size
  }

  /**
   * 判断是否应该重试
   */
  private shouldRetry(error: Error, attempt: number, maxRetries: number): boolean {
    if (attempt > maxRetries) {
      return false
    }

    // 不重试取消的请求
    if (error.name === 'AbortError') {
      return false
    }

    // 对于网络错误和超时，应该重试
    if (
      error.message.includes('NetworkError') ||
      error.message.includes('timeout') ||
      error.message.includes('fetch')
    ) {
      return true
    }

    return false
  }

  /**
   * 计算重试延迟
   */
  private calculateDelay(
    attempt: number,
    baseDelay: number,
    strategy: RetryStrategy
  ): number {
    switch (strategy) {
      case 'exponential':
        return baseDelay * 2 ** (attempt - 1)
      case 'linear':
        return baseDelay * attempt
      case 'fixed':
      default:
        return baseDelay
    }
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 合并多个AbortSignal
   */
  private combineSignals(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController()

    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort()
        break
      }

      signal.addEventListener('abort', () => {
        controller.abort()
      })
    }

    return controller.signal
  }
}

/**
 * 超时Promise包装器
 */
export class TimeoutPromise<T> {
  private timeoutId?: NodeJS.Timeout
  private aborted = false

  constructor(
    private promise: Promise<T>,
    private timeout: number,
    private onTimeout?: () => void
  ) {}

  /**
   * 执行带超时的Promise
   */
  async run(): Promise<T> {
    return Promise.race([
      this.promise,
      new Promise<T>((_, reject) => {
        this.timeoutId = setTimeout(() => {
          this.aborted = true
          if (this.onTimeout) {
            this.onTimeout()
          }
          reject(new Error(`Operation timed out after ${this.timeout}ms`))
        }, this.timeout)
      }),
    ]).finally(() => {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId)
      }
    })
  }

  /**
   * 取消超时
   */
  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.aborted = true
    }
  }

  /**
   * 检查是否已超时
   */
  isAborted(): boolean {
    return this.aborted
  }
}

/**
 * 创建带超时的Promise
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeout: number,
  onTimeout?: () => void
): Promise<T> {
  return new TimeoutPromise(promise, timeout, onTimeout).run()
}

/**
 * 重试函数包装器
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number
    delay?: number
    strategy?: RetryStrategy
    onRetry?: (attempt: number, error: Error) => void
    retryCondition?: (error: Error, attempt: number) => boolean
  } = {}
): Promise<T> {
  const {
    retries = 3,
    delay = 1000,
    strategy = 'exponential',
    onRetry,
    retryCondition,
  } = options

  let attempt = 0
  let lastError: Error | undefined

  while (attempt <= retries) {
    attempt++

    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      const shouldRetry = retryCondition
        ? retryCondition(lastError, attempt)
        : attempt <= retries

      if (!shouldRetry) {
        throw lastError
      }

      if (onRetry) {
        onRetry(attempt, lastError)
      }

      if (attempt <= retries) {
        const calculatedDelay = (() => {
          switch (strategy) {
            case 'exponential':
              return delay * 2 ** (attempt - 1)
            case 'linear':
              return delay * attempt
            case 'fixed':
            default:
              return delay
          }
        })()

        await new Promise(resolve => setTimeout(resolve, calculatedDelay))
      }
    }
  }

  throw lastError || new Error('Retry failed')
}

/**
 * 全局请求管理器实例
 */
let globalRequestManager: RequestManager | null = null

/**
 * 获取全局请求管理器
 */
export function getGlobalRequestManager(): RequestManager {
  if (!globalRequestManager) {
    globalRequestManager = new RequestManager()
  }
  return globalRequestManager
}

/**
 * 设置全局请求管理器
 */
export function setGlobalRequestManager(manager: RequestManager): void {
  globalRequestManager = manager
}

/**
 * 快捷请求函数
 */
export const request = {
  get: <T = unknown>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>) =>
    getGlobalRequestManager().get<T>(url, config),
  post: <T = unknown>(url: string, body?: unknown, config?: Omit<RequestConfig, 'url' | 'method' | 'body'>) =>
    getGlobalRequestManager().post<T>(url, body, config),
  put: <T = unknown>(url: string, body?: unknown, config?: Omit<RequestConfig, 'url' | 'method' | 'body'>) =>
    getGlobalRequestManager().put<T>(url, body, config),
  delete: <T = unknown>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>) =>
    getGlobalRequestManager().delete<T>(url, config),
  batch: <T = unknown>(configs: RequestConfig[]) =>
    getGlobalRequestManager().batch<T>(configs),
  cancelAll: () => getGlobalRequestManager().cancelAll(),
}
