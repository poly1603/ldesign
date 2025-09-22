/**
 * 通用模式和工具函数
 * 
 * 提供常用的代码模式和工具函数，减少代码重复
 */

import { BUILD_CONSTANTS } from '../constants/defaults'

/**
 * 重试配置
 */
export interface RetryOptions {
  /** 最大重试次数 */
  maxRetries?: number
  /** 重试延迟基数 (ms) */
  delayBase?: number
  /** 最大延迟时间 (ms) */
  maxDelay?: number
  /** 是否使用指数退避 */
  exponentialBackoff?: boolean
}

/**
 * 带重试的异步函数执行器
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = BUILD_CONSTANTS.MAX_RETRY_COUNT,
    delayBase = BUILD_CONSTANTS.RETRY_DELAY_BASE,
    maxDelay = 10000,
    exponentialBackoff = true
  } = options

  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt === maxRetries) {
        break
      }
      
      // 计算延迟时间
      const delay = exponentialBackoff 
        ? Math.min(delayBase * Math.pow(2, attempt), maxDelay)
        : delayBase
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

/**
 * 安全的异步操作包装器
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback?: T,
  onError?: (error: Error) => void
): Promise<T | undefined> {
  try {
    return await fn()
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    onError?.(err)
    return fallback
  }
}

/**
 * 批量处理数组元素
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  batchSize = 10
): Promise<R[]> {
  const results: R[] = []
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map((item, index) => processor(item, i + index))
    )
    results.push(...batchResults)
  }
  
  return results
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | undefined
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      fn(...args)
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
  let lastCall = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastCall >= delay) {
      lastCall = now
      fn(...args)
    }
  }
}

/**
 * 缓存装饰器
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()
  
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }
    
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * 格式化持续时间
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
  if (ms < 3600000) return `${(ms / 60000).toFixed(2)}m`
  return `${(ms / 3600000).toFixed(2)}h`
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target
  
  const source = sources.shift()
  if (!source) return target
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {} as any
      }
      deepMerge(target[key], source[key])
    } else {
      target[key] = source[key] as any
    }
  }
  
  return deepMerge(target, ...sources)
}

/**
 * 检查是否为空值
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * 确保值为数组
 */
export function ensureArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

/**
 * 安全的JSON解析
 */
export function safeJsonParse<T = any>(
  json: string,
  fallback?: T
): T | undefined {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

/**
 * 创建计时器
 */
export function createTimer(label?: string) {
  const startTime = performance.now()
  
  return {
    end: () => {
      const duration = performance.now() - startTime
      if (label) {
        console.log(`${label}: ${formatDuration(duration)}`)
      }
      return duration
    },
    elapsed: () => performance.now() - startTime
  }
}

/**
 * 并发限制器
 */
export class ConcurrencyLimiter {
  private running = 0
  private queue: Array<() => void> = []

  constructor(private limit: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        this.running++
        try {
          const result = await fn()
          resolve(result)
        } catch (error) {
          reject(error)
        } finally {
          this.running--
          this.processQueue()
        }
      }

      if (this.running < this.limit) {
        execute()
      } else {
        this.queue.push(execute)
      }
    })
  }

  private processQueue() {
    if (this.queue.length > 0 && this.running < this.limit) {
      const next = this.queue.shift()
      if (next) next()
    }
  }
}
