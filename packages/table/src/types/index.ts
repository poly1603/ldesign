/**
 * 表格插件核心类型定义
 * 
 * 提供完整的TypeScript类型支持，确保类型安全
 * 支持框架无关的设计，可在Vue、React、Angular中使用
 */

// ==================== 基础类型 ====================

/**
 * 表格数据行类型
 * 支持任意键值对结构的数据
 */
export interface TableRow {
  [key: string]: any
}

/**
 * 表格唯一标识符类型
 */
export type TableId = string | number

/**
 * 表格尺寸类型
 */
export interface TableSize {
  width: number
  height: number
}

/**
 * 表格位置类型
 */
export interface TablePosition {
  x: number
  y: number
}

/**
 * 表格区域类型
 */
export interface TableRect extends TablePosition, TableSize { }

// ==================== 列配置类型 ====================

/**
 * 列对齐方式
 */
export type ColumnAlign = 'left' | 'center' | 'right'

/**
 * 列固定位置
 */
export type ColumnFixed = 'left' | 'right' | false

/**
 * 列排序方向
 */
export type SortDirection = 'asc' | 'desc' | null

/**
 * 列过滤器配置
 */
export interface ColumnFilter {
  text: string
  value: any
}

/**
 * 列排序器函数
 */
export type ColumnSorter<T = TableRow> = (a: T, b: T) => number

/**
 * 列渲染器函数
 */
export type ColumnRenderer<T = TableRow> = (value: any, row: T, index: number) => string | HTMLElement

/**
 * 表格列配置
 */
export interface TableColumn<T = TableRow> {
  /** 列唯一标识 */
  key: string
  /** 列标题 */
  title: string
  /** 列宽度 */
  width?: number
  /** 最小宽度 */
  minWidth?: number
  /** 最大宽度 */
  maxWidth?: number
  /** 是否可调整宽度 */
  resizable?: boolean
  /** 对齐方式 */
  align?: ColumnAlign
  /** 固定位置 */
  fixed?: ColumnFixed
  /** 是否可排序 */
  sortable?: boolean
  /** 排序器函数 */
  sorter?: ColumnSorter<T>
  /** 是否可过滤 */
  filterable?: boolean
  /** 过滤器选项 */
  filters?: ColumnFilter[]
  /** 自定义渲染器 */
  render?: ColumnRenderer<T>
  /** 是否可编辑 */
  editable?: boolean
  /** 编辑器配置 */
  editor?: import('../components/EditableCell').EditorConfig
  /** 格式化函数 */
  formatter?: (value: any) => string
  /** 是否隐藏 */
  hidden?: boolean
  /** 列类名 */
  className?: string
  /** 列样式 */
  style?: Partial<CSSStyleDeclaration>
}

// ==================== 表格配置类型 ====================

/**
 * 虚拟滚动配置
 */
export interface VirtualScrollConfig {
  /** 是否启用虚拟滚动 */
  enabled: boolean
  /** 每行高度 */
  itemHeight: number
  /** 缓冲区大小 */
  bufferSize?: number
  /** 启用虚拟滚动的数据量阈值 */
  threshold?: number
}

/**
 * 选择配置
 */
export interface SelectionConfig<T = TableRow> {
  /** 是否启用选择 */
  enabled: boolean
  /** 是否支持多选 */
  multiple?: boolean
  /** 是否显示复选框列 */
  checkboxColumn?: boolean
  /** 选择变化回调 */
  onSelectionChange?: (selectedRows: T[], selectedKeys: TableId[]) => void
}

/**
 * 展开配置
 */
export interface ExpandConfig<T = TableRow> {
  /** 是否启用展开 */
  enabled: boolean
  /** 展开内容渲染器 */
  render: (row: T, index: number) => string | HTMLElement
  /** 默认展开的行 */
  defaultExpandedRows?: TableId[]
  /** 展开变化回调 */
  onExpandChange?: (expandedRows: TableId[]) => void
}

/**
 * 可编辑配置
 */
export interface EditableConfig<T = TableRow> {
  /** 是否启用编辑 */
  enabled: boolean
  /** 编辑模式 */
  mode?: 'cell' | 'row' | 'inline'
  /** 触发编辑的方式 */
  trigger?: 'click' | 'dblclick' | 'manual'
  /** 编辑完成回调 */
  onEdit?: (data: any) => void
  /** 编辑取消回调 */
  onCancel?: (data: any) => void
}

/**
 * 拖拽排序配置
 */
export interface DragSortConfig<T = TableRow> {
  /** 是否启用拖拽排序 */
  enabled: boolean
  /** 拖拽手柄选择器 */
  handleSelector?: string
  /** 排序变化回调 */
  onSortChange?: (fromIndex: number, toIndex: number, row: T) => void
}

/**
 * 导出配置
 */
export interface ExportConfig<T = TableRow> {
  /** 是否启用导出 */
  enabled: boolean
  /** 支持的导出格式 */
  formats?: Array<'csv' | 'excel' | 'json' | 'xml' | 'html'>
  /** 默认文件名 */
  filename?: string
  /** 导出按钮文本 */
  buttonText?: string
}

/**
 * 分页配置
 */
export interface PaginationConfig<T = TableRow> {
  /** 是否启用分页 */
  enabled: boolean
  /** 分页模式：frontend（前端分页）| backend（后端分页） */
  mode?: 'frontend' | 'backend'
  /** 当前页码（从1开始） */
  current?: number
  /** 每页条数 */
  pageSize?: number
  /** 总条数 */
  total?: number
  /** 是否显示每页条数选择器 */
  showSizeChanger?: boolean
  /** 是否显示快速跳转 */
  showQuickJumper?: boolean
  /** 是否显示总数信息 */
  showTotal?: boolean
  /** 每页条数选项 */
  pageSizeOptions?: number[]
  /** 是否简洁模式 */
  simple?: boolean
  /** 分页容器选择器或元素 */
  container?: string | HTMLElement
  /** 页码变化回调 */
  onChange?: (page: number, pageSize: number) => void
  /** 每页条数变化回调 */
  onShowSizeChange?: (current: number, size: number) => void
}

/**
 * 表格主配置接口
 */
export interface TableConfig<T = TableRow> {
  /** 表格容器 */
  container: string | HTMLElement
  /** 列配置 */
  columns: TableColumn<T>[]
  /** 表格数据 */
  data: T[]
  /** 行唯一标识字段 */
  rowKey?: string
  /** 表格高度 */
  height?: number
  /** 表格最大高度 */
  maxHeight?: number
  /** 是否显示边框 */
  bordered?: boolean
  /** 是否显示斑马纹 */
  striped?: boolean
  /** 是否固定表头 */
  fixedHeader?: boolean
  /** 是否固定脚部 */
  fixedFooter?: boolean
  /** 虚拟滚动配置 */
  virtualScroll?: VirtualScrollConfig
  /** 选择配置 */
  selection?: SelectionConfig<T>
  /** 展开配置 */
  expand?: ExpandConfig<T>
  /** 分页配置 */
  pagination?: PaginationConfig<T>
  /** 可编辑配置 */
  editable?: EditableConfig<T>
  /** 拖拽排序配置 */
  dragSort?: DragSortConfig<T>
  /** 导出配置 */
  export?: ExportConfig<T>
  /** 空数据提示 */
  emptyText?: string
  /** 加载状态 */
  loading?: boolean
  /** 表格类名 */
  className?: string
  /** 表格样式 */
  style?: Partial<CSSStyleDeclaration>
}

// ==================== 事件类型 ====================

/**
 * 表格事件类型
 */
export type TableEventType =
  | 'row-click'
  | 'row-dblclick'
  | 'cell-click'
  | 'cell-dblclick'
  | 'selection-change'
  | 'sort-change'
  | 'filter-change'
  | 'expand-change'
  | 'scroll'
  | 'resize'

/**
 * 表格事件数据
 */
export interface TableEventData<T = TableRow> {
  row?: T
  column?: TableColumn<T>
  rowIndex?: number
  columnIndex?: number
  value?: any
  event?: Event
}

/**
 * 表格事件监听器
 */
export type TableEventListener<T = TableRow> = (data: TableEventData<T>) => void

// ==================== 状态类型 ====================

/**
 * 表格排序状态
 */
export interface TableSortState {
  column: string
  direction: SortDirection
}

/**
 * 表格过滤状态
 */
export interface TableFilterState {
  [column: string]: any[]
}

/**
 * 表格状态
 */
export interface TableState<T = TableRow> {
  /** 原始数据 */
  originalData: T[]
  /** 过滤后的数据 */
  filteredData: T[]
  /** 排序后的数据 */
  sortedData: T[]
  /** 当前显示的数据 */
  displayData: T[]
  /** 选中的行 */
  selectedRows: T[]
  /** 选中的行键 */
  selectedKeys: TableId[]
  /** 展开的行键 */
  expandedKeys: TableId[]
  /** 排序状态 */
  sortState: TableSortState | null
  /** 过滤状态 */
  filterState: TableFilterState
  /** 滚动位置 */
  scrollTop: number
  /** 滚动左侧位置 */
  scrollLeft: number
}

// ==================== 导出所有类型 ====================

export * from './events'
export * from './managers'
