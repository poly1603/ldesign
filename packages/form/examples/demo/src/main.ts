/**
 * @ldesign/form 演示项目主入口
 * 
 * @description
 * 统一演示项目，展示原生JavaScript、Web Components、Vue组件三种实现方式
 * 
 * @author LDESIGN Team
 * @version 1.0.0
 */

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

// 导入路由配置
import { routes } from './router'

// 导入一致性检查工具
import { setupConsistencyChecker } from './utils/consistencyReport'

console.log('@ldesign/form 演示项目已启动')

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - @ldesign/form 演示项目`
  } else {
    document.title = '@ldesign/form 演示项目'
  }
  next()
})

// 创建Vue应用实例
const app = createApp(App)

// 使用路由
app.use(router)

// 挂载应用
app.mount('#app')

// 开发环境下的调试信息
if (import.meta.env.DEV) {
  console.log('开发模式已启用')
  console.log('可用路由:', routes.map(route => route.path))

  // 设置一致性检查工具
  setupConsistencyChecker()
}
