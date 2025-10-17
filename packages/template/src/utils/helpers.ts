/**
 * 通用工具函数
 */

/**
 * 深拷贝对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any
  }

  if (obj instanceof Set) {
    const clonedSet = new Set()
    obj.forEach(value => {
      clonedSet.add(deepClone(value))
    })
    return clonedSet as any
  }

  if (obj instanceof Map) {
    const clonedMap = new Map()
    obj.forEach((value, key) => {
      clonedMap.set(deepClone(key), deepClone(value))
    })
    return clonedMap as any
  }

  // 处理正则表达式
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as any
  }

  // 处理普通对象
  const clonedObj = {} as any
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key])
    }
  }

  return clonedObj
}

/**
 * 深合并对象
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target

  const source = sources.shift()
  if (!source) return target

  for (const key in source) {
    const sourceValue = source[key]
    const targetValue = target[key]

    if (isObject(sourceValue) && isObject(targetValue)) {
      target[key] = deepMerge(targetValue, sourceValue)
    } else if (Array.isArray(sourceValue)) {
      target[key] = [...sourceValue] as any
    } else if (sourceValue !== undefined) {
      target[key] = sourceValue as any
    }
  }

  return deepMerge(target, ...sources)
}

/**
 * 判断是否为对象
 */
export function isObject(obj: any): obj is Record<string, any> {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj)
}

/**
 * 判断是否为空对象
 */
export function isEmpty(obj: any): boolean {
  if (obj == null) return true
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0
  if (obj instanceof Set || obj instanceof Map) return obj.size === 0
  if (isObject(obj)) return Object.keys(obj).length === 0
  return false
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args)
      timeoutId = null
    }, delay)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  let lastArgs: Parameters<T> | null = null
  let lastThis: any = null

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      
      setTimeout(() => {
        inThrottle = false
        if (lastArgs !== null) {
          fn.apply(lastThis, lastArgs)
          lastArgs = null
          lastThis = null
        }
      }, limit)
    } else {
      lastArgs = args
      lastThis = this
    }
  }
}

/**
 * 生成唯一ID
 */
export function generateId(prefix: string = 'id'): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substr(2, 9)
  return `${prefix}_${timestamp}_${randomStr}`
}

/**
 * 格式化字节大小
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 睡眠函数
 */
export function sleep(ms: number): Promise<void> {
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
    backoff?: number
    onError?: (error: Error, attempt: number) => void
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2,
    onError
  } = options

  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (onError) {
        onError(lastError, attempt)
      }

      if (attempt < maxAttempts) {
        const waitTime = delay * Math.pow(backoff, attempt - 1)
        await sleep(waitTime)
      }
    }
  }

  throw lastError!
}

/**
 * 获取对象路径值
 */
export function get(obj: any, path: string, defaultValue?: any): any {
  const keys = path.split('.')
  let result = obj

  for (const key of keys) {
    result = result?.[key]
    if (result === undefined) {
      return defaultValue
    }
  }

  return result
}

/**
 * 设置对象路径值
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
 * 删除对象路径值
 */
export function unset(obj: any, path: string): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  
  let current = obj
  for (const key of keys) {
    if (!(key in current)) {
      return
    }
    current = current[key]
  }
  
  delete current[lastKey]
}

/**
 * 选择对象的指定字段
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
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
 * 排除对象的指定字段
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
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
 * 将数组转换为对象
 */
export function arrayToObject<T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T> {
  const result: Record<string, T> = {}
  
  for (const item of array) {
    const key = keyFn(item)
    result[key] = item
  }
  
  return result
}

/**
 * 分组数组元素
 */
export function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  const result: Record<string, T[]> = {}
  
  for (const item of array) {
    const key = keyFn(item)
    if (!result[key]) {
      result[key] = []
    }
    result[key].push(item)
  }
  
  return result
}