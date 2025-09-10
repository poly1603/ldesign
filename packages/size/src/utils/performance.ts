/**
 * 性能优化工具模块
 */

/**
 * 节流函数
 * @param func 要节流的函数
 * @param limit 时间限制（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  let lastFunc: ReturnType<typeof setTimeout>
  let lastRan: number

  return function (this: any, ...args: Parameters<T>) {
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      lastRan = Date.now()
      inThrottle = true
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args)
          lastRan = Date.now()
        }
      }, Math.max(limit - (Date.now() - lastRan), 0))
    }
  }
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @param immediate 是否立即执行
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>) {
    const context = this
    const later = () => {
      timeout = null
      if (!immediate) func.apply(context, args)
    }

    const callNow = immediate && !timeout
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}

/**
 * 缓存函数结果
 * @param fn 要缓存的函数
 * @param resolver 缓存键解析器
 * @returns 带缓存的函数
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

/**
 * 批量执行函数
 * @param fn 要批量执行的函数
 * @param wait 等待时间（毫秒）
 * @returns 批量执行函数
 */
export function batch<T extends (items: any[]) => void>(
  fn: T,
  wait = 0
): (item: any) => void {
  let items: any[] = []
  let timer: ReturnType<typeof setTimeout> | null = null

  const flush = () => {
    if (items.length > 0) {
      fn(items)
      items = []
    }
    timer = null
  }

  return (item: any) => {
    items.push(item)
    
    if (timer) {
      clearTimeout(timer)
    }
    
    if (wait === 0) {
      Promise.resolve().then(flush)
    } else {
      timer = setTimeout(flush, wait)
    }
  }
}

/**
 * 延迟执行函数
 * @param ms 延迟时间（毫秒）
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 创建 RAF (RequestAnimationFrame) 调度器
 * @returns RAF 调度器
 */
export function createRAFScheduler() {
  let pending = false
  let callbacks: Array<() => void> = []

  const flush = () => {
    const cbs = callbacks.slice()
    callbacks = []
    pending = false
    cbs.forEach(cb => cb())
  }

  return {
    schedule(callback: () => void) {
      callbacks.push(callback)
      
      if (!pending) {
        pending = true
        requestAnimationFrame(flush)
      }
    },
    cancel() {
      callbacks = []
      pending = false
    }
  }
}

/**
 * 创建 IdleCallback 调度器
 * @param options 配置选项
 * @returns IdleCallback 调度器
 */
export function createIdleScheduler(options: { timeout?: number } = {}) {
  const { timeout = 1000 } = options
  let handle: number | null = null
  let callbacks: Array<() => void> = []

  const flush = (deadline: IdleDeadline) => {
    while (callbacks.length > 0 && deadline.timeRemaining() > 0) {
      const cb = callbacks.shift()
      if (cb) cb()
    }

    if (callbacks.length > 0) {
      handle = requestIdleCallback(flush, { timeout })
    } else {
      handle = null
    }
  }

  return {
    schedule(callback: () => void) {
      callbacks.push(callback)
      
      if (!handle && 'requestIdleCallback' in window) {
        handle = requestIdleCallback(flush, { timeout })
      } else if (!handle) {
        // Fallback to setTimeout for browsers that don't support requestIdleCallback
        setTimeout(() => {
          const cb = callbacks.shift()
          if (cb) cb()
        }, 0)
      }
    },
    cancel() {
      if (handle && 'cancelIdleCallback' in window) {
        cancelIdleCallback(handle)
      }
      callbacks = []
      handle = null
    }
  }
}

/**
 * 性能测量工具
 */
export class PerformanceMeasure {
  private marks = new Map<string, number>()
  private measures = new Map<string, number[]>()

  /**
   * 标记开始时间
   * @param name 标记名称
   */
  mark(name: string) {
    this.marks.set(name, performance.now())
  }

  /**
   * 测量时间间隔
   * @param name 测量名称
   * @param startMark 开始标记
   * @param endMark 结束标记（可选，默认为当前时间）
   */
  measure(name: string, startMark: string, endMark?: string) {
    const start = this.marks.get(startMark)
    if (!start) {
      console.warn(`Start mark "${startMark}" not found`)
      return
    }

    const end = endMark ? this.marks.get(endMark) : performance.now()
    if (!end) {
      console.warn(`End mark "${endMark}" not found`)
      return
    }

    const duration = end - start
    if (!this.measures.has(name)) {
      this.measures.set(name, [])
    }
    this.measures.get(name)!.push(duration)

    return duration
  }

  /**
   * 获取测量结果统计
   * @param name 测量名称
   */
  getStats(name: string) {
    const measures = this.measures.get(name)
    if (!measures || measures.length === 0) {
      return null
    }

    const sorted = [...measures].sort((a, b) => a - b)
    const sum = sorted.reduce((a, b) => a + b, 0)
    const avg = sum / sorted.length
    const median = sorted[Math.floor(sorted.length / 2)]
    const min = sorted[0]
    const max = sorted[sorted.length - 1]

    return {
      count: sorted.length,
      sum,
      avg,
      median,
      min,
      max,
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    }
  }

  /**
   * 清除所有标记和测量
   */
  clear() {
    this.marks.clear()
    this.measures.clear()
  }
}

/**
 * 创建性能观察器
 * @param callback 回调函数
 * @param options 配置选项
 */
export function createPerformanceObserver(
  callback: (entries: PerformanceEntry[]) => void,
  options: { entryTypes: string[] }
) {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      callback(list.getEntries())
    })
    observer.observe(options)
    return observer
  }
  return null
}
