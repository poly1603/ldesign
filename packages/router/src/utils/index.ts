/**
 * @ldesign/router 工具函数
 *
 * 提供路由相关的实用工具函数
 */

import type { NavigationFailureType } from '../core/constants'
import type {
  NavigationFailure,
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteParams,
  RouteQuery,
} from '../types'

// ==================== 路径处理工具 ====================

/**
 * 标准化路径（增强版）
 */
export function normalizePath(path: string): string {
  // 输入验证
  if (typeof path !== 'string') {
    throw new TypeError('路径必须是字符串类型')
  }

  // 处理空字符串
  if (!path || path === '') {
    return '/'
  }

  // 移除多余的斜杠
  path = path.replace(/\/+/g, '/')

  // 确保以斜杠开头
  if (!path.startsWith('/')) {
    path = `/${path}`
  }

  // 移除末尾斜杠（除了根路径）
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1)
  }

  // 处理相对路径符号
  const segments = path.split('/').filter(Boolean)
  const normalizedSegments: string[] = []

  for (const segment of segments) {
    if (segment === '..') {
      // 向上一级目录
      if (normalizedSegments.length > 0) {
        normalizedSegments.pop()
      }
    }
    else if (segment !== '.') {
      // 忽略当前目录符号，添加其他有效段
      normalizedSegments.push(segment)
    }
  }

  return normalizedSegments.length === 0 ? '/' : `/${normalizedSegments.join('/')}`
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

    if (patternSegment && patternSegment.startsWith(':')) {
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
  return pattern.replace(/:([^/?]+)(\?)?/g, (_match, paramName, optional) => {
    const value = params[paramName]
    if (value === undefined || value === null) {
      if (optional)
        return ''
      throw new Error(`Missing required parameter: ${paramName}`)
    }
    return encodeURIComponent(String(value))
  })
}

// ==================== 查询参数处理工具 ====================

/**
 * 解析查询字符串（增强版）
 */
export function parseQuery(search: string): RouteQuery {
  const query: RouteQuery = {}

  // 输入验证
  if (typeof search !== 'string' || !search || search === '?') {
    return query
  }

  // 移除开头的 ?
  const queryString = search.startsWith('?') ? search.slice(1) : search

  if (!queryString) {
    return query
  }

  // 分割查询参数，支持 & 和 ; 分隔符
  const pairs = queryString.split(/[&;]/)

  for (const pair of pairs) {
    if (!pair)
      continue // 跳过空字符串

    try {
      // 分割键值对，只在第一个 = 处分割
      const equalIndex = pair.indexOf('=')
      let key: string
      let value: string

      if (equalIndex === -1) {
        // 没有 = 的情况，整个作为 key，value 为空字符串
        key = decodeURIComponent(pair)
        value = ''
      }
      else {
        key = decodeURIComponent(pair.slice(0, equalIndex))
        value = decodeURIComponent(pair.slice(equalIndex + 1))
      }

      if (key) {
        if (query[key] === undefined) {
          query[key] = value
        }
        else {
          // 处理多个相同键的情况
          const existing = query[key]
          if (Array.isArray(existing)) {
            existing.push(value)
          }
          else {
            query[key] = [existing as string, value]
          }
        }
      }
    }
    catch (error) {
      // 解码失败时跳过该参数
      console.warn(`查询参数解析失败: ${pair}`, error)
      continue
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
    }
    else {
      pairs.push(`${encodedKey}=${encodeURIComponent(String(value))}`)
    }
  }

  return pairs.length > 0 ? `?${pairs.join('&')}` : ''
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
  const pathAndQueryDefined = pathAndQuery || ''
  const [path, search = ''] = pathAndQueryDefined.split('?')

  return {
    path: normalizePath(path || '/'),
    query: parseQuery(search),
    hash: hash ? `#${hash}` : '',
  }
}

/**
 * 构建 URL
 */
export function stringifyURL(
  path: string,
  query?: RouteQuery,
  hash?: string,
): string {
  let url = normalizePath(path)

  if (query && Object.keys(query).length > 0) {
    url += stringifyQuery(query)
  }

  if (hash) {
    url += hash.startsWith('#') ? hash : `#${hash}`
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
  b: RouteLocationNormalized,
): boolean {
  return (
    a.path === b.path
    && a.hash === b.hash
    && JSON.stringify(a.query) === JSON.stringify(b.query)
    && JSON.stringify(a.params) === JSON.stringify(b.params)
  )
}

/**
 * 解析路由位置
 */
export function resolveRouteLocation(
  raw: RouteLocationRaw,
  // currentLocation?: RouteLocationNormalized,
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
  message?: string,
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
  type?: NavigationFailureType,
): error is NavigationFailure {
  return (
    error
    && typeof error === 'object'
    && 'type' in error
    && 'from' in error
    && 'to' in error
    && (type === undefined || error.type === type)
  )
}

// ==================== 路由匹配工具 ====================

/**
 * 检查路径是否匹配模式
 */
export function matchPath(pattern: string, path: string): boolean {
  // 特殊处理可选参数的情况
  if (pattern.includes('?')) {
    // 对于 /user/:id? 这样的模式，需要同时匹配 /user/123 和 /user/
    const basePattern = pattern.replace(/:[^/]+\?/g, '') // 移除可选参数部分
    const fullPattern = pattern.replace(/\?/g, '') // 移除问号，保留参数

    // 检查是否匹配基础模式（不包含可选参数）
    if (matchPathSimple(basePattern, path)) {
      return true
    }

    // 检查是否匹配完整模式（包含可选参数）
    return matchPathSimple(fullPattern, path)
  }

  return matchPathSimple(pattern, path)
}

function matchPathSimple(pattern: string, path: string): boolean {
  const patternRegex = pattern
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

  // 提取参数名和可选标记
  const optionalParams: Set<string> = new Set()
  pattern.replace(/:([^/?]+)(\?)?/g, (match, name, optional) => {
    paramNames.push(name)
    if (optional) {
      optionalParams.add(name)
    }
    return match
  })

  // 创建匹配正则
  let patternRegex = pattern
    .replace(/:[^/]+\?/g, '([^/]*)')
    .replace(/:[^/]+/g, '([^/]+)')
    .replace(/\*/g, '(.*)')

  // 处理可选参数后的尾部斜杠
  if (pattern.includes('?')) {
    patternRegex = patternRegex.replace(/\/\(\[.*?\]\*\)$/, '/?([^/]*)')
  }

  const regex = new RegExp(`^${patternRegex}$`)
  const matches = path.match(regex)

  if (matches) {
    paramNames.forEach((name, index) => {
      const value = matches[index + 1]
      if (value !== undefined && value !== '') {
        params[name] = decodeURIComponent(value)
      }
      else if (optionalParams.has(name)) {
        // 可选参数为空时设为 undefined
        params[name] = undefined as any
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
  location: RouteLocationNormalized,
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

  return childPath.startsWith(`${parentPath}/`) || childPath === parentPath
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

// ==================== 性能优化工具导出 ====================

// 导出增强类型
export type * from '../types/enhanced-types'

export {
  CodeQualityChecker,
  codeQualityChecker,
  IssueSeverity,
  // 代码质量检查
  QualityIssueType,
} from './code-quality'

// 错误管理系统
export {
  addErrorListener,
  type ErrorDetails,
  type ErrorListener,
  errorManager,
  ErrorManager,
  type ErrorManagerConfig,
  type ErrorRecoveryStrategy,
  ErrorSeverity,
  ErrorType,
  getErrorHistory,
  getErrorStatistics,
  handleError
} from './error-manager'

// 日志系统
export { 
  analyticsLogger,
  debugLogger,
  logger,
  Logger,
  type LoggerConfig,
  type LogLevel,
  performanceLogger,
  securityLogger
} from './logger'
