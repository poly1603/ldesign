/**
 * @ldesign/router 路由匹配器
 *
 * 基于 Trie 树实现的高效路由匹配算法
 */

import type {
  RouteRecordRaw,
  RouteRecordNormalized,
  RouteLocationRaw,
  RouteLocationNormalized,
  RouteParams,
  RouteMeta,
} from '../types'
import {
  PARAM_RE,
  OPTIONAL_PARAM_RE,
  WILDCARD_RE,
  ROOT_PATH,
} from './constants'

// ==================== 匹配器节点类型 ====================

/**
 * Trie 树节点
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
  /** 参数名称 */
  paramName?: string
  /** 是否可选参数 */
  isOptional?: boolean
}

/**
 * 匹配结果
 */
interface MatchResult {
  /** 匹配的路由记录 */
  record: RouteRecordNormalized
  /** 提取的参数 */
  params: RouteParams
  /** 匹配的路径段 */
  segments: string[]
}

// ==================== 路由匹配器类 ====================

/**
 * 路由匹配器
 */
export class RouteMatcher {
  private root: TrieNode
  private routes: Map<string | symbol, RouteRecordNormalized>

  constructor() {
    this.root = this.createNode()
    this.routes = new Map()
  }

  /**
   * 创建新节点
   */
  private createNode(): TrieNode {
    return {
      children: new Map(),
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
    }

    // 添加到 Trie 树
    this.addToTrie(normalized)

    // 递归添加子路由
    if (record.children) {
      for (const child of record.children) {
        this.addRoute(child, normalized)
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
   * 根据路径匹配路由
   */
  matchByPath(path: string): MatchResult | null {
    const segments = this.parsePathSegments(path)
    return this.matchSegments(this.root, segments, 0, {}, [])
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
    currentLocation?: RouteLocationNormalized
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
        : record.components || null,
      children: [],
      meta: record.meta || {},
      props: this.normalizeProps(record.props),
      beforeEnter: record.beforeEnter,
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
      return '/' + path
    }

    return parentPath.replace(/\/$/, '') + '/' + path
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
   * 添加到 Trie 树
   */
  private addToTrie(record: RouteRecordNormalized): void {
    const segments = this.parsePathSegments(record.path)
    let node = this.root

    for (const segment of segments) {
      node = this.addSegmentToNode(node, segment)
    }

    node.record = record
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

    node.record = undefined
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
    matchedSegments: string[]
  ): MatchResult | null {
    // 匹配完成
    if (index >= segments.length) {
      if (node.record) {
        return {
          record: node.record,
          params: { ...params },
          segments: [...matchedSegments],
        }
      }

      // 检查可选参数
      if (node.paramChild?.isOptional && node.paramChild.record) {
        return {
          record: node.paramChild.record,
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
      const result = this.matchSegments(
        staticChild,
        segments,
        index + 1,
        params,
        [...matchedSegments, segment]
      )
      if (result) return result
    }

    // 尝试参数匹配
    if (node.paramChild) {
      const paramName = node.paramChild.paramName!
      const newParams = { ...params, [paramName]: segment }
      const result = this.matchSegments(
        node.paramChild,
        segments,
        index + 1,
        newParams,
        [...matchedSegments, segment]
      )
      if (result) return result
    }

    // 尝试通配符匹配
    if (node.wildcardChild) {
      const remainingPath = segments.slice(index).join('/')
      const newParams = { ...params, pathMatch: remainingPath }
      return {
        record: node.wildcardChild.record!,
        params: newParams,
        segments: [...matchedSegments, ...segments.slice(index)],
      }
    }

    return null
  }

  /**
   * 根据路径解析
   */
  private resolveByPath(
    path: string,
    query?: any,
    hash?: string
  ): RouteLocationNormalized {
    const match = this.matchByPath(path)

    if (!match) {
      throw new Error(`No match found for path: ${path}`)
    }

    return {
      path,
      name: match.record.name,
      params: match.params,
      query: query || {},
      hash: hash || '',
      fullPath: this.buildFullPath(path, query, hash),
      matched: [match.record],
      meta: match.record.meta,
      redirectedFrom: undefined,
    }
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
      redirectedFrom: undefined,
    }
  }

  /**
   * 从参数构建路径
   */
  private buildPathFromParams(pattern: string, params: RouteParams): string {
    return pattern.replace(PARAM_RE, (match, paramName, optional) => {
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
      fullPath += '?' + queryString
    }

    if (hash) {
      fullPath += '#' + hash.replace(/^#/, '')
    }

    return fullPath
  }
}
