import { createEngine } from '@ldesign/engine'
import { createApp } from 'vue'
import App from './App.vue'
import './styles/global.less'

// 创建 LDesign Engine 实例
const engine = createEngine({
  config: {
    app: {
      name: 'LDesign Engine 综合演示',
      version: '1.0.0',
      description: '展示 LDesign Engine 所有功能的综合示例应用',
    },
    environment: 'development',
    debug: true,
    features: {
      enableHotReload: true,
      enableDevTools: true,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      enableSecurityProtection: true,
      enableCaching: true,
      enableNotifications: true,
    },
    demo: {
      enableAllFeatures: true,
      showDebugInfo: true,
    },
  },
  enableAutoSave: true,
  autoSaveInterval: 10000,
})

// 创建 Vue 应用
const app = createApp(App)

// 将引擎实例注入到 Vue 应用中
app.provide('engine', engine)
app.config.globalProperties.$engine = engine

// 暴露引擎实例到全局（用于调试）
if (typeof window !== 'undefined') {
  ; (window as any).__LDESIGN_ENGINE__ = engine
    ; (window as any).engine = engine
}

// 挂载应用
app.mount('#app')

// 记录引擎启动
engine.logger.info('LDesign Engine 综合演示应用已启动')
engine.events.emit('app:mounted', { timestamp: Date.now() })
