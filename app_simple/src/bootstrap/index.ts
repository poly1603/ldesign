/**
 * 应用启动模块
 * 负责初始化和启动整个应用
 */

import { createEngineApp } from '@ldesign/engine'
import App from '@/App.vue'
import { createRouter } from '@/router'
import { engineConfig } from '@/config/app.config'
import { auth } from '@/composables/useAuth'
import { initializePlugins } from './plugins'
import { setupVueApp, setupEngineReady } from './app-setup'
import { handleAppError } from './error-handler'

/**
 * 启动应用
 */
export async function bootstrap() {
  try {
    console.log('🚀 启动应用...')

    // 初始化认证状态
    auth.initAuth()

    // 创建路由器插件
    const routerPlugin = createRouter()

    // 初始化所有插件
    const { i18nPlugin, colorPlugin, sizePlugin, templatePlugin, localeRef } = initializePlugins()

    // 创建应用引擎
    const engine = await createEngineApp({
      // 根组件和挂载点
      rootComponent: App,
      mountElement: '#app',

      // 使用配置文件
      config: engineConfig,

      // 插件（路由器和国际化）
      plugins: [routerPlugin, i18nPlugin],

      // Vue应用配置
      setupApp: async (app) => {
        setupVueApp(app, {
          localeRef,
          i18nPlugin,
          colorPlugin,
          sizePlugin,
          templatePlugin
        })
      },

      // 错误处理
      onError: handleAppError,

      // 引擎就绪
      onReady: (engine) => {
        try {
          setupEngineReady(engine, localeRef, i18nPlugin, colorPlugin, sizePlugin)
        } catch (err) {
          console.error('[index.ts] Error in onReady:', err)
        }
      },

      // 应用挂载完成
      onMounted: () => {
        console.log('✅ 应用已挂载')
      }
    })

    return engine

  } catch (error) {
    console.error('❌ 应用启动失败:', error)
    throw error
  }
}