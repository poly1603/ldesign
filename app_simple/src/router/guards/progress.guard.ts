/**
 * 进度条守卫
 * 显示路由切换进度
 */

import type { RouterEnginePlugin } from '@ldesign/router'

// 简单的进度条实现
class NProgress {
  private timer: number | null = null
  
  start() {
    // 可以集成 NProgress 库或自定义实现
    console.log('🔄 路由切换开始...')
  }
  
  done() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    console.log('✅ 路由切换完成')
  }
}

const nprogress = new NProgress()

/**
 * 设置进度条守卫
 */
export function setupProgressGuard(router: RouterEnginePlugin) {
  router.beforeEach((to, from, next) => {
    nprogress.start()
    next()
  })
  
  router.afterEach(() => {
    nprogress.done()
  })
}