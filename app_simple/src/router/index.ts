/**
 * 路由器配置和创建
 */

import { createRouterEnginePlugin } from '@ldesign/router'
import routes from './routes'
import { setupGuards } from './guards'
import { routerConfig } from '../config/router.config'

/**
 * 创建路由器插件
 */
export function createRouter() {
  const routerPlugin = createRouterEnginePlugin({
    routes,
    ...routerConfig,

    // 滚动行为
    scrollBehavior: (to, from, savedPosition) => {
      if (savedPosition) {
        return savedPosition
      }
      if (to.hash) {
        return { el: to.hash, behavior: 'smooth' }
      }
      return { top: 0, behavior: 'smooth' }
    }
  })

  // 设置路由守卫
  setupGuards(routerPlugin)

  return routerPlugin
}

export default createRouter