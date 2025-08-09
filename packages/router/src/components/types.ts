import type { RouteLocationNormalized, RouteLocationRaw } from '../types'

/**
 * RouterView 组件属性
 */
export interface RouterViewProps {
  /**
   * 视图名称
   */
  name?: string
  /**
   * 路由对象
   */
  route?: RouteLocationNormalized
}

/**
 * RouterLink 组件属性
 */
export interface RouterLinkProps {
  /**
   * 目标路由
   */
  to: RouteLocationRaw
  /**
   * 是否替换当前历史记录
   */
  replace?: boolean
  /**
   * 激活时的类名
   */
  activeClass?: string
  /**
   * 精确激活时的类名
   */
  exactActiveClass?: string
  /**
   * 是否精确匹配
   */
  exact?: boolean
  /**
   * 渲染的标签
   */
  tag?: string
  /**
   * 触发导航的事件
   */
  event?: string | string[]
  /**
   * 是否追加路径
   */
  append?: boolean
  /**
   * 是否自定义渲染
   */
  custom?: boolean
}

/**
 * RouterLink 插槽参数
 */
export interface RouterLinkSlotProps {
  /**
   * 链接地址
   */
  href: string
  /**
   * 解析的路由
   */
  route: RouteLocationNormalized | null
  /**
   * 导航函数
   */
  navigate: (e: Event) => void
  /**
   * 是否激活
   */
  isActive: boolean
  /**
   * 是否精确激活
   */
  isExactActive: boolean
}

/**
 * RouterView 插槽参数
 */
export interface RouterViewSlotProps {
  /**
   * 组件实例
   */
  Component: any | null
  /**
   * 当前路由
   */
  route: RouteLocationNormalized
}

/**
 * 过渡配置
 */
export interface TransitionConfig {
  name: string
  mode?: 'in-out' | 'out-in' | 'default'
  duration?: number | { enter: number; leave: number }
  appear?: boolean
  css?: boolean
  onBeforeEnter?: (el: Element) => void
  onEnter?: (el: Element, done: () => void) => void
  onAfterEnter?: (el: Element) => void
  onBeforeLeave?: (el: Element) => void
  onLeave?: (el: Element, done: () => void) => void
  onAfterLeave?: (el: Element) => void
}

/**
 * 预加载策略
 */
export type PreloadStrategy = 'none' | 'hover' | 'visible' | 'immediate'

/**
 * 链接变体
 */
export type LinkVariant = 'default' | 'button' | 'tab' | 'breadcrumb' | 'card'

/**
 * 组件尺寸
 */
export type ComponentSize = 'small' | 'medium' | 'large'

/**
 * 增强的 RouterLink 组件属性
 */
export interface EnhancedRouterLinkProps extends RouterLinkProps {
  // 动画相关
  transition?: string | TransitionConfig
  transitionMode?: 'in-out' | 'out-in' | 'default'

  // 预加载策略
  preload?: PreloadStrategy
  preloadDelay?: number

  // 权限控制
  permission?: string | string[]
  fallbackTo?: RouteLocationRaw

  // 样式增强
  variant?: LinkVariant
  size?: ComponentSize
  disabled?: boolean
  loading?: boolean

  // 分析追踪
  trackEvent?: string
  trackData?: Record<string, any>

  // 确认对话框
  confirmMessage?: string
  confirmTitle?: string

  // 外部链接
  external?: boolean
  target?: '_blank' | '_self' | '_parent' | '_top'

  // 图标支持
  icon?: string
  iconPosition?: 'left' | 'right'

  // 徽章/标记
  badge?: string | number
  badgeColor?: string
  badgeVariant?: 'dot' | 'count' | 'text'

  // 工具提示
  tooltip?: string
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'

  // 键盘快捷键
  shortcut?: string

  // 状态指示
  pulse?: boolean
  glow?: boolean
}

/**
 * 增强的 RouterView 组件属性
 */
export interface EnhancedRouterViewProps extends RouterViewProps {
  // 过渡动画
  transition?: string | TransitionConfig
  transitionMode?: 'in-out' | 'out-in' | 'default'
  transitionDuration?: number

  // 加载状态
  loading?: boolean
  loadingComponent?: any
  errorComponent?: any
  emptyComponent?: any

  // 缓存控制
  keepAlive?: boolean
  keepAliveInclude?: string | RegExp | Array<string | RegExp>
  keepAliveExclude?: string | RegExp | Array<string | RegExp>
  keepAliveMax?: number

  // 权限控制
  requireAuth?: boolean
  fallbackComponent?: any

  // 布局系统
  layout?: string
  layoutProps?: Record<string, any>

  // 性能监控
  trackPerformance?: boolean

  // 错误边界
  errorBoundary?: boolean
  onError?: (error: Error, instance: any) => void

  // 滚动行为
  scrollBehavior?: 'auto' | 'smooth' | 'instant'
  scrollToTop?: boolean
  scrollOffset?: number

  // 页面元信息
  updateTitle?: boolean
  updateMeta?: boolean

  // 进度指示
  showProgress?: boolean
  progressColor?: string
}

/**
 * 增强的 RouterLink 插槽参数
 */
export interface EnhancedRouterLinkSlotProps extends RouterLinkSlotProps {
  isLoading: boolean
  isPreloading: boolean
  hasPermission: boolean
  disabled: boolean
}

/**
 * 增强的 RouterView 插槽参数
 */
export interface EnhancedRouterViewSlotProps extends RouterViewSlotProps {
  isLoading: boolean
  error: Error | null
  retry: () => void
}

/**
 * 组件增强配置
 */
export interface ComponentEnhancementConfig {
  // 权限检查函数
  permissionChecker?: (
    permission: string | string[]
  ) => boolean | Promise<boolean>

  // 事件追踪函数
  eventTracker?: (event: string, data: Record<string, any>) => void

  // 确认对话框函数
  confirmDialog?: (message: string, title?: string) => Promise<boolean>

  // 布局解析器
  layoutResolver?: (layout: string) => any

  // 默认配置
  defaults?: {
    link?: Partial<EnhancedRouterLinkProps>
    view?: Partial<EnhancedRouterViewProps>
  }
}
