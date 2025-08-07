/**
 * LDesign 综合应用示例
 *
 * 这个应用展示了如何集成和使用 LDesign 的所有模块：
 * - @ldesign/engine - 核心引擎系统
 * - @ldesign/color - 主题色彩管理
 * - @ldesign/crypto - 加密解密功能
 * - @ldesign/device - 设备检测适配
 * - @ldesign/http - HTTP 请求管理
 * - @ldesign/i18n - 国际化多语言
 * - @ldesign/router - 路由导航系统
 * - @ldesign/store - 状态管理系统
 * - @ldesign/template - 模板渲染系统
 */

import { createLDesignApp } from './core/createLDesignApp'
import App from './App.vue'

// 导入样式
import './styles/index.less'

// 使用统一的 LDesign 应用创建器
const app = createLDesignApp(App, {
  appName: 'LDesign 综合应用示例',
  version: '1.0.0',
  description: '展示 LDesign 所有模块集成使用的综合应用示例',
  debug: true,
  modules: {
    engine: true,
    color: true,
    crypto: true,
    device: true,
    http: true,
    i18n: true,
    router: false,
    store: true,
    template: true
  },
  moduleConfig: {
    color: {
      defaultTheme: 'default',
      defaultMode: 'light',
      autoDetect: true
    },
    crypto: {
      defaultAlgorithm: 'aes',
      keySize: 256
    },
    device: {
      enableBattery: true,
      enableGeolocation: true,
      enableNetwork: true
    },
    http: {
      baseURL: 'https://jsonplaceholder.typicode.com',
      timeout: 10000
    },
    i18n: {
      defaultLocale: 'zh-CN',
      fallbackLocale: 'en-US'
    },
    router: {
      mode: 'history',
      base: '/',
      routes: []
    },
    store: {
      enableDevtools: true,
      enablePersist: true
    },
    template: {
      enableLazyLoading: true,
      enablePerformanceMonitor: true,
      defaultTemplate: 'default'
    }
  },
  onModuleIntegrated: (moduleName: string) => {
    console.log(`✅ 模块已集成: ${moduleName}`)
  },
  onError: (moduleName: string, error: Error) => {
    console.error(`❌ 模块集成失败: ${moduleName}`, error)
  }
})

// 挂载应用
app.mount('#app')

// 全局暴露应用实例（用于调试）
if (import.meta.env.DEV) {
  ; (window as any).app = app
    ; (window as any).engine = app.engine
    ; (window as any).__LDESIGN_APP__ = app
}

// 监听引擎事件
app.engine.events.on('engine:mounted', () => {
  console.log('🚀 LDesign 综合应用已启动！')
  console.log('📦 模块状态:', app.getModuleStatus())
})

app.engine.events.on('engine:error', (error: any) => {
  console.error('❌ Engine error:', error)
})
