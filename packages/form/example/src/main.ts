import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
// 导入路由配置
import { routes } from './router'

import './style.css'

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 创建应用实例
const app = createApp(App)

// 使用路由
app.use(router)

// 挂载应用
app.mount('#app')
