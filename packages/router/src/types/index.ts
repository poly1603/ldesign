/**
 * @ldesign/router 核心类型定义
 *
 * 这个文件定义了路由系统的所有核心类型，确保类型安全和良好的开发体验
 */

import type { Component, ComputedRef, Ref } from 'vue'
import type { DeviceType } from '@ldesign/device'

// 重新导出设备相关类型
export type { DeviceType } from '@ldesign/device'

// ==================== 基础类型 ====================

/**
 * 路由参数类型
 */
export type RouteParams = Record<string, string | string[]>

/**
 * 查询参数类型
 */
export type RouteQuery = Record<string, string | string[] | null | undefined>

/**
 * 路由元信息类型
 */
export interface RouteMeta extends Record<string | number | symbol, unknown> {
  /** 页面标题 */
  title?: string
  /** 权限要求 */
  requiresAuth?: boolean
  /** 角色要求 */
  roles?: string[]
  /** 是否缓存 */
  keepAlive?: boolean
  /** 预加载策略 */
  preload?: boolean | 'hover' | 'visible' | 'idle'
  /** 动画类型 */
  transition?: string

  // ==================== 设备适配相关 ====================
  /** 支持的设备类型，默认支持所有设备 */
  supportedDevices?: DeviceType[]
  /** 不支持设备时的提示信息 */
  unsupportedMessage?: string
  /** 不支持设备时的重定向路由 */
  unsupportedRedirect?: string
  /** 模板名称，用于直接配置模板 */
  template?: string
  /** 模板分类，配合模板名称使用 */
  templateCategory?: string
}

// ==================== 路由位置类型 ====================

/**
 * 路由位置基础接口
 */
export interface RouteLocationBase {
  /** 路径 */
  path: string
  /** 路由名称 */
  name?: string | symbol
  /** 路由参数 */
  params: RouteParams
  /** 查询参数 */
  query: RouteQuery
  /** 哈希值 */
  hash: string
  /** 元信息 */
  meta: RouteMeta
}

/**
 * 标准化的路由位置
 */
export interface RouteLocationNormalized extends RouteLocationBase {
  /** 完整路径（包含查询参数和哈希） */
  fullPath: string
  /** 匹配的路由记录 */
  matched: RouteRecordNormalized[]
  /** 重定向来源 */
  redirectedFrom?: RouteLocationNormalized
}

/**
 * 路由位置原始类型（用于导航）
 */
export type RouteLocationRaw =
  | string
  | RouteLocationPathRaw
  | RouteLocationNamedRaw

/**
 * 基于路径的路由位置
 */
export interface RouteLocationPathRaw {
  path: string
  query?: RouteQuery
  hash?: string
  state?: HistoryState
}

/**
 * 基于名称的路由位置
 */
export interface RouteLocationNamedRaw {
  name: string | symbol
  params?: RouteParams
  query?: RouteQuery
  hash?: string
  state?: HistoryState
}

// ==================== 路由记录类型 ====================

/**
 * 路由组件类型
 */
export type RouteComponent = Component | (() => Promise<Component>)

/**
 * 路由记录原始配置
 */
export interface RouteRecordRaw {
  /** 路径 */
  path: string
  /** 路由名称 */
  name?: string | symbol
  /** 组件 */
  component?: RouteComponent
  /** 命名视图组件 */
  components?: Record<string, RouteComponent>
  /** 重定向 */
  redirect?: RouteLocationRaw
  /** 别名 */
  alias?: string | string[]
  /** 子路由 */
  children?: RouteRecordRaw[]
  /** 元信息 */
  meta?: RouteMeta
  /** 路由级守卫 */
  beforeEnter?: NavigationGuard | NavigationGuard[]
  /** 属性传递 */
  props?:
    | boolean
    | Record<string, unknown>
    | ((route: RouteLocationNormalized) => Record<string, unknown>)
  /** 路径匹配是否大小写敏感 */
  sensitive?: boolean
  /** 路径匹配是否严格模式 */
  strict?: boolean

  // ==================== 设备适配相关 ====================
  /** 设备特定组件配置 */
  deviceComponents?: {
    mobile?: RouteComponent
    tablet?: RouteComponent
    desktop?: RouteComponent
  }
  /** 模板名称，用于直接配置模板 */
  template?: string
  /** 模板分类，配合模板名称使用 */
  templateCategory?: string
}

/**
 * 标准化的路由记录
 */
export interface RouteRecordNormalized {
  /** 路径 */
  path: string
  /** 路由名称 */
  name: string | symbol | undefined
  /** 组件映射 */
  components: Record<string, RouteComponent> | null | undefined
  /** 子路由 */
  children: RouteRecordNormalized[]
  /** 元信息 */
  meta: RouteMeta
  /** 属性配置 */
  props: Record<
    string,
    | boolean
    | Record<string, unknown>
    | ((route: RouteLocationNormalized) => Record<string, unknown>)
  >
  /** 路由级守卫 */
  beforeEnter: NavigationGuard | undefined
  /** 别名来源 */
  aliasOf: RouteRecordNormalized | undefined
  /** 重定向配置 */
  redirect: RouteLocationRaw | undefined
}

// ==================== 导航守卫类型 ====================

/**
 * 导航守卫函数
 */
export interface NavigationGuard {
  (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ): NavigationGuardReturn | Promise<NavigationGuardReturn>
}

/**
 * 导航守卫返回值
 */
export type NavigationGuardReturn = void | Error | RouteLocationRaw | boolean

/**
 * 导航守卫 next 函数
 */
export interface NavigationGuardNext {
  (): void
  (error: Error): void
  (location: RouteLocationRaw): void
  (valid: boolean | undefined): void
}

/**
 * 导航后置钩子
 */
export interface NavigationHookAfter {
  (to: RouteLocationNormalized, from: RouteLocationNormalized): void
}

// ==================== 历史管理类型 ====================

/**
 * 历史状态
 */
export interface HistoryState {
  [key: string]: unknown
}

/**
 * 历史位置
 */
export interface HistoryLocation {
  pathname: string
  search: string
  hash: string
}

/**
 * 路由历史接口
 */
export interface RouterHistory {
  readonly base: string
  readonly location: HistoryLocation
  readonly state: HistoryState

  push(to: HistoryLocation, data?: HistoryState): void
  replace(to: HistoryLocation, data?: HistoryState): void
  go(delta: number, triggerListeners?: boolean): void
  back(): void
  forward(): void

  listen(callback: NavigationCallback): () => void
  destroy(): void
}

/**
 * 导航回调
 */
export interface NavigationCallback {
  (
    to: HistoryLocation,
    from: HistoryLocation,
    info: NavigationInformation
  ): void
}

/**
 * 导航信息
 */
export interface NavigationInformation {
  type: NavigationType
  direction: NavigationDirection
  delta: number
}

/**
 * 导航类型
 */
export type NavigationType = 'pop' | 'push' | 'replace'

/**
 * 导航方向
 */
export type NavigationDirection = 'forward' | 'backward' | 'unknown'

// ==================== 导航失败类型 ====================

// 重新导出 NavigationFailureType
export { NavigationFailureType } from '../core/constants'
import type { NavigationFailureType } from '../core/constants'

/**
 * 导航失败接口
 */
export interface NavigationFailure extends Error {
  type: NavigationFailureType
  from: RouteLocationNormalized
  to: RouteLocationNormalized
}

// ==================== 滚动行为类型 ====================

/**
 * 滚动位置
 */
export interface ScrollPosition {
  left: number
  top: number
}

/**
 * 滚动行为函数
 */
export interface ScrollBehavior {
  (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    savedPosition: ScrollPosition | null
  ): ScrollPosition | Promise<ScrollPosition> | undefined | null
}

// ==================== 路由器类型 ====================

/**
 * 路由器选项
 */
export interface RouterOptions {
  /** 历史模式 */
  history: RouterHistory
  /** 路由配置 */
  routes: RouteRecordRaw[]
  /** 链接激活类名 */
  linkActiveClass?: string
  /** 链接精确激活类名 */
  linkExactActiveClass?: string
  /** 查询参数解析函数 */
  parseQuery?: (query: string) => RouteQuery
  /** 查询参数序列化函数 */
  stringifyQuery?: (query: RouteQuery) => string
  /** 滚动行为 */
  scrollBehavior?: ScrollBehavior
  /** 路径匹配是否大小写敏感 */
  sensitive?: boolean
  /** 路径匹配是否严格模式 */
  strict?: boolean
}

/**
 * 路由器接口
 */
export interface Router {
  /** 当前路由 */
  readonly currentRoute: Ref<RouteLocationNormalized>
  /** 路由选项 */
  readonly options: RouterOptions

  /** 添加路由 */
  addRoute(route: RouteRecordRaw): () => void
  addRoute(parentName: string | symbol, route: RouteRecordRaw): () => void

  /** 移除路由 */
  removeRoute(name: string | symbol): void

  /** 获取所有路由记录 */
  getRoutes(): RouteRecordNormalized[]

  /** 检查路由是否存在 */
  hasRoute(name: string | symbol): boolean

  /** 解析路由位置 */
  resolve(
    to: RouteLocationRaw,
    currentLocation?: RouteLocationNormalized
  ): RouteLocationNormalized

  /** 导航到指定位置 */
  push(to: RouteLocationRaw): Promise<NavigationFailure | void | undefined>

  /** 替换当前位置 */
  replace(to: RouteLocationRaw): Promise<NavigationFailure | void | undefined>

  /** 历史导航 */
  go(delta: number): void
  back(): void
  forward(): void

  /** 全局前置守卫 */
  beforeEach(guard: NavigationGuard): () => void

  /** 全局解析守卫 */
  beforeResolve(guard: NavigationGuard): () => void

  /** 全局后置钩子 */
  afterEach(hook: NavigationHookAfter): () => void

  /** 导航错误处理 */
  onError(handler: (error: Error) => void): () => void

  /** 准备就绪 */
  isReady(): Promise<void>

  /** 安装到 Vue 应用 */
  install(app: any): void
}

// ==================== 组合式 API 类型 ====================

/**
 * useRoute 返回类型
 */
export interface UseRouteReturn extends ComputedRef<RouteLocationNormalized> {}

/**
 * useRouter 返回类型
 */
export interface UseRouterReturn extends Router {}

// ==================== 设备适配类型 ====================

/**
 * 设备路由配置
 */
export interface DeviceRouteConfig {
  /** 默认支持的设备类型 */
  defaultSupportedDevices?: DeviceType[]
  /** 设备不支持时的默认提示信息 */
  defaultUnsupportedMessage?: string
  /** 设备不支持时的默认重定向路由 */
  defaultUnsupportedRedirect?: string
  /** 是否启用设备检测 */
  enableDeviceDetection?: boolean
  /** 是否启用设备访问控制 */
  enableDeviceGuard?: boolean
  /** 是否启用模板路由支持 */
  enableTemplateRoutes?: boolean
}

/**
 * 设备组件解析结果
 */
export interface DeviceComponentResolution {
  /** 解析到的组件 */
  component: RouteComponent
  /** 使用的设备类型 */
  deviceType: DeviceType
  /** 是否为回退组件 */
  isFallback: boolean
  /** 解析来源 */
  source: 'deviceComponents' | 'component' | 'template'
}

/**
 * 设备路由守卫选项
 */
export interface DeviceGuardOptions {
  /** 支持的设备类型检查函数 */
  checkSupportedDevices?: (
    supportedDevices: DeviceType[],
    currentDevice: DeviceType,
    route: RouteLocationNormalized
  ) => boolean
  /** 不支持设备时的处理函数 */
  onUnsupportedDevice?: (
    currentDevice: DeviceType,
    route: RouteLocationNormalized
  ) => RouteLocationRaw | void
}

/**
 * 模板路由配置
 */
export interface TemplateRouteConfig {
  /** 默认模板分类 */
  defaultCategory?: string
  /** 模板根目录 */
  templateRoot?: string
  /** 是否启用模板缓存 */
  enableCache?: boolean
  /** 模板加载超时时间 */
  timeout?: number
}

/**
 * 设备路由插件选项
 */
export interface DeviceRouterPluginOptions extends DeviceRouteConfig {
  /** 设备路由守卫选项 */
  guardOptions?: DeviceGuardOptions
  /** 模板路由配置 */
  templateConfig?: TemplateRouteConfig
}
