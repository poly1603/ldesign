/**
 * 通用工具函数
 */

/**
 * 深拷贝对象 - 优化版，避免循环引用，限制深度防止堆栈溢出
 */
export function deepClone<T>(obj: T, cache = new WeakMap(), depth = 0, maxDepth = 100): T {
  // 基本类型直接返回
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // 防止过深的嵌套
  if (depth > maxDepth) {
    console.warn('deepClone: Maximum depth exceeded')
    return obj
  }

  // 检查循环引用
  if (cache.has(obj)) {
    return cache.get(obj)
  }

  let cloned: any

  // 处理特殊对象类型
  if (obj instanceof Date) {
    cloned = new Date(obj.getTime())
  } else if (obj instanceof RegExp) {
    cloned = new RegExp(obj.source, obj.flags)
  } else if (obj instanceof Set) {
    cloned = new Set()
    cache.set(obj, cloned)
    obj.forEach(value => cloned.add(deepClone(value, cache, depth + 1, maxDepth)))
  } else if (obj instanceof Map) {
    cloned = new Map()
    cache.set(obj, cloned)
    obj.forEach((value, key) => cloned.set(deepClone(key, cache, depth + 1, maxDepth), deepClone(value, cache, depth + 1, maxDepth)))
  } else if (Array.isArray(obj)) {
    cloned = []
    cache.set(obj, cloned)
    for (let i = 0; i < obj.length; i++) {
      cloned[i] = deepClone(obj[i], cache, depth + 1, maxDepth)
    }
  } else {
    // 普通对象 - 使用Object.create保持原型链
    cloned = Object.create(Object.getPrototypeOf(obj))
    cache.set(obj, cloned)
    // 优化：使用 Object.keys() 代替 for...in，性能更好且无需 hasOwnProperty 检查
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      cloned[key] = deepClone((obj as any)[key], cache, depth + 1, maxDepth)
    }
  }

  return cloned as T
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
      target[key] = deepMerge(targetValue, sourceValue) as any
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
export function isObject(obj: unknown): obj is Record<string, unknown> {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj)
}

/**
 * 判断是否为空对象
 */
export function isEmpty(obj: unknown): boolean {
  if (obj == null) return true
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0
  if (obj instanceof Set || obj instanceof Map) return obj.size === 0
  if (isObject(obj)) return Object.keys(obj).length === 0
  return false
}

/**
 * 防抖函数 - 增强版，支持取消和立即执行
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  options?: { leading?: boolean; trailing?: boolean }
): (...args: Parameters<T>) => void & { cancel: () => void; flush: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null
  let lastCallTime: number | null = null
  const { leading = false, trailing = true } = options || {}

  const invokeFunc = () => {
if (lastArgs) {
      fn(...lastArgs)
      lastArgs = null
    }
  }

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    lastArgs = null
    lastCallTime = null
  }

  const flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      invokeFunc()
    }
  }

const debounced = function (...args: Parameters<T>) {
    const now = Date.now()
    const isFirstCall = !lastCallTime
    lastCallTime = now
    lastArgs = args

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    if (isFirstCall && leading) {
      invokeFunc()
    } else if (trailing) {
      timeoutId = setTimeout(() => {
        invokeFunc()
        timeoutId = null
        lastCallTime = null
      }, delay)
    }
  }

  debounced.cancel = cancel
  debounced.flush = flush

  return debounced as any
}

/**
 * 节流函数 - 增强版，支持取消
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void & { cancel: () => void } {
  let inThrottle = false
  let lastArgs: Parameters<T> | null = null
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    inThrottle = false
    lastArgs = null
  }

const throttled = function (...args: Parameters<T>) {
    if (!inThrottle) {
fn(...args)
      inThrottle = true
      
      timeoutId = setTimeout(() => {
        inThrottle = false
        timeoutId = null
        if (lastArgs !== null) {
          fn(...lastArgs)
          lastArgs = null
        }
      }, limit)
    } else {
      lastArgs = args
    }
  }
  
  throttled.cancel = cancel
  return throttled as any
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
 * 格式化字节大小 - 优化版，缓存计算结果
 */
const LOG_1024 = Math.log(1024) // 缓存常量计算
const SIZE_UNITS = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] as const

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'
  if (bytes < 0) return 'Invalid size'

  const dm = Math.max(0, decimals)
  const i = Math.min(
    Math.floor(Math.log(bytes) / LOG_1024),
    SIZE_UNITS.length - 1
  )

  return `${Number.parseFloat((bytes / (1024 ** i)).toFixed(dm))  } ${  SIZE_UNITS[i]}`
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

  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (onError) {
        onError(lastError, attempt)
      }

      if (attempt < maxAttempts) {
        const waitTime = delay * backoff**(attempt - 1)
        await sleep(waitTime)
      }
    }
  }

  if (lastError) throw lastError
  throw new Error('Unknown error')
}

/**
 * 获取对象路径值 - 优化版，缓存路径解析
 */
const pathCache = new Map<string, string[]>()
const MAX_PATH_CACHE = 500

export function get<T = unknown>(obj: unknown, path: string, defaultValue?: T): T | undefined {
  if (!obj || typeof obj !== 'object') return defaultValue
  
  // 使用缓存的路径解析结果
  let keys = pathCache.get(path)
  if (!keys) {
    keys = path.split('.')
    // 限制缓存大小
    if (pathCache.size >= MAX_PATH_CACHE) {
      const firstKey = pathCache.keys().next().value
      if (firstKey) {
        pathCache.delete(firstKey)
      }
    }
    pathCache.set(path, keys)
  }
  
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
 * 设置对象路径值 - 优化版，复用路径缓存
 */
export function set(obj: unknown, path: string, value: unknown): void {
  if (!obj || typeof obj !== 'object') return
  
  // 复用get函数的路径缓存
  let keys = pathCache.get(path)
  if (!keys) {
    keys = path.split('.')
    if (pathCache.size >= MAX_PATH_CACHE) {
      const firstKey = pathCache.keys().next().value
      if (firstKey) {
        pathCache.delete(firstKey)
      }
    }
    pathCache.set(path, keys)
  }
  
  if (keys.length === 0) return
  
  const lastKey = keys[keys.length - 1]
  let current = obj
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
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
export function unset(obj: Record<string, unknown>, path: string): void {
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
 * 将数组转换为对象 - 优化版，使用Object.create(null)避免原型污染
 */
export function arrayToObject<T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T> {
  const result: Record<string, T> = Object.create(null)
  
  for (const item of array) {
    const key = keyFn(item)
    result[key] = item
  }
  
  return result
}

/**
 * 分组数组元素 - 优化版，使用Map提升性能
 */
export function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  const map = new Map<string, T[]>()
  
  for (const item of array) {
    const key = keyFn(item)
    const group = map.get(key)
    if (group) {
      group.push(item)
    } else {
      map.set(key, [item])
    }
  }
  
  // 转换为普通对象
  const result: Record<string, T[]> = Object.create(null)
  for (const [key, value] of map) {
    result[key] = value
  }
  
  return result
}
