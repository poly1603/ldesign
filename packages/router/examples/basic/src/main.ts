import { createRouter, createWebHistory } from '@ldesign/router'
import { createApp } from 'vue'
import App from './App.vue'
import { useUserStore } from './stores/user'

// 创建路由配置
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/Home.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('./views/About.vue'),
  },
  {
    path: '/user/:id',
    name: 'user',
    component: () => import('./views/User.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('./views/Login.vue'),
  },
  {
    path: '/protected',
    name: 'protected',
    component: () => import('./views/Protected.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/error-demo',
    name: 'error-demo',
    component: () => import('./views/ErrorDemo.vue'),
  },
  {
    path: '/device-demo',
    name: 'device-demo',
    component: () => import('./views/DeviceDemo.vue'),
  },
  {
    path: '/plugin-demo',
    name: 'plugin-demo',
    component: () => import('./views/PluginDemo.vue'),
  },
  {
    path: '/history-demo',
    name: 'history-demo',
    component: () => import('./views/HistoryDemo.vue'),
  },
  {
    path: '/nested-demo',
    name: 'nested-demo',
    component: () => import('./views/NestedDemo.vue'),
  },
  // 嵌套路由演示的子路由
  {
    path: '/nested/user',
    name: 'nested-user',
    component: () => import('./views/nested/UserModule.vue'),
    children: [
      {
        path: '',
        redirect: '/nested/user/profile',
      },
      {
        path: 'profile',
        name: 'nested-user-profile',
        component: () => import('./views/nested/UserProfile.vue'),
      },
      {
        path: 'settings',
        name: 'nested-user-settings',
        component: () => import('./views/nested/UserSettings.vue'),
      },
      {
        path: 'dashboard',
        name: 'nested-user-dashboard',
        component: () => import('./views/nested/UserDashboard.vue'),
      },
    ],
  },
  {
    path: '/nested/shop',
    name: 'nested-shop',
    component: () => import('./views/nested/ShopModule.vue'),
    children: [
      {
        path: '',
        redirect: '/nested/shop/products',
      },
      {
        path: 'products',
        name: 'nested-shop-products',
        component: () => import('./views/nested/ShopProducts.vue'),
      },
      {
        path: 'cart',
        name: 'nested-shop-cart',
        component: () => import('./views/nested/ShopCart.vue'),
      },
      {
        path: 'checkout',
        name: 'nested-shop-checkout',
        component: () => import('./views/nested/ShopCheckout.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('./views/NotFound.vue'),
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 全局前置守卫
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()

  // 检查路由是否需要认证
  if (to.meta?.requiresAuth) {
    if (!userStore.isLoggedIn.value) {
      // 未登录，重定向到登录页面
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
      return
    }
  }

  // 如果已经登录且访问登录页面，重定向到首页
  if (to.path === '/login' && userStore.isLoggedIn.value) {
    next('/')
    return
  }

  next()
})

// 全局后置钩子
router.afterEach((to, _from) => {
  // 更新页面标题
  document.title = `${to.meta?.title || String(to.name) || '页面'} - @ldesign/router 示例`

  // 记录路由跳转（演示用）
  // console.log(`路由跳转: ${from.path} -> ${to.path}`)
})

// 创建应用实例
const app = createApp(App)

// 使用路由
app.use(router)

// 挂载应用
app.mount('#app')
