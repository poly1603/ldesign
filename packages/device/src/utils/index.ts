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

    keysToDelete.forEach(key => {
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
