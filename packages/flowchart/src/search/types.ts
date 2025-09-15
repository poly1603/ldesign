/**
 * 高级搜索功能类型定义
 */

import type { FlowchartNode, FlowchartEdge, FlowchartData } from '../types'

/**
 * 搜索查询接口
 */
export interface SearchQuery {
  /** 搜索文本 */
  text?: string
  /** 节点类型过滤 */
  nodeTypes?: string[]
  /** 边类型过滤 */
  edgeTypes?: string[]
  /** 属性搜索 */
  properties?: Record<string, any>
  /** 标签搜索 */
  tags?: string[]
  /** 创建时间范围 */
  dateRange?: {
    start: Date
    end: Date
  }
  /** 创建者过滤 */
  author?: string
  /** 是否区分大小写 */
  caseSensitive?: boolean
  /** 是否使用正则表达式 */
  useRegex?: boolean
  /** 搜索范围 */
  scope?: SearchScope
}

/**
 * 搜索范围
 */
export interface SearchScope {
  /** 是否搜索节点 */
  includeNodes?: boolean
  /** 是否搜索边 */
  includeEdges?: boolean
  /** 是否搜索节点文本 */
  includeNodeText?: boolean
  /** 是否搜索边文本 */
  includeEdgeText?: boolean
  /** 是否搜索属性 */
  includeProperties?: boolean
  /** 是否搜索注释 */
  includeComments?: boolean
}

/**
 * 搜索结果
 */
export interface SearchResult {
  /** 结果ID */
  id: string
  /** 元素类型 */
  type: 'node' | 'edge'
  /** 元素数据 */
  element: FlowchartNode | FlowchartEdge
  /** 匹配分数 (0-1) */
  score: number
  /** 匹配的字段 */
  matchedFields: string[]
  /** 高亮信息 */
  highlights: SearchHighlight[]
  /** 上下文信息 */
  context?: string
  /** 匹配原因 */
  reason: string
}

/**
 * 搜索高亮
 */
export interface SearchHighlight {
  /** 字段名 */
  field: string
  /** 原始文本 */
  originalText: string
  /** 高亮文本 */
  highlightedText: string
  /** 匹配位置 */
  positions: Array<{
    start: number
    end: number
  }>
}

/**
 * 搜索过滤器
 */
export interface SearchFilter {
  /** 过滤器名称 */
  name: string
  /** 过滤器类型 */
  type: 'text' | 'select' | 'multiselect' | 'date' | 'number' | 'boolean'
  /** 过滤器标签 */
  label: string
  /** 过滤器值 */
  value: any
  /** 选项（用于select类型） */
  options?: Array<{
    label: string
    value: any
  }>
  /** 是否启用 */
  enabled: boolean
}

/**
 * 搜索排序
 */
export interface SearchSorting {
  /** 排序字段 */
  field: 'score' | 'name' | 'type' | 'createdAt' | 'updatedAt'
  /** 排序方向 */
  direction: 'asc' | 'desc'
}

/**
 * 搜索分页
 */
export interface SearchPagination {
  /** 页码（从0开始） */
  page: number
  /** 每页大小 */
  pageSize: number
  /** 总数量 */
  total?: number
}

/**
 * 搜索条件
 */
export interface SearchCriteria {
  /** 查询条件 */
  query: SearchQuery
  /** 过滤器 */
  filters: SearchFilter[]
  /** 排序 */
  sorting: SearchSorting
  /** 分页 */
  pagination: SearchPagination
}

/**
 * 搜索结果集
 */
export interface SearchResultSet {
  /** 搜索结果 */
  results: SearchResult[]
  /** 总数量 */
  total: number
  /** 搜索耗时（毫秒） */
  duration: number
  /** 搜索查询 */
  query: SearchQuery
  /** 分页信息 */
  pagination: SearchPagination
  /** 聚合信息 */
  aggregations?: SearchAggregations
}

/**
 * 搜索聚合
 */
export interface SearchAggregations {
  /** 按类型聚合 */
  byType: Record<string, number>
  /** 按标签聚合 */
  byTags: Record<string, number>
  /** 按创建者聚合 */
  byAuthor: Record<string, number>
  /** 按日期聚合 */
  byDate: Record<string, number>
}

/**
 * 搜索索引项
 */
export interface SearchIndexItem {
  /** 元素ID */
  id: string
  /** 元素类型 */
  type: 'node' | 'edge'
  /** 索引文本 */
  text: string
  /** 可搜索字段 */
  fields: Record<string, any>
  /** 标签 */
  tags: string[]
  /** 创建时间 */
  createdAt: number
  /** 更新时间 */
  updatedAt: number
  /** 创建者 */
  author?: string
}

/**
 * 搜索配置
 */
export interface SearchConfig {
  /** 是否启用全文搜索 */
  enableFullTextSearch: boolean
  /** 是否启用属性搜索 */
  enablePropertySearch: boolean
  /** 是否启用标签搜索 */
  enableTagSearch: boolean
  /** 索引策略 */
  indexingStrategy: 'realtime' | 'batch' | 'manual'
  /** 搜索结果最大数量 */
  maxResults: number
  /** 搜索超时时间（毫秒） */
  searchTimeout: number
  /** 是否启用搜索历史 */
  enableSearchHistory: boolean
  /** 搜索历史最大数量 */
  maxSearchHistory: number
  /** 是否启用搜索建议 */
  enableSearchSuggestions: boolean
  /** 最小搜索长度 */
  minSearchLength: number
}

/**
 * 搜索历史项
 */
export interface SearchHistoryItem {
  /** 历史ID */
  id: string
  /** 搜索查询 */
  query: SearchQuery
  /** 搜索时间 */
  timestamp: number
  /** 结果数量 */
  resultCount: number
  /** 搜索耗时 */
  duration: number
}

/**
 * 搜索建议
 */
export interface SearchSuggestion {
  /** 建议文本 */
  text: string
  /** 建议类型 */
  type: 'query' | 'filter' | 'field'
  /** 匹配分数 */
  score: number
  /** 建议来源 */
  source: 'history' | 'index' | 'template'
}

/**
 * 搜索引擎接口
 */
export interface SearchEngine {
  /** 执行搜索 */
  search(criteria: SearchCriteria): Promise<SearchResultSet>
  
  /** 全文搜索 */
  fullTextSearch(text: string, options?: Partial<SearchQuery>): Promise<SearchResult[]>
  
  /** 按类型搜索 */
  searchByType(type: string, options?: Partial<SearchQuery>): Promise<SearchResult[]>
  
  /** 按属性搜索 */
  searchByProperty(property: string, value: any, options?: Partial<SearchQuery>): Promise<SearchResult[]>
  
  /** 按标签搜索 */
  searchByTags(tags: string[], options?: Partial<SearchQuery>): Promise<SearchResult[]>
  
  /** 高级搜索 */
  advancedSearch(criteria: SearchCriteria): Promise<SearchResultSet>
  
  /** 构建搜索索引 */
  buildIndex(data: FlowchartData): Promise<void>
  
  /** 更新索引 */
  updateIndex(element: FlowchartNode | FlowchartEdge): Promise<void>
  
  /** 删除索引 */
  removeFromIndex(elementId: string): Promise<void>
  
  /** 获取搜索建议 */
  getSuggestions(query: string): Promise<SearchSuggestion[]>
  
  /** 获取搜索历史 */
  getSearchHistory(): SearchHistoryItem[]
  
  /** 清空搜索历史 */
  clearSearchHistory(): void
}

/**
 * 索引管理器接口
 */
export interface IndexManager {
  /** 创建索引 */
  createIndex(data: FlowchartData): Promise<void>
  
  /** 添加到索引 */
  addToIndex(item: SearchIndexItem): Promise<void>
  
  /** 从索引中移除 */
  removeFromIndex(id: string): Promise<void>
  
  /** 更新索引 */
  updateIndex(item: SearchIndexItem): Promise<void>
  
  /** 搜索索引 */
  searchIndex(query: string, options?: any): Promise<SearchIndexItem[]>
  
  /** 获取索引统计 */
  getIndexStats(): {
    totalItems: number
    nodeCount: number
    edgeCount: number
    lastUpdated: number
  }
  
  /** 清空索引 */
  clearIndex(): Promise<void>
}

/**
 * 过滤管理器接口
 */
export interface FilterManager {
  /** 应用过滤器 */
  applyFilters(results: SearchResult[], filters: SearchFilter[]): SearchResult[]
  
  /** 创建过滤器 */
  createFilter(config: Omit<SearchFilter, 'enabled'>): SearchFilter
  
  /** 获取可用过滤器 */
  getAvailableFilters(): SearchFilter[]
  
  /** 验证过滤器 */
  validateFilter(filter: SearchFilter): boolean
}

/**
 * 搜索事件
 */
export interface SearchEvents {
  'search:started': (query: SearchQuery) => void
  'search:completed': (results: SearchResultSet) => void
  'search:failed': (error: Error) => void
  'index:updated': (stats: any) => void
  'suggestion:selected': (suggestion: SearchSuggestion) => void
  'filter:applied': (filter: SearchFilter) => void
  'history:added': (item: SearchHistoryItem) => void
}
