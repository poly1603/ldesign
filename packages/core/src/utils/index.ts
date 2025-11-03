/**
 * 工具函数
 */

// 导出克隆工具
export * from './clone'

// 导出对象池工具
export * from './object-pool'

/**
 * 生成唯一ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null

  const debounced = function (this: any, ...args: any[]) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  } as T & { cancel: () => void }

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return debounced
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T & { cancel: () => void } {
  let lastTime = 0
  let timeoutId: NodeJS.Timeout | null = null

  const throttled = function (this: any, ...args: any[]) {
    const now = Date.now()
    const remaining = delay - (now - lastTime)

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      lastTime = now
      fn.apply(this, args)
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastTime = Date.now()
        timeoutId = null
        fn.apply(this, args)
      }, remaining)
    }
  } as T & { cancel: () => void }

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    lastTime = 0
  }

  return throttled
}

/**
 * 延迟执行
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number
    delay?: number
    onRetry?: (attempt: number, error: Error) => void
  } = {}
): Promise<T> {
  const { maxAttempts = 3, delay: retryDelay = 1000, onRetry } = options

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error
      }
      if (onRetry) {
        onRetry(attempt, error as Error)
      }
      await delay(retryDelay)
    }
  }

  throw new Error('Max attempts reached')
}

