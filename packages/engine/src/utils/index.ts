/**
 * @ldesign/engine/utils 工具函数
 * 
 * 提供各种实用工具函数
 */

// ============ 基础工具函数 ============

/**
 * 数组分块
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    timeoutId = window.setTimeout(() => {
      fn.apply(this, args)
      timeoutId = null
    }, delay)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastTime = 0

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()

    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 深拷贝
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as any
  }

  const cloned: any = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone((obj as any)[key])
    }
  }
  return cloned
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
}

/**
 * 格式化时间
 */
export function formatTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

/**
 * 获取嵌套值
 */
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * 设置嵌套值
 */
export function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  const target = keys.reduce((current, key) => {
    if (!(key in current)) {
      current[key] = {}
    }
    return current[key]
  }, obj)
  target[lastKey] = value
}

/**
 * 分组
 */
export function groupBy<T>(array: T[], key: keyof T | ((item: T) => string)): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : String(item[key])
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

/**
 * 去重
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

/**
 * 检查是否为空
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * 检查是否为函数
 */
export function isFunction(value: any): value is (...args: any[]) => unknown {
  return typeof value === 'function'
}

/**
 * 检查是否为对象
 */
export function isObject(value: any): value is object {
  return value !== null && typeof value === 'object'
}

/**
 * 检查是否为 Promise
 */
export function isPromise(value: any): value is Promise<any> {
  return value instanceof Promise
}

/**
 * 安全的 JSON parse
 */
export function safeJsonParse(json: string, fallback: any = null): any {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

/**
 * 安全的 JSON stringify
 */
export function safeJsonStringify(obj: any, fallback: string = '{}'): string {
  try {
    return JSON.stringify(obj)
  } catch {
    return fallback
  }
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    delay?: number
    backoff?: number
  } = {}
): Promise<T> {
  const { maxRetries = 3, delay: initialDelay = 1000, backoff = 2 } = options

  let lastError: unknown = null
  let currentDelay = initialDelay

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, currentDelay))
        currentDelay *= backoff
      }
    }
  }

  throw (lastError instanceof Error ? lastError : new Error('Unknown error'))
}

// ============ 内存管理工具（新增） ============

export { createManagedContext, destroyGlobalContext, getGlobalContext } from './memory-management';
export { createMemoryMonitor, MemoryMonitor } from './memory-monitor';
export type { MemoryError, MemoryMonitorConfig, MemoryStats, MemoryWarning } from './memory-monitor';
export { createResourceManager, ResourceManager } from './resource-manager';

// ============ LRU缓存（新增） ============

export { createLRUCache, LRUCache } from './lru-cache';
export type { LRUCacheOptions } from './lru-cache';
