/**
 * 树形组件搜索和过滤功能模块
 * 
 * 提供节点搜索、过滤、高亮显示功能
 */

import type { TreeNode, TreeNodeId } from '../types/tree-node'
import type { TreeOptions } from '../types/tree-options'

/**
 * 搜索匹配模式枚举
 */
export enum SearchMode {
  CONTAINS = 'contains',      // 包含匹配
  STARTS_WITH = 'startsWith', // 开头匹配
  ENDS_WITH = 'endsWith',     // 结尾匹配
  EXACT = 'exact',            // 精确匹配
  REGEX = 'regex',            // 正则表达式匹配
}

/**
 * 搜索结果接口
 */
export interface SearchResult {
  node: TreeNode
  matchedFields: string[]
  highlightRanges: Array<{ start: number; end: number; field: string }>
}

/**
 * 过滤器函数类型
 */
export type FilterFunction = (node: TreeNode) => boolean

/**
 * 搜索管理器类
 */
export class SearchManager {
  private options: TreeOptions
  private nodeMap: Map<TreeNodeId, TreeNode> = new Map()
  private searchKeyword: string = ''
  private searchMode: SearchMode = SearchMode.CONTAINS
  private caseSensitive: boolean = false
  private searchFields: string[] = ['label']
  private customFilters: FilterFunction[] = []
  private searchResults: SearchResult[] = []
  private matchedNodeIds: Set<TreeNodeId> = new Set()

  constructor(options: TreeOptions) {
    this.options = options
    this.searchMode = options.search?.mode as SearchMode || SearchMode.CONTAINS
    this.caseSensitive = options.search?.caseSensitive || false
    this.searchFields = options.search?.fields || ['label']
  }

  /**
   * 更新节点映射
   */
  updateNodeMap(nodeMap: Map<TreeNodeId, TreeNode>): void {
    this.nodeMap = nodeMap
  }

  /**
   * 设置搜索关键词
   */
  setSearchKeyword(keyword: string): SearchResult[] {
    this.searchKeyword = keyword
    return this.performSearch()
  }

  /**
   * 获取当前搜索关键词
   */
  getSearchKeyword(): string {
    return this.searchKeyword
  }

  /**
   * 设置搜索模式
   */
  setSearchMode(mode: SearchMode): SearchResult[] {
    this.searchMode = mode
    return this.performSearch()
  }

  /**
   * 设置大小写敏感
   */
  setCaseSensitive(caseSensitive: boolean): SearchResult[] {
    this.caseSensitive = caseSensitive
    return this.performSearch()
  }

  /**
   * 设置搜索字段
   */
  setSearchFields(fields: string[]): SearchResult[] {
    this.searchFields = fields
    return this.performSearch()
  }

  /**
   * 添加自定义过滤器
   */
  addFilter(filter: FilterFunction): SearchResult[] {
    this.customFilters.push(filter)
    return this.performSearch()
  }

  /**
   * 移除自定义过滤器
   */
  removeFilter(filter: FilterFunction): SearchResult[] {
    const index = this.customFilters.indexOf(filter)
    if (index > -1) {
      this.customFilters.splice(index, 1)
    }
    return this.performSearch()
  }

  /**
   * 清除所有过滤器
   */
  clearFilters(): SearchResult[] {
    this.customFilters = []
    return this.performSearch()
  }

  /**
   * 执行搜索
   */
  performSearch(): SearchResult[] {
    this.searchResults = []
    this.matchedNodeIds.clear()

    if (!this.searchKeyword && this.customFilters.length === 0) {
      // 没有搜索条件，清除所有匹配状态
      this.nodeMap.forEach(node => {
        node.matched = false
        node.highlighted = false
      })
      return []
    }

    // 遍历所有节点进行搜索
    this.nodeMap.forEach(node => {
      const result = this.searchNode(node)
      if (result) {
        this.searchResults.push(result)
        this.matchedNodeIds.add(node.id)
        node.matched = true
        node.highlighted = true
      } else {
        node.matched = false
        node.highlighted = false
      }
    })

    // 展开匹配节点的父节点路径
    this.expandMatchedNodePaths()

    return this.searchResults
  }

  /**
   * 搜索单个节点
   */
  private searchNode(node: TreeNode): SearchResult | null {
    // 应用自定义过滤器
    for (const filter of this.customFilters) {
      if (!filter(node)) {
        return null
      }
    }

    // 如果没有搜索关键词，但有自定义过滤器，则认为匹配
    if (!this.searchKeyword) {
      return {
        node,
        matchedFields: [],
        highlightRanges: [],
      }
    }

    const matchedFields: string[] = []
    const highlightRanges: Array<{ start: number; end: number; field: string }> = []

    // 在指定字段中搜索
    for (const field of this.searchFields) {
      const fieldValue = this.getNodeFieldValue(node, field)
      if (fieldValue) {
        const matchResult = this.matchText(fieldValue, this.searchKeyword)
        if (matchResult.matched) {
          matchedFields.push(field)
          highlightRanges.push(...matchResult.ranges.map(range => ({
            ...range,
            field,
          })))
        }
      }
    }

    if (matchedFields.length > 0) {
      return {
        node,
        matchedFields,
        highlightRanges,
      }
    }

    return null
  }

  /**
   * 获取节点字段值
   */
  private getNodeFieldValue(node: TreeNode, field: string): string | null {
    switch (field) {
      case 'label':
        return node.label
      case 'id':
        return String(node.id)
      case 'data':
        return node.data ? JSON.stringify(node.data) : null
      default:
        // 尝试从data中获取字段值
        if (node.data && typeof node.data === 'object' && field in node.data) {
          const value = (node.data as any)[field]
          return value ? String(value) : null
        }
        return null
    }
  }

  /**
   * 文本匹配
   */
  private matchText(text: string, keyword: string): { matched: boolean; ranges: Array<{ start: number; end: number }> } {
    if (!text || !keyword) {
      return { matched: false, ranges: [] }
    }

    const searchText = this.caseSensitive ? text : text.toLowerCase()
    const searchKeyword = this.caseSensitive ? keyword : keyword.toLowerCase()
    const ranges: Array<{ start: number; end: number }> = []

    switch (this.searchMode) {
      case SearchMode.CONTAINS:
        return this.matchContains(searchText, searchKeyword)

      case SearchMode.STARTS_WITH:
        if (searchText.startsWith(searchKeyword)) {
          ranges.push({ start: 0, end: keyword.length })
          return { matched: true, ranges }
        }
        break

      case SearchMode.ENDS_WITH:
        if (searchText.endsWith(searchKeyword)) {
          ranges.push({ start: text.length - keyword.length, end: text.length })
          return { matched: true, ranges }
        }
        break

      case SearchMode.EXACT:
        if (searchText === searchKeyword) {
          ranges.push({ start: 0, end: text.length })
          return { matched: true, ranges }
        }
        break

      case SearchMode.REGEX:
        try {
          const flags = this.caseSensitive ? 'g' : 'gi'
          const regex = new RegExp(keyword, flags)
          let match
          while ((match = regex.exec(text)) !== null) {
            ranges.push({ start: match.index, end: match.index + match[0].length })
          }
          return { matched: ranges.length > 0, ranges }
        } catch (error) {
          console.warn('Invalid regex pattern:', keyword)
          return { matched: false, ranges: [] }
        }
    }

    return { matched: false, ranges: [] }
  }

  /**
   * 包含匹配
   */
  private matchContains(text: string, keyword: string): { matched: boolean; ranges: Array<{ start: number; end: number }> } {
    const ranges: Array<{ start: number; end: number }> = []
    let index = 0

    while (index < text.length) {
      const foundIndex = text.indexOf(keyword, index)
      if (foundIndex === -1) {
        break
      }
      ranges.push({ start: foundIndex, end: foundIndex + keyword.length })
      index = foundIndex + 1
    }

    return { matched: ranges.length > 0, ranges }
  }

  /**
   * 展开匹配节点的父节点路径
   */
  private expandMatchedNodePaths(): void {
    if (!this.options.search?.expandMatched) {
      return
    }

    this.matchedNodeIds.forEach(nodeId => {
      const node = this.nodeMap.get(nodeId)
      if (node) {
        let parent = node.parent
        while (parent) {
          parent.expanded = true
          parent = parent.parent
        }
      }
    })
  }

  /**
   * 获取搜索结果
   */
  getSearchResults(): SearchResult[] {
    return [...this.searchResults]
  }

  /**
   * 获取匹配的节点ID集合
   */
  getMatchedNodeIds(): Set<TreeNodeId> {
    return new Set(this.matchedNodeIds)
  }

  /**
   * 检查节点是否匹配
   */
  isNodeMatched(nodeId: TreeNodeId): boolean {
    return this.matchedNodeIds.has(nodeId)
  }

  /**
   * 获取匹配的节点数量
   */
  getMatchedCount(): number {
    return this.matchedNodeIds.size
  }

  /**
   * 清除搜索
   */
  clearSearch(): void {
    this.searchKeyword = ''
    this.searchResults = []
    this.matchedNodeIds.clear()

    // 清除节点匹配状态
    this.nodeMap.forEach(node => {
      node.matched = false
      node.highlighted = false
    })
  }

  /**
   * 高亮匹配文本
   */
  highlightText(text: string, nodeId: TreeNodeId, field: string = 'label'): string {
    const result = this.searchResults.find(r => r.node.id === nodeId)
    if (!result || !this.searchKeyword) {
      return text
    }

    const ranges = result.highlightRanges.filter(r => r.field === field)
    if (ranges.length === 0) {
      return text
    }

    // 按位置倒序排列，从后往前替换，避免位置偏移
    ranges.sort((a, b) => b.start - a.start)

    let highlightedText = text
    for (const range of ranges) {
      const before = highlightedText.substring(0, range.start)
      const match = highlightedText.substring(range.start, range.end)
      const after = highlightedText.substring(range.end)
      highlightedText = `${before}<mark class="tree-search-highlight">${match}</mark>${after}`
    }

    return highlightedText
  }

  /**
   * 跳转到下一个匹配项
   */
  goToNext(currentNodeId?: TreeNodeId): TreeNode | null {
    if (this.searchResults.length === 0) {
      return null
    }

    if (!currentNodeId) {
      return this.searchResults[0].node
    }

    const currentIndex = this.searchResults.findIndex(r => r.node.id === currentNodeId)
    if (currentIndex === -1) {
      return this.searchResults[0].node
    }

    const nextIndex = (currentIndex + 1) % this.searchResults.length
    return this.searchResults[nextIndex].node
  }

  /**
   * 跳转到上一个匹配项
   */
  goToPrevious(currentNodeId?: TreeNodeId): TreeNode | null {
    if (this.searchResults.length === 0) {
      return null
    }

    if (!currentNodeId) {
      return this.searchResults[this.searchResults.length - 1].node
    }

    const currentIndex = this.searchResults.findIndex(r => r.node.id === currentNodeId)
    if (currentIndex === -1) {
      return this.searchResults[this.searchResults.length - 1].node
    }

    const prevIndex = currentIndex === 0 ? this.searchResults.length - 1 : currentIndex - 1
    return this.searchResults[prevIndex].node
  }
}
