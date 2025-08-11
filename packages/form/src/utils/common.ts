// 通用工具函数

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

  if (Array.isArray(obj)) {
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
 */
export function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * 检查是否为函数
 */
export function isFunction(item: any): item is Function {
  return typeof item === 'function'
}

/**
 * 检查是否为字符串
 */
export function isString(item: any): item is string {
  return typeof item === 'string'
}

/**
 * 检查是否为数字
 */
export function isNumber(item: any): item is number {
  return typeof item === 'number' && !isNaN(item)
}

/**
 * 检查是否为布尔值
 */
export function isBoolean(item: any): item is boolean {
  return typeof item === 'boolean'
}

/**
 * 检查是否为数组
 */
export function isArray(item: any): item is any[] {
  return Array.isArray(item)
}

/**
 * 检查是否为Promise
 */
export function isPromise(item: any): item is Promise<any> {
  return item && typeof item.then === 'function'
}

/**
 * 获取对象的嵌套属性值
 */
export function get(obj: any, path: string, defaultValue?: any): any {
  const keys = path.split('.')
  let result = obj

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue
    }
    result = result[key]
  }

  return result !== undefined ? result : defaultValue
}

/**
 * 设置对象的嵌套属性值
 */
export function set(obj: any, path: string, value: any): void {
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
 * 删除对象的嵌套属性
 */
export function unset(obj: any, path: string): boolean {
  const keys = path.split('.')
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || !isObject(current[key])) {
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
 * 检查对象是否有指定路径的属性
 */
export function has(obj: any, path: string): boolean {
  const keys = path.split('.')
  let current = obj

  for (const key of keys) {
    if (current === null || current === undefined || !(key in current)) {
      return false
    }
    current = current[key]
  }

  return true
}

/**
 * 生成唯一ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 格式化字符串模板
 */
export function template(str: string, data: Record<string, any>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match
  })
}

/**
 * 首字母大写
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 驼峰命名转换
 */
export function camelCase(str: string): string {
  return str.replace(/[-_\s]+(.)?/g, (_, char) =>
    char ? char.toUpperCase() : ''
  )
}

/**
 * 短横线命名转换
 */
export function kebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * 下划线命名转换
 */
export function snakeCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}

/**
 * 去除字符串首尾空格
 */
export function trim(str: string): string {
  return str.trim()
}

/**
 * 数组去重
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

/**
 * 数组分组
 */
export function groupBy<T>(
  arr: T[],
  key: string | ((item: T) => string)
): Record<string, T[]> {
  return arr.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : get(item, key)
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

/**
 * 数组排序
 */
export function sortBy<T>(
  arr: T[],
  key: string | ((item: T) => any),
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...arr].sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : get(a, key)
    const bVal = typeof key === 'function' ? key(b) : get(b, key)

    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * 数组分页
 */
export function paginate<T>(arr: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return arr.slice(start, end)
}

/**
 * 延迟执行
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 重试执行
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
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
 * 超时执行
 */
export function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    }),
  ])
}

/**
 * 并行执行
 */
export async function parallel<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number = 5
): Promise<T[]> {
  const results: T[] = []
  const executing: Promise<void>[] = []

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    const promise = task().then(result => {
      results[i] = result
    })

    executing.push(promise)

    if (executing.length >= concurrency) {
      await Promise.race(executing)
      executing.splice(
        executing.findIndex(p => p === promise),
        1
      )
    }
  }

  await Promise.all(executing)
  return results
}

/**
 * 序列执行
 */
export async function series<T>(tasks: (() => Promise<T>)[]): Promise<T[]> {
  const results: T[] = []

  for (const task of tasks) {
    const result = await task()
    results.push(result)
  }

  return results
}

/**
 * 创建可取消的Promise
 */
export function cancellable<T>(promise: Promise<T>): {
  promise: Promise<T>
  cancel: () => void
} {
  let cancelled = false

  const cancellablePromise = new Promise<T>((resolve, reject) => {
    promise.then(
      value => {
        if (!cancelled) resolve(value)
      },
      error => {
        if (!cancelled) reject(error)
      }
    )
  })

  return {
    promise: cancellablePromise,
    cancel: () => {
      cancelled = true
    },
  }
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

/**
 * 格式化日期
 */
export function formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
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
