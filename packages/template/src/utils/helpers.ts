/**
 * 核心工具函数
 */

import type { TemplateId, DeviceType } from '../types'

/**
 * 构建模板ID
 */
export function buildTemplateId(
  category: string,
  device: DeviceType,
  name: string
): TemplateId {
  return `${category}:${device}:${name}`
}

/**
 * 解析模板ID
 */
export function parseTemplateId(id: TemplateId): {
  category: string
  device: DeviceType
  name: string
} | null {
  const parts = id.split(':')
  if (parts.length !== 3) return null

  const [category, device, name] = parts
  if (!['mobile', 'tablet', 'desktop'].includes(device)) return null

  return { category, device: device as DeviceType, name }
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0

  return function (...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= wait) {
      lastTime = now
      fn(...args)
    }
  }
}

/**
 * 深拷贝
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj) as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T
  
  const cloned = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

/**
 * 检查是否在浏览器环境
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/**
 * 检查是否在开发环境
 */
export function isDev(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * 检查是否为Promise
 */
export function isPromise<T = any>(val: any): val is Promise<T> {
  return val && typeof val.then === 'function'
}

/**
 * 安全执行函数
 */
export async function safeExecute<T>(
  fn: () => T | Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  try {
    const result = fn()
    return isPromise(result) ? await result : result
  } catch (error) {
    console.error('[SafeExecute] Error:', error)
    return fallback
  }
}

/**
 * 格式化文件大小
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
}

/**
 * 生成唯一ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 对象合并（深度合并）
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target

  const source = sources.shift()
  if (!source) return target

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key]
      const targetValue = target[key]

      if (isObject(sourceValue) && isObject(targetValue)) {
        target[key] = deepMerge(targetValue, sourceValue)
      } else {
        target[key] = sourceValue as T[Extract<keyof T, string>]
      }
    }
  }

  return deepMerge(target, ...sources)
}

/**
 * 检查是否为对象
 */
function isObject(val: any): val is Record<string, any> {
  return val !== null && typeof val === 'object' && !Array.isArray(val)
}

/**
 * 比较版本号
 */
export function compareVersion(v1: string, v2: string): -1 | 0 | 1 {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)
  
  const len = Math.max(parts1.length, parts2.length)
  
  for (let i = 0; i < len; i++) {
    const num1 = parts1[i] || 0
    const num2 = parts2[i] || 0
    
    if (num1 < num2) return -1
    if (num1 > num2) return 1
  }
  
  return 0
}
