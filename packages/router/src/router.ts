import type { App, Ref } from 'vue'
import type {
  NavigationFailure,
  NavigationGuard,
  NavigationHookAfter,
  RouteLocationNormalized,
  RouteLocationRaw,
  Router,
  RouteRecordRaw,
  RouterOptions,
} from './types'
import { ref } from 'vue'
import { RouterLink } from './components/RouterLink'
import { RouterView } from './components/RouterView'
import { NavigationFailureType, START_LOCATION } from './constants'
import { createRouterMatcher } from './matcher'

/**
 * 创建路由器实例
 */
export function createRouter(options: RouterOptions): Router {
  const matcher = createRouterMatcher(options.routes, options)
  const currentRoute = ref<RouteLocationNormalized>(START_LOCATION)

  // 导航守卫（使用 Set 提高性能）
  const beforeGuards = new Set<NavigationGuard>()
  const beforeResolveGuards = new Set<NavigationGuard>()
  const afterGuards = new Set<NavigationHookAfter>()

  // 错误处理
  const errorHandlers: Array<(error: Error, to: RouteLocationNormalized, from: RouteLocationNormalized) => any> = []

  let ready = false
  let readyPromise: Promise<void>

  const router: Router = {
    currentRoute: currentRoute as Ref<RouteLocationNormalized>,
    options,

    addRoute(parentOrRoute: string | symbol | RouteRecordRaw, route?: RouteRecordRaw) {
      if (typeof parentOrRoute === 'string' || typeof parentOrRoute === 'symbol') {
        return matcher.addRoute(route!, parentOrRoute)
      }
      else {
        return matcher.addRoute(parentOrRoute)
      }
    },

    removeRoute(name: string | symbol) {
      matcher.removeRoute(name)
    },

    hasRoute(name: string | symbol) {
      return matcher.hasRoute(name)
    },

    getRoutes() {
      return matcher.getRoutes()
    },

    resolve(to: RouteLocationRaw, currentLocation?: RouteLocationNormalized) {
      return matcher.resolve(to, currentLocation || currentRoute.value)
    },

    async push(to: RouteLocationRaw) {
      return navigate(to, 'push')
    },

    async replace(to: RouteLocationRaw) {
      return navigate(to, 'replace')
    },

    go(delta: number) {
      options.history.go(delta)
    },

    back() {
      router.go(-1)
    },

    forward() {
      router.go(1)
    },

    beforeEach(guard: NavigationGuard) {
      beforeGuards.add(guard)
      return () => {
        beforeGuards.delete(guard)
      }
    },

    beforeResolve(guard: NavigationGuard) {
      beforeResolveGuards.add(guard)
      return () => {
        beforeResolveGuards.delete(guard)
      }
    },

    afterEach(guard: NavigationHookAfter) {
      afterGuards.add(guard)
      return () => {
        afterGuards.delete(guard)
      }
    },

    onError(handler) {
      errorHandlers.push(handler)
      return () => {
        const index = errorHandlers.indexOf(handler)
        if (index > -1)
          errorHandlers.splice(index, 1)
      }
    },

    isReady() {
      if (ready)
        return Promise.resolve()
      if (readyPromise)
        return readyPromise

      readyPromise = new Promise((resolve) => {
        const removeListener = options.history.listen(() => {
          ready = true
          removeListener()
          resolve()
        })

        // 初始化当前路由
        const location = options.history.location
        const route = matcher.resolve({ path: location }, START_LOCATION)
        currentRoute.value = route
      })

      return readyPromise
    },

    install(app: App) {
      app.config.globalProperties.$router = router
      app.config.globalProperties.$route = currentRoute

      // 提供注入
      app.provide('router', router)
      app.provide('route', currentRoute)

      // 注册全局组件
      app.component('RouterView', RouterView)
      app.component('RouterLink', RouterLink)
    },
  }

  /**
   * 导航到指定位置
   */
  async function navigate(
    to: RouteLocationRaw,
    type: 'push' | 'replace',
  ): Promise<NavigationFailure | void | undefined> {
    const from = currentRoute.value
    const targetLocation = router.resolve(to, from)

    try {
      // 执行导航守卫
      await runGuardQueue(beforeGuards, targetLocation, from)
      await runGuardQueue(beforeResolveGuards, targetLocation, from)

      // 更新历史记录
      const historyState: any = {
        path: targetLocation.path,
        query: targetLocation.query,
        hash: targetLocation.hash,
        params: targetLocation.params,
        scroll: null,
      }
      if (type === 'push') {
        options.history.push(targetLocation.fullPath, historyState)
      }
      else {
        options.history.replace(targetLocation.fullPath, historyState)
      }

      // 更新当前路由
      currentRoute.value = targetLocation

      // 执行后置钩子
      for (const guard of afterGuards) {
        guard(targetLocation, from)
      }
    }
    catch (err) {
      if (err instanceof Error) {
        // 处理导航错误
        errorHandlers.forEach(handler => handler(err, targetLocation, from))

        // 返回导航失败
        return {
          type: NavigationFailureType.aborted,
          from,
          to: targetLocation,
        } as NavigationFailure
      }
      throw err
    }
  }

  /**
   * 执行守卫队列
   */
  async function runGuardQueue(
    guards: Set<NavigationGuard>,
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
  ): Promise<void> {
    for (const guard of guards) {
      await new Promise<void>((resolve, reject) => {
        const next = (result?: any) => {
          if (result === false) {
            reject(new Error('Navigation cancelled'))
          }
          else if (result instanceof Error) {
            reject(result)
          }
          else if (typeof result === 'string' || (result && typeof result === 'object')) {
            reject(new Error('Navigation redirected'))
          }
          else {
            resolve()
          }
        }

        const guardResult = guard(to, from, next)
        if (guardResult instanceof Promise) {
          guardResult.then(next).catch(reject)
        }
      })
    }
  }

  // 监听历史变化
  options.history.listen((to) => {
    const route = matcher.resolve(to, currentRoute.value)
    currentRoute.value = route
  })

  return router
}
