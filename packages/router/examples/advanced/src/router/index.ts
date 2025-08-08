import type { RouteRecordRaw } from '@ldesign/router'
import { createRouter, createWebHistory } from '@ldesign/router'
import { useUserStore } from '../stores/user'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页',
      icon: '🏠',
      requiresAuth: false,
      cache: true,
      preload: 'immediate',
      transition: {
        name: 'fade',
        mode: 'out-in',
      },
    },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      title: '仪表盘',
      icon: '📊',
      requiresAuth: true,
      cache: true,
      preload: 'visible',
      breadcrumb: true,
    },
    children: [
      {
        path: '',
        name: 'DashboardOverview',
        component: () => import('@/views/dashboard/Overview.vue'),
        meta: {
          title: '概览',
          icon: '📈',
        },
      },
      {
        path: 'analytics',
        name: 'DashboardAnalytics',
        component: () => import('@/views/dashboard/Analytics.vue'),
        meta: {
          title: '分析',
          icon: '📊',
          permissions: ['analytics:read'],
        },
      },
      {
        path: 'reports',
        name: 'DashboardReports',
        component: () => import('@/views/dashboard/Reports.vue'),
        meta: {
          title: '报告',
          icon: '📋',
          permissions: ['reports:read'],
        },
      },
    ],
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/views/Products.vue'),
    meta: {
      title: '产品',
      icon: '📦',
      cache: true,
      preload: 'hover',
    },
    children: [
      {
        path: ':id',
        name: 'ProductDetail',
        component: () => import('@/views/ProductDetail.vue'),
        meta: {
          title: '产品详情',
          transition: {
            name: 'slide',
            mode: 'out-in',
          },
        },
        props: true,
      },
    ],
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/views/Users.vue'),
    meta: {
      title: '用户管理',
      icon: '👥',
      requiresAuth: true,
      permissions: ['users:read'],
      cache: false,
    },
    children: [
      {
        path: ':id',
        name: 'UserProfile',
        component: () => import('@/views/UserProfile.vue'),
        meta: {
          title: '用户资料',
          transition: {
            name: 'scale',
            mode: 'out-in',
          },
        },
        props: true,
      },
    ],
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: {
      title: '设置',
      icon: '⚙️',
      requiresAuth: true,
      layout: 'sidebar',
    },
    children: [
      {
        path: 'profile',
        name: 'SettingsProfile',
        component: () => import('@/views/settings/Profile.vue'),
        meta: {
          title: '个人资料',
          icon: '👤',
        },
      },
      {
        path: 'security',
        name: 'SettingsSecurity',
        component: () => import('@/views/settings/Security.vue'),
        meta: {
          title: '安全设置',
          icon: '🔒',
        },
      },
      {
        path: 'notifications',
        name: 'SettingsNotifications',
        component: () => import('@/views/settings/Notifications.vue'),
        meta: {
          title: '通知设置',
          icon: '🔔',
        },
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录',
      layout: 'auth',
      requiresAuth: false,
      transition: {
        name: 'fade',
        mode: 'out-in',
      },
    },
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: {
      title: '关于',
      icon: 'ℹ️',
      cache: true,
    },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面未找到',
      layout: 'minimal',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

// 创建路由器实例
const router = createRouter({
  history: createWebHistory('/'),
  routes,
  // 启用高级功能
  preloadStrategy: 'visible',
  performance: true,
  cache: {
    max: 20,
    ttl: 10 * 60 * 1000, // 10分钟
    include: ['Home', 'Products', 'About'],
    exclude: ['Login', 'Settings'],
  },
  transition: {
    name: 'route',
    mode: 'out-in',
    appear: true,
    duration: 300,
  },
})

// 全局前置守卫
router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - LDesign Router 高级示例`
  }

  // 权限检查
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // 权限验证
  if (to.meta.permissions && Array.isArray(to.meta.permissions)) {
    const hasPermission = to.meta.permissions.every(permission =>
      userStore.hasPermission(permission)
    )

    if (!hasPermission) {
      console.warn('权限不足，无法访问该页面')
      next({ name: 'Dashboard' })
      return
    }
  }

  next()
})

// 全局后置钩子
router.afterEach((to, from, failure) => {
  if (failure) {
    console.error('路由导航失败:', failure)
    return
  }

  // 埋点统计
  if (to.meta.analytics?.track !== false) {
    console.log('页面访问统计:', {
      page: to.name,
      path: to.path,
      from: from.name,
      timestamp: new Date().toISOString(),
    })
  }

  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

// 错误处理
router.onError((error, to, from) => {
  console.error('路由错误:', error)
  console.error('目标路由:', to)
  console.error('来源路由:', from)

  // 可以在这里添加错误上报逻辑
})

export default router
