/**
 * 实用工具函数模块
 * 
 * 提供防抖、节流、请求合并等常用功能
 */

/**
 * 防抖函数
 * 
 * 在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时
 * 
 * @param fn - 要防抖的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的函数
 * 
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   
 * }, 300)
 * 
 * // 只有最后一次调用会执行
 * debouncedSearch('a')
 * debouncedSearch('ab')
 * debouncedSearch('abc') // 300ms后执行
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args)
      timeoutId = null
    }, delay)
  }
}

/**
 * 节流函数
 * 
 * 规定时间内只触发一次函数，适用于高频事件
 * 
 * @param fn - 要节流的函数
 * @param limit - 时间间隔（毫秒）
 * @returns 节流后的函数
 * 
 * @example
 * ```typescript
 * const throttledScroll = throttle(() => {
 *   
 * }, 100)
 * 
 * window.addEventListener('scroll', throttledScroll)
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false
  let lastResult: ReturnType<T>

  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      inThrottle = true
      lastResult = fn.apply(this, args)

      setTimeout(() => {
        inThrottle = false
      }, limit)
    }

    return lastResult
  }
}

/**
 * 请求合并器配置
 */
export interface BatchRequestConfig<TInput = unknown, TOutput = unknown> {
  /** 最大批量大小 */
  maxBatchSize?: number
  /** 等待时间（毫秒） */
  delay?: number
  /** 批量请求执行器 */
  batchFn: (items: TInput[]) => Promise<TOutput[]>
}

/**
 * 创建请求合并器
 * 
 * 将多个单独的请求合并为一个批量请求，减少网络往返
 * 
 * @param config - 批量请求配置
 * @returns 合并后的请求函数
 * 
 * @example
 * ```typescript
 * const getUsersBatch = createBatchRequest({
 *   maxBatchSize: 100,
 *   delay: 10,
 *   batchFn: async (userIds) => {
 *     return fetch('/api/users/batch', {
 *       method: 'POST',
 *       body: JSON.stringify({ ids: userIds })
 *     }).then(r => r.json())
 *   }
 * })
 * 
 * // 这些调用会被合并成一个批量请求
 * const user1 = await getUsersBatch(1)
 * const user2 = await getUsersBatch(2)
 * const user3 = await getUsersBatch(3)
 * ```
 */
export function createBatchRequest<TInput, TOutput>(
  config: BatchRequestConfig<TInput, TOutput>,
): (input: TInput) => Promise<TOutput> {
  const {
    maxBatchSize = 100,
    delay = 10,
    batchFn,
  } = config

  const queue: Array<{
    input: TInput
    resolve: (value: TOutput) => void
    reject: (error: any) => void
  }> = []
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  async function processBatch() {
    if (queue.length === 0) return

    const batch = queue.splice(0, maxBatchSize)
    const inputs = batch.map(item => item.input)

    try {
      const results = await batchFn(inputs)

      batch.forEach((item, index) => {
        item.resolve(results[index])
      })
    }
    catch (error) {
      batch.forEach((item) => {
        item.reject(error)
      })
    }

    // 如果还有剩余项，继续处理
    if (queue.length > 0) {
      timeoutId = setTimeout(processBatch, 0)
    }
    else {
      timeoutId = null
    }
  }

  function scheduleBatch() {
    if (timeoutId !== null) return

    timeoutId = setTimeout(processBatch, delay)
  }

  return function (input: TInput): Promise<TOutput> {
    return new Promise((resolve, reject) => {
      queue.push({ input, resolve, reject })

      if (queue.length >= maxBatchSize) {
        if (timeoutId !== null) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        processBatch()
      }
      else {
        scheduleBatch()
      }
    })
  }
}

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
 *   
 *   return { initialized: true }
 * })
 * 
 * initialize() // 输出: "Initializing..."
 * initialize() // 不输出，返回缓存的结果
 * ```
 */
export function once<T extends (...args: any[]) => any>(
  fn: T,
): (...args: Parameters<T>) => ReturnType<T> {
  let called = false
  let result: ReturnType<T>

  return function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
    if (!called) {
      called = true
      result = fn.apply(this, args)
    }
    return result
  }
}

/**
 * 内存化函数
 * 
 * 缓存函数的执行结果，相同输入返回缓存值
 * 
 * @param fn - 要内存化的函数
 * @param keyFn - 生成缓存键的函数，默认使用JSON.stringify
 * @returns 内存化后的函数
 * 
 * @example
 * ```typescript
 * const expensiveCalculation = memoize((a: number, b: number) => {
 *   
 *   return a * b
 * })
 * 
 * expensiveCalculation(2, 3) // 输出: "Calculating..." 返回: 6
 * expensiveCalculation(2, 3) // 不输出，直接返回: 6
 * ```
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyFn?: (...args: Parameters<T>) => string,
): T & { cache: Map<string, ReturnType<T>>, clear: () => void } {
  const cache = new Map<string, ReturnType<T>>()

  const memoized = function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  } as T & { cache: Map<string, ReturnType<T>>, clear: () => void }

  memoized.cache = cache
  memoized.clear = () => cache.clear()

  return memoized
}

/**
 * 重试函数
 * 
 * 在失败时自动重试函数执行
 * 
 * @param fn - 要执行的函数
 * @param options - 重试选项
 * @param options.maxAttempts - 最大尝试次数，默认3
 * @param options.delay - 重试延迟基数（毫秒），默认1000
 * @param options.onRetry - 重试回调函数
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
  options: {
    maxAttempts?: number
    delay?: number
    onRetry?: (attempt: number, error: Error) => void
  } = {},
): Promise<T> {
  const { maxAttempts = 3, delay = 1000, onRetry } = options
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    }
    catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxAttempts) {
        onRetry?.(attempt, lastError)
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
  }

  throw lastError || new Error('Unknown error')
}

/**
 * 链式调用构建器
 * 
 * 创建支持链式调用的配置构建器
 * 
 * @example
 * ```typescript
 * interface Config {
 *   url: string
 *   method: string
 *   headers: Record<string, string>
 * }
 * 
 * const builder = createChainBuilder<Config>({
 *   url: '',
 *   method: 'GET',
 *   headers: {}
 * })
 * 
 * const config = builder
 *   .set('url', '/api/users')
 *   .set('method', 'POST')
 *   .merge('headers', { 'Content-Type': 'application/json' })
 *   .build()
 * ```
 */
export function createChainBuilder<T extends Record<string, unknown>>(
  initial: T,
) {
  let config = { ...initial }

  return {
    set<K extends keyof T>(key: K, value: T[K]) {
      config[key] = value
      return this
    },
    merge<K extends keyof T>(key: K, value: Partial<T[K]>) {
      if (typeof config[key] === 'object' && typeof value === 'object') {
        config[key] = { ...config[key], ...value }
      }
      return this
    },
    reset() {
      config = { ...initial }
      return this
    },
    build(): T {
      return { ...config }
    },
    get current(): Readonly<T> {
      return config
    },
  }
}

/**
 * 对象键值对安全访问
 * 
 * 安全获取嵌套对象的值，避免 undefined 错误
 * 
 * @param obj - 目标对象
 * @param path - 属性路径
 * @param defaultValue - 默认值
 * @returns 属性值或默认值
 * 
 * @example
 * ```typescript
 * const obj = { user: { profile: { name: 'John' } } }
 * 
 * get(obj, 'user.profile.name') // 'John'
 * get(obj, 'user.profile.age', 18) // 18
 * get(obj, 'user.settings.theme') // undefined
 * ```
 */
export function get<T = unknown>(
  obj: unknown,
  path: string,
  defaultValue?: T,
): T | undefined {
  const keys = path.split('.')
  let result: any = obj

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue
    }
    result = result[key]
  }

  return result !== undefined ? result : defaultValue
}

/**
 * 安全地设置嵌套对象的值
 * 
 * @param obj - 目标对象
 * @param path - 属性路径
 * @param value - 要设置的值
 * 
 * @example
 * ```typescript
 * const obj = {}
 * set(obj, 'user.profile.name', 'John')
 * // obj 变为: { user: { profile: { name: 'John' } } }
 * ```
 */
export function set(obj: Record<string, any>, path: string, value: unknown): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  let current = obj

  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }

  current[lastKey] = value
}

/**
 * 深度冻结对象
 * 
 * 递归冻结对象及其所有嵌套对象
 * 
 * @param obj - 要冻结的对象
 * @returns 冻结后的对象
 */
export function deepFreeze<T>(obj: T): Readonly<T> {
  Object.freeze(obj)

  Object.values(obj as any).forEach((value) => {
    if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
      deepFreeze(value)
    }
  })

  return obj
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
 * 超时Promise包装器
 * 
 * 为Promise添加超时限制
 * 
 * @param promise - 原始Promise
 * @param ms - 超时时间（毫秒）
 * @param timeoutError - 超时错误
 * @returns 带超时的Promise
 * 
 * @example
 * ```typescript
 * const result = await timeout(
 *   fetch('/api/data'),
 *   5000,
 *   new Error('Request timeout')
 * )
 * ```
 */
export function timeout<T>(
  promise: Promise<T>,
  ms: number,
  timeoutError: Error = new Error('Timeout'),
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(timeoutError), ms)
  })

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId)
  })
}

/**
 * 批量并行执行Promise（带并发控制）
 * 
 * @param tasks - 任务数组
 * @param limit - 并发限制
 * @returns Promise数组结果
 * 
 * @example
 * ```typescript
 * const tasks = urls.map(url => () => fetch(url))
 * const results = await parallelLimit(tasks, 3) // 最多3个并发
 * ```
 */
export async function parallelLimit<T>(
  tasks: Array<() => Promise<T>>,
  limit: number,
): Promise<T[]> {
  const results: T[] = []
  const executing: Promise<void>[] = []

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]!
    const promise = task().then(result => {
      results[i] = result
    })

    executing.push(promise)

    if (executing.length >= limit) {
      await Promise.race(executing)
      executing.splice(
        executing.findIndex(p => p === promise),
        1,
      )
    }
  }

  await Promise.all(executing)
  return results
}
