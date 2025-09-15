/**
 * 插件系统相关的类型定义
 */

import type { ICalendar } from './calendar'

/**
 * 插件生命周期钩子
 */
export interface PluginHooks {
  /** 插件初始化前 */
  beforeInit?: (calendar: ICalendar) => void | Promise<void>

  /** 插件初始化后 */
  afterInit?: (calendar: ICalendar) => void | Promise<void>

  /** 插件销毁前 */
  beforeDestroy?: (calendar: ICalendar) => void | Promise<void>

  /** 插件销毁后 */
  afterDestroy?: (calendar: ICalendar) => void | Promise<void>

  /** 视图渲染前 */
  beforeViewRender?: (calendar: ICalendar, viewType: string) => void | Promise<void>

  /** 视图渲染后 */
  afterViewRender?: (calendar: ICalendar, viewType: string) => void | Promise<void>

  /** 事件渲染前 */
  beforeEventRender?: (calendar: ICalendar, event: any) => void | Promise<void>

  /** 事件渲染后 */
  afterEventRender?: (calendar: ICalendar, event: any) => void | Promise<void>
}

/**
 * 插件配置选项
 */
export interface PluginOptions {
  /** 插件是否启用 */
  enabled?: boolean

  /** 插件配置 */
  config?: Record<string, any>

  /** 插件依赖 */
  dependencies?: string[]

  /** 插件优先级 */
  priority?: number
}

/**
 * 插件元数据
 */
export interface PluginMetadata {
  /** 插件名称 */
  name: string

  /** 插件版本 */
  version: string

  /** 插件描述 */
  description?: string

  /** 插件作者 */
  author?: string

  /** 插件主页 */
  homepage?: string

  /** 插件许可证 */
  license?: string

  /** 插件关键词 */
  keywords?: string[]

  /** 最小日历版本要求 */
  minCalendarVersion?: string

  /** 最大日历版本要求 */
  maxCalendarVersion?: string
}

/**
 * 插件接口
 */
export interface CalendarPlugin {
  /** 插件元数据 */
  metadata: PluginMetadata

  /** 插件选项 */
  options?: PluginOptions

  /** 插件生命周期钩子 */
  hooks?: PluginHooks

  /** 插件安装方法 */
  install: (calendar: ICalendar, options?: PluginOptions) => void | Promise<void>

  /** 插件卸载方法 */
  uninstall?: (calendar: ICalendar) => void | Promise<void>

  /** 插件API */
  api?: Record<string, any>

  /** 插件组件 */
  components?: Record<string, any>

  /** 插件样式 */
  styles?: string | string[]

  /** 插件资源 */
  assets?: Record<string, string>

  /** 允许插件添加自定义方法和属性 */
  [key: string]: any
}

/**
 * 插件管理器接口
 */
export interface IPluginManager {
  /** 注册插件 */
  register(plugin: CalendarPlugin): void

  /** 卸载插件 */
  unregister(pluginName: string): void

  /** 启用插件 */
  enable(pluginName: string): void

  /** 禁用插件 */
  disable(pluginName: string): void

  /** 获取插件 */
  get(pluginName: string): CalendarPlugin | null

  /** 获取所有插件 */
  getAll(): CalendarPlugin[]

  /** 获取已启用的插件 */
  getEnabled(): CalendarPlugin[]

  /** 检查插件是否存在 */
  has(pluginName: string): boolean

  /** 检查插件是否启用 */
  isEnabled(pluginName: string): boolean

  /** 执行插件钩子 */
  executeHook(hookName: keyof PluginHooks, ...args: any[]): Promise<void>

  /** 清空所有插件 */
  clear(): void
}

/**
 * 插件事件
 */
export interface PluginEvent {
  /** 事件类型 */
  type: 'register' | 'unregister' | 'enable' | 'disable' | 'error'

  /** 插件名称 */
  pluginName: string

  /** 事件数据 */
  data?: any

  /** 错误信息 */
  error?: Error

  /** 事件时间戳 */
  timestamp: number
}

/**
 * 插件开发工具接口
 */
export interface PluginDevTools {
  /** 创建插件模板 */
  createTemplate(name: string, options?: any): CalendarPlugin

  /** 验证插件 */
  validate(plugin: CalendarPlugin): boolean

  /** 获取插件信息 */
  getInfo(plugin: CalendarPlugin): PluginMetadata

  /** 检查插件兼容性 */
  checkCompatibility(plugin: CalendarPlugin, calendarVersion: string): boolean

  /** 生成插件文档 */
  generateDocs(plugin: CalendarPlugin): string
}

/**
 * 内置插件类型
 */
export type BuiltinPluginType =
  | 'time-picker'
  | 'event-reminder'
  | 'export'
  | 'import'
  | 'print'
  | 'search'
  | 'filter'
  | 'mini-calendar'
  | 'event-list'
  | 'agenda'
  | 'timeline'

/**
 * 插件配置映射
 */
export interface PluginConfigMap {
  'time-picker': TimePickerPluginConfig
  'event-reminder': EventReminderPluginConfig
  'export': ExportPluginConfig
  'import': ImportPluginConfig
  'print': PrintPluginConfig
  'search': SearchPluginConfig
  'filter': FilterPluginConfig
  'mini-calendar': MiniCalendarPluginConfig
  'event-list': EventListPluginConfig
  'agenda': AgendaPluginConfig
  'timeline': TimelinePluginConfig
}

/**
 * 时间选择器插件配置
 */
export interface TimePickerPluginConfig {
  /** 时间格式 */
  format?: string

  /** 时间间隔（分钟） */
  step?: number

  /** 最小时间 */
  minTime?: string

  /** 最大时间 */
  maxTime?: string

  /** 是否显示秒 */
  showSeconds?: boolean
}

/**
 * 事件提醒插件配置
 */
export interface EventReminderPluginConfig {
  /** 默认提醒时间（分钟） */
  defaultReminder?: number

  /** 提醒方式 */
  methods?: ('popup' | 'notification' | 'sound')[]

  /** 提醒声音 */
  sound?: string

  /** 是否自动关闭提醒 */
  autoClose?: boolean

  /** 自动关闭延迟（毫秒） */
  autoCloseDelay?: number
}

/**
 * 导出插件配置
 */
export interface ExportPluginConfig {
  /** 支持的导出格式 */
  formats?: ('ics' | 'csv' | 'json' | 'pdf' | 'png' | 'jpg')[]

  /** 默认导出格式 */
  defaultFormat?: string

  /** 导出文件名模板 */
  filenameTemplate?: string

  /** PDF导出配置 */
  pdfConfig?: {
    pageSize?: 'A4' | 'A3' | 'Letter'
    orientation?: 'portrait' | 'landscape'
    margin?: number
  }
}

/**
 * 导入插件配置
 */
export interface ImportPluginConfig {
  /** 支持的导入格式 */
  formats?: ('ics' | 'csv' | 'json')[]

  /** 是否覆盖现有事件 */
  overwrite?: boolean

  /** 导入前是否确认 */
  confirmBeforeImport?: boolean
}

/**
 * 打印插件配置
 */
export interface PrintPluginConfig {
  /** 打印样式 */
  styles?: string

  /** 是否显示打印预览 */
  showPreview?: boolean

  /** 页面设置 */
  pageSetup?: {
    size?: 'A4' | 'A3' | 'Letter'
    orientation?: 'portrait' | 'landscape'
    margin?: number
  }
}

/**
 * 搜索插件配置
 */
export interface SearchPluginConfig {
  /** 搜索字段 */
  searchFields?: ('title' | 'description' | 'location' | 'categories')[]

  /** 是否启用模糊搜索 */
  fuzzySearch?: boolean

  /** 搜索结果高亮 */
  highlight?: boolean

  /** 最大搜索结果数 */
  maxResults?: number
}

/**
 * 过滤插件配置
 */
export interface FilterPluginConfig {
  /** 可过滤的字段 */
  filterFields?: ('type' | 'status' | 'categories' | 'priority')[]

  /** 默认过滤器 */
  defaultFilters?: Record<string, any>

  /** 是否保存过滤状态 */
  saveState?: boolean
}

/**
 * 迷你日历插件配置
 */
export interface MiniCalendarPluginConfig {
  /** 显示位置 */
  position?: 'left' | 'right' | 'top' | 'bottom'

  /** 是否可折叠 */
  collapsible?: boolean

  /** 默认是否展开 */
  defaultExpanded?: boolean

  /** 尺寸 */
  size?: 'small' | 'medium' | 'large'
}

/**
 * 事件列表插件配置
 */
export interface EventListPluginConfig {
  /** 显示位置 */
  position?: 'left' | 'right' | 'bottom'

  /** 列表高度 */
  height?: number

  /** 是否显示日期 */
  showDate?: boolean

  /** 是否显示时间 */
  showTime?: boolean

  /** 排序方式 */
  sortBy?: 'start' | 'title' | 'priority'
}

/**
 * 议程插件配置
 */
export interface AgendaPluginConfig {
  /** 显示天数 */
  days?: number

  /** 是否显示周末 */
  showWeekends?: boolean

  /** 时间格式 */
  timeFormat?: string

  /** 日期格式 */
  dateFormat?: string
}

/**
 * 时间轴插件配置
 */
export interface TimelinePluginConfig {
  /** 时间轴方向 */
  orientation?: 'horizontal' | 'vertical'

  /** 时间间隔 */
  timeStep?: number

  /** 是否显示当前时间线 */
  showCurrentTime?: boolean

  /** 缩放级别 */
  zoomLevels?: string[]
}
