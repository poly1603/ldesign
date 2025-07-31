/**
 * 主题色管理系统核心类型定义
 */

/**
 * 颜色值类型 - 支持 hex、rgb、hsl 等格式
 */
export type ColorValue = string

/**
 * 颜色模式
 */
export type ColorMode = 'light' | 'dark'

/**
 * 主题类型
 */
export type ThemeType = 'system' | 'light' | 'dark' | 'custom'

/**
 * 颜色类别
 */
export type ColorCategory = 'primary' | 'success' | 'warning' | 'danger' | 'gray'

/**
 * 中性色类别
 */
export type NeutralColorCategory = 'border' | 'background' | 'text' | 'white' | 'shadow'

/**
 * 颜色配置接口
 */
export interface ColorConfig {
  /** 主色调 */
  primary: ColorValue
  /** 成功色 - 可选，不提供时自动生成 */
  success?: ColorValue
  /** 警告色 - 可选，不提供时自动生成 */
  warning?: ColorValue
  /** 危险色 - 可选，不提供时自动生成 */
  danger?: ColorValue
  /** 灰色 - 可选，不提供时自动生成 */
  gray?: ColorValue
}

/**
 * 色阶配置
 */
export interface ColorScale {
  /** 色阶数组，从浅到深 */
  colors: ColorValue[]
  /** 色阶索引映射 */
  indices: Record<number, ColorValue>
}

/**
 * 中性色配置
 */
export interface NeutralColors {
  /** 边框色系统 */
  border: ColorScale
  /** 背景色系统 */
  background: ColorScale
  /** 文字色系统 */
  text: ColorScale
  /** 白色变体系统 */
  white: ColorScale
  /** 阴影颜色系统 */
  shadow: ColorScale
}

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  /** 主题名称 */
  name: string
  /** 主题显示名称 */
  displayName?: string
  /** 主题描述 */
  description?: string
  /** 亮色模式颜色配置 */
  light: ColorConfig
  /** 暗色模式颜色配置 */
  dark?: ColorConfig
  /** 是否为内置主题 */
  builtin?: boolean
  /** 主题元数据 */
  meta?: Record<string, any>
}

/**
 * 生成的主题数据
 */
export interface GeneratedTheme {
  /** 主题名称 */
  name: string
  /** 亮色模式数据 */
  light: {
    /** 各颜色类别的色阶 */
    scales: Record<ColorCategory, ColorScale>
    /** CSS 变量 */
    cssVariables: Record<string, ColorValue>
  }
  /** 暗色模式数据 */
  dark: {
    /** 各颜色类别的色阶 */
    scales: Record<ColorCategory, ColorScale>
    /** CSS 变量 */
    cssVariables: Record<string, ColorValue>
  }
  /** 生成时间戳 */
  timestamp: number
}

/**
 * 存储接口
 */
export interface Storage {
  /** 获取数据 */
  getItem: (key: string) => string | null
  /** 设置数据 */
  setItem: (key: string, value: string) => void
  /** 删除数据 */
  removeItem: (key: string) => void
  /** 清空数据 */
  clear: () => void
}

/**
 * 缓存项接口
 */
export interface CacheItem<T = any> {
  /** 缓存值 */
  value: T
  /** 过期时间戳 */
  expires: number
  /** 访问时间戳 */
  accessed: number
}

/**
 * 缓存选项
 */
export interface CacheOptions {
  /** 最大缓存数量 */
  maxSize?: number
  /** 默认过期时间（毫秒） */
  defaultTTL?: number
}

/**
 * LRU 缓存接口
 */
export interface LRUCache<T = any> {
  /** 获取缓存值 */
  get: (key: string) => T | undefined
  /** 设置缓存值 */
  set: (key: string, value: T, ttl?: number) => void
  /** 删除缓存值 */
  delete: (key: string) => boolean
  /** 清空缓存 */
  clear: () => void
  /** 获取缓存大小 */
  size: () => number
  /** 检查是否存在 */
  has: (key: string) => boolean
}

/**
 * 主题管理器选项
 */
export interface ThemeManagerOptions {
  /** 默认主题名称 */
  defaultTheme?: string
  /** 回退主题名称 */
  fallbackTheme?: string
  /** 存储方式 */
  storage?: 'localStorage' | 'sessionStorage' | 'memory' | Storage
  /** 存储键名 */
  storageKey?: string
  /** 是否自动检测系统主题 */
  autoDetect?: boolean
  /** 预设主题配置 */
  themes?: ThemeConfig[]
  /** 是否启用缓存 */
  cache?: boolean | CacheOptions
  /** CSS 变量前缀 */
  cssPrefix?: string
  /** 是否启用闲时处理 */
  idleProcessing?: boolean
  /** 主题变更回调 */
  onThemeChanged?: (theme: string, mode: ColorMode) => void
  /** 错误回调 */
  onError?: (error: Error) => void
}

/**
 * 主题管理器实例接口
 */
export interface ThemeManagerInstance extends EventEmitter {
  /** 初始化 */
  init: () => Promise<void>

  /** 获取当前主题名称 */
  getCurrentTheme: () => string

  /** 获取当前颜色模式 */
  getCurrentMode: () => ColorMode

  /** 设置主题 */
  setTheme: (theme: string, mode?: ColorMode) => Promise<void>

  /** 设置颜色模式 */
  setMode: (mode: ColorMode) => Promise<void>

  /** 注册主题 */
  registerTheme: (config: ThemeConfig) => void

  /** 注册多个主题 */
  registerThemes: (configs: ThemeConfig[]) => void

  /** 获取主题配置 */
  getThemeConfig: (name: string) => ThemeConfig | undefined

  /** 获取所有主题名称 */
  getThemeNames: () => string[]

  /** 获取生成的主题数据 */
  getGeneratedTheme: (name: string) => GeneratedTheme | undefined

  /** 预生成主题 */
  preGenerateTheme: (name: string) => Promise<void>

  /** 预生成所有主题 */
  preGenerateAllThemes: () => Promise<void>

  /** 应用主题到页面 */
  applyTheme: (name: string, mode: ColorMode) => void

  /** 移除主题样式 */
  removeTheme: () => void

  /** 销毁实例 */
  destroy: () => void
}

/**
 * 事件类型
 */
export type ThemeEventType =
  | 'theme-changed'
  | 'mode-changed'
  | 'theme-registered'
  | 'theme-generated'
  | 'error'

/**
 * 事件监听器
 */
export type ThemeEventListener<T = any> = (data: T) => void

/**
 * 事件发射器接口
 */
export interface EventEmitter {
  /** 添加事件监听器 */
  on: <T = any>(event: ThemeEventType, listener: ThemeEventListener<T>) => void

  /** 移除事件监听器 */
  off: <T = any>(event: ThemeEventType, listener: ThemeEventListener<T>) => void

  /** 触发事件 */
  emit: <T = any>(event: ThemeEventType, data?: T) => void

  /** 添加一次性事件监听器 */
  once: <T = any>(event: ThemeEventType, listener: ThemeEventListener<T>) => void

  /** 移除所有监听器 */
  removeAllListeners: (event?: ThemeEventType) => void

  /** 获取事件的监听器数量 */
  listenerCount: (event: ThemeEventType) => number

  /** 获取所有事件类型 */
  eventNames: () => ThemeEventType[]
}

/**
 * 颜色生成器接口
 */
export interface ColorGenerator {
  /** 从主色调生成其他颜色 */
  generateColors: (primary: ColorValue) => Omit<ColorConfig, 'primary'>

  /** 生成色阶 */
  generateScale: (color: ColorValue, mode: ColorMode) => ColorScale

  /** 生成 CSS 变量 */
  generateCSSVariables: (
    scales: Record<ColorCategory, ColorScale>,
    prefix?: string
  ) => Record<string, ColorValue>

  /** 设置颜色模式 */
  setMode: (mode: ColorMode) => void

  /** 切换颜色模式 */
  toggleMode: () => ColorMode

  /** 获取当前颜色模式 */
  getCurrentMode: () => ColorMode

  /** 根据当前模式生成颜色 */
  generateColorsForCurrentMode: (primary: ColorValue) => Omit<ColorConfig, 'primary'>
}

/**
 * 系统主题检测器接口
 */
export interface SystemThemeDetector {
  /** 获取系统主题 */
  getSystemTheme: () => ColorMode

  /** 监听系统主题变化 */
  watchSystemTheme: (callback: (mode: ColorMode) => void) => () => void
}

/**
 * 闲时处理器接口
 */
export interface IdleProcessor {
  /** 添加闲时任务 */
  addTask: (task: () => void | Promise<void>, priority?: number) => void

  /** 开始处理 */
  start: () => void

  /** 停止处理 */
  stop: () => void

  /** 清空任务队列 */
  clear: () => void
}

/**
 * CSS 注入器接口
 */
export interface CSSInjector {
  /** 注入 CSS 变量 */
  injectVariables: (variables: Record<string, ColorValue>, id?: string) => void

  /** 移除 CSS 变量 */
  removeVariables: (id?: string) => void

  /** 更新 CSS 变量 */
  updateVariables: (variables: Record<string, ColorValue>, id?: string) => void
}
