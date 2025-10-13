/**
 * 认证守卫
 * 检查用户是否已登录
 */

import type { RouterEnginePlugin } from '@ldesign/router'
import { auth } from '@/composables/useAuth'

const LOGIN_PATH = '/login'
const DEFAULT_REDIRECT = '/'  // 默认重定向到首页而不是 dashboard

/**
 * 设置认证守卫
 */
export function setupAuthGuard(router: RouterEnginePlugin) {
  router.beforeEach((to, from, next) => {
    // 初始化认证状态
    if (!auth.userInfo) {
      auth.initAuth()
    }

    // 检查路由是否需要认证
    const requiresAuth = to.meta?.requiresAuth === true
    
    if (requiresAuth) {
      // 需要认证但未登录
      if (!auth.isLoggedIn.value) {
        // 记录原始访问路径，登录后重定向
        const redirect = to.fullPath !== LOGIN_PATH ? to.fullPath : DEFAULT_REDIRECT
        
        next({
          path: LOGIN_PATH,
          query: { redirect }
        })
        return
      }
    }
    
    // 已登录用户访问登录页，重定向到首页或原始目标
    if (to.path === LOGIN_PATH && auth.isLoggedIn.value) {
      // 避免循环重定向，如果 redirect 是登录页本身，则跳转到首页
      let redirect = (to.query.redirect as string) || DEFAULT_REDIRECT
      if (redirect === LOGIN_PATH) {
        redirect = DEFAULT_REDIRECT
      }
      next(redirect)
      return
    }
    
    // 放行
    next()
  })
}