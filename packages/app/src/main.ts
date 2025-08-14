import type { AppConfig } from './types'
import { createApp, presets } from '@ldesign/engine'
import { createHttpEnginePlugin } from '@ldesign/http'
import { createI18nEnginePlugin } from '@ldesign/i18n'
import { createRouterEnginePlugin } from '@ldesign/router'
import { createTemplateEnginePlugin } from '@ldesign/template'
import App from './App'
import { appI18nConfig, createAppI18n } from './i18n'
import { routes } from './router/routes'

/**
 * 创建简化的 LDesign 应用
 */
async function createLDesignApp(config?: Partial<AppConfig>) {
  const defaultConfig: AppConfig = {
    name: 'LDesign App Demo',
    version: '0.1.0',
    debug: true,
    ...config,
  }

  try {
    console.log('🚀 启动 LDesign Engine 应用...')

    const engine = createApp(App, {
      ...presets.development(),
      config: {
        debug: defaultConfig.debug,
        appName: defaultConfig.name,
        version: defaultConfig.version,
      },
    })

    // 集成路由插件
    await engine.use(
      createRouterEnginePlugin({
        routes,
        mode: 'hash',
        base: '/',
      })
    )

    // 集成 i18n 插件
    await engine.use(
      createI18nEnginePlugin({
        ...appI18nConfig,
        name: 'i18n',
        version: '1.0.0',
        createI18n: createAppI18n,
      })
    )

    // 集成 Template 插件
    await engine.use(
      createTemplateEnginePlugin({
        name: 'template',
        version: '1.0.0',
        defaultDevice: 'desktop',
      })
    )

    // 集成 HTTP 插件
    await engine.use(
      createHttpEnginePlugin({
        name: 'http',
        version: '1.0.0',
        clientConfig: {
          baseURL: 'https://jsonplaceholder.typicode.com',
          timeout: 10000,
        },
      })
    )

    // 注入Engine到全局属性
    const vueApp = engine.getApp()
    if (vueApp) {
      vueApp.config.globalProperties.$engine = engine
    }

    engine.mount('#app')

    console.log('✅ LDesign 应用启动成功!')
    return { engine, config: defaultConfig }
  } catch (error) {
    console.error('❌ 应用启动失败:', error)
    throw error
  }
}

// 启动应用
createLDesignApp().catch(error => {
  console.error('❌ 应用启动失败:', error)
})

export default createLDesignApp
