/**
 * 日历组件的核心类型定义
 */

import type { CalendarEvent } from './event'
import type { CalendarPlugin } from './plugin'
import type { CalendarTheme } from './theme'
import type { ViewConfig } from './view'
import type { ContextMenuConfig } from '../core/context-menu-manager'
import type { DragDropConfig } from '../core/drag-drop-manager'
import type { KeyboardConfig } from '../core/keyboard-manager'

/**
 * 日历视图类型
 */
export type CalendarViewType = 'month' | 'week' | 'day'

/**
 * 日历配置选项
 */
export interface CalendarOptions {
  /** 容器元素或选择器 */
  container: string | HTMLElement

  /** 默认视图类型 */
  view?: CalendarViewType

  /** 默认视图类型（向后兼容） */
  defaultView?: CalendarViewType

  /** 初始日期 */
  date?: Date | string

  /** 语言设置 */
  locale?: string

  /** 时区设置 */
  timezone?: string

  /** 一周开始的日期（0-6，0表示周日） */
  weekStartsOn?: number

  /** 时间格式 */
  timeFormat?: '12h' | '24h'

  /** 是否显示农历 */
  showLunar?: boolean

  /** 是否显示节假日 */
  showHolidays?: boolean

  /** 是否启用拖拽 */
  draggable?: boolean

  /** 是否启用调整大小 */
  resizable?: boolean

  /** 是否启用键盘导航 */
  keyboardNavigation?: boolean

  /** 右键菜单配置 */
  contextMenu?: ContextMenuConfig | false

  /** 拖拽配置 */
  dragDrop?: DragDropConfig

  /** 键盘配置 */
  keyboard?: KeyboardConfig

  /** 是否响应式 */
  responsive?: boolean

  /** 主题配置 */
  theme?: string | CalendarTheme

  /** 插件列表 */
  plugins?: CalendarPlugin[]

  /** 视图配置 */
  viewConfig?: Partial<Record<CalendarViewType, ViewConfig>>

  /** 事件配置 */
  eventConfig?: EventConfig

  /** 性能配置 */
  performance?: PerformanceConfig

  /** 自定义类名 */
  className?: string

  /** 自定义样式 */
  style?: Partial<CSSStyleDeclaration>
}

/**
 * 事件配置
 */
export interface EventConfig {
  /** 是否允许重叠 */
  allowOverlap?: boolean

  /** 最大重叠层数 */
  maxOverlapLayers?: number

  /** 事件最小高度（分钟） */
  minEventHeight?: number

  /** 事件默认持续时间（分钟） */
  defaultDuration?: number

  /** 时间间隔（分钟） */
  timeStep?: number

  /** 是否显示时间 */
  showTime?: boolean

  /** 时间格式 */
  timeFormat?: string
}

/**
 * 性能配置
 */
export interface PerformanceConfig {
  /** 是否启用虚拟滚动 */
  virtualScroll?: boolean

  /** 虚拟滚动缓冲区大小 */
  virtualScrollBuffer?: number

  /** 是否启用懒加载 */
  lazyLoad?: boolean

  /** 防抖延迟（毫秒） */
  debounceDelay?: number

  /** 节流延迟（毫秒） */
  throttleDelay?: number

  /** 是否启用内存优化 */
  memoryOptimization?: boolean
}

/**
 * 日历状态
 */
export interface CalendarState {
  /** 当前视图类型 */
  currentView: CalendarViewType

  /** 当前日期 */
  currentDate: Date

  /** 选中的日期 */
  selectedDate: Date | null

  /** 选中的日期范围 */
  selectedRange: DateRange | null

  /** 当前事件列表 */
  events: CalendarEvent[]

  /** 是否正在加载 */
  loading: boolean

  /** 错误信息 */
  error: string | null

  /** 是否处于拖拽状态 */
  dragging: boolean

  /** 当前拖拽的事件 */
  draggingEvent: CalendarEvent | null
}

/**
 * 日期范围
 */
export interface DateRange {
  /** 开始日期 */
  start: Date

  /** 结束日期 */
  end: Date
}

/**
 * 日历事件回调函数类型
 */
export interface CalendarEventCallbacks {
  /** 视图切换事件 */
  onViewChange?: (view: CalendarViewType, date: Date) => void

  /** 日期选择事件 */
  onDateSelect?: (date: Date) => void

  /** 日期范围选择事件 */
  onDateRangeSelect?: (range: DateRange) => void

  /** 事件点击事件 */
  onEventClick?: (event: CalendarEvent) => void

  /** 事件双击事件 */
  onEventDoubleClick?: (event: CalendarEvent) => void

  /** 事件创建事件 */
  onEventCreate?: (event: Partial<CalendarEvent>) => void

  /** 事件更新事件 */
  onEventUpdate?: (event: CalendarEvent) => void

  /** 事件删除事件 */
  onEventDelete?: (eventId: string) => void

  /** 事件拖拽开始事件 */
  onEventDragStart?: (event: CalendarEvent) => void

  /** 事件拖拽中事件 */
  onEventDrag?: (event: CalendarEvent, newDate: Date) => void

  /** 事件拖拽结束事件 */
  onEventDragEnd?: (event: CalendarEvent, newDate: Date) => void

  /** 加载状态变化事件 */
  onLoadingChange?: (loading: boolean) => void

  /** 错误事件 */
  onError?: (error: Error) => void
}

/**
 * 完整的日历配置（包含回调函数）
 */
export interface CalendarConfig extends CalendarOptions, CalendarEventCallbacks { }

/**
 * 日历实例接口
 */
export interface ICalendar {
  /** 获取当前配置 */
  getConfig(): CalendarConfig

  /** 更新配置 */
  updateConfig(config: Partial<CalendarConfig>): void

  /** 获取当前状态 */
  getState(): CalendarState

  /** 切换视图 */
  switchView(view: CalendarViewType): void

  /** 跳转到指定日期 */
  goToDate(date: Date | string): void

  /** 跳转到今天 */
  goToToday(): void

  /** 上一页 */
  prev(): void

  /** 下一页 */
  next(): void

  /** 添加事件 */
  addEvent(event: Partial<CalendarEvent>): string

  /** 更新事件 */
  updateEvent(eventId: string, updates: Partial<CalendarEvent>): void

  /** 删除事件 */
  removeEvent(eventId: string): void

  /** 获取事件 */
  getEvent(eventId: string): CalendarEvent | null

  /** 获取所有事件 */
  getEvents(): CalendarEvent[]

  /** 获取指定日期范围的事件 */
  getEventsInRange(start: Date, end: Date): CalendarEvent[]

  /** 刷新日历 */
  refresh(): void

  /** 销毁日历实例 */
  destroy(): void
}
