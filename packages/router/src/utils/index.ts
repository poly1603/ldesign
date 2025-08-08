import type {
  NavigationFailure,
  NavigationFailureType,
  RouteLocationNormalized,
  RouteParams,
  RouteQuery,
} from '../types'
// import { NavigationFailureType as FailureType } from '../core/constants'

/**
 * 解析 URL
 */
export function parseURL(url: string): {
  path: string
  query: RouteQuery
  hash: string
} {
  const hashIndex = url.indexOf('#')
  const queryIndex = url.indexOf('?')

  let path = url
  let query: RouteQuery = {}
  let hash = ''

  // 提取 hash
  if (hashIndex > -1) {
    hash = url.slice(hashIndex + 1)
    path = url.slice(0, hashIndex)
  }

  // 提取 query
  if (queryIndex > -1) {
    const queryString =
      hashIndex > -1
        ? url.slice(queryIndex + 1, hashIndex)
        : url.slice(queryIndex + 1)

    query = parseQuery(queryString)
    path = url.slice(0, queryIndex)
  }

  return { path, query, hash }
}

/**
 * 解析查询字符串
 */
export function parseQuery(queryString: string): RouteQuery {
  const query: RouteQuery = {}

  if (!queryString) {
    return query
  }

  // 移除开头的 ?
  const cleanQuery = queryString.startsWith('?')
    ? queryString.slice(1)
    : queryString

  if (!cleanQuery) {
    return query
  }

  const pairs = cleanQuery.split('&')

  for (const pair of pairs) {
    const [key, value] = pair.split('=')
    if (key) {
      const decodedKey = decodeURIComponent(key)
      const decodedValue =
        value !== undefined ? (value ? decodeURIComponent(value) : null) : null

      if (query[decodedKey]) {
        // 处理多个相同键的情况
        if (Array.isArray(query[decodedKey])) {
          ;(query[decodedKey] as (string | null)[]).push(decodedValue)
        } else {
          const existingValue = query[decodedKey] as string
          // 创建包含 null 值的数组
          const newArray: (string | null)[] = [existingValue, decodedValue]
          query[decodedKey] = newArray as any
        }
      } else {
        query[decodedKey] = decodedValue
      }
    }
  }

  return query
}

/**
 * 序列化查询对象
 */
export function stringifyQuery(query: RouteQuery): string {
  const pairs: string[] = []

  for (const [key, value] of Object.entries(query)) {
    const encodedKey = encodeURIComponent(key).replace(/%20/g, '+')

    if (Array.isArray(value)) {
      for (const item of value) {
        pairs.push(
          `${encodedKey}=${encodeURIComponent(String(item)).replace(
            /%20/g,
            '+'
          )}`
        )
      }
    } else if (value !== null && value !== undefined) {
      pairs.push(
        `${encodedKey}=${encodeURIComponent(String(value)).replace(
          /%20/g,
          '+'
        )}`
      )
    } else {
      pairs.push(encodedKey)
    }
  }

  return pairs.join('&')
}

/**
 * 序列化 URL
 */
export function stringifyURL(location: {
  path: string
  query?: RouteQuery
  hash?: string
}): string {
  let url = location.path

  if (location.query && Object.keys(location.query).length > 0) {
    const queryString = stringifyQuery(location.query)
    if (queryString) {
      url += `?${queryString}`
    }
  }

  if (location.hash) {
    url += `#${location.hash}`
  }

  return url
}

/**
 * 规范化路由参数
 */
export function normalizeParams(params: RouteParams): RouteParams {
  const normalized: RouteParams = {}

  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        normalized[key] = value
      } else {
        normalized[key] = String(value)
      }
    }
  }

  return normalized
}

/**
 * 比较两个路由位置是否相同
 */
export function isSameRouteLocation(
  a: RouteLocationNormalized,
  b: RouteLocationNormalized
): boolean {
  if (a.path !== b.path) return false
  if (a.hash !== b.hash) return false

  // 比较查询参数
  const aQuery = a.query
  const bQuery = b.query
  const aKeys = Object.keys(aQuery)
  const bKeys = Object.keys(bQuery)

  if (aKeys.length !== bKeys.length) return false

  for (const key of aKeys) {
    if (aQuery[key] !== bQuery[key]) return false
  }

  return true
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

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T
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
 * 合并对象
 */
export function merge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  for (const source of sources) {
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const value = source[key]
        if (value !== undefined) {
          target[key] = value as T[Extract<keyof T, string>]
        }
      }
    }
  }
  return target
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()

    if (now - lastTime >= wait) {
      lastTime = now
      func.apply(this, args)
    }
  }
}

/**
 * 断言函数
 */
export function assert(condition: any, message: string): asserts condition {
  if (!condition) {
    throw new Error(`[LDesign Router error]: ${message}`)
  }
}

/**
 * 警告函数
 */
export function warn(message: string): void {
  console.warn(`[LDesign Router warn]: ${message}`)
}

/**
 * 创建导航失败对象
 */
export function createNavigationFailure(
  type: NavigationFailureType,
  from: RouteLocationNormalized,
  to: RouteLocationNormalized
): NavigationFailure {
  const error = new Error(`Navigation failed: ${type}`) as NavigationFailure
  error.type = type
  error.from = from
  error.to = to
  return error
}

/**
 * 检查是否为导航失败
 */
export function isNavigationFailure(
  error: any,
  type?: NavigationFailureType
): error is NavigationFailure {
  return (
    error &&
    typeof error === 'object' &&
    'type' in error &&
    'from' in error &&
    'to' in error &&
    (type === undefined || error.type === type)
  )
}
