/**
 * 表单组件辅助工具函数
 * 
 * 提供表单开发中常用的辅助函数，包括：
 * - 对象操作工具
 * - 数组操作工具
 * - 类型判断工具
 * - 字符串处理工具
 * - 数值处理工具
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

/**
 * 深度克隆对象
 * 
 * @param obj 要克隆的对象
 * @returns 克隆后的对象
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
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  return obj
}

/**
 * 深度合并对象
 * 
 * @param target 目标对象
 * @param sources 源对象数组
 * @returns 合并后的对象
 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
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
 * 获取对象的嵌套属性值
 * 
 * @param obj 对象
 * @param path 属性路径，支持点号分隔和数组索引
 * @param defaultValue 默认值
 * @returns 属性值
 * 
 * @example
 * const obj = { a: { b: { c: 1 } } }
 * getValue(obj, 'a.b.c') // 1
 * getValue(obj, 'a.b.d', 'default') // 'default'
 */
export function getValue(obj: any, path: string, defaultValue?: any): any {
  if (!obj || !path) return defaultValue

  const keys = path.split('.')
  let result = obj

  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue
    }
    result = result[key]
  }

  return result !== undefined ? result : defaultValue
}

/**
 * 通过路径获取对象的值（别名函数，用于框架无关设计）
 *
 * @param obj 对象
 * @param path 路径，支持点号分隔
 * @returns 值
 */
export function getValueByPath(obj: any, path: string): any {
  return getValue(obj, path)
}

/**
 * 设置对象的嵌套属性值
 * 
 * @param obj 对象
 * @param path 属性路径
 * @param value 要设置的值
 * 
 * @example
 * const obj = {}
 * setValue(obj, 'a.b.c', 1) // obj = { a: { b: { c: 1 } } }
 */
export function setValue(obj: any, path: string, value: any): void {
  if (!obj || !path) return

  const keys = path.split('.')
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || !isObject(current[key])) {
      current[key] = {}
    }
    current = current[key]
  }

  current[keys[keys.length - 1]] = value
}

/**
 * 通过路径设置对象的值（别名函数，用于框架无关设计）
 *
 * @param obj 对象
 * @param path 路径，支持点号分隔
 * @param value 值
 */
export function setValueByPath(obj: any, path: string, value: any): void {
  setValue(obj, path, value)
}

/**
 * 删除对象的嵌套属性
 * 
 * @param obj 对象
 * @param path 属性路径
 * 
 * @example
 * const obj = { a: { b: { c: 1 } } }
 * deleteValue(obj, 'a.b.c') // obj = { a: { b: {} } }
 */
export function deleteValue(obj: any, path: string): void {
  if (!obj || !path) return

  const keys = path.split('.')
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || !isObject(current[key])) {
      return
    }
    current = current[key]
  }

  delete current[keys[keys.length - 1]]
}

/**
 * 检查值是否为空
 * 
 * @param value 要检查的值
 * @returns 是否为空
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (isObject(value)) return Object.keys(value).length === 0
  return false
}

/**
 * 检查值是否不为空
 * 
 * @param value 要检查的值
 * @returns 是否不为空
 */
export function isNotEmpty(value: any): boolean {
  return !isEmpty(value)
}

/**
 * 检查是否为对象
 * 
 * @param value 要检查的值
 * @returns 是否为对象
 */
export function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * 检查是否为函数
 * 
 * @param value 要检查的值
 * @returns 是否为函数
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function'
}

/**
 * 检查是否为字符串
 * 
 * @param value 要检查的值
 * @returns 是否为字符串
 */
export function isString(value: any): value is string {
  return typeof value === 'string'
}

/**
 * 检查是否为数字
 * 
 * @param value 要检查的值
 * @returns 是否为数字
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !Number.isNaN(value)
}

/**
 * 检查是否为布尔值
 * 
 * @param value 要检查的值
 * @returns 是否为布尔值
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean'
}

/**
 * 检查是否为数组
 * 
 * @param value 要检查的值
 * @returns 是否为数组
 */
export function isArray(value: any): value is any[] {
  return Array.isArray(value)
}

/**
 * 检查是否为日期
 * 
 * @param value 要检查的值
 * @returns 是否为日期
 */
export function isDate(value: any): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime())
}

/**
 * 检查是否为正则表达式
 * 
 * @param value 要检查的值
 * @returns 是否为正则表达式
 */
export function isRegExp(value: any): value is RegExp {
  return value instanceof RegExp
}

/**
 * 检查是否为Promise
 * 
 * @param value 要检查的值
 * @returns 是否为Promise
 */
export function isPromise(value: any): value is Promise<any> {
  return value && typeof value.then === 'function'
}

/**
 * 防抖函数
 * 
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * 节流函数
 * 
 * @param fn 要节流的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
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
 * 生成唯一ID
 * 
 * @param prefix 前缀
 * @returns 唯一ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 格式化字符串模板
 * 
 * @param template 模板字符串
 * @param data 数据对象
 * @returns 格式化后的字符串
 * 
 * @example
 * formatTemplate('Hello {name}!', { name: 'World' }) // 'Hello World!'
 */
export function formatTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match
  })
}

/**
 * 转换为数组
 * 
 * @param value 要转换的值
 * @returns 数组
 */
export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

/**
 * 移除数组中的重复项
 * 
 * @param array 数组
 * @param keyFn 获取唯一键的函数
 * @returns 去重后的数组
 */
export function unique<T>(array: T[], keyFn?: (item: T) => any): T[] {
  if (!keyFn) {
    return [...new Set(array)]
  }

  const seen = new Set()
  return array.filter(item => {
    const key = keyFn(item)
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

/**
 * 数组分组
 * 
 * @param array 数组
 * @param keyFn 获取分组键的函数
 * @returns 分组后的对象
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
 * 
 * @param ms 延迟时间（毫秒）
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 重试函数
 * 
 * @param fn 要重试的函数
 * @param maxRetries 最大重试次数
 * @param delayMs 重试间隔（毫秒）
 * @returns Promise
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
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
 * 安全的JSON解析
 * 
 * @param str JSON字符串
 * @param defaultValue 默认值
 * @returns 解析结果
 */
export function safeJsonParse<T>(str: string, defaultValue: T): T {
  try {
    return JSON.parse(str)
  } catch {
    return defaultValue
  }
}

/**
 * 安全的JSON序列化
 *
 * @param obj 要序列化的对象
 * @param defaultValue 默认值
 * @returns 序列化结果
 */
export function safeJsonStringify(obj: any, defaultValue = '{}'): string {
  try {
    return JSON.stringify(obj)
  } catch {
    return defaultValue
  }
}

/**
 * 深度比较两个对象是否相等
 *
 * @param a 对象A
 * @param b 对象B
 * @returns 是否相等
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }

  if (a instanceof RegExp && b instanceof RegExp) {
    return a.toString() === b.toString()
  }

  if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) {
    return a === b
  }

  if (a === null || a === undefined || b === null || b === undefined) {
    return false
  }

  if (a.prototype !== b.prototype) return false

  const keys = Object.keys(a)
  if (keys.length !== Object.keys(b).length) {
    return false
  }

  return keys.every(k => deepEqual(a[k], b[k]))
}


