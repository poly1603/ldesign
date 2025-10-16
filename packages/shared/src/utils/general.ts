import { isFunction, isObject } from 'lodash-es'

/**
 * 通用工具函数模块
 *
 * @description
 * 提供常用的类型检查、对象操作、数据处理等通用工具函数。
 * 这些函数具有良好的类型安全性和性能表现。
 */

const { hasOwnProperty } = Object.prototype

/**
 * 检查对象是否拥有指定的属性
 *
 * @param val - 要检查的对象
 * @param key - 属性键名
 * @returns 如果对象拥有该属性则返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * const obj = { name: 'John', age: 30 }
 *
 * if (hasOwn(obj, 'name')) {
 *    // TypeScript 知道 name 属性存在
 * }
 * ```
 */
export const hasOwn = <T extends object>(val: T, key: string | symbol | number): key is keyof T =>
  hasOwnProperty.call(val, key)

/**
 * 安全地从对象中获取属性值
 *
 * @param val - 源对象
 * @param key - 属性键名
 * @returns 属性值，如果属性不存在则返回 undefined
 *
 * @example
 * ```typescript
 * const obj = { name: 'John', age: 30 }
 *
 * const name = getPropertyValFromObj(obj, 'name') // string | undefined
 * const invalid = getPropertyValFromObj(obj, 'invalid') // undefined
 * ```
 */
export function getPropertyValFromObj<T extends object>(
  val: T,
  key: string | symbol | number
): T[keyof T] | undefined {
  return hasOwn(val, key) ? val[key] : undefined
}

const objectToString: typeof Object.prototype.toString = Object.prototype.toString
const toTypeString = (value: unknown): string => objectToString.call(value)

/**
 * 检查值是否为纯对象（Plain Object）
 *
 * @param val - 要检查的值
 * @returns 如果是纯对象则返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * isPlainObject({}) // true
 * isPlainObject({ name: 'John' }) // true
 * isPlainObject([]) // false
 * isPlainObject(new Date()) // false
 * isPlainObject(null) // false
 * ```
 */
export const isPlainObject = <T extends object>(val: unknown): val is T =>
  toTypeString(val) === '[object Object]'

/**
 * 检查值是否为 Promise 对象
 *
 * @param val - 要检查的值
 * @returns 如果是 Promise 则返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * isPromise(Promise.resolve()) // true
 * isPromise(fetch('/api/data')) // true
 * isPromise({}) // false
 * isPromise(null) // false
 * ```
 */
export function isPromise<T = any>(val: unknown): val is Promise<T> {
  return (isObject(val) || isFunction(val))
    && isFunction((val as any).then)
    && isFunction((val as any).catch)
}

/**
 * 深度克隆对象
 *
 * @param obj - 要克隆的对象
 * @returns 克隆后的新对象
 *
 * @example
 * ```typescript
 * const original = {
 *   name: 'John',
 *   address: { city: 'New York', country: 'USA' }
 * }
 *
 * const cloned = deepClone(original)
 * cloned.address.city = 'Boston'
 *  // 'New York' (原对象未被修改)
 * ```
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

  if (isPlainObject(obj)) {
    const cloned = {} as T
    for (const key in obj) {
      if (hasOwn(obj, key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  return obj
}

/**
 * 深度合并多个对象
 *
 * @param target - 目标对象
 * @param sources - 源对象数组
 * @returns 合并后的对象
 *
 * @example
 * ```typescript
 * const target = { a: 1, b: { x: 1 } }
 * const source1 = { b: { y: 2 }, c: 3 }
 * const source2 = { d: 4 }
 *
 * const result = deepMerge(target, source1, source2)
 * // { a: 1, b: { x: 1, y: 2 }, c: 3, d: 4 }
 * ```
 */
export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target

  const source = sources.shift()
  if (!source) return target

  if (isPlainObject(target) && isPlainObject(source)) {
    for (const key in source) {
      if (hasOwn(source, key)) {
        const sourceValue = source[key]
        const targetValue = target[key as keyof T]

        if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
          target[key as keyof T] = deepMerge(targetValue, sourceValue) as T[keyof T]
        } else {
          target[key as keyof T] = sourceValue as T[keyof T]
        }
      }
    }
  }

  return deepMerge(target, ...sources)
}

/**
 * 防抖函数
 *
 * @param func - 要防抖的函数
 * @param wait - 等待时间（毫秒）
 * @param immediate - 是否立即执行
 * @returns 防抖后的函数
 *
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   
 * }, 300)
 *
 * // 只有在停止输入 300ms 后才会执行搜索
 * debouncedSearch('hello')
 * debouncedSearch('hello world')
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func(...args)
  }
}

/**
 * 节流函数
 *
 * @param func - 要节流的函数
 * @param limit - 时间间隔（毫秒）
 * @returns 节流后的函数
 *
 * @example
 * ```typescript
 * const throttledScroll = throttle(() => {
 *   
 * }, 100)
 *
 * window.addEventListener('scroll', throttledScroll)
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 生成唯一 ID
 *
 * @param prefix - ID 前缀（可选）
 * @returns 唯一 ID 字符串
 *
 * @example
 * ```typescript
 * generateId() // 'id_1234567890123'
 * generateId('user') // 'user_1234567890123'
 * ```
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * 生成 UUID v4
 *
 * @returns UUID v4 字符串
 *
 * @example
 * ```typescript
 * generateUUID() // 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
 * ```
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 延迟执行函数
 *
 * @param ms - 延迟时间（毫秒）
 * @returns Promise
 *
 * @example
 * ```typescript
 * async function example() {
 *   
 *   await delay(1000)
 *   
 * }
 * ```
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 重试函数
 *
 * @param fn - 要重试的函数
 * @param maxRetries - 最大重试次数
 * @param delayMs - 重试间隔（毫秒）
 * @returns Promise
 *
 * @example
 * ```typescript
 * const fetchData = () => fetch('/api/data').then(res => res.json())
 *
 * const data = await retry(fetchData, 3, 1000)
 * ```
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  delayMs = 1000
): Promise<T> {
  let lastError: Error

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries) {
        await delay(delayMs)
      }
    }
  }

  throw lastError!
}

/**
 * 检查值是否为空
 *
 * @param value - 要检查的值
 * @returns 如果为空则返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * isEmpty(null) // true
 * isEmpty(undefined) // true
 * isEmpty('') // true
 * isEmpty([]) // true
 * isEmpty({}) // true
 * isEmpty('hello') // false
 * isEmpty([1, 2, 3]) // false
 * ```
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.length === 0
  if (Array.isArray(value)) return value.length === 0
  if (isPlainObject(value)) return Object.keys(value).length === 0
  return false
}
