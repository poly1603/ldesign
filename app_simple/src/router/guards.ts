/**
 * 路由守卫配置
 * 处理认证、权限和其他导航逻辑
 */

import type { NavigationGuardNext, RouteLocationNormalized } from '@ldesign/router'

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
  
  routerPlugin.install = async function(context: any) {
    // 先执行原始的 install
    await originalInstall.call(this, context)
    
    // 获取 engine 实例
    const engine = context.engine || context
    
    // 等待路由器就绪
    setTimeout(() => {
      if (!engine.router) {
        console.warn('Router not found on engine, guards not installed')
        return
      }
      
      const router = engine.router
      
      // 全局前置守卫
      router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
        console.log(`[路由守卫] 导航到: ${to.path}`)
        
        // 检查是否需要认证
        if (to.meta?.requiresAuth) {
          const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
          
          if (!isLoggedIn) {
            console.log('[路由守卫] 需要登录，重定向到登录页')
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
            console.log(`[路由守卫] 权限不足，需要角色: ${requiredRoles.join(', ')}`)
            next('/403')
            return
          }
        }
        
        next()
      })
      
      // 全局后置守卫
      router.afterEach((to: RouteLocationNormalized, from: RouteLocationNormalized) => {
        // 设置页面标题
        const title = to.meta?.title as string
        if (title) {
          document.title = `${title} - LDesign Simple App`
        } else {
          document.title = 'LDesign Simple App'
        }
        
        // 记录导航
        console.log(`[路由守卫] 导航完成: ${from.path} -> ${to.path}`)
      })
      
      // 全局错误处理
      router.onError((error: Error) => {
        console.error('[路由守卫] 导航错误:', error)
        
        // 显示错误提示
        if (engine.notification) {
          engine.notification.error({
            title: '导航错误',
            message: error.message
          })
        }
      })
      
      console.log('[路由守卫] 守卫安装完成')
    }, 100) // 给一点延迟确保路由器已经完全初始化
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