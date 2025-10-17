/**
 * 共享工具函数
 * 提供防抖、节流等性能优化工具
 */

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null
  let result: any

  const debounced = function (this: any, ...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) result = func.apply(this, args)
    }

    const callNow = immediate && !timeout
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) result = func.apply(this, args)
    return result
  } as T

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  return debounced
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null
  let context: any
  let args: any
  let result: any
  let previous = 0

  const { leading = true, trailing = true } = options

  const later = () => {
    previous = leading === false ? 0 : Date.now()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null
  }

  const throttled = function (this: any, ...funcArgs: Parameters<T>) {
    const now = Date.now()
    if (!previous && leading === false) previous = now
    const remaining = wait - (now - previous)
    context = this
    args = funcArgs
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
    
    return result
  } as T

  throttled.cancel = () => {
    if (timeout) clearTimeout(timeout)
    previous = 0
    timeout = context = args = null
  }

  return throttled
}

/**
 * 批量更新
 */
export function batchUpdate(updates: (() => void)[]) {
  Promise.resolve().then(() => {
    updates.forEach(update => update())
  })
}

/**
 * 创建单例
 */
export function singleton<T>(factory: () => T): () => T {
  let instance: T | null = null
  return () => {
    if (!instance) {
      instance = factory()
    }
    return instance
  }
}

/**
 * 深度冻结对象（用于配置等不可变数据）
 */
export function deepFreeze<T extends object>(obj: T): Readonly<T> {
  Object.freeze(obj)
  Object.getOwnPropertyNames(obj).forEach(prop => {
    const value = (obj as any)[prop]
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value)
    }
  })
  return obj
}

/**
 * 懒加载函数
 */
export function lazyLoad<T>(factory: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | null = null
  return () => {
    if (!promise) {
      promise = factory()
    }
    return promise
  }
}

/**
 * 内存缓存装饰器
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }
    
    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}