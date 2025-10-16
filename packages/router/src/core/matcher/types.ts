/**
 * 路由匹配器类型定义
 */

import type {
  RouteParams,
  RouteRecordNormalized,
} from '../../types'

/**
 * Trie 树节点
 */
export interface TrieNode {
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
export interface MatchResult {
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
 * 路径预编译结果
 */
export interface CompiledPath {
  /** 编译后的正则表达式 */
  regex: RegExp
  /** 参数名称列表 */
  paramNames: string[]
  /** 是否为静态路径 */
  isStatic: boolean
  /** 路径权重 */
  weight: number
}

/**
 * 匹配器配置
 */
export interface MatcherConfig {
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 缓存容量 */
  cacheCapacity?: number
  /** 是否严格模式 */
  strict?: boolean
  /** 是否大小写敏感 */
  sensitive?: boolean
  /** 最大路径深度 */
  maxDepth?: number
}