/**
 * 节流和防抖工具函数
 */

/**
 * 节流函数
 * @param func 要节流的函数
 * @param delay 延迟时间（毫秒）
 * @param options 选项
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: {
    leading?: boolean // 是否在开始时立即执行
    trailing?: boolean // 是否在结束时执行
  } = {}
): T & { cancel: () => void; flush: () => void } {
  const { leading = true, trailing = true } = options
  
  let lastCallTime: number | undefined
  let lastInvokeTime = 0
  let timerId: number | undefined
  let lastArgs: Parameters<T> | undefined
  let lastThis: any
  let result: ReturnType<T>

  function invokeFunc(time: number): ReturnType<T> {
    const args = lastArgs!
    const thisArg = lastThis
    
    lastArgs = undefined
    lastThis = undefined
    lastInvokeTime = time
    result = func.apply(thisArg, args)
    return result
  }

  function leadingEdge(time: number): ReturnType<T> {
    lastInvokeTime = time
    timerId = window.setTimeout(timerExpired, delay)
    return leading ? invokeFunc(time) : result
  }

  function remainingWait(time: number): number {
    const timeSinceLastCall = time - lastCallTime!
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = delay - timeSinceLastCall
    
    return Math.min(timeWaiting, delay - timeSinceLastInvoke)
  }

  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = time - lastCallTime!
    const timeSinceLastInvoke = time - lastInvokeTime
    
    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= delay ||
      timeSinceLastCall < 0 ||
      timeSinceLastInvoke >= delay
    )
  }

  function timerExpired(): void {
    const time = Date.now()
    if (shouldInvoke(time)) {
      trailingEdge(time)
    } else {
      timerId = window.setTimeout(timerExpired, remainingWait(time))
    }
  }

  function trailingEdge(time: number): ReturnType<T> {
    timerId = undefined
    
    if (trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = undefined
    lastThis = undefined
    return result
  }

  function cancel(): void {
    if (timerId !== undefined) {
      clearTimeout(timerId)
    }
    lastInvokeTime = 0
    lastArgs = undefined
    lastCallTime = undefined
    lastThis = undefined
    timerId = undefined
  }

  function flush(): ReturnType<T> {
    return timerId === undefined ? result : trailingEdge(Date.now())
  }

  function throttled(this: any, ...args: Parameters<T>): ReturnType<T> {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)
    
    lastArgs = args
    lastThis = this
    lastCallTime = time
    
    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime)
      }
      timerId = window.setTimeout(timerExpired, delay)
      return leading ? invokeFunc(lastCallTime) : result
    }
    if (timerId === undefined) {
      timerId = window.setTimeout(timerExpired, delay)
    }
    return result
  }

  throttled.cancel = cancel
  throttled.flush = flush
  
  return throttled as T & { cancel: () => void; flush: () => void }
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @param options 选项
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: {
    leading?: boolean // 是否在开始时立即执行
    trailing?: boolean // 是否在结束时执行
    maxWait?: number // 最大等待时间
  } = {}
): T & { cancel: () => void; flush: () => void; pending: () => boolean } {
  const { leading = false, trailing = true, maxWait } = options
  
  let lastCallTime: number | undefined
  let lastInvokeTime = 0
  let timerId: number | undefined
  let maxTimerId: number | undefined
  let lastArgs: Parameters<T> | undefined
  let lastThis: any
  let result: ReturnType<T>

  const useMaxWait = maxWait !== undefined

  function invokeFunc(time: number): ReturnType<T> {
    const args = lastArgs!
    const thisArg = lastThis
    
    lastArgs = undefined
    lastThis = undefined
    lastInvokeTime = time
    result = func.apply(thisArg, args)
    return result
  }

  function leadingEdge(time: number): ReturnType<T> {
    lastInvokeTime = time
    timerId = window.setTimeout(timerExpired, delay)
    return leading ? invokeFunc(time) : result
  }

  function remainingWait(time: number): number {
    const timeSinceLastCall = time - lastCallTime!
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = delay - timeSinceLastCall
    
    return useMaxWait
      ? Math.min(timeWaiting, maxWait! - timeSinceLastInvoke)
      : timeWaiting
  }

  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = time - lastCallTime!
    const timeSinceLastInvoke = time - lastInvokeTime
    
    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= delay ||
      timeSinceLastCall < 0 ||
      (useMaxWait && timeSinceLastInvoke >= maxWait!)
    )
  }

  function timerExpired(): void {
    const time = Date.now()
    if (shouldInvoke(time)) {
      trailingEdge(time)
    } else {
      timerId = window.setTimeout(timerExpired, remainingWait(time))
    }
  }

  function maxDelayed(): void {
    trailingEdge(Date.now())
  }

  function trailingEdge(time: number): ReturnType<T> {
    timerId = undefined
    
    if (trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = undefined
    lastThis = undefined
    return result
  }

  function cancel(): void {
    if (timerId !== undefined) {
      clearTimeout(timerId)
    }
    if (maxTimerId !== undefined) {
      clearTimeout(maxTimerId)
    }
    lastInvokeTime = 0
    lastArgs = undefined
    lastCallTime = undefined
    lastThis = undefined
    timerId = undefined
    maxTimerId = undefined
  }

  function flush(): ReturnType<T> {
    return timerId === undefined ? result : trailingEdge(Date.now())
  }

  function pending(): boolean {
    return timerId !== undefined
  }

  function debounced(this: any, ...args: Parameters<T>): ReturnType<T> {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)
    
    lastArgs = args
    lastThis = this
    lastCallTime = time
    
    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime)
      }
      if (useMaxWait) {
        timerId = window.setTimeout(timerExpired, delay)
        maxTimerId = window.setTimeout(maxDelayed, maxWait!)
        return leading ? invokeFunc(lastCallTime) : result
      }
    }
    if (timerId === undefined) {
      timerId = window.setTimeout(timerExpired, delay)
    }
    return result
  }

  debounced.cancel = cancel
  debounced.flush = flush
  debounced.pending = pending
  
  return debounced as T & { cancel: () => void; flush: () => void; pending: () => boolean }
}

/**
 * 创建一个只执行一次的函数
 */
export function once<T extends (...args: any[]) => any>(func: T): T {
  let called = false
  let result: ReturnType<T>
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    if (!called) {
      called = true
      result = func(...args)
    }
    return result
  }) as T
}

/**
 * 延迟执行函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 创建一个带有延迟的函数
 */
export function delayed<T extends (...args: any[]) => any>(
  func: T,
  ms: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    await delay(ms)
    return func(...args)
  }
}

/**
 * 创建一个可以取消的延迟函数
 */
export function cancellableDelay(ms: number): {
  promise: Promise<void>
  cancel: () => void
} {
  let timeoutId: number
  let cancelled = false
  
  const promise = new Promise<void>((resolve, reject) => {
    timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        resolve()
      }
    }, ms)
  })
  
  const cancel = () => {
    cancelled = true
    clearTimeout(timeoutId)
  }
  
  return { promise, cancel }
}

/**
 * 创建一个限制并发执行的函数
 */
export function concurrent<T extends (...args: any[]) => Promise<any>>(
  func: T,
  limit: number
): T {
  let running = 0
  const queue: Array<{
    args: Parameters<T>
    resolve: (value: ReturnType<T>) => void
    reject: (reason: any) => void
  }> = []
  
  async function execute(): Promise<void> {
    if (queue.length === 0 || running >= limit) {
      return
    }
    
    running++
    const { args, resolve, reject } = queue.shift()!
    
    try {
      const result = await func(...args)
      resolve(result)
    } catch (error) {
      reject(error)
    } finally {
      running--
      execute() // 处理队列中的下一个任务
    }
  }
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    return new Promise((resolve, reject) => {
      queue.push({ args, resolve, reject })
      execute()
    }) as ReturnType<T>
  }) as T
}

/**
 * 创建一个带有重试机制的函数
 */
export function retry<T extends (...args: any[]) => Promise<any>>(
  func: T,
  maxAttempts: number = 3,
  delayMs: number = 1000
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    let lastError: any
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await func(...args)
      } catch (error) {
        lastError = error
        if (attempt < maxAttempts) {
          await delay(delayMs * attempt) // 指数退避
        }
      }
    }
    
    throw lastError
  }) as T
}