/**
 * 表格事件系统类型定义
 * 
 * 定义完整的事件管理器接口和事件类型
 * 支持类型安全的事件监听和触发
 */

import type { TableRow, TableColumn, TableId } from './index'

// ==================== 事件管理器接口 ====================

/**
 * 事件监听器函数类型
 */
export type EventListener<T = any> = (data: T) => void

/**
 * 事件监听器配置
 */
export interface EventListenerConfig {
  /** 是否只执行一次 */
  once?: boolean
  /** 监听器优先级 */
  priority?: number
}

/**
 * 事件管理器接口
 */
export interface IEventManager {
  /**
   * 添加事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   * @param config 监听器配置
   */
  on<T = any>(event: string, listener: EventListener<T>, config?: EventListenerConfig): void

  /**
   * 添加一次性事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  once<T = any>(event: string, listener: EventListener<T>): void

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  off<T = any>(event: string, listener?: EventListener<T>): void

  /**
   * 触发事件
   * @param event 事件名称
   * @param data 事件数据
   */
  emit<T = any>(event: string, data?: T): void

  /**
   * 清除所有事件监听器
   */
  clear(): void

  /**
   * 获取事件监听器数量
   * @param event 事件名称
   */
  listenerCount(event: string): number

  /**
   * 获取所有事件名称
   */
  eventNames(): string[]

  /**
   * 销毁事件管理器
   */
  destroy(): void
}

// ==================== 表格事件数据类型 ====================

/**
 * 行点击事件数据
 */
export interface RowClickEventData<T = TableRow> {
  row: T
  rowIndex: number
  rowKey: TableId
  event: MouseEvent
}

/**
 * 单元格点击事件数据
 */
export interface CellClickEventData<T = TableRow> {
  row: T
  column: TableColumn<T>
  rowIndex: number
  columnIndex: number
  value: any
  event: MouseEvent
}

/**
 * 选择变化事件数据
 */
export interface SelectionChangeEventData<T = TableRow> {
  selectedRows: T[]
  selectedKeys: TableId[]
  changedRows: T[]
  changedKeys: TableId[]
}

/**
 * 排序变化事件数据
 */
export interface SortChangeEventData {
  column: string
  direction: 'asc' | 'desc' | null
  sorter?: (a: any, b: any) => number
}

/**
 * 过滤变化事件数据
 */
export interface FilterChangeEventData {
  column: string
  filters: any[]
  filteredData: TableRow[]
}

/**
 * 展开变化事件数据
 */
export interface ExpandChangeEventData<T = TableRow> {
  row: T
  rowKey: TableId
  expanded: boolean
  expandedKeys: TableId[]
}

/**
 * 滚动事件数据
 */
export interface ScrollEventData {
  scrollTop: number
  scrollLeft: number
  scrollHeight: number
  scrollWidth: number
  clientHeight: number
  clientWidth: number
  event: Event
}

/**
 * 调整大小事件数据
 */
export interface ResizeEventData {
  width: number
  height: number
  oldWidth: number
  oldHeight: number
}

/**
 * 列宽调整事件数据
 */
export interface ColumnResizeEventData {
  column: string
  width: number
  oldWidth: number
}

// ==================== 表格事件映射 ====================

/**
 * 表格事件映射接口
 * 定义所有支持的事件类型及其对应的数据类型
 */
export interface TableEventMap<T = TableRow> {
  'row-click': RowClickEventData<T>
  'row-dblclick': RowClickEventData<T>
  'cell-click': CellClickEventData<T>
  'cell-dblclick': CellClickEventData<T>
  'selection-change': SelectionChangeEventData<T>
  'sort-change': SortChangeEventData
  'filter-change': FilterChangeEventData
  'expand-change': ExpandChangeEventData<T>
  'scroll': ScrollEventData
  'resize': ResizeEventData
  'column-resize': ColumnResizeEventData
  'data-change': { data: T[] }
  'loading-change': { loading: boolean }
  'error': { error: Error; message: string }
}

/**
 * 表格事件名称类型
 */
export type TableEventName = keyof TableEventMap

/**
 * 获取事件数据类型的工具类型
 */
export type GetEventData<K extends TableEventName> = TableEventMap[K]

// ==================== 事件处理器类型 ====================

/**
 * 表格事件处理器映射
 */
export type TableEventHandlers<T = TableRow> = {
  [K in keyof TableEventMap<T>]?: EventListener<TableEventMap<T>[K]>
}

/**
 * 事件处理器配置
 */
export interface EventHandlerConfig<T = TableRow> {
  /** 行点击处理器 */
  onRowClick?: EventListener<RowClickEventData<T>>
  /** 行双击处理器 */
  onRowDblClick?: EventListener<RowClickEventData<T>>
  /** 单元格点击处理器 */
  onCellClick?: EventListener<CellClickEventData<T>>
  /** 单元格双击处理器 */
  onCellDblClick?: EventListener<CellClickEventData<T>>
  /** 选择变化处理器 */
  onSelectionChange?: EventListener<SelectionChangeEventData<T>>
  /** 排序变化处理器 */
  onSortChange?: EventListener<SortChangeEventData>
  /** 过滤变化处理器 */
  onFilterChange?: EventListener<FilterChangeEventData>
  /** 展开变化处理器 */
  onExpandChange?: EventListener<ExpandChangeEventData<T>>
  /** 滚动处理器 */
  onScroll?: EventListener<ScrollEventData>
  /** 调整大小处理器 */
  onResize?: EventListener<ResizeEventData>
  /** 列宽调整处理器 */
  onColumnResize?: EventListener<ColumnResizeEventData>
  /** 数据变化处理器 */
  onDataChange?: EventListener<{ data: T[] }>
  /** 加载状态变化处理器 */
  onLoadingChange?: EventListener<{ loading: boolean }>
  /** 错误处理器 */
  onError?: EventListener<{ error: Error; message: string }>
}
