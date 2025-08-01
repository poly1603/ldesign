import type { Component, ComputedRef, Ref } from 'vue'

/**
 * 路由记录原始配置
 */
export interface RouteRecordRaw {
  path: string
  name?: string | symbol
  component?: RouteComponent
  components?: Record<string, RouteComponent>
  redirect?: RouteLocationRaw
  alias?: string | string[]
  children?: RouteRecordRaw[]
  meta?: RouteMeta
  beforeEnter?: NavigationGuard | NavigationGuard[]
  props?: boolean | Record<string, any> | ((route: RouteLocationNormalized) => Record<string, any>)
  sensitive?: boolean
  strict?: boolean
}

/**
 * 路由组件类型
 */
export type RouteComponent = Component | (() => Promise<Component>)

/**
 * 路由元信息
 */
export interface RouteMeta extends Record<string | number | symbol, unknown> {
  requiresAuth?: boolean
  title?: string
  icon?: string
  hidden?: boolean
  roles?: string[]
}

/**
 * 路由参数
 */
export type RouteParams = Record<string, string | string[]>

/**
 * 路由查询参数
 */
export type RouteQuery = Record<string, string | string[] | null | undefined>

/**
 * 路由位置原始类型
 */
export type RouteLocationRaw = string | {
  name?: string | symbol
  path?: string
  params?: RouteParams
  query?: RouteQuery
  hash?: string
  replace?: boolean
  force?: boolean
}

/**
 * 路由位置
 */
export interface RouteLocation {
  name: string | symbol | null | undefined
  path: string
  params: RouteParams
  query: RouteQuery
  hash: string
  fullPath: string
  matched: RouteRecordNormalized[]
  meta: RouteMeta
  redirectedFrom?: RouteLocation
}

/**
 * 标准化的路由位置
 */
export interface RouteLocationNormalized extends RouteLocation {
  name: string | symbol | null | undefined
  path: string
  params: RouteParams
  query: RouteQuery
  hash: string
  fullPath: string
  matched: RouteRecordNormalized[]
  meta: RouteMeta
  redirectedFrom?: RouteLocationNormalized
}

/**
 * 标准化的路由记录
 */
export interface RouteRecordNormalized {
  path: string
  name: string | symbol | undefined
  components: Record<string, RouteComponent> | null | undefined
  children: RouteRecordNormalized[]
  meta: RouteMeta
  props: Record<string, boolean | Record<string, any> | ((route: RouteLocationNormalized) => Record<string, any>)>
  beforeEnter: NavigationGuard | undefined
  aliasOf: RouteRecordNormalized | undefined
  redirect: RouteLocationRaw | undefined
}

/**
 * 导航守卫
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
 * 导航守卫next函数
 */
export interface NavigationGuardNext {
  (): void
  (error: Error): void
  (location: RouteLocationRaw): void
  (valid: boolean): void
}

/**
 * 导航后置钩子
 */
export interface NavigationHookAfter {
  (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    failure?: NavigationFailure | void
  ): any
}

/**
 * 导航失败
 */
export interface NavigationFailure extends Error {
  type: NavigationFailureType
  from: RouteLocationNormalized
  to: RouteLocationNormalized
}

/**
 * 导航失败类型
 */
export enum NavigationFailureType {
  aborted = 4,
  cancelled = 8,
  duplicated = 16,
}

/**
 * 路由历史接口
 */
export interface RouterHistory {
  readonly base: string
  readonly location: HistoryLocation
  readonly state: HistoryState
  push: (to: HistoryLocation, data?: HistoryState) => void
  replace: (to: HistoryLocation, data?: HistoryState) => void
  go: (delta: number, triggerListeners?: boolean) => void
  back: (triggerListeners?: boolean) => void
  forward: (triggerListeners?: boolean) => void
  listen: (callback: NavigationCallback) => () => void
  createHref: (location: HistoryLocation) => string
  destroy: () => void
}

/**
 * 历史位置
 */
export type HistoryLocation = string

/**
 * 历史状态
 */
export interface HistoryState {
  [x: number]: HistoryStateValue
  [x: string]: HistoryStateValue
}

export type HistoryStateValue = string | number | boolean | null | undefined | HistoryState | HistoryStateArray

export interface HistoryStateArray extends Array<HistoryStateValue> {}

/**
 * 导航回调
 */
export interface NavigationCallback {
  (to: HistoryLocation, from: HistoryLocation, info: NavigationInformation): void
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
export enum NavigationType {
  pop = 'pop',
  push = 'push',
}

/**
 * 导航方向
 */
export enum NavigationDirection {
  back = 'back',
  forward = 'forward',
  unknown = '',
}

/**
 * 滚动位置
 */
export interface ScrollPosition {
  left: number
  top: number
}

/**
 * 滚动行为
 */
export interface ScrollBehavior {
  (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    savedPosition: ScrollPosition | null
  ): ScrollPosition | Promise<ScrollPosition> | undefined | null
}

/**
 * 路由器选项
 */
export interface RouterOptions {
  history: RouterHistory
  routes: RouteRecordRaw[]
  linkActiveClass?: string
  linkExactActiveClass?: string
  parseQuery?: (query: string) => RouteQuery
  stringifyQuery?: (query: RouteQuery) => string
  scrollBehavior?: ScrollBehavior
  sensitive?: boolean
  strict?: boolean
}

/**
 * 路由器接口
 */
export interface Router {
  readonly currentRoute: Ref<RouteLocationNormalized>
  readonly options: RouterOptions

  addRoute: ((route: RouteRecordRaw) => () => void) & ((parentName: string | symbol, route: RouteRecordRaw) => () => void)
  removeRoute: (name: string | symbol) => void
  hasRoute: (name: string | symbol) => boolean
  getRoutes: () => RouteRecordNormalized[]
  resolve: (to: RouteLocationRaw, currentLocation?: RouteLocationNormalized) => RouteLocation

  push: (to: RouteLocationRaw) => Promise<NavigationFailure | void | undefined>
  replace: (to: RouteLocationRaw) => Promise<NavigationFailure | void | undefined>
  go: (delta: number) => void
  back: () => void
  forward: () => void

  beforeEach: (guard: NavigationGuard) => () => void
  beforeResolve: (guard: NavigationGuard) => () => void
  afterEach: (guard: NavigationHookAfter) => () => void

  onError: (handler: (error: Error, to: RouteLocationNormalized, from: RouteLocationNormalized) => any) => () => void

  isReady: () => Promise<void>
  install: (app: any) => void
}

/**
 * 使用路由返回类型
 */
export interface UseRouterReturn {
  router: Router
}

/**
 * 使用路由位置返回类型
 */
export interface UseRouteReturn {
  route: ComputedRef<RouteLocationNormalized>
}

/**
 * 认证守卫配置
 */
export interface AuthGuardConfig {
  priority?: number
  isAuthenticated?: () => boolean
  loginPath?: string
}
