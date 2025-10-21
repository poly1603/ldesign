/**
 * LDesign Simple App - Library Export
 * 
 * 导出可重用的工具函数和类型定义
 */

/**
 * 应用版本信息
 */
export const VERSION = '1.0.0'

/**
 * 应用名称
 */
export const APP_NAME = 'LDesign Simple App'

/**
 * 应用描述
 */
export const APP_DESCRIPTION = '现代化前端开发框架示例应用'

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 格式化时间
 */
export function formatTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  if (minutes === 0) return `${seconds}s`
  return `${minutes}m ${seconds % 60}s`
}

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as any
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any
  if (obj instanceof Object) {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return function(this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 应用配置类型
 */
export interface AppConfig {
  name: string
  version: string
  description: string
  apiUrl?: string
  debug?: boolean
}

/**
 * 用户类型
 */
export interface User {
  id: string
  username: string
  name: string
  email: string
  roles: string[]
  avatar?: string
  createdAt: string
}

/**
 * 默认导出
 */
export default {
  VERSION,
  APP_NAME,
  APP_DESCRIPTION,
  formatFileSize,
  formatTime,
  deepClone,
  debounce,
  throttle
}

