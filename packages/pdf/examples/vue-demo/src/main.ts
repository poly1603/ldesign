/**
 * Vue 3 + Vite PDF示例项目
 * 展示@ldesign/pdf包的所有功能特性 🚀
 */

import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

// 创建Vue应用实例
const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue应用错误:', err)
  console.error('错误信息:', info)
  console.error('组件实例:', vm)
}

// 全局警告处理
app.config.warnHandler = (msg, vm, trace) => {
  console.warn('Vue警告:', msg)
  console.warn('组件实例:', vm)
  console.warn('追踪信息:', trace)
}

// 挂载应用
app.mount('#app')