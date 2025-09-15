/**
 * 索引管理器
 * 
 * 管理搜索索引的创建、更新和查询
 */

import type {
  IndexManager as IIndexManager,
  SearchIndexItem
} from './types'
import type { FlowchartData, FlowchartNode, FlowchartEdge } from '../types'

/**
 * 索引管理器类
 */
export class IndexManager implements IIndexManager {
  private index: Map<string, SearchIndexItem> = new Map()
  private textIndex: Map<string, Set<string>> = new Map() // 文本到ID的映射
  private typeIndex: Map<string, Set<string>> = new Map() // 类型到ID的映射
  private tagIndex: Map<string, Set<string>> = new Map() // 标签到ID的映射
  private lastUpdated: number = 0

  /**
   * 创建索引
   */
  async createIndex(data: FlowchartData): Promise<void> {
    // 清空现有索引
    this.clearIndexInternal()
    
    // 索引节点
    for (const node of data.nodes) {
      const indexItem = this.createIndexItem(node, 'node')
      await this.addToIndex(indexItem)
    }
    
    // 索引边
    for (const edge of data.edges) {
      const indexItem = this.createIndexItem(edge, 'edge')
      await this.addToIndex(indexItem)
    }
    
    this.lastUpdated = Date.now()
  }

  /**
   * 添加到索引
   */
  async addToIndex(item: SearchIndexItem): Promise<void> {
    // 添加到主索引
    this.index.set(item.id, item)
    
    // 添加到文本索引
    this.addToTextIndex(item)
    
    // 添加到类型索引
    this.addToTypeIndex(item)
    
    // 添加到标签索引
    this.addToTagIndex(item)
    
    this.lastUpdated = Date.now()
  }

  /**
   * 从索引中移除
   */
  async removeFromIndex(id: string): Promise<void> {
    const item = this.index.get(id)
    if (!item) return
    
    // 从主索引移除
    this.index.delete(id)
    
    // 从文本索引移除
    this.removeFromTextIndex(item)
    
    // 从类型索引移除
    this.removeFromTypeIndex(item)
    
    // 从标签索引移除
    this.removeFromTagIndex(item)
    
    this.lastUpdated = Date.now()
  }

  /**
   * 更新索引
   */
  async updateIndex(item: SearchIndexItem): Promise<void> {
    // 先移除旧的索引项
    await this.removeFromIndex(item.id)
    
    // 添加新的索引项
    await this.addToIndex(item)
  }

  /**
   * 搜索索引
   */
  async searchIndex(query: string, options?: any): Promise<SearchIndexItem[]> {
    const results: SearchIndexItem[] = []
    const resultIds = new Set<string>()
    
    // 解析查询
    const { searchType, searchTerm } = this.parseQuery(query)
    
    switch (searchType) {
      case 'type':
        this.searchByType(searchTerm, resultIds)
        break
      case 'tag':
        this.searchByTag(searchTerm, resultIds)
        break
      case 'text':
      default:
        this.searchByText(searchTerm, resultIds, options)
        break
    }
    
    // 获取完整的索引项
    for (const id of resultIds) {
      const item = this.index.get(id)
      if (item) {
        results.push(item)
      }
    }
    
    return results
  }

  /**
   * 获取索引统计
   */
  getIndexStats(): {
    totalItems: number
    nodeCount: number
    edgeCount: number
    lastUpdated: number
  } {
    let nodeCount = 0
    let edgeCount = 0
    
    for (const item of this.index.values()) {
      if (item.type === 'node') {
        nodeCount++
      } else {
        edgeCount++
      }
    }
    
    return {
      totalItems: this.index.size,
      nodeCount,
      edgeCount,
      lastUpdated: this.lastUpdated
    }
  }

  /**
   * 清空索引
   */
  async clearIndex(): Promise<void> {
    this.clearIndexInternal()
  }

  /**
   * 创建索引项
   */
  private createIndexItem(element: FlowchartNode | FlowchartEdge, type: 'node' | 'edge'): SearchIndexItem {
    const text = this.extractText(element)
    const tags = this.extractTags(element)
    
    return {
      id: element.id,
      type,
      text,
      fields: element,
      tags,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      author: (element as any).author
    }
  }

  /**
   * 提取文本内容
   */
  private extractText(element: FlowchartNode | FlowchartEdge): string {
    const textParts: string[] = []
    
    // 提取主要文本
    if ((element as any).text) {
      textParts.push((element as any).text)
    }
    
    if ((element as any).label) {
      textParts.push((element as any).label)
    }
    
    // 提取属性中的文本
    if ((element as any).properties) {
      const properties = (element as any).properties
      for (const [key, value] of Object.entries(properties)) {
        if (typeof value === 'string') {
          textParts.push(`${key}:${value}`)
        }
      }
    }
    
    return textParts.join(' ')
  }

  /**
   * 提取标签
   */
  private extractTags(element: FlowchartNode | FlowchartEdge): string[] {
    const tags: string[] = []
    
    // 从属性中提取标签
    if ((element as any).tags) {
      tags.push(...(element as any).tags)
    }
    
    // 添加类型作为标签
    if ((element as any).type) {
      tags.push((element as any).type)
    }
    
    return tags
  }

  /**
   * 添加到文本索引
   */
  private addToTextIndex(item: SearchIndexItem): void {
    const words = this.tokenizeText(item.text)
    
    for (const word of words) {
      if (!this.textIndex.has(word)) {
        this.textIndex.set(word, new Set())
      }
      this.textIndex.get(word)!.add(item.id)
    }
  }

  /**
   * 添加到类型索引
   */
  private addToTypeIndex(item: SearchIndexItem): void {
    const type = (item.fields as any).type
    if (type) {
      if (!this.typeIndex.has(type)) {
        this.typeIndex.set(type, new Set())
      }
      this.typeIndex.get(type)!.add(item.id)
    }
  }

  /**
   * 添加到标签索引
   */
  private addToTagIndex(item: SearchIndexItem): void {
    for (const tag of item.tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set())
      }
      this.tagIndex.get(tag)!.add(item.id)
    }
  }

  /**
   * 从文本索引移除
   */
  private removeFromTextIndex(item: SearchIndexItem): void {
    const words = this.tokenizeText(item.text)
    
    for (const word of words) {
      const ids = this.textIndex.get(word)
      if (ids) {
        ids.delete(item.id)
        if (ids.size === 0) {
          this.textIndex.delete(word)
        }
      }
    }
  }

  /**
   * 从类型索引移除
   */
  private removeFromTypeIndex(item: SearchIndexItem): void {
    const type = (item.fields as any).type
    if (type) {
      const ids = this.typeIndex.get(type)
      if (ids) {
        ids.delete(item.id)
        if (ids.size === 0) {
          this.typeIndex.delete(type)
        }
      }
    }
  }

  /**
   * 从标签索引移除
   */
  private removeFromTagIndex(item: SearchIndexItem): void {
    for (const tag of item.tags) {
      const ids = this.tagIndex.get(tag)
      if (ids) {
        ids.delete(item.id)
        if (ids.size === 0) {
          this.tagIndex.delete(tag)
        }
      }
    }
  }

  /**
   * 解析查询
   */
  private parseQuery(query: string): { searchType: string; searchTerm: string } {
    if (query.startsWith('type:')) {
      return { searchType: 'type', searchTerm: query.substring(5) }
    }
    
    if (query.startsWith('tag:')) {
      return { searchType: 'tag', searchTerm: query.substring(4) }
    }
    
    return { searchType: 'text', searchTerm: query }
  }

  /**
   * 按类型搜索
   */
  private searchByType(type: string, resultIds: Set<string>): void {
    const ids = this.typeIndex.get(type)
    if (ids) {
      for (const id of ids) {
        resultIds.add(id)
      }
    }
  }

  /**
   * 按标签搜索
   */
  private searchByTag(tag: string, resultIds: Set<string>): void {
    const ids = this.tagIndex.get(tag)
    if (ids) {
      for (const id of ids) {
        resultIds.add(id)
      }
    }
  }

  /**
   * 按文本搜索
   */
  private searchByText(text: string, resultIds: Set<string>, options?: any): void {
    const words = this.tokenizeText(text)
    
    for (const word of words) {
      // 精确匹配
      const exactIds = this.textIndex.get(word.toLowerCase())
      if (exactIds) {
        for (const id of exactIds) {
          resultIds.add(id)
        }
      }
      
      // 模糊匹配
      for (const [indexWord, ids] of this.textIndex.entries()) {
        if (indexWord.includes(word.toLowerCase()) || word.toLowerCase().includes(indexWord)) {
          for (const id of ids) {
            resultIds.add(id)
          }
        }
      }
    }
  }

  /**
   * 分词
   */
  private tokenizeText(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff]/g, ' ') // 保留中文字符
      .split(/\s+/)
      .filter(word => word.length > 0)
  }

  /**
   * 清空索引（内部方法）
   */
  private clearIndexInternal(): void {
    this.index.clear()
    this.textIndex.clear()
    this.typeIndex.clear()
    this.tagIndex.clear()
    this.lastUpdated = 0
  }
}
