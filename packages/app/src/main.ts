import type { AppConfig } from './types'
import { createApp, presets } from '@ldesign/engine'
import { createRouterEnginePlugin } from '@ldesign/router'
import { createI18nEnginePlugin } from '@ldesign/i18n'
import { createTemplateEnginePlugin } from '@ldesign/template'
import { createHttpEnginePlugin } from '@ldesign/http'
import App from './App'
import { routes } from './router/routes'
import { appI18nConfig, createAppI18n } from './i18n'

/**
 * 创建 LDesign 应用
 * @param config 应用配置
 * @returns 应用实例
 */
async function createLDesignApp(config?: Partial<AppConfig>) {
  const defaultConfig: AppConfig = {
    name: 'LDesign App',
    version: '0.1.0',
    debug: true,
    ...config,
  }

  try {
    // eslint-disable-next-line no-console
    console.log('🚀 开始启动 LDesign Engine 应用...')
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

    // 统一使用 engine.use() 方式集成插件

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
        enableCache: true,
        cacheLimit: 50,
        componentPrefix: 'L',
        registerComponents: true,
        registerDirectives: true,
        provideGlobalProperties: true,
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
          headers: {
            'Content-Type': 'application/json',
          },
        },
        globalInjection: true,
        globalPropertyName: '$http',
      })
    )

    // 注入Engine到全局属性
    const vueApp = engine.getApp()
    if (vueApp) {
      vueApp.config.globalProperties.$engine = engine
    }

    engine.mount('#app')

    // 返回应用实例
    return {
      engine,
      router: engine.router,
      config: defaultConfig,
    }
  } catch (error) {
    console.error('❌ 应用启动失败:', error)
    throw error
  }
}

// 启动应用
createLDesignApp()
  .then(app => {
    // eslint-disable-next-line no-console
    console.log('✅ LDesign 应用启动成功!', app)
  })
  .catch(error => {
    console.error('❌ 应用启动失败:', error)
  })

export default createLDesignApp
