import type { App } from '../components'
import type {
  NavigationFailure,
  NavigationGuard,
  NavigationGuardReturn,
  NavigationHookAfter,
  Ref,
  RouteLocationNormalized,
  RouteLocationRaw,
  Router,
  RouteRecordRaw,
  RouterOptions,
} from '../types'

// 直接导入 Vue 函数
import { ref } from 'vue'
import { RouterLink } from '../components/RouterLink'
import { RouterView } from '../components/RouterView'
import { NavigationFailureType, START_LOCATION } from './constants'
import { createRouterMatcher } from './matcher'

/**
 * 创建路由器实例
 */
export function createRouter(options: RouterOptions): Router {
  const matcher = createRouterMatcher(options.routes, options)
  const currentRoute = ref(START_LOCATION) as Ref<RouteLocationNormalized>

  // 导航守卫（使用 Set 提高性能）
  const beforeGuards = new Set<NavigationGuard>()
  const beforeResolveGuards = new Set<NavigationGuard>()
  const afterGuards = new Set<NavigationHookAfter>()

  // 错误处理
  const errorHandlers: Array<
    (
      error: Error,
      to: RouteLocationNormalized,
      from: RouteLocationNormalized
    ) => void
  > = []

  let ready = false
  let readyPromise: Promise<void>
  let readyResolve: () => void
  let readyReject: (error: Error) => void

  // 初始化 ready Promise
  function initReadyPromise() {
    readyPromise = new Promise<void>((resolve, reject) => {
      readyResolve = resolve
      readyReject = reject
    })
  }

  initReadyPromise()

  /**
   * 导航到指定路由
   */
  async function push(to: RouteLocationRaw): Promise<NavigationFailure | void> {
    return navigate(to, 'push')
  }

  /**
   * 替换当前路由
   */
  async function replace(
    to: RouteLocationRaw
  ): Promise<NavigationFailure | void> {
    return navigate(to, 'replace')
  }

  /**
   * 前进或后退指定步数
   */
  function go(delta: number): void {
    options.history.go(delta)
  }

  /**
   * 后退一步
   */
  function back(): void {
    go(-1)
  }

  /**
   * 前进一步
   */
  function forward(): void {
    go(1)
  }

  /**
   * 核心导航函数
   */
  async function navigate(
    to: RouteLocationRaw,
    type: 'push' | 'replace' = 'push'
  ): Promise<NavigationFailure | void> {
    const from = currentRoute.value

    // 解析目标路由
    const targetLocation = matcher.resolve(to, from)

    try {
      // 目标路由已在上面解析

      // 执行导航守卫
      const failure = await runGuards(targetLocation, from)
      if (failure) {
        return failure
      }

      // 更新历史记录
      if (type === 'push') {
        options.history.push(targetLocation.fullPath)
      } else {
        options.history.replace(targetLocation.fullPath)
      }

      // 更新当前路由
      currentRoute.value = targetLocation

      // 执行后置守卫
      afterGuards.forEach(guard => guard(targetLocation, from))

      if (!ready) {
        ready = true
        readyResolve()
      }
    } catch (error) {
      // 处理错误
      const targetLocation = matcher.resolve(to, from)
      const handled = errorHandlers.some(handler => {
        try {
          handler(error as Error, targetLocation, from)
          return true
        } catch {
          return false
        }
      })

      if (!handled) {
        if (!ready) {
          readyReject(error as Error)
        }
        throw error
      }
    }
  }

  /**
   * 运行导航守卫
   */
  async function runGuards(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): Promise<NavigationFailure | void> {
    // 运行 beforeEach 守卫
    for (const guard of beforeGuards) {
      const result = await new Promise<NavigationGuardReturn>(resolve => {
        const next = (result?: NavigationGuardReturn) => resolve(result)
        const guardResult = guard(to, from, next)
        if (guardResult !== undefined) {
          resolve(guardResult)
        }
      })
      if (result !== true && result !== undefined) {
        return createNavigationFailure(to, from, result)
      }
    }

    // 运行 beforeResolve 守卫
    for (const guard of beforeResolveGuards) {
      const result = await new Promise<NavigationGuardReturn>(resolve => {
        const next = (result?: NavigationGuardReturn) => resolve(result)
        const guardResult = guard(to, from, next)
        if (guardResult !== undefined) {
          resolve(guardResult)
        }
      })
      if (result !== true && result !== undefined) {
        return createNavigationFailure(to, from, result)
      }
    }
  }

  /**
   * 创建导航失败对象
   */
  function createNavigationFailure(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    result: NavigationGuardReturn
  ): NavigationFailure {
    return {
      type: NavigationFailureType.aborted,
      from,
      to,
      message: typeof result === 'string' ? result : 'Navigation aborted',
    } as NavigationFailure
  }

  /**
   * 添加导航守卫
   */
  function beforeEach(guard: NavigationGuard): () => void {
    beforeGuards.add(guard)
    return () => beforeGuards.delete(guard)
  }

  function beforeResolve(guard: NavigationGuard): () => void {
    beforeResolveGuards.add(guard)
    return () => beforeResolveGuards.delete(guard)
  }

  function afterEach(guard: NavigationHookAfter): () => void {
    afterGuards.add(guard)
    return () => afterGuards.delete(guard)
  }

  /**
   * 错误处理
   */
  function onError(
    handler: (
      error: Error,
      to: RouteLocationNormalized,
      from: RouteLocationNormalized
    ) => void
  ): () => void {
    errorHandlers.push(handler)
    return () => {
      const index = errorHandlers.indexOf(handler)
      if (index > -1) errorHandlers.splice(index, 1)
    }
  }

  /**
   * 添加路由
   */
  function addRoute(route: RouteRecordRaw): () => void
  function addRoute(
    parentName: string | symbol,
    route: RouteRecordRaw
  ): () => void
  function addRoute(
    parentOrRoute: string | symbol | RouteRecordRaw,
    route?: RouteRecordRaw
  ): () => void {
    if (
      typeof parentOrRoute === 'string' ||
      typeof parentOrRoute === 'symbol'
    ) {
      return matcher.addRoute(route!, parentOrRoute)
    } else {
      return matcher.addRoute(parentOrRoute)
    }
  }

  /**
   * 移除路由
   */
  function removeRoute(name: string | symbol): void {
    matcher.removeRoute(name)
  }

  /**
   * 获取所有路由记录
   */
  function getRoutes() {
    return matcher.getRoutes()
  }

  /**
   * 检查路由是否存在
   */
  function hasRoute(name: string | symbol): boolean {
    return matcher.hasRoute(name)
  }

  /**
   * 解析路由
   */
  function resolve(
    to: RouteLocationRaw,
    currentLocation?: RouteLocationNormalized
  ) {
    return matcher.resolve(to, currentLocation || currentRoute.value)
  }

  /**
   * 获取当前路由
   */
  function getCurrentRoute() {
    return currentRoute
  }

  // install 函数将在 router 对象定义后添加

  const router: Router = {
    currentRoute: currentRoute as Ref<RouteLocationNormalized>,
    options,

    push,
    replace,
    go,
    back,
    forward,

    beforeEach,
    beforeResolve,
    afterEach,
    onError,

    addRoute,
    removeRoute,
    getRoutes,
    hasRoute,
    resolve,
    getCurrentRoute,

    // install 方法将在下面赋值
    install: (() => {}) as any,

    isReady: () => readyPromise,
  }

  /**
   * 安装路由器到 Vue 应用
   */
  router.install = function install(app: App) {
    app.config.globalProperties.$router = router
    app.config.globalProperties.$route = currentRoute

    app.provide('router', router)
    app.provide('route', currentRoute)

    // 注册组件
    app.component('RouterView', RouterView)
    app.component('RouterLink', RouterLink)

    // 解析并设置初始路由
    const initialLocation = options.history.location()
    const initialRoute = matcher.resolve(initialLocation, currentRoute.value)
    currentRoute.value = initialRoute

    // 监听历史变化
    const removeHistoryListener = options.history.listen((to, _from, _info) => {
      const targetLocation = matcher.resolve(to, currentRoute.value)
      currentRoute.value = targetLocation
    })

    // 应用卸载时清理
    app.onUnmount?.(() => {
      removeHistoryListener()
    })
  }

  return router
}
