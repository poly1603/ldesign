import {
  createRouter,
  createWebHistory,
  type NavigationGuardNext,
  type RouteLocationNormalized,
  type RouteRecordRaw,
  type ScrollPosition,
} from '@ldesign/router'

import About from '../views/About.vue'
import Contact from '../views/Contact.vue'
// 导入页面组件
import Home from '../views/Home.vue'
import NotFound from '../views/NotFound.vue'
import Products from '../views/Products.vue'
import User from '../views/User.vue'
import Users from '../views/Users.vue'

// 定义路由
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'Home Page',
      description: 'Welcome to the home page',
    },
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: {
      title: 'About Us',
      description: 'Learn more about us',
    },
  },
  {
    path: '/users',
    name: 'Users',
    component: Users,
    meta: {
      title: 'Users List',
      requiresAuth: true,
    },
  },
  {
    path: '/user/:id',
    name: 'User',
    component: User,
    meta: {
      title: 'User Profile',
      requiresAuth: true,
    },
    props: true,
  },
  {
    path: '/products',
    name: 'Products',
    component: Products,
    meta: {
      title: 'Products',
    },
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact,
    meta: {
      title: 'Contact Us',
    },
  },
  {
    path: '/redirect-test',
    redirect: '/about',
  },
  {
    path: '/alias-test',
    alias: '/test',
    component: About,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: 'Page Not Found',
    },
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    savedPosition: ScrollPosition | null
  ) {
    // 如果有保存的位置（浏览器前进/后退）
    if (savedPosition) {
      return savedPosition
    }
    // 如果有锚点
    if (to.hash) {
      return {
        left: 0,
        top: 0,
      }
    }
    // 默认滚动到顶部
    return { top: 0, left: 0 }
  },
})

// 全局前置守卫
router.beforeEach(
  (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    console.log('Navigation from', from.fullPath, 'to', to.fullPath)

    // 模拟身份验证检查
    if (to.meta.requiresAuth) {
      // 这里可以检查用户是否已登录
      const isAuthenticated = true // 模拟已登录状态

      if (!isAuthenticated) {
        console.log('Access denied: authentication required')
        next('/') // 重定向到首页
        return
      }
    }

    // 设置页面标题
    if (to.meta.title) {
      document.title = `${to.meta.title} - LDesign Router Example`
    }

    next()
  }
)

// 全局解析守卫
router.beforeResolve(
  (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    console.log('Before resolve:', to.fullPath)
    next()
  }
)

// 全局后置钩子
router.afterEach(
  (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    failure?: any | void
  ) => {
    if (failure) {
      console.error('Navigation failed:', failure)
    } else {
      console.log('Navigation completed:', to.fullPath)
    }
  }
)

export default router
