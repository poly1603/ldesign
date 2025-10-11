import type { DeviceType, Orientation } from '../types'

/**
 * 高性能 LRU 缓存实现
 *
 * 优化特性:
 * - 使用Map保持插入顺序
 * - 支持TTL过期
 * - 添加性能统计
 */
class LRUCache<K, V> {
  private cache = new Map<K, { value: V, timestamp: number }>()
  private maxSize: number
  private ttl: number // 缓存过期时间(毫秒)

  // 性能统计
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
  }

  constructor(maxSize = 50, ttl = 300000) { // 默认5分钟过期
    this.maxSize = maxSize
    this.ttl = ttl
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key)
    if (entry === undefined) {
      this.stats.misses++
      return undefined
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      this.stats.evictions++
      return undefined
    }

    this.stats.hits++

    // 重新插入以更新顺序
    this.cache.delete(key)
    this.cache.set(key, { value: entry.value, timestamp: Date.now() })

    return entry.value
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    else if (this.cache.size >= this.maxSize) {
      // 删除最旧的项
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
        this.stats.evictions++
      }
    }
    this.cache.set(key, { value, timestamp: Date.now() })
  }

  clear(): void {
    this.cache.clear()
    this.stats = { hits: 0, misses: 0, evictions: 0 }
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
    }
  }

  /**
   * 清理过期项
   */
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: K[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => {
      this.cache.delete(key)
      this.stats.evictions++
    })
  }
}

// 全局缓存实例
const userAgentCache = new LRUCache<
  string,
  {
    os: { name: string, version: string }
    browser: { name: string, version: string }
  }
>(20)

/**
 * 解析用户代理字符串（带缓存）
 */
function parseUserAgent(userAgent: string): {
  os: { name: string, version: string }
  browser: { name: string, version: string }
} {
  // 检查缓存
  const cached = userAgentCache.get(userAgent)
  if (cached) {
    return cached
  }

  // 解析 OS
  const os = { name: 'unknown', version: 'unknown' }

  // Windows
  const windowsMatch = userAgent.match(/Windows NT (\d+\.\d+)/)
  if (windowsMatch) {
    os.name = 'Windows'
    const version = windowsMatch[1]
    const versionMap: Record<string, string> = {
      '10.0': '10',
      '6.3': '8.1',
      '6.2': '8',
      '6.1': '7',
      '6.0': 'Vista',
      '5.1': 'XP',
    }
    os.version = versionMap[version] || version
  }
  // macOS
  else if (/Mac OS X/.test(userAgent)) {
    os.name = 'macOS'
    const macMatch = userAgent.match(/Mac OS X (\d+[._]\d+[._]?\d*)/)
    if (macMatch) {
      os.version = macMatch[1].replace(/_/g, '.')
    }
  }
  // iOS
  else if (/iPhone|iPad|iPod/.test(userAgent)) {
    os.name = 'iOS'
    const iosMatch = userAgent.match(/OS (\d+[._]\d+[._]?\d*)/)
    if (iosMatch) {
      os.version = iosMatch[1].replace(/_/g, '.')
    }
  }
  // Android
  else if (/Android/.test(userAgent)) {
    os.name = 'Android'
    const androidMatch = userAgent.match(/Android (\d+\.\d+)/)
    if (androidMatch) {
      os.version = androidMatch[1]
    }
  }
  // Linux
  else if (/Linux/.test(userAgent)) {
    os.name = 'Linux'
  }

  // 解析浏览器
  const browser = { name: 'unknown', version: 'unknown' }

  // Chrome
  const chromeMatch = userAgent.match(/Chrome\/(\d+)/)
  if (chromeMatch && !/Edg/.test(userAgent)) {
    browser.name = 'Chrome'
    browser.version = chromeMatch[1]
  }
  // Edge
  else if (/Edg/.test(userAgent)) {
    browser.name = 'Edge'
    const edgeMatch = userAgent.match(/Edg\/(\d+)/)
    if (edgeMatch) {
      browser.version = edgeMatch[1]
    }
  }
  // Firefox
  else if (/Firefox/.test(userAgent)) {
    browser.name = 'Firefox'
    const firefoxMatch = userAgent.match(/Firefox\/(\d+)/)
    if (firefoxMatch) {
      browser.version = firefoxMatch[1]
    }
  }
  // Safari
  else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
    browser.name = 'Safari'
    const safariMatch = userAgent.match(/Version\/(\d+)/)
    if (safariMatch) {
      browser.version = safariMatch[1]
    }
  }

  const result = { os, browser }
  userAgentCache.set(userAgent, result)
  return result
}

/**
 * 高性能防抖函数
 *
 * 优化: 返回带清理函数的包装器
 *
 * @param func - 要防抖的函数
 * @param wait - 等待时间（毫秒）
 * @param immediate - 是否立即执行
 * @returns 防抖函数及清理函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  immediate = false,
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null
  let result: ReturnType<T>

  const debounced = (...args: Parameters<T>) => {
    const callNow = immediate && !timeout

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      timeout = null
      if (!immediate) {
        result = func(...args) as ReturnType<T>
      }
    }, wait)

    if (callNow) {
      result = func(...args) as ReturnType<T>
    }

    return result as void
  }

  // 添加清理函数
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  return debounced
}

/**
 * 高性能节流函数
 *
 * 优化: 返回带清理函数的包装器
 *
 * @param func - 要节流的函数
 * @param wait - 等待时间（毫秒）
 * @param options - 配置选项
 * @param options.leading - 是否在开始时执行
 * @param options.trailing - 是否在结束时执行
 * @returns 节流函数及清理函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  options: { leading?: boolean, trailing?: boolean } = {},
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null
  let previous = 0
  const { leading = true, trailing = true } = options

  const throttled = (...args: Parameters<T>) => {
    const now = Date.now()

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
      func(...args)
    }
    else if (!timeout && trailing) {
      timeout = setTimeout(() => {
        previous = leading ? Date.now() : 0
        timeout = null
        func(...args)
      }, remaining)
    }
  }

  // 添加清理函数
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
 * 检测是否为移动设备
 * @param userAgent - 可选的用户代理字符串，如果不提供则使用当前浏览器的 userAgent
 */
export function isMobileDevice(userAgent?: string): boolean {
  if (typeof window === 'undefined' && !userAgent)
    return false

  const ua
    = userAgent
      || (typeof window !== 'undefined' ? window.navigator.userAgent : '')
  const mobileRegex
    = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
  return mobileRegex.test(ua)
}

/**
 * 检测是否为触摸设备
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined')
    return false

  return (
    'ontouchstart' in window
    || navigator.maxTouchPoints > 0
    || (((navigator as unknown as Record<string, unknown>)
      .msMaxTouchPoints as number) || 0) > 0
  )
}

/**
 * 根据屏幕宽度判断设备类型
 */
export function getDeviceTypeByWidth(
  width: number,
  breakpoints = { mobile: 768, tablet: 1024 },
): DeviceType {
  if (width < breakpoints.mobile)
    return 'mobile'
  if (width < breakpoints.tablet)
    return 'tablet'
  return 'desktop'
}

/**
 * 获取屏幕方向
 * @param width - 可选的屏幕宽度，如果不提供则使用当前窗口宽度
 * @param height - 可选的屏幕高度，如果不提供则使用当前窗口高度
 */
export function getScreenOrientation(
  width?: number,
  height?: number,
): Orientation {
  if (
    typeof window === 'undefined'
    && (width === undefined || height === undefined)
  ) {
    return 'landscape'
  }

  // 如果提供了宽高参数，直接使用参数判断
  if (width !== undefined && height !== undefined) {
    return width >= height ? 'landscape' : 'portrait'
  }

  // 优先使用 screen.orientation API
  if (typeof window !== 'undefined' && screen.orientation) {
    return screen.orientation.angle === 0 || screen.orientation.angle === 180
      ? 'portrait'
      : 'landscape'
  }

  // 降级到窗口尺寸判断
  if (typeof window !== 'undefined')
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'

  return 'landscape'
}

/**
 * 解析用户代理字符串获取操作系统信息（带缓存）
 */
export function parseOS(userAgent: string): { name: string, version: string } {
  return parseUserAgent(userAgent).os
}

/**
 * 解析用户代理字符串获取浏览器信息（带缓存）
 */
export function parseBrowser(userAgent: string): {
  name: string
  version: string
} {
  return parseUserAgent(userAgent).browser
}

/**
 * 获取设备像素比
 */
export function getPixelRatio(): number {
  if (typeof window === 'undefined')
    return 1
  return window.devicePixelRatio || 1
}

/**
 * 检查是否支持某个 API
 */
export function isAPISupported(api: string): boolean {
  if (typeof window === 'undefined')
    return false

  const parts = api.split('.')
  let obj: Record<string, unknown> = window as unknown as Record<
    string,
    unknown
  >

  for (const part of parts) {
    if (!(part in obj))
      return false
    obj = obj[part] as Record<string, unknown>
  }

  return true
}

/**
 * 安全地访问 navigator API
 */
export function safeNavigatorAccess<T>(
  accessor: (navigator: Navigator) => T,
  fallback: T
): T
export function safeNavigatorAccess<K extends keyof Navigator>(
  property: K,
  fallback?: Navigator[K]
): Navigator[K] | undefined
export function safeNavigatorAccess<T, K extends keyof Navigator>(
  accessorOrProperty: ((navigator: Navigator) => T) | K,
  fallback?: T | Navigator[K],
): T | Navigator[K] | undefined {
  if (typeof navigator === 'undefined')
    return fallback

  try {
    if (typeof accessorOrProperty === 'function') {
      return accessorOrProperty(navigator)
    }
    else {
      return navigator[accessorOrProperty] ?? fallback
    }
  }
  catch {
    return fallback
  }
}

/**
 * 格式化字节大小
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0)
    return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
}

/**
 * 生成唯一 ID
 * @param prefix - 可选的前缀
 */
export function generateId(prefix?: string): string {
  const id
    = Math.random().toString(36).substring(2, 15)
      + Math.random().toString(36).substring(2, 15)
  return prefix ? `${prefix}-${id}` : id
}

/**
 * 批量执行函数（性能优化）
 *
 * 使用 requestIdleCallback 在浏览器空闲时批量执行任务
 *
 * @param tasks - 要执行的任务数组
 * @param options - 配置选项
 */
export function batchExecute<T>(
  tasks: Array<() => T>,
  options: { timeout?: number, chunkSize?: number } = {},
): Promise<T[]> {
  const { timeout = 1000, chunkSize = 10 } = options
  const results: T[] = []
  let currentIndex = 0

  return new Promise((resolve, reject) => {
    const executeChunk = (deadline?: IdleDeadline) => {
      try {
        const endTime = deadline ? deadline.timeRemaining() : 16
        const startTime = performance.now()

        while (
          currentIndex < tasks.length
          && (performance.now() - startTime < endTime || currentIndex % chunkSize !== 0)
        ) {
          results.push(tasks[currentIndex]())
          currentIndex++
        }

        if (currentIndex < tasks.length) {
          if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(executeChunk, { timeout })
          }
          else {
            setTimeout(() => executeChunk(), 0)
          }
        }
        else {
          resolve(results)
        }
      }
      catch (error) {
        reject(error)
      }
    }

    executeChunk()
  })
}

/**
 * 内存优化的对象池
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private factory: () => T
  private reset: (obj: T) => void
  private maxSize: number

  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    maxSize = 100,
  ) {
    this.factory = factory
    this.reset = reset
    this.maxSize = maxSize
  }

  /**
   * 获取对象
   */
  acquire(): T {
    return this.pool.pop() || this.factory()
  }

  /**
   * 释放对象
   */
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.reset(obj)
      this.pool.push(obj)
    }
  }

  /**
   * 清空对象池
   */
  clear(): void {
    this.pool = []
  }

  /**
   * 获取池大小
   */
  size(): number {
    return this.pool.length
  }
}

/**
 * 高性能的 Memoize 函数
 *
 * 使用 WeakMap 避免内存泄漏
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    maxSize?: number
    ttl?: number
    keyGenerator?: (...args: Parameters<T>) => string
  } = {},
): T {
  const { maxSize = 100, ttl, keyGenerator } = options
  const cache = new Map<string, { value: ReturnType<T>, timestamp: number }>()

  const memoized = (...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    const cached = cache.get(key)

    if (cached) {
      // 检查 TTL
      if (ttl && Date.now() - cached.timestamp > ttl) {
        cache.delete(key)
      }
      else {
        return cached.value
      }
    }

    const value = fn(...args)

    // 限制缓存大小
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value
      if (firstKey !== undefined) {
        cache.delete(firstKey)
      }
    }

    cache.set(key, { value, timestamp: Date.now() })
    return value
  }

  // 添加清除缓存的方法
  ;(memoized as any).clear = () => cache.clear()
  ;(memoized as any).delete = (key: string) => cache.delete(key)
  ;(memoized as any).size = () => cache.size

  return memoized as T
}

/**
 * 延迟执行函数
 */
export function defer(fn: () => void): void {
  if (typeof queueMicrotask !== 'undefined') {
    queueMicrotask(fn)
  }
  else if (typeof Promise !== 'undefined') {
    Promise.resolve().then(fn)
  }
  else {
    setTimeout(fn, 0)
  }
}

/**
 * 安全的 JSON 解析
 */
export function safeJSONParse<T = unknown>(
  json: string,
  fallback: T,
): T {
  try {
    return JSON.parse(json) as T
  }
  catch {
    return fallback
  }
}

/**
 * 深度克隆对象（性能优化版）
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T
  }

  if (obj instanceof Map) {
    const cloned = new Map()
    obj.forEach((value, key) => {
      cloned.set(key, deepClone(value))
    })
    return cloned as unknown as T
  }

  if (obj instanceof Set) {
    const cloned = new Set()
    obj.forEach((value) => {
      cloned.add(deepClone(value))
    })
    return cloned as unknown as T
  }

  const cloned = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }

  return cloned
}

/**
 * 深度合并对象
 *
 * @param target - 目标对象
 * @param sources - 源对象数组
 * @returns 合并后的对象
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Array<Partial<T>>
): T {
  if (!sources.length)
    return target

  const source = sources.shift()

  if (source === undefined)
    return target

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key])
          Object.assign(target, { [key]: {} })
        deepMerge(target[key] as Record<string, any>, source[key] as Record<string, any>)
      }
      else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}

/**
 * 判断是否为对象
 */
function isObject(item: unknown): item is Record<string, any> {
  return item !== null && typeof item === 'object' && !Array.isArray(item)
}

/**
 * 带重试机制的异步函数执行
 *
 * @param fn - 要执行的异步函数
 * @param options - 配置选项
 * @returns Promise
 *
 * @example
 * ```typescript
 * const result = await retry(
 *   () => fetch('/api/data'),
 *   {
 *     retries: 3,
 *     delay: 1000,
 *     backoff: 2,
 *     onRetry: (error, attempt) => {
 *       console.log(`Retry attempt ${attempt}:`, error)
 *     }
 *   }
 * )
 * ```
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number
    delay?: number
    backoff?: number
    maxDelay?: number
    onRetry?: (error: Error, attempt: number) => void
  } = {},
): Promise<T> {
  const {
    retries = 3,
    delay = 1000,
    backoff = 1.5,
    maxDelay = 10000,
    onRetry,
  } = options

  let lastError: Error
  let currentDelay = delay

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    }
    catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < retries) {
        onRetry?.(lastError, attempt + 1)

        await new Promise(resolve => setTimeout(resolve, currentDelay))

        // 指数退避
        currentDelay = Math.min(currentDelay * backoff, maxDelay)
      }
    }
  }

  throw new Error(lastError!.message)
}

/**
 * 并发控制的异步任务池
 *
 * @param poolLimit - 并发限制数量
 * @param array - 任务数组
 * @param iteratorFn - 迭代函数
 * @returns Promise<结果数组>
 *
 * @example
 * ```typescript
 * const results = await asyncPool(
 *   3, // 最多3个并发
 *   [1, 2, 3, 4, 5],
 *   async (num) => {
 *     const response = await fetch(`/api/${num}`)
 *     return response.json()
 *   }
 * )
 * ```
 */
export async function asyncPool<T, R>(
  poolLimit: number,
  array: T[],
  iteratorFn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = []
  const executing: Promise<void>[] = []

  for (let i = 0; i < array.length; i++) {
    const item = array[i]

    const p = Promise.resolve().then(async () => {
      const result = await iteratorFn(item, i)
      results[i] = result
    })

    results.push(p as any)

    if (poolLimit <= array.length) {
      const e: Promise<void> = p.then(() => {
        executing.splice(executing.indexOf(e), 1)
      })
      executing.push(e)

      if (executing.length >= poolLimit) {
        await Promise.race(executing)
      }
    }
  }

  await Promise.all(results)
  return results as R[]
}

/**
 * Promise 超时控制
 *
 * @param promise - 要执行的 Promise
 * @param ms - 超时时间（毫秒）
 * @param timeoutError - 自定义超时错误
 * @returns Promise
 *
 * @example
 * ```typescript
 * try {
 *   const result = await promiseTimeout(
 *     fetch('/api/data'),
 *     5000,
 *     new Error('Request timeout')
 *   )
 * } catch (error) {
 *   console.error('Timeout or error:', error)
 * }
 * ```
 */
export function promiseTimeout<T>(
  promise: Promise<T>,
  ms: number,
  timeoutError?: Error,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(timeoutError || new Error(`Promise timeout after ${ms}ms`))
    }, ms)

    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })
}

/**
 * 异步防抖函数
 *
 * @param fn - 要防抖的异步函数
 * @param wait - 等待时间（毫秒）
 * @returns 防抖后的函数
 *
 * @example
 * ```typescript
 * const debouncedFetch = asyncDebounce(
 *   async (query: string) => {
 *     const response = await fetch(`/api/search?q=${query}`)
 *     return response.json()
 *   },
 *   300
 * )
 *
 * // 只有最后一次调用会真正执行
 * debouncedFetch('hello')
 * debouncedFetch('world') // 只有这次会执行
 * ```
 */
export function asyncDebounce<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  wait: number,
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout | null = null
  let pendingPromise: Promise<ReturnType<T>> | null = null

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (timeout) {
      clearTimeout(timeout)
    }

    if (!pendingPromise) {
      pendingPromise = new Promise<ReturnType<T>>((resolve, reject) => {
        timeout = setTimeout(async () => {
          timeout = null
          try {
            const result = await fn(...args)
            resolve(result)
          }
          catch (error) {
            reject(error)
          }
          finally {
            pendingPromise = null
          }
        }, wait)
      })
    }

    return pendingPromise
  }
}

/**
 * 异步节流函数
 *
 * @param fn - 要节流的异步函数
 * @param wait - 等待时间（毫秒）
 * @returns 节流后的函数
 */
export function asyncThrottle<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  wait: number,
): (...args: Parameters<T>) => Promise<ReturnType<T> | undefined> {
  let timeout: NodeJS.Timeout | null = null
  let previous = 0
  let pendingPromise: Promise<ReturnType<T>> | null = null

  return async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
    const now = Date.now()
    const remaining = wait - (now - previous)

    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }

      previous = now
      pendingPromise = fn(...args)
      return pendingPromise
    }
    else if (!timeout && !pendingPromise) {
      return new Promise<ReturnType<T>>((resolve) => {
        timeout = setTimeout(async () => {
          previous = Date.now()
          timeout = null
          pendingPromise = fn(...args)
          const result = await pendingPromise
          pendingPromise = null
          resolve(result)
        }, remaining)
      })
    }

    return pendingPromise || undefined
  }
}

/**
 * 睡眠函数
 *
 * @param ms - 睡眠时间（毫秒）
 * @returns Promise
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 检查值是否为空（null、undefined、空字符串、空数组、空对象）
 *
 * @param value - 要检查的值
 * @returns 是否为空
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true
  }

  if (typeof value === 'string') {
    return value.trim().length === 0
  }

  if (Array.isArray(value)) {
    return value.length === 0
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0
  }

  return false
}

/**
 * 数组去重
 *
 * @param array - 要去重的数组
 * @param key - 可选的键名（用于对象数组）
 * @returns 去重后的数组
 */
export function unique<T>(
  array: T[],
  key?: keyof T,
): T[] {
  if (!key) {
    return Array.from(new Set(array))
  }

  const seen = new Set()
  return array.filter((item) => {
    const val = item[key]
    if (seen.has(val)) {
      return false
    }
    seen.add(val)
    return true
  })
}

/**
 * 数组分组
 *
 * @param array - 要分组的数组
 * @param fn - 分组函数
 * @returns 分组后的对象
 */
export function groupBy<T>(
  array: T[],
  fn: (item: T) => string | number,
): Record<string | number, T[]> {
  return array.reduce(
    (result, item) => {
      const key = fn(item)
      if (!result[key]) {
        result[key] = []
      }
      result[key].push(item)
      return result
    },
    {} as Record<string | number, T[]>,
  )
}

/**
 * 数组分块
 *
 * @param array - 要分块的数组
 * @param size - 每块的大小
 * @returns 分块后的二维数组
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * 随机生成指定范围内的整数
 *
 * @param min - 最小值
 * @param max - 最大值
 * @returns 随机整数
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 随机选择数组中的元素
 *
 * @param array - 数组
 * @returns 随机元素
 */
export function randomItem<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)]
}

/**
 * 打乱数组顺序（Fisher-Yates 洗牌算法）
 *
 * @param array - 要打乱的数组
 * @returns 打乱后的数组（不修改原数组）
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// 导出 ResourceManager 和 ErrorBoundary
export * from './ResourceManager'
export * from './ErrorBoundary'
