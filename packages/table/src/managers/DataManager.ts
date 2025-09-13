/**
 * 数据管理器
 * 
 * 负责表格数据的管理、过滤、排序等操作
 * 提供高效的数据处理和状态管理功能
 * 支持复杂的数据操作和状态同步
 */

import type {
  IDataManager,
  TableRow,
  TableId,
  TableSortState,
  TableFilterState,
  SortDirection
} from '../types'
import { EventManager } from './EventManager'
import { PerformanceManager } from './PerformanceManager'
import { DataLazyLoader } from '../utils/DataLazyLoader'
import { IncrementalUpdater } from '../utils/IncrementalUpdater'

/**
 * 数据管理器配置选项
 */
export interface DataManagerOptions<T extends TableRow = TableRow> {
  /** 初始数据 */
  data?: T[]
  /** 行键字段名 */
  rowKey?: string
}

/**
 * 数据管理器实现类
 * 
 * 功能特性：
 * - 原始数据管理和存储
 * - 数据过滤和排序
 * - 行键管理和查找
 * - 数据状态同步
 * - 高效的数据操作算法
 */
export class DataManager<T extends TableRow = TableRow> implements IDataManager<T> {
  /** 原始数据 */
  private originalData: T[] = []

  /** 过滤后的数据 */
  private filteredData: T[] = []

  /** 排序后的数据 */
  private sortedData: T[] = []

  /** 当前显示的数据 */
  private displayData: T[] = []

  /** 行键字段名 */
  private rowKeyField: string

  /** 当前排序状态 */
  private sortState: TableSortState | null = null

  /** 当前过滤状态 */
  private filterState: TableFilterState = {}

  /** 事件管理器 */
  private eventManager: EventManager

  /** 性能管理器 */
  private performanceManager: PerformanceManager<T>

  /** 懒加载器 */
  private lazyLoader: DataLazyLoader<T> | null = null

  /** 增量更新器 */
  private incrementalUpdater: IncrementalUpdater<T>

  /**
   * 构造函数
   * @param options 配置选项
   */
  constructor(options: DataManagerOptions<T> = {}) {
    this.rowKeyField = options.rowKey || 'id'
    this.eventManager = new EventManager()

    // 初始化性能管理器
    this.performanceManager = new PerformanceManager({
      enableIncrementalUpdate: true,
      enableLazyLoading: true,
      enableDataCache: true,
      enableRenderCache: false, // DataManager不需要渲染缓存
      batchUpdateSize: 50,
      maxCacheSize: 500,
      lazyLoadThreshold: 1000
    })

    // 初始化增量更新器
    this.incrementalUpdater = new IncrementalUpdater({
      enabled: true,
      batchSize: 50,
      updateInterval: 100,
      enableAutoMerge: true,
      maxChangeRecords: 500
    })

    // 监听性能管理器事件
    this.performanceManager.on('batch-update-complete', (data) => {
      this.eventManager.emit('performance-update', data)
    })

    if (options.data) {
      this.setData(options.data)
    }
  }

  /**
   * 设置原始数据
   * @param data 原始数据数组
   */
  setData(data: T[]): void {
    this.originalData = [...data]
    this.refresh()
  }

  /**
   * 获取原始数据
   */
  getData(): T[] {
    return [...this.originalData]
  }

  /**
   * 获取原始数据（别名）
   */
  getRawData(): T[] {
    return this.getData()
  }

  /**
   * 获取过滤后的数据
   */
  getFilteredData(): T[] {
    return [...this.filteredData]
  }

  /**
   * 获取排序后的数据
   */
  getSortedData(): T[] {
    return [...this.sortedData]
  }

  /**
   * 获取当前显示的数据
   */
  getDisplayData(): T[] {
    return [...this.displayData]
  }

  /**
   * 根据行键获取行数据
   * @param key 行键
   */
  getRowByKey(key: TableId): T | undefined {
    return this.originalData.find(row => this.getRowKey(row) === key)
  }

  /**
   * 根据索引获取行数据
   * @param index 行索引
   */
  getRowByIndex(index: number): T | undefined {
    return this.originalData[index]
  }

  /**
   * 根据行数据获取行键
   * @param row 行数据
   */
  getRowKey(row: T): TableId {
    const key = row[this.rowKeyField]
    if (key === undefined || key === null) {
      throw new Error(`行数据缺少键字段 "${this.rowKeyField}"`)
    }
    return key
  }

  /**
   * 设置排序
   * @param column 列键
   * @param direction 排序方向
   * @param sorter 排序函数
   */
  setSort(column: string, direction: SortDirection, sorter?: (a: T, b: T) => number): void {
    if (direction === null) {
      this.clearSort()
      return
    }

    this.sortState = {
      column,
      direction
    }

    // 应用排序
    this.applySorting(sorter)
    this.updateDisplayData()

    // 触发排序变化事件
    this.eventManager.emit('sort-change', {
      column,
      direction,
      sorter
    })
  }

  /**
   * 清除排序
   */
  clearSort(): void {
    this.sortState = null
    this.sortedData = [...this.filteredData]
    this.updateDisplayData()

    // 触发排序变化事件
    this.eventManager.emit('sort-change', null)
  }

  /**
   * 设置过滤
   * @param column 列键
   * @param filters 过滤值数组
   */
  setFilter(column: string, filters: any[]): void {
    if (filters.length === 0) {
      delete this.filterState[column]
    } else {
      this.filterState[column] = [...filters]
    }

    // 重新应用过滤
    this.applyFiltering()

    // 重新应用排序
    if (this.sortState) {
      this.applySorting()
    } else {
      this.sortedData = [...this.filteredData]
    }

    this.updateDisplayData()

    // 触发过滤变化事件
    this.eventManager.emit('filter-change', {
      column,
      filters,
      filteredData: this.filteredData
    })
  }

  /**
   * 清除过滤
   * @param column 列键，不传则清除所有过滤
   */
  clearFilter(column?: string): void {
    if (column) {
      delete this.filterState[column]
    } else {
      this.filterState = {}
    }

    // 重新应用过滤
    this.applyFiltering()

    // 重新应用排序
    if (this.sortState) {
      this.applySorting()
    } else {
      this.sortedData = [...this.filteredData]
    }

    this.updateDisplayData()
  }

  /**
   * 获取排序状态
   */
  getSortState(): TableSortState | null {
    return this.sortState ? { ...this.sortState } : null
  }

  /**
   * 获取过滤状态
   */
  getFilterState(): TableFilterState {
    const state: TableFilterState = {}
    for (const [column, filters] of Object.entries(this.filterState)) {
      state[column] = [...filters]
    }
    return state
  }

  /**
   * 刷新数据（重新应用过滤和排序）
   */
  refresh(): void {
    const startTime = performance.now()

    // 检查缓存
    const cacheKey = this.generateCacheKey()
    const cachedData = this.performanceManager.getCachedData(cacheKey)

    if (cachedData) {
      this.displayData = cachedData
      this.eventManager.emit('data-change', {
        type: 'refresh',
        data: this.displayData,
        fromCache: true
      })
      return
    }

    // 重新应用过滤
    this.applyFiltering()

    // 重新应用排序
    if (this.sortState) {
      this.applySorting()
    } else {
      this.sortedData = [...this.filteredData]
    }

    this.updateDisplayData()

    // 缓存结果
    this.performanceManager.cacheData(cacheKey, this.displayData)

    const endTime = performance.now()
    console.debug(`数据刷新耗时: ${endTime - startTime}ms`)
  }

  /**
   * 应用过滤
   * @private
   */
  private applyFiltering(): void {
    if (Object.keys(this.filterState).length === 0) {
      this.filteredData = [...this.originalData]
      return
    }

    this.filteredData = this.originalData.filter(row => {
      for (const [column, filters] of Object.entries(this.filterState)) {
        const value = row[column]
        if (!filters.includes(value)) {
          return false
        }
      }
      return true
    })
  }

  /**
   * 应用排序
   * @param customSorter 自定义排序函数
   * @private
   */
  private applySorting(customSorter?: (a: T, b: T) => number): void {
    if (!this.sortState) {
      return
    }

    const { column, direction } = this.sortState

    this.sortedData = [...this.filteredData].sort((a, b) => {
      let result = 0

      if (customSorter) {
        result = customSorter(a, b)
      } else {
        // 默认排序逻辑
        const aValue = a[column]
        const bValue = b[column]

        if (aValue < bValue) result = -1
        else if (aValue > bValue) result = 1
        else result = 0
      }

      return direction === 'desc' ? -result : result
    })
  }

  /**
   * 更新显示数据
   * @private
   */
  private updateDisplayData(): void {
    this.displayData = [...this.sortedData]
  }

  /**
   * 设置行键字段
   * @param field 行键字段名
   */
  setRowKeyField(field: string): void {
    this.rowKeyField = field
  }

  /**
   * 获取行键字段
   */
  getRowKeyField(): string {
    return this.rowKeyField
  }

  /**
   * 获取数据统计信息
   */
  getStats() {
    return {
      originalCount: this.originalData.length,
      filteredCount: this.filteredData.length,
      displayCount: this.displayData.length,
      hasSort: this.sortState !== null,
      hasFilter: Object.keys(this.filterState).length > 0
    }
  }

  /**
   * 添加数据
   * @param data 要添加的数据（单行或多行）
   * @param index 插入位置（可选）
   */
  addData(data: T | T[], index?: number): void {
    const dataArray = Array.isArray(data) ? data : [data]

    if (index !== undefined && index >= 0 && index <= this.originalData.length) {
      this.originalData.splice(index, 0, ...dataArray)
    } else {
      this.originalData.push(...dataArray)
    }

    this.refresh()
    this.eventManager.emit('data-change', {
      type: 'add',
      data: dataArray
    })
  }

  /**
   * 删除数据
   * @param keys 要删除的行键（单个或多个）
   */
  removeData(keys: TableId | TableId[]): void {
    const keyArray = Array.isArray(keys) ? keys : [keys]
    const removedData: T[] = []

    this.originalData = this.originalData.filter(row => {
      const rowKey = this.getRowKey(row)
      if (keyArray.includes(rowKey)) {
        removedData.push(row)
        return false
      }
      return true
    })

    this.refresh()
    this.eventManager.emit('data-change', {
      type: 'remove',
      data: removedData
    })
  }

  /**
   * 根据条件删除数据
   * @param predicate 删除条件
   */
  removeDataWhere(predicate: (row: T) => boolean): void {
    const removedData: T[] = []

    this.originalData = this.originalData.filter(row => {
      if (predicate(row)) {
        removedData.push(row)
        return false
      }
      return true
    })

    this.refresh()
    this.eventManager.emit('data-change', {
      type: 'remove',
      data: removedData
    })
  }

  /**
   * 更新数据
   * @param key 行键
   * @param data 更新的数据
   */
  updateData(key: TableId, data: Partial<T>): void {
    const index = this.originalData.findIndex(row => this.getRowKey(row) === key)
    if (index !== -1) {
      this.originalData[index] = { ...this.originalData[index], ...data } as T
      this.refresh()
      this.eventManager.emit('data-change', {
        type: 'update',
        data: [this.originalData[index]]
      })
    }
  }

  /**
   * 批量更新数据
   * @param updates 更新数据数组
   */
  batchUpdateData(updates: Array<{ key: TableId; data: Partial<T> }>): void {
    const updatedData: T[] = []

    updates.forEach(({ key, data }) => {
      const index = this.originalData.findIndex(row => this.getRowKey(row) === key)
      if (index !== -1) {
        this.originalData[index] = { ...this.originalData[index], ...data } as T
        updatedData.push(this.originalData[index]!)
      }
    })

    this.refresh()
    this.eventManager.emit('data-change', {
      type: 'update',
      data: updatedData
    })
  }

  /**
   * 根据条件更新数据
   * @param predicate 更新条件
   * @param data 更新的数据
   */
  updateDataWhere(predicate: (row: T) => boolean, data: Partial<T>): void {
    const updatedData: T[] = []

    this.originalData.forEach((row, index) => {
      if (predicate(row)) {
        this.originalData[index] = { ...row, ...data }
        updatedData.push(this.originalData[index])
      }
    })

    this.refresh()
    this.eventManager.emit('data-change', {
      type: 'update',
      data: updatedData
    })
  }

  /**
   * 生成缓存键
   * @private
   */
  private generateCacheKey(): string {
    const sortKey = this.sortState
      ? `${this.sortState.column}_${this.sortState.direction}`
      : 'no_sort'
    const filterKey = Object.keys(this.filterState).length > 0
      ? JSON.stringify(this.filterState)
      : 'no_filter'
    return `data_${sortKey}_${filterKey}`
  }

  /**
   * 启用懒加载
   */
  enableLazyLoading(
    loader: (offset: number, limit: number) => Promise<{
      data: T[]
      total: number
      hasMore: boolean
    }>,
    config?: {
      pageSize?: number
      preloadPages?: number
      cachePages?: number
    }
  ): void {
    this.lazyLoader = new DataLazyLoader(loader, {
      pageSize: 50,
      preloadPages: 2,
      cachePages: 10,
      enablePreload: true,
      enableCache: true,
      timeout: 10000,
      ...config
    })

    // 监听懒加载事件
    this.lazyLoader.on('page-loaded', (data) => {
      this.eventManager.emit('lazy-load-complete', data)
    })

    this.lazyLoader.on('load-error', (data) => {
      this.eventManager.emit('lazy-load-error', data)
    })
  }

  /**
   * 懒加载数据
   */
  async lazyLoadData(startIndex: number, endIndex: number): Promise<T[]> {
    if (!this.lazyLoader) {
      throw new Error('懒加载未启用，请先调用 enableLazyLoading')
    }

    return this.lazyLoader.getData(startIndex, endIndex)
  }

  /**
   * 应用增量更新
   */
  applyIncrementalUpdate(newData: T[]): void {
    // 计算差异
    const diff = this.incrementalUpdater.calculateDiff(
      newData,
      (item) => this.getRowKey(item),
      (a, b) => JSON.stringify(a) === JSON.stringify(b)
    )

    // 应用差异
    const changes = this.incrementalUpdater.applyDiff(diff, (item) => this.getRowKey(item))

    if (changes.length > 0) {
      // 更新原始数据
      this.originalData = [...newData]

      // 记录性能数据变更
      this.performanceManager.recordDataChange('update',
        changes.map(c => c.key),
        changes.map(c => c.newData).filter(Boolean) as T[]
      )

      // 刷新数据
      this.refresh()

      // 触发增量更新事件
      this.eventManager.emit('incremental-update', {
        changes,
        diff,
        totalChanges: changes.length
      })
    }
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics() {
    this.performanceManager.updateMetrics(this.originalData.length)
    return {
      performance: this.performanceManager.getMetrics(),
      incremental: this.incrementalUpdater.getStats(),
      lazyLoad: this.lazyLoader?.getCacheStats() || null
    }
  }

  /**
   * 清除性能缓存
   */
  clearPerformanceCache(): void {
    this.performanceManager.clearCache()
    this.incrementalUpdater.clearChangeRecords()
    this.lazyLoader?.clearCache()
  }

  /**
   * 绑定事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  on(event: string, listener: (data: any) => void): void {
    this.eventManager.on(event, listener)
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  off(event: string, listener?: (data: any) => void): void {
    this.eventManager.off(event, listener)
  }

  /**
   * 销毁数据管理器
   */
  destroy(): void {
    this.originalData = []
    this.filteredData = []
    this.sortedData = []
    this.displayData = []
    this.sortState = null
    this.filterState = {}
    this.eventManager.destroy()
  }
}
