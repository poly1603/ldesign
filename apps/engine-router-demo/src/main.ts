/**
 * Engine Router Demo 应用入口
 * 
 * 演示如何使用Engine与Router集成
 */

import { createEngine } from '@ldesign/engine'
import { createRouter, createWebHistory } from '@ldesign/router'
import App from './App.vue'
import { routes } from './router'

// 创建真实的router实例
const router = createRouter({
  history: createWebHistory('/'),
  routes,
})

// 创建Engine实例
const engine = createEngine({
  config: {
    debug: true,
  } as any,
})

// 创建Vue应用
const app = engine.createApp(App)

// 安装router（会自动注册RouterLink和RouterView组件）
app.use(router)

// 挂载应用
app.mount('#app')

console.log('应用启动成功 - 使用真实的@ldesign/router实现')
