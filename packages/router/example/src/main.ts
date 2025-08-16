import { createRouter, createWebHistory } from '@ldesign/router'
import { createApp } from 'vue'
import App from './App.vue'
import { routes } from './router/routes'

// 导入样式
import './styles/main.less'

// 创建路由器实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: 'router-link-active',
  linkExactActiveClass: 'router-link-exact-active',
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    else {
      return { top: 0, left: 0 }
    }
  },
})

// 添加路由守卫
router.beforeEach((to, from, next) => {
  // 更新页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - Router Test App`
  }
  else {
    document.title = 'Router Test App'
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      // 重定向到登录页面
      next('/login')
      return
    }
  }

  // 特殊处理 admin 路由
  if (to.path === '/admin') {
    const token = localStorage.getItem('token')
    if (!token) {
      next('/login')
      return
    }
  }

  next()
})

const app = createApp(App)

// 安装路由器
app.use(router)

app.mount('#app')
