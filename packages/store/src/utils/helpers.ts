/**
 * 通用辅助工具函数
 * 提供数据操作、深度克隆、对象合并等常用功能
 */

import { TypeGuards } from './validation'

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T, seen = new WeakMap()): T {
  // 处理原始类型
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // 处理循环引用
  if (seen.has(obj as any)) {
    return seen.get(obj as any)
  }

  // 处理日期
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any
  }

  // 处理正则表达式
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as any
  }

  // 处理 Map
  if (obj instanceof Map) {
    const cloned = new Map()
    seen.set(obj as any, cloned)
    obj.forEach((value, key) => {
      cloned.set(deepClone(key, seen), deepClone(value, seen))
    })
    return cloned as any
  }

  // 处理 Set
  if (obj instanceof Set) {
    const cloned = new Set()
    seen.set(obj as any, cloned)
    obj.forEach(value => {
      cloned.add(deepClone(value, seen))
    })
    return cloned as any
  }

  // 处理数组
  if (Array.isArray(obj)) {
    const cloned: any[] = []
    seen.set(obj as any, cloned)
    obj.forEach((item, index) => {
      cloned[index] = deepClone(item, seen)
    })
    return cloned as any
  }

  // 处理普通对象
  const cloned: any = {}
  seen.set(obj as any, cloned)
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key], seen)
    }
  }

  return cloned
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

  if (TypeGuards.isObject(target) && TypeGuards.isObject(source)) {
    for (const key in source) {
      if (TypeGuards.isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} })
        }
        deepMerge(target[key] as any, source[key] as any)
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}

/**
 * 深度冻结对象
 */
export function deepFreeze<T>(obj: T): Readonly<T> {
  // 冻结对象本身
  Object.freeze(obj)

  // 递归冻结所有属性
  if (obj && typeof obj === 'object') {
    Object.getOwnPropertyNames(obj).forEach((prop) => {
      const value = (obj as any)[prop]
      if (
        value &&
        typeof value === 'object' &&
        !Object.isFrozen(value)
      ) {
        deepFreeze(value)
      }
    })
  }

  return obj as Readonly<T>
}

/**
 * 获取对象深层属性值
 */
export function getDeepValue<T = any>(
  obj: any,
  path: string | string[],
  defaultValue?: T
): T | undefined {
  const keys = Array.isArray(path) ? path : path.split('.')
  let result = obj

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue
    }
    result = result[key]
  }

  return result === undefined ? defaultValue : result
}

/**
 * 设置对象深层属性值
 */
export function setDeepValue(
  obj: any,
  path: string | string[],
  value: any
): void {
  const keys = Array.isArray(path) ? path : path.split('.')
  const lastKey = keys.pop()

  if (!lastKey) return

  let current = obj
  for (const key of keys) {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }

  current[lastKey] = value
}

/**
 * 删除对象深层属性
 */
export function deleteDeepValue(
  obj: any,
  path: string | string[]
): boolean {
  const keys = Array.isArray(path) ? path : path.split('.')
  const lastKey = keys.pop()

  if (!lastKey) return false

  let current = obj
  for (const key of keys) {
    if (!current[key]) {
      return false
    }
    current = current[key]
  }

  return delete current[lastKey]
}

/**
 * 判断两个值是否深度相等
 */
export function deepEqual(a: any, b: any, seen = new WeakMap()): boolean {
  // 相同引用
  if (a === b) return true

  // null/undefined 检查
  if (a === null || b === null || a === undefined || b === undefined) {
    return a === b
  }

  // 类型检查
  if (typeof a !== typeof b) return false

  // 原始类型
  if (typeof a !== 'object') return a === b

  // 处理循环引用
  if (seen.has(a)) {
    return seen.get(a) === b
  }
  seen.set(a, b)

  // 日期
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }

  // 正则表达式
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.source === b.source && a.flags === b.flags
  }

  // 数组
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => deepEqual(item, b[index], seen))
  }

  // Map
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false
    for (const [key, value] of a) {
      if (!b.has(key) || !deepEqual(value, b.get(key), seen)) {
        return false
      }
    }
    return true
  }

  // Set
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false
    for (const item of a) {
      if (!b.has(item)) return false
    }
    return true
  }

  // 普通对象
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  return keysA.every(key => {
    return Object.prototype.hasOwnProperty.call(b, key) &&
           deepEqual(a[key], b[key], seen)
  })
}

/**
 * 选择对象的部分属性
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key]
    }
  }
  return result
}

/**
 * 排除对象的部分属性
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj } as any
  for (const key of keys) {
    delete result[key]
  }
  return result
}

/**
 * 扁平化对象（将嵌套对象转为平面结构）
 */
export function flattenObject(
  obj: any,
  prefix = '',
  separator = '.'
): Record<string, any> {
  const result: Record<string, any> = {}

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue

    const value = obj[key]
    const newKey = prefix ? `${prefix}${separator}${key}` : key

    if (TypeGuards.isPlainObject(value) && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey, separator))
    } else {
      result[newKey] = value
    }
  }

  return result
}

/**
 * 反扁平化对象（将平面对象转为嵌套结构）
 */
export function unflattenObject(
  obj: Record<string, any>,
  separator = '.'
): any {
  const result: any = {}

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue
    setDeepValue(result, key.split(separator), obj[key])
  }

  return result
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | undefined

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastTime = 0

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      func.apply(this, args)
    }
  }
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
    onRetry?: (error: Error, attempt: number) => void
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay: retryDelay = 1000,
    onRetry,
  } = options

  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt < maxAttempts) {
        onRetry?.(lastError, attempt)
        await delay(retryDelay * attempt)
      }
    }
  }

  throw lastError!
}

/**
 * Memoize 函数（缓存函数结果）
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()

  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = resolver ? resolver(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  } as T
}

/**
 * 批处理函数
 */
export function batch<T, R>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
  const batches: T[][] = []
  
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize))
  }

  return Promise.all(batches.map(processor)).then(results =>
    results.flat()
  )
}

/**
 * 并发控制
 */
export async function pLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = []
  const executing: Promise<any>[] = []

  for (const task of tasks) {
    const p = task().then(result => {
      results.push(result)
      return result
    })

    const wrapped = p.then(() => {
      executing.splice(executing.indexOf(wrapped), 1)
    })
    
    executing.push(wrapped)

    if (executing.length >= limit) {
      await Promise.race(executing)
    }
  }

  await Promise.all(executing)
  return results
}

/**
 * 生成唯一 ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 格式化文件大小
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * 格式化时间
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
  if (ms < 3600000) return `${(ms / 60000).toFixed(2)}m`
  return `${(ms / 3600000).toFixed(2)}h`
}

/**
 * 安全地获取对象的键
 */
export function safeKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[]
}

/**
 * 安全地获取对象的值
 */
export function safeValues<T extends object>(obj: T): T[keyof T][] {
  return Object.values(obj) as T[keyof T][]
}

/**
 * 安全地获取对象的键值对
 */
export function safeEntries<T extends object>(
  obj: T
): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][]
}

/**
 * 创建范围数组
 */
export function range(start: number, end?: number, step = 1): number[] {
  if (end === undefined) {
    end = start
    start = 0
  }

  const result: number[] = []
  for (let i = start; i < end; i += step) {
    result.push(i)
  }
  return result
}

/**
 * 数组去重
 */
export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

/**
 * 按属性去重
 */
export function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set()
  return arr.filter(item => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

/**
 * 数组分组
 */
export function groupBy<T>(
  arr: T[],
  key: keyof T | ((item: T) => string | number)
): Record<string, T[]> {
  const result: Record<string, T[]> = {}

  for (const item of arr) {
    const groupKey =
      typeof key === 'function' ? key(item) : String(item[key])
    
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
  }

  return result
}

/**
 * 数组求和
 */
export function sum(arr: number[]): number {
  return arr.reduce((acc, val) => acc + val, 0)
}

/**
 * 数组平均值
 */
export function average(arr: number[]): number {
  return arr.length > 0 ? sum(arr) / arr.length : 0
}

/**
 * 数组最小值
 */
export function min(arr: number[]): number {
  return Math.min(...arr)
}

/**
 * 数组最大值
 */
export function max(arr: number[]): number {
  return Math.max(...arr)
}

/**
 * 随机整数
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 随机选择数组元素
 */
export function randomItem<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)]
}

/**
 * 打乱数组
 */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 分块数组
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

/**
 * 压缩多个数组
 */
export function zip<T>(...arrays: T[][]): T[][] {
  const maxLength = Math.max(...arrays.map(arr => arr.length))
  const result: T[][] = []

  for (let i = 0; i < maxLength; i++) {
    result.push(arrays.map(arr => arr[i]))
  }

  return result
}

/**
 * 解压数组
 */
export function unzip<T>(arr: T[][]): T[][] {
  return zip(...arr)
}

/**
 * 交集
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2)
  return arr1.filter(item => set2.has(item))
}

/**
 * 并集
 */
export function union<T>(arr1: T[], arr2: T[]): T[] {
  return unique([...arr1, ...arr2])
}

/**
 * 差集
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2)
  return arr1.filter(item => !set2.has(item))
}
