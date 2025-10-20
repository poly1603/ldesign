/**
 * 路由守卫配置
 * 处理认证、权限和其他导航逻辑
 */

import type { NavigationGuardNext, RouteLocationNormalized } from '@ldesign/router'

// 存储守卫清理函数
const guardsCleanupFns = new WeakMap<any, (() => void)[]>()

/**
 * 设置路由守卫
 * @param routerPlugin - 路由器插件实例
 */
export function setupGuards(routerPlugin: any) {
  // 由于 routerPlugin 返回的是 Engine 插件对象，
  // 需要在插件安装后通过 engine.router 访问路由器
  // 所以我们将守卫逻辑放在插件的 install 生命周期中

  // 修改插件的 install 方法，添加守卫
  const originalInstall = routerPlugin.install

  routerPlugin.install = async function (context: any) {
    // 先执行原始的 install
    await originalInstall.call(this, context)

    // 获取 engine 实例
    const engine = context.engine || context

    // 等待路由器在引擎上就绪
    // 使用 requestIdleCallback 或多次 Promise.resolve 确保路由器已安装
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    if (!engine.router) {
      // 路由器尚未就绪，静默返回（这是正常的初始化顺序）
      return
    }

    const router = engine.router
    const cleanupFns: (() => void)[] = []

    // 全局前置守卫
    const beforeEachGuard = (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
      // 路由守卫逻辑（调试日志已禁用）

      // 检查是否需要认证
      if (to.meta?.requiresAuth) {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

        if (!isLoggedIn) {
          next({
            path: '/login',
            query: { redirect: to.fullPath }
          })
          return
        }
      }

      // 检查角色权限
      if (to.meta?.roles) {
        const userRole = localStorage.getItem('userRole') || 'guest'
        const requiredRoles = to.meta.roles as string[]

        if (!requiredRoles.includes(userRole)) {
          next('/403')
          return
        }
      }

      next()
    }

    const removeBeforeEach = router.beforeEach(beforeEachGuard)
    if (typeof removeBeforeEach === 'function') {
      cleanupFns.push(removeBeforeEach)
    }

    // 全局后置守卫
    const afterEachGuard = (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
      // 设置页面标题
      const title = to.meta?.title as string
      if (title) {
        document.title = `${title} - LDesign Simple App`
      } else {
        document.title = 'LDesign Simple App'
      }
    }

    const removeAfterEach = router.afterEach(afterEachGuard)
    if (typeof removeAfterEach === 'function') {
      cleanupFns.push(removeAfterEach)
    }

    // 全局错误处理
    const errorHandler = (error: Error) => {
      console.error('[路由守卫] 导航错误:', error)

      // 显示错误提示
      if (engine.notification) {
        engine.notification.error({
          title: '导航错误',
          message: error.message
        })
      }
    }

    const removeErrorHandler = router.onError(errorHandler)
    if (typeof removeErrorHandler === 'function') {
      cleanupFns.push(removeErrorHandler)
    }

    // 保存清理函数
    if (cleanupFns.length > 0) {
      guardsCleanupFns.set(router, cleanupFns)

      // 如果引擎有销毁钩子，注册清理
      if (typeof engine.onBeforeUnmount === 'function') {
        engine.onBeforeUnmount(() => {
          cleanupRouterGuards(router)
        })
      }
    }
  }
}

/**
 * 清理路由守卫
 */
export function cleanupRouterGuards(router: any) {
  const cleanupFns = guardsCleanupFns.get(router)
  if (cleanupFns) {
    cleanupFns.forEach(fn => {
      try {
        fn()
      } catch (error) {
        console.warn('Error during router guards cleanup:', error)
      }
    })
    guardsCleanupFns.delete(router)
  }
}

/**
 * 创建认证守卫
 */
export function createAuthGuard() {
  return (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

    if (to.meta?.requiresAuth && !isLoggedIn) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  }
}

/**
 * 创建权限守卫
 */
export function createPermissionGuard() {
  return (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    if (to.meta?.roles) {
      const userRole = localStorage.getItem('userRole') || 'guest'
      const requiredRoles = to.meta.roles as string[]

      if (!requiredRoles.includes(userRole)) {
        next('/403')
      } else {
        next()
      }
    } else {
      next()
    }
  }
}

/**
 * 创建进度条守卫
 */
export function createProgressGuard() {
  return {
    before: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
      // 开始进度条
      if ((window as any).NProgress) {
        (window as any).NProgress.start()
      }
      next()
    },
    after: () => {
      // 结束进度条
      if ((window as any).NProgress) {
        (window as any).NProgress.done()
      }
    }
  }
}