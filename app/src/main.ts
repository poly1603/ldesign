/**
 * LDesign Router 演示应用入口文件
 *
 * 这个应用展示了 @ldesign/router 的各种功能：
 * - 基础路由功能
 * - 动态路由匹配
 * - 嵌套路由
 * - 路由守卫
 * - 性能监控
 * - 内存管理
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 导入样式
import './assets/styles/main.less'

// 创建应用实例
const app = createApp(App)

// 安装插件
app.use(createPinia())
app.use(router)

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('应用错误:', err)
  console.error('错误信息:', info)
  console.error('组件实例:', vm)
}

// 全局警告处理
app.config.warnHandler = (msg, vm, trace) => {
  console.warn('应用警告:', msg)
  console.warn('组件实例:', vm)
  console.warn('组件追踪:', trace)
}

// 性能监控
if (import.meta.env.DEV) {
  app.config.performance = true
}

// 挂载应用
app.mount('#app')

// 开发环境下的调试信息
if (import.meta.env.DEV) {
  console.log('🚀 LDesign Router 演示应用已启动')
  console.log('📦 当前环境:', import.meta.env.MODE)
  console.log('🔗 路由器实例:', router)
  console.log('📊 性能监控已启用')
}

// 导出应用实例供调试使用
if (import.meta.env.DEV) {
  ;(window as any).__VUE_APP__ = app(window as any).__VUE_ROUTER__ = router
}
