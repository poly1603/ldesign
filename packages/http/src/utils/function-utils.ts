/**
 * 函数工具模块
 * 
 * 提供内存化、重试、一次性函数等功能
 */

/**
 * 创建一次性函数
 * 
 * 确保函数只被执行一次，后续调用返回第一次的结果
 * 
 * @param fn - 要执行的函数
 * @returns 只执行一次的函数
 * 
 * @example
 * ```typescript
 * const initialize = once(() => {
 *   console.log('Initializing...')
 *   return { initialized: true }
 * })
 * 
 * initialize() // 输出: "Initializing..."
 * initialize() // 不输出，返回缓存的结果
 * ```
 */
export function once<T extends (...args: any[]) => any>(
  fn: T,
): T & { 
  called: boolean
  clear: () => void 
} {
  let called = false
  let result: ReturnType<T>

  function onceFunc(this: any, ...args: Parameters<T>): ReturnType<T> {
    if (!called) {
      called = true
      result = fn.apply(this, args)
    }
    return result
  }

  function clear(): void {
    called = false
    result = undefined as any
  }

  const enhanced = onceFunc as T & {
    called: boolean
    clear: () => void
  }

  Object.defineProperty(enhanced, 'called', {
    get: () => called,
  })

  enhanced.clear = clear

  return enhanced
}

/**
 * 内存化配置
 */
export interface MemoizeOptions {
  /** 最大缓存数量 */
  maxSize?: number
  /** 缓存过期时间（毫秒） */
  ttl?: number
  /** 是否使用WeakMap（仅对象类型参数） */
  weak?: boolean
  /** 自定义键生成函数 */
  keyFn?: (...args: any[]) => string
  /** 自定义相等比较函数 */
  equalFn?: (a: any, b: any) => boolean
}

/**
 * 内存化函数
 * 
 * 缓存函数的执行结果，相同输入返回缓存值
 * 
 * @param fn - 要内存化的函数
 * @param options - 内存化选项
 * @returns 内存化后的函数
 * 
 * @example
 * ```typescript
 * const expensiveCalculation = memoize((a: number, b: number) => {
 *   console.log('Calculating...')
 *   return a * b
 * })
 * 
 * expensiveCalculation(2, 3) // 输出: "Calculating..." 返回: 6
 * expensiveCalculation(2, 3) // 不输出，直接返回: 6
 * ```
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: MemoizeOptions = {},
): T & { 
  cache: Map<string, any>
  clear: () => void
  delete: (key: string) => boolean
  has: (key: string) => boolean
} {
  const {
    maxSize = Infinity,
    ttl,
    keyFn = (...args) => JSON.stringify(args),
  } = options

  const cache = new Map<string, { value: ReturnType<T>, timestamp?: number }>()

  function isExpired(timestamp?: number): boolean {
    if (!ttl || !timestamp) return false
    return Date.now() - timestamp > ttl
  }

  function memoized(this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = keyFn(...args)

    if (cache.has(key)) {
      const cached = cache.get(key)!
      if (!isExpired(cached.timestamp)) {
        // 移到最前面（LRU）
        cache.delete(key)
        cache.set(key, cached)
        return cached.value
      } else {
        cache.delete(key)
      }
    }

    const result = fn.apply(this, args)
    
    // 限制缓存大小
    if (cache.size >= maxSize) {
      // 删除最旧的（第一个）
      const firstKey = cache.keys().next().value as string | undefined
      if (firstKey !== undefined) {
        cache.delete(firstKey)
      }
    }

    cache.set(key, {
      value: result,
      timestamp: ttl ? Date.now() : undefined,
    })

    return result
  }

  const enhanced = memoized as T & {
    cache: Map<string, any>
    clear: () => void
    delete: (key: string) => boolean
    has: (key: string) => boolean
  }

  enhanced.cache = cache as any
  enhanced.clear = () => cache.clear()
  enhanced.delete = (key: string) => cache.delete(key)
  enhanced.has = (key: string) => {
    if (!cache.has(key)) return false
    const cached = cache.get(key)!
    if (isExpired(cached.timestamp)) {
      cache.delete(key)
      return false
    }
    return true
  }

  return enhanced
}

/**
 * 重试配置
 */
export interface RetryOptions {
  /** 最大重试次数 */
  maxAttempts?: number
  /** 初始延迟（毫秒） */
  delay?: number
  /** 延迟增长因子 */
  factor?: number
  /** 最大延迟（毫秒） */
  maxDelay?: number
  /** 抖动 */
  jitter?: boolean
  /** 重试条件 */
  retryCondition?: (error: any) => boolean
  /** 重试回调 */
  onRetry?: (attempt: number, error: any) => void
}

/**
 * 重试函数
 * 
 * 在失败时自动重试函数执行
 * 
 * @param fn - 要执行的函数
 * @param options - 重试选项
 * @returns Promise
 * 
 * @example
 * ```typescript
 * const result = await retry(
 *   () => fetch('/api/data'),
 *   { maxAttempts: 3, delay: 1000 }
 * )
 * ```
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    factor = 2,
    maxDelay = 30000,
    jitter = true,
    retryCondition = () => true,
    onRetry,
  } = options

  let lastError: any
  let currentDelay = delay

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt < maxAttempts && retryCondition(error)) {
        onRetry?.(attempt, error)
        
        // 计算延迟
        if (jitter) {
          // 添加随机抖动（±25%）
          const jitterFactor = 0.75 + Math.random() * 0.5
          currentDelay = Math.min(currentDelay * jitterFactor, maxDelay)
        }
        
        await new Promise(resolve => setTimeout(resolve, currentDelay))
        
        // 增加延迟
        currentDelay = Math.min(currentDelay * factor, maxDelay)
      } else {
        break
      }
    }
  }

  throw lastError
}

/**
 * 创建可重试函数
 */
export function createRetryableFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {},
): T {
  function retryable(this: any, ...args: Parameters<T>): ReturnType<T> {
    return retry(() => fn.apply(this, args), options) as ReturnType<T>
  }

  return retryable as unknown as T
}

/**
 * 延迟执行
 * 
 * @param ms - 延迟时间（毫秒）
 * @returns Promise
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 超时配置
 */
export interface TimeoutOptions {
  /** 超时错误信息 */
  message?: string
  /** 超时错误 */
  error?: Error
  /** 是否可取消 */
  cancellable?: boolean
}

/**
 * 超时Promise包装器
 * 
 * 为Promise添加超时限制
 * 
 * @param promise - 原始Promise
 * @param ms - 超时时间（毫秒）
 * @param options - 超时选项
 * @returns 带超时的Promise
 * 
 * @example
 * ```typescript
 * const result = await timeout(
 *   fetch('/api/data'),
 *   5000,
 *   { message: 'Request timeout' }
 * )
 * ```
 */
export function timeout<T>(
  promise: Promise<T>,
  ms: number,
  options: TimeoutOptions = {},
): Promise<T> & { cancel?: () => void } {
  const {
    message = 'Timeout',
    error = new Error(message),
    cancellable = false,
  } = options

  let timeoutId: ReturnType<typeof setTimeout>
  let cancelled = false

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      if (!cancelled) {
        reject(error)
      }
    }, ms)
  })

  const result = Promise.race([
    promise,
    timeoutPromise,
  ]).finally(() => {
    clearTimeout(timeoutId)
  }) as Promise<T> & { cancel?: () => void }

  if (cancellable) {
    result.cancel = () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }

  return result
}

/**
 * 并发控制器
 */
export class ConcurrencyController {
  private running = 0
  private queue: Array<() => void> = []

  constructor(private maxConcurrency: number) {}

  /**
   * 执行任务
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    while (this.running >= this.maxConcurrency) {
      await new Promise<void>(resolve => {
        this.queue.push(resolve)
      })
    }

    this.running++
    
    try {
      return await fn()
    } finally {
      this.running--
      const next = this.queue.shift()
      if (next) {
        next()
      }
    }
  }

  /**
   * 并发执行多个任务
   */
  async executeAll<T>(
    tasks: Array<() => Promise<T>>,
  ): Promise<T[]> {
    return Promise.all(
      tasks.map(task => this.execute(task)),
    )
  }

  /**
   * 获取当前运行数量
   */
  getRunning(): number {
    return this.running
  }

  /**
   * 获取队列长度
   */
  getQueueLength(): number {
    return this.queue.length
  }
}

/**
 * 并发执行
 * 
 * 限制并发执行的任务数量
 * 
 * @param tasks - 任务列表
 * @param limit - 并发限制
 * @returns 结果数组
 * 
 * @example
 * ```typescript
 * const results = await concurrent(
 *   urls.map(url => () => fetch(url)),
 *   3 // 最多3个并发请求
 * )
 * ```
 */
export async function concurrent<T>(
  tasks: Array<() => Promise<T>>,
  limit: number,
): Promise<T[]> {
  const controller = new ConcurrencyController(limit)
  return controller.executeAll(tasks)
}

/**
 * 创建串行执行器
 * 
 * 确保异步函数按顺序执行
 */
export function createSerialExecutor<T extends (...args: any[]) => Promise<any>>(): 
  (fn: T, ...args: Parameters<T>) => ReturnType<T> {
  let queue = Promise.resolve()

  return function execute(fn: T, ...args: Parameters<T>): ReturnType<T> {
    const result = queue.then(() => fn(...args))
    queue = result.catch(() => {}) // 忽略错误，继续队列
    return result as ReturnType<T>
  }
}

/**
 * 创建并行执行器
 * 
 * 批量并行执行函数
 */
export function createParallelExecutor(
  maxConcurrency = 10,
): <T>(tasks: Array<() => Promise<T>>) => Promise<T[]> {
  const controller = new ConcurrencyController(maxConcurrency)
  
  return function execute<T>(tasks: Array<() => Promise<T>>): Promise<T[]> {
    return controller.executeAll(tasks)
  }
}

/**
 * 创建延迟执行器
 */
export function defer<T extends (...args: any[]) => any>(
  fn: T,
  delay = 0,
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async function(...args: Parameters<T>): Promise<ReturnType<T>> {
    await sleep(delay)
    return fn(...args)
  }
}

/**
 * 创建条件执行器
 */
export function conditional<T extends (...args: any[]) => any>(
  condition: (...args: Parameters<T>) => boolean,
  trueFn: T,
  falseFn?: T,
): T {
  return function(this: any, ...args: Parameters<T>): ReturnType<T> {
    if (condition(...args)) {
      return trueFn.apply(this, args)
    } else if (falseFn) {
      return falseFn.apply(this, args)
    }
    return undefined as any
  } as T
}