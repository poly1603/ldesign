import type {
  NavigationFailure,
  NavigationFailureType,
  RouteParams,
  RouteQuery,
} from './types'
// import { NavigationFailureType as FailureType } from './constants'

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
    const queryString = path.slice(queryIndex + 1)
    path = path.slice(0, queryIndex)
    query = parseQuery(queryString)
  }

  return { path, query, hash }
}

/**
 * 序列化 URL
 */
export function stringifyURL({
  path,
  query,
  hash,
}: {
  path: string
  query?: RouteQuery
  hash?: string
}): string {
  let url = path

  const queryString = stringifyQuery(query || {})
  if (queryString) {
    url += `?${queryString}`
  }

  if (hash) {
    url += `#${hash}`
  }

  return url
}

/**
 * 解析查询字符串
 */
export function parseQuery(search: string): RouteQuery {
  const query: RouteQuery = {}

  if (search === '' || search === '?') {
    return query
  }

  const hasLeadingIM = search[0] === '?'
  const searchParams = (hasLeadingIM ? search.slice(1) : search).split('&')

  for (let i = 0; i < searchParams.length; i++) {
    const searchParam = searchParams[i]?.replace(/\+/g, ' ')
    if (!searchParam)
      continue

    const eqPos = searchParam.indexOf('=')
    const key = decode(eqPos < 0 ? searchParam : searchParam.slice(0, eqPos))
    const value = eqPos < 0 ? null : decode(searchParam.slice(eqPos + 1))

    if (key in query) {
      let currentValue = query[key]
      if (!Array.isArray(currentValue)) {
        currentValue = query[key] = [currentValue as string]
      }
      ; (currentValue as string[]).push(value as string)
    }
    else {
      query[key] = value
    }
  }

  return query
}

/**
 * 序列化查询对象
 */
export function stringifyQuery(query: RouteQuery): string {
  let search = ''

  for (let key in query) {
    const value = query[key]
    key = encode(key)

    if (value == null) {
      if (value !== undefined) {
        search += (search.length ? '&' : '') + key
      }
    }
    else if (Array.isArray(value)) {
      value.forEach((v) => {
        search += `${(search.length ? '&' : '') + key}=${encode(v)}`
      })
    }
    else {
      search += `${(search.length ? '&' : '') + key}=${encode(value as string)}`
    }
  }

  return search
}

/**
 * URL 编码
 */
function encode(str: string): string {
  return encodeURIComponent(str)
    .replace(/%2C/g, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/g, '[')
    .replace(/%5D/g, ']')
}

/**
 * URL 解码
 */
function decode(str: string): string {
  try {
    return decodeURIComponent(str)
  }
  catch {
    return str
  }
}

/**
 * 标准化参数
 */
export function normalizeParams(params: RouteParams): RouteParams {
  const normalized: RouteParams = {}

  for (const key in params) {
    const value = params[key]
    if (value != null) {
      normalized[key] = Array.isArray(value) ? value.map(String) : String(value)
    }
  }

  return normalized
}

/**
 * 判断是否为导航失败
 */
export function isNavigationFailure(
  error: any,
  type?: NavigationFailureType,
): error is NavigationFailure {
  return (
    error instanceof Error
    && 'type' in error
    && (type == null || error.type === type)
  )
}

/**
 * 创建导航失败错误
 */
export function createNavigationFailure(
  type: NavigationFailureType,
  from: any,
  to: any,
): NavigationFailure {
  const error = new Error(`Navigation failed: ${type}`) as NavigationFailure
  error.type = type
  error.from = from
  error.to = to
  return error
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
 * 检查两个路由位置是否相同
 */
export function isSameRouteLocation(
  a: { path: string, query?: RouteQuery, hash?: string },
  b: { path: string, query?: RouteQuery, hash?: string },
): boolean {
  if (a.path !== b.path || a.hash !== b.hash) {
    return false
  }

  const aQuery = a.query || {}
  const bQuery = b.query || {}
  const aKeys = Object.keys(aQuery)
  const bKeys = Object.keys(bQuery)

  if (aKeys.length !== bKeys.length) {
    return false
  }

  for (const key of aKeys) {
    if (aQuery[key] !== bQuery[key]) {
      return false
    }
  }

  return true
}

/**
 * 警告函数
 */
export function warn(msg: string): void {
  // eslint-disable-next-line node/prefer-global/process
  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    console.warn(`[LDesign Router warn]: ${msg}`)
  }
}

/**
 * 错误函数
 */
export function throwError(msg: string): never {
  throw new Error(`[LDesign Router error]: ${msg}`)
}

/**
 * 断言函数
 */
export function assert(condition: any, msg: string): asserts condition {
  if (!condition) {
    throwError(msg)
  }
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
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
