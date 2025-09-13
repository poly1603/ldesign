/**
 * 视图相关的类型定义
 */

import type { CalendarEvent } from './event'
import type { ICalendar } from './calendar'

/**
 * 视图类型
 */
export type ViewType = 'month' | 'week' | 'day' | 'agenda' | 'timeline' | 'list'

/**
 * 视图配置
 */
export interface ViewConfig {
  /** 视图是否启用 */
  enabled?: boolean
  
  /** 视图显示名称 */
  displayName?: string
  
  /** 视图图标 */
  icon?: string
  
  /** 视图快捷键 */
  shortcut?: string
  
  /** 视图特定配置 */
  options?: Record<string, any>
}

/**
 * 月视图配置
 */
export interface MonthViewConfig extends ViewConfig {
  options?: {
    /** 是否显示周数 */
    showWeekNumbers?: boolean
    
    /** 是否显示其他月份的日期 */
    showOtherMonths?: boolean
    
    /** 是否固定6周显示 */
    fixedWeekCount?: boolean
    
    /** 每个日期单元格的最大事件数 */
    maxEventsPerDay?: number
    
    /** 事件显示模式 */
    eventDisplayMode?: 'list' | 'dots' | 'bars'
    
    /** 是否显示农历 */
    showLunar?: boolean
    
    /** 是否显示节假日 */
    showHolidays?: boolean
  }
}

/**
 * 周视图配置
 */
export interface WeekViewConfig extends ViewConfig {
  options?: {
    /** 一周的开始日期（0-6，0为周日） */
    firstDay?: number
    
    /** 是否显示周末 */
    showWeekends?: boolean
    
    /** 时间轴开始时间 */
    startTime?: string
    
    /** 时间轴结束时间 */
    endTime?: string
    
    /** 时间间隔（分钟） */
    timeStep?: number
    
    /** 是否显示全天事件区域 */
    showAllDayEvents?: boolean
    
    /** 全天事件区域高度 */
    allDayHeight?: number
    
    /** 时间轴宽度 */
    timeAxisWidth?: number
    
    /** 是否显示当前时间线 */
    showCurrentTime?: boolean
    
    /** 是否显示时间网格 */
    showTimeGrid?: boolean
  }
}

/**
 * 日视图配置
 */
export interface DayViewConfig extends ViewConfig {
  options?: {
    /** 时间轴开始时间 */
    startTime?: string
    
    /** 时间轴结束时间 */
    endTime?: string
    
    /** 时间间隔（分钟） */
    timeStep?: number
    
    /** 是否显示全天事件区域 */
    showAllDayEvents?: boolean
    
    /** 全天事件区域高度 */
    allDayHeight?: number
    
    /** 时间轴宽度 */
    timeAxisWidth?: number
    
    /** 是否显示当前时间线 */
    showCurrentTime?: boolean
    
    /** 是否显示时间网格 */
    showTimeGrid?: boolean
    
    /** 是否显示小时标签 */
    showHourLabels?: boolean
    
    /** 小时标签格式 */
    hourLabelFormat?: string
  }
}

/**
 * 议程视图配置
 */
export interface AgendaViewConfig extends ViewConfig {
  options?: {
    /** 显示的天数 */
    days?: number
    
    /** 是否显示日期头部 */
    showDateHeaders?: boolean
    
    /** 是否显示时间 */
    showTime?: boolean
    
    /** 时间格式 */
    timeFormat?: string
    
    /** 日期格式 */
    dateFormat?: string
    
    /** 是否分组显示 */
    groupByDate?: boolean
    
    /** 是否显示空日期 */
    showEmptyDays?: boolean
    
    /** 每页显示的事件数 */
    eventsPerPage?: number
  }
}

/**
 * 时间轴视图配置
 */
export interface TimelineViewConfig extends ViewConfig {
  options?: {
    /** 时间轴方向 */
    orientation?: 'horizontal' | 'vertical'
    
    /** 时间范围 */
    timeRange?: {
      start: Date
      end: Date
    }
    
    /** 时间刻度 */
    timeScale?: 'hour' | 'day' | 'week' | 'month' | 'year'
    
    /** 是否显示当前时间线 */
    showCurrentTime?: boolean
    
    /** 是否可缩放 */
    zoomable?: boolean
    
    /** 缩放级别 */
    zoomLevels?: number[]
    
    /** 是否可滚动 */
    scrollable?: boolean
    
    /** 资源列表 */
    resources?: TimelineResource[]
  }
}

/**
 * 列表视图配置
 */
export interface ListViewConfig extends ViewConfig {
  options?: {
    /** 排序字段 */
    sortBy?: 'start' | 'end' | 'title' | 'created' | 'updated'
    
    /** 排序方向 */
    sortOrder?: 'asc' | 'desc'
    
    /** 是否显示日期分组 */
    groupByDate?: boolean
    
    /** 是否显示时间 */
    showTime?: boolean
    
    /** 时间格式 */
    timeFormat?: string
    
    /** 日期格式 */
    dateFormat?: string
    
    /** 每页显示的事件数 */
    eventsPerPage?: number
    
    /** 是否启用分页 */
    pagination?: boolean
    
    /** 是否启用搜索 */
    searchable?: boolean
    
    /** 是否启用过滤 */
    filterable?: boolean
  }
}

/**
 * 时间轴资源
 */
export interface TimelineResource {
  /** 资源ID */
  id: string
  
  /** 资源名称 */
  name: string
  
  /** 资源颜色 */
  color?: string
  
  /** 资源描述 */
  description?: string
  
  /** 资源数据 */
  data?: Record<string, any>
}

/**
 * 视图渲染上下文
 */
export interface ViewRenderContext {
  /** 日历实例 */
  calendar: ICalendar
  
  /** 视图类型 */
  viewType: ViewType
  
  /** 当前日期 */
  currentDate: Date
  
  /** 视图日期范围 */
  dateRange: {
    start: Date
    end: Date
  }
  
  /** 视图中的事件 */
  events: CalendarEvent[]
  
  /** 视图配置 */
  config: ViewConfig
  
  /** 容器元素 */
  container: HTMLElement
}

/**
 * 视图基类接口
 */
export interface IView {
  /** 视图类型 */
  readonly type: ViewType
  
  /** 视图配置 */
  config: ViewConfig
  
  /** 初始化视图 */
  init(context: ViewRenderContext): void
  
  /** 渲染视图 */
  render(): void
  
  /** 更新视图 */
  update(events?: CalendarEvent[]): void
  
  /** 刷新视图 */
  refresh(): void
  
  /** 销毁视图 */
  destroy(): void
  
  /** 获取视图日期范围 */
  getDateRange(): { start: Date; end: Date }
  
  /** 跳转到指定日期 */
  goToDate(date: Date): void
  
  /** 上一页 */
  prev(): void
  
  /** 下一页 */
  next(): void
  
  /** 获取视图中的事件 */
  getEvents(): CalendarEvent[]
  
  /** 获取指定位置的日期 */
  getDateAtPosition(x: number, y: number): Date | null
  
  /** 获取指定日期的位置 */
  getPositionForDate(date: Date): { x: number; y: number } | null
  
  /** 处理事件点击 */
  handleEventClick(event: CalendarEvent, nativeEvent: Event): void
  
  /** 处理日期点击 */
  handleDateClick(date: Date, nativeEvent: Event): void
  
  /** 处理拖拽开始 */
  handleDragStart(event: CalendarEvent, nativeEvent: DragEvent): void
  
  /** 处理拖拽中 */
  handleDrag(event: CalendarEvent, nativeEvent: DragEvent): void
  
  /** 处理拖拽结束 */
  handleDragEnd(event: CalendarEvent, nativeEvent: DragEvent): void
}

/**
 * 视图工厂接口
 */
export interface IViewFactory {
  /** 创建视图实例 */
  create(type: ViewType, config: ViewConfig): IView
  
  /** 注册视图类型 */
  register(type: ViewType, viewClass: new () => IView): void
  
  /** 获取支持的视图类型 */
  getSupportedTypes(): ViewType[]
  
  /** 检查视图类型是否支持 */
  isSupported(type: ViewType): boolean
}

/**
 * 视图切换动画类型
 */
export type ViewTransitionType = 'none' | 'fade' | 'slide' | 'zoom' | 'flip'

/**
 * 视图切换配置
 */
export interface ViewTransitionConfig {
  /** 动画类型 */
  type: ViewTransitionType
  
  /** 动画持续时间（毫秒） */
  duration?: number
  
  /** 动画缓动函数 */
  easing?: string
  
  /** 动画方向（仅适用于slide） */
  direction?: 'left' | 'right' | 'up' | 'down'
}

/**
 * 视图管理器接口
 */
export interface IViewManager {
  /** 当前视图 */
  readonly currentView: IView | null
  
  /** 当前视图类型 */
  readonly currentViewType: ViewType | null
  
  /** 切换视图 */
  switchView(type: ViewType, transition?: ViewTransitionConfig): void
  
  /** 注册视图 */
  registerView(type: ViewType, viewClass: new () => IView): void
  
  /** 获取视图 */
  getView(type: ViewType): IView | null
  
  /** 获取所有视图 */
  getAllViews(): Record<ViewType, IView>
  
  /** 销毁所有视图 */
  destroyAll(): void
}
