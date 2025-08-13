/**
 * @ldesign/router 工具函数
 *
 * 提供路由相关的实用工具函数
 */

import type {
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteParams,
  RouteQuery,
  NavigationFailure,
} from '../types'
import { NavigationFailureType } from '../core/constants'

// ==================== 路径处理工具 ====================

/**
 * 标准化路径
 */
export function normalizePath(path: string): string {
  // 移除多余的斜杠
  path = path.replace(/\/+/g, '/')

  // 确保以斜杠开头
  if (!path.startsWith('/')) {
    path = '/' + path
  }

  // 移除末尾斜杠（除了根路径）
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1)
  }

  return path
}

/**
 * 连接路径
 */
export function joinPaths(...paths: string[]): string {
  return normalizePath(paths.filter(Boolean).join('/'))
}

/**
 * 解析路径参数
 */
export function parsePathParams(pattern: string, path: string): RouteParams {
  const params: RouteParams = {}
  const patternSegments = pattern.split('/')
  const pathSegments = path.split('/')

  for (let i = 0; i < patternSegments.length; i++) {
    const patternSegment = patternSegments[i]
    const pathSegment = pathSegments[i]

    if (patternSegment.startsWith(':')) {
      const paramName = patternSegment.slice(1).replace(/\?$/, '')
      if (pathSegment !== undefined) {
        params[paramName] = decodeURIComponent(pathSegment)
      }
    }
  }

  return params
}

/**
 * 构建路径
 */
export function buildPath(pattern: string, params: RouteParams = {}): string {
  return pattern.replace(/:([^/?]+)(\?)?/g, (match, paramName, optional) => {
    const value = params[paramName]
    if (value === undefined || value === null) {
      if (optional) return ''
      throw new Error(`Missing required parameter: ${paramName}`)
    }
    return encodeURIComponent(String(value))
  })
}

// ==================== 查询参数处理工具 ====================

/**
 * 解析查询字符串
 */
export function parseQuery(search: string): RouteQuery {
  const query: RouteQuery = {}

  if (!search || search === '?') {
    return query
  }

  // 移除开头的 ?
  const queryString = search.startsWith('?') ? search.slice(1) : search

  if (!queryString) {
    return query
  }

  const pairs = queryString.split('&')

  for (const pair of pairs) {
    const [key, value] = pair.split('=').map(decodeURIComponent)

    if (key) {
      if (query[key] === undefined) {
        query[key] = value || ''
      } else {
        // 处理多个相同键的情况
        const existing = query[key]
        if (Array.isArray(existing)) {
          existing.push(value || '')
        } else {
          query[key] = [existing as string, value || '']
        }
      }
    }
  }

  return query
}

/**
 * 序列化查询参数
 */
export function stringifyQuery(query: RouteQuery): string {
  const pairs: string[] = []

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) {
      continue
    }

    const encodedKey = encodeURIComponent(key)

    if (Array.isArray(value)) {
      for (const item of value) {
        pairs.push(`${encodedKey}=${encodeURIComponent(String(item))}`)
      }
    } else {
      pairs.push(`${encodedKey}=${encodeURIComponent(String(value))}`)
    }
  }

  return pairs.length > 0 ? '?' + pairs.join('&') : ''
}

/**
 * 合并查询参数
 */
export function mergeQuery(target: RouteQuery, source: RouteQuery): RouteQuery {
  return { ...target, ...source }
}

// ==================== URL 处理工具 ====================

/**
 * 解析 URL
 */
export function parseURL(url: string): {
  path: string
  query: RouteQuery
  hash: string
} {
  const [pathAndQuery, hash = ''] = url.split('#')
  const [path, search = ''] = pathAndQuery.split('?')

  return {
    path: normalizePath(path),
    query: parseQuery(search),
    hash: hash ? '#' + hash : '',
  }
}

/**
 * 构建 URL
 */
export function stringifyURL(
  path: string,
  query?: RouteQuery,
  hash?: string
): string {
  let url = normalizePath(path)

  if (query && Object.keys(query).length > 0) {
    url += stringifyQuery(query)
  }

  if (hash) {
    url += hash.startsWith('#') ? hash : '#' + hash
  }

  return url
}

// ==================== 路由位置处理工具 ====================

/**
 * 标准化路由参数
 */
export function normalizeParams(params: RouteParams): RouteParams {
  const normalized: RouteParams = {}

  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) {
      normalized[key] = Array.isArray(value) ? value.map(String) : String(value)
    }
  }

  return normalized
}

/**
 * 比较路由位置是否相同
 */
export function isSameRouteLocation(
  a: RouteLocationNormalized,
  b: RouteLocationNormalized
): boolean {
  return (
    a.path === b.path &&
    a.hash === b.hash &&
    JSON.stringify(a.query) === JSON.stringify(b.query) &&
    JSON.stringify(a.params) === JSON.stringify(b.params)
  )
}

/**
 * 解析路由位置
 */
export function resolveRouteLocation(
  raw: RouteLocationRaw,
  currentLocation?: RouteLocationNormalized
): Partial<RouteLocationNormalized> {
  if (typeof raw === 'string') {
    const { path, query, hash } = parseURL(raw)
    return { path, query, hash }
  }

  if ('path' in raw) {
    return {
      path: normalizePath(raw.path),
      query: raw.query || {},
      hash: raw.hash || '',
    }
  }

  if ('name' in raw) {
    return {
      name: raw.name,
      params: normalizeParams(raw.params || {}),
      query: raw.query || {},
      hash: raw.hash || '',
    }
  }

  throw new Error('Invalid route location')
}

// ==================== 导航失败处理工具 ====================

/**
 * 创建导航失败对象
 */
export function createNavigationFailure(
  type: NavigationFailureType,
  from: RouteLocationNormalized,
  to: RouteLocationNormalized,
  message?: string
): NavigationFailure {
  const error = new Error(message || 'Navigation failed') as NavigationFailure
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

// ==================== 路由匹配工具 ====================

/**
 * 检查路径是否匹配模式
 */
export function matchPath(pattern: string, path: string): boolean {
  const patternRegex = pattern
    .replace(/:[^/]+\?/g, '([^/]*)') // 可选参数
    .replace(/:[^/]+/g, '([^/]+)') // 必需参数
    .replace(/\*/g, '(.*)') // 通配符

  const regex = new RegExp(`^${patternRegex}$`)
  return regex.test(path)
}

/**
 * 提取路径参数
 */
export function extractParams(pattern: string, path: string): RouteParams {
  const params: RouteParams = {}
  const paramNames: string[] = []

  // 提取参数名
  pattern.replace(/:([^/]+)(\?)?/g, (match, name) => {
    paramNames.push(name)
    return match
  })

  // 创建匹配正则
  const patternRegex = pattern
    .replace(/:[^/]+\?/g, '([^/]*)')
    .replace(/:[^/]+/g, '([^/]+)')
    .replace(/\*/g, '(.*)')

  const regex = new RegExp(`^${patternRegex}$`)
  const matches = path.match(regex)

  if (matches) {
    paramNames.forEach((name, index) => {
      const value = matches[index + 1]
      if (value !== undefined) {
        params[name] = decodeURIComponent(value)
      }
    })
  }

  return params
}

// ==================== 工具函数组合 ====================

/**
 * 深度克隆路由位置
 */
export function cloneRouteLocation(
  location: RouteLocationNormalized
): RouteLocationNormalized {
  return {
    ...location,
    params: { ...location.params },
    query: { ...location.query },
    meta: { ...location.meta },
    matched: [...location.matched],
  }
}

/**
 * 获取路由层级深度
 */
export function getRouteDepth(route: RouteLocationNormalized): number {
  return route.path.split('/').filter(Boolean).length
}

/**
 * 检查是否为子路由
 */
export function isChildRoute(parent: string, child: string): boolean {
  const parentPath = normalizePath(parent)
  const childPath = normalizePath(child)

  return childPath.startsWith(parentPath + '/') || childPath === parentPath
}

// ==================== 默认导出 ====================

export default {
  // 路径处理
  normalizePath,
  joinPaths,
  parsePathParams,
  buildPath,

  // 查询参数处理
  parseQuery,
  stringifyQuery,
  mergeQuery,

  // URL 处理
  parseURL,
  stringifyURL,

  // 路由位置处理
  normalizeParams,
  isSameRouteLocation,
  resolveRouteLocation,

  // 导航失败处理
  createNavigationFailure,
  isNavigationFailure,

  // 路由匹配
  matchPath,
  extractParams,

  // 工具函数
  cloneRouteLocation,
  getRouteDepth,
  isChildRoute,
}
