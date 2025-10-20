/**
 * @ldesign/router 路由器核心类
 *
 * 路由器的主要实现，负责路由管理、导航控制和生命周期管理
 */

import type { App, Ref } from 'vue'
import type {
  HistoryLocation,
  NavigationFailure,
  NavigationGuard,
  NavigationGuardReturn,
  NavigationHookAfter,
  NavigationInformation,
  RouteLocationNormalized,
  RouteLocationRaw,
  Router,
  RouteRecordNormalized,
  RouteRecordRaw,
  RouterOptions,
} from '../types'
import { ref } from 'vue'
import { RouterLink } from '../components/RouterLink'
import { RouterView } from '../components/RouterView'
import { UnifiedMemoryManager } from '../utils/unified-memory-manager'
import {
  NavigationFailureType,
  ROUTE_INJECTION_SYMBOL,
  ROUTER_INJECTION_SYMBOL,
  START_LOCATION,
} from './constants'
import { RouteMatcher } from './matcher'

/**
 * 导航重定向错误
 */
class NavigationRedirectError extends Error {
  constructor(public to: RouteLocationNormalized) {
    super('Navigation redirected')
    this.name = 'NavigationRedirectError'
  }
}

// ==================== 路由器实现 ====================

/**
 * 路由器类（增强版）
 */
export class RouterImpl implements Router {
  private matcher: RouteMatcher
  private beforeGuards: NavigationGuard[] = []
  private beforeResolveGuards: NavigationGuard[] = []
  private afterHooks: NavigationHookAfter[] = []
  private errorHandlers: Array<(error: Error) => void> = []
  private isReadyPromise?: Promise<void>
  private isReadyResolve?: () => void
  // 待处理的路由位置，用于导航状态管理
  // private _pendingLocation?: RouteLocationNormalized

  // 内存管理
  private memoryManager: UnifiedMemoryManager
  private guardCleanupFunctions: Array<() => void> = []
  
  // 优化：守卫执行缓存
  private guardResultCache = new Map<string, NavigationGuardReturn>()
  private readonly MAX_GUARD_CACHE_SIZE = 100

  public readonly currentRoute: Ref<RouteLocationNormalized>
  public readonly options: RouterOptions

  constructor(options: RouterOptions) {
    this.options = options
    this.matcher = new RouteMatcher()
    this.currentRoute = ref(START_LOCATION)

    // 初始化内存管理器（优化：更积极的内存管理）
    this.memoryManager = new UnifiedMemoryManager({
      monitoring: {
        enabled: true,
        interval: 60000, // 每分钟检查
        warningThreshold: 20 * 1024 * 1024, // 20MB
        criticalThreshold: 40 * 1024 * 1024, // 40MB
      },
      tieredCache: {
        enabled: true,
        l1Capacity: 15,
        l2Capacity: 30,
        l3Capacity: 60,
        promotionThreshold: 2,
        demotionThreshold: 30000, // 30秒
      },
      cleanup: {
        strategy: 'aggressive',
        autoCleanup: true,
        cleanupInterval: 120000, // 2分钟
      },
    })

    // 创建 isReady Promise
    this.isReadyPromise = new Promise((resolve) => {
      this.isReadyResolve = resolve
    })

    // 添加初始路由
    for (const route of options.routes) {
      this.addRoute(route)
    }

    // 设置历史监听
    this.setupHistoryListener()

    // 初始化当前路由
    this.initializeCurrentRoute()

    // 内存管理器自动启动
  }

  // ==================== 路由管理 ====================

  addRoute(route: RouteRecordRaw): () => void
  addRoute(parentName: string | symbol, route: RouteRecordRaw): () => void
  addRoute(
    parentNameOrRoute: string | symbol | RouteRecordRaw,
    route?: RouteRecordRaw,
  ): () => void {
    let normalizedRecord: RouteRecordNormalized

    if (typeof parentNameOrRoute === 'object') {
      // addRoute(route)
      normalizedRecord = this.matcher.addRoute(parentNameOrRoute)
    }
    else {
      // addRoute(parentName, route)
      const parent = this.matcher.matchByName(parentNameOrRoute)
      if (!parent) {
        throw new Error(`Parent route "${String(parentNameOrRoute)}" not found`)
      }
      normalizedRecord = this.matcher.addRoute(route!, parent)
    }

    return () => {
      if (normalizedRecord.name) {
        this.removeRoute(normalizedRecord.name)
      }
    }
  }

  removeRoute(name: string | symbol): void {
    this.matcher.removeRoute(name)
  }

  getRoutes(): RouteRecordNormalized[] {
    return this.matcher.getRoutes()
  }

  hasRoute(name: string | symbol): boolean {
    return this.matcher.hasRoute(name)
  }

  resolve(
    to: RouteLocationRaw,
    currentLocation?: RouteLocationNormalized,
  ): RouteLocationNormalized {
    return this.matcher.resolve(to, currentLocation || this.currentRoute.value)
  }

  // ==================== 导航控制 ====================

  async push(
    to: RouteLocationRaw,
  ): Promise<NavigationFailure | void | undefined> {
    return this.pushWithRedirect(to, false)
  }

  async replace(
    to: RouteLocationRaw,
  ): Promise<NavigationFailure | void | undefined> {
    return this.pushWithRedirect(to, true)
  }

  go(delta: number): void {
    this.options.history.go(delta)
  }

  back(): void {
    this.go(-1)
  }

  forward(): void {
    this.go(1)
  }

  // ==================== 导航守卫 ====================

  beforeEach(guard: NavigationGuard): () => void {
    this.beforeGuards.push(guard)

    // 内存监控已在UnifiedMemoryManager内部处理

    const cleanup = () => {
      const index = this.beforeGuards.indexOf(guard)
      if (index >= 0) {
        this.beforeGuards.splice(index, 1)
      }
      // 清理已在UnifiedMemoryManager内部处理
    }

    this.guardCleanupFunctions.push(cleanup)
    return cleanup
  }

  beforeResolve(guard: NavigationGuard): () => void {
    this.beforeResolveGuards.push(guard)
    return () => {
      const index = this.beforeResolveGuards.indexOf(guard)
      if (index >= 0) {
        this.beforeResolveGuards.splice(index, 1)
      }
    }
  }

  afterEach(hook: NavigationHookAfter): () => void {
    this.afterHooks.push(hook)
    return () => {
      const index = this.afterHooks.indexOf(hook)
      if (index >= 0) {
        this.afterHooks.splice(index, 1)
      }
    }
  }

  onError(handler: (error: Error) => void): () => void {
    this.errorHandlers.push(handler)
    return () => {
      const index = this.errorHandlers.indexOf(handler)
      if (index >= 0) {
        this.errorHandlers.splice(index, 1)
      }
    }
  }

  // ==================== 生命周期 ====================

  async isReady(): Promise<void> {
    return this.isReadyPromise!
  }

  install(app: App): void {
    app.provide(ROUTER_INJECTION_SYMBOL, this)
    app.provide(ROUTE_INJECTION_SYMBOL, this.currentRoute)

    // 全局属性
    app.config.globalProperties.$router = this
    app.config.globalProperties.$route = this.currentRoute

    // 注册全局组件
    app.component('RouterLink', RouterLink)
    app.component('RouterView', RouterView)

    // 注册全局组件
    // 这里会在组件实现后添加
  }

  /**
   * 销毁路由器，清理所有资源
   */
  destroy(): void {
    // 销毁内存管理
    this.memoryManager.destroy()

    // 清理所有守卫
    this.guardCleanupFunctions.forEach(cleanup => cleanup())
    this.guardCleanupFunctions = []

    // 清理数组
    this.beforeGuards.length = 0
    this.beforeResolveGuards.length = 0
    this.afterHooks.length = 0
    this.errorHandlers.length = 0

    // 清理守卫缓存
    this.guardResultCache.clear()

    // 清理匹配器缓存
    this.matcher.clearCache()

    // 清理历史监听器
    this.options.history.destroy()
  }

  /**
   * 获取内存统计信息
   */
  getMemoryStats() {
    return {
      memory: this.memoryManager.getStats(),
      matcher: this.matcher.getStats(),
      guards: {
        beforeGuards: this.beforeGuards.length,
        beforeResolveGuards: this.beforeResolveGuards.length,
        afterHooks: this.afterHooks.length,
        errorHandlers: this.errorHandlers.length,
      },
    }
  }

  // ==================== 私有方法 ====================

  // 重定向跟踪，防止无限重定向
  private redirectCount = 0
  private readonly MAX_REDIRECTS = 10
  private redirectStartTime = 0
  private readonly REDIRECT_TIMEOUT = 5000 // 5秒超时

  private async pushWithRedirect(
    to: RouteLocationRaw,
    replace: boolean,
  ): Promise<NavigationFailure | void | undefined> {
    // 重置重定向计数器（如果是新的导航）
    const now = Date.now()
    if (now - this.redirectStartTime > this.REDIRECT_TIMEOUT) {
      this.redirectCount = 0
      this.redirectStartTime = now
    }

    // 检查重定向次数限制
    if (this.redirectCount >= this.MAX_REDIRECTS) {
      const error = new Error(`Maximum redirect limit (${this.MAX_REDIRECTS}) exceeded`)
      this.handleError(error)
      return this.createNavigationFailure(
        NavigationFailureType.aborted,
        this.currentRoute.value,
        this.resolve(to),
      )
    }

    const targetLocation = this.resolve(to)
    const from = this.currentRoute.value

    // 检查是否重复导航
    if (this.isSameRouteLocation(targetLocation, from)) {
      this.redirectCount = 0 // 重置计数器
      return this.createNavigationFailure(
        NavigationFailureType.duplicated,
        from,
        targetLocation,
      )
    }

    try {
      // 执行导航守卫，可能会返回重定向的路由
      const finalLocation = await this.runNavigationGuards(targetLocation, from)

      // 更新历史记录
      const historyLocation = this.routeLocationToHistoryLocation(finalLocation)
      if (replace) {
        this.options.history.replace(historyLocation, { ...finalLocation })
      }
      else {
        this.options.history.push(historyLocation, { ...finalLocation })
      }

      // 更新当前路由
      this.updateCurrentRoute(finalLocation, from)

      // 执行后置钩子
      this.runAfterHooks(finalLocation, from)
    }
    catch (error) {
      // 处理重定向错误
      if (error instanceof NavigationRedirectError) {
        // 增加重定向计数
        this.redirectCount++

        // 递归处理重定向
        return this.pushWithRedirect(error.to, replace)
      }

      if (error instanceof Error) {
        this.handleError(error)
        this.redirectCount = 0 // 重置计数器
        return this.createNavigationFailure(
          NavigationFailureType.aborted,
          from,
          targetLocation,
        )
      }

      this.redirectCount = 0 // 重置计数器
      throw error
    }

    // 成功导航后重置计数器
    this.redirectCount = 0
  }

  private async runNavigationGuards(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
  ): Promise<RouteLocationNormalized> {
    let currentTo = to

    // 首先检查路由记录的重定向配置
    const redirectResult = this.handleRouteRedirect(currentTo, 0)

    // 如果发生了重定向（比较路径），抛出重定向错误
    if (redirectResult.path !== currentTo.path) {
      throw new NavigationRedirectError(redirectResult)
    }

    currentTo = redirectResult
    
    // 执行全局前置守卫
    for (const guard of this.beforeGuards) {
      const result = await this.runGuard(guard, currentTo, from)
      if (result === false) {
        throw new Error('Navigation aborted by guard')
      }
      else if (
        result
        && (typeof result === 'string' || (typeof result === 'object' && result !== null))
      ) {
        // 重定向
        currentTo = this.resolve(result)
      }
    }

    // 执行路由级守卫
    for (const record of currentTo.matched) {
      if (record.beforeEnter) {
        const result = await this.runGuard(record.beforeEnter, currentTo, from)
        if (result === false) {
          throw new Error('Navigation aborted by route guard')
        }
        else if (
          result
          && (typeof result === 'string' || (typeof result === 'object' && result !== null))
        ) {
          // 重定向
          currentTo = this.resolve(result)
        }
      }
    }

    // 执行全局解析守卫
    for (const guard of this.beforeResolveGuards) {
      const result = await this.runGuard(guard, currentTo, from)
      if (result === false) {
        throw new Error('Navigation aborted by resolve guard')
      }
      else if (
        result
        && (typeof result === 'string' || (typeof result === 'object' && result !== null))
      ) {
        // 重定向
        currentTo = this.resolve(result)
      }
    }
    
    // 优化：定期清理守卫缓存
    if (this.guardResultCache.size > 50) {
      const keysToDelete = Array.from(this.guardResultCache.keys()).slice(0, 25)
      keysToDelete.forEach(key => this.guardResultCache.delete(key))
    }

    return currentTo
  }

  /**
   * 处理路由记录的重定向配置
   */
  private handleRouteRedirect(
    to: RouteLocationNormalized,
    redirectCount: number = 0,
  ): RouteLocationNormalized {
    // 防止无限重定向
    if (redirectCount > 10) {
      throw new Error(`Too many redirects when navigating to ${to.path}`)
    }

    // 检查最后匹配的路由记录是否有重定向配置
    const lastMatched = to.matched[to.matched.length - 1]

    if (lastMatched?.redirect) {
      const redirect = lastMatched.redirect
      let redirectTarget: RouteLocationNormalized

      // 如果重定向是字符串，直接解析
      if (typeof redirect === 'string') {
        redirectTarget = this.resolve(redirect)
      }
      // 如果重定向是函数，调用函数获取重定向目标
      else if (typeof redirect === 'function') {
        const redirectResult = redirect(to)
        if (redirectResult) {
          redirectTarget = this.resolve(redirectResult)
        }
        else {
          return to
        }
      }
      // 如果重定向是对象，直接解析
      else if (typeof redirect === 'object') {
        redirectTarget = this.resolve(redirect)
      }
      else {
        return to
      }

      // 递归处理重定向目标，防止链式重定向
      return this.handleRouteRedirect(redirectTarget, redirectCount + 1)
    }

    return to
  }

  private async runGuard(
    guard: NavigationGuard,
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
  ): Promise<NavigationGuardReturn> {
    // 优化：缓存守卫结果（对于无状态守卫）
    const guardKey = `${guard.name || guard.toString().slice(0, 50)}_${to.path}_${from.path}`
    
    if (this.guardResultCache.has(guardKey)) {
      return this.guardResultCache.get(guardKey)!
    }
    
    const result = await new Promise<NavigationGuardReturn>((resolve, reject) => {
      const next = (result?: NavigationGuardReturn) => {
        if (result === false) {
          reject(new Error('Navigation cancelled'))
        }
        else if (result instanceof Error) {
          reject(result)
        }
        else {
          resolve(result)
        }
      }

      const guardResult = guard(to, from, next)
      if (
        guardResult
        && typeof guardResult === 'object'
        && 'then' in guardResult
        && typeof guardResult.then === 'function'
      ) {
        (guardResult as Promise<NavigationGuardReturn>).then(resolve, reject)
      }
    })
    
    // 缓存结果，限制缓存大小
    if (this.guardResultCache.size >= this.MAX_GUARD_CACHE_SIZE) {
      // 删除最早的缓存项
      const firstKey = this.guardResultCache.keys().next().value
      if (firstKey !== undefined) {
        this.guardResultCache.delete(firstKey)
      }
    }
    this.guardResultCache.set(guardKey, result)
    
    return result
  }

  private runAfterHooks(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
  ): void {
    for (const hook of this.afterHooks) {
      try {
        hook(to, from)
      }
      catch (error) {
        this.handleError(error as Error)
      }
    }
  }

  private updateCurrentRoute(
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
  ): void {
    this.currentRoute.value = to
    // this._pendingLocation = undefined as any

    // 触发准备就绪
    if (this.isReadyResolve) {
      this.isReadyResolve()
      this.isReadyResolve = undefined as any
    }
  }

  private setupHistoryListener(): void {
    this.options.history.listen((to, from, info) => {
      this.handleHistoryChange(to, from, info)
    })
  }

  private async handleHistoryChange(
    to: HistoryLocation,
    _from: HistoryLocation,
    _info: NavigationInformation,
  ): Promise<void> {
    const targetLocation = this.historyLocationToRouteLocation(to)
    const fromLocation = this.currentRoute.value

    try {
      const finalLocation = await this.runNavigationGuards(
        targetLocation,
        fromLocation,
      )
      this.updateCurrentRoute(finalLocation, fromLocation)
      this.runAfterHooks(finalLocation, fromLocation)
    }
    catch (error) {
      this.handleError(error as Error)
    }
  }

  private initializeCurrentRoute(): void {
    const location = this.options.history.location
    const routeLocation = this.historyLocationToRouteLocation(location)

    // 检查是否需要重定向
    const redirectResult = this.handleRouteRedirect(routeLocation, 0)

    if (redirectResult.path !== routeLocation.path) {
      // 需要重定向，使用 replace 模式避免在历史记录中留下原始路径
      this.replace(redirectResult.path)
        .then(() => {
          // 重定向完成后解析 isReady Promise
          if (this.isReadyResolve) {
            this.isReadyResolve()
            this.isReadyResolve = undefined as any
          }
        })
        .catch((error) => {
          this.handleError(error)
          // 即使重定向失败也要解析 isReady Promise
          if (this.isReadyResolve) {
            this.isReadyResolve()
            this.isReadyResolve = undefined as any
          }
        })
    }
    else {
      // 不需要重定向，直接设置当前路由
      this.currentRoute.value = routeLocation

      // 直接解析 isReady Promise
      if (this.isReadyResolve) {
        this.isReadyResolve()
        this.isReadyResolve = undefined as any
      }
    }
  }

  private routeLocationToHistoryLocation(
    location: RouteLocationNormalized,
  ): HistoryLocation {
    return {
      pathname: location.path,
      search: this.stringifyQuery(location.query),
      hash: location.hash,
    }
  }

  private historyLocationToRouteLocation(
    location: HistoryLocation,
  ): RouteLocationNormalized {
    const path = location.pathname
    const query = this.parseQuery(location.search)
    const hash = location.hash

    try {
      return this.matcher.resolve({ path, query, hash })
    }
    catch {
      // 如果匹配失败，返回 404 路由或默认路由
      return {
        ...START_LOCATION,
        path,
        query,
        hash,
        fullPath: path + location.search + location.hash,
      }
    }
  }

  private parseQuery(search: string): Record<string, any> {
    if (this.options.parseQuery) {
      return this.options.parseQuery(search.slice(1))
    }

    const query: Record<string, any> = {}
    const params = new URLSearchParams(search)

    for (const [key, value] of params) {
      query[key] = value
    }

    return query
  }

  private stringifyQuery(query: Record<string, any>): string {
    if (this.options.stringifyQuery) {
      const result = this.options.stringifyQuery(query)
      return result ? `?${result}` : ''
    }

    const params = new URLSearchParams()

    for (const [key, value] of Object.entries(query)) {
      if (value !== null && value !== undefined) {
        params.append(key, String(value))
      }
    }

    const result = params.toString()
    return result ? `?${result}` : ''
  }

  private isSameRouteLocation(
    a: RouteLocationNormalized,
    b: RouteLocationNormalized,
  ): boolean {
    return (
      a.path === b.path
      && JSON.stringify(a.query) === JSON.stringify(b.query)
      && a.hash === b.hash
    )
  }

  private createNavigationFailure(
    type: NavigationFailureType,
    from: RouteLocationNormalized,
    to: RouteLocationNormalized,
  ): NavigationFailure {
    const error = new Error(`Navigation failed`) as NavigationFailure
    error.type = type
    error.from = from
    error.to = to
    return error
  }

  private handleError(error: Error): void {
    for (const handler of this.errorHandlers) {
      try {
        handler(error)
      }
      catch (handlerError) {
        console.error('Error in error handler:', handlerError)
      }
    }

    if (this.errorHandlers.length === 0) {
      console.error('Unhandled router error:', error)
    }
  }
}

// ==================== 工厂函数 ====================

/**
 * 创建路由器实例
 */
export function createRouter(options: RouterOptions): Router {
  return new RouterImpl(options)
}
