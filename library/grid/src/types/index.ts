import type { GridStack as GridStackNative, GridStackWidget, GridStackNode, GridStackOptions as GridStackNativeOptions } from 'gridstack'

/**
 * 网格项配置
 */
export interface GridItemOptions extends Omit<GridStackWidget, 'id' | 'content'> {
  /** 唯一标识符 */
  id?: string | number
  /** X坐标 (列位置) */
  x?: number
  /** Y坐标 (行位置) */
  y?: number
  /** 宽度 (占据列数) */
  w?: number
  /** 高度 (占据行数) */
  h?: number
  /** 最小宽度 */
  minW?: number
  /** 最大宽度 */
  maxW?: number
  /** 最小高度 */
  minH?: number
  /** 最大高度 */
  maxH?: number
  /** 是否可以移动 */
  noMove?: boolean
  /** 是否可以调整大小 */
  noResize?: boolean
  /** 是否锁定 */
  locked?: boolean
  /** 自动定位 */
  autoPosition?: boolean
  /** 内容（HTML字符串或元素） */
  content?: string | HTMLElement
  /** 自定义数据 */
  [key: string]: any
}

/**
 * 网格配置选项
 */
export interface GridStackOptions extends Partial<GridStackNativeOptions> {
  /** 列数 */
  column?: number
  /** 单元格高度 (px 或 'auto') */
  cellHeight?: number | string
  /** 最小行数 */
  minRow?: number
  /** 最大行数 */
  maxRow?: number
  /** 是否启用动画 */
  animate?: boolean
  /** 动画速度 (ms) */
  animationSpeed?: number
  /** 是否自动调整 */
  auto?: boolean
  /** 是否禁用一列模式 */
  disableOneColumnMode?: boolean
  /** 是否禁用拖拽 */
  disableDrag?: boolean
  /** 是否禁用调整大小 */
  disableResize?: boolean
  /** 拖拽句柄选择器 */
  handle?: string
  /** 拖拽句柄类名 */
  handleClass?: string
  /** 是否浮动布局 */
  float?: boolean
  /** 垂直间距 */
  verticalMargin?: number | string
  /** 水平间距 */
  margin?: number | string
  /** 边距单位 */
  marginUnit?: string
  /** 是否静态网格（不可交互） */
  staticGrid?: boolean
  /** 接受的拖拽元素选择器 */
  acceptWidgets?: boolean | string | ((element: Element) => boolean)
  /** 是否移除超时 */
  removable?: boolean | string
  /** 移除提示文本 */
  removeTimeout?: number
  /** 拖拽占位符类名 */
  placeholderClass?: string
  /** 拖拽占位符文本 */
  placeholderText?: string
  /** 拖拽时的类名 */
  draggable?: {
    handle?: string
    appendTo?: string
    scroll?: boolean
    containment?: string
  }
  /** 调整大小时的类名 */
  resizable?: {
    handles?: string
    autoHide?: boolean
  }
  /** 响应式断点 */
  oneColumnSize?: number
  /** 列宽度 (px) */
  columnWidth?: number
  /** 子网格选项 */
  subGridOpts?: GridStackOptions
  /** RTL 支持 */
  rtl?: boolean
  /** 样式选项 */
  styleInHead?: boolean
}

/**
 * 网格事件类型
 */
export interface GridStackEvents {
  /** 添加事件 */
  added: (event: Event, items: GridStackNode[]) => void
  /** 变化事件 */
  change: (event: Event, items: GridStackNode[]) => void
  /** 禁用事件 */
  disable: (event: Event) => void
  /** 拖拽事件 */
  drag: (event: Event, element: GridStackNode) => void
  /** 拖拽开始 */
  dragstart: (event: Event, element: GridStackNode) => void
  /** 拖拽停止 */
  dragstop: (event: Event, element: GridStackNode) => void
  /** 投放事件 */
  dropped: (event: Event, previousNode: GridStackNode, newNode: GridStackNode) => void
  /** 启用事件 */
  enable: (event: Event) => void
  /** 移除事件 */
  removed: (event: Event, items: GridStackNode[]) => void
  /** 调整大小事件 */
  resize: (event: Event, element: GridStackNode) => void
  /** 调整大小开始 */
  resizestart: (event: Event, element: GridStackNode) => void
  /** 调整大小停止 */
  resizestop: (event: Event, element: GridStackNode) => void
}

/**
 * 事件名称类型
 */
export type GridStackEventName = keyof GridStackEvents

/**
 * 事件处理器类型
 */
export type GridStackEventHandler<T extends GridStackEventName = GridStackEventName> = GridStackEvents[T]

/**
 * 序列化后的网格数据
 */
export interface SerializedGrid {
  /** 网格项数组 */
  widgets: GridItemOptions[]
  /** 网格配置 */
  options?: GridStackOptions
}

/**
 * 网格实例接口
 */
export interface IGridStackInstance {
  /** 原生 GridStack 实例 */
  readonly instance: GridStackNative | null
  /** 网格容器元素 */
  readonly el: HTMLElement | null
  /** 添加网格项 */
  addWidget: (options: GridItemOptions) => HTMLElement | undefined
  /** 批量添加网格项 */
  addWidgets: (items: GridItemOptions[]) => HTMLElement[]
  /** 移除网格项 */
  removeWidget: (el: HTMLElement | string, removeDOM?: boolean) => void
  /** 移除所有网格项 */
  removeAll: (removeDOM?: boolean) => void
  /** 更新网格项 */
  update: (el: HTMLElement, options: Partial<GridItemOptions>) => void
  /** 启用拖拽和调整大小 */
  enable: () => void
  /** 禁用拖拽和调整大小 */
  disable: () => void
  /** 锁定网格项 */
  lock: (el: HTMLElement) => void
  /** 解锁网格项 */
  unlock: (el: HTMLElement) => void
  /** 设置静态模式 */
  setStatic: (staticValue: boolean) => void
  /** 设置动画 */
  setAnimation: (animate: boolean) => void
  /** 设置列数 */
  column: (column: number, layout?: 'moveScale' | 'move' | 'scale' | 'none') => void
  /** 获取列数 */
  getColumn: () => number
  /** 获取单元格高度 */
  getCellHeight: () => number
  /** 设置单元格高度 */
  cellHeight: (val: number, update?: boolean) => void
  /** 批量更新 */
  batchUpdate: (flag?: boolean) => void
  /** 紧凑布局 */
  compact: () => void
  /** 浮��模式 */
  float: (val: boolean) => void
  /** 获取网格数据 */
  save: (saveContent?: boolean) => GridItemOptions[]
  /** 加载网格数据 */
  load: (items: GridItemOptions[], addAndRemove?: boolean) => void
  /** 监听事件 */
  on: <T extends GridStackEventName>(event: T, callback: GridStackEventHandler<T>) => void
  /** 取消监听事件 */
  off: <T extends GridStackEventName>(event: T) => void
  /** 销毁实例 */
  destroy: (removeDOM?: boolean) => void
  /** 使网格项适合容器 */
  cellWidth: () => number
  /** 获取所有网格项 */
  getGridItems: () => HTMLElement[]
  /** 创建子网格 */
  makeSubGrid: (el: HTMLElement, options?: GridStackOptions) => GridStackNative
  /** 将元素转换为子网格 */
  makeWidget: (el: HTMLElement | string) => HTMLElement
  /** 调整布局 */
  margin: (value: number | string) => void
  /** 交换两个网格项 */
  swap: (a: HTMLElement, b: HTMLElement) => void
}

/**
 * 工具函数类型
 */
export interface GridStackUtils {
  /** 解析网格项选项 */
  parseOptions: (options: any) => GridItemOptions
  /** 获取元素的网格节点 */
  getElement: (el: HTMLElement | string) => HTMLElement | null
  /** 生成唯一 ID */
  generateId: () => string
  /** 克隆对象 */
  clone: <T>(obj: T) => T
}

/**
 * 导出 GridStack 原生类型
 */
export type { GridStackNative, GridStackWidget, GridStackNode }
