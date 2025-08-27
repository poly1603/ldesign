/**
 * 核心工具函数
 * 
 * 提供表单系统中常用的工具函数，包括数据处理、类型检查、性能优化等
 */

import type { AnyObject, AnyFunction } from '../types'

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }
  
  return obj
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends AnyObject>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target
  
  const source = sources.shift()
  if (!source) return target
  
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMerge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }
  
  return deepMerge(target, ...sources)
}

/**
 * 检查是否为对象
 */
export function isObject(item: any): item is AnyObject {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * 检查是否为空值
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return true
  }
  
  if (typeof value === 'string') {
    return value.trim() === ''
  }
  
  if (Array.isArray(value)) {
    return value.length === 0
  }
  
  if (isObject(value)) {
    return Object.keys(value).length === 0
  }
  
  return false
}

/**
 * 获取嵌套对象的值
 */
export function getNestedValue(obj: AnyObject, path: string): any {
  if (!path) return obj
  
  const keys = path.split('.')
  let current = obj
  
  for (const key of keys) {
    if (current == null || typeof current !== 'object') {
      return undefined
    }
    current = current[key]
  }
  
  return current
}

/**
 * 设置嵌套对象的值
 */
export function setNestedValue(obj: AnyObject, path: string, value: any): void {
  if (!path) return
  
  const keys = path.split('.')
  let current = obj
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }
  
  current[keys[keys.length - 1]] = value
}

/**
 * 删除嵌套对象的值
 */
export function deleteNestedValue(obj: AnyObject, path: string): boolean {
  if (!path) return false
  
  const keys = path.split('.')
  let current = obj
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== 'object') {
      return false
    }
    current = current[key]
  }
  
  const lastKey = keys[keys.length - 1]
  if (lastKey in current) {
    delete current[lastKey]
    return true
  }
  
  return false
}

/**
 * 检查嵌套路径是否存在
 */
export function hasNestedPath(obj: AnyObject, path: string): boolean {
  if (!path) return true
  
  const keys = path.split('.')
  let current = obj
  
  for (const key of keys) {
    if (current == null || typeof current !== 'object' || !(key in current)) {
      return false
    }
    current = current[key]
  }
  
  return true
}

/**
 * 防抖函数
 */
export function debounce<T extends AnyFunction>(
  fn: T,
  delay: number,
  immediate = false
): T {
  let timeoutId: NodeJS.Timeout | null = null
  let lastArgs: Parameters<T>
  let lastThis: any
  
  const debounced = function (this: any, ...args: Parameters<T>) {
    lastArgs = args
    lastThis = this
    
    const callNow = immediate && !timeoutId
    
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      timeoutId = null
      if (!immediate) {
        fn.apply(lastThis, lastArgs)
      }
    }, delay)
    
    if (callNow) {
      fn.apply(lastThis, lastArgs)
    }
  } as T
  
  // 添加取消方法
  ;(debounced as any).cancel = () => {
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
export function throttle<T extends AnyFunction>(
  fn: T,
  interval: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T {
  const { leading = true, trailing = true } = options
  
  let lastCall = 0
  let timeoutId: NodeJS.Timeout | null = null
  let lastArgs: Parameters<T>
  let lastThis: any
  
  const throttled = function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    lastArgs = args
    lastThis = this
    
    if (!lastCall && !leading) {
      lastCall = now
    }
    
    const remaining = interval - (now - lastCall)
    
    if (remaining <= 0 || remaining > interval) {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      lastCall = now
      fn.apply(lastThis, lastArgs)
    } else if (!timeoutId && trailing) {
      timeoutId = setTimeout(() => {
        lastCall = leading ? Date.now() : 0
        timeoutId = null
        fn.apply(lastThis, lastArgs)
      }, remaining)
    }
  } as T
  
  // 添加取消方法
  ;(throttled as any).cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    lastCall = 0
  }
  
  return throttled
}

/**
 * 生成唯一ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化数字
 */
export function formatNumber(
  num: number,
  options: {
    locale?: string
    style?: 'decimal' | 'currency' | 'percent'
    currency?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  } = {}
): string {
  const {
    locale = 'zh-CN',
    style = 'decimal',
    currency = 'CNY',
    minimumFractionDigits,
    maximumFractionDigits
  } = options
  
  return new Intl.NumberFormat(locale, {
    style,
    currency: style === 'currency' ? currency : undefined,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(num)
}

/**
 * 格式化日期
 */
export function formatDate(
  date: Date | string | number,
  format = 'YYYY-MM-DD HH:mm:ss'
): string {
  const d = new Date(date)
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date'
  }
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 解析查询字符串
 */
export function parseQueryString(query: string): AnyObject {
  const params: AnyObject = {}
  
  if (!query) return params
  
  const searchParams = new URLSearchParams(query.startsWith('?') ? query.slice(1) : query)
  
  for (const [key, value] of searchParams) {
    if (key in params) {
      if (Array.isArray(params[key])) {
        params[key].push(value)
      } else {
        params[key] = [params[key], value]
      }
    } else {
      params[key] = value
    }
  }
  
  return params
}

/**
 * 构建查询字符串
 */
export function buildQueryString(params: AnyObject): string {
  const searchParams = new URLSearchParams()
  
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach(v => searchParams.append(key, String(v)))
    } else if (value !== null && value !== undefined) {
      searchParams.append(key, String(value))
    }
  }
  
  return searchParams.toString()
}

/**
 * 类型守卫：检查是否为Promise
 */
export function isPromise<T = any>(value: any): value is Promise<T> {
  return value && typeof value.then === 'function'
}

/**
 * 类型守卫：检查是否为函数
 */
export function isFunction(value: any): value is AnyFunction {
  return typeof value === 'function'
}

/**
 * 类型守卫：检查是否为字符串
 */
export function isString(value: any): value is string {
  return typeof value === 'string'
}

/**
 * 类型守卫：检查是否为数字
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * 类型守卫：检查是否为布尔值
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean'
}

/**
 * 类型守卫：检查是否为数组
 */
export function isArray<T = any>(value: any): value is T[] {
  return Array.isArray(value)
}

/**
 * 安全的JSON解析
 */
export function safeJsonParse<T = any>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return defaultValue
  }
}

/**
 * 安全的JSON字符串化
 */
export function safeJsonStringify(obj: any, space?: number): string {
  try {
    return JSON.stringify(obj, null, space)
  } catch {
    return '{}'
  }
}

/**
 * 获取对象的所有路径
 */
export function getObjectPaths(obj: AnyObject, prefix = ''): string[] {
  const paths: string[] = []
  
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}.${key}` : key
    paths.push(currentPath)
    
    if (isObject(value)) {
      paths.push(...getObjectPaths(value, currentPath))
    }
  }
  
  return paths
}

/**
 * 扁平化对象
 */
export function flattenObject(obj: AnyObject, prefix = ''): AnyObject {
  const flattened: AnyObject = {}
  
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}.${key}` : key
    
    if (isObject(value)) {
      Object.assign(flattened, flattenObject(value, currentPath))
    } else {
      flattened[currentPath] = value
    }
  }
  
  return flattened
}

/**
 * 反扁平化对象
 */
export function unflattenObject(obj: AnyObject): AnyObject {
  const result: AnyObject = {}
  
  for (const [path, value] of Object.entries(obj)) {
    setNestedValue(result, path, value)
  }
  
  return result
}

/**
 * 比较两个值是否相等（深度比较）
 */
export function isEqual(a: any, b: any): boolean {
  if (a === b) return true
  
  if (a == null || b == null) return a === b
  
  if (typeof a !== typeof b) return false
  
  if (typeof a !== 'object') return a === b
  
  if (Array.isArray(a) !== Array.isArray(b)) return false
  
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => isEqual(item, b[index]))
  }
  
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  
  if (keysA.length !== keysB.length) return false
  
  return keysA.every(key => isEqual(a[key], b[key]))
}

/**
 * 获取数据类型
 */
export function getType(value: any): string {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
}

/**
 * 确保值为数组
 */
export function ensureArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

/**
 * 移除数组中的重复项
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

/**
 * 数组分组
 */
export function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item)
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
    return groups
  }, {} as Record<string, T[]>)
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
    retries?: number
    delay?: number
    backoff?: number
  } = {}
): Promise<T> {
  const { retries = 3, delay: delayMs = 1000, backoff = 1 } = options
  
  let lastError: Error
  
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (i < retries) {
        await delay(delayMs * Math.pow(backoff, i))
      }
    }
  }
  
  throw lastError!
}
