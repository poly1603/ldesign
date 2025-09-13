/**
 * @ldesign/table - 功能完整的表格插件
 *
 * 主入口文件，导出所有公共API
 * 支持框架无关的设计，可在Vue、React、Angular中使用
 *
 * @author LDesign Team
 * @license MIT
 */

// ==================== 样式导入 ====================

import './styles/index.less'

// ==================== 核心类导出 ====================

export { Table } from './core/Table'
export { BaseTable } from './core/BaseTable'

// ==================== 管理器导出 ====================

export { EventManager } from './managers/EventManager'
export { DataManager } from './managers/DataManager'
export { SelectionManager } from './managers/SelectionManager'
export { ExpandManager } from './managers/ExpandManager'
export { VirtualScrollManager } from './managers/VirtualScrollManager'
export { RenderManager } from './managers/RenderManager'
export { PaginationManager } from './managers/PaginationManager'

// ==================== 组件导出 ====================

export {
  Pagination,
  SortIndicator,
  FilterDropdown
} from './components'

// ==================== 适配器导出 ====================

export { BaseAdapter } from './adapters/BaseAdapter'
export { VueAdapter } from './adapters/VueAdapter'
export { ReactAdapter } from './adapters/ReactAdapter'
export { AngularAdapter } from './adapters/AngularAdapter'

// ==================== 工具函数导出 ====================

export * from './utils'

// ==================== 类型定义导出 ====================

export type {
  // 基础类型
  TableRow,
  TableId,
  TableSize,
  TablePosition,
  TableRect,

  // 列配置类型
  ColumnAlign,
  ColumnFixed,
  SortDirection,
  ColumnFilter,
  ColumnSorter,
  ColumnRenderer,
  TableColumn,

  // 表格配置类型
  VirtualScrollConfig,
  SelectionConfig,
  ExpandConfig,
  PaginationConfig,
  TableConfig,

  // 事件类型
  TableEventType,
  TableEventData,
  TableEventListener,

  // 状态类型
  TableSortState,
  TableFilterState,
  TableState
} from './types'

export type {
  // 事件相关类型
  EventListener,
  EventListenerConfig,
  IEventManager,
  RowClickEventData,
  CellClickEventData,
  SelectionChangeEventData,
  SortChangeEventData,
  FilterChangeEventData,
  ExpandChangeEventData,
  ScrollEventData,
  ResizeEventData,
  ColumnResizeEventData,
  TableEventMap,
  TableEventName,
  GetEventData,
  TableEventHandlers,
  EventHandlerConfig
} from './types/events'

export type {
  // 管理器接口类型
  IDataManager,
  ISelectionManager,
  IExpandManager,
  IVirtualScrollManager,
  IRenderManager,
  VirtualScrollItem,
  VirtualScrollRange,
  RenderContext
} from './types/managers'

// ==================== 常量导出 ====================

/**
 * 表格插件版本号
 */
export const VERSION = '1.0.0'

/**
 * 表格插件名称
 */
export const PLUGIN_NAME = '@ldesign/table'

/**
 * 默认配置常量
 */
export const DEFAULT_CONFIG = {
  /** 默认行高 */
  ROW_HEIGHT: 40,
  /** 默认表头高度 */
  HEADER_HEIGHT: 40,
  /** 默认列宽 */
  COLUMN_WIDTH: 100,
  /** 最小列宽 */
  MIN_COLUMN_WIDTH: 50,
  /** 虚拟滚动缓冲区大小 */
  VIRTUAL_BUFFER_SIZE: 10,
  /** 虚拟滚动阈值 */
  VIRTUAL_THRESHOLD: 100,
  /** 默认空数据提示 */
  EMPTY_TEXT: '暂无数据'
} as const

/**
 * CSS类名常量
 */
export const CSS_CLASSES = {
  /** 表格容器 */
  TABLE: 'ldesign-table',
  /** 表格包装器 */
  WRAPPER: 'ldesign-table-wrapper',
  /** 表头 */
  HEADER: 'ldesign-table-header',
  /** 表体 */
  BODY: 'ldesign-table-body',
  /** 表脚 */
  FOOTER: 'ldesign-table-footer',
  /** 行 */
  ROW: 'ldesign-table-row',
  /** 单元格 */
  CELL: 'ldesign-table-cell',
  /** 固定列 */
  FIXED: 'ldesign-table-fixed',
  /** 左固定 */
  FIXED_LEFT: 'ldesign-table-fixed-left',
  /** 右固定 */
  FIXED_RIGHT: 'ldesign-table-fixed-right',
  /** 选中行 */
  SELECTED: 'ldesign-table-selected',
  /** 展开行 */
  EXPANDED: 'ldesign-table-expanded',
  /** 排序列 */
  SORTED: 'ldesign-table-sorted',
  /** 过滤列 */
  FILTERED: 'ldesign-table-filtered',
  /** 加载状态 */
  LOADING: 'ldesign-table-loading',
  /** 空数据 */
  EMPTY: 'ldesign-table-empty'
} as const

// ==================== 默认导出 ====================

export { Table as default } from './core/Table'
