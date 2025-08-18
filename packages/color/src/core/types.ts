/**
 * @ldesign/color 核心类型定义
 *
 * 本文件定义了整个主题色彩管理系统的核心类型接口，
 * 包括主题配置、颜色管理、事件系统等关键类型。
 *
 * @version 0.1.0
 * @author ldesign
 */

// ==================== 基础类型定义 ====================

/**
 * 颜色值类型
 * 支持十六进制、RGB、HSL等多种格式
 */
export type ColorValue = string

/**
 * 颜色模式
 * 支持明暗两种模式
 */
export type ColorMode = 'light' | 'dark'

/**
 * 主题类型
 * 支持系统、明色、暗色、自定义四种类型
 */
export type ThemeType = 'system' | 'light' | 'dark' | 'custom'

/**
 * 颜色类别
 * 定义了系统中支持的所有颜色类别
 */
export type ColorCategory =
  | 'primary' // 主色调
  | 'secondary' // 次要色调
  | 'accent' // 强调色
  | 'success' // 成功色
  | 'warning' // 警告色
  | 'danger' // 危险色
  | 'gray' // 灰色系

/**
 * 中性色类别
 * 用于界面元素的中性色彩
 */
export type NeutralColorCategory =
  | 'border' // 边框色
  | 'background' // 背景色
  | 'text' // 文字色
  | 'white' // 白色变体
  | 'shadow' // 阴影色

// ==================== 颜色配置接口 ====================

/**
 * 颜色配置接口
 * 定义了主题中各个颜色类别的配置
 */
export interface ColorConfig {
  /** 主色调 - 必填，用于品牌识别 */
  primary: ColorValue
  /** 次要色调 - 可选，不提供时自动生成 */
  secondary?: ColorValue
  /** 强调色 - 可选，不提供时自动生成 */
  accent?: ColorValue
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
 * 颜色色阶接口
 * 定义了某个颜色类别的完整色阶
 */
export interface ColorScale {
  /** 色阶数组，从浅到深排列 */
  colors: ColorValue[]
  /** 色阶索引映射，方便按索引访问 */
  indices: Record<number, ColorValue>
}

/**
 * 中性色系统接口
 * 定义了界面元素的中性色彩系统
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

// ==================== 主题配置接口 ====================

/**
 * 主题配置接口
 * 定义了完整的主题配置结构
 */
export interface ThemeConfig {
  /** 主题名称 - 唯一标识符 */
  name: string
  /** 主题显示名称 - 用于UI展示 */
  displayName?: string
  /** 主题描述 - 详细说明 */
  description?: string
  /** 亮色模式颜色配置 */
  light: ColorConfig
  /** 暗色模式颜色配置 - 可选，不提供时自动生成 */
  dark?: ColorConfig
  /** 是否为内置主题 */
  builtin?: boolean
  /** 主题元数据 - 扩展信息 */
  meta?: Record<string, unknown>
}

/**
 * 生成的主题数据接口
 * 包含完整的主题生成结果
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

// ==================== 存储系统接口 ====================

/**
 * 存储接口
 * 定义了统一的存储操作接口
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
 * 定义了缓存系统中的单个缓存项
 */
export interface CacheItem<T = unknown> {
  /** 缓存值 */
  value: T
  /** 过期时间戳 */
  expires: number
  /** 访问时间戳 */
  accessed: number
}

/**
 * 缓存配置选项
 */
export interface CacheOptions {
  /** 最大缓存数量 */
  maxSize?: number
  /** 默认过期时间（毫秒） */
  defaultTTL?: number
}

/**
 * LRU缓存接口
 * 实现了最近最少使用算法的缓存
 */
export interface LRUCache<T = unknown> {
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

// ==================== 主题管理器接口 ====================

/**
 * 主题管理器配置选项
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
 * 定义了主题管理器的完整功能
 */
export interface ThemeManagerInstance extends EventEmitter {
  /** 初始化主题管理器 */
  init: () => Promise<void>

  /** 获取当前主题名称 */
  getCurrentTheme: () => string

  /** 获取当前颜色模式 */
  getCurrentMode: () => ColorMode

  /** 设置主题 */
  setTheme: (theme: string, mode?: ColorMode) => Promise<void>

  /** 设置颜色模式 */
  setMode: (mode: ColorMode) => Promise<void>

  /** 切换颜色模式 */
  toggleMode: () => Promise<void>

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

// ==================== 事件系统接口 ====================

/**
 * 主题事件类型
 */
export type ThemeEventType =
  | 'theme-changed' // 主题变更
  | 'mode-changed' // 模式变更
  | 'theme-registered' // 主题注册
  | 'theme-generated' // 主题生成
  | 'error' // 错误事件

/**
 * 主题事件监听器类型
 */
export type ThemeEventListener<T = unknown> = (data: T) => void

/**
 * 事件发射器接口
 * 实现了观察者模式的事件系统
 */
export interface EventEmitter {
  /** 添加事件监听器 */
  on: <T = unknown>(
    event: ThemeEventType,
    listener: ThemeEventListener<T>
  ) => void

  /** 移除事件监听器 */
  off: <T = unknown>(
    event: ThemeEventType,
    listener: ThemeEventListener<T>
  ) => void

  /** 触发事件 */
  emit: <T = unknown>(event: ThemeEventType, data?: T) => void

  /** 添加一次性事件监听器 */
  once: <T = unknown>(
    event: ThemeEventType,
    listener: ThemeEventListener<T>
  ) => void

  /** 移除所有监听器 */
  removeAllListeners: (event?: ThemeEventType) => void

  /** 获取事件的监听器数量 */
  listenerCount: (event: ThemeEventType) => number

  /** 获取所有事件类型 */
  eventNames: () => ThemeEventType[]
}

// ==================== 工具接口 ====================

/**
 * 颜色生成器接口
 * 负责从主色调生成配套颜色
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
  generateColorsForCurrentMode: (
    primary: ColorValue
  ) => Omit<ColorConfig, 'primary'>
}

/**
 * 系统主题检测器接口
 * 负责检测和监听系统主题变化
 */
export interface SystemThemeDetector {
  /** 获取系统主题 */
  getSystemTheme: () => ColorMode

  /** 监听系统主题变化 */
  watchSystemTheme: (callback: (mode: ColorMode) => void) => () => void
}

/**
 * 闲时处理器接口
 * 利用浏览器空闲时间处理非紧急任务
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
 * CSS注入器接口
 * 负责将CSS变量注入到页面中
 */
export interface CSSInjector {
  /** 注入 CSS 变量 */
  injectVariables: (variables: Record<string, ColorValue>, id?: string) => void

  /** 移除 CSS 变量 */
  removeVariables: (id?: string) => void

  /** 更新 CSS 变量 */
  updateVariables: (variables: Record<string, ColorValue>, id?: string) => void
}
