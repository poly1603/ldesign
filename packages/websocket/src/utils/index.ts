/**
 * WebSocket 工具函数集合
 * 
 * 提供各种实用的工具函数，包括重试、防抖、节流、UUID生成等
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type { RetryOptions, DebounceOptions, ThrottleOptions } from '@/types/utils'

/**
 * 生成 UUID v4
 * @returns UUID 字符串
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // 回退到手动生成
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 生成短 ID
 * @param length ID 长度
 * @returns 短 ID 字符串
 */
export function generateShortId(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 延迟函数
 * @param ms 延迟毫秒数
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 超时包装器
 * @param promise 要包装的 Promise
 * @param timeout 超时时间（毫秒）
 * @param errorMessage 超时错误信息
 * @returns 带超时的 Promise
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeout: number,
  errorMessage = '操作超时'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), timeout)
    })
  ])
}

/**
 * 重试函数
 * @param fn 要重试的函数
 * @param options 重试选项
 * @returns Promise
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    jitter = 100,
    shouldRetry = () => true
  } = options

  let lastError: Error
  let currentDelay = initialDelay

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxAttempts || !shouldRetry(lastError, attempt)) {
        throw lastError
      }

      // 计算延迟时间（包含抖动）
      const jitterAmount = Math.random() * jitter
      const delayWithJitter = Math.min(currentDelay + jitterAmount, maxDelay)

      await delay(delayWithJitter)

      // 更新下次延迟时间
      currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelay)
    }
  }

  throw lastError!
}

/**
 * 防抖函数
 * @param fn 要防抖的函数
 * @param options 防抖选项
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: Partial<DebounceOptions> = {}
): T & { cancel: () => void; flush: () => void } {
  const {
    delay: delayMs = 300,
    immediate = false,
    maxWait = 0
  } = options

  let timeoutId: NodeJS.Timeout | undefined
  let maxTimeoutId: NodeJS.Timeout | undefined
  let lastCallTime = 0
  let lastInvokeTime = 0
  let lastArgs: Parameters<T>
  let lastThis: unknown
  let result: ReturnType<T>

  function invokeFunc(time: number): ReturnType<T> {
    const args = lastArgs
    const thisArg = lastThis

    lastArgs = undefined as Parameters<T>
    lastThis = undefined
    lastInvokeTime = time
    result = fn.apply(thisArg, args)
    return result
  }

  function leadingEdge(time: number): ReturnType<T> {
    lastInvokeTime = time
    timeoutId = setTimeout(timerExpired, delayMs)
    return immediate ? invokeFunc(time) : result
  }

  function remainingWait(time: number): number {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = delayMs - timeSinceLastCall

    return maxWait > 0
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting
  }

  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime

    return (
      lastCallTime === 0 ||
      timeSinceLastCall >= delayMs ||
      timeSinceLastCall < 0 ||
      (maxWait > 0 && timeSinceLastInvoke >= maxWait)
    )
  }

  function timerExpired(): ReturnType<T> | undefined {
    const time = Date.now()
    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }
    timeoutId = setTimeout(timerExpired, remainingWait(time))
    return undefined
  }

  function trailingEdge(time: number): ReturnType<T> {
    timeoutId = undefined

    // 在立即执行模式下，如果已经在 leading edge 执行过了，就不在 trailing edge 再执行
    if (lastArgs && !(immediate && lastInvokeTime === lastCallTime)) {
      return invokeFunc(time)
    }
    lastArgs = undefined as Parameters<T>
    lastThis = undefined
    return result
  }

  function cancel(): void {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
    if (maxTimeoutId !== undefined) {
      clearTimeout(maxTimeoutId)
    }
    lastInvokeTime = 0
    lastArgs = undefined as Parameters<T>
    lastCallTime = 0
    lastThis = undefined
    timeoutId = undefined
    maxTimeoutId = undefined
  }

  function flush(): ReturnType<T> {
    return timeoutId === undefined ? result : trailingEdge(Date.now())
  }

  function debounced(this: unknown, ...args: Parameters<T>): ReturnType<T> {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    lastArgs = args
    lastThis = this
    lastCallTime = time

    if (isInvoking) {
      if (timeoutId === undefined) {
        return leadingEdge(lastCallTime)
      }
      if (maxWait > 0) {
        // 清除现有定时器
        clearTimeout(timeoutId)
        timeoutId = setTimeout(timerExpired, delayMs)
        return invokeFunc(lastCallTime)
      }
    }
    if (timeoutId === undefined) {
      timeoutId = setTimeout(timerExpired, delayMs)
    } else {
      // 重置定时器
      clearTimeout(timeoutId)
      timeoutId = setTimeout(timerExpired, delayMs)
    }
    return result
  }

  debounced.cancel = cancel
  debounced.flush = flush

  return debounced as T & { cancel: () => void; flush: () => void }
}

/**
 * 节流函数
 * @param fn 要节流的函数
 * @param options 节流选项
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: Partial<ThrottleOptions> = {}
): T & { cancel: () => void } {
  const {
    window: windowMs = 1000,
    maxRequests = 1,
    queue = false,
    maxQueueSize = 10
  } = options

  const requests: Array<{ timestamp: number; args: Parameters<T>; resolve: (value: ReturnType<T>) => void; reject: (error: Error) => void }> = []
  const requestQueue: Array<{ args: Parameters<T>; resolve: (value: ReturnType<T>) => void; reject: (error: Error) => void }> = []
  let timeoutId: NodeJS.Timeout | undefined

  function processQueue(): void {
    const now = Date.now()

    // 清理过期的请求
    while (requests.length > 0 && now - requests[0].timestamp >= windowMs) {
      requests.shift()
    }

    // 处理队列中的请求
    while (requests.length < maxRequests && requestQueue.length > 0) {
      const queuedRequest = requestQueue.shift()!
      const timestamp = Date.now()

      try {
        const result = fn(...queuedRequest.args)
        requests.push({ timestamp, args: queuedRequest.args, resolve: queuedRequest.resolve, reject: queuedRequest.reject })
        queuedRequest.resolve(result)
      } catch (error) {
        queuedRequest.reject(error as Error)
      }
    }

    // 如果还有队列中的请求，设置下次处理时间
    if (requestQueue.length > 0) {
      const nextProcessTime = requests.length > 0
        ? requests[0].timestamp + windowMs - Date.now()
        : 0

      timeoutId = setTimeout(processQueue, Math.max(0, nextProcessTime))
    }
  }

  function throttled(this: unknown, ...args: Parameters<T>): Promise<ReturnType<T>> {
    return new Promise((resolve, reject) => {
      const now = Date.now()

      // 清理过期的请求
      while (requests.length > 0 && now - requests[0].timestamp >= windowMs) {
        requests.shift()
      }

      // 如果在限制范围内，直接执行
      if (requests.length < maxRequests) {
        try {
          const result = fn.apply(this, args)
          requests.push({ timestamp: now, args, resolve, reject })
          resolve(result)
        } catch (error) {
          reject(error as Error)
        }
      } else if (queue && requestQueue.length < maxQueueSize) {
        // 加入队列
        requestQueue.push({ args, resolve, reject })

        if (!timeoutId) {
          const nextProcessTime = requests[0].timestamp + windowMs - now
          timeoutId = setTimeout(processQueue, Math.max(0, nextProcessTime))
        }
      } else {
        // 拒绝请求
        reject(new Error('请求频率过高，请稍后再试'))
      }
    })
  }

  function cancel(): void {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }
    requests.length = 0
    requestQueue.length = 0
  }

  throttled.cancel = cancel

  return throttled as T & { cancel: () => void }
}



/**
 * 深度克隆对象
 * @param obj 要克隆的对象
 * @returns 克隆后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as T
  }

  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  return obj
}

/**
 * 深度合并对象
 * @param target 目标对象
 * @param sources 源对象列表
 * @returns 合并后的对象
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Array<Partial<T>>
): T {
  if (!sources.length) return deepClone(target)

  const result = deepClone(target)

  for (const source of sources) {
    if (!source) continue

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key]
        const targetValue = result[key]

        if (
          sourceValue &&
          typeof sourceValue === 'object' &&
          !Array.isArray(sourceValue) &&
          targetValue &&
          typeof targetValue === 'object' &&
          !Array.isArray(targetValue)
        ) {
          result[key] = deepMerge(targetValue, sourceValue)
        } else {
          result[key] = deepClone(sourceValue) as T[Extract<keyof T, string>]
        }
      }
    }
  }

  return result
}

/**
 * 检查是否为有效的 URL
 * @param url URL 字符串
 * @returns 是否有效
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 检查是否为 WebSocket URL
 * @param url URL 字符串
 * @returns 是否为 WebSocket URL
 */
export function isWebSocketUrl(url: string): boolean {
  if (!isValidUrl(url)) return false

  const parsedUrl = new URL(url)
  return parsedUrl.protocol === 'ws:' || parsedUrl.protocol === 'wss:'
}

/**
 * 格式化字节大小
 * @param bytes 字节数
 * @param decimals 小数位数
 * @returns 格式化后的字符串
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 获取当前时间戳
 * @returns 毫秒时间戳
 */
export function now(): number {
  return Date.now()
}

/**
 * 检查对象是否为空
 * @param obj 要检查的对象
 * @returns 是否为空
 */
export function isEmpty(obj: unknown): boolean {
  if (obj == null) return true
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

/**
 * 安全的 JSON 解析
 * @param json JSON 字符串
 * @param defaultValue 默认值
 * @returns 解析结果
 */
export function safeJsonParse<T = unknown>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return defaultValue
  }
}

/**
 * 安全的 JSON 字符串化
 * @param obj 要字符串化的对象
 * @param defaultValue 默认值
 * @returns JSON 字符串
 */
export function safeJsonStringify(obj: unknown, defaultValue = '{}'): string {
  try {
    return JSON.stringify(obj)
  } catch {
    return defaultValue
  }
}
