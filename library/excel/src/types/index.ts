/**
 * Excel编辑器的核心类型定义
 */

/**
 * 单元格数据类型
 */
export type CellValueType = string | number | boolean | Date | null | undefined

/**
 * 单元格对象接口
 */
export interface Cell {
  /** 单元格值 */
  value: CellValueType
  /** 单元格公式 */
  formula?: string
  /** 单元格样式 */
  style?: CellStyle
  /** 单元格类型 */
  type?: 'text' | 'number' | 'boolean' | 'date' | 'formula'
  /** 是否只读 */
  readonly?: boolean
  /** 单元格注释 */
  comment?: string
}

/**
 * 单元格样式接口
 */
export interface CellStyle {
  /** 字体大小 */
  fontSize?: number
  /** 字体颜色 */
  fontColor?: string
  /** 背景颜色 */
  backgroundColor?: string
  /** 字体粗细 */
  fontWeight?: 'normal' | 'bold'
  /** 字体样式 */
  fontStyle?: 'normal' | 'italic'
  /** 文本对齐 */
  textAlign?: 'left' | 'center' | 'right'
  /** 垂直对齐 */
  verticalAlign?: 'top' | 'middle' | 'bottom'
  /** 边框样式 */
  border?: BorderStyle
  /** 文本装饰 */
  textDecoration?: 'none' | 'underline' | 'line-through'
}

/**
 * 边框样式接口
 */
export interface BorderStyle {
  /** 上边框 */
  top?: string
  /** 右边框 */
  right?: string
  /** 下边框 */
  bottom?: string
  /** 左边框 */
  left?: string
}

/**
 * 工作表接口
 */
export interface Worksheet {
  /** 工作表名称 */
  name: string
  /** 单元格数据 */
  cells: Record<string, Cell>
  /** 行数 */
  rowCount: number
  /** 列数 */
  columnCount: number
  /** 冻结行数 */
  frozenRows?: number
  /** 冻结列数 */
  frozenColumns?: number
  /** 是否隐藏 */
  hidden?: boolean
}

/**
 * 工作簿接口
 */
export interface Workbook {
  /** 工作表列表 */
  worksheets: Worksheet[]
  /** 当前活动工作表索引 */
  activeSheetIndex: number
  /** 工作簿属性 */
  properties?: WorkbookProperties
}

/**
 * 工作簿属性接口
 */
export interface WorkbookProperties {
  /** 标题 */
  title?: string
  /** 作者 */
  author?: string
  /** 创建时间 */
  created?: Date
  /** 修改时间 */
  modified?: Date
  /** 描述 */
  description?: string
}

/**
 * Excel编辑器配置接口
 */
export interface ExcelEditorOptions {
  /** 容器元素 */
  container: HTMLElement | string
  /** 初始数据 */
  data?: Workbook
  /** 是否只读模式 */
  readonly?: boolean
  /** 主题 */
  theme?: 'light' | 'dark'
  /** 是否显示网格线 */
  showGridlines?: boolean
  /** 是否显示行号 */
  showRowNumbers?: boolean
  /** 是否显示列标题 */
  showColumnHeaders?: boolean
  /** 是否启用公式计算 */
  enableFormulas?: boolean
  /** 是否启用撤销重做 */
  enableUndo?: boolean
  /** 最大撤销步数 */
  maxUndoSteps?: number
  /** 虚拟滚动配置 */
  virtualScroll?: VirtualScrollOptions
}

/**
 * 虚拟滚动配置接口
 */
export interface VirtualScrollOptions {
  /** 是否启用虚拟滚动 */
  enabled?: boolean
  /** 行高 */
  rowHeight?: number
  /** 列宽 */
  columnWidth?: number
  /** 缓冲区大小 */
  bufferSize?: number
}

/**
 * 单元格位置接口
 */
export interface CellPosition {
  /** 行索引 */
  row: number
  /** 列索引 */
  column: number
}

/**
 * 单元格范围接口
 */
export interface CellRange {
  /** 起始位置 */
  start: CellPosition
  /** 结束位置 */
  end: CellPosition
}

/**
 * 事件类型定义
 */
export type ExcelEventType = 
  | 'cellChange'
  | 'cellSelect'
  | 'worksheetChange'
  | 'beforeEdit'
  | 'afterEdit'
  | 'beforeSave'
  | 'afterSave'
  | 'error'

/**
 * 事件数据接口
 */
export interface ExcelEventData {
  /** 事件类型 */
  type: ExcelEventType
  /** 相关单元格位置 */
  position?: CellPosition
  /** 相关单元格范围 */
  range?: CellRange
  /** 旧值 */
  oldValue?: CellValueType
  /** 新值 */
  newValue?: CellValueType
  /** 工作表索引 */
  worksheetIndex?: number
  /** 错误信息 */
  error?: Error
}

/**
 * 事件监听器类型
 */
export type ExcelEventListener = (data: ExcelEventData) => void
