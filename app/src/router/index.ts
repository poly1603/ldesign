/**
 * LDesign Router 简化应用路由配置
 *
 * 只包含核心功能：
 * - 登录页面
 * - 首页/仪表板
 * - 路由守卫
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAppStore } from '../stores/app'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: '登录',
      description: '用户登录页面',
      requiresAuth: false,
      hideInMenu: true,
    },
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: '首页',
      description: '应用主页面',
      requiresAuth: true,
      keepAlive: true,
    },
  },
  {
    path: '/dashboard',
    redirect: '/home',
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: {
      title: '页面未找到',
      description: '404 错误页面',
      hideInMenu: true,
    },
  },
]

// 创建路由器实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的滚动位置，恢复它
    if (savedPosition) {
      return savedPosition
    }

    // 如果有锚点，滚动到锚点
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }

    // 否则滚动到顶部
    return { top: 0, behavior: 'smooth' }
  },
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  const appStore = useAppStore()

  // 记录导航开始时间
  const startTime = performance.now()
  appStore.setNavigationStartTime(startTime)

  // 检查认证要求
  if (to.meta?.requiresAuth && !appStore.isAuthenticated) {
    next({
      name: 'Login',
      query: { redirect: to.fullPath },
    })
    return
  }

  // 模拟异步验证
  await new Promise(resolve => setTimeout(resolve, 100))

  next()
})

// 全局后置钩子
router.afterEach((to, from) => {
  const appStore = useAppStore()

  // 记录导航结束时间
  const endTime = performance.now()
  const duration = endTime - appStore.navigationStartTime

  // 更新性能统计
  appStore.addNavigationRecord({
    from: from.fullPath,
    to: to.fullPath,
    duration,
    timestamp: Date.now(),
  })

  console.log(
    `🚀 路由导航完成: ${from.fullPath} → ${to.fullPath} (${duration.toFixed(
      2
    )}ms)`
  )
})

// 路由错误处理
router.onError(error => {
  console.error('路由错误:', error)
  const appStore = useAppStore()
  appStore.addNotification({
    type: 'error',
    title: '路由错误',
    message: error.message,
  })
})

export default router
