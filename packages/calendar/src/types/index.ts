/**
 * 日历组件核心类型定义
 */

import type { Dayjs } from 'dayjs'

// ==================== 基础类型 ====================

/** 日期类型 */
export type DateInput = Date | string | number | Dayjs

/** 视图类型 */
export type ViewType = 'month' | 'week' | 'day' | 'year' | 'desk'

/** 语言类型 */
export type LocaleType = 'zh-CN' | 'en-US' | string

/** 主题类型 */
export type ThemeType = 'default' | 'dark' | 'blue' | 'green' | string

// ==================== 事件相关类型 ====================

/** 事件优先级 */
export type EventPriority = 'low' | 'medium' | 'high'

/** 重复类型 */
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'

/** 事件状态 */
export type EventStatus = 'confirmed' | 'tentative' | 'cancelled'

/** 事件接口 */
export interface CalendarEvent {
  /** 事件ID */
  id: string
  /** 事件标题 */
  title: string
  /** 开始时间 */
  start: DateInput
  /** 结束时间 */
  end?: DateInput
  /** 是否全天事件 */
  allDay?: boolean
  /** 事件描述 */
  description?: string
  /** 事件颜色 */
  color?: string
  /** 背景颜色 */
  backgroundColor?: string
  /** 边框颜色 */
  borderColor?: string
  /** 文本颜色 */
  textColor?: string
  /** 事件分类 */
  category?: string
  /** 事件优先级 */
  priority?: EventPriority
  /** 事件状态 */
  status?: EventStatus
  /** 重复设置 */
  repeat?: RepeatConfig
  /** 提醒设置 */
  reminders?: ReminderConfig[]
  /** 自定义数据 */
  data?: Record<string, any>
  /** 是否可编辑 */
  editable?: boolean
  /** 是否可拖拽 */
  draggable?: boolean
  /** 是否可调整大小 */
  resizable?: boolean
}

/** 重复配置 */
export interface RepeatConfig {
  /** 重复类型 */
  type: RepeatType
  /** 重复间隔 */
  interval?: number
  /** 重复结束日期 */
  until?: DateInput
  /** 重复次数 */
  count?: number
  /** 每周重复的天数 (0-6, 0为周日) */
  byWeekday?: number[]
  /** 每月重复的日期 */
  byMonthday?: number[]
  /** 每年重复的月份 */
  byMonth?: number[]
}

/** 提醒配置 */
export interface ReminderConfig {
  /** 提醒ID */
  id: string
  /** 提前时间（分钟） */
  minutes: number
  /** 提醒方式 */
  method: 'popup' | 'email' | 'sms' | 'notification'
  /** 提醒消息 */
  message?: string
}

// ==================== 视图相关类型 ====================

/** 日期单元格数据 */
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
  /** 农历信息 */
  lunar?: LunarInfo
  /** 节假日信息 */
  holiday?: HolidayInfo
  /** 当日事件 */
  events: CalendarEvent[]
  /** 自定义CSS类 */
  className?: string
}

/** 农历信息 */
export interface LunarInfo {
  /** 农历年 */
  year: string
  /** 农历月 */
  month: string
  /** 农历日 */
  day: string
  /** 节气 */
  term?: string
  /** 传统节日 */
  festival?: string
  /** 生肖 */
  zodiac: string
  /** 天干地支 */
  gzYear: string
  /** 是否闰月 */
  isLeap: boolean
  /** 详细天干地支 */
  ganzhi?: {
    year: string
    month: string
    day: string
    hour?: string
  }
  /** 宜做的事情 */
  suitable?: string[]
  /** 忌做的事情 */
  avoid?: string[]
}

/** 节假日信息 */
export interface HolidayInfo {
  /** 节假日名称 */
  name: string
  /** 节假日类型 */
  type: 'holiday' | 'workday' | 'festival'
  /** 是否调休 */
  isAdjusted?: boolean
}

// ==================== 配置相关类型 ====================

/** 日历配置 */
export interface CalendarConfig {
  /** 容器元素 */
  container?: string | HTMLElement
  /** 初始视图 */
  view?: ViewType
  /** 初始日期 */
  date?: DateInput
  /** 语言 */
  locale?: LocaleType
  /** 主题 */
  theme?: ThemeType
  /** 每周起始日 (0-6, 0为周日) */
  firstDayOfWeek?: number
  /** 是否显示农历 */
  showLunar?: boolean
  /** 是否显示节假日 */
  showHolidays?: boolean
  /** 是否显示周数 */
  showWeekNumbers?: boolean
  /** 是否显示今天按钮 */
  showToday?: boolean
  /** 是否显示导航按钮 */
  showNavigation?: boolean
  /** 是否显示工具栏 */
  showToolbar?: boolean
  /** 最小日期 */
  minDate?: DateInput
  /** 最大日期 */
  maxDate?: DateInput
  /** 禁用日期 */
  disabledDates?: DateInput[] | ((date: Dayjs) => boolean)
  /** 选择模式 */
  selectionMode?: 'single' | 'multiple' | 'range' | 'week' | 'month'
  /** 最大选择数量 */
  maxSelections?: number
  /** 是否启用拖拽 */
  enableDragDrop?: boolean
  /** 是否启用调整大小 */
  enableResize?: boolean
  /** 是否启用键盘导航 */
  enableKeyboard?: boolean
  /** 是否启用触摸手势 */
  enableTouch?: boolean
  /** 动画配置 */
  animation?: AnimationConfig
  /** 自定义CSS类 */
  className?: string
  /** 自定义样式 */
  style?: Partial<CSSStyleDeclaration>
}

/** 动画配置 */
export interface AnimationConfig {
  /** 是否启用动画 */
  enabled: boolean
  /** 动画时长 */
  duration: number
  /** 缓动函数 */
  easing: string
  /** 视图切换动画 */
  viewTransition: 'slide' | 'fade' | 'zoom' | 'none'
}

// ==================== 事件回调类型 ====================

/** 日期选择回调 */
export type DateSelectCallback = (date: Dayjs, dates: Dayjs[]) => void

/** 事件点击回调 */
export type EventClickCallback = (event: CalendarEvent, element: HTMLElement) => void

/** 事件创建回调 */
export type EventCreateCallback = (event: Partial<CalendarEvent>) => void | Promise<void>

/** 事件更新回调 */
export type EventUpdateCallback = (event: CalendarEvent, changes: Partial<CalendarEvent>) => void | Promise<void>

/** 事件删除回调 */
export type EventDeleteCallback = (event: CalendarEvent) => void | Promise<void>

/** 视图变化回调 */
export type ViewChangeCallback = (view: ViewType, date: Dayjs) => void

/** 日期变化回调 */
export type DateChangeCallback = (date: Dayjs) => void

// ==================== 插件相关类型 ====================

/** 插件接口 */
export interface CalendarPlugin {
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version: string
  /** 插件初始化 */
  install: (calendar: any, options?: any) => void
  /** 插件卸载 */
  uninstall?: (calendar: any) => void
}

// ==================== 工具类型 ====================

/** 位置信息 */
export interface Position {
  x: number
  y: number
}

/** 尺寸信息 */
export interface Size {
  width: number
  height: number
}

/** 矩形区域 */
export interface Rect extends Position, Size {}

/** 拖拽信息 */
export interface DragInfo {
  /** 拖拽元素 */
  element: HTMLElement
  /** 拖拽数据 */
  data: any
  /** 起始位置 */
  startPosition: Position
  /** 当前位置 */
  currentPosition: Position
  /** 偏移量 */
  offset: Position
}

// ==================== 导出所有类型 ====================

export * from './events'
export * from './views'
// export * from './themes'
// export * from './plugins'
