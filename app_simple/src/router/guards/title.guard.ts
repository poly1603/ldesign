/**
 * 页面标题守卫
 * 动态设置页面标题
 */

import type { RouterEnginePlugin } from '@ldesign/router'
import { APP_NAME } from '@/config/app.config'

/**
 * 设置页面标题守卫
 */
export function setupTitleGuard(router: RouterEnginePlugin) {
  router.afterEach((to) => {
    // 获取页面标题
    const title = to.meta?.title as string | undefined
    
    if (title) {
      document.title = `${title} - ${APP_NAME}`
    } else {
      document.title = APP_NAME
    }
  })
}