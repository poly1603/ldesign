import { createRouter, createWebHistory } from '@ldesign/router'
import type { Engine } from '@ldesign/engine'
import type { App } from 'vue'
import { routes } from './routes'
import { setupGuards } from './guards'

/**
 * 设置路由系统
 */
export async function setupRouter(engine: Engine, app: App) {
  try {
    // 创建路由实例
    const router = createRouter({
      routes,
      history: createWebHistory(import.meta.env.BASE_URL || '/'),

      // 路由配置
      scrollBehavior: (to, from, savedPosition) => {
        if (savedPosition) {
          return savedPosition
        } else if (to.hash) {
          return { el: to.hash }
        } else {
          return { top: 0 }
        }
      }
    })

    // 设置路由守卫
    setupGuards(router, engine)

    // 安装路由到Vue应用
    app.use(router)

    // 注册路由到引擎状态
    engine.state.set('router', router)

    // 监听路由变化
    router.afterEach((to, from) => {
      // 发送路由变化事件
      engine.events.emit('route:change', { to, from })

      // 更新页面标题
      if (to.meta?.title) {
        document.title = `${to.meta.title} - LDesign App`
      }

      // 记录路由访问日志
      engine.logger.info('Route changed', {
        from: from.path,
        to: to.path,
        title: to.meta?.title
      })
    })

    // 监听路由错误
    router.onError((error) => {
      engine.logger.error('Router error:', error)
      engine.notifications.show({
        type: 'error',
        title: '路由错误',
        message: '页面跳转时发生错误，请重试'
      })
    })

    engine.logger.info('Router setup completed')
    return router
  } catch (error) {
    engine.logger.error('Failed to setup router:', error)
    throw error
  }
}

// 导出路由相关的工具
export * from './routes'
export * from './guards'
export { createRouter } from '@ldesign/router'
