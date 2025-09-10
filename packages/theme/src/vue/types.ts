/**
 * @file Vue 3 类型定义
 * @description Vue 3 集成相关的类型定义
 */

import type { App } from 'vue'
import type { 
  FestivalType, 
  FestivalThemeConfig, 
  WidgetConfig, 
  AnimationConfig,
  ThemeManagerConfig 
} from '../core/types'

/**
 * Vue 主题插件选项
 */
export interface VueThemePluginOptions extends Omit<ThemeManagerConfig, 'themes'> {
  /** 主题列表 */
  themes?: FestivalThemeConfig[]
  /** 是否全局注册组件 */
  registerComponents?: boolean
  /** 是否全局注册指令 */
  registerDirectives?: boolean
  /** 组件名称前缀 */
  componentPrefix?: string
  /** 指令名称前缀 */
  directivePrefix?: string
}

/**
 * Vue 主题插件实例
 */
export interface VueThemePluginInstance {
  /** 安装插件 */
  install(app: App, options?: VueThemePluginOptions): void
}

/**
 * 主题提供者组件属性
 */
export interface ThemeProviderProps {
  /** 主题列表 */
  themes?: FestivalThemeConfig[]
  /** 当前主题 */
  theme?: FestivalType
  /** 是否自动激活 */
  autoActivate?: boolean
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 缓存键名 */
  cacheKey?: string
}

/**
 * 主题选择器组件属性
 */
export interface ThemeSelectorProps {
  /** 当前选中的主题 */
  modelValue?: FestivalType
  /** 可选主题列表 */
  themes?: FestivalType[]
  /** 选择器类型 */
  type?: 'dropdown' | 'tabs' | 'radio' | 'buttons'
  /** 是否显示主题预览 */
  showPreview?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义类名 */
  class?: string
  /** 自定义样式 */
  style?: Record<string, string>
}

/**
 * 主题按钮组件属性
 */
export interface ThemeButtonProps {
  /** 按钮类型 */
  type?: 'primary' | 'secondary' | 'default'
  /** 按钮大小 */
  size?: 'small' | 'medium' | 'large'
  /** 装饰类型 */
  decoration?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 自定义类名 */
  class?: string
  /** 自定义样式 */
  style?: Record<string, string>
}

/**
 * 挂件容器组件属性
 */
export interface WidgetContainerProps {
  /** 挂件列表 */
  widgets?: WidgetConfig[]
  /** 容器类名 */
  containerClass?: string
  /** 容器样式 */
  containerStyle?: Record<string, string>
  /** 是否启用性能监控 */
  enablePerformanceMonitoring?: boolean
  /** 最大挂件数量 */
  maxWidgets?: number
  /** 是否启用碰撞检测 */
  enableCollisionDetection?: boolean
}

/**
 * 动画包装器组件属性
 */
export interface AnimationWrapperProps {
  /** 动画配置 */
  animation?: AnimationConfig
  /** 是否自动播放 */
  autoplay?: boolean
  /** 触发条件 */
  trigger?: 'load' | 'hover' | 'click' | 'scroll' | 'manual'
  /** 自定义类名 */
  class?: string
  /** 自定义样式 */
  style?: Record<string, string>
}

/**
 * 主题装饰指令绑定值
 */
export interface ThemeDecorationDirectiveBinding {
  /** 装饰类型 */
  decoration?: string
  /** 是否可见 */
  visible?: boolean
  /** 位置配置 */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  /** 自定义配置 */
  config?: Partial<WidgetConfig>
}

/**
 * 主题动画指令绑定值
 */
export interface ThemeAnimationDirectiveBinding {
  /** 动画名称 */
  animation?: string
  /** 触发条件 */
  trigger?: 'hover' | 'click' | 'load' | 'manual'
  /** 是否自动播放 */
  autoplay?: boolean
  /** 自定义配置 */
  config?: Partial<AnimationConfig>
}

/**
 * 挂件容器指令绑定值
 */
export interface WidgetContainerDirectiveBinding {
  /** 挂件列表 */
  widgets?: WidgetConfig[]
  /** 是否启用 */
  enabled?: boolean
  /** 最大挂件数量 */
  maxWidgets?: number
}

/**
 * 组合式函数返回类型
 */
export interface UseThemeReturn {
  /** 当前主题 */
  currentTheme: Ref<FestivalType | null>
  /** 可用主题列表 */
  availableThemes: Ref<FestivalType[]>
  /** 是否已初始化 */
  isInitialized: Ref<boolean>
  /** 是否正在切换主题 */
  isTransitioning: Ref<boolean>
  /** 设置主题 */
  setTheme: (theme: FestivalType) => Promise<void>
  /** 获取主题配置 */
  getThemeConfig: (theme: FestivalType) => FestivalThemeConfig | null
  /** 添加主题 */
  addTheme: (config: FestivalThemeConfig) => void
  /** 移除主题 */
  removeTheme: (theme: FestivalType) => void
}

export interface UseThemeSelectorReturn {
  /** 选中的主题 */
  selectedTheme: Ref<FestivalType | null>
  /** 可选主题列表 */
  selectableThemes: Ref<FestivalType[]>
  /** 选择主题 */
  selectTheme: (theme: FestivalType) => Promise<void>
  /** 下一个主题 */
  nextTheme: () => Promise<void>
  /** 上一个主题 */
  previousTheme: () => Promise<void>
}

export interface UseThemeToggleReturn {
  /** 当前主题 */
  currentTheme: Ref<FestivalType | null>
  /** 切换主题 */
  toggleTheme: () => Promise<void>
  /** 是否可以切换 */
  canToggle: Ref<boolean>
}

export interface UseWidgetsReturn {
  /** 挂件列表 */
  widgets: Ref<WidgetConfig[]>
  /** 添加挂件 */
  addWidget: (widget: WidgetConfig) => Promise<void>
  /** 移除挂件 */
  removeWidget: (id: string) => Promise<void>
  /** 更新挂件 */
  updateWidget: (id: string, updates: Partial<WidgetConfig>) => Promise<void>
  /** 清空挂件 */
  clearWidgets: () => Promise<void>
  /** 显示挂件 */
  showWidget: (id: string) => Promise<void>
  /** 隐藏挂件 */
  hideWidget: (id: string) => Promise<void>
}

export interface UseAnimationsReturn {
  /** 播放动画 */
  playAnimation: (element: HTMLElement, config: AnimationConfig) => Promise<void>
  /** 停止动画 */
  stopAnimation: (element: HTMLElement) => void
  /** 暂停动画 */
  pauseAnimation: (element: HTMLElement) => void
  /** 恢复动画 */
  resumeAnimation: (element: HTMLElement) => void
  /** 注册动画 */
  registerAnimation: (name: string, keyframes: Keyframe[], options?: KeyframeAnimationOptions) => void
}

export interface UseResponsiveWidgetsReturn {
  /** 是否为移动设备 */
  isMobile: Ref<boolean>
  /** 是否为平板设备 */
  isTablet: Ref<boolean>
  /** 是否为桌面设备 */
  isDesktop: Ref<boolean>
  /** 屏幕宽度 */
  screenWidth: Ref<number>
  /** 屏幕高度 */
  screenHeight: Ref<number>
  /** 根据设备类型过滤挂件 */
  filterWidgetsByDevice: (widgets: WidgetConfig[]) => WidgetConfig[]
}

// 重新导出 Vue 相关类型
import type { Ref } from 'vue'
