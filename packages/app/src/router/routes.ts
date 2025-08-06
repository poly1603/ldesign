import type { RouteRecordRaw } from '@ldesign/router'
import { h } from 'vue'

/**
 * 路由配置
 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    redirect: '/login'
  },

  // 登录页面
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/SimpleLoginView.vue'),
    meta: {
      title: '用户登录',
      requiresAuth: false,
      requiresWatermark: true,
      transition: 'fade',
      layout: 'auth'
    }
  },

  // 注册页面
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: {
      title: '用户注册',
      requiresAuth: false,
      requiresWatermark: true,
      transition: 'fade',
      layout: 'auth'
    }
  },

  // 忘记密码页面
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/ForgotPasswordView.vue'),
    meta: {
      title: '忘记密码',
      requiresAuth: false,
      requiresWatermark: true,
      transition: 'fade',
      layout: 'auth'
    }
  },

  // 仪表板页面（需要认证）
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: {
      title: '仪表板',
      requiresAuth: true,
      requiresWatermark: true,
      transition: 'slide',
      layout: 'main'
    }
  },

  // 用户资料页面
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: {
      title: '个人资料',
      requiresAuth: true,
      requiresWatermark: true,
      transition: 'slide',
      layout: 'main'
    }
  },

  // 设置页面
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue'),
    meta: {
      title: '系统设置',
      requiresAuth: true,
      requiresWatermark: true,
      transition: 'slide',
      layout: 'main'
    }
  },

  // 模板展示页面
  {
    path: '/templates',
    name: 'Templates',
    component: () => import('../views/TemplatesView.vue'),
    meta: {
      title: '模板展示',
      requiresAuth: false,
      requiresWatermark: false,
      transition: 'fade',
      layout: 'main'
    }
  },

  // 关于页面
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/AboutView.vue'),
    meta: {
      title: '关于我们',
      requiresAuth: false,
      requiresWatermark: false,
      transition: 'fade',
      layout: 'main'
    }
  },

  // 404页面
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: {
      title: '页面未找到',
      requiresAuth: false,
      requiresWatermark: false,
      transition: 'fade',
      layout: 'error'
    }
  },

  // 500页面
  {
    path: '/500',
    name: 'ServerError',
    component: () => import('../views/ServerErrorView.vue'),
    meta: {
      title: '服务器错误',
      requiresAuth: false,
      requiresWatermark: false,
      transition: 'fade',
      layout: 'error'
    }
  },

  // 捕获所有未匹配的路由
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

/**
 * 路由元信息类型定义
 */
export interface RouteMeta {
  title?: string
  requiresAuth?: boolean
  requiresWatermark?: boolean
  transition?: 'fade' | 'slide' | 'zoom'
  layout?: 'auth' | 'main' | 'error'
  roles?: string[]
  permissions?: string[]
}
