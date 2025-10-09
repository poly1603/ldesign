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
 * 路由模式缓存（增强版）
 */
const patternCache = new Map<string, CompiledPattern>()

/**
 * 缓存统计信息
 */
interface CacheStats {
  hits: number
  misses: number
  size: number
  maxSize: number
}

/**
 * 性能监控器
 */
class PerformanceMonitor {
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    maxSize: 1000,
  }

  recordHit(): void {
    this.stats.hits++
  }

  recordMiss(): void {
    this.stats.misses++
  }

  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses
    return total > 0 ? this.stats.hits / total : 0
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  reset(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      size: this.stats.size,
      maxSize: this.stats.maxSize,
    }
  }
}

const performanceMonitor = new PerformanceMonitor()

/**
 * 预编译路由模式（增强版）
 */
export function compilePattern(path: string): CompiledPattern {
  // 检查缓存
  const cached = patternCache.get(path)
  if (cached) {
    performanceMonitor.recordHit()
    return cached
  }

  performanceMonitor.recordMiss()

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
      },
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
  path: string,
): Record<string, string> | null {
  const match = pattern.regex.exec(path)
  if (!match) {
    return null
  }

  const params: Record<string, string> = {}
  for (let i = 0; i < pattern.paramNames.length; i++) {
    const value = match[i + 1]
    const paramName = pattern.paramNames[i]
    if (value !== undefined && paramName !== undefined) {
      params[paramName] = decodeURIComponent(value)
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
  routes: RouteRecordRaw[],
): OptimizedRouteNode {
  const root: OptimizedRouteNode = {
    segment: '',
    isParam: false,
    children: new Map(),
  }

  function addRoute(
    route: RouteRecordRaw,
    node: OptimizedRouteNode = root,
    parentPath = '',
  ) {
    const fullPath = parentPath + route.path
    const segments = fullPath.split('/').filter(Boolean)

    let currentNode = node
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      if (!segment)
        continue

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
      }
      else if (segment === '*') {
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
      }
      else {
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
  path: string,
): { record: RouteRecordNormalized, params: Record<string, string> } | null {
  const segments = path.split('/').filter(Boolean)
  const params: Record<string, string> = {}

  function traverse(
    node: OptimizedRouteNode,
    segmentIndex: number,
  ): RouteRecordNormalized | null {
    // 如果已经遍历完所有段
    if (segmentIndex >= segments.length) {
      return node.record || null
    }

    const segment = segments[segmentIndex]
    if (!segment) {
      return node.record || null
    }

    // 尝试静态匹配
    const staticChild = node.children.get(segment)
    if (staticChild) {
      const result = traverse(staticChild, segmentIndex + 1)
      if (result)
        return result
    }

    // 尝试参数匹配
    for (const [key, child] of node.children) {
      if (child.isParam && key.startsWith(':') && child.paramName) {
        params[child.paramName] = decodeURIComponent(segment)
        const result = traverse(child, segmentIndex + 1)
        if (result)
          return result
        delete params[child.paramName] // 回溯
      }
    }

    // 尝试通配符匹配
    if (node.wildcardChild && node.wildcardChild.paramName) {
      const remainingPath = segments.slice(segmentIndex).join('/')
      params[node.wildcardChild.paramName] = decodeURIComponent(remainingPath)
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
  mostVisitedRoutes: Array<{ path: string, count: number }>
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
    const averageNavigationTime
      = totalNavigations > 0
        ? this.navigationTimes.reduce((sum, time) => sum + time, 0)
        / totalNavigations
        : 0

    const sortedTimes = [...this.navigationTimes].sort((a, b) => a - b)
    const fastestNavigationTime = sortedTimes[0] || 0
    const slowestNavigationTime = sortedTimes[sortedTimes.length - 1] || 0

    const totalCacheRequests = this.cacheHits + this.cacheMisses
    const cacheHitRate
      = totalCacheRequests > 0 ? this.cacheHits / totalCacheRequests : 0

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

// ==================== 新增性能优化工具 ====================

/**
 * 路由预热器 - 预编译常用路由模式
 */
export class RoutePrewarmer {
  private prewarmedRoutes = new Set<string>()

  /**
   * 预热路由列表
   */
  prewarmRoutes(routes: RouteRecordRaw[]): void {
    const startTime = performance.now()

    for (const route of routes) {
      this.prewarmRoute(route)
    }

    const endTime = performance.now()
    console.log(`路由预热完成，耗时: ${endTime - startTime}ms，预热路由数: ${this.prewarmedRoutes.size}`)
  }

  private prewarmRoute(route: RouteRecordRaw): void {
    if (route.path && !this.prewarmedRoutes.has(route.path)) {
      // 预编译路由模式
      compilePattern(route.path)
      this.prewarmedRoutes.add(route.path)
    }

    // 递归处理子路由
    if (route.children) {
      for (const child of route.children) {
        this.prewarmRoute(child)
      }
    }
  }

  /**
   * 获取预热统计信息
   */
  getStats() {
    return {
      prewarmedCount: this.prewarmedRoutes.size,
      cacheHitRate: performanceMonitor.getHitRate(),
      cacheStats: performanceMonitor.getStats(),
    }
  }
}

/**
 * 内存优化器
 */
export class MemoryOptimizer {
  private cleanupInterval: number | null = null
  private readonly maxCacheSize = 1000
  private readonly cleanupThreshold = 0.8

  /**
   * 启动自动内存清理
   */
  startAutoCleanup(intervalMs = 60000): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    this.cleanupInterval = setInterval(() => {
      this.performCleanup()
    }, intervalMs)
  }

  /**
   * 停止自动内存清理
   */
  stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }

  /**
   * 执行内存清理
   */
  performCleanup(): void {
    const currentSize = patternCache.size

    if (currentSize > this.maxCacheSize * this.cleanupThreshold) {
      // 清理最少使用的缓存项
      const entries = Array.from(patternCache.entries())
      const toDelete = Math.floor(currentSize * 0.2) // 删除20%的缓存

      // 这里可以根据访问频率等指标来决定删除哪些缓存
      for (let i = 0; i < toDelete && entries.length > 0; i++) {
        const [key] = entries.pop()!
        patternCache.delete(key)
      }

      console.log(`内存清理完成，删除了 ${toDelete} 个缓存项，当前缓存大小: ${patternCache.size}`)
    }
  }

  /**
   * 获取内存使用情况
   */
  getMemoryUsage() {
    return {
      cacheSize: patternCache.size,
      maxCacheSize: this.maxCacheSize,
      usageRatio: patternCache.size / this.maxCacheSize,
      needsCleanup: patternCache.size > this.maxCacheSize * this.cleanupThreshold,
    }
  }
}

// 导出单例实例
export const routePrewarmer = new RoutePrewarmer()
export const memoryOptimizer = new MemoryOptimizer()

/**
 * 获取性能监控数据
 */
export function getPerformanceStats() {
  return {
    monitor: performanceMonitor.getStats(),
    prewarmer: routePrewarmer.getStats(),
    memory: memoryOptimizer.getMemoryUsage(),
  }
}
