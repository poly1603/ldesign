/**
 * Vue3 Engine 演示项目主入口
 * 🚀 展示引擎的所有核心功能
 */

import { createEngine, presets } from '@ldesign/engine'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App'
import routes from './router'

// 创建Vue应用
const app = createApp(App)

// 创建Pinia状态管理
const pinia = createPinia()
app.use(pinia)

// 创建Vue Router
const router = createRouter({
  history: createWebHistory(),
  routes,
})
app.use(router)

// 创建引擎实例（使用开发环境预设）
const engine = createEngine(presets.development())

// 将引擎挂载到Vue应用
app.use(engine)

// 挂载应用
app.mount('#app')

// 导出引擎实例供其他模块使用
export { engine }
