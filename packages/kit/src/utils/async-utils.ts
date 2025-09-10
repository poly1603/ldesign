/**
 * 异步工具类
 * 提供延迟、超时、重试、并发控制等异步操作工具
 */

import type { RetryOptions } from '../types'

/**
 * 异步工具
 */
export class AsyncUtils {
  /**
   * 延迟执行
   * @param ms 延迟毫秒数
   * @returns Promise
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 睡眠（delay 的别名）
   * @param ms 睡眠毫秒数
   * @returns Promise
   */
  static sleep(ms: number): Promise<void> {
    return AsyncUtils.delay(ms)
  }

  /**
   * 超时控制
   * @param promise 要控制的 Promise
   * @param ms 超时毫秒数
   * @param errorMessage 超时错误信息
   * @returns 带超时的 Promise
   */
  static timeout<T>(
    promise: Promise<T>,
    ms: number,
    errorMessage = `操作超时 (${ms}ms)`,
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error(errorMessage)), ms)),
    ])
  }

  /**
   * 重试机制
   * @param fn 要重试的函数
   * @param options 重试选项
   * @returns Promise
   */
  static async retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoff = false,
      factor = 2,
      maxDelay = 30000,
      onRetry,
    } = options

    let lastError: Error | undefined
    let currentDelay = delay

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn()
      }
      catch (error) {
        lastError = error as Error

        if (attempt === maxAttempts) {
          throw lastError
        }

        if (onRetry) {
          onRetry(lastError, attempt)
        }

        await AsyncUtils.delay(Math.min(currentDelay, maxDelay))

        if (backoff) {
          currentDelay *= factor
        }
      }
    }

    throw (lastError instanceof Error ? lastError : new Error(String(lastError || 'Unknown error')))
  }

  /**
   * 并发控制 - 限制同时执行的任务数量
   * @param tasks 任务数组
   * @param concurrency 并发数
   * @returns Promise 数组
   */
  static async parallel<T>(tasks: (() => Promise<T>)[], concurrency = Infinity): Promise<T[]> {
    if (concurrency >= tasks.length) {
      return Promise.all(tasks.map(task => task()))
    }

    const results: T[] = Array.from({ length: tasks.length })
    const executing: Promise<void>[] = []
    let index = 0

    const executeTask = async (taskIndex: number) => {
      const task = tasks[taskIndex]
      if (!task)
        return
      const result = await task()
      results[taskIndex] = result
    }

    while (index < tasks.length) {
      const promise = executeTask(index++)
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
   * 串行执行任务
   * @param tasks 任务数组
   * @returns Promise 数组
   */
  static async series<T>(tasks: (() => Promise<T>)[]): Promise<T[]> {
    const results: T[] = []
    for (const task of tasks) {
      results.push(await task())
    }
    return results
  }

  /**
   * 瀑布流执行 - 每个任务的结果作为下一个任务的输入
   * @param tasks 任务数组
   * @param initialValue 初始值
   * @returns 最终结果
   */
  static async waterfall<T>(tasks: ((value: T) => Promise<T>)[], initialValue: T): Promise<T> {
    let result = initialValue
    for (const task of tasks) {
      result = await task(result)
    }
    return result
  }

  /**
   * 映射并限制并发数
   * @param items 数据数组
   * @param fn 映射函数
   * @param concurrency 并发数
   * @returns Promise 数组
   */
  static async mapLimit<T, R>(
    items: T[],
    fn: (item: T, index: number) => Promise<R>,
    concurrency = 5,
  ): Promise<R[]> {
    const tasks = items.map((item, index) => () => fn(item, index))
    return AsyncUtils.parallel(tasks, concurrency)
  }

  /**
   * 过滤并限制并发数
   * @param items 数据数组
   * @param fn 过滤函数
   * @param concurrency 并发数
   * @returns 过滤后的数组
   */
  static async filterLimit<T>(
    items: T[],
    fn: (item: T, index: number) => Promise<boolean>,
    concurrency = 5,
  ): Promise<T[]> {
    const results = await AsyncUtils.mapLimit(items, fn, concurrency)
    return items.filter((_, index) => results[index])
  }

  /**
   * 查找第一个满足条件的元素
   * @param items 数据数组
   * @param fn 查找函数
   * @returns 找到的元素
   */
  static async find<T>(
    items: T[],
    fn: (item: T, index: number) => Promise<boolean>,
  ): Promise<T | undefined> {
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item === undefined)
        continue
      if (await fn(item, i)) {
        return item
      }
    }
    return undefined
  }

  /**
   * 检查是否所有元素都满足条件
   * @param items 数据数组
   * @param fn 检查函数
   * @returns 是否所有元素都满足条件
   */
  static async every<T>(
    items: T[],
    fn: (item: T, index: number) => Promise<boolean>,
  ): Promise<boolean> {
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item === undefined)
        continue
      if (!(await fn(item, i))) {
        return false
      }
    }
    return true
  }

  /**
   * 检查是否有元素满足条件
   * @param items 数据数组
   * @param fn 检查函数
   * @returns 是否有元素满足条件
   */
  static async some<T>(
    items: T[],
    fn: (item: T, index: number) => Promise<boolean>,
  ): Promise<boolean> {
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item === undefined)
        continue
      if (await fn(item, i)) {
        return true
      }
    }
    return false
  }

  /**
   * 异步归约
   * @param items 数据数组
   * @param fn 归约函数
   * @param initialValue 初始值
   * @returns 归约结果
   */
  static async reduce<T, R>(
    items: T[],
    fn: (accumulator: R, current: T, index: number) => Promise<R>,
    initialValue: R,
  ): Promise<R> {
    let accumulator = initialValue
    for (let i = 0; i < items.length; i++) {
      const current = items[i]
      if (current === undefined)
        continue
      accumulator = await fn(accumulator, current, i)
    }
    return accumulator
  }

  /**
   * 创建可取消的 Promise
   * @param executor Promise 执行器
   * @returns 可取消的 Promise 和取消函数
   */
  static cancellable<T>(
    executor: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void,
      isCancelled: () => boolean
    ) => void,
  ): { promise: Promise<T>, cancel: () => void } {
    let cancelled = false
    let cancel: () => void

    const promise = new Promise<T>((resolve, reject) => {
      cancel = () => {
        cancelled = true
        reject(new Error('Operation cancelled'))
      }

      executor(resolve, reject, () => cancelled)
    })

    return { promise, cancel: cancel! }
  }

  /**
   * 创建防抖函数
   * @param fn 要防抖的函数
   * @param delay 延迟时间
   * @returns 防抖后的函数
   */
  static debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number,
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    let timeoutId: NodeJS.Timeout | null = null
    let resolvePromise: ((value: ReturnType<T>) => void) | null = null
    let rejectPromise: ((reason: any) => void) | null = null

    return (...args: Parameters<T>): Promise<ReturnType<T>> => {
      return new Promise((resolve, reject) => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        resolvePromise = resolve
        rejectPromise = reject

        timeoutId = setTimeout(async () => {
          try {
            const result = await fn(...args)
            resolvePromise?.(result)
          }
          catch (error) {
            rejectPromise?.(error)
          }
        }, delay)
      })
    }
  }

  /**
   * 创建节流函数
   * @param fn 要节流的函数
   * @param interval 间隔时间
   * @returns 节流后的函数
   */
  static throttle<T extends (...args: any[]) => any>(
    fn: T,
    interval: number,
  ): (...args: Parameters<T>) => Promise<ReturnType<T> | undefined> {
    let lastCall = 0
    let timeoutId: NodeJS.Timeout | null = null

    return (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
      return new Promise((resolve) => {
        const now = Date.now()
        const timeSinceLastCall = now - lastCall

        if (timeSinceLastCall >= interval) {
          lastCall = now
          resolve(fn(...args))
        }
        else {
          if (timeoutId) {
            clearTimeout(timeoutId)
          }

          timeoutId = setTimeout(() => {
            lastCall = Date.now()
            resolve(fn(...args))
          }, interval - timeSinceLastCall)
        }
      })
    }
  }

  /**
   * 创建互斥锁
   * @returns 互斥锁对象
   */
  static createMutex() {
    let locked = false
    const queue: (() => void)[] = []

    return {
      async acquire(): Promise<() => void> {
        return new Promise<() => void>((resolve) => {
          if (!locked) {
            locked = true
            resolve(() => {
              locked = false
              const next = queue.shift()
              if (next) {
                next()
              }
            })
          }
          else {
            queue.push(() => {
              locked = true
              resolve(() => {
                locked = false
                const next = queue.shift()
                if (next) {
                  next()
                }
              })
            })
          }
        })
      },

      get isLocked(): boolean {
        return locked
      },

      get queueLength(): number {
        return queue.length
      },
    }
  }

  /**
   * 创建信号量
   * @param permits 许可数量
   * @returns 信号量对象
   */
  static createSemaphore(permits: number) {
    let available = permits
    const queue: (() => void)[] = []

    return {
      async acquire(): Promise<() => void> {
        return new Promise<() => void>((resolve) => {
          if (available > 0) {
            available--
            resolve(() => {
              available++
              const next = queue.shift()
              if (next) {
                next()
              }
            })
          }
          else {
            queue.push(() => {
              available--
              resolve(() => {
                available++
                const next = queue.shift()
                if (next) {
                  next()
                }
              })
            })
          }
        })
      },

      get available(): number {
        return available
      },

      get queueLength(): number {
        return queue.length
      },
    }
  }
}
