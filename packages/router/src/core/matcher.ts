import type {
  RouteComponent,
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteParams,
  RouteQuery,
  RouteRecordNormalized,
  RouteRecordRaw,
  RouterOptions,
} from '../types'
import { normalizeParams, parseURL, stringifyURL } from '../utils'

/**
 * 路由匹配器接口
 */
export interface RouterMatcher {
  addRoute: (record: RouteRecordRaw, parent?: string | symbol) => () => void
  removeRoute: (name: string | symbol) => void
  hasRoute: (name: string | symbol) => boolean
  getRoutes: () => RouteRecordNormalized[]
  resolve: (
    location: RouteLocationRaw,
    currentLocation: RouteLocationNormalized
  ) => RouteLocationNormalized
}

/**
 * 创建路由匹配器
 */
export function createRouterMatcher(
  routes: RouteRecordRaw[],
  _options: RouterOptions
): RouterMatcher {
  const matchers: RouteRecordNormalized[] = []
  const matcherMap = new Map<string | symbol, RouteRecordNormalized>()

  // 路径匹配缓存
  const resolveCache = new Map<string, RouteLocationNormalized>()

  // 添加初始路由
  routes.forEach(route => addRoute(route))

  function addRoute(
    record: RouteRecordRaw,
    parent?: string | symbol
  ): () => void {
    const normalizedRecord = normalizeRouteRecord(record, parent)

    // 添加到匹配器列表
    matchers.push(normalizedRecord)

    // 添加到名称映射
    if (normalizedRecord.name) {
      matcherMap.set(normalizedRecord.name, normalizedRecord)
    }

    // 清除缓存
    resolveCache.clear()

    // 返回移除函数
    return () => {
      const index = matchers.indexOf(normalizedRecord)
      if (index > -1) {
        matchers.splice(index, 1)
      }
      if (normalizedRecord.name) {
        matcherMap.delete(normalizedRecord.name)
      }
      resolveCache.clear()
    }
  }

  function removeRoute(name: string | symbol): void {
    const matcher = matcherMap.get(name)
    if (matcher) {
      const index = matchers.indexOf(matcher)
      if (index > -1) {
        matchers.splice(index, 1)
      }
      matcherMap.delete(name)
      resolveCache.clear()
    }
  }

  function hasRoute(name: string | symbol): boolean {
    return matcherMap.has(name)
  }

  function getRoutes(): RouteRecordNormalized[] {
    return matchers.slice()
  }

  function resolve(
    location: RouteLocationRaw,
    currentLocation: RouteLocationNormalized
  ): RouteLocationNormalized {
    // 缓存键
    const cacheKey =
      typeof location === 'string' ? location : JSON.stringify(location)

    // 检查缓存
    const cached = resolveCache.get(cacheKey)
    if (cached) {
      return cached
    }

    let path: string
    let name: string | symbol | undefined
    let params: RouteParams = {}
    let query: RouteQuery = {}
    let hash = ''

    if (typeof location === 'string') {
      const parsed = parseURL(location)
      path = parsed.path
      query = parsed.query
      hash = parsed.hash
    } else {
      name = location.name || undefined
      path = location.path || currentLocation.path
      params = location.params || {}
      query = location.query || {}
      hash = location.hash || ''
    }

    // 查找匹配的路由记录
    let matched: RouteRecordNormalized[] = []
    let matcher: RouteRecordNormalized | undefined

    if (name) {
      matcher = matcherMap.get(name)
      if (matcher) {
        // 当通过名称解析时，需要根据参数生成路径
        path = generatePath(matcher.path, params)
      }
    } else {
      matcher = findMatchingRoute(path)
    }

    if (matcher) {
      matched = [matcher]
      // 提取路径参数
      if (matcher.path !== path && !name) {
        params = { ...params, ...extractParams(matcher.path, path) }
      }
    }

    const resolved: RouteLocationNormalized = {
      name: matcher?.name,
      path,
      params: normalizeParams(params),
      query,
      hash,
      fullPath: stringifyURL({ path, query, hash }),
      href: stringifyURL({ path, query, hash }),
      matched,
      meta: matcher?.meta || {},
    }

    // 缓存结果
    resolveCache.set(cacheKey, resolved)

    return resolved
  }

  /**
   * 查找匹配的路由
   */
  function findMatchingRoute(path: string): RouteRecordNormalized | undefined {
    // 首先尝试精确匹配
    for (const matcher of matchers) {
      if (matcher.path === path) {
        return matcher
      }
    }

    // 然后尝试参数匹配
    for (const matcher of matchers) {
      if (matchPath(matcher.path, path)) {
        return matcher
      }
    }

    return undefined
  }

  /**
   * 路径匹配
   */
  function matchPath(pattern: string, path: string): boolean {
    // 简单的路径匹配实现
    const patternParts = pattern.split('/')
    const pathParts = path.split('/')

    if (patternParts.length !== pathParts.length) {
      return false
    }

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i]
      const pathPart = pathParts[i]

      if (patternPart && patternPart.startsWith(':')) {
        // 参数匹配
        continue
      } else if (patternPart !== pathPart) {
        return false
      }
    }

    return true
  }

  /**
   * 提取路径参数
   */
  function extractParams(pattern: string, path: string): RouteParams {
    const params: RouteParams = {}
    const patternParts = pattern.split('/')
    const pathParts = path.split('/')

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i]
      const pathPart = pathParts[i]

      if (patternPart && patternPart.startsWith(':')) {
        const paramName = patternPart.slice(1)
        params[paramName] = pathPart || ''
      }
    }

    return params
  }

  /**
   * 根据参数生成路径
   */
  function generatePath(pattern: string, params: RouteParams): string {
    let path = pattern

    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        path = path.replace(`:${key}`, String(value))
      }
    }

    return path
  }

  /**
   * 规范化路由记录
   */
  function normalizeRouteRecord(
    record: RouteRecordRaw,
    _parent?: string | symbol
  ): RouteRecordNormalized {
    // 处理 components
    let components: Record<string, RouteComponent> | null | undefined
    if (record.component) {
      components = { default: record.component }
    } else if (record.components) {
      components = record.components
    } else {
      components = null
    }

    const normalized: RouteRecordNormalized = {
      path: record.path,
      name: record.name,
      components,
      redirect: record.redirect,
      meta: record.meta || {},
      beforeEnter: Array.isArray(record.beforeEnter)
        ? record.beforeEnter[0]
        : record.beforeEnter,
      children: [],
      aliasOf: undefined,
      props:
        typeof record.props === 'object' &&
        record.props !== null &&
        !Array.isArray(record.props)
          ? (record.props as Record<
              string,
              | boolean
              | Record<string, unknown>
              | ((route: RouteLocationNormalized) => Record<string, unknown>)
            >)
          : {},
    }

    // 处理子路由
    if (record.children) {
      record.children.forEach(child => {
        const childRecord = normalizeRouteRecord(child, record.name)
        normalized.children!.push(childRecord)
      })
    }

    return normalized
  }

  return {
    addRoute,
    removeRoute,
    hasRoute,
    getRoutes,
    resolve,
  }
}
