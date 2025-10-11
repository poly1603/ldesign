/**
 * 主题色管理系统核心类型定义
 */

/**
 * HEX 颜色值类型 - 支持 #RRGGBB 和 #RGB 格式
 */
export type HexColor = `#${string}`

/**
 * RGB 颜色值类型 - 支持 rgb() 和 rgba() 格式
 */
export type RgbColor = `rgb(${string})` | `rgba(${string})`

/**
 * HSL 颜色值类型 - 支持 hsl() 和 hsla() 格式
 */
export type HslColor = `hsl(${string})` | `hsla(${string})`

/**
 * HSV 颜色值类型 - 支持 hsv() 格式
 */
export type HsvColor = `hsv(${string})`

/**
 * CSS 命名颜色类型
 */
export type NamedColor =
  | 'red'
  | 'green'
  | 'blue'
  | 'white'
  | 'black'
  | 'transparent'
  | 'currentColor'
  | string

/**
 * 颜色值类型 - 支持 hex、rgb、hsl、hsv 等格式
 */
export type ColorValue = HexColor | RgbColor | HslColor | HsvColor | NamedColor

/**
 * 颜色模式
 */
export type ColorMode = 'light' | 'dark'

/**
 * 主题类型
 */
export type ThemeType = 'system' | 'light' | 'dark' | 'custom'

/**
 * 颜色格式类型
 */
export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsv' | 'lab' | 'named'

/**
 * 颜色空间类型
 */
export type ColorSpace = 'srgb' | 'p3' | 'rec2020' | 'lab' | 'xyz'

/**
 * 基础颜色类别（向后兼容）
 */
export type BaseColorCategory = 'primary' | 'success' | 'warning' | 'danger' | 'gray'

/**
 * 扩展颜色类别
 */
export type ExtendedColorCategory = 'secondary' | 'accent' | 'info' | 'neutral'

/**
 * 完整颜色类别
 */
export type ColorCategory = BaseColorCategory | ExtendedColorCategory

/**
 * WCAG 对比度等级
 */
export type WCAGLevel = 'AA' | 'AAA'

/**
 * 文本大小类型
 */
export type TextSize = 'small' | 'normal' | 'large'

/**
 * 颜色验证结果接口
 */
export interface ColorValidationResult {
  /** 是否有效 */
  isValid: boolean
  /** 错误信息 */
  error?: string
  /** 规范化后的颜色值 */
  normalized?: ColorValue
  /** 检测到的颜色格式 */
  format?: ColorFormat
}

/**
 * 颜色转换选项接口
 */
export interface ColorConversionOptions {
  /** 目标颜色格式 */
  targetFormat: ColorFormat
  /** 是否保留透明度 */
  preserveAlpha?: boolean
  /** 精度（小数位数） */
  precision?: number
  /** 是否使用缓存 */
  useCache?: boolean
}

/**
 * 颜色分析结果接口
 */
export interface ColorAnalysisResult {
  /** 颜色值 */
  color: ColorValue
  /** 亮度 (0-100) */
  brightness: number
  /** 饱和度 (0-100) */
  saturation: number
  /** 色相 (0-360) */
  hue: number
  /** 是否为暗色 */
  isDark: boolean
  /** 是否为亮色 */
  isLight: boolean
  /** 主导色调 */
  dominantTone: 'warm' | 'cool' | 'neutral'
  /** 颜色温度 */
  temperature: number
}

/**
 * 中性色类别
 */
export type NeutralColorCategory = 'border' | 'background' | 'text' | 'white' | 'shadow'

/**
 * 基础颜色配置接口
 */
export interface BaseColorConfig {
  /** 主色调 */
  primary: ColorValue
}

/**
 * 完整颜色配置接口
 */
export interface ColorConfig extends BaseColorConfig {
  /** 次要色调 - 可选，不提供时自动生成 */
  secondary?: ColorValue
  /** 强调色 - 可选，不提供时自动生成 */
  accent?: ColorValue
  /** 信息色 - 可选，不提供时自动生成 */
  info?: ColorValue
  /** 成功色 - 可选，不提供时自动生成 */
  success?: ColorValue
  /** 警告色 - 可选，不提供时自动生成 */
  warning?: ColorValue
  /** 危险色 - 可选，不提供时自动生成 */
  danger?: ColorValue
  /** 灰色 - 可选，不提供时自动生成 */
  gray?: ColorValue
  /** 中性色 - 可选，不提供时自动生成 */
  neutral?: ColorValue
}

/**
 * 严格的颜色配置接口（所有颜色都必须提供）
 */
export interface StrictColorConfig extends Required<ColorConfig> {}

/**
 * 色阶配置
 */
export interface ColorScale<T extends ColorValue = ColorValue> {
  /** 色阶数组，从浅到深 */
  colors: T[]
  /** 色阶索引映射 */
  indices: Record<number, T>
  /** 色阶元数据 */
  metadata?: {
    /** 基础颜色 */
    baseColor: T
    /** 生成算法 */
    algorithm: 'linear' | 'bezier' | 'perceptual'
    /** 色阶数量 */
    steps: number
    /** 生成时间戳 */
    timestamp: number
  }
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
 * 主题元数据接口
 */
export interface ThemeMetadata {
  /** 主题作者 */
  author?: string
  /** 主题版本 */
  version?: string
  /** 主题标签 */
  tags?: string[]
  /** 创建时间 */
  createdAt?: string
  /** 更新时间 */
  updatedAt?: string
  /** 主题预览图 */
  preview?: string
  /** 是否支持暗色模式 */
  supportsDarkMode?: boolean
  /** 推荐使用场景 */
  recommendedFor?: ('web' | 'mobile' | 'desktop' | 'print')[]
}

/**
 * 基础主题配置接口
 */
export interface BaseThemeConfig {
  /** 主题名称（唯一标识符） */
  name: string
  /** 主题显示名称 */
  displayName?: string
  /** 主题描述 */
  description?: string
  /** 是否为内置主题 */
  builtin?: boolean
  /** 主题元数据 */
  meta?: ThemeMetadata
}

/**
 * 主题配置接口
 */
export interface ThemeConfig extends BaseThemeConfig {
  /** 亮色模式颜色配置 */
  light: ColorConfig
  /** 暗色模式颜色配置 */
  dark?: ColorConfig
  /** 简化的颜色配置（用于快速配置） */
  colors?: Record<string, ColorValue>
}

/**
 * 严格的主题配置接口（必须包含暗色模式）
 */
export interface StrictThemeConfig extends BaseThemeConfig {
  /** 亮色模式颜色配置 */
  light: StrictColorConfig
  /** 暗色模式颜色配置 */
  dark: StrictColorConfig
}

/**
 * CSS 变量组
 */
export interface CSSVariableGroup {
  /** 注释说明 */
  comment: string
  /** 变量集合 */
  variables: Record<string, ColorValue>
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
    scales: Record<string, ColorScale>
    /** CSS 变量组 */
    cssVariableGroups: CSSVariableGroup[]
    /** CSS 变量（兼容旧版本） */
    cssVariables: Record<string, ColorValue>
  }
  /** 暗色模式数据 */
  dark: {
    /** 各颜色类别的色阶 */
    scales: Record<string, ColorScale>
    /** CSS 变量组 */
    cssVariableGroups: CSSVariableGroup[]
    /** CSS 变量（兼容旧版本） */
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
export interface CacheItem<T = unknown> {
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
  
  /** 获取缓存统计信息（可选）*/
  getStats?: () => {
    hits: number
    misses: number
    evictions: number
    expirations: number
    size: number
    hitRate: number
  }
  
  /** 手动清理过期条目（可选）*/
  cleanup?: () => number
  
  /** 销毁缓存实例（可选）*/
  destroy?: () => void
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
  /** 是否尝试使用 Constructable Stylesheet 进行 CSS 注入 */
  useConstructableCss?: boolean
  /** 是否在注入时自动应用对比度优化（高对比度覆盖） */
  autoAdjustContrast?: boolean
  /** 目标对比度等级 */
  contrastLevel?: WCAGLevel
  /** 文本大小，用于对比度阈值 */
  textSize?: TextSize
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

  /** 渲染（SSR）主题 CSS 文本（包含 light/dark 两套） */
  renderThemeCSS: (
    name: string,
    mode?: ColorMode,
    options?: { includeComments?: boolean }
  ) => Promise<string>

  /** 接管（hydrate）SSR 注入的样式标签，避免重复插入与闪烁 */
  hydrateMountedStyles: (idOrSelector?: string) => void

  /** 移除主题样式 */
  removeTheme: () => void

  /**
   * 将主题作用域应用到指定容器
   * 为容器分配 data-theme-scope，并注入仅对该容器生效的 CSS 变量
   */
  applyThemeTo: (root: Element, theme?: string, mode?: ColorMode) => Promise<void>

  /**
   * 从指定容器移除作用域主题
   */
  removeThemeFrom: (root: Element) => void

  /** 销毁实例 */
  destroy: () => void

  /** 启用/禁用高对比度覆盖 */
  enableHighContrast: (
    enable: boolean,
    options?: { level?: WCAGLevel, textSize?: TextSize }
  ) => void

  /** 是否启用了高对比度覆盖 */
  isHighContrastEnabled: () => boolean
}

/**
 * 事件类型
 */
export type ThemeEventType =
  | 'theme-changed'
  | 'mode-changed'
  | 'theme-registered'
  | 'theme-unregistered'
  | 'theme-generated'
  | 'theme-applied'
  | 'theme-removed'
  | 'cache-cleared'
  | 'error'
  | 'warning'

/**
 * 主题变更事件数据
 */
export interface ThemeChangeEventData {
  /** 主题名称 */
  theme: string
  /** 颜色模式 */
  mode: ColorMode
  /** 之前的主题 */
  previousTheme?: string
  /** 之前的模式 */
  previousMode?: ColorMode
  /** 变更时间戳 */
  timestamp: number
}

/**
 * 模式变更事件数据
 */
export interface ModeChangeEventData {
  /** 新模式 */
  mode: ColorMode
  /** 之前的模式 */
  previousMode: ColorMode
  /** 主题名称 */
  theme: string
  /** 变更时间戳 */
  timestamp: number
}

/**
 * 错误事件数据
 */
export interface ErrorEventData {
  /** 错误信息 */
  message: string
  /** 错误代码 */
  code?: string
  /** 错误详情 */
  details?: unknown
  /** 错误时间戳 */
  timestamp: number
}

/**
 * 事件数据类型映射
 */
export interface ThemeEventDataMap {
  'theme-changed': ThemeChangeEventData
  'mode-changed': ModeChangeEventData
  'theme-registered': { theme: string, config: ThemeConfig }
  'theme-unregistered': { theme: string }
  'theme-generated': { theme: string, mode: ColorMode }
  'theme-applied': { theme: string, mode: ColorMode }
  'theme-removed': { theme: string }
  'cache-cleared': { type: 'all' | 'theme' | 'color' }
  'error': ErrorEventData
  'warning': { message: string, details?: unknown }
}

/**
 * 事件监听器
 */
export type ThemeEventListener<K extends ThemeEventType = ThemeEventType> = (
  data: ThemeEventDataMap[K]
) => void

/**
 * 事件发射器接口
 */
export interface EventEmitter {
  /** 添加事件监听器 */
  on: <K extends ThemeEventType>(event: K, listener: ThemeEventListener<K>) => void

  /** 移除事件监听器 */
  off: <K extends ThemeEventType>(event: K, listener: ThemeEventListener<K>) => void

  /** 触发事件 */
  emit: <K extends ThemeEventType>(event: K, data: ThemeEventDataMap[K]) => void

  /** 添加一次性事件监听器 */
  once: <K extends ThemeEventType>(event: K, listener: ThemeEventListener<K>) => void

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

  /** 获取队列状态 */
  getQueueStatus: () => {
    length: number
    isRunning: boolean
    isProcessing: boolean
  }
}

/**
 * CSS 注入器接口
 */
export interface CSSInjector {
  /** 注入 CSS 变量 */
  injectVariables: (
    variables: Record<string, ColorValue>,
    id?: string,
    themeInfo?: { name?: string, mode?: string, primaryColor?: string }
  ) => void

  /** 注入带注释的 CSS 变量 */
  injectVariablesWithComments: (variableGroups: CSSVariableGroup[], id?: string) => void

  /** 注入主题变量（亮暗两套）并带注释 */
  injectThemeVariables?: (
    lightVariables: Record<string, string>,
    darkVariables: Record<string, string>,
    themeInfo?: { name: string, primaryColor: string },
    id?: string
  ) => void

  /** 构建主题 CSS 文本（不注入，仅返回字符串） */
  buildThemeCSSText?: (
    lightVariables: Record<string, string>,
    darkVariables: Record<string, string>,
    themeInfo?: { name: string, primaryColor: string }
  ) => string

  /** 采用（hydrate）已有的样式标签，纳入管理 */
  hydrate?: (id?: string) => void

  /** 获取所有注入的样式 ID */
  getInjectedIds?: () => string[]

  /** 移除 CSS 变量 */
  removeVariables: (id?: string) => void

  /** 更新 CSS 变量 */
  updateVariables: (variables: Record<string, ColorValue>, id?: string) => void
}
