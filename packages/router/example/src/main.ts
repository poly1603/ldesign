import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from '@ldesign/router'
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
    } else {
      return { top: 0, left: 0 }
    }
  },
})

const app = createApp(App)

// 安装路由器
app.use(router)

app.mount('#app')
