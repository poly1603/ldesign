/**
 * @ldesign/router 性能优化工具
 *
 * 提供路由性能优化相关的工具函数
 */

import type { RouteRecordNormalized, RouteRecordRaw } from '../types'

// ==================== 路由预编译 ====================

/**
 * 编译后的路由模式
 */
interface CompiledPattern {
  /** 原始路径 */
  path: string
  /** 正则表达式 */
  regex: RegExp
  /** 参数名列表 */
  paramNames: string[]
  /** 是否有可选参数 */
  hasOptionalParams: boolean
  /** 静态部分（用于快速匹配） */
  staticParts: string[]
}

/**
 * 路由模式缓存
 */
const patternCache = new Map<string, CompiledPattern>()

/**
 * 预编译路由模式
 */
export function compilePattern(path: string): CompiledPattern {
  // 检查缓存
  const cached = patternCache.get(path)
  if (cached) {
    return cached
  }

  const paramNames: string[] = []
  const staticParts: string[] = []
  let hasOptionalParams = false

  // 将路径转换为正则表达式
  let regexPattern = path
    .replace(/\//g, '\\/')
    .replace(
      /:([^(/]+)(\([^)]*\))?(\?)?/g,
      (_match, paramName, _constraint, optional) => {
        paramNames.push(paramName)
        if (optional) {
          hasOptionalParams = true
          return `(?:/([^/]+))?`
        }
        return '/([^/]+)'
      }
    )
    .replace(/\*/g, '(.*)')

  // 提取静态部分
  const parts = path.split('/')
  for (const part of parts) {
    if (part && !part.startsWith(':') && part !== '*') {
      staticParts.push(part)
    }
  }

  // 确保完全匹配
  if (!regexPattern.endsWith('$')) {
    regexPattern += '$'
  }
  if (!regexPattern.startsWith('^')) {
    regexPattern = `^${regexPattern}`
  }

  const compiled: CompiledPattern = {
    path,
    regex: new RegExp(regexPattern),
    paramNames,
    hasOptionalParams,
    staticParts,
  }

  // 缓存结果
  patternCache.set(path, compiled)
  return compiled
}

/**
 * 快速匹配检查（基于静态部分）
 */
export function quickMatch(pattern: CompiledPattern, path: string): boolean {
  // 如果没有静态部分，需要完整匹配
  if (pattern.staticParts.length === 0) {
    return pattern.regex.test(path)
  }

  // 检查所有静态部分是否存在
  for (const staticPart of pattern.staticParts) {
    if (!path.includes(staticPart)) {
      return false
    }
  }

  return true
}

/**
 * 提取路径参数
 */
export function extractParams(
  pattern: CompiledPattern,
  path: string
): Record<string, string> | null {
  const match = pattern.regex.exec(path)
  if (!match) {
    return null
  }

  const params: Record<string, string> = {}
  for (let i = 0; i < pattern.paramNames.length; i++) {
    const value = match[i + 1]
    if (value !== undefined) {
      params[pattern.paramNames[i]] = decodeURIComponent(value)
    }
  }

  return params
}

// ==================== 路由树优化 ====================

/**
 * 优化的路由节点
 */
interface OptimizedRouteNode {
  /** 静态路径段 */
  segment: string
  /** 是否是参数段 */
  isParam: boolean
  /** 参数名（如果是参数段） */
  paramName?: string
  /** 子节点 */
  children: Map<string, OptimizedRouteNode>
  /** 路由记录（如果是叶子节点） */
  record?: RouteRecordNormalized
  /** 通配符子节点 */
  wildcardChild?: OptimizedRouteNode
}

/**
 * 构建优化的路由树
 */
export function buildOptimizedRouteTree(
  routes: RouteRecordRaw[]
): OptimizedRouteNode {
  const root: OptimizedRouteNode = {
    segment: '',
    isParam: false,
    children: new Map(),
  }

  function addRoute(
    route: RouteRecordRaw,
    node: OptimizedRouteNode = root,
    parentPath = ''
  ) {
    const fullPath = parentPath + route.path
    const segments = fullPath.split('/').filter(Boolean)

    let currentNode = node
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]

      if (segment.startsWith(':')) {
        // 参数段
        const paramName = segment.slice(1)
        const paramKey = `:${paramName}`

        if (!currentNode.children.has(paramKey)) {
          currentNode.children.set(paramKey, {
            segment: paramKey,
            isParam: true,
            paramName,
            children: new Map(),
          })
        }
        currentNode = currentNode.children.get(paramKey)!
      } else if (segment === '*') {
        // 通配符段
        if (!currentNode.wildcardChild) {
          currentNode.wildcardChild = {
            segment: '*',
            isParam: true,
            paramName: 'pathMatch',
            children: new Map(),
          }
        }
        currentNode = currentNode.wildcardChild
      } else {
        // 静态段
        if (!currentNode.children.has(segment)) {
          currentNode.children.set(segment, {
            segment,
            isParam: false,
            children: new Map(),
          })
        }
        currentNode = currentNode.children.get(segment)!
      }
    }

    // 设置路由记录
    currentNode.record = route as RouteRecordNormalized

    // 递归处理子路由
    if (route.children) {
      for (const child of route.children) {
        addRoute(child, currentNode, fullPath)
      }
    }
  }

  for (const route of routes) {
    addRoute(route)
  }

  return root
}

/**
 * 在优化的路由树中查找匹配
 */
export function findInOptimizedTree(
  tree: OptimizedRouteNode,
  path: string
): { record: RouteRecordNormalized; params: Record<string, string> } | null {
  const segments = path.split('/').filter(Boolean)
  const params: Record<string, string> = {}

  function traverse(
    node: OptimizedRouteNode,
    segmentIndex: number
  ): RouteRecordNormalized | null {
    // 如果已经遍历完所有段
    if (segmentIndex >= segments.length) {
      return node.record || null
    }

    const segment = segments[segmentIndex]

    // 尝试静态匹配
    const staticChild = node.children.get(segment)
    if (staticChild) {
      const result = traverse(staticChild, segmentIndex + 1)
      if (result) return result
    }

    // 尝试参数匹配
    for (const [key, child] of node.children) {
      if (child.isParam && key.startsWith(':')) {
        params[child.paramName!] = decodeURIComponent(segment)
        const result = traverse(child, segmentIndex + 1)
        if (result) return result
        delete params[child.paramName!] // 回溯
      }
    }

    // 尝试通配符匹配
    if (node.wildcardChild) {
      const remainingPath = segments.slice(segmentIndex).join('/')
      params[node.wildcardChild.paramName!] = decodeURIComponent(remainingPath)
      return node.wildcardChild.record || null
    }

    return null
  }

  const record = traverse(tree, 0)
  return record ? { record, params } : null
}

// ==================== 性能监控 ====================

/**
 * 性能计时器
 */
export class PerformanceTimer {
  private startTime: number = 0
  private endTime: number = 0

  start(): void {
    this.startTime = performance.now()
  }

  end(): number {
    this.endTime = performance.now()
    return this.endTime - this.startTime
  }

  get duration(): number {
    return this.endTime - this.startTime
  }
}

/**
 * 路由性能统计
 */
export interface RoutePerformanceStats {
  /** 总导航次数 */
  totalNavigations: number
  /** 平均导航时间 */
  averageNavigationTime: number
  /** 最慢的导航时间 */
  slowestNavigationTime: number
  /** 最快的导航时间 */
  fastestNavigationTime: number
  /** 缓存命中率 */
  cacheHitRate: number
  /** 最常访问的路由 */
  mostVisitedRoutes: Array<{ path: string; count: number }>
}

/**
 * 性能统计收集器
 */
export class PerformanceCollector {
  private navigationTimes: number[] = []
  private routeVisits = new Map<string, number>()
  private cacheHits = 0
  private cacheMisses = 0

  recordNavigation(duration: number, path: string): void {
    this.navigationTimes.push(duration)

    const currentCount = this.routeVisits.get(path) || 0
    this.routeVisits.set(path, currentCount + 1)
  }

  recordCacheHit(): void {
    this.cacheHits++
  }

  recordCacheMiss(): void {
    this.cacheMisses++
  }

  getStats(): RoutePerformanceStats {
    const totalNavigations = this.navigationTimes.length
    const averageNavigationTime =
      totalNavigations > 0
        ? this.navigationTimes.reduce((sum, time) => sum + time, 0) /
          totalNavigations
        : 0

    const sortedTimes = [...this.navigationTimes].sort((a, b) => a - b)
    const fastestNavigationTime = sortedTimes[0] || 0
    const slowestNavigationTime = sortedTimes[sortedTimes.length - 1] || 0

    const totalCacheRequests = this.cacheHits + this.cacheMisses
    const cacheHitRate =
      totalCacheRequests > 0 ? this.cacheHits / totalCacheRequests : 0

    const mostVisitedRoutes = Array.from(this.routeVisits.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }))

    return {
      totalNavigations,
      averageNavigationTime,
      slowestNavigationTime,
      fastestNavigationTime,
      cacheHitRate,
      mostVisitedRoutes,
    }
  }

  reset(): void {
    this.navigationTimes = []
    this.routeVisits.clear()
    this.cacheHits = 0
    this.cacheMisses = 0
  }
}
