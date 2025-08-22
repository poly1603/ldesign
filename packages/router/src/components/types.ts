/**
 * @ldesign/router 组件类型定义
 */

import type { Component } from 'vue'
import type {
  ExtractRouteParams,
  RouteLocationNormalized,
  RouteLocationRaw,
} from '../types'

// ==================== 通用类型 ====================

/**
 * 组件尺寸
 */
export type ComponentSize = 'small' | 'medium' | 'large'

/**
 * 链接变体
 */
export type LinkVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'

/**
 * 预加载策略
 */
export type PreloadStrategy = 'hover' | 'visible' | 'idle' | 'none'

/**
 * 动画类型
 */
export type AnimationType = 'fade' | 'slide' | 'scale' | 'flip' | 'none'

/**
 * 缓存策略
 */
export type CacheStrategy = 'memory' | 'session' | 'local' | 'none'

// ==================== RouterLink 组件类型 ====================

/**
 * RouterLink 属性（泛型版）
 */
export interface RouterLinkProps<
  TParams extends Record<string, unknown> = Record<string, unknown>,
  TQuery extends Record<string, unknown> = Record<string, unknown>,
> {
  /** 目标路由 */
  to: RouteLocationRaw<TParams, TQuery>
  /** 是否替换当前历史记录 */
  replace?: boolean
  /** 激活状态类名 */
  activeClass?: string
  /** 精确激活状态类名 */
  exactActiveClass?: string
  /** 自定义渲染 */
  custom?: boolean
  /** 链接变体 */
  variant?: LinkVariant
  /** 组件尺寸 */
  size?: ComponentSize
  /** 是否禁用 */
  disabled?: boolean
  /** 是否显示加载状态 */
  loading?: boolean
  /** 是否为外部链接 */
  external?: boolean
  /** 链接目标 */
  target?: string
  /** 链接关系 */
  rel?: string
  /** 预加载策略 */
  preload?: boolean | PreloadStrategy
  /** 预加载延迟（毫秒） */
  preloadDelay?: number
  /** 权限要求 */
  permission?: string | string[]
  /** 是否追踪点击事件 */
  trackClick?: boolean
  /** 导航前确认 */
  confirmBeforeNavigate?: boolean
  /** 确认消息 */
  confirmMessage?: string
  /** 自定义图标 */
  icon?: string | Component
  /** 图标位置 */
  iconPosition?: 'left' | 'right'
}

/**
 * 类型安全的 RouterLink 属性（基于路径推导）
 */
export type TypedRouterLinkProps<T extends string> = RouterLinkProps<
  ExtractRouteParams<T>,
  Record<string, unknown>
> & {
  to: T | RouteLocationRaw<ExtractRouteParams<T>>
}

/**
 * RouterLink 插槽属性（泛型版）
 */
export interface RouterLinkSlotProps<
  TParams extends Record<string, unknown> = Record<string, unknown>,
  TQuery extends Record<string, unknown> = Record<string, unknown>,
> {
  /** 链接地址 */
  href: string
  /** 目标路由 */
  route: RouteLocationNormalized<TParams, TQuery>
  /** 导航函数 */
  navigate: (e?: Event) => Promise<void>
  /** 是否激活 */
  isActive: boolean
  /** 是否精确激活 */
  isExactActive: boolean
  /** 是否禁用 */
  isDisabled: boolean
  /** 是否加载中 */
  isLoading: boolean
  /** 是否为外部链接 */
  isExternal: boolean
}

/**
 * RouterLink 事件类型
 */
export interface RouterLinkEmits {
  /** 点击事件 */
  'click': [event: MouseEvent]
  /** 导航开始事件 */
  'navigate-start': [to: RouteLocationRaw]
  /** 导航成功事件 */
  'navigate-success': [to: RouteLocationNormalized]
  /** 导航失败事件 */
  'navigate-error': [error: Error, to: RouteLocationRaw]
  /** 预加载开始事件 */
  'preload-start': [to: RouteLocationRaw]
  /** 预加载成功事件 */
  'preload-success': [to: RouteLocationRaw]
  /** 预加载失败事件 */
  'preload-error': [error: Error, to: RouteLocationRaw]
  /** 权限检查失败事件 */
  'permission-denied': [permission: string | string[], to: RouteLocationRaw]
}

// ==================== RouterView 组件类型 ====================

/**
 * RouterView 属性（泛型版）
 */
export interface RouterViewProps<
  TParams extends Record<string, unknown> = Record<string, unknown>,
  TQuery extends Record<string, unknown> = Record<string, unknown>,
> {
  /** 视图名称 */
  name?: string
  /** 路由位置 */
  route?: RouteLocationNormalized<TParams, TQuery>
  /** 动画类型 */
  animation?: AnimationType
  /** 动画持续时间（毫秒） */
  animationDuration?: number
  /** 是否启用缓存 */
  keepAlive?: boolean
  /** 缓存策略 */
  cacheStrategy?: CacheStrategy
  /** 最大缓存数量 */
  maxCache?: number
  /** 缓存包含规则 */
  include?: string | RegExp | Array<string | RegExp>
  /** 缓存排除规则 */
  exclude?: string | RegExp | Array<string | RegExp>
  /** 加载状态组件 */
  loading?: Component
  /** 错误状态组件 */
  error?: Component
  /** 空状态组件 */
  empty?: Component
  /** 加载超时时间（毫秒） */
  timeout?: number
  /** 是否显示加载指示器 */
  showLoading?: boolean
  /** 加载延迟时间（毫秒） */
  loadingDelay?: number
  /** 是否启用过渡动画 */
  transition?: boolean
  /** 过渡模式 */
  transitionMode?: 'in-out' | 'out-in' | 'default'
}

/**
 * RouterView 事件类型
 */
export interface RouterViewEmits {
  /** 组件加载开始事件 */
  'load-start': [route: RouteLocationNormalized]
  /** 组件加载成功事件 */
  'load-success': [component: Component, route: RouteLocationNormalized]
  /** 组件加载失败事件 */
  'load-error': [error: Error, route: RouteLocationNormalized]
  /** 组件渲染前事件 */
  'before-render': [component: Component, route: RouteLocationNormalized]
  /** 组件渲染后事件 */
  'after-render': [component: Component, route: RouteLocationNormalized]
  /** 缓存命中事件 */
  'cache-hit': [component: Component, route: RouteLocationNormalized]
  /** 缓存未命中事件 */
  'cache-miss': [route: RouteLocationNormalized]
  /** 动画开始事件 */
  'animation-start': [type: AnimationType, route: RouteLocationNormalized]
  /** 动画结束事件 */
  'animation-end': [type: AnimationType, route: RouteLocationNormalized]
}

/**
 * RouterView 插槽属性
 */
export interface RouterViewSlotProps {
  /** 当前组件 */
  Component: Component | null
  /** 当前路由 */
  route: RouteLocationNormalized
  /** 是否加载中 */
  isLoading: boolean
  /** 错误信息 */
  error: Error | null
  /** 重试函数 */
  retry: () => void
}

// ==================== 动画相关类型 ====================

/**
 * 动画配置
 */
export interface AnimationConfig {
  /** 动画类型 */
  type: AnimationType
  /** 持续时间（毫秒） */
  duration?: number
  /** 缓动函数 */
  easing?: string
  /** 进入动画类名 */
  enterClass?: string
  /** 进入激活类名 */
  enterActiveClass?: string
  /** 进入结束类名 */
  enterToClass?: string
  /** 离开动画类名 */
  leaveClass?: string
  /** 离开激活类名 */
  leaveActiveClass?: string
  /** 离开结束类名 */
  leaveToClass?: string
}

// ==================== 缓存相关类型 ====================

/**
 * 缓存项
 */
export interface CacheItem {
  /** 组件实例 */
  component: Component
  /** 路由信息 */
  route: RouteLocationNormalized
  /** 创建时间 */
  createdAt: number
  /** 最后访问时间 */
  lastAccessedAt: number
  /** 访问次数 */
  accessCount: number
  /** 过期时间（毫秒） */
  ttl?: number
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 缓存策略 */
  strategy: CacheStrategy
  /** 最大缓存数量 */
  maxSize: number
  /** 缓存过期时间（毫秒） */
  ttl?: number
  /** 包含规则 */
  include?: string | RegExp | Array<string | RegExp>
  /** 排除规则 */
  exclude?: string | RegExp | Array<string | RegExp>
}

// ==================== 预加载相关类型 ====================

/**
 * 预加载配置
 */
export interface PreloadConfig {
  /** 预加载策略 */
  strategy: PreloadStrategy
  /** 延迟时间（毫秒） */
  delay?: number
  /** 是否在可见时预加载 */
  onVisible?: boolean
  /** 可见性阈值 */
  visibilityThreshold?: number
  /** 是否在空闲时预加载 */
  onIdle?: boolean
  /** 空闲超时时间（毫秒） */
  idleTimeout?: number
}

// ==================== 事件类型 ====================

/**
 * 路由事件
 */
export interface RouteEvent {
  /** 事件类型 */
  type: string
  /** 目标路由 */
  to: RouteLocationNormalized
  /** 来源路由 */
  from: RouteLocationNormalized
  /** 时间戳 */
  timestamp: number
  /** 额外数据 */
  data?: Record<string, unknown>
}

/**
 * 导航事件
 */
export interface NavigationEvent extends RouteEvent {
  /** 导航方式 */
  method: 'push' | 'replace' | 'go' | 'back' | 'forward'
  /** 是否被取消 */
  cancelled?: boolean
  /** 错误信息 */
  error?: Error
}

/**
 * 组件事件
 */
export interface ComponentEvent extends RouteEvent {
  /** 组件名称 */
  componentName: string
  /** 加载时间（毫秒） */
  loadTime?: number
  /** 是否来自缓存 */
  fromCache?: boolean
}

// ==================== 权限相关类型 ====================

/**
 * 权限检查函数
 */
export interface PermissionChecker {
  (permission: string | string[], route: RouteLocationNormalized):
    | boolean
    | Promise<boolean>
}

/**
 * 权限配置
 */
export interface PermissionConfig {
  /** 权限检查函数 */
  checker: PermissionChecker
  /** 无权限时的重定向路由 */
  redirectTo?: RouteLocationRaw
  /** 无权限时的错误消息 */
  errorMessage?: string
  /** 是否显示错误提示 */
  showError?: boolean
}

// ==================== 性能监控类型 ====================

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 导航开始时间 */
  navigationStart: number
  /** 导航结束时间 */
  navigationEnd: number
  /** 组件加载开始时间 */
  componentLoadStart: number
  /** 组件加载结束时间 */
  componentLoadEnd: number
  /** 路由匹配时间 */
  routeMatchTime: number
  /** 守卫执行时间 */
  guardExecutionTime: number
  /** 总耗时 */
  totalTime: number
}

/**
 * 性能监控配置
 */
export interface PerformanceConfig {
  /** 是否启用监控 */
  enabled: boolean
  /** 警告阈值（毫秒） */
  warningThreshold: number
  /** 错误阈值（毫秒） */
  errorThreshold: number
  /** 采样率（0-1） */
  sampleRate: number
  /** 监控回调 */
  onMetrics?: (metrics: PerformanceMetrics) => void
}
