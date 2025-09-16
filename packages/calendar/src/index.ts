/**
 * @ldesign/calendar 主入口文件
 */

// 核心类
export { Calendar } from './core/Calendar'
export { EventManager } from './core/EventManager'
export { ViewManager } from './core/ViewManager'
export { ConfigManager } from './core/ConfigManager'

// 视图组件
export { BaseView } from './views/BaseView'
export { MonthView } from './views/MonthView'
export { WeekView } from './views/WeekView'
export { DayView } from './views/DayView'
export { YearView } from './views/YearView'

// 主题系统
export { ThemeManager } from './themes/ThemeManager'
export type { ThemeConfig } from './themes/ThemeManager'

// 工具函数
export { DateUtils } from './utils/date'
export { DOMUtils } from './utils/dom'
export { I18nManager } from './utils/i18n'
export { LunarUtils } from './utils/lunar'
export type { LocaleMessages } from './utils/i18n'

// 类型定义
export type {
  // 基础类型
  DateInput,
  ViewType,
  LocaleType,
  ThemeType,
  
  // 事件相关
  CalendarEvent,
  EventPriority,
  RepeatType,
  EventStatus,
  RepeatConfig,
  ReminderConfig,
  
  // 视图相关
  DateCell,
  LunarInfo,
  HolidayInfo,
  
  // 配置相关
  CalendarConfig,
  AnimationConfig,
  
  // 回调函数
  DateSelectCallback,
  EventClickCallback,
  EventCreateCallback,
  EventUpdateCallback,
  EventDeleteCallback,
  ViewChangeCallback,
  DateChangeCallback,
  
  // 插件相关
  CalendarPlugin,
  
  // 工具类型
  Position,
  Size,
  Rect,
  DragInfo
} from './types'

// 默认导出
export default Calendar

/**
 * 创建日历实例的便捷函数
 */
export function createCalendar(container: string | HTMLElement, config?: import('./types').CalendarConfig): Calendar {
  return new Calendar(container, config)
}

/**
 * 版本信息
 */
export const version = '0.1.0'

/**
 * 库信息
 */
export const info = {
  name: '@ldesign/calendar',
  version,
  description: '一个功能完整的日历组件库，支持多视图切换、事件管理、国际化等丰富功能',
  author: 'ldesign',
  license: 'MIT',
  homepage: 'https://github.com/ldesign/calendar',
  repository: 'https://github.com/ldesign/calendar.git',
  keywords: [
    'calendar',
    'date-picker',
    'event-management',
    'i18n',
    'lunar-calendar',
    'drag-drop',
    'responsive',
    'framework-agnostic',
    'typescript',
    'plugin-system',
    'theme-system'
  ]
}

/**
 * 全局配置
 */
export const globalConfig = {
  // 默认语言
  defaultLocale: 'zh-CN' as import('./types').LocaleType,
  
  // 默认主题
  defaultTheme: 'default' as import('./types').ThemeType,
  
  // 调试模式
  debug: false,
  
  // 性能监控
  performance: false
}

/**
 * 设置全局配置
 */
export function setGlobalConfig(config: Partial<typeof globalConfig>): void {
  Object.assign(globalConfig, config)
}

/**
 * 获取全局配置
 */
export function getGlobalConfig(): typeof globalConfig {
  return { ...globalConfig }
}

/**
 * 工具函数集合
 */
export const utils = {
  date: DateUtils,
  dom: DOMUtils,
  lunar: LunarUtils,
  
  /**
   * 格式化日期
   */
  formatDate: (date: import('./types').DateInput, format = 'YYYY-MM-DD'): string => {
    return DateUtils.format(date, format)
  },
  
  /**
   * 解析日期
   */
  parseDate: (dateString: string, format?: string): import('dayjs').Dayjs => {
    return DateUtils.parse(dateString, format)
  },
  
  /**
   * 检查是否为有效日期
   */
  isValidDate: (date: import('./types').DateInput): boolean => {
    return DateUtils.isValid(date)
  },
  
  /**
   * 获取日期范围
   */
  getDateRange: (start: import('./types').DateInput, end: import('./types').DateInput): import('dayjs').Dayjs[] => {
    return DateUtils.getDatesBetween(start, end)
  },
  
  /**
   * 计算日期差
   */
  dateDiff: (start: import('./types').DateInput, end: import('./types').DateInput, unit: import('dayjs').OpUnitType = 'day'): number => {
    return DateUtils.dayjs(end).diff(DateUtils.dayjs(start), unit)
  }
}

/**
 * 常量定义
 */
export const constants = {
  // 视图类型
  VIEW_TYPES: ['month', 'week', 'day', 'year'] as const,
  
  // 语言类型
  LOCALE_TYPES: ['zh-CN', 'en-US'] as const,
  
  // 主题类型
  THEME_TYPES: ['default', 'dark', 'blue', 'green'] as const,
  
  // 事件优先级
  EVENT_PRIORITIES: ['low', 'medium', 'high'] as const,
  
  // 重复类型
  REPEAT_TYPES: ['none', 'daily', 'weekly', 'monthly', 'yearly', 'custom'] as const,
  
  // 事件状态
  EVENT_STATUSES: ['confirmed', 'tentative', 'cancelled'] as const,
  
  // 选择模式
  SELECTION_MODES: ['single', 'multiple', 'range', 'week', 'month'] as const,
  
  // 动画类型
  ANIMATION_TYPES: ['slide', 'fade', 'zoom', 'none'] as const,
  
  // 默认配置
  DEFAULT_CONFIG: {
    view: 'month',
    locale: 'zh-CN',
    theme: 'default',
    firstDayOfWeek: 1,
    showLunar: true,
    showHolidays: true,
    showWeekNumbers: false,
    showToday: true,
    showNavigation: true,
    showToolbar: true,
    selectionMode: 'single',
    enableDragDrop: true,
    enableResize: true,
    enableKeyboard: true,
    enableTouch: true,
    animation: {
      enabled: true,
      duration: 300,
      easing: 'ease-in-out',
      viewTransition: 'slide'
    }
  } as const
}

/**
 * 错误类定义
 */
export class CalendarError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'CalendarError'
  }
}

export class EventError extends CalendarError {
  constructor(message: string) {
    super(message, 'EVENT_ERROR')
    this.name = 'EventError'
  }
}

export class ViewError extends CalendarError {
  constructor(message: string) {
    super(message, 'VIEW_ERROR')
    this.name = 'ViewError'
  }
}

export class ConfigError extends CalendarError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR')
    this.name = 'ConfigError'
  }
}

/**
 * 调试工具
 */
export const debug = {
  /**
   * 启用调试模式
   */
  enable(): void {
    globalConfig.debug = true
    console.log('[LDesign Calendar] Debug mode enabled')
  },
  
  /**
   * 禁用调试模式
   */
  disable(): void {
    globalConfig.debug = false
    console.log('[LDesign Calendar] Debug mode disabled')
  },
  
  /**
   * 输出调试信息
   */
  log(...args: any[]): void {
    if (globalConfig.debug) {
      console.log('[LDesign Calendar]', ...args)
    }
  },
  
  /**
   * 输出警告信息
   */
  warn(...args: any[]): void {
    if (globalConfig.debug) {
      console.warn('[LDesign Calendar]', ...args)
    }
  },
  
  /**
   * 输出错误信息
   */
  error(...args: any[]): void {
    if (globalConfig.debug) {
      console.error('[LDesign Calendar]', ...args)
    }
  },
  
  /**
   * 性能测试
   */
  time(label: string): void {
    if (globalConfig.performance) {
      console.time(`[LDesign Calendar] ${label}`)
    }
  },
  
  /**
   * 结束性能测试
   */
  timeEnd(label: string): void {
    if (globalConfig.performance) {
      console.timeEnd(`[LDesign Calendar] ${label}`)
    }
  }
}

/**
 * 浏览器兼容性检查
 */
export const compatibility = {
  /**
   * 检查浏览器兼容性
   */
  check(): boolean {
    const features = [
      'Map',
      'Set',
      'Promise',
      'Object.assign',
      'Array.from'
    ]
    
    return features.every(feature => {
      const hasFeature = feature.split('.').reduce((obj, prop) => obj && obj[prop], window)
      if (!hasFeature) {
        console.warn(`[LDesign Calendar] Missing feature: ${feature}`)
      }
      return hasFeature
    })
  },
  
  /**
   * 获取浏览器信息
   */
  getBrowserInfo(): {
    name: string
    version: string
    mobile: boolean
    touch: boolean
  } {
    const ua = navigator.userAgent
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    
    let name = 'Unknown'
    let version = 'Unknown'
    
    if (ua.includes('Chrome')) {
      name = 'Chrome'
      version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown'
    } else if (ua.includes('Firefox')) {
      name = 'Firefox'
      version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown'
    } else if (ua.includes('Safari')) {
      name = 'Safari'
      version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown'
    } else if (ua.includes('Edge')) {
      name = 'Edge'
      version = ua.match(/Edge\/(\d+)/)?.[1] || 'Unknown'
    }
    
    return { name, version, mobile, touch }
  }
}

// 初始化检查
if (typeof window !== 'undefined') {
  // 浏览器环境
  if (!compatibility.check()) {
    console.warn('[LDesign Calendar] Some features may not work properly in this browser')
  }
  
  // 输出库信息
  if (globalConfig.debug) {
    console.log('[LDesign Calendar] Library loaded', info)
    console.log('[LDesign Calendar] Browser info', compatibility.getBrowserInfo())
  }
}
