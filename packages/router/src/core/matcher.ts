/**
 * @ldesign/router 路由匹配器
 *
 * 基于 Trie 树实现的高效路由匹配算法，支持 LRU 缓存和路径预编译
 */

import type {
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteParams,
  RouteRecordNormalized,
  RouteRecordRaw,
} from '../types'
import { OPTIONAL_PARAM_RE, PARAM_RE } from './constants'

// ==================== 匹配器节点类型 ====================

/**
 * Trie 树节点（优化版）
 */
interface TrieNode {
  /** 静态子节点 */
  children: Map<string, TrieNode>
  /** 参数子节点 */
  paramChild?: TrieNode
  /** 通配符子节点 */
  wildcardChild?: TrieNode
  /** 路由记录 */
  record?: RouteRecordNormalized
  /** 默认子路由记录（用于空路径的子路由） */
  defaultChild?: RouteRecordNormalized
  /** 参数名称 */
  paramName?: string
  /** 是否可选参数 */
  isOptional?: boolean
  /** 节点权重（用于优化匹配顺序） */
  weight?: number
  /** 访问频率（用于缓存优化） */
  accessCount?: number
}

/**
 * 匹配结果
 */
interface MatchResult {
  /** 匹配的路由记录 */
  record: RouteRecordNormalized
  /** 所有匹配的路由记录（包括父路由） */
  matched: RouteRecordNormalized[]
  /** 提取的参数 */
  params: RouteParams
  /** 匹配的路径段 */
  segments: string[]
}

/**
 * LRU 缓存节点
 */
interface LRUNode {
  key: string
  value: MatchResult | null
  prev?: LRUNode
  next?: LRUNode
  timestamp: number
}

/**
 * 路径预编译结果
 */
interface CompiledPath {
  /** 编译后的正则表达式 */
  regex: RegExp
  /** 参数名称列表 */
  paramNames: string[]
  /** 是否为静态路径 */
  isStatic: boolean
  /** 路径权重 */
  weight: number
}

// ==================== LRU 缓存实现 ====================

/**
 * LRU 缓存实现
 */
class LRUCache {
  private capacity: number
  private size: number
  private cache: Map<string, LRUNode>
  private head: LRUNode
  private tail: LRUNode

  constructor(capacity: number = 200) {
    this.capacity = capacity
    this.size = 0
    this.cache = new Map()

    // 创建虚拟头尾节点
    this.head = { key: '', value: null, timestamp: 0 }
    this.tail = { key: '', value: null, timestamp: 0 }
    this.head.next = this.tail
    this.tail.prev = this.head
  }

  get(key: string): MatchResult | null | undefined {
    const node = this.cache.get(key)
    if (!node) return undefined

    // 移动到头部（最近使用）
    this.moveToHead(node)
    node.timestamp = Date.now()
    return node.value
  }

  set(key: string, value: MatchResult | null): void {
    const existingNode = this.cache.get(key)

    if (existingNode) {
      // 更新现有节点
      existingNode.value = value
      existingNode.timestamp = Date.now()
      this.moveToHead(existingNode)
    } else {
      // 创建新节点
      const newNode: LRUNode = {
        key,
        value,
        timestamp: Date.now(),
      }

      if (this.size >= this.capacity) {
        // 移除最少使用的节点
        const tail = this.removeTail()
        if (tail) {
          this.cache.delete(tail.key)
          this.size--
        }
      }

      this.cache.set(key, newNode)
      this.addToHead(newNode)
      this.size++
    }
  }

  clear(): void {
    this.cache.clear()
    this.size = 0
    this.head.next = this.tail
    this.tail.prev = this.head
  }

  private addToHead(node: LRUNode): void {
    node.prev = this.head
    node.next = this.head.next
    if (this.head.next) {
      this.head.next.prev = node
    }
    this.head.next = node
  }

  private removeNode(node: LRUNode): void {
    if (node.prev) {
      node.prev.next = node.next
    }
    if (node.next) {
      node.next.prev = node.prev
    }
  }

  private moveToHead(node: LRUNode): void {
    this.removeNode(node)
    this.addToHead(node)
  }

  private removeTail(): LRUNode | null {
    const lastNode = this.tail.prev
    if (lastNode && lastNode !== this.head) {
      this.removeNode(lastNode)
      return lastNode
    }
    return null
  }

  getStats(): { size: number; capacity: number; hitRate: number } {
    return {
      size: this.size,
      capacity: this.capacity,
      hitRate: 0, // 可以添加命中率统计
    }
  }
}

// ==================== 路由匹配器类 ====================

/**
 * 路由匹配器（优化版）
 */
export class RouteMatcher {
  private root: TrieNode
  private routes: Map<string | symbol, RouteRecordNormalized>
  private rawRoutes: Map<string | symbol, RouteRecordRaw>

  // 性能优化：LRU 缓存
  private lruCache: LRUCache
  private compiledPaths: Map<string, CompiledPath>

  // 性能统计
  private stats = {
    cacheHits: 0,
    cacheMisses: 0,
    totalMatches: 0,
    averageMatchTime: 0,
  }

  constructor(cacheSize: number = 200) {
    this.root = this.createNode()
    this.routes = new Map()
    this.rawRoutes = new Map()
    this.lruCache = new LRUCache(cacheSize)
    this.compiledPaths = new Map()
  }

  /**
   * 创建新节点
   */
  private createNode(): TrieNode {
    return {
      children: new Map(),
      weight: 0,
      accessCount: 0,
    }
  }

  /**
   * 获取缓存键
   */
  private getCacheKey(path: string, query?: Record<string, any>): string {
    const queryStr = query ? JSON.stringify(query) : ''
    return `${path}${queryStr}`
  }

  /**
   * 编译路径为正则表达式（用于快速匹配）
   */
  private compilePath(path: string): CompiledPath {
    const cached = this.compiledPaths.get(path)
    if (cached) return cached

    const paramNames: string[] = []
    let weight = 0
    let isStatic = true

    // 转换路径为正则表达式
    const regexPattern = path
      .split('/')
      .map(segment => {
        if (!segment) return ''

        // 参数段 :param 或 :param?
        if (segment.startsWith(':')) {
          isStatic = false
          const paramName = segment.slice(1).replace(/\?$/, '')
          const isOptional = segment.endsWith('?')
          paramNames.push(paramName)
          weight += isOptional ? 1 : 2
          return isOptional ? '([^/]*)?' : '([^/]+)'
        }

        // 通配符段
        if (segment === '*') {
          isStatic = false
          paramNames.push('pathMatch')
          weight += 0.5
          return '(.*)'
        }

        // 静态段
        weight += 3
        return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      })
      .join('/')

    const regex = new RegExp(`^${regexPattern}$`)

    const compiled: CompiledPath = {
      regex,
      paramNames,
      isStatic,
      weight,
    }

    this.compiledPaths.set(path, compiled)
    return compiled
  }

  /**
   * 获取性能统计
   */
  getStats() {
    return {
      ...this.stats,
      cacheStats: this.lruCache.getStats(),
      compiledPathsCount: this.compiledPaths.size,
      routesCount: this.routes.size,
    }
  }

  /**
   * 清理缓存和统计
   */
  clearCache(): void {
    this.lruCache.clear()
    this.compiledPaths.clear()
    this.stats = {
      cacheHits: 0,
      cacheMisses: 0,
      totalMatches: 0,
      averageMatchTime: 0,
    }
  }

  /**
   * 添加路由记录
   */
  addRoute(
    record: RouteRecordRaw,
    parent?: RouteRecordNormalized
  ): RouteRecordNormalized {
    const normalized = this.normalizeRecord(record, parent)

    // 添加到路由映射
    if (normalized.name) {
      this.routes.set(normalized.name, normalized)
      this.rawRoutes.set(normalized.name, record)
    }

    // 添加到 Trie 树
    this.addToTrie(normalized)

    // 递归添加子路由
    if (record.children) {
      for (const child of record.children) {
        const childRecord = this.normalizeRecord(child, normalized)

        // 检查是否是默认子路由（空路径）
        if (child.path === '') {
          // 将默认子路由添加到父节点
          this.addDefaultChildToTrie(normalized, childRecord)

          // 同时添加到路由映射
          if (childRecord.name) {
            this.routes.set(childRecord.name, childRecord)
            this.rawRoutes.set(childRecord.name, child)
          }
        } else {
          // 正常添加子路由
          this.addRoute(child, normalized)
        }
      }
    }

    return normalized
  }

  /**
   * 移除路由记录
   */
  removeRoute(name: string | symbol): void {
    const record = this.routes.get(name)
    if (record) {
      this.routes.delete(name)
      this.removeFromTrie(record)
    }
  }

  /**
   * 获取所有路由记录
   */
  getRoutes(): RouteRecordNormalized[] {
    return Array.from(this.routes.values())
  }

  /**
   * 检查路由是否存在
   */
  hasRoute(name: string | symbol): boolean {
    return this.routes.has(name)
  }

  /**
   * 根据路径匹配路由（优化版）
   */
  matchByPath(path: string): MatchResult | null {
    const startTime = performance.now()
    this.stats.totalMatches++

    // 首先尝试缓存
    const cacheKey = this.getCacheKey(path)
    const cached = this.lruCache.get(cacheKey)

    if (cached !== undefined) {
      this.stats.cacheHits++
      this.updateAverageMatchTime(performance.now() - startTime)
      return cached
    }

    this.stats.cacheMisses++

    // 尝试快速正则匹配（对于简单路径）
    // 但是跳过可能有嵌套路由的路径，因为快速匹配不支持嵌套路由
    const hasNestedRoutes = this.hasNestedRoutesForPath(path)

    if (!hasNestedRoutes) {
      const fastMatch = this.fastMatch(path)
      if (fastMatch) {
        this.lruCache.set(cacheKey, fastMatch)
        this.updateAverageMatchTime(performance.now() - startTime)
        return fastMatch
      }
    }

    // 回退到 Trie 树匹配
    const segments = this.parsePathSegments(path)
    const result = this.matchSegments(this.root, segments, 0, {}, [], [])

    // 缓存结果
    this.lruCache.set(cacheKey, result)
    this.updateAverageMatchTime(performance.now() - startTime)

    return result
  }

  /**
   * 快速匹配（使用预编译的正则表达式）
   */
  private fastMatch(path: string): MatchResult | null {
    // 按权重排序的路由进行匹配
    const sortedRoutes = Array.from(this.routes.values()).sort((a, b) => {
      const aCompiled = this.compilePath(a.path)
      const bCompiled = this.compilePath(b.path)
      return bCompiled.weight - aCompiled.weight
    })

    for (const route of sortedRoutes) {
      const compiled = this.compilePath(route.path)
      const match = path.match(compiled.regex)

      if (match) {
        const params: RouteParams = {}

        // 提取参数
        for (let i = 0; i < compiled.paramNames.length; i++) {
          const paramName = compiled.paramNames[i]
          const paramValue = match[i + 1]
          if (paramValue !== undefined) {
            params[paramName] = paramValue
          }
        }

        return {
          record: route,
          matched: [route], // 快速匹配只返回单个路由
          params,
          segments: this.parsePathSegments(path),
        }
      }
    }

    return null
  }

  /**
   * 更新平均匹配时间
   */
  private updateAverageMatchTime(time: number): void {
    this.stats.averageMatchTime =
      (this.stats.averageMatchTime * (this.stats.totalMatches - 1) + time) /
      this.stats.totalMatches
  }

  /**
   * 根据名称匹配路由
   */
  matchByName(name: string | symbol): RouteRecordNormalized | null {
    return this.routes.get(name) || null
  }

  /**
   * 解析路由位置
   */
  resolve(
    to: RouteLocationRaw,
    _currentLocation?: RouteLocationNormalized
  ): RouteLocationNormalized {
    if (typeof to === 'string') {
      return this.resolveByPath(to)
    }

    if ('path' in to) {
      return this.resolveByPath(to.path, to.query, to.hash)
    }

    if ('name' in to) {
      return this.resolveByName(to.name, to.params, to.query, to.hash)
    }

    throw new Error('Invalid route location')
  }

  /**
   * 标准化路由记录
   */
  private normalizeRecord(
    record: RouteRecordRaw,
    parent?: RouteRecordNormalized
  ): RouteRecordNormalized {
    const path = this.normalizePath(record.path, parent?.path)

    return {
      path,
      name: record.name,
      components: record.component
        ? { default: record.component }
        : record.components || {},
      children: [],
      meta: record.meta || {},
      props: this.normalizeProps(record.props),
      beforeEnter: Array.isArray(record.beforeEnter)
        ? record.beforeEnter[0]
        : record.beforeEnter,
      aliasOf: undefined,
      redirect: record.redirect,
    }
  }

  /**
   * 标准化路径
   */
  private normalizePath(path: string, parentPath?: string): string {
    if (path.startsWith('/')) {
      return path
    }

    if (!parentPath) {
      return `/${path}`
    }

    // 处理空路径的子路由（默认子路由）
    // 保持空路径，不规范化为父路径，避免覆盖父路由
    if (path === '') {
      return ''
    }

    return `${parentPath.replace(/\/$/, '')}/${path}`
  }

  /**
   * 标准化属性配置
   */
  private normalizeProps(props: any): Record<string, any> {
    if (!props) return {}
    if (typeof props === 'boolean') return { default: props }
    if (typeof props === 'object') return props
    return { default: props }
  }

  /**
   * 添加默认子路由到 Trie 树
   */
  private addDefaultChildToTrie(
    parentRecord: RouteRecordNormalized,
    childRecord: RouteRecordNormalized
  ): void {
    const segments = this.parsePathSegments(parentRecord.path)
    let node = this.root

    for (const segment of segments) {
      node = this.addSegmentToNode(node, segment)
    }

    // 将默认子路由存储在父节点的 defaultChild 属性中
    node.defaultChild = childRecord
  }

  /**
   * 添加到 Trie 树（优化版）
   */
  private addToTrie(record: RouteRecordNormalized): void {
    const segments = this.parsePathSegments(record.path)
    let node = this.root

    // 预编译路径以提高后续匹配性能
    this.compilePath(record.path)

    for (const segment of segments) {
      node = this.addSegmentToNode(node, segment)
      // 更新节点权重
      if (node.weight !== undefined) {
        node.weight++
      }
    }

    node.record = record
  }

  /**
   * 检查路径是否可能有嵌套路由
   */
  private hasNestedRoutesForPath(path: string): boolean {
    // 检查路径是否可能匹配到有子路由的路由记录
    // 需要检查路径的所有可能的父路径

    const segments = this.parsePathSegments(path)

    // 检查每个可能的父路径
    for (let i = 1; i <= segments.length; i++) {
      const parentPath = '/' + segments.slice(0, i).join('/')

      for (const [name, route] of this.rawRoutes.entries()) {
        const normalizedRoute = this.routes.get(name)

        // 如果找到匹配的父路径且有子路由，则认为是嵌套路由
        if (
          normalizedRoute?.path === parentPath &&
          route.children &&
          route.children.length > 0
        ) {
          return true
        }
      }
    }

    return false
  }

  /**
   * 查找默认子路由（空路径的子路由）
   */
  private findDefaultChildRecord(
    parentRecord: RouteRecordNormalized
  ): RouteRecordNormalized | null {
    // 查找对应的原始路由记录
    if (!parentRecord.name || !this.rawRoutes.has(parentRecord.name)) {
      return null
    }

    const rawParentRecord = this.rawRoutes.get(parentRecord.name)!

    if (!rawParentRecord.children) {
      return null
    }

    // 查找空路径的子路由
    for (const child of rawParentRecord.children) {
      if (child.path === '') {
        // 通过名称查找对应的规范化记录
        if (child.name && this.routes.has(child.name)) {
          const foundRecord = this.routes.get(child.name)!
          return foundRecord
        }
      }
    }

    return null
  }

  /**
   * 从 Trie 树移除
   */
  private removeFromTrie(record: RouteRecordNormalized): void {
    // 简化实现：标记为已删除
    const segments = this.parsePathSegments(record.path)
    let node = this.root

    for (const segment of segments) {
      const child = this.findChildNode(node, segment)
      if (!child) return
      node = child
    }

    node.record = undefined as any
  }

  /**
   * 解析路径段
   */
  private parsePathSegments(path: string): string[] {
    return path.split('/').filter(segment => segment !== '')
  }

  /**
   * 添加段到节点
   */
  private addSegmentToNode(node: TrieNode, segment: string): TrieNode {
    // 参数段
    if (segment.startsWith(':')) {
      if (!node.paramChild) {
        node.paramChild = this.createNode()
        node.paramChild.paramName = segment
          .slice(1)
          .replace(OPTIONAL_PARAM_RE, '')
        node.paramChild.isOptional = OPTIONAL_PARAM_RE.test(segment)
      }
      return node.paramChild
    }

    // 通配符段
    if (segment === '*') {
      if (!node.wildcardChild) {
        node.wildcardChild = this.createNode()
      }
      return node.wildcardChild
    }

    // 静态段
    if (!node.children.has(segment)) {
      node.children.set(segment, this.createNode())
    }
    return node.children.get(segment)!
  }

  /**
   * 查找子节点
   */
  private findChildNode(node: TrieNode, segment: string): TrieNode | null {
    // 静态匹配
    if (node.children.has(segment)) {
      return node.children.get(segment)!
    }

    // 参数匹配
    if (node.paramChild) {
      return node.paramChild
    }

    // 通配符匹配
    if (node.wildcardChild) {
      return node.wildcardChild
    }

    return null
  }

  /**
   * 匹配路径段
   */
  private matchSegments(
    node: TrieNode,
    segments: string[],
    index: number,
    params: RouteParams,
    matchedSegments: string[],
    matchedRecords: RouteRecordNormalized[] = []
  ): MatchResult | null {
    // 匹配完成
    if (index >= segments.length) {
      if (node.record) {
        let allMatched = [...matchedRecords, node.record]
        let finalRecord = node.record

        // 检查是否有默认子路由
        if (node.defaultChild) {
          allMatched = [...allMatched, node.defaultChild]
          finalRecord = node.defaultChild
        }

        return {
          record: finalRecord,
          matched: allMatched,
          params: { ...params },
          segments: [...matchedSegments],
        }
      }

      // 检查可选参数
      if (node.paramChild?.isOptional && node.paramChild.record) {
        const allMatched = [...matchedRecords, node.paramChild.record]
        return {
          record: node.paramChild.record,
          matched: allMatched,
          params: { ...params },
          segments: [...matchedSegments],
        }
      }

      return null
    }

    const segment = segments[index]

    // 尝试静态匹配
    const staticChild = node.children.get(segment)
    if (staticChild) {
      // 只有当当前节点不是根节点或者路径是根路径时，才添加到匹配记录
      const isRootPath = segments.length === 0
      const shouldAddRecord =
        node.record && (matchedSegments.length > 0 || isRootPath)
      const newMatchedRecords = shouldAddRecord
        ? [...matchedRecords, node.record!]
        : matchedRecords
      const result = this.matchSegments(
        staticChild,
        segments,
        index + 1,
        params,
        [...matchedSegments, segment],
        newMatchedRecords
      )
      if (result) return result
    }

    // 尝试参数匹配
    if (node.paramChild) {
      const paramName = node.paramChild.paramName!
      const newParams = { ...params, [paramName]: segment }
      // 只有当当前节点不是根节点或者路径是根路径时，才添加到匹配记录
      const isRootPath = segments.length === 0
      const shouldAddRecord =
        node.record && (matchedSegments.length > 0 || isRootPath)
      const newMatchedRecords = shouldAddRecord
        ? [...matchedRecords, node.record!]
        : matchedRecords
      const result = this.matchSegments(
        node.paramChild,
        segments,
        index + 1,
        newParams,
        [...matchedSegments, segment],
        newMatchedRecords
      )
      if (result) return result
    }

    // 尝试通配符匹配
    if (node.wildcardChild) {
      const remainingPath = segments.slice(index).join('/')
      const newParams = { ...params, pathMatch: remainingPath }
      // 只有当当前节点不是根节点或者路径是根路径时，才添加到匹配记录
      const isRootPath = segments.length === 0
      const shouldAddRecord =
        node.record && (matchedSegments.length > 0 || isRootPath)
      const newMatchedRecords = shouldAddRecord
        ? [...matchedRecords, node.record!]
        : matchedRecords
      const allMatched = [...newMatchedRecords, node.wildcardChild.record!]
      return {
        record: node.wildcardChild.record!,
        matched: allMatched,
        params: newParams,
        segments: [...matchedSegments, ...segments.slice(index)],
      }
    }

    return null
  }

  /**
   * 根据路径解析（优化版）
   */
  private resolveByPath(
    path: string,
    query?: any,
    hash?: string
  ): RouteLocationNormalized {
    // 使用优化后的匹配方法
    const match = this.matchByPath(path)

    if (!match) {
      throw new Error(`No match found for path: ${path}`)
    }

    // 解析 URL 以分离路径、查询参数和哈希
    let cleanPath = path
    let urlQuery: Record<string, string> = {}
    let urlHash = ''

    try {
      const url = new URL(path, 'http://localhost')
      cleanPath = url.pathname
      urlHash = url.hash

      // 安全地处理 URLSearchParams
      if (url.searchParams && typeof url.searchParams.entries === 'function') {
        urlQuery = Object.fromEntries(url.searchParams.entries())
      } else {
        // 手动解析查询参数
        const searchString = url.search.slice(1)
        if (searchString) {
          const pairs = searchString.split('&')
          for (const pair of pairs) {
            const [key, value] = pair.split('=').map(decodeURIComponent)
            if (key) {
              urlQuery[key] = value || ''
            }
          }
        }
      }
    } catch {
      // 如果 URL 解析失败，手动解析
      const [pathPart, ...rest] = path.split('?')
      cleanPath = pathPart

      if (rest.length > 0) {
        const queryAndHash = rest.join('?')
        const [queryPart, hashPart] = queryAndHash.split('#')

        if (queryPart) {
          const pairs = queryPart.split('&')
          for (const pair of pairs) {
            const [key, value] = pair.split('=').map(decodeURIComponent)
            if (key) {
              urlQuery[key] = value || ''
            }
          }
        }

        if (hashPart) {
          urlHash = `#${hashPart}`
        }
      }
    }

    return {
      path: cleanPath,
      name: match.record.name,
      params: match.params,
      query: { ...urlQuery, ...(query || {}) },
      hash: urlHash || hash || '',
      fullPath: this.buildFullPath(
        cleanPath,
        { ...urlQuery, ...(query || {}) },
        urlHash || hash
      ),
      matched: match.matched,
      meta: match.record.meta,
    } as RouteLocationNormalized
  }

  /**
   * 根据名称解析
   */
  private resolveByName(
    name: string | symbol,
    params?: any,
    query?: any,
    hash?: string
  ): RouteLocationNormalized {
    const record = this.matchByName(name)

    if (!record) {
      throw new Error(`No route found with name: ${String(name)}`)
    }

    const path = this.buildPathFromParams(record.path, params || {})

    return {
      path,
      name: record.name,
      params: params || {},
      query: query || {},
      hash: hash || '',
      fullPath: this.buildFullPath(path, query, hash),
      matched: [record],
      meta: record.meta,
    } as RouteLocationNormalized
  }

  /**
   * 从参数构建路径
   */
  private buildPathFromParams(pattern: string, params: RouteParams): string {
    return pattern.replace(PARAM_RE, (_match, paramName, optional) => {
      const value = params[paramName]
      if (value === undefined || value === null) {
        if (optional) return ''
        throw new Error(`Missing required parameter: ${paramName}`)
      }
      return String(value)
    })
  }

  /**
   * 构建完整路径
   */
  private buildFullPath(path: string, query?: any, hash?: string): string {
    let fullPath = path

    if (query && Object.keys(query).length > 0) {
      const queryString = new URLSearchParams(query).toString()
      fullPath += `?${queryString}`
    }

    if (hash) {
      fullPath += `#${hash.replace(/^#/, '')}`
    }

    return fullPath
  }
}
