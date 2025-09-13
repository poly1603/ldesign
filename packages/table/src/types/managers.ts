/**
 * 表格管理器类型定义
 * 
 * 定义数据管理器、渲染管理器等核心管理器的接口
 * 确保各个管理器之间的类型一致性
 */

import type {
  TableRow,
  TableColumn,
  TableId,
  TableState,
  TableSortState,
  TableFilterState,
  SortDirection
} from './index'

// ==================== 数据管理器接口 ====================

/**
 * 数据管理器接口
 * 负责表格数据的管理、过滤、排序等操作
 */
export interface IDataManager<T = TableRow> {
  /**
   * 设置原始数据
   * @param data 原始数据数组
   */
  setData(data: T[]): void

  /**
   * 获取原始数据
   */
  getData(): T[]

  /**
   * 获取过滤后的数据
   */
  getFilteredData(): T[]

  /**
   * 获取排序后的数据
   */
  getSortedData(): T[]

  /**
   * 获取当前显示的数据
   */
  getDisplayData(): T[]

  /**
   * 根据行键获取行数据
   * @param key 行键
   */
  getRowByKey(key: TableId): T | undefined

  /**
   * 根据行数据获取行键
   * @param row 行数据
   */
  getRowKey(row: T): TableId

  /**
   * 设置排序
   * @param column 列键
   * @param direction 排序方向
   * @param sorter 排序函数
   */
  setSort(column: string, direction: SortDirection, sorter?: (a: T, b: T) => number): void

  /**
   * 清除排序
   */
  clearSort(): void

  /**
   * 设置过滤
   * @param column 列键
   * @param filters 过滤值数组
   */
  setFilter(column: string, filters: any[]): void

  /**
   * 清除过滤
   * @param column 列键，不传则清除所有过滤
   */
  clearFilter(column?: string): void

  /**
   * 获取排序状态
   */
  getSortState(): TableSortState | null

  /**
   * 获取过滤状态
   */
  getFilterState(): TableFilterState

  /**
   * 刷新数据（重新应用过滤和排序）
   */
  refresh(): void

  /**
   * 销毁管理器
   */
  destroy(): void
}

// ==================== 选择管理器接口 ====================

/**
 * 选择管理器接口
 * 负责表格行选择状态的管理
 */
export interface ISelectionManager<T = TableRow> {
  /**
   * 选择行
   * @param keys 行键数组
   * @param replace 是否替换当前选择
   */
  selectRows(keys: TableId[], replace?: boolean): void

  /**
   * 取消选择行
   * @param keys 行键数组
   */
  deselectRows(keys: TableId[]): void

  /**
   * 切换行选择状态
   * @param keys 行键数组
   */
  toggleRows(keys: TableId[]): void

  /**
   * 选择所有行
   * @param allKeys 所有行键数组
   */
  selectAll(allKeys: TableId[]): void

  /**
   * 清除所有选择
   */
  clearSelection(): void

  /**
   * 获取选中的行键
   */
  getSelectedKeys(): TableId[]

  /**
   * 获取选中的行数据
   */
  getSelectedRows(): T[]

  /**
   * 检查行是否被选中
   * @param key 行键
   */
  isRowSelected(key: TableId): boolean

  /**
   * 检查是否全选
   * @param allKeys 所有行键数组
   */
  isAllSelected(allKeys: TableId[]): boolean

  /**
   * 检查是否部分选择
   * @param allKeys 所有行键数组
   */
  isIndeterminate(allKeys: TableId[]): boolean

  /**
   * 销毁管理器
   */
  destroy(): void
}

// ==================== 展开管理器接口 ====================

/**
 * 展开管理器接口
 * 负责表格行展开状态的管理
 */
export interface IExpandManager<T = TableRow> {
  /**
   * 展开行
   * @param keys 行键数组
   */
  expandRows(keys: TableId[]): void

  /**
   * 折叠行
   * @param keys 行键数组
   */
  collapseRows(keys: TableId[]): void

  /**
   * 切换行展开状态
   * @param keys 行键数组
   */
  toggleRows(keys: TableId[]): void

  /**
   * 展开所有行
   * @param allKeys 所有行键数组
   */
  expandAll(allKeys: TableId[]): void

  /**
   * 折叠所有行
   */
  collapseAll(): void

  /**
   * 获取展开的行键
   */
  getExpandedKeys(): TableId[]

  /**
   * 检查行是否展开
   * @param key 行键
   */
  isRowExpanded(key: TableId): boolean

  /**
   * 销毁管理器
   */
  destroy(): void
}

// ==================== 虚拟滚动管理器接口 ====================

/**
 * 虚拟滚动项信息
 */
export interface VirtualScrollItem {
  /** 项索引 */
  index: number
  /** 项高度 */
  height: number
  /** 项顶部位置 */
  top: number
  /** 项底部位置 */
  bottom: number
}

/**
 * 虚拟滚动范围
 */
export interface VirtualScrollRange {
  /** 开始索引 */
  start: number
  /** 结束索引 */
  end: number
  /** 可见项数量 */
  visibleCount: number
  /** 总高度 */
  totalHeight: number
  /** 偏移量 */
  offsetY: number
}

/**
 * 虚拟滚动管理器接口
 * 负责虚拟滚动的计算和管理
 */
export interface IVirtualScrollManager {
  /**
   * 设置容器高度
   * @param height 容器高度
   */
  setContainerHeight(height: number): void

  /**
   * 设置项高度
   * @param height 项高度
   */
  setItemHeight(height: number): void

  /**
   * 设置数据总数
   * @param count 数据总数
   */
  setItemCount(count: number): void

  /**
   * 设置滚动位置
   * @param scrollTop 滚动位置
   */
  setScrollTop(scrollTop: number): void

  /**
   * 获取可见范围
   */
  getVisibleRange(): VirtualScrollRange

  /**
   * 获取项信息
   * @param index 项索引
   */
  getItemInfo(index: number): VirtualScrollItem

  /**
   * 获取总高度
   */
  getTotalHeight(): number

  /**
   * 是否启用虚拟滚动
   */
  isEnabled(): boolean

  /**
   * 启用虚拟滚动
   */
  enable(): void

  /**
   * 禁用虚拟滚动
   */
  disable(): void

  /**
   * 更新滚动位置
   * @param scrollTop 滚动位置
   */
  updateScrollPosition(scrollTop: number): void

  /**
   * 销毁管理器
   */
  destroy(): void
}

// ==================== 渲染管理器接口 ====================

/**
 * 渲染上下文
 */
export interface RenderContext<T = TableRow> {
  /** 表格数据 */
  data: T[]
  /** 表格列配置 */
  columns: TableColumn<T>[]
  /** 表格状态 */
  state: TableState<T>
  /** 虚拟滚动范围 */
  virtualRange: VirtualScrollRange | undefined
}

/**
 * 渲染管理器接口
 * 负责表格的DOM渲染和更新
 */
export interface IRenderManager<T = TableRow> {
  /**
   * 渲染表格
   * @param context 渲染上下文
   */
  render(context: RenderContext<T>): void

  /**
   * 更新表格数据
   * @param data 新数据
   */
  updateData(data: T[]): void

  /**
   * 更新表格列
   * @param columns 新列配置
   */
  updateColumns(columns: TableColumn<T>[]): void

  /**
   * 更新选择状态
   * @param selectedKeys 选中的行键
   */
  updateSelection(selectedKeys: TableId[]): void

  /**
   * 更新展开状态
   * @param expandedKeys 展开的行键
   */
  updateExpansion(expandedKeys: TableId[]): void

  /**
   * 更新排序状态
   * @param sortState 排序状态
   */
  updateSort(sortState: TableSortState | null): void

  /**
   * 更新过滤状态
   * @param filterState 过滤状态
   */
  updateFilter(filterState: TableFilterState): void

  /**
   * 更新滚动位置
   * @param scrollTop 垂直滚动位置
   * @param scrollLeft 水平滚动位置
   */
  updateScroll(scrollTop: number, scrollLeft: number): void

  /**
   * 销毁渲染器
   */
  destroy(): void
}
