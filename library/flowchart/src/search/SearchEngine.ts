/**
 * 搜索引擎
 * 
 * 提供全文搜索、属性搜索、标签搜索等高级搜索功能
 */

import type {
  SearchEngine as ISearchEngine,
  SearchCriteria,
  SearchResultSet,
  SearchResult,
  SearchQuery,
  SearchConfig,
  SearchHistoryItem,
  SearchSuggestion,
  SearchIndexItem,
  SearchEvents
} from './types'
import type { FlowchartData, FlowchartNode, FlowchartEdge } from '../types'
import { IndexManager } from './IndexManager'
import { FilterManager } from './FilterManager'
import { EventEmitter } from 'events'

/**
 * 搜索引擎类
 */
export class SearchEngine extends EventEmitter implements ISearchEngine {
  private indexManager: IndexManager
  private filterManager: FilterManager
  private config: SearchConfig
  private searchHistory: SearchHistoryItem[] = []
  private isIndexing: boolean = false

  constructor(config?: Partial<SearchConfig>) {
    super()
    
    this.config = {
      enableFullTextSearch: true,
      enablePropertySearch: true,
      enableTagSearch: true,
      indexingStrategy: 'realtime',
      maxResults: 100,
      searchTimeout: 5000,
      enableSearchHistory: true,
      maxSearchHistory: 50,
      enableSearchSuggestions: true,
      minSearchLength: 2,
      ...config
    }

    this.indexManager = new IndexManager()
    this.filterManager = new FilterManager()
    
    this.setupEventListeners()
  }

  /**
   * 执行搜索
   */
  async search(criteria: SearchCriteria): Promise<SearchResultSet> {
    const startTime = Date.now()
    
    try {
      this.emit('search:started', criteria.query)
      
      // 验证查询
      this.validateQuery(criteria.query)
      
      // 执行搜索
      let results = await this.performSearch(criteria.query)
      
      // 应用过滤器
      if (criteria.filters.length > 0) {
        results = this.filterManager.applyFilters(results, criteria.filters)
      }
      
      // 排序
      results = this.sortResults(results, criteria.sorting)
      
      // 分页
      const paginatedResults = this.paginateResults(results, criteria.pagination)
      
      const duration = Date.now() - startTime
      
      const resultSet: SearchResultSet = {
        results: paginatedResults,
        total: results.length,
        duration,
        query: criteria.query,
        pagination: {
          ...criteria.pagination,
          total: results.length
        },
        aggregations: this.generateAggregations(results)
      }
      
      // 添加到搜索历史
      if (this.config.enableSearchHistory) {
        this.addToSearchHistory(criteria.query, resultSet)
      }
      
      this.emit('search:completed', resultSet)
      return resultSet
      
    } catch (error) {
      this.emit('search:failed', error as Error)
      throw error
    }
  }

  /**
   * 全文搜索
   */
  async fullTextSearch(text: string, options?: Partial<SearchQuery>): Promise<SearchResult[]> {
    if (!this.config.enableFullTextSearch) {
      throw new Error('全文搜索功能未启用')
    }

    const query: SearchQuery = {
      text,
      caseSensitive: false,
      useRegex: false,
      scope: {
        includeNodes: true,
        includeEdges: true,
        includeNodeText: true,
        includeEdgeText: true,
        includeProperties: true,
        includeComments: true
      },
      ...options
    }

    const criteria: SearchCriteria = {
      query,
      filters: [],
      sorting: { field: 'score', direction: 'desc' },
      pagination: { page: 0, pageSize: this.config.maxResults }
    }

    const resultSet = await this.search(criteria)
    return resultSet.results
  }

  /**
   * 按类型搜索
   */
  async searchByType(type: string, options?: Partial<SearchQuery>): Promise<SearchResult[]> {
    const query: SearchQuery = {
      nodeTypes: type.startsWith('node:') ? [type.substring(5)] : undefined,
      edgeTypes: type.startsWith('edge:') ? [type.substring(5)] : undefined,
      ...options
    }

    const criteria: SearchCriteria = {
      query,
      filters: [],
      sorting: { field: 'score', direction: 'desc' },
      pagination: { page: 0, pageSize: this.config.maxResults }
    }

    const resultSet = await this.search(criteria)
    return resultSet.results
  }

  /**
   * 按属性搜索
   */
  async searchByProperty(property: string, value: any, options?: Partial<SearchQuery>): Promise<SearchResult[]> {
    if (!this.config.enablePropertySearch) {
      throw new Error('属性搜索功能未启用')
    }

    const query: SearchQuery = {
      properties: { [property]: value },
      ...options
    }

    const criteria: SearchCriteria = {
      query,
      filters: [],
      sorting: { field: 'score', direction: 'desc' },
      pagination: { page: 0, pageSize: this.config.maxResults }
    }

    const resultSet = await this.search(criteria)
    return resultSet.results
  }

  /**
   * 按标签搜索
   */
  async searchByTags(tags: string[], options?: Partial<SearchQuery>): Promise<SearchResult[]> {
    if (!this.config.enableTagSearch) {
      throw new Error('标签搜索功能未启用')
    }

    const query: SearchQuery = {
      tags,
      ...options
    }

    const criteria: SearchCriteria = {
      query,
      filters: [],
      sorting: { field: 'score', direction: 'desc' },
      pagination: { page: 0, pageSize: this.config.maxResults }
    }

    const resultSet = await this.search(criteria)
    return resultSet.results
  }

  /**
   * 高级搜索
   */
  async advancedSearch(criteria: SearchCriteria): Promise<SearchResultSet> {
    return this.search(criteria)
  }

  /**
   * 构建搜索索引
   */
  async buildIndex(data: FlowchartData): Promise<void> {
    if (this.isIndexing) {
      throw new Error('索引构建正在进行中')
    }

    this.isIndexing = true
    
    try {
      await this.indexManager.createIndex(data)
      this.emit('index:updated', this.indexManager.getIndexStats())
    } finally {
      this.isIndexing = false
    }
  }

  /**
   * 更新索引
   */
  async updateIndex(element: FlowchartNode | FlowchartEdge): Promise<void> {
    const indexItem = this.createIndexItem(element)
    await this.indexManager.updateIndex(indexItem)
    this.emit('index:updated', this.indexManager.getIndexStats())
  }

  /**
   * 删除索引
   */
  async removeFromIndex(elementId: string): Promise<void> {
    await this.indexManager.removeFromIndex(elementId)
    this.emit('index:updated', this.indexManager.getIndexStats())
  }

  /**
   * 获取搜索建议
   */
  async getSuggestions(query: string): Promise<SearchSuggestion[]> {
    if (!this.config.enableSearchSuggestions || query.length < this.config.minSearchLength) {
      return []
    }

    const suggestions: SearchSuggestion[] = []
    
    // 从搜索历史中获取建议
    const historySuggestions = this.getHistorySuggestions(query)
    suggestions.push(...historySuggestions)
    
    // 从索引中获取建议
    const indexSuggestions = await this.getIndexSuggestions(query)
    suggestions.push(...indexSuggestions)
    
    // 排序并去重
    return this.deduplicateAndSortSuggestions(suggestions)
  }

  /**
   * 获取搜索历史
   */
  getSearchHistory(): SearchHistoryItem[] {
    return [...this.searchHistory]
  }

  /**
   * 清空搜索历史
   */
  clearSearchHistory(): void {
    this.searchHistory = []
  }

  /**
   * 验证查询
   */
  private validateQuery(query: SearchQuery): void {
    if (!query.text && !query.nodeTypes && !query.edgeTypes && !query.properties && !query.tags) {
      throw new Error('搜索查询不能为空')
    }

    if (query.text && query.text.length < this.config.minSearchLength) {
      throw new Error(`搜索文本长度不能少于 ${this.config.minSearchLength} 个字符`)
    }
  }

  /**
   * 执行搜索
   */
  private async performSearch(query: SearchQuery): Promise<SearchResult[]> {
    const results: SearchResult[] = []
    
    // 全文搜索
    if (query.text) {
      const textResults = await this.searchByText(query.text, query)
      results.push(...textResults)
    }
    
    // 类型搜索
    if (query.nodeTypes || query.edgeTypes) {
      const typeResults = await this.searchByTypes(query)
      results.push(...typeResults)
    }
    
    // 属性搜索
    if (query.properties) {
      const propertyResults = await this.searchByProperties(query.properties, query)
      results.push(...propertyResults)
    }
    
    // 标签搜索
    if (query.tags) {
      const tagResults = await this.searchByTagsInternal(query.tags, query)
      results.push(...tagResults)
    }
    
    // 去重并合并分数
    return this.mergeAndDeduplicateResults(results)
  }

  /**
   * 按文本搜索
   */
  private async searchByText(text: string, query: SearchQuery): Promise<SearchResult[]> {
    const indexItems = await this.indexManager.searchIndex(text, {
      caseSensitive: query.caseSensitive,
      useRegex: query.useRegex,
      scope: query.scope
    })

    return indexItems.map(item => this.createSearchResult(item, text, 'text'))
  }

  /**
   * 按类型搜索
   */
  private async searchByTypes(query: SearchQuery): Promise<SearchResult[]> {
    const results: SearchResult[] = []

    if (query.nodeTypes) {
      for (const nodeType of query.nodeTypes) {
        const items = await this.indexManager.searchIndex(`type:${nodeType}`)
        results.push(...items.map(item => this.createSearchResult(item, nodeType, 'type')))
      }
    }

    if (query.edgeTypes) {
      for (const edgeType of query.edgeTypes) {
        const items = await this.indexManager.searchIndex(`type:${edgeType}`)
        results.push(...items.map(item => this.createSearchResult(item, edgeType, 'type')))
      }
    }

    return results
  }

  /**
   * 按属性搜索
   */
  private async searchByProperties(properties: Record<string, any>, query: SearchQuery): Promise<SearchResult[]> {
    const results: SearchResult[] = []

    for (const [property, value] of Object.entries(properties)) {
      const searchText = `${property}:${value}`
      const items = await this.indexManager.searchIndex(searchText)
      results.push(...items.map(item => this.createSearchResult(item, searchText, 'property')))
    }

    return results
  }

  /**
   * 按标签搜索
   */
  private async searchByTagsInternal(tags: string[], query: SearchQuery): Promise<SearchResult[]> {
    const results: SearchResult[] = []

    for (const tag of tags) {
      const searchText = `tag:${tag}`
      const items = await this.indexManager.searchIndex(searchText)
      results.push(...items.map(item => this.createSearchResult(item, tag, 'tag')))
    }

    return results
  }

  /**
   * 创建搜索结果
   */
  private createSearchResult(indexItem: SearchIndexItem, searchTerm: string, matchType: string): SearchResult {
    return {
      id: indexItem.id,
      type: indexItem.type,
      element: this.reconstructElement(indexItem),
      score: this.calculateScore(indexItem, searchTerm, matchType),
      matchedFields: this.getMatchedFields(indexItem, searchTerm),
      highlights: this.createHighlights(indexItem, searchTerm),
      context: this.generateContext(indexItem, searchTerm),
      reason: this.generateReason(matchType, searchTerm)
    }
  }

  /**
   * 重构元素
   */
  private reconstructElement(indexItem: SearchIndexItem): FlowchartNode | FlowchartEdge {
    // 这里需要从索引项重构完整的元素数据
    return indexItem.fields as any
  }

  /**
   * 计算匹配分数
   */
  private calculateScore(indexItem: SearchIndexItem, searchTerm: string, matchType: string): number {
    let score = 0

    // 基础分数
    switch (matchType) {
      case 'text':
        score = this.calculateTextScore(indexItem.text, searchTerm)
        break
      case 'type':
        score = 0.8
        break
      case 'property':
        score = 0.7
        break
      case 'tag':
        score = 0.6
        break
      default:
        score = 0.5
    }

    // 根据更新时间调整分数
    const ageBonus = this.calculateAgeBonus(indexItem.updatedAt)

    return Math.min(1, score + ageBonus)
  }

  /**
   * 计算文本匹配分数
   */
  private calculateTextScore(text: string, searchTerm: string): number {
    const lowerText = text.toLowerCase()
    const lowerTerm = searchTerm.toLowerCase()

    if (lowerText === lowerTerm) return 1.0
    if (lowerText.startsWith(lowerTerm)) return 0.9
    if (lowerText.includes(lowerTerm)) {
      const ratio = lowerTerm.length / lowerText.length
      return 0.5 + ratio * 0.3
    }

    return this.calculateFuzzyScore(lowerText, lowerTerm)
  }

  /**
   * 计算模糊匹配分数
   */
  private calculateFuzzyScore(text: string, term: string): number {
    const matrix: number[][] = []

    for (let i = 0; i <= text.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= term.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= text.length; i++) {
      for (let j = 1; j <= term.length; j++) {
        if (text[i - 1] === term[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + 1
          )
        }
      }
    }

    const distance = matrix[text.length][term.length]
    const maxLength = Math.max(text.length, term.length)

    return Math.max(0, 1 - distance / maxLength)
  }

  /**
   * 计算时间加成
   */
  private calculateAgeBonus(timestamp: number): number {
    const now = Date.now()
    const ageInDays = (now - timestamp) / (1000 * 60 * 60 * 24)

    if (ageInDays <= 7) {
      return 0.1 * (1 - ageInDays / 7)
    }

    return 0
  }

  /**
   * 获取匹配字段
   */
  private getMatchedFields(indexItem: SearchIndexItem, searchTerm: string): string[] {
    const matchedFields: string[] = []

    // 检查文本字段
    if (indexItem.text.toLowerCase().includes(searchTerm.toLowerCase())) {
      matchedFields.push('text')
    }

    // 检查其他字段
    for (const [field, value] of Object.entries(indexItem.fields)) {
      if (typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())) {
        matchedFields.push(field)
      }
    }

    return matchedFields
  }

  /**
   * 创建高亮信息
   */
  private createHighlights(indexItem: SearchIndexItem, searchTerm: string): any[] {
    // 简化实现，实际应该创建详细的高亮信息
    return []
  }

  /**
   * 生成上下文
   */
  private generateContext(indexItem: SearchIndexItem, searchTerm: string): string {
    const text = indexItem.text
    const index = text.toLowerCase().indexOf(searchTerm.toLowerCase())

    if (index === -1) return text.substring(0, 100)

    const start = Math.max(0, index - 50)
    const end = Math.min(text.length, index + searchTerm.length + 50)

    return text.substring(start, end)
  }

  /**
   * 生成匹配原因
   */
  private generateReason(matchType: string, searchTerm: string): string {
    switch (matchType) {
      case 'text':
        return `文本匹配: "${searchTerm}"`
      case 'type':
        return `类型匹配: ${searchTerm}`
      case 'property':
        return `属性匹配: ${searchTerm}`
      case 'tag':
        return `标签匹配: ${searchTerm}`
      default:
        return `匹配: ${searchTerm}`
    }
  }

  /**
   * 合并和去重结果
   */
  private mergeAndDeduplicateResults(results: SearchResult[]): SearchResult[] {
    const resultMap = new Map<string, SearchResult>()

    for (const result of results) {
      const existing = resultMap.get(result.id)
      if (existing) {
        // 合并分数
        existing.score = Math.max(existing.score, result.score)
        existing.matchedFields = [...new Set([...existing.matchedFields, ...result.matchedFields])]
      } else {
        resultMap.set(result.id, result)
      }
    }

    return Array.from(resultMap.values())
  }

  /**
   * 排序结果
   */
  private sortResults(results: SearchResult[], sorting: any): SearchResult[] {
    return results.sort((a, b) => {
      let comparison = 0

      switch (sorting.field) {
        case 'score':
          comparison = b.score - a.score
          break
        case 'name':
          const aName = (a.element as any).text || (a.element as any).label || ''
          const bName = (b.element as any).text || (b.element as any).label || ''
          comparison = aName.localeCompare(bName)
          break
        case 'type':
          comparison = a.type.localeCompare(b.type)
          break
        default:
          comparison = b.score - a.score
      }

      return sorting.direction === 'desc' ? comparison : -comparison
    })
  }

  /**
   * 分页结果
   */
  private paginateResults(results: SearchResult[], pagination: any): SearchResult[] {
    const start = pagination.page * pagination.pageSize
    const end = start + pagination.pageSize
    return results.slice(start, end)
  }

  /**
   * 生成聚合信息
   */
  private generateAggregations(results: SearchResult[]): any {
    const aggregations = {
      byType: {} as Record<string, number>,
      byTags: {} as Record<string, number>,
      byAuthor: {} as Record<string, number>,
      byDate: {} as Record<string, number>
    }

    for (const result of results) {
      // 按类型聚合
      aggregations.byType[result.type] = (aggregations.byType[result.type] || 0) + 1

      // 其他聚合逻辑...
    }

    return aggregations
  }

  /**
   * 添加到搜索历史
   */
  private addToSearchHistory(query: SearchQuery, resultSet: SearchResultSet): void {
    const historyItem: SearchHistoryItem = {
      id: this.generateId(),
      query,
      timestamp: Date.now(),
      resultCount: resultSet.total,
      duration: resultSet.duration
    }

    this.searchHistory.unshift(historyItem)

    // 限制历史记录数量
    if (this.searchHistory.length > this.config.maxSearchHistory) {
      this.searchHistory = this.searchHistory.slice(0, this.config.maxSearchHistory)
    }

    this.emit('history:added', historyItem)
  }

  /**
   * 从历史获取建议
   */
  private getHistorySuggestions(query: string): SearchSuggestion[] {
    return this.searchHistory
      .filter(item => item.query.text?.toLowerCase().includes(query.toLowerCase()))
      .map(item => ({
        text: item.query.text || '',
        type: 'query' as const,
        score: 0.8,
        source: 'history' as const
      }))
      .slice(0, 5)
  }

  /**
   * 从索引获取建议
   */
  private async getIndexSuggestions(query: string): Promise<SearchSuggestion[]> {
    // 简化实现
    return []
  }

  /**
   * 去重和排序建议
   */
  private deduplicateAndSortSuggestions(suggestions: SearchSuggestion[]): SearchSuggestion[] {
    const uniqueSuggestions = suggestions.filter((suggestion, index, array) =>
      array.findIndex(s => s.text === suggestion.text) === index
    )

    return uniqueSuggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
  }

  /**
   * 创建索引项
   */
  private createIndexItem(element: FlowchartNode | FlowchartEdge): SearchIndexItem {
    return {
      id: element.id,
      type: 'type' in element ? 'node' : 'edge',
      text: (element as any).text || (element as any).label || '',
      fields: element,
      tags: (element as any).tags || [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 可以在这里设置其他事件监听器
  }

  /**
   * 生成ID
   */
  private generateId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
