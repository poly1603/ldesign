/**
 * 通用工具函数
 * 提供常用的辅助函数
 */

/**
 * 生成唯一ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 生成UUID
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T
    Object.keys(obj).forEach(key => {
      (cloned as any)[key] = deepClone((obj as any)[key])
    })
    return cloned
  }
  
  return obj
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target
  
  const source = sources.shift()
  if (!source) return target
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMerge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    })
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
 * 检查是否为空值
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (isObject(value)) return Object.keys(value).length === 0
  return false
}

/**
 * 检查是否为函数
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function'
}

/**
 * 检查是否为字符串
 */
export function isString(value: any): value is string {
  return typeof value === 'string'
}

/**
 * 检查是否为数字
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * 检查是否为布尔值
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean'
}

/**
 * 检查是否为数组
 */
export function isArray(value: any): value is any[] {
  return Array.isArray(value)
}

/**
 * 检查是否为Promise
 */
export function isPromise(value: any): value is Promise<any> {
  return value && typeof value.then === 'function'
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
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxAttempts) {
        throw lastError
      }
      
      await delay(delayMs * attempt)
    }
  }
  
  throw lastError!
}

/**
 * 限制并发数量
 */
export function limitConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = []
    let running = 0
    let index = 0
    
    function runNext() {
      if (index >= tasks.length) {
        if (running === 0) {
          resolve(results)
        }
        return
      }
      
      const taskIndex = index++
      const task = tasks[taskIndex]
      running++
      
      task()
        .then(result => {
          results[taskIndex] = result
          running--
          runNext()
        })
        .catch(error => {
          reject(error)
        })
    }
    
    // 启动初始任务
    for (let i = 0; i < Math.min(limit, tasks.length); i++) {
      runNext()
    }
  })
}

/**
 * 数组去重
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

/**
 * 数组分组
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
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
 */
export function flatten<T>(array: (T | T[])[]): T[] {
  return array.reduce<T[]>((flat, item) => {
    return flat.concat(Array.isArray(item) ? flatten(item) : item)
  }, [])
}

/**
 * 获取对象属性值（支持嵌套路径）
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
 * 设置对象属性值（支持嵌套路径）
 */
export function set(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  
  let current = obj
  for (const key of keys) {
    if (!(key in current) || !isObject(current[key])) {
      current[key] = {}
    }
    current = current[key]
  }
  
  current[lastKey] = value
}

/**
 * 删除对象属性（支持嵌套路径）
 */
export function unset(obj: any, path: string): boolean {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  
  let current = obj
  for (const key of keys) {
    if (!(key in current) || !isObject(current[key])) {
      return false
    }
    current = current[key]
  }
  
  if (lastKey in current) {
    delete current[lastKey]
    return true
  }
  
  return false
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
  
  if (step > 0) {
    for (let i = start; i < end; i += step) {
      result.push(i)
    }
  } else if (step < 0) {
    for (let i = start; i > end; i += step) {
      result.push(i)
    }
  }
  
  return result
}

/**
 * 随机选择数组元素
 */
export function sample<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * 随机选择多个数组元素
 */
export function sampleSize<T>(array: T[], size: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(size, array.length))
}

/**
 * 打乱数组
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  
  return result
}

/**
 * 创建缓存函数
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyFn?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()
  
  return ((...args: Parameters<T>) => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }
    
    const result = fn(...args)
    cache.set(key, result)
    
    return result
  }) as T
}

/**
 * 柯里化函数
 */
export function curry<T extends (...args: any[]) => any>(
  fn: T,
  arity = fn.length
): any {
  return function curried(...args: any[]) {
    if (args.length >= arity) {
      return fn(...args)
    }
    
    return (...nextArgs: any[]) => curried(...args, ...nextArgs)
  }
}

/**
 * 管道函数
 */
export function pipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduce((result, fn) => fn(result), arg)
}

/**
 * 组合函数
 */
export function compose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return pipe(...fns.reverse())
}
