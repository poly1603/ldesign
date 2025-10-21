/**
 * Promise 工具类
 * 提供异步操作的各种实用方法
 * 
 * @example
 * ```typescript
 * import { PromiseUtils } from '@ldesign/kit'
 * 
 * // 并发控制
 * const results = await PromiseUtils.mapLimit(items, 3, async (item) => {
 *   return await processItem(item)
 * })
 * 
 * // 超时控制
 * const result = await PromiseUtils.timeout(longRunningTask(), 5000)
 * 
 * // 重试
 * const data = await PromiseUtils.retry(() => fetchData(), { maxAttempts: 3 })
 * ```
 */

/**
 * Promise 工具类
 */
export class PromiseUtils {
  /**
   * 延迟执行
   * @param ms 延迟时间（毫秒）
   * @param value 返回值
   */
  static delay<T = void>(ms: number, value?: T): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(value as T), ms))
  }

  /**
   * 超时控制
   * @param promise Promise
   * @param ms 超时时间（毫秒）
   * @param message 超时错误消息
   */
  static timeout<T>(promise: Promise<T>, ms: number, message = 'Operation timed out'): Promise<T> {
    return Promise.race([
      promise,
      PromiseUtils.delay(ms).then(() => {
        throw new Error(message)
      }),
    ])
  }

  /**
   * 重试
   * @param fn 函数
   * @param options 选项
   */
  static async retry<T>(
    fn: () => Promise<T>,
    options: {
      maxAttempts?: number
      delay?: number
      backoff?: boolean
      factor?: number
      onRetry?: (error: Error, attempt: number) => void
    } = {},
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoff = false,
      factor = 2,
      onRetry,
    } = options

    let lastError: Error | undefined

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn()
      }
      catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (attempt < maxAttempts) {
          if (onRetry) {
            onRetry(lastError, attempt)
          }

          const waitTime = backoff ? delay * Math.pow(factor, attempt - 1) : delay
          await PromiseUtils.delay(waitTime)
        }
      }
    }

    throw lastError || new Error('Retry failed')
  }

  /**
   * 并发限制的 map
   * @param items 数组
   * @param concurrency 并发数
   * @param fn 处理函数
   */
  static async mapLimit<T, R>(
    items: T[],
    concurrency: number,
    fn: (item: T, index: number) => Promise<R>,
  ): Promise<R[]> {
    const results: R[] = []
    const executing: Promise<void>[] = []

    for (let i = 0; i < items.length; i++) {
      const item = items[i]!
      const promise = fn(item, i).then((result) => {
        results[i] = result
      })

      executing.push(promise)

      if (executing.length >= concurrency) {
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

  /**
   * 顺序执行
   * @param items 数组
   * @param fn 处理函数
   */
  static async mapSeries<T, R>(
    items: T[],
    fn: (item: T, index: number) => Promise<R>,
  ): Promise<R[]> {
    const results: R[] = []

    for (let i = 0; i < items.length; i++) {
      results.push(await fn(items[i]!, i))
    }

    return results
  }

  /**
   * 并行执行所有 Promise，返回成功的结果
   * @param promises Promise 数组
   */
  static async allSettled<T>(
    promises: Array<Promise<T>>,
  ): Promise<Array<{ status: 'fulfilled'; value: T } | { status: 'rejected'; reason: any }>> {
    return Promise.allSettled(promises)
  }

  /**
   * 过滤异步
   * @param items 数组
   * @param predicate 过滤函数
   */
  static async filter<T>(
    items: T[],
    predicate: (item: T, index: number) => Promise<boolean>,
  ): Promise<T[]> {
    const results = await Promise.all(
      items.map(async (item, index) => ({
        item,
        pass: await predicate(item, index),
      })),
    )

    return results.filter(({ pass }) => pass).map(({ item }) => item)
  }

  /**
   * 查找异步
   * @param items 数组
   * @param predicate 查找函数
   */
  static async find<T>(
    items: T[],
    predicate: (item: T, index: number) => Promise<boolean>,
  ): Promise<T | undefined> {
    for (let i = 0; i < items.length; i++) {
      const item = items[i]!
      if (await predicate(item, i)) {
        return item
      }
    }

    return undefined
  }

  /**
   * 批处理
   * @param items 数组
   * @param batchSize 批次大小
   * @param fn 处理函数
   */
  static async batch<T, R>(
    items: T[],
    batchSize: number,
    fn: (batch: T[], batchIndex: number) => Promise<R[]>,
  ): Promise<R[]> {
    const results: R[] = []

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      const batchResults = await fn(batch, Math.floor(i / batchSize))
      results.push(...batchResults)
    }

    return results
  }

  /**
   * 并发批处理
   * @param items 数组
   * @param batchSize 批次大小
   * @param concurrency 并发数
   * @param fn 处理函数
   */
  static async batchConcurrent<T, R>(
    items: T[],
    batchSize: number,
    concurrency: number,
    fn: (batch: T[], batchIndex: number) => Promise<R[]>,
  ): Promise<R[]> {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }

    const results = await PromiseUtils.mapLimit(batches, concurrency, (batch, index) =>
      fn(batch, index),
    )

    return results.flat()
  }

  /**
   * 创建可取消的 Promise
   * @param executor 执行器
   */
  static cancellable<T>(
    executor: (
      resolve: (value: T) => void,
      reject: (reason?: any) => void,
      onCancel: (handler: () => void) => void,
    ) => void,
  ): { promise: Promise<T>; cancel: () => void } {
    let cancelHandler: (() => void) | undefined
    let cancelled = false

    const promise = new Promise<T>((resolve, reject) => {
      const wrappedResolve = (value: T) => {
        if (!cancelled) {
          resolve(value)
        }
      }

      const wrappedReject = (reason?: any) => {
        if (!cancelled) {
          reject(reason)
        }
      }

      const onCancel = (handler: () => void) => {
        cancelHandler = handler
      }

      executor(wrappedResolve, wrappedReject, onCancel)
    })

    const cancel = () => {
      cancelled = true
      if (cancelHandler) {
        cancelHandler()
      }
    }

    return { promise, cancel }
  }

  /**
   * 等待条件满足
   * @param condition 条件函数
   * @param options 选项
   */
  static async waitFor(
    condition: () => boolean | Promise<boolean>,
    options: {
      timeout?: number
      interval?: number
      message?: string
    } = {},
  ): Promise<void> {
    const { timeout = 5000, interval = 100, message = 'Timeout waiting for condition' } = options
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return
      }
      await PromiseUtils.delay(interval)
    }

    throw new Error(message)
  }

  /**
   * 轮询
   * @param fn 函数
   * @param options 选项
   */
  static async poll<T>(
    fn: () => Promise<T>,
    options: {
      interval?: number
      timeout?: number
      validate?: (result: T) => boolean | Promise<boolean>
    } = {},
  ): Promise<T> {
    const { interval = 1000, timeout = 30000, validate } = options
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const result = await fn()

      if (!validate || (await validate(result))) {
        return result
      }

      await PromiseUtils.delay(interval)
    }

    throw new Error('Polling timeout')
  }

  /**
   * 去重并发执行（相同的请求只执行一次）
   * @param key 键
   * @param fn 函数
   */
  private static pendingPromises = new Map<string, Promise<any>>()

  static dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
    if (PromiseUtils.pendingPromises.has(key)) {
      return PromiseUtils.pendingPromises.get(key)!
    }

    const promise = fn().finally(() => {
      PromiseUtils.pendingPromises.delete(key)
    })

    PromiseUtils.pendingPromises.set(key, promise)
    return promise
  }

  /**
   * 缓存 Promise 结果
   * @param key 键
   * @param fn 函数
   * @param ttl 过期时间（毫秒）
   */
  private static cache = new Map<string, { value: any; expiry: number }>()

  static memoize<T>(key: string, fn: () => Promise<T>, ttl = 60000): Promise<T> {
    const cached = PromiseUtils.cache.get(key)

    if (cached && cached.expiry > Date.now()) {
      return Promise.resolve(cached.value)
    }

    return fn().then((value) => {
      PromiseUtils.cache.set(key, {
        value,
        expiry: Date.now() + ttl,
      })
      return value
    })
  }

  /**
   * 清除缓存
   * @param key 键（不提供则清除所有）
   */
  static clearCache(key?: string): void {
    if (key) {
      PromiseUtils.cache.delete(key)
    }
    else {
      PromiseUtils.cache.clear()
    }
  }

  /**
   * Promise 队列
   */
  static queue<T = any>() {
    const queue: Array<() => Promise<T>> = []
    let running = false

    const run = async () => {
      if (running || queue.length === 0) {
        return
      }

      running = true

      while (queue.length > 0) {
        const task = queue.shift()
        if (task) {
          try {
            await task()
          }
          catch (error) {
            console.error('Queue task failed:', error)
          }
        }
      }

      running = false
    }

    return {
      add: (task: () => Promise<T>) => {
        queue.push(task)
        run()
      },
      clear: () => {
        queue.length = 0
      },
      size: () => queue.length,
      isRunning: () => running,
    }
  }

  /**
   * 限流（同时只执行指定数量的任务）
   */
  static limiter(concurrency: number) {
    let running = 0
    const queue: Array<() => void> = []

    const run = () => {
      if (running >= concurrency || queue.length === 0) {
        return
      }

      running++
      const resolve = queue.shift()
      resolve?.()
    }

    return async <T>(fn: () => Promise<T>): Promise<T> => {
      if (running >= concurrency) {
        await new Promise<void>(resolve => queue.push(resolve))
      }

      try {
        return await fn()
      }
      finally {
        running--
        run()
      }
    }
  }

  /**
   * 节流（防抖）Promise
   * @param fn 函数
   * @param wait 等待时间
   */
  static throttle<T>(fn: (...args: any[]) => Promise<T>, wait: number) {
    let lastCall = 0
    let pending: Promise<T> | null = null

    return async (...args: any[]): Promise<T> => {
      const now = Date.now()
      const timeSinceLastCall = now - lastCall

      if (timeSinceLastCall >= wait) {
        lastCall = now
        pending = fn(...args)
        return pending
      }

      if (pending) {
        return pending
      }

      pending = PromiseUtils.delay(wait - timeSinceLastCall).then(() => {
        lastCall = Date.now()
        pending = null
        return fn(...args)
      })

      return pending
    }
  }

  /**
   * 防抖 Promise
   * @param fn 函数
   * @param wait 等待时间
   */
  static debounce<T>(fn: (...args: any[]) => Promise<T>, wait: number) {
    let timeoutId: NodeJS.Timeout | null = null
    let pending: Promise<T> | null = null

    return (...args: any[]): Promise<T> => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      if (!pending) {
        pending = new Promise<T>((resolve, reject) => {
          timeoutId = setTimeout(() => {
            pending = null
            fn(...args).then(resolve, reject)
          }, wait)
        })
      }

      return pending
    }
  }

  /**
   * 竞态条件处理（只保留最后一次调用的结果）
   */
  static race<T>() {
    let latestId = 0

    return async (fn: () => Promise<T>): Promise<T | undefined> => {
      const currentId = ++latestId
      const result = await fn()

      if (currentId === latestId) {
        return result
      }

      return undefined
    }
  }

  /**
   * 并行执行但保持顺序
   * @param items 数组
   * @param fn 处理函数
   */
  static async mapParallelOrdered<T, R>(
    items: T[],
    fn: (item: T, index: number) => Promise<R>,
  ): Promise<R[]> {
    const promises = items.map((item, index) => fn(item, index))
    return Promise.all(promises)
  }

  /**
   * 瀑布流执行（前一个的结果作为下一个的输入）
   * @param fns 函数数组
   * @param initialValue 初始值
   */
  static async waterfall<T>(fns: Array<(value: any) => Promise<any>>, initialValue: T): Promise<any> {
    let result: any = initialValue

    for (const fn of fns) {
      result = await fn(result)
    }

    return result
  }

  /**
   * 创建信号量
   * @param limit 限制数
   */
  static semaphore(limit: number) {
    let counter = 0
    const waiting: Array<() => void> = []

    return {
      acquire: async () => {
        if (counter >= limit) {
          await new Promise<void>(resolve => waiting.push(resolve))
        }
        counter++
      },
      release: () => {
        counter--
        const resolve = waiting.shift()
        if (resolve) {
          resolve()
        }
      },
      available: () => limit - counter,
    }
  }
}




