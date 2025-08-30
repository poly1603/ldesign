/**
 * 示例项目主入口文件
 */

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import TemplatePlugin from '@ldesign/template'
import App from './App.vue'
import routes from './router'

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 创建Vue应用实例
const app = createApp(App)

// 安装模板插件
app.use(TemplatePlugin, {
  templatesDir: 'src/templates',
  autoScan: true,
  cache: true,
  enableHMR: import.meta.env.DEV,
  enablePerformanceMonitor: import.meta.env.DEV,
  preloadStrategy: {
    enabled: true,
    mode: 'lazy',
    limit: 5,
    priority: ['default', 'modern']
  }
})

// 安装路由
app.use(router)

// 挂载应用
app.mount('#app')
