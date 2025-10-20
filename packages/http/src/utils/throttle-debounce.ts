/**
 * 防抖节流工具模块
 * 
 * 提供防抖、节流等控制函数执行频率的工具
 */

/**
 * 防抖配置
 */
export interface DebounceOptions {
  /** 是否在延迟开始前调用 */
  leading?: boolean
  /** 是否在延迟结束后调用 */
  trailing?: boolean
  /** 最大等待时间 */
  maxWait?: number
}

/**
 * 防抖函数
 * 
 * 在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时
 * 
 * @param fn - 要防抖的函数
 * @param delay - 延迟时间（毫秒）
 * @param options - 防抖选项
 * @returns 防抖后的函数
 * 
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching:', query)
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
  options: DebounceOptions = {},
): T & {
  cancel: () => void
  flush: () => ReturnType<T> | undefined
  pending: () => boolean
} {
  const { leading = false, trailing = true, maxWait } = options
  
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let maxTimeoutId: ReturnType<typeof setTimeout> | null = null
  let lastCallTime: number | null = null
  let lastInvokeTime = 0
  let lastArgs: Parameters<T> | null = null
  let lastThis: any = null
  let result: ReturnType<T> | undefined

  function invokeFunc(time: number): ReturnType<T> {
    const args = lastArgs!
    const thisArg = lastThis

    lastArgs = null
    lastThis = null
    lastInvokeTime = time
    const r = fn.apply(thisArg, args) as ReturnType<T>
    result = r
    return r
  }

  function leadingEdge(time: number): void {
    lastInvokeTime = time
    timeoutId = setTimeout(timerExpired, delay)
    
    if (leading) {
      result = invokeFunc(time)
    }
  }

  function remainingWait(time: number): number {
    const timeSinceLastCall = time - (lastCallTime ?? 0)
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = delay - timeSinceLastCall

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting
  }

  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = time - (lastCallTime ?? 0)
    const timeSinceLastInvoke = time - lastInvokeTime

    return lastCallTime === null ||
      timeSinceLastCall >= delay ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
  }

  function timerExpired(): void {
    const time = Date.now()
    
    if (shouldInvoke(time)) {
      trailingEdge(time)
    } else {
      timeoutId = setTimeout(timerExpired, remainingWait(time))
    }
  }

  function trailingEdge(time: number): void {
    timeoutId = null

    if (trailing && lastArgs) {
      result = invokeFunc(time)
    } else {
      lastArgs = null
      lastThis = null
    }
  }

  function cancel(): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    if (maxTimeoutId !== null) {
      clearTimeout(maxTimeoutId)
    }
    lastInvokeTime = 0
    lastArgs = null
    lastCallTime = null
    lastThis = null
    timeoutId = null
    maxTimeoutId = null
  }

  function flush(): ReturnType<T> | undefined {
    if (timeoutId === null) {
      return result
    }
    
    const time = Date.now()
    trailingEdge(time)
    return result
  }

  function pending(): boolean {
    return timeoutId !== null
  }

  function debounced(...args: Parameters<T>): ReturnType<T> | undefined {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)
    const context = debounced

    lastArgs = args
    lastThis = context
    lastCallTime = time

    if (isInvoking) {
      if (timeoutId === null) {
        leadingEdge(lastCallTime)
      }
      if (maxWait !== undefined) {
        if (maxTimeoutId !== null) {
          clearTimeout(maxTimeoutId)
        }
        maxTimeoutId = setTimeout(timerExpired, maxWait)
      }
      return result
    }
    
    if (timeoutId === null) {
      timeoutId = setTimeout(timerExpired, delay)
    }
    
    return result
  }

  const enhanced = debounced as T & {
    cancel: () => void
    flush: () => ReturnType<T> | undefined
    pending: () => boolean
  }

  enhanced.cancel = cancel
  enhanced.flush = flush
  enhanced.pending = pending

  return enhanced
}

/**
 * 节流配置
 */
export interface ThrottleOptions {
  /** 是否在延迟开始前调用 */
  leading?: boolean
  /** 是否在延迟结束后调用 */
  trailing?: boolean
}

/**
 * 节流函数
 * 
 * 规定时间内只触发一次函数，适用于高频事件
 * 
 * @param fn - 要节流的函数
 * @param limit - 时间间隔（毫秒）
 * @param options - 节流选项
 * @returns 节流后的函数
 * 
 * @example
 * ```typescript
 * const throttledScroll = throttle(() => {
 *   console.log('Scrolling...')
 * }, 100)
 * 
 * window.addEventListener('scroll', throttledScroll)
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number,
  options: ThrottleOptions = {},
): T & {
  cancel: () => void
  flush: () => ReturnType<T> | undefined
  pending: () => boolean
} {
  const { leading = true, trailing = true } = options
  
  return debounce(fn, limit, {
    leading,
    trailing,
    maxWait: limit,
  })
}

/**
 * 创建自适应防抖
 * 
 * 根据调用频率自动调整防抖延迟
 */
export function createAdaptiveDebounce<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    minDelay?: number
    maxDelay?: number
    factor?: number
  } = {},
): T & { cancel: () => void, reset: () => void } {
  const { minDelay = 100, maxDelay = 1000, factor = 1.5 } = options
  
  let currentDelay = minDelay
  let lastCallTime = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let callCount = 0

  function adaptDelay(): void {
    const now = Date.now()
    const timeSinceLastCall = now - lastCallTime
    
    if (timeSinceLastCall < currentDelay * 2) {
      // 频率增加，增加延迟
      currentDelay = Math.min(currentDelay * factor, maxDelay)
      callCount++
    } else if (callCount > 0) {
      // 频率降低，减少延迟
      currentDelay = Math.max(currentDelay / factor, minDelay)
      callCount = Math.max(0, callCount - 1)
    }
    
    lastCallTime = now
  }

  function cancel(): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  function reset(): void {
    cancel()
    currentDelay = minDelay
    lastCallTime = 0
    callCount = 0
  }

  function debounced(this: any, ...args: Parameters<T>): void {
    adaptDelay()
    cancel()
    
    timeoutId = setTimeout(() => {
      fn.apply(this, args)
      timeoutId = null
    }, currentDelay)
  }

  const enhanced = debounced as T & {
    cancel: () => void
    reset: () => void
  }

  enhanced.cancel = cancel
  enhanced.reset = reset

  return enhanced
}

/**
 * 创建频率限制器
 * 
 * 限制函数在指定时间窗口内的调用次数
 */
export class RateLimiter {
  private calls: number[] = []

  constructor(
    private maxCalls: number,
    private timeWindow: number,
  ) {}

  /**
   * 检查是否可以执行
   */
  canExecute(): boolean {
    this.cleanup()
    return this.calls.length < this.maxCalls
  }

  /**
   * 记录一次执行
   */
  recordExecution(): void {
    this.calls.push(Date.now())
  }

  /**
   * 执行函数（如果未超限）
   */
  execute<T>(fn: () => T): T | undefined {
    if (this.canExecute()) {
      this.recordExecution()
      return fn()
    }
    return undefined
  }

  /**
   * 获取下次可执行时间
   */
  getNextAvailableTime(): number | null {
    this.cleanup()
    
    if (this.calls.length < this.maxCalls) {
      return Date.now()
    }
    
    const oldestCall = this.calls[0]
    return oldestCall ? oldestCall + this.timeWindow : null
  }

  /**
   * 清理过期的调用记录
   */
  private cleanup(): void {
    const now = Date.now()
    this.calls = this.calls.filter(time => now - time < this.timeWindow)
  }

  /**
   * 重置限制器
   */
  reset(): void {
    this.calls = []
  }

  /**
   * 获取当前调用次数
   */
  getCurrentCalls(): number {
    this.cleanup()
    return this.calls.length
  }

  /**
   * 获取剩余可调用次数
   */
  getRemainingCalls(): number {
    this.cleanup()
    return Math.max(0, this.maxCalls - this.calls.length)
  }
}

/**
 * 创建带频率限制的函数
 */
export function createRateLimitedFunction<T extends (...args: any[]) => any>(
  fn: T,
  maxCalls: number,
  timeWindow: number,
  options: {
    onLimit?: () => void
    queueOverflow?: 'drop' | 'replace'
  } = {},
): T & { 
  limiter: RateLimiter
  queue: Array<() => void>
} {
  const limiter = new RateLimiter(maxCalls, timeWindow)
  const queue: Array<() => void> = []
  const { onLimit, queueOverflow = 'drop' } = options

  function processQueue(): void {
    while (queue.length > 0 && limiter.canExecute()) {
      const task = queue.shift()
      if (task) {
        limiter.recordExecution()
        task()
      }
    }
    
    if (queue.length > 0) {
      const nextTime = limiter.getNextAvailableTime()
      if (nextTime) {
        const delay = Math.max(0, nextTime - Date.now())
        setTimeout(processQueue, delay)
      }
    }
  }

  function limited(this: any, ...args: Parameters<T>): void {
    const task = () => fn.apply(this, args)

    if (limiter.canExecute()) {
      limiter.recordExecution()
      task()
    } else {
      onLimit?.()
      
      if (queueOverflow === 'replace' && queue.length >= maxCalls) {
        queue.shift()
      }
      
      if (queueOverflow !== 'drop' || queue.length < maxCalls) {
        queue.push(task)
        processQueue()
      }
    }
  }

  const enhanced = limited as T & {
    limiter: RateLimiter
    queue: Array<() => void>
  }

  enhanced.limiter = limiter
  enhanced.queue = queue

  return enhanced
}