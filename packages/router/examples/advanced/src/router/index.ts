import type { RouteRecordRaw } from '@ldesign/router'
import { createRouter, createWebHistory } from '@ldesign/router'
import { useUserStore } from '../stores/user'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: '首页',
      transition: 'fade',
    },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: {
      title: '仪表板',
      requiresAuth: true,
      transition: 'slide',
    },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: '登录',
      hideForAuth: true,
    },
  },
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin'],
    },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('../views/admin/Dashboard.vue'),
        meta: {
          title: '管理仪表板',
        },
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('../views/admin/Users.vue'),
        meta: {
          title: '用户管理',
        },
      },
      {
        path: 'settings',
        name: 'admin-settings',
        component: () => import('../views/admin/Settings.vue'),
        meta: {
          title: '系统设置',
        },
      },
    ],
  },
  {
    path: '/user',
    component: () => import('../layouts/UserLayout.vue'),
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: 'profile',
        name: 'user-profile',
        component: () => import('../views/user/Profile.vue'),
        meta: {
          title: '个人资料',
        },
      },
      {
        path: 'settings',
        name: 'user-settings',
        component: () => import('../views/user/Settings.vue'),
        meta: {
          title: '用户设置',
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFound.vue'),
    meta: {
      title: '页面未找到',
    },
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 全局前置守卫
router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()

  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 高级示例`
  }

  // 检查是否需要认证
  if (to.meta?.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
    return
  }

  // 检查角色权限
  if (to.meta?.roles && userStore.user) {
    const hasRole = to.meta.roles.some((role: string) =>
      userStore.user?.roles?.includes(role),
    )
    if (!hasRole) {
      next('/')
      return
    }
  }

  // 已登录用户访问登录页面时重定向到首页
  if (to.meta?.hideForAuth && userStore.isAuthenticated) {
    next('/')
    return
  }

  next()
})

// 全局后置钩子
router.afterEach((_to, _from) => {
  // 记录页面访问
  // console.log(`访问页面: ${to.path}`)
})

export default router
