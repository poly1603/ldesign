/**
 * 权限守卫
 * 检查用户是否有权限访问页面
 */

import type { RouterEnginePlugin } from '@ldesign/router'
import { auth } from '@/composables/useAuth'

/**
 * 设置权限守卫
 */
export function setupPermissionGuard(router: RouterEnginePlugin) {
  router.beforeEach((to, from, next) => {
    // 获取路由所需角色
    const requiredRoles = to.meta?.roles as string[] | undefined
    
    // 如果路由不需要特定角色，直接放行
    if (!requiredRoles || requiredRoles.length === 0) {
      next()
      return
    }
    
    // 检查用户是否有权限
    if (!auth.canAccess(requiredRoles)) {
      console.warn(`用户无权访问 ${to.path}，需要角色: ${requiredRoles.join(', ')}`)
      
      // 如果未登录，跳转到登录页
      if (!auth.isLoggedIn.value) {
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
        return
      }
      
      // 已登录但无权限，跳转到403页面或首页
      next({
        path: '/403',
        replace: true
      })
      return
    }
    
    next()
  })
}