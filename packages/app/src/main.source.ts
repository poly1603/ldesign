/**
 * Source 模式专用入口文件
 * 使用相对路径导入，避免 Vite 别名解析问题
 */

import { createCache } from '@ldesign/cache'
import { createDeviceEnginePlugin } from '@ldesign/device'
import { createEngine } from '@ldesign/engine'
// import { createStore } from '@ldesign/store'
import { createHttpEnginePlugin } from '@ldesign/http'
import { createI18nEnginePlugin } from '@ldesign/i18n'
import { createRouterEnginePlugin } from '@ldesign/router'
import { createTemplateEnginePlugin } from '@ldesign/template'
import { createApp } from 'vue'
// 使用相对路径导入 Vue 适配器
import { ThemePlugin } from '../../color/src/adapt/vue/index'
import { CryptoPlugin } from '../../crypto/src/adapt/vue/index'
import { VueSizePlugin } from '../../size/src/vue/index'

import App from './App.tsx'
import { createCustomI18n } from './i18n'
import { routes } from './router/routes'

import './styles/index.less'

console.log('🚀 启动 LDesign Engine 应用...')

async function bootstrap() {
  try {
    // 创建引擎实例
    const engine = createEngine({
      name: 'LDesign Demo App',
      version: '1.0.0',
      debug: true,
    })

    // 注册路由插件
    engine.use(
      createRouterEnginePlugin({
        routes,
        version: '1.0.0',
        mode: 'hash',
        base: '/',
      })
    )

    // 注册国际化插件
    engine.use(
      createI18nEnginePlugin({
        version: '1.0.0',
        createI18n: createCustomI18n,
        globalInjection: true,
        globalPropertyName: '$t',
      })
    )

    // 注册模板插件
    engine.use(
      createTemplateEnginePlugin({
        version: '1.0.0',
        enableCache: true,
        cacheExpiration: 5 * 60 * 1000, // 5分钟
        autoDetectDevice: true,
        debug: true,
      })
    )

    // 注册HTTP插件
    engine.use(
      createHttpEnginePlugin({
        version: '1.0.0',
        baseURL: 'https://api.example.com',
        timeout: 10000,
      })
    )

    // 注册设备检测插件
    engine.use(
      createDeviceEnginePlugin({
        version: '1.0.0',
        enableBreakpointDetection: true,
        enableOrientationDetection: true,
        enableTouchDetection: true,
      })
    )

    // 创建 Vue 应用
    const vueApp = createApp(App)

    // 安装引擎到 Vue 应用
    await engine.install(vueApp)

    // 手动注册其他插件
    if (vueApp && vueApp.config) {
      // 确保 vueApp 和 config 存在
      vueApp.config.globalProperties.$engine = engine

      // 安装颜色主题插件
      vueApp.use(ThemePlugin, {
        defaultTheme: 'default',
        autoDetect: true,
        idleProcessing: true,
      })

      // 安装尺寸插件
      vueApp.use(VueSizePlugin, {
        defaultMode: 'medium',
        autoDetect: true,
      })

      // 安装加密插件
      vueApp.use(CryptoPlugin)

      // 创建并安装缓存
      const cache = createCache({
        maxSize: 100,
        ttl: 5 * 60 * 1000, // 5分钟
      })
      vueApp.provide('cache', cache)

      // 创建并安装状态管理
      // const store = createStore()
      // vueApp.use(store)
    }

    // 挂载应用
    await engine.mount('#app')

    console.log('✅ LDesign 应用启动成功!')
  } catch (error) {
    console.error('❌ 应用启动失败:', error)
  }
}

// 启动应用
bootstrap()
