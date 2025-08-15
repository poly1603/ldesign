/**
 * @ldesign/theme - 核心类型定义
 *
 * 定义主题系统的所有核心接口和类型
 */

import type { ThemeConfig as ColorThemeConfig, ColorMode } from '@ldesign/color'

/**
 * 主题类别
 */
export type ThemeCategory = 'festival' | 'seasonal' | 'custom' | 'business'

/**
 * 节日类型
 */
export type FestivalType =
  | 'christmas'
  | 'spring-festival'
  | 'halloween'
  | 'valentine'
  | 'easter'
  | 'thanksgiving'

/**
 * 装饰元素类型
 */
export type DecorationType = 'image' | 'icon' | 'pattern' | 'particle' | 'svg'

/**
 * 动画类型
 */
export type AnimationType = 'css' | 'js' | 'canvas' | 'webgl'

/**
 * 位置配置
 */
export interface Position {
  x: number | string
  y: number | string
  z?: number
}

/**
 * 尺寸配置
 */
export interface Size {
  width: number | string
  height: number | string
}

/**
 * 时间范围配置（用于自动激活节日主题）
 */
export interface TimeRange {
  start: string // ISO 日期字符串或 MM-DD 格式
  end: string
  timezone?: string
}

/**
 * 装饰元素位置配置
 */
export interface DecorationPosition {
  type: 'absolute' | 'relative' | 'fixed' | 'sticky'
  position: Position
  anchor?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  offset?: Position
}

/**
 * 装饰元素样式配置
 */
export interface DecorationStyle {
  size: Size
  opacity?: number
  rotation?: number
  scale?: number
  zIndex?: number
  filter?: string
  transform?: string
  transition?: string
}

/**
 * 装饰元素配置
 */
export interface DecorationConfig {
  id: string
  name: string
  type: DecorationType
  src: string // 资源路径
  position: DecorationPosition
  style: DecorationStyle
  animation?: string // 动画名称
  interactive?: boolean
  responsive?: boolean
  conditions?: DecorationCondition[]
}

/**
 * 装饰元素显示条件
 */
export interface DecorationCondition {
  type: 'screen-size' | 'time' | 'user-preference' | 'performance'
  value: any
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not-in'
}

/**
 * 动画配置
 */
export interface AnimationConfig {
  name: string
  type: AnimationType
  duration: number
  delay?: number
  timing?: string
  iterations?: number | 'infinite'
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
  playState?: 'running' | 'paused'
  elements?: string[] // CSS 选择器
  keyframes?: AnimationKeyframe[]
  easing?: string
  performance?: AnimationPerformance
}

/**
 * 动画关键帧
 */
export interface AnimationKeyframe {
  offset: number // 0-1
  properties: Record<string, any>
  easing?: string
}

/**
 * 动画性能配置
 */
export interface AnimationPerformance {
  useGPU?: boolean
  willChange?: string[]
  transform3d?: boolean
  backfaceVisibility?: 'visible' | 'hidden'
}

/**
 * 资源配置
 */
export interface ResourceConfig {
  images: Record<string, string>
  icons: Record<string, string>
  sounds?: Record<string, string>
  fonts?: Record<string, string>
  preload?: string[]
  lazy?: string[]
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  name: string
  displayName: string
  description?: string
  category: ThemeCategory
  festival?: FestivalType
  version: string
  author?: string

  // 颜色配置（集成 @ldesign/color）
  colors: ColorThemeConfig

  // 装饰元素配置
  decorations: DecorationConfig[]

  // 动画配置
  animations: AnimationConfig[]

  // 资源配置
  resources: ResourceConfig

  // 自动激活时间范围
  timeRange?: TimeRange

  // 主题标签
  tags?: string[]

  // 主题预览图
  preview?: string

  // 兼容性配置
  compatibility?: ThemeCompatibility
}

/**
 * 主题兼容性配置
 */
export interface ThemeCompatibility {
  minVersion?: string
  maxVersion?: string
  browsers?: string[]
  features?: string[]
}

/**
 * 主题管理器选项
 */
export interface ThemeManagerOptions {
  themes?: ThemeConfig[]
  defaultTheme?: string
  autoActivate?: boolean
  performance?: PerformanceOptions
  storage?: StorageOptions
  debug?: boolean
}

/**
 * 性能选项
 */
export interface PerformanceOptions {
  enableGPU?: boolean
  maxDecorations?: number
  animationQuality?: 'low' | 'medium' | 'high'
  preloadStrategy?: 'none' | 'critical' | 'all'
  memoryLimit?: number
}

/**
 * 存储选项
 */
export interface StorageOptions {
  key?: string
  storage?: 'localStorage' | 'sessionStorage' | 'memory'
  serialize?: (data: any) => string
  deserialize?: (data: string) => any
}

/**
 * 主题事件类型
 */
export type ThemeEventType =
  | 'theme-changed'
  | 'theme-loaded'
  | 'theme-error'
  | 'decoration-added'
  | 'decoration-removed'
  | 'animation-started'
  | 'animation-ended'
  | 'resource-loaded'
  | 'resource-error'

/**
 * 主题事件数据
 */
export interface ThemeEventData {
  type: ThemeEventType
  theme?: string
  decoration?: string
  animation?: string
  resource?: string
  error?: Error
  timestamp: number
}

/**
 * 主题事件监听器
 */
export type ThemeEventListener = (data: ThemeEventData) => void

/**
 * 主题管理器实例接口
 */
export interface ThemeManagerInstance {
  // 主题管理
  setTheme(name: string): Promise<void>
  getTheme(name: string): ThemeConfig | undefined
  getCurrentTheme(): string | undefined
  getAvailableThemes(): string[]
  addTheme(theme: ThemeConfig): void
  removeTheme(name: string): void

  // 装饰管理
  addDecoration(decoration: DecorationConfig): void
  removeDecoration(id: string): void
  updateDecoration(id: string, updates: Partial<DecorationConfig>): void
  getDecorations(): DecorationConfig[]

  // 动画管理
  startAnimation(name: string): void
  stopAnimation(name: string): void
  pauseAnimation(name: string): void
  resumeAnimation(name: string): void

  // 资源管理
  preloadResources(theme: string): Promise<void>
  clearResources(theme?: string): void

  // 事件管理
  on(event: ThemeEventType, listener: ThemeEventListener): void
  off(event: ThemeEventType, listener: ThemeEventListener): void
  emit(
    event: ThemeEventType,
    data: Omit<ThemeEventData, 'type' | 'timestamp'>
  ): void

  // 生命周期
  init(): Promise<void>
  destroy(): void
}

/**
 * 装饰管理器接口
 */
export interface DecorationManagerInstance {
  add(decoration: DecorationConfig): void
  remove(id: string): void
  update(id: string, updates: Partial<DecorationConfig>): void
  get(id: string): DecorationConfig | undefined
  getAll(): DecorationConfig[]
  clear(): void
  render(): void
  destroy(): void
}

/**
 * 动画管理器接口
 */
export interface AnimationManagerInstance {
  register(animation: AnimationConfig): void
  unregister(name: string): void
  start(name: string): void
  stop(name: string): void
  pause(name: string): void
  resume(name: string): void
  getAll(): AnimationConfig[]
  isRunning(name: string): boolean
  destroy(): void
}

/**
 * 资源管理器接口
 */
export interface ResourceManagerInstance {
  load(src: string, type?: string): Promise<any>
  preload(resources: string[]): Promise<void>
  get(src: string): any
  clear(pattern?: string): void
  getStats(): ResourceStats
  destroy(): void
}

/**
 * 资源统计信息
 */
export interface ResourceStats {
  total: number
  loaded: number
  failed: number
  cached: number
  memoryUsage: number
}
