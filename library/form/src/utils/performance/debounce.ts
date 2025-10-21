/**
 * @ldesign/form - Debounce and Throttle Utilities
 * 防抖和节流工具函数
 */

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @param immediate 是否立即执行
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): {
  (...args: Parameters<T>): void
  cancel: () => void
  flush: () => void
} {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let result: ReturnType<T> | undefined

  const debounced = function (this: any, ...args: Parameters<T>) {
    const context = this

    const later = () => {
      timeout = null
      if (!immediate) {
        result = func.apply(context, args)
      }
    }

    const callNow = immediate && !timeout

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(later, wait)

    if (callNow) {
      result = func.apply(context, args)
    }

    return result
  }

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  debounced.flush = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
      result = func.apply(null, [] as any)
    }
  }

  return debounced
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param wait 等待时间（毫秒）
 * @param options 配置选项
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): {
  (...args: Parameters<T>): void
  cancel: () => void
} {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let previous = 0
  let result: ReturnType<T> | undefined

  const { leading = true, trailing = true } = options

  const throttled = function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    const context = this

    if (!previous && !leading) {
      previous = now
    }

    const remaining = wait - (now - previous)

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(context, args)
    } else if (!timeout && trailing) {
      timeout = setTimeout(() => {
        previous = leading ? Date.now() : 0
        timeout = null
        result = func.apply(context, args)
      }, remaining)
    }

    return result
  }

  throttled.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    previous = 0
  }

  return throttled
}

/**
 * RAF 节流（使用 requestAnimationFrame）
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): {
  (...args: Parameters<T>): void
  cancel: () => void
} {
  let rafId: number | null = null
  let latestArgs: Parameters<T> | null = null

  const throttled = function (this: any, ...args: Parameters<T>) {
    latestArgs = args

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func.apply(this, latestArgs!)
        rafId = null
        latestArgs = null
      })
    }
  }

  throttled.cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
      latestArgs = null
    }
  }

  return throttled
}




