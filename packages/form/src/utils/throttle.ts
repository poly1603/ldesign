// 节流防抖工具函数

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  immediate = false,
): T & { cancel: () => void } {
  let timeoutId: number | undefined
  let lastCallTime: number | undefined

  const debounced = function (this: any, ...args: Parameters<T>) {
    const callNow = immediate && !timeoutId

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = window.setTimeout(() => {
      timeoutId = undefined
      if (!immediate) {
        func.apply(this, args)
      }
    }, delay)

    if (callNow) {
      func.apply(this, args)
    }

    lastCallTime = Date.now()
  } as T & { cancel: () => void }

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }
  }

  return debounced
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: { leading?: boolean, trailing?: boolean } = {},
): T & { cancel: () => void } {
  const { leading = true, trailing = true } = options
  let timeoutId: number | undefined
  let lastCallTime: number | undefined
  let lastArgs: Parameters<T> | undefined
  let lastThis: any

  const throttled = function (this: any, ...args: Parameters<T>) {
    const now = Date.now()

    if (!lastCallTime && !leading) {
      lastCallTime = now
    }

    const remaining = delay - (now - (lastCallTime || 0))
    lastThis = this
    lastArgs = args

    if (remaining <= 0 || remaining > delay) {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = undefined
      }
      lastCallTime = now
      func.apply(this, args)
    }
    else if (!timeoutId && trailing) {
      timeoutId = window.setTimeout(() => {
        lastCallTime = !leading ? 0 : Date.now()
        timeoutId = undefined
        if (lastArgs) {
          func.apply(lastThis, lastArgs)
        }
      }, remaining)
    }
  } as T & { cancel: () => void }

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }
    lastCallTime = undefined
    lastArgs = undefined
    lastThis = undefined
  }

  return throttled
}

/**
 * requestAnimationFrame 节流
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T,
): T & { cancel: () => void } {
  let rafId: number | undefined
  let lastArgs: Parameters<T> | undefined
  let lastThis: any

  const throttled = function (this: any, ...args: Parameters<T>) {
    lastThis = this
    lastArgs = args

    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        rafId = undefined
        if (lastArgs) {
          func.apply(lastThis, lastArgs)
        }
      })
    }
  } as T & { cancel: () => void }

  throttled.cancel = () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = undefined
    }
    lastArgs = undefined
    lastThis = undefined
  }

  return throttled
}

/**
 * 并发控制
 */
export function concurrent<T extends (...args: any[]) => Promise<any>>(
  func: T,
  limit: number = 1,
): T {
  let running = 0
  const queue: Array<{
    args: Parameters<T>
    resolve: (value: any) => void
    reject: (error: any) => void
    context: any
  }> = []

  const execute = async () => {
    if (running >= limit || queue.length === 0) {
      return
    }

    running++
    const { args, resolve, reject, context } = queue.shift()!

    try {
      const result = await func.apply(context, args)
      resolve(result)
    }
    catch (error) {
      reject(error)
    }
    finally {
      running--
      execute() // 处理队列中的下一个任务
    }
  }

  return function (this: any, ...args: Parameters<T>) {
    return new Promise((resolve, reject) => {
      queue.push({ args, resolve, reject, context: this })
      execute()
    })
  } as T
}

/**
 * 重试函数
 */
export function retry<T extends (...args: any[]) => Promise<any>>(
  func: T,
  maxAttempts: number = 3,
  delay: number = 1000,
  backoff: number = 2,
): T {
  return async function (this: any, ...args: Parameters<T>) {
    let lastError: any
    let currentDelay = delay

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await func.apply(this, args)
      }
      catch (error) {
        lastError = error

        if (attempt === maxAttempts) {
          throw error
        }

        // 等待指定时间后重试
        await new Promise(resolve => setTimeout(resolve, currentDelay))
        currentDelay *= backoff
      }
    }

    throw lastError
  } as T
}

/**
 * 缓存函数结果
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string,
  maxSize: number = 100,
): T & { cache: Map<string, ReturnType<T>>, clear: () => void } {
  const cache = new Map<string, ReturnType<T>>()

  const memoized = function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = func.apply(this, args)

    // 限制缓存大小
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }

    cache.set(key, result)
    return result
  } as T & { cache: Map<string, ReturnType<T>>, clear: () => void }

  memoized.cache = cache
  memoized.clear = () => cache.clear()

  return memoized
}

/**
 * 异步防抖
 */
export function asyncDebounce<T extends (...args: any[]) => Promise<any>>(
  func: T,
  delay: number,
): T & { cancel: () => void } {
  let timeoutId: number | undefined
  let currentPromise: Promise<any> | undefined
  let currentResolve: ((value: any) => void) | undefined
  let currentReject: ((error: any) => void) | undefined

  const debounced = function (this: any, ...args: Parameters<T>) {
    return new Promise((resolve, reject) => {
      // 取消之前的调用
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      // 如果有正在进行的Promise，拒绝它
      if (currentReject) {
        currentReject(new Error('Debounced'))
      }

      currentResolve = resolve
      currentReject = reject

      timeoutId = window.setTimeout(async () => {
        try {
          const result = await func.apply(this, args)
          if (currentResolve) {
            currentResolve(result)
          }
        }
        catch (error) {
          if (currentReject) {
            currentReject(error)
          }
        }
        finally {
          timeoutId = undefined
          currentPromise = undefined
          currentResolve = undefined
          currentReject = undefined
        }
      }, delay)
    })
  } as T & { cancel: () => void }

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }
    if (currentReject) {
      currentReject(new Error('Cancelled'))
      currentReject = undefined
      currentResolve = undefined
    }
  }

  return debounced
}

/**
 * 批处理函数
 */
export function batch<T, R>(
  func: (items: T[]) => Promise<R[]>,
  batchSize: number = 10,
  delay: number = 100,
): (item: T) => Promise<R> {
  const batch: Array<{
    item: T
    resolve: (value: R) => void
    reject: (error: any) => void
  }> = []
  let timeoutId: number | undefined

  const processBatch = async () => {
    if (batch.length === 0)
      return

    const currentBatch = batch.splice(0, batchSize)
    const items = currentBatch.map(b => b.item)

    try {
      const results = await func(items)
      currentBatch.forEach((b, index) => {
        b.resolve(results[index])
      })
    }
    catch (error) {
      currentBatch.forEach((b) => {
        b.reject(error)
      })
    }

    // 如果还有剩余项目，继续处理
    if (batch.length > 0) {
      timeoutId = window.setTimeout(processBatch, delay)
    }
  }

  return (item: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      batch.push({ item, resolve, reject })

      if (batch.length >= batchSize) {
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = undefined
        }
        processBatch()
      }
      else if (!timeoutId) {
        timeoutId = window.setTimeout(processBatch, delay)
      }
    })
  }
}

/**
 * 函数执行时间测量
 */
export function measure<T extends (...args: any[]) => any>(
  func: T,
  name?: string,
): T {
  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const label = name || func.name || 'anonymous'
    const start = performance.now()

    try {
      const result = func.apply(this, args)

      // 如果是Promise，等待完成后测量
      if (result && typeof result.then === 'function') {
        return result.finally(() => {
          const end = performance.now()
          console.log(`${label} took ${end - start} milliseconds`)
        })
      }

      const end = performance.now()
      console.log(`${label} took ${end - start} milliseconds`)
      return result
    }
    catch (error) {
      const end = performance.now()
      console.log(`${label} failed after ${end - start} milliseconds`)
      throw error
    }
  } as T
}
