/**
 * @ldesign/router 增强类型定义
 *
 * 提供更强大的类型推导和类型安全功能
 */

import type { Component, Ref } from 'vue'
import type { RouteLocationNormalized, RouteRecordRaw } from './index'

// ==================== 高级类型工具 ====================

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * 可选属性类型
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * 必需属性类型
 */
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] }

/**
 * 提取函数参数类型
 */
export type ExtractFunctionParams<T> = T extends (...args: infer P) => unknown ? P : never

/**
 * 提取函数返回类型
 */
export type ExtractFunctionReturn<T> = T extends (...args: never[]) => infer R ? R : never

// ==================== 路由类型增强 ====================

/**
 * 类型安全的路由配置
 */
export interface TypedRouteRecord<
  TPath extends string = string,
  TName extends string = string,
  TParams extends Record<string, unknown> = Record<string, unknown>,
  TMeta extends Record<string, unknown> = Record<string, unknown>,
> extends Omit<RouteRecordRaw, 'path' | 'name' | 'meta'> {
  path: TPath
  name?: TName
  meta?: TMeta
  params?: TParams
}

/**
 * 路由参数类型推导
 */
export type InferRouteParams<T extends string> =
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & InferRouteParams<Rest>
    : T extends `${infer _Start}:${infer Param}?/${infer Rest}`
      ? { [K in Param]?: string } & InferRouteParams<Rest>
      : T extends `${infer _Start}:${infer Param}`
        ? { [K in Param]: string }
        : T extends `${infer _Start}:${infer Param}?`
          ? { [K in Param]?: string }
          : Record<string, never>

/**
 * 路由元信息类型推导
 */
export type InferRouteMeta<T> = T extends TypedRouteRecord<string, string, Record<string, unknown>, infer M> ? M : Record<string, unknown>

/**
 * 强类型路由导航
 */
export interface TypedRouter<TRoutes extends Record<string, TypedRouteRecord> = Record<string, TypedRouteRecord>> {
  push: <K extends keyof TRoutes>(
    to: K | {
      name: K
      params?: InferRouteParams<TRoutes[K]['path']>
      query?: Record<string, string | string[]>
    }
  ) => Promise<void>

  replace: <K extends keyof TRoutes>(
    to: K | {
      name: K
      params?: InferRouteParams<TRoutes[K]['path']>
      query?: Record<string, string | string[]>
    }
  ) => Promise<void>

  resolve: <K extends keyof TRoutes>(
    to: K | {
      name: K
      params?: InferRouteParams<TRoutes[K]['path']>
      query?: Record<string, string | string[]>
    }
  ) => RouteLocationNormalized
}

// ==================== 组件类型增强 ====================

/**
 * 异步组件加载器类型
 */
export type AsyncComponentLoader<T = Component> = () => Promise<T | { default: T }>

/**
 * 组件预加载配置
 */
export interface ComponentPreloadConfig {
  /** 预加载策略 */
  strategy: 'eager' | 'lazy' | 'hover' | 'visible'
  /** 预加载延迟 */
  delay?: number
  /** 预加载优先级 */
  priority?: 'high' | 'normal' | 'low'
  /** 错误重试次数 */
  retries?: number
}

/**
 * 增强的路由组件配置
 */
export interface EnhancedRouteComponent {
  /** 组件加载器 */
  loader: AsyncComponentLoader
  /** 预加载配置 */
  preload?: ComponentPreloadConfig
  /** 组件缓存配置 */
  cache?: {
    enabled: boolean
    maxAge?: number
    key?: string
  }
  /** 错误边界组件 */
  errorBoundary?: Component
  /** 加载中组件 */
  loading?: Component
}

// ==================== 守卫类型增强 ====================

/**
 * 类型安全的导航守卫
 */
export type TypedNavigationGuard<
  TFrom extends RouteLocationNormalized = RouteLocationNormalized,
  TTo extends RouteLocationNormalized = RouteLocationNormalized,
> = (
  to: TTo,
  from: TFrom,
  next: (to?: string | RouteLocationNormalized | false | ((vm: Component) => void)) => void
) => void | Promise<void> | boolean | Promise<boolean>

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: string | number
  name?: string
  roles?: string[]
  [key: string]: unknown
}

/**
 * 守卫执行上下文
 */
export interface GuardContext<TRouter = unknown> {
  /** 当前路由 */
  route: RouteLocationNormalized
  /** 路由器实例 */
  router: TRouter
  /** 用户信息 */
  user?: UserInfo
  /** 权限信息 */
  permissions?: string[]
  /** 自定义数据 */
  data?: Record<string, unknown>
}

/**
 * 条件守卫配置
 */
export interface ConditionalGuardConfig {
  /** 守卫条件 */
  condition: (context: GuardContext) => boolean | Promise<boolean>
  /** 守卫处理器 */
  handler: TypedNavigationGuard
  /** 失败时的重定向路径 */
  fallback?: string
  /** 错误处理器 */
  onError?: (error: Error) => void
}

// ==================== 插件类型增强 ====================

/**
 * 路由插件接口
 */
export interface RouterPlugin<TOptions = Record<string, unknown>> {
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version?: string
  /** 插件选项 */
  options?: TOptions
  /** 安装函数 */
  install: (router: any, options?: TOptions) => void | Promise<void>
  /** 卸载函数 */
  uninstall?: (router: any) => void | Promise<void>
  /** 插件依赖 */
  dependencies?: string[]
}

/**
 * 插件管理器接口
 */
export interface PluginManager {
  /** 注册插件 */
  register: <T>(plugin: RouterPlugin<T>, options?: T) => Promise<void>
  /** 卸载插件 */
  unregister: (name: string) => Promise<void>
  /** 获取插件 */
  get: (name: string) => RouterPlugin | undefined
  /** 获取所有插件 */
  getAll: () => RouterPlugin[]
  /** 检查插件是否已注册 */
  has: (name: string) => boolean
}

// ==================== 状态管理类型 ====================

/**
 * 路由状态
 */
export interface RouterState {
  /** 当前路由 */
  currentRoute: Ref<RouteLocationNormalized>
  /** 路由历史 */
  history: RouteLocationNormalized[]
  /** 导航状态 */
  isNavigating: Ref<boolean>
  /** 错误状态 */
  error: Ref<Error | null>
  /** 加载状态 */
  isLoading: Ref<boolean>
}

/**
 * 路由状态管理器
 */
export interface RouterStateManager {
  /** 获取状态 */
  getState: () => RouterState
  /** 更新状态 */
  updateState: (updates: Partial<RouterState>) => void
  /** 重置状态 */
  resetState: () => void
  /** 订阅状态变化 */
  subscribe: (callback: (state: RouterState) => void) => () => void
}

// ==================== 性能监控类型 ====================

/**
 * 路由性能指标
 */
export interface RoutePerformanceMetrics {
  /** 导航开始时间 */
  navigationStart: number
  /** 路由解析时间 */
  routeResolved: number
  /** 组件加载时间 */
  componentLoaded: number
  /** 导航完成时间 */
  navigationEnd: number
  /** 总耗时 */
  totalTime: number
  /** 组件大小 */
  componentSize?: number
  /** 缓存命中 */
  cacheHit: boolean
}

/**
 * 性能监控配置
 */
export interface PerformanceMonitorConfig {
  /** 是否启用监控 */
  enabled: boolean
  /** 采样率 */
  sampleRate: number
  /** 性能阈值 */
  thresholds: {
    navigation: number
    componentLoad: number
  }
  /** 报告回调 */
  onReport?: (metrics: RoutePerformanceMetrics) => void
}

// ==================== 类型已通过export导出 ====================
// 所有类型已在上方使用 export type/export interface 导出
// 无需重复导出
