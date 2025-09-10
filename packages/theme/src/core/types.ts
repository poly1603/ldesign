/**
 * @file 核心类型定义
 * @description 定义节日主题包的核心类型和接口
 */

import type { ThemeConfig, ColorMode } from '@ldesign/color'

/**
 * 节日类型枚举
 */
export enum FestivalType {
  /** 春节 */
  SPRING_FESTIVAL = 'spring-festival',
  /** 圣诞节 */
  CHRISTMAS = 'christmas',
  /** 万圣节 */
  HALLOWEEN = 'halloween',
  /** 情人节 */
  VALENTINES_DAY = 'valentines-day',
  /** 中秋节 */
  MID_AUTUMN = 'mid-autumn',
  /** 国庆节 */
  NATIONAL_DAY = 'national-day',
  /** 元宵节 */
  LANTERN_FESTIVAL = 'lantern-festival',
  /** 默认主题 */
  DEFAULT = 'default'
}

/**
 * 挂件类型枚举
 */
export enum WidgetType {
  /** 按钮挂件 */
  BUTTON = 'button',
  /** 面板挂件 */
  PANEL = 'panel',
  /** 背景装饰 */
  BACKGROUND = 'background',
  /** 动画挂件 */
  ANIMATION = 'animation',
  /** 图标挂件 */
  ICON = 'icon',
  /** 文本装饰 */
  TEXT = 'text',
  /** 边框装饰 */
  BORDER = 'border',
  /** 浮动挂件 */
  FLOATING = 'floating'
}

/**
 * 挂件位置配置
 */
export interface WidgetPosition {
  /** 定位类型 */
  type: 'fixed' | 'absolute' | 'relative' | 'static'
  /** 位置坐标 */
  position: {
    x: string | number
    y: string | number
  }
  /** 锚点位置 */
  anchor: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
}

/**
 * 挂件样式配置
 */
export interface WidgetStyle {
  /** 尺寸 */
  size?: {
    width?: string | number
    height?: string | number
  }
  /** 透明度 */
  opacity?: number
  /** 层级 */
  zIndex?: number
  /** 变换 */
  transform?: string
  /** 过滤器 */
  filter?: string
  /** 自定义 CSS */
  customCSS?: Record<string, string>
}

/**
 * 动画配置
 */
export interface AnimationConfig {
  /** 动画名称 */
  name: string
  /** 动画持续时间（毫秒） */
  duration?: number
  /** 动画延迟（毫秒） */
  delay?: number
  /** 动画缓动函数 */
  easing?: string
  /** 动画迭代次数 */
  iterations?: number | 'infinite'
  /** 动画方向 */
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  /** 动画填充模式 */
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
  /** 是否自动播放 */
  autoplay?: boolean
  /** 触发条件 */
  trigger?: 'load' | 'hover' | 'click' | 'scroll' | 'manual'
}

/**
 * 挂件配置接口
 */
export interface WidgetConfig {
  /** 挂件唯一标识 */
  id: string
  /** 挂件名称 */
  name: string
  /** 挂件类型 */
  type: WidgetType
  /** 挂件描述 */
  description?: string
  /** 挂件内容（SVG、图片URL、HTML等） */
  content: string
  /** 位置配置 */
  position?: WidgetPosition
  /** 样式配置 */
  style?: WidgetStyle
  /** 动画配置 */
  animation?: AnimationConfig
  /** 是否可交互 */
  interactive?: boolean
  /** 是否响应式 */
  responsive?: boolean
  /** 是否可见 */
  visible?: boolean
  /** 自定义属性 */
  customProps?: Record<string, any>
}

/**
 * 节日主题配置
 */
export interface FestivalThemeConfig {
  /** 主题唯一标识 */
  id: string
  /** 主题名称 */
  name: string
  /** 节日类型 */
  festival: FestivalType
  /** 主题描述 */
  description?: string
  /** 颜色配置（基于 @ldesign/color） */
  colors: ThemeConfig
  /** 挂件列表 */
  widgets: WidgetConfig[]
  /** 全局动画配置 */
  globalAnimations?: AnimationConfig[]
  /** 主题激活时的回调 */
  onActivate?: () => void | Promise<void>
  /** 主题停用时的回调 */
  onDeactivate?: () => void | Promise<void>
  /** 自定义配置 */
  customConfig?: Record<string, any>
}

/**
 * 主题管理器配置
 */
export interface ThemeManagerConfig {
  /** 默认主题 */
  defaultTheme?: FestivalType
  /** 可用主题列表 */
  themes: FestivalThemeConfig[]
  /** 是否自动激活主题 */
  autoActivate?: boolean
  /** 主题切换动画 */
  transitionAnimation?: AnimationConfig
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 缓存键名 */
  cacheKey?: string
  /** 是否同步系统主题 */
  syncSystemTheme?: boolean
}

/**
 * 挂件管理器配置
 */
export interface WidgetManagerConfig {
  /** 容器选择器 */
  container?: string | HTMLElement
  /** 是否启用性能监控 */
  enablePerformanceMonitoring?: boolean
  /** 最大挂件数量 */
  maxWidgets?: number
  /** 是否启用碰撞检测 */
  enableCollisionDetection?: boolean
}

/**
 * 主题事件类型
 */
export enum ThemeEventType {
  /** 主题切换前 */
  BEFORE_THEME_CHANGE = 'before-theme-change',
  /** 主题切换后 */
  AFTER_THEME_CHANGE = 'after-theme-change',
  /** 挂件添加 */
  WIDGET_ADDED = 'widget-added',
  /** 挂件移除 */
  WIDGET_REMOVED = 'widget-removed',
  /** 挂件更新 */
  WIDGET_UPDATED = 'widget-updated',
  /** 动画开始 */
  ANIMATION_START = 'animation-start',
  /** 动画结束 */
  ANIMATION_END = 'animation-end'
}

/**
 * 主题事件数据
 */
export interface ThemeEventData {
  /** 事件类型 */
  type: ThemeEventType
  /** 当前主题 */
  currentTheme?: FestivalType
  /** 之前的主题 */
  previousTheme?: FestivalType
  /** 相关挂件 */
  widget?: WidgetConfig
  /** 相关动画 */
  animation?: AnimationConfig
  /** 时间戳 */
  timestamp: number
  /** 额外数据 */
  data?: any
}

/**
 * 事件监听器类型
 */
export type ThemeEventListener = (event: ThemeEventData) => void | Promise<void>

/**
 * 主题管理器实例接口
 */
export interface IThemeManager {
  /** 当前主题 */
  readonly currentTheme: FestivalType | null
  /** 可用主题列表 */
  readonly availableThemes: FestivalType[]
  /** 是否已初始化 */
  readonly isInitialized: boolean

  /** 初始化主题管理器 */
  init(): Promise<void>
  /** 切换主题 */
  setTheme(theme: FestivalType): Promise<void>
  /** 获取主题配置 */
  getThemeConfig(theme: FestivalType): FestivalThemeConfig | null
  /** 添加主题 */
  addTheme(config: FestivalThemeConfig): void
  /** 移除主题 */
  removeTheme(theme: FestivalType): void
  /** 添加事件监听器 */
  addEventListener(type: ThemeEventType, listener: ThemeEventListener): void
  /** 移除事件监听器 */
  removeEventListener(type: ThemeEventType, listener: ThemeEventListener): void
  /** 销毁主题管理器 */
  destroy(): void
}

/**
 * 挂件管理器实例接口
 */
export interface IWidgetManager {
  /** 当前挂件列表 */
  readonly widgets: WidgetConfig[]
  /** 是否已初始化 */
  readonly isInitialized: boolean

  /** 初始化挂件管理器 */
  init(): Promise<void>
  /** 添加挂件 */
  addWidget(widget: WidgetConfig): Promise<void>
  /** 移除挂件 */
  removeWidget(id: string): Promise<void>
  /** 更新挂件 */
  updateWidget(id: string, updates: Partial<WidgetConfig>): Promise<void>
  /** 获取挂件 */
  getWidget(id: string): WidgetConfig | null
  /** 清空所有挂件 */
  clearWidgets(): Promise<void>
  /** 显示挂件 */
  showWidget(id: string): Promise<void>
  /** 隐藏挂件 */
  hideWidget(id: string): Promise<void>
  /** 销毁挂件管理器 */
  destroy(): void
}

/**
 * 动画引擎接口
 */
export interface IAnimationEngine {
  /** 播放动画 */
  play(element: HTMLElement, animation: AnimationConfig): Promise<void>
  /** 停止动画 */
  stop(element: HTMLElement): void
  /** 暂停动画 */
  pause(element: HTMLElement): void
  /** 恢复动画 */
  resume(element: HTMLElement): void
  /** 注册自定义动画 */
  registerAnimation(name: string, keyframes: Keyframe[], options?: KeyframeAnimationOptions): void
  /** 销毁动画引擎 */
  destroy(): void
}
