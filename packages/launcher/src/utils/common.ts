/**
 * @fileoverview 通用工具函数
 * @author ViteLauncher Team
 * @since 1.0.0
 */

import type { 
  DeepClone, 
  Debounce, 
  Throttle, 
  Retry, 
  GenerateRandomString 
} from '../types'

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 拷贝后的对象
 */
export const deepClone: DeepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as T
  }

  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }

  return obj
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export const debounce: Debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
) => {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param delay 节流间隔（毫秒）
 * @returns 节流后的函数
 */
export const throttle: Throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
) => {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

/**
 * 重试函数
 * @param func 要重试的异步函数
 * @param maxAttempts 最大重试次数
 * @param delay 重试间隔（毫秒）
 * @returns Promise
 */
export const retry: Retry = async <T>(
  func: () => Promise<T>,
  maxAttempts: number,
  delay = 1000
): Promise<T> => {
  let attempts = 0

  while (attempts < maxAttempts) {
    try {
      return await func()
    } catch (error) {
      attempts++
      
      if (attempts >= maxAttempts) {
        throw error
      }

      // 指数退避策略
      const waitTime = delay * Math.pow(2, attempts - 1)
      await sleep(waitTime)
    }
  }

  throw new Error('Max attempts reached')
}

/**
 * 睡眠函数
 * @param ms 睡眠时间（毫秒）
 * @returns Promise
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 生成随机字符串
 * @param length 字符串长度
 * @param charset 字符集
 * @returns 随机字符串
 */
export const generateRandomString: GenerateRandomString = (
  length: number,
  charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string => {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return result
}

/**
 * 生成UUID v4
 * @returns UUID字符串
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否有效
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证URL格式
 * @param url URL地址
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
 * 验证端口号
 * @param port 端口号
 * @returns 是否有效
 */
export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535
}

/**
 * 转换为驼峰命名
 * @param str 输入字符串
 * @returns 驼峰命名字符串
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase()
    })
    .replace(/\s+/g, '')
}

/**
 * 转换为帕斯卡命名
 * @param str 输入字符串
 * @returns 帕斯卡命名字符串
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
    .replace(/\s+/g, '')
}

/**
 * 转换为短横线命名
 * @param str 输入字符串
 * @returns 短横线命名字符串
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase()
}

/**
 * 转换为下划线命名
 * @param str 输入字符串
 * @returns 下划线命名字符串
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/\s+/g, '_')
    .toLowerCase()
}

/**
 * 首字母大写
 * @param str 输入字符串
 * @returns 首字母大写的字符串
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 截断字符串
 * @param str 输入字符串
 * @param maxLength 最大长度
 * @param suffix 后缀
 * @returns 截断后的字符串
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (str.length <= maxLength) {
    return str
  }
  return str.slice(0, maxLength - suffix.length) + suffix
}

/**
 * 对象深度合并
 * @param target 目标对象
 * @param sources 源对象数组
 * @returns 合并后的对象
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
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
 * @param item 要检查的项
 * @returns 是否为对象
 */
function isObject(item: unknown): item is Record<string, any> {
  return item !== null && typeof item === 'object' && !Array.isArray(item)
}

/**
 * 数组去重
 * @param array 输入数组
 * @returns 去重后的数组
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

/**
 * 数组分块
 * @param array 输入数组
 * @param size 块大小
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
 * 数组扁平化
 * @param array 输入数组
 * @param depth 扁平化深度
 * @returns 扁平化后的数组
 */
export function flatten<T>(array: any[], depth = 1): T[] {
  return depth > 0 
    ? array.reduce((acc, val) => 
        acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val), [])
    : array.slice()
}

/**
 * 计算数组交集
 * @param arrays 输入数组
 * @returns 交集数组
 */
export function intersection<T>(...arrays: T[][]): T[] {
  if (arrays.length === 0) return []
  if (arrays.length === 1) return arrays[0]

  return arrays.reduce((acc, current) => 
    acc.filter(item => current.includes(item))
  )
}

/**
 * 计算数组并集
 * @param arrays 输入数组
 * @returns 并集数组
 */
export function union<T>(...arrays: T[][]): T[] {
  return unique(arrays.flat())
}

/**
 * 计算数组差集
 * @param array1 第一个数组
 * @param array2 第二个数组
 * @returns 差集数组
 */
export function difference<T>(array1: T[], array2: T[]): T[] {
  return array1.filter(item => !array2.includes(item))
}

/**
 * 获取对象的路径值
 * @param obj 对象
 * @param path 路径字符串
 * @param defaultValue 默认值
 * @returns 路径对应的值
 */
export function get<T = any>(
  obj: Record<string, any>, 
  path: string, 
  defaultValue?: T
): T | undefined {
  const keys = path.split('.')
  let result = obj

  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue
    }
    result = result[key]
  }

  return result === undefined ? defaultValue : result
}

/**
 * 设置对象的路径值
 * @param obj 对象
 * @param path 路径字符串
 * @param value 要设置的值
 * @returns 修改后的对象
 */
export function set<T = any>(
  obj: Record<string, any>, 
  path: string, 
  value: T
): Record<string, any> {
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
  return obj
}

/**
 * 函数组合
 * @param functions 函数数组
 * @returns 组合后的函数
 */
export function compose<T>(...functions: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => functions.reduceRight((acc, fn) => fn(acc), arg)
}

/**
 * 函数管道
 * @param functions 函数数组
 * @returns 管道函数
 */
export function pipe<T>(...functions: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => functions.reduce((acc, fn) => fn(acc), arg)
}

/**
 * 记忆化函数
 * @param fn 要记忆化的函数
 * @returns 记忆化后的函数
 */
export function memoize<Args extends any[], Return>(
  fn: (...args: Args) => Return
): (...args: Args) => Return {
  const cache = new Map<string, Return>()

  return (...args: Args): Return => {
    const key = JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}