/**
 * 路由配置文件
 * 
 * 本文件展示了 @ldesign/router 的完整功能：
 * 1. 基础路由配置
 * 2. 动态路由参数
 * 3. 嵌套路由
 * 4. 路由守卫
 * 5. 懒加载
 * 6. 设备适配
 */

import { 
  createRouter, 
  createWebHistory,
  type RouteRecordRaw 
} from '@ldesign/router'
import { routes } from './routes'
import { setupGuards } from './guards'

/**
 * 创建路由器实例
 */
export async function setupRouter() {
  // 创建路由器
  const router = createRouter({
    // 使用 HTML5 History 模式
    history: createWebHistory(import.meta.env?.BASE_URL),
    
    // 路由配置
    routes,
    
    // 滚动行为
    scrollBehavior(to, from, savedPosition) {
      // 如果有保存的滚动位置，恢复它
      if (savedPosition) {
        return savedPosition
      }
      
      // 如果有锚点，滚动到锚点
      if (to.hash) {
        return {
          el: to.hash,
          behavior: 'smooth'
        }
      }
      
      // 默认滚动到顶部
      return { top: 0 }
    },
    
    // 链接激活类名
    linkActiveClass: 'router-link-active',
    linkExactActiveClass: 'router-link-exact-active'
  })

  // 设置路由守卫
  setupGuards(router)

  // 开发环境下的路由调试
  if (import.meta.env?.DEV) {
    // 监听路由变化
    router.afterEach((to, from) => {
                })

    // 监听路由错误
    router.onError((error, to, from) => {
      console.error('❌ 路由错误:', error)
                })
  }

  return router
}

/**
 * 获取路由器实例（用于在非组件中使用）
 */
let routerInstance: ReturnType<typeof createRouter> | null = null

export function getRouter() {
  if (!routerInstance) {
    throw new Error('路由器尚未初始化，请先调用 setupRouter()')
  }
  return routerInstance
}

/**
 * 设置路由器实例
 */
export function setRouter(router: ReturnType<typeof createRouter>) {
  routerInstance = router
}
