import type {
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteMeta,
  RouteParams,
  RouteQuery,
  RouteRecordNormalized,
  RouteRecordRaw,
  RouterOptions,
} from './types'
import { normalizeParams, parseURL, stringifyURL } from './utils'

/**
 * 路由匹配器接口
 */
export interface RouterMatcher {
  addRoute: (record: RouteRecordRaw, parent?: string | symbol) => () => void
  removeRoute: (name: string | symbol) => void
  hasRoute: (name: string | symbol) => boolean
  getRoutes: () => RouteRecordNormalized[]
  resolve: (location: RouteLocationRaw, currentLocation: RouteLocationNormalized) => RouteLocationNormalized
}

/**
 * 创建路由匹配器
 */
export function createRouterMatcher(
  routes: RouteRecordRaw[],
  options: RouterOptions,
): RouterMatcher {
  const matchers: RouteRecordNormalized[] = []
  const matcherMap = new Map<string | symbol, RouteRecordNormalized>()

  // 添加初始路由
  routes.forEach(route => addRoute(route))

  function addRoute(
    record: RouteRecordRaw,
    parent?: string | symbol,
  ): () => void {
    const normalizedRecord = normalizeRouteRecord(record, parent)

    // 添加到匹配器列表
    matchers.push(normalizedRecord)

    // 如果有名称，添加到映射表
    if (normalizedRecord.name) {
      matcherMap.set(normalizedRecord.name, normalizedRecord)
    }

    // 处理别名
    if (record.alias) {
      const aliases = Array.isArray(record.alias) ? record.alias : [record.alias]
      aliases.forEach((alias) => {
        const aliasRecord = { ...record, path: alias }
        const normalizedAlias = normalizeRouteRecord(aliasRecord, parent)
        normalizedAlias.aliasOf = normalizedRecord
        matchers.push(normalizedAlias)
      })
    }

    // 处理子路由
    if (record.children) {
      record.children.forEach((child) => {
        addRoute(child, normalizedRecord.name)
      })
    }

    return () => removeRoute(normalizedRecord.name!)
  }

  function removeRoute(name: string | symbol): void {
    const matcher = matcherMap.get(name)
    if (matcher) {
      matcherMap.delete(name)
      const index = matchers.indexOf(matcher)
      if (index > -1) {
        matchers.splice(index, 1)
      }
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
    currentLocation: RouteLocationNormalized,
  ): RouteLocationNormalized {
    let path: string
    let params: RouteParams = {}
    let query: RouteQuery = {}
    let hash = ''
    let name: string | symbol | undefined

    if (typeof location === 'string') {
      const parsed = parseURL(location)
      path = parsed.path
      query = parsed.query
      hash = parsed.hash
    }
    else {
      name = location.name
      path = location.path || currentLocation.path
      params = location.params || {}
      query = { ...currentLocation.query, ...location.query }
      hash = location.hash || currentLocation.hash
    }

    // 查找匹配的路由
    let matched: RouteRecordNormalized[] = []
    let matcher: RouteRecordNormalized | undefined

    if (name) {
      matcher = matcherMap.get(name)
      if (matcher) {
        matched = [matcher]
        path = buildPath(matcher.path, params)
      }
    }
    else {
      // 按路径匹配
      for (const m of matchers) {
        const match = matchPath(m.path, path)
        if (match) {
          matcher = m
          matched = [m]
          params = { ...params, ...match.params }
          break
        }
      }
    }

    if (!matcher) {
      // 没有找到匹配的路由，返回默认路由
      return {
        name: undefined,
        path,
        params,
        query,
        hash,
        fullPath: stringifyURL({ path, query, hash }),
        matched: [],
        meta: {},
        redirectedFrom: undefined,
      }
    }

    // 构建完整路径
    const fullPath = stringifyURL({ path, query, hash })

    // 合并元信息
    const meta: RouteMeta = {}
    matched.forEach((record) => {
      Object.assign(meta, record.meta)
    })

    return {
      name: matcher.name,
      path,
      params: normalizeParams(params),
      query,
      hash,
      fullPath,
      matched,
      meta,
      redirectedFrom: undefined,
    }
  }

  return {
    addRoute,
    removeRoute,
    hasRoute,
    getRoutes,
    resolve,
  }
}

/**
 * 标准化路由记录
 */
function normalizeRouteRecord(
  record: RouteRecordRaw,
  parent?: string | symbol,
): RouteRecordNormalized {
  const path = normalizePath(record.path, parent)

  return {
    path,
    name: record.name,
    components: record.component
      ? { default: record.component }
      : record.components || null,
    children: [],
    meta: record.meta || {},
    props: normalizeProps(record.props),
    beforeEnter: record.beforeEnter,
    aliasOf: undefined,
    redirect: record.redirect,
  }
}

/**
 * 标准化路径
 */
function normalizePath(path: string, parent?: string | symbol): string {
  if (path.startsWith('/')) {
    return path
  }

  if (!parent) {
    return `/${path}`
  }

  // 这里简化处理，实际应该根据父路由路径拼接
  return path
}

/**
 * 标准化 props
 */
function normalizeProps(props: any): Record<string, any> {
  if (!props)
    return {}
  if (typeof props === 'boolean')
    return { default: props }
  if (typeof props === 'object')
    return props
  return { default: props }
}

/**
 * 匹配路径
 */
function matchPath(pattern: string, path: string): { params: RouteParams } | null {
  // 简化的路径匹配实现
  if (pattern === path) {
    return { params: {} }
  }

  // 处理动态参数
  const patternParts = pattern.split('/')
  const pathParts = path.split('/')

  if (patternParts.length !== pathParts.length) {
    return null
  }

  const params: RouteParams = {}

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i]
    const pathPart = pathParts[i]

    if (patternPart.startsWith(':')) {
      const paramName = patternPart.slice(1)
      params[paramName] = pathPart
    }
    else if (patternPart !== pathPart) {
      return null
    }
  }

  return { params }
}

/**
 * 构建路径
 */
function buildPath(pattern: string, params: RouteParams): string {
  let path = pattern

  Object.keys(params).forEach((key) => {
    const value = params[key]
    if (typeof value === 'string') {
      path = path.replace(`:${key}`, value)
    }
  })

  return path
}
