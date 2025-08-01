import { createApp, presets } from '@ldesign/engine'
import App from './App.vue'
import './style.css'

// 使用引擎创建Vue应用（简化API）
const engine = createApp(App, {
  ...presets.development(),
  config: {
    debug: true,
    appName: 'Vue3 Engine Example',
    version: '1.0.0',
  },
})

// 获取Vue应用实例并提供engine
const app = engine.getApp()
if (app) {
  app.provide('engine', engine)
}

// 挂载应用
engine.mount('#app')

// 全局暴露引擎实例（用于调试）
if (import.meta.env.DEV) {
  ;(window as any).engine = engine
}

// 监听引擎事件
engine.events.on('engine:mounted', () => {
  console.log('🚀 Engine mounted successfully!')
})

engine.events.on('engine:error', (error: any) => {
  console.error('❌ Engine error:', error)
})
