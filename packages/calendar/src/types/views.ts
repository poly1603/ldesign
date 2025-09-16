/**
 * 视图相关类型定义
 */

import type { Dayjs } from 'dayjs'
import type { CalendarEvent, LunarInfo, HolidayInfo } from './index'

/**
 * 视图类型
 */
export type ViewType = 'month' | 'week' | 'day' | 'year' | 'agenda' | 'timeline'

/**
 * 视图模式
 */
export type ViewMode = 'read' | 'edit' | 'select'

/**
 * 日期单元格数据
 */
export interface DateCell {
  /** 日期 */
  date: Dayjs
  /** 是否当前月 */
  isCurrentMonth: boolean
  /** 是否今天 */
  isToday: boolean
  /** 是否选中 */
  isSelected: boolean
  /** 是否禁用 */
  isDisabled: boolean
  /** 是否周末 */
  isWeekend: boolean
  /** 是否节假日 */
  isHoliday: boolean
  /** 是否工作日 */
  isWorkday: boolean
  /** 农历信息 */
  lunar?: LunarInfo
  /** 节假日信息 */
  holiday?: HolidayInfo
  /** 当日事件 */
  events: CalendarEvent[]
  /** 自定义CSS类 */
  className?: string
  /** 自定义数据 */
  data?: Record<string, any>
}

/**
 * 时间单元格数据
 */
export interface TimeCell {
  /** 日期时间 */
  datetime: Dayjs
  /** 小时 */
  hour: number
  /** 分钟 */
  minute: number
  /** 是否当前时间 */
  isCurrent: boolean
  /** 是否工作时间 */
  isWorkingTime: boolean
  /** 是否可用 */
  isAvailable: boolean
  /** 时间段事件 */
  events: CalendarEvent[]
  /** 自定义CSS类 */
  className?: string
  /** 自定义数据 */
  data?: Record<string, any>
}

/**
 * 视图配置
 */
export interface ViewConfig {
  /** 视图类型 */
  type: ViewType
  /** 视图标题 */
  title?: string
  /** 是否显示头部 */
  showHeader?: boolean
  /** 是否显示导航 */
  showNavigation?: boolean
  /** 是否显示工具栏 */
  showToolbar?: boolean
  /** 是否显示时间轴 */
  showTimeAxis?: boolean
  /** 是否显示全天事件区域 */
  showAllDayArea?: boolean
  /** 是否显示周末 */
  showWeekends?: boolean
  /** 是否显示周数 */
  showWeekNumbers?: boolean
  /** 是否显示农历 */
  showLunar?: boolean
  /** 是否显示节假日 */
  showHolidays?: boolean
  /** 时间格式 */
  timeFormat?: '12h' | '24h'
  /** 日期格式 */
  dateFormat?: string
  /** 每周起始日 */
  firstDayOfWeek?: number
  /** 工作时间 */
  workingHours?: {
    start: number
    end: number
  }
  /** 时间间隔（分钟） */
  timeInterval?: number
  /** 最小时间间隔（分钟） */
  minTimeInterval?: number
  /** 最大时间间隔（分钟） */
  maxTimeInterval?: number
  /** 自定义CSS类 */
  className?: string
  /** 自定义样式 */
  style?: Partial<CSSStyleDeclaration>
}

/**
 * 月视图配置
 */
export interface MonthViewConfig extends ViewConfig {
  /** 显示的周数 */
  weekCount?: number
  /** 是否固定周数 */
  fixedWeekCount?: boolean
  /** 是否显示其他月份的日期 */
  showOtherMonths?: boolean
  /** 日期单元格高度 */
  cellHeight?: number
  /** 最大事件显示数量 */
  maxEventsPerDay?: number
}

/**
 * 周视图配置
 */
export interface WeekViewConfig extends ViewConfig {
  /** 是否显示时间刻度 */
  showTimeScale?: boolean
  /** 时间刻度间隔（分钟） */
  timeScaleInterval?: number
  /** 是否显示当前时间线 */
  showCurrentTimeLine?: boolean
  /** 事件最小高度 */
  eventMinHeight?: number
  /** 事件重叠处理方式 */
  eventOverlapMode?: 'stack' | 'column'
}

/**
 * 日视图配置
 */
export interface DayViewConfig extends ViewConfig {
  /** 是否显示时间刻度 */
  showTimeScale?: boolean
  /** 时间刻度间隔（分钟） */
  timeScaleInterval?: number
  /** 是否显示当前时间线 */
  showCurrentTimeLine?: boolean
  /** 事件最小高度 */
  eventMinHeight?: number
  /** 事件重叠处理方式 */
  eventOverlapMode?: 'stack' | 'column'
  /** 小时高度 */
  hourHeight?: number
}

/**
 * 年视图配置
 */
export interface YearViewConfig extends ViewConfig {
  /** 月份布局 */
  monthLayout?: 'grid' | 'list'
  /** 每行月份数 */
  monthsPerRow?: number
  /** 月份间距 */
  monthSpacing?: number
  /** 是否显示月份标题 */
  showMonthTitles?: boolean
  /** 是否显示事件指示器 */
  showEventIndicators?: boolean
}

/**
 * 议程视图配置
 */
export interface AgendaViewConfig extends ViewConfig {
  /** 显示天数 */
  dayCount?: number
  /** 是否分组显示 */
  groupByDate?: boolean
  /** 是否显示时间 */
  showTime?: boolean
  /** 是否显示描述 */
  showDescription?: boolean
  /** 最大描述长度 */
  maxDescriptionLength?: number
  /** 排序方式 */
  sortBy?: 'start' | 'title' | 'priority'
  /** 排序方向 */
  sortDirection?: 'asc' | 'desc'
}

/**
 * 时间线视图配置
 */
export interface TimelineViewConfig extends ViewConfig {
  /** 时间线方向 */
  orientation?: 'horizontal' | 'vertical'
  /** 时间刻度 */
  timeScale?: 'hour' | 'day' | 'week' | 'month'
  /** 是否显示资源 */
  showResources?: boolean
  /** 资源列表 */
  resources?: TimelineResource[]
  /** 事件高度 */
  eventHeight?: number
  /** 资源高度 */
  resourceHeight?: number
}

/**
 * 时间线资源
 */
export interface TimelineResource {
  /** 资源ID */
  id: string
  /** 资源名称 */
  name: string
  /** 资源类型 */
  type?: string
  /** 资源颜色 */
  color?: string
  /** 是否可用 */
  available?: boolean
  /** 工作时间 */
  workingHours?: {
    start: number
    end: number
  }
  /** 自定义数据 */
  data?: Record<string, any>
}

/**
 * 视图状态
 */
export interface ViewState {
  /** 当前视图类型 */
  type: ViewType
  /** 当前日期 */
  date: Dayjs
  /** 视图范围 */
  range: {
    start: Dayjs
    end: Dayjs
  }
  /** 选中的日期 */
  selectedDates: Dayjs[]
  /** 可见的事件 */
  visibleEvents: CalendarEvent[]
  /** 加载状态 */
  loading: boolean
  /** 错误信息 */
  error?: string
}

/**
 * 视图操作
 */
export interface ViewActions {
  /** 跳转到指定日期 */
  goToDate: (date: Dayjs) => void
  /** 跳转到今天 */
  goToToday: () => void
  /** 上一个周期 */
  prev: () => void
  /** 下一个周期 */
  next: () => void
  /** 切换视图 */
  changeView: (type: ViewType) => void
  /** 选择日期 */
  selectDate: (date: Dayjs) => void
  /** 选择日期范围 */
  selectDateRange: (start: Dayjs, end: Dayjs) => void
  /** 清除选择 */
  clearSelection: () => void
  /** 刷新视图 */
  refresh: () => void
  /** 缩放 */
  zoom: (level: number) => void
}

/**
 * 视图事件
 */
export interface ViewEvents {
  /** 视图渲染完成 */
  rendered: (type: ViewType, date: Dayjs) => void
  /** 日期点击 */
  dateClick: (date: Dayjs, event: MouseEvent) => void
  /** 日期双击 */
  dateDoubleClick: (date: Dayjs, event: MouseEvent) => void
  /** 日期选择 */
  dateSelect: (date: Dayjs, dates: Dayjs[]) => void
  /** 事件点击 */
  eventClick: (event: CalendarEvent, element: HTMLElement) => void
  /** 事件双击 */
  eventDoubleClick: (event: CalendarEvent, element: HTMLElement) => void
  /** 事件拖拽开始 */
  eventDragStart: (event: CalendarEvent, element: HTMLElement) => void
  /** 事件拖拽结束 */
  eventDragEnd: (event: CalendarEvent, element: HTMLElement) => void
  /** 事件拖拽放下 */
  eventDrop: (event: CalendarEvent, newDate: Dayjs, element: HTMLElement) => void
  /** 事件调整大小开始 */
  eventResizeStart: (event: CalendarEvent, element: HTMLElement) => void
  /** 事件调整大小结束 */
  eventResizeEnd: (event: CalendarEvent, element: HTMLElement) => void
  /** 视图变化 */
  viewChange: (type: ViewType, date: Dayjs) => void
  /** 日期变化 */
  dateChange: (date: Dayjs) => void
  /** 范围变化 */
  rangeChange: (start: Dayjs, end: Dayjs) => void
}

/**
 * 视图插件接口
 */
export interface ViewPlugin {
  /** 插件名称 */
  name: string
  /** 支持的视图类型 */
  supportedViews: ViewType[]
  /** 初始化 */
  init: (view: any) => void
  /** 销毁 */
  destroy: (view: any) => void
  /** 渲染前 */
  beforeRender?: (view: any) => void
  /** 渲染后 */
  afterRender?: (view: any) => void
}

/**
 * 视图渲染器接口
 */
export interface ViewRenderer {
  /** 渲染视图 */
  render: (container: HTMLElement, state: ViewState, config: ViewConfig) => void
  /** 更新视图 */
  update: (state: ViewState) => void
  /** 销毁视图 */
  destroy: () => void
}

/**
 * 视图工厂接口
 */
export interface ViewFactory {
  /** 创建视图 */
  createView: (type: ViewType, config: ViewConfig) => ViewRenderer
  /** 注册视图 */
  registerView: (type: ViewType, renderer: ViewRenderer) => void
  /** 注销视图 */
  unregisterView: (type: ViewType) => void
  /** 获取支持的视图类型 */
  getSupportedViews: () => ViewType[]
}

/**
 * 视图管理器接口
 */
export interface ViewManagerInterface {
  /** 当前视图状态 */
  state: ViewState
  /** 视图配置 */
  config: ViewConfig
  /** 视图操作 */
  actions: ViewActions
  /** 事件监听器 */
  on: <K extends keyof ViewEvents>(event: K, handler: ViewEvents[K]) => void
  /** 移除事件监听器 */
  off: <K extends keyof ViewEvents>(event: K, handler?: ViewEvents[K]) => void
  /** 触发事件 */
  emit: <K extends keyof ViewEvents>(event: K, ...args: Parameters<ViewEvents[K]>) => void
}
