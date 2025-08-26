/**
 * 引擎工具函数集合
 * 🛠️ 提供开发中常用的工具函数
 */

// 性能优化工具导出
export * from './performance-optimizer'

/**
 * 检查是否为浏览器环境
 * 🌐 判断当前代码是否在浏览器中运行
 *
 * @returns 是否为浏览器环境
 *
 * @example
 * ```typescript
 * if (isBrowser()) {
 *   // 浏览器特定代码
 *   window.addEventListener('resize', handleResize)
 * }
 * ```
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/**
 * 检查是否为开发环境
 * 🔧 判断当前是否为开发环境
 *
 * @returns 是否为开发环境
 *
 * @example
 * ```typescript
 * if (isDev()) {
 *   console.log('开发环境调试信息')
 * }
 * ```
 */
export function isDev(): boolean {
  try {
    // 尝试获取Node.js环境变量
    // eslint-disable-next-line ts/no-require-imports
    const nodeProcess = require('node:process')
    return (
      typeof nodeProcess !== 'undefined'
      && nodeProcess.env?.NODE_ENV === 'development'
    )
  }
  catch {
    // 如果无法获取process，检查其他方式
    if (isBrowser()) {
      // 浏览器环境检查
      return (
        window.location.hostname === 'localhost'
        || window.location.hostname === '127.0.0.1'
        || window.location.hostname.includes('dev')
        || window.location.hostname.includes('staging')
      )
    }
    return false
  }
}

/**
 * 检查是否为生产环境
 * 🏭 判断当前是否为生产环境
 *
 * @returns 是否为生产环境
 *
 * @example
 * ```typescript
 * if (isProd()) {
 *   // 生产环境特定代码
 *   disableDebugFeatures()
 * }
 * ```
 */
export function isProd(): boolean {
  try {
    // eslint-disable-next-line ts/no-require-imports
    const nodeProcess = require('node:process')
    return (
      typeof nodeProcess !== 'undefined'
      && nodeProcess.env?.NODE_ENV === 'production'
    )
  }
  catch {
    if (isBrowser()) {
      return !isDev()
    }
    return false
  }
}

/**
 * 生成唯一ID
 * 🆔 生成基于时间戳和随机数的唯一标识符
 *
 * @param prefix ID前缀，默认为'engine'
 * @returns 唯一ID字符串
 *
 * @example
 * ```typescript
 * const id = generateId('user') // 'user-1703123456789-abc123def'
 * const engineId = generateId() // 'engine-1703123456789-abc123def'
 * ```
 */
export function generateId(prefix = 'id'): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return `${prefix}_${timestamp}_${random}`
}

/**
 * 生成UUID v4
 * 🆔 生成符合RFC 4122标准的UUID v4
 *
 * @returns UUID v4字符串
 *
 * @example
 * ```typescript
 * const uuid = generateUUID() // '550e8400-e29b-41d4-a716-446655440000'
 * ```
 */
export function generateUUID(): string {
  if (isBrowser() && 'crypto' in window && 'randomUUID' in window.crypto) {
    return window.crypto.randomUUID()
  }

  // 降级方案
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 深度合并对象
 * 🔄 递归合并两个对象，支持深层嵌套
 *
 * @param target 目标对象
 * @param source 源对象
 * @returns 合并后的新对象
 *
 * @example
 * ```typescript
 * const merged = deepMerge(
 *   { a: 1, b: { c: 2 } },
 *   { b: { d: 3 }, e: 4 }
 * )
 * // 结果: { a: 1, b: { c: 2, d: 3 }, e: 4 }
 * ```
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T {
  const result = { ...target }

  for (const key in source) {
    if (
      source[key]
      && typeof source[key] === 'object'
      && !Array.isArray(source[key])
      && source[key] !== null
    ) {
      result[key] = deepMerge(
        (result[key] || {}) as Record<string, unknown>,
        source[key] as Record<string, unknown>,
      ) as T[Extract<keyof T, string>]
    }
    else {
      result[key] = source[key] as T[Extract<keyof T, string>]
    }
  }

  return result
}

/**
 * 防抖函数
 * ⏱️ 延迟执行函数，如果在延迟期间再次调用则重新计时
 *
 * @param func 要防抖的函数
 * @param wait 延迟时间（毫秒）
 * @returns 防抖后的函数
 *
 * @example
 * ```typescript
 * const debouncedSearch = debounce(searchAPI, 300)
 *
 * // 用户输入时
 * input.addEventListener('input', debouncedSearch)
 * ```
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | number

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 节流函数
 * 🚦 限制函数执行频率，确保在指定时间内最多执行一次
 *
 * @param func 要节流的函数
 * @param wait 节流时间间隔（毫秒）
 * @returns 节流后的函数
 *
 * @example
 * ```typescript
 * const throttledScroll = throttle(handleScroll, 100)
 *
 * window.addEventListener('scroll', throttledScroll)
 * ```
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let lastTime = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastTime >= wait) {
      lastTime = now
      func(...args)
    }
  }
}

/**
 * 深拷贝对象
 * 📋 创建对象的完全独立副本，包括嵌套对象
 *
 * @param obj 要拷贝的对象
 * @returns 深拷贝后的新对象
 *
 * @example
 * ```typescript
 * const original = { a: 1, b: { c: 2 } }
 * const copied = deepClone(original)
 * copied.b.c = 3 // 不会影响原对象
 * ```
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

  if (typeof obj === 'object') {
    const cloned = {} as Record<string, unknown>
    for (const key in obj) {
      // eslint-disable-next-line no-prototype-builtins
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key as keyof T])
      }
    }
    return cloned as T
  }

  return obj
}

/**
 * 检查是否为对象
 * 🔍 检查值是否为普通对象（非null、非数组）
 *
 * @param value 要检查的值
 * @returns 是否为对象
 *
 * @example
 * ```typescript
 * isObject({}) // true
 * isObject({ a: 1 }) // true
 * isObject([]) // false
 * isObject(null) // false
 * isObject('string') // false
 * ```
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * 检查对象是否为空
 * 🔍 检查对象、数组或字符串是否为空
 *
 * @param value 要检查的值
 * @returns 是否为空
 *
 * @example
 * ```typescript
 * isEmpty({}) // true
 * isEmpty([]) // true
 * isEmpty('') // true
 * isEmpty(null) // true
 * isEmpty(undefined) // true
 * isEmpty({ a: 1 }) // false
 * ```
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
 * 获取对象指定路径的值
 * 🗺️ 通过点分隔的路径获取嵌套对象的属性值
 *
 * @param obj 目标对象
 * @param path 属性路径，如 'user.profile.name'
 * @param defaultValue 默认值
 * @returns 属性值或默认值
 *
 * @example
 * ```typescript
 * const user = { profile: { name: 'John' } }
 * getByPath(user, 'profile.name') // 'John'
 * getByPath(user, 'profile.age', 25) // 25
 * ```
 */
export function getByPath<T = unknown>(
  obj: Record<string, unknown>,
  path: string,
  defaultValue?: T,
): T | undefined {
  const keys = path.split('.')
  let result: unknown = obj

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key]
    }
    else {
      return defaultValue
    }
  }

  return result as T
}

/**
 * 获取嵌套对象的值（别名函数）
 * 🗺️ getByPath的别名，保持向后兼容性
 *
 * @param obj 目标对象
 * @param path 属性路径，如 'user.profile.name'
 * @param defaultValue 默认值
 * @returns 属性值或默认值
 *
 * @example
 * ```typescript
 * const user = { profile: { name: 'John' } }
 * getNestedValue(user, 'profile.name') // 'John'
 * getNestedValue(user, 'profile.age', 25) // 25
 * ```
 */
export const getNestedValue = getByPath

/**
 * 设置对象指定路径的值
 * 🗺️ 通过点分隔的路径设置嵌套对象的属性值
 *
 * @param obj 目标对象
 * @param path 属性路径，如 'user.profile.name'
 * @param value 要设置的值
 * @returns 是否设置成功
 *
 * @example
 * ```typescript
 * const user = { profile: {} }
 * setByPath(user, 'profile.name', 'John')
 * // user.profile.name 现在是 'John'
 * ```
 */
export function setByPath(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): boolean {
  const keys = path.split('.')
  let current: Record<string, unknown> = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  }

  current[keys[keys.length - 1]] = value
  return true
}

/**
 * 设置嵌套对象的值（别名函数）
 * 🗺️ setByPath的别名，保持向后兼容性
 *
 * @param obj 目标对象
 * @param path 属性路径，如 'user.profile.name'
 * @param value 要设置的值
 * @returns 是否设置成功
 *
 * @example
 * ```typescript
 * const user = { profile: {} }
 * setNestedValue(user, 'profile.name', 'John')
 * // user.profile.name 现在是 'John'
 * ```
 */
export const setNestedValue = setByPath

/**
 * 格式化文件大小
 * 📏 将字节数转换为人类可读的文件大小
 *
 * @param bytes 字节数
 * @param decimals 小数位数，默认为2
 * @returns 格式化后的文件大小字符串
 *
 * @example
 * ```typescript
 * formatFileSize(1024) // '1.00 KB'
 * formatFileSize(1024 * 1024) // '1.00 MB'
 * formatFileSize(1024 * 1024 * 1024) // '1.00 GB'
 * ```
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0)
    return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
}

/**
 * 格式化时间
 * ⏰ 将时间戳或Date对象格式化为可读字符串
 *
 * @param time 时间戳或Date对象
 * @param format 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的时间字符串
 *
 * @example
 * ```typescript
 * formatTime(new Date()) // '2024-01-15 14:30:25'
 * formatTime(Date.now(), 'MM/DD/YYYY') // '01/15/2024'
 * ```
 */
export function formatTime(
  time: Date | number,
  format = 'YYYY-MM-DD HH:mm:ss',
): string {
  // 如果传入的是毫秒数且小于一天的毫秒数，则按持续时间处理
  if (typeof time === 'number' && time < 24 * 60 * 60 * 1000) {
    if (time < 1000) {
      return `${time}ms`
    }
    else if (time < 60 * 1000) {
      return `${Math.floor(time / 1000)}s`
    }
    else if (time < 60 * 60 * 1000) {
      const minutes = Math.floor(time / (60 * 1000))
      const seconds = Math.floor((time % (60 * 1000)) / 1000)
      return `${minutes}m ${seconds}s`
    }
    else {
      const hours = Math.floor(time / (60 * 60 * 1000))
      const minutes = Math.floor((time % (60 * 60 * 1000)) / (60 * 1000))
      return `${hours}h ${minutes}m`
    }
  }

  const date = time instanceof Date ? time : new Date(time)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 生成随机字符串
 * 🎲 生成指定长度的随机字符串
 *
 * @param length 字符串长度，默认为8
 * @param charset 字符集，默认为字母数字
 * @returns 随机字符串
 *
 * @example
 * ```typescript
 * randomString() // 'aB3cD4eF'
 * randomString(16, '0123456789') // '1234567890123456'
 * ```
 */
export function randomString(length = 8, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return result
}

/**
 * 检查是否为有效URL
 * 🔗 验证字符串是否为有效的URL格式
 *
 * @param url 要验证的URL字符串
 * @returns 是否为有效URL
 *
 * @example
 * ```typescript
 * isValidURL('https://example.com') // true
 * isValidURL('not-a-url') // false
 * ```
 */
export function isValidURL(url: string): boolean {
  try {
    // eslint-disable-next-line no-new
    new URL(url)
    return true
  }
  catch {
    return false
  }
}

/**
 * 检查是否为有效邮箱
 * 📧 验证字符串是否为有效的邮箱格式
 *
 * @param email 要验证的邮箱字符串
 * @returns 是否为有效邮箱
 *
 * @example
 * ```typescript
 * isValidEmail('user@example.com') // true
 * isValidEmail('invalid-email') // false
 * ```
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 数组去重
 * 🔄 去除数组中的重复元素
 *
 * @param arr 要去重的数组
 * @returns 去重后的新数组
 *
 * @example
 * ```typescript
 * unique([1, 2, 2, 3, 3, 3]) // [1, 2, 3]
 * unique(['a', 'b', 'a', 'c']) // ['a', 'b', 'c']
 * ```
 */
export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

/**
 * 数组分组
 * 📊 根据指定条件对数组进行分组
 *
 * @param arr 要分组的数组
 * @param keyFn 分组键函数
 * @returns 分组后的对象
 *
 * @example
 * ```typescript
 * const items = [
 *   { type: 'fruit', name: 'apple' },
 *   { type: 'fruit', name: 'banana' },
 *   { type: 'vegetable', name: 'carrot' }
 * ]
 * groupBy(items, item => item.type)
 * // { fruit: [...], vegetable: [...] }
 * ```
 */
export function groupBy<T, K extends string | number>(
  arr: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  return arr.reduce((groups, item) => {
    const key = keyFn(item)
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
    return groups
  }, {} as Record<K, T[]>)
}

/**
 * 数组分块
 * 📦 将数组分割成指定大小的块
 *
 * @param arr 要分块的数组
 * @param size 块的大小
 * @returns 分块后的二维数组
 *
 * @example
 * ```typescript
 * chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 * ```
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

/**
 * 安全的JSON解析
 * 🛡️ 安全地解析JSON字符串，避免抛出错误
 *
 * @param json JSON字符串
 * @param defaultValue 解析失败时的默认值
 * @returns 解析结果或默认值
 *
 * @example
 * ```typescript
 * safeJsonParse('{"a": 1}', {}) // { a: 1 }
 * safeJsonParse('invalid json', { default: true }) // { default: true }
 * ```
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T
  }
  catch {
    return defaultValue
  }
}

/**
 * 安全的JSON字符串化
 * 🛡️ 安全地将对象转换为JSON字符串，处理循环引用等异常情况
 *
 * @param obj 要字符串化的对象
 * @param space 缩进空格数
 * @returns JSON字符串
 *
 * @example
 * ```typescript
 * safeJsonStringify({ a: 1 }) // '{"a":1}'
 * safeJsonStringify({ a: 1 }, 2) // '{\n  "a": 1\n}'
 * ```
 */
export function safeJsonStringify(obj: unknown, space?: number): string {
  try {
    return JSON.stringify(obj, null, space)
  }
  catch {
    return '{}'
  }
}

/**
 * 检查是否为函数
 * 🔍 检查值是否为函数类型
 *
 * @param value 要检查的值
 * @returns 是否为函数
 *
 * @example
 * ```typescript
 * isFunction(() => {}) // true
 * isFunction(async () => {}) // true
 * isFunction('not a function') // false
 * ```
 */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function'
}

/**
 * 检查是否为Promise
 * 🔍 检查值是否为Promise类型
 *
 * @param value 要检查的值
 * @returns 是否为Promise
 *
 * @example
 * ```typescript
 * isPromise(Promise.resolve()) // true
 * isPromise({ then: () => {} }) // true
 * isPromise({}) // false
 * ```
 */
export function isPromise(value: unknown): value is Promise<unknown> {
  return Boolean(value && typeof value === 'object' && 'then' in value && typeof (value as any).then === 'function')
}

/**
 * 延迟执行
 * ⏰ 创建一个延迟指定时间的Promise
 *
 * @param ms 延迟时间（毫秒）
 * @returns Promise对象
 *
 * @example
 * ```typescript
 * await delay(1000) // 延迟1秒
 * ```
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 重试函数
 * 🔄 自动重试失败的异步函数
 *
 * @param fn 要重试的函数
 * @param maxAttempts 最大重试次数，默认为3
 * @param delayMs 重试间隔（毫秒），默认为1000
 * @returns Promise对象
 *
 * @example
 * ```typescript
 * const result = await retry(fetchData, 3, 1000)
 * ```
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000,
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    }
    catch (error) {
      lastError = error as Error

      if (attempt === maxAttempts) {
        throw lastError
      }

      if (delayMs > 0) {
        await delay(delayMs)
      }
    }
  }

  // 这里理论上不会执行到，因为最后一次尝试失败会抛出错误
  // 但为了满足TypeScript的类型检查，我们需要处理这种情况
  if (lastError) {
    throw lastError
  }

  throw new Error('Retry failed unexpectedly')
}

/**
 * 工具函数集合
 * 📚 导出所有工具函数
 */
export const utils = {
  isBrowser,
  isDev,
  isProd,
  generateId,
  generateUUID,
  deepMerge,
  debounce,
  throttle,
  deepClone,
  isObject,
  isEmpty,
  getByPath,
  getNestedValue,
  setByPath,
  setNestedValue,
  formatFileSize,
  formatTime,
  randomString,
  isValidURL,
  isValidEmail,
  safeJsonParse,
  safeJsonStringify,
  isFunction,
  isPromise,
  delay,
  retry,
  unique,
  groupBy,
  chunk,
}

export default utils
