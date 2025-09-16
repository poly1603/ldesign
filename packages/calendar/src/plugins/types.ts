/**
 * 插件系统类型定义
 */

import type { Calendar } from '../core/Calendar'
import type { CalendarEvent } from '../types'

/**
 * 插件上下文
 */
export interface PluginContext {
  /** 日历实例 */
  calendar: Calendar
  /** 插件配置 */
  options: Record<string, any>
  /** 插件状态 */
  state: Record<string, any>
  /** 事件发射器 */
  emit: (event: string, ...args: any[]) => void
  /** 事件监听器 */
  on: (event: string, handler: Function) => void
  /** 移除事件监听器 */
  off: (event: string, handler?: Function) => void
}

/**
 * 插件选项
 */
export interface PluginOptions {
  /** 是否启用插件 */
  enabled?: boolean
  /** 插件优先级 */
  priority?: number
  /** 插件配置 */
  config?: Record<string, any>
}

/**
 * 插件生命周期钩子
 */
export interface PluginHooks {
  /** 插件安装前 */
  beforeInstall?: (context: PluginContext) => void | Promise<void>
  /** 插件安装后 */
  afterInstall?: (context: PluginContext) => void | Promise<void>
  /** 插件卸载前 */
  beforeUninstall?: (context: PluginContext) => void | Promise<void>
  /** 插件卸载后 */
  afterUninstall?: (context: PluginContext) => void | Promise<void>
  /** 日历渲染前 */
  beforeRender?: (context: PluginContext) => void | Promise<void>
  /** 日历渲染后 */
  afterRender?: (context: PluginContext) => void | Promise<void>
  /** 事件创建前 */
  beforeEventCreate?: (context: PluginContext, event: Partial<CalendarEvent>) => void | Promise<void>
  /** 事件创建后 */
  afterEventCreate?: (context: PluginContext, event: CalendarEvent) => void | Promise<void>
  /** 事件更新前 */
  beforeEventUpdate?: (context: PluginContext, event: CalendarEvent, changes: Partial<CalendarEvent>) => void | Promise<void>
  /** 事件更新后 */
  afterEventUpdate?: (context: PluginContext, event: CalendarEvent) => void | Promise<void>
  /** 事件删除前 */
  beforeEventDelete?: (context: PluginContext, event: CalendarEvent) => void | Promise<void>
  /** 事件删除后 */
  afterEventDelete?: (context: PluginContext, eventId: string) => void | Promise<void>
  /** 视图变化前 */
  beforeViewChange?: (context: PluginContext, newView: string, oldView: string) => void | Promise<void>
  /** 视图变化后 */
  afterViewChange?: (context: PluginContext, newView: string, oldView: string) => void | Promise<void>
}

/**
 * 插件接口
 */
export interface CalendarPlugin extends PluginHooks {
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version?: string
  /** 插件描述 */
  description?: string
  /** 插件作者 */
  author?: string
  /** 插件依赖 */
  dependencies?: string[]
  /** 默认选项 */
  defaultOptions?: PluginOptions
  /** 插件安装方法 */
  install: (context: PluginContext) => void | Promise<void>
  /** 插件卸载方法 */
  uninstall?: (context: PluginContext) => void | Promise<void>
  /** 插件初始化方法 */
  init?: (context: PluginContext) => void | Promise<void>
  /** 插件销毁方法 */
  destroy?: (context: PluginContext) => void | Promise<void>
}

/**
 * 插件管理器接口
 */
export interface PluginManagerInterface {
  /** 注册插件 */
  register: (plugin: CalendarPlugin, options?: PluginOptions) => void
  /** 卸载插件 */
  unregister: (name: string) => void
  /** 启用插件 */
  enable: (name: string) => void
  /** 禁用插件 */
  disable: (name: string) => void
  /** 获取插件 */
  get: (name: string) => CalendarPlugin | null
  /** 获取所有插件 */
  getAll: () => CalendarPlugin[]
  /** 检查插件是否存在 */
  has: (name: string) => boolean
  /** 检查插件是否启用 */
  isEnabled: (name: string) => boolean
  /** 执行插件钩子 */
  executeHook: (hook: keyof PluginHooks, ...args: any[]) => Promise<void>
}

/**
 * 时间选择器插件选项
 */
export interface TimePickerOptions extends PluginOptions {
  /** 时间格式 */
  format?: '12h' | '24h'
  /** 时间间隔（分钟） */
  interval?: number
  /** 最小时间 */
  minTime?: string
  /** 最大时间 */
  maxTime?: string
  /** 是否显示秒 */
  showSeconds?: boolean
  /** 是否显示现在按钮 */
  showNow?: boolean
}

/**
 * 导出插件选项
 */
export interface ExportOptions extends PluginOptions {
  /** 支持的格式 */
  formats?: ('json' | 'ical' | 'csv' | 'excel')[]
  /** 默认文件名 */
  defaultFilename?: string
  /** 是否包含私有事件 */
  includePrivate?: boolean
  /** 日期范围 */
  dateRange?: {
    start?: Date
    end?: Date
  }
}

/**
 * 提醒插件选项
 */
export interface ReminderOptions extends PluginOptions {
  /** 默认提醒时间（分钟） */
  defaultMinutes?: number[]
  /** 提醒方式 */
  methods?: ('popup' | 'notification' | 'sound')[]
  /** 声音文件 */
  soundFile?: string
  /** 是否显示桌面通知 */
  showNotification?: boolean
  /** 通知权限检查 */
  checkPermission?: boolean
}

/**
 * 拖拽插件选项
 */
export interface DragDropOptions extends PluginOptions {
  /** 是否启用拖拽 */
  enableDrag?: boolean
  /** 是否启用放置 */
  enableDrop?: boolean
  /** 是否启用调整大小 */
  enableResize?: boolean
  /** 拖拽时的透明度 */
  dragOpacity?: number
  /** 拖拽时的光标 */
  dragCursor?: string
  /** 是否显示拖拽辅助线 */
  showGuides?: boolean
}

/**
 * 键盘插件选项
 */
export interface KeyboardOptions extends PluginOptions {
  /** 快捷键映射 */
  shortcuts?: Record<string, string>
  /** 是否启用方向键导航 */
  enableArrowKeys?: boolean
  /** 是否启用Tab键导航 */
  enableTabNavigation?: boolean
  /** 是否启用回车键选择 */
  enableEnterSelect?: boolean
  /** 是否启用Escape键取消 */
  enableEscapeCancel?: boolean
}

/**
 * 插件事件类型
 */
export interface PluginEvents {
  /** 插件注册 */
  'plugin:register': (plugin: CalendarPlugin) => void
  /** 插件卸载 */
  'plugin:unregister': (name: string) => void
  /** 插件启用 */
  'plugin:enable': (name: string) => void
  /** 插件禁用 */
  'plugin:disable': (name: string) => void
  /** 插件错误 */
  'plugin:error': (name: string, error: Error) => void
  /** 时间选择 */
  'timepicker:select': (time: string) => void
  /** 导出开始 */
  'export:start': (format: string) => void
  /** 导出完成 */
  'export:complete': (format: string, data: any) => void
  /** 提醒触发 */
  'reminder:trigger': (event: CalendarEvent, reminder: any) => void
  /** 拖拽开始 */
  'drag:start': (event: CalendarEvent, element: HTMLElement) => void
  /** 拖拽结束 */
  'drag:end': (event: CalendarEvent, element: HTMLElement) => void
  /** 键盘快捷键 */
  'keyboard:shortcut': (key: string, action: string) => void
}

/**
 * 插件状态
 */
export interface PluginState {
  /** 插件名称 */
  name: string
  /** 是否已安装 */
  installed: boolean
  /** 是否已启用 */
  enabled: boolean
  /** 插件选项 */
  options: PluginOptions
  /** 插件实例 */
  instance: CalendarPlugin
  /** 插件上下文 */
  context: PluginContext
  /** 安装时间 */
  installedAt: Date
  /** 最后使用时间 */
  lastUsedAt?: Date
  /** 使用次数 */
  usageCount: number
  /** 错误信息 */
  error?: Error
}
