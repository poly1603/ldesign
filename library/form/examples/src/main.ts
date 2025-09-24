/**
 * @ldesign/form 示例应用入口
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import routes from './routes'

// 导入样式
import './styles/index.less'

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 创建应用实例
const app = createApp(App)

// 使用路由
app.use(router)

// 挂载应用
app.mount('#app')
