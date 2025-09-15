/**
 * 过滤管理器
 * 
 * 管理搜索结果的过滤功能
 */

import type {
  FilterManager as IFilterManager,
  SearchResult,
  SearchFilter
} from './types'

/**
 * 过滤管理器类
 */
export class FilterManager implements IFilterManager {
  private availableFilters: SearchFilter[] = []

  constructor() {
    this.initializeDefaultFilters()
  }

  /**
   * 应用过滤器
   */
  applyFilters(results: SearchResult[], filters: SearchFilter[]): SearchResult[] {
    let filteredResults = results

    for (const filter of filters) {
      if (!filter.enabled) continue

      filteredResults = this.applyFilter(filteredResults, filter)
    }

    return filteredResults
  }

  /**
   * 创建过滤器
   */
  createFilter(config: Omit<SearchFilter, 'enabled'>): SearchFilter {
    return {
      ...config,
      enabled: true
    }
  }

  /**
   * 获取可用过滤器
   */
  getAvailableFilters(): SearchFilter[] {
    return [...this.availableFilters]
  }

  /**
   * 验证过滤器
   */
  validateFilter(filter: SearchFilter): boolean {
    // 检查必需字段
    if (!filter.name || !filter.type || !filter.label) {
      return false
    }

    // 检查类型特定的验证
    switch (filter.type) {
      case 'select':
      case 'multiselect':
        return Array.isArray(filter.options) && filter.options.length > 0
      case 'date':
        return filter.value instanceof Date || typeof filter.value === 'string'
      case 'number':
        return typeof filter.value === 'number'
      case 'boolean':
        return typeof filter.value === 'boolean'
      case 'text':
        return typeof filter.value === 'string'
      default:
        return false
    }
  }

  /**
   * 添加自定义过滤器
   */
  addCustomFilter(filter: SearchFilter): void {
    if (this.validateFilter(filter)) {
      this.availableFilters.push(filter)
    } else {
      throw new Error('无效的过滤器配置')
    }
  }

  /**
   * 移除过滤器
   */
  removeFilter(filterName: string): void {
    this.availableFilters = this.availableFilters.filter(f => f.name !== filterName)
  }

  /**
   * 应用单个过滤器
   */
  private applyFilter(results: SearchResult[], filter: SearchFilter): SearchResult[] {
    switch (filter.type) {
      case 'text':
        return this.applyTextFilter(results, filter)
      case 'select':
        return this.applySelectFilter(results, filter)
      case 'multiselect':
        return this.applyMultiSelectFilter(results, filter)
      case 'date':
        return this.applyDateFilter(results, filter)
      case 'number':
        return this.applyNumberFilter(results, filter)
      case 'boolean':
        return this.applyBooleanFilter(results, filter)
      default:
        return results
    }
  }

  /**
   * 应用文本过滤器
   */
  private applyTextFilter(results: SearchResult[], filter: SearchFilter): SearchResult[] {
    const searchText = filter.value.toLowerCase()
    
    return results.filter(result => {
      const element = result.element as any
      
      switch (filter.name) {
        case 'text':
          return (element.text || '').toLowerCase().includes(searchText)
        case 'label':
          return (element.label || '').toLowerCase().includes(searchText)
        case 'author':
          return (element.author || '').toLowerCase().includes(searchText)
        default:
          return true
      }
    })
  }

  /**
   * 应用选择过滤器
   */
  private applySelectFilter(results: SearchResult[], filter: SearchFilter): SearchResult[] {
    return results.filter(result => {
      const element = result.element as any
      
      switch (filter.name) {
        case 'type':
          return element.type === filter.value
        case 'nodeType':
          return result.type === 'node' && element.type === filter.value
        case 'edgeType':
          return result.type === 'edge' && element.type === filter.value
        default:
          return element[filter.name] === filter.value
      }
    })
  }

  /**
   * 应用多选过滤器
   */
  private applyMultiSelectFilter(results: SearchResult[], filter: SearchFilter): SearchResult[] {
    const values = Array.isArray(filter.value) ? filter.value : [filter.value]
    
    return results.filter(result => {
      const element = result.element as any
      
      switch (filter.name) {
        case 'types':
          return values.includes(element.type)
        case 'tags':
          const elementTags = element.tags || []
          return values.some(tag => elementTags.includes(tag))
        default:
          const elementValue = element[filter.name]
          return Array.isArray(elementValue) 
            ? elementValue.some(v => values.includes(v))
            : values.includes(elementValue)
      }
    })
  }

  /**
   * 应用日期过滤器
   */
  private applyDateFilter(results: SearchResult[], filter: SearchFilter): SearchResult[] {
    const filterDate = new Date(filter.value)
    
    return results.filter(result => {
      const element = result.element as any
      const elementDate = new Date(element[filter.name] || element.createdAt || 0)
      
      // 这里可以根据需要实现不同的日期比较逻辑
      return elementDate >= filterDate
    })
  }

  /**
   * 应用数字过滤器
   */
  private applyNumberFilter(results: SearchResult[], filter: SearchFilter): SearchResult[] {
    const filterValue = Number(filter.value)
    
    return results.filter(result => {
      const element = result.element as any
      const elementValue = Number(element[filter.name] || 0)
      
      // 这里可以根据需要实现不同的数字比较逻辑
      return elementValue >= filterValue
    })
  }

  /**
   * 应用布尔过滤器
   */
  private applyBooleanFilter(results: SearchResult[], filter: SearchFilter): SearchResult[] {
    return results.filter(result => {
      const element = result.element as any
      return Boolean(element[filter.name]) === Boolean(filter.value)
    })
  }

  /**
   * 初始化默认过滤器
   */
  private initializeDefaultFilters(): void {
    // 类型过滤器
    this.availableFilters.push({
      name: 'type',
      type: 'select',
      label: '元素类型',
      value: '',
      options: [
        { label: '节点', value: 'node' },
        { label: '连线', value: 'edge' }
      ],
      enabled: false
    })

    // 节点类型过滤器
    this.availableFilters.push({
      name: 'nodeType',
      type: 'multiselect',
      label: '节点类型',
      value: [],
      options: [
        { label: '开始节点', value: 'start' },
        { label: '审批节点', value: 'approval' },
        { label: '条件节点', value: 'condition' },
        { label: '结束节点', value: 'end' },
        { label: '处理节点', value: 'process' },
        { label: '并行网关', value: 'parallel-gateway' },
        { label: '排他网关', value: 'exclusive-gateway' }
      ],
      enabled: false
    })

    // 文本过滤器
    this.availableFilters.push({
      name: 'text',
      type: 'text',
      label: '包含文本',
      value: '',
      enabled: false
    })

    // 创建者过滤器
    this.availableFilters.push({
      name: 'author',
      type: 'text',
      label: '创建者',
      value: '',
      enabled: false
    })

    // 标签过滤器
    this.availableFilters.push({
      name: 'tags',
      type: 'multiselect',
      label: '标签',
      value: [],
      options: [], // 动态填充
      enabled: false
    })

    // 创建时间过滤器
    this.availableFilters.push({
      name: 'createdAt',
      type: 'date',
      label: '创建时间',
      value: new Date(),
      enabled: false
    })
  }

  /**
   * 更新标签选项
   */
  updateTagOptions(tags: string[]): void {
    const tagFilter = this.availableFilters.find(f => f.name === 'tags')
    if (tagFilter) {
      tagFilter.options = tags.map(tag => ({ label: tag, value: tag }))
    }
  }

  /**
   * 获取过滤器统计信息
   */
  getFilterStats(results: SearchResult[]): Record<string, any> {
    const stats: Record<string, any> = {}
    
    // 统计类型分布
    const typeStats: Record<string, number> = {}
    const nodeTypeStats: Record<string, number> = {}
    const tagStats: Record<string, number> = {}
    
    for (const result of results) {
      const element = result.element as any
      
      // 类型统计
      typeStats[result.type] = (typeStats[result.type] || 0) + 1
      
      // 节点类型统计
      if (result.type === 'node' && element.type) {
        nodeTypeStats[element.type] = (nodeTypeStats[element.type] || 0) + 1
      }
      
      // 标签统计
      if (element.tags) {
        for (const tag of element.tags) {
          tagStats[tag] = (tagStats[tag] || 0) + 1
        }
      }
    }
    
    stats.types = typeStats
    stats.nodeTypes = nodeTypeStats
    stats.tags = tagStats
    
    return stats
  }
}
