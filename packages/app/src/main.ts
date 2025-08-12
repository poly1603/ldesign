import type { AppConfig } from './types'
import { createApp, presets } from '@ldesign/engine'
import { routerPlugin } from '@ldesign/router'
import TemplatePlugin from '@ldesign/template'
import App from './App'
import { routes } from './router/routes'

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
      routerPlugin({
        routes,
        mode: 'hash',
        base: '/',
      })
    )

    // 获取Vue应用实例并集成Template插件
    const vueApp = engine.getApp()
    if (vueApp) {
      vueApp.use(TemplatePlugin, {
        defaultDevice: 'desktop',
        autoScan: false, // 关闭自动扫描，使用内置模板
        autoDetectDevice: true,
      })
    }

    // 注入Engine到全局属性
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
