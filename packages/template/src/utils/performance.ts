/**
 * 性能优化工具函数
 */

/**
 * 创建防抖函数 - 优化版
 * 使用 WeakMap 缓存定时器，支持多实例
 */
const debounceTimers = new WeakMap<Function, ReturnType<typeof setTimeout>>()

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  return function(this: any, ...args: Parameters<T>) {
    const existingTimer = debounceTimers.get(fn)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }
    
    const timer = setTimeout(() => {
      fn.apply(this, args)
      debounceTimers.delete(fn)
    }, delay)
    
    debounceTimers.set(fn, timer)
  }
}

/**
 * 创建节流函数 - 优化版
 * 支持前缘触发和后缘触发
 */
interface ThrottleOptions {
  leading?: boolean  // 是否在延迟开始前调用
  trailing?: boolean // 是否在延迟结束后调用
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 300,
  options: ThrottleOptions = { leading: true, trailing: true }
): (...args: Parameters<T>) => void {
  let inThrottle = false
  let lastArgs: Parameters<T> | null = null
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      // 前缘触发
      if (options.leading !== false) {
        fn.apply(this, args)
      }
      inThrottle = true
      
      timeoutId = setTimeout(() => {
        inThrottle = false
        
        // 后缘触发
        if (options.trailing !== false && lastArgs) {
          fn.apply(this, lastArgs)
          lastArgs = null
        }
        
        timeoutId = null
      }, limit)
    } else {
      lastArgs = args
    }
  }
}

/**
 * 批量处理 - 将多次调用合并为一次
 */
export function batch<T>(
  fn: (items: T[]) => void,
  delay: number = 16
): (item: T) => void {
  let items: T[] = []
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function(item: T) {
    items.push(item)
    
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      fn(items)
      items = []
      timeoutId = null
    }, delay)
  }
}

/**
 * 惰性初始化 - 延迟创建开销大的对象
 */
export function lazy<T>(factory: () => T): () => T {
  let instance: T | null = null
  
  return function() {
    if (instance === null) {
      instance = factory()
    }
    return instance
  }
}

/**
 * Memoization - 缓存函数结果
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    maxSize?: number
    keyGenerator?: (...args: Parameters<T>) => string
  } = {}
): T {
  const cache = new Map<string, ReturnType<T>>()
  const { maxSize = 100, keyGenerator = (...args) => JSON.stringify(args) } = options
  
  return function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = keyGenerator(...args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }
    
    const result = fn.apply(this, args)
    
    // 限制缓存大小
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }
    
    cache.set(key, result)
    return result
  } as T
}

/**
 * 使用 requestIdleCallback 优化非关键任务
 */
export function runWhenIdle(
  callback: () => void,
  options?: IdleRequestOptions
): void {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(callback, options)
  } else {
    // 降级方案
    setTimeout(callback, 1)
  }
}

/**
 * 使用 requestAnimationFrame 优化动画
 */
export function runInNextFrame(callback: () => void): number {
  return requestAnimationFrame(callback)
}

/**
 * 分批处理大数组 - 避免阻塞主线程
 */
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => R,
  batchSize: number = 100
): Promise<R[]> {
  const results: R[] = []
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = batch.map(processor)
    results.push(...batchResults)
    
    // 让出主线程
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }
  
  return results
}

/**
 * 虚拟滚动辅助函数
 */
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3
): { start: number; end: number } {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const end = Math.min(totalItems, start + visibleCount + overscan * 2)
  
  return { start, end }
}

/**
 * 对象池 - 重用对象减少 GC 压力
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private factory: () => T
  private reset?: (obj: T) => void

  constructor(factory: () => T, reset?: (obj: T) => void, initialSize: number = 10) {
    this.factory = factory
    this.reset = reset
    
    // 预创建对象
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory())
    }
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    return this.factory()
  }

  release(obj: T): void {
    if (this.reset) {
      this.reset(obj)
    }
    this.pool.push(obj)
  }

  clear(): void {
    this.pool = []
  }
}

