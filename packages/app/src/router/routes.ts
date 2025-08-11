import type { RouteRecordRaw } from '@ldesign/router'
import Login from '../views/Login.tsx'

/**
 * 路由配置 - 展示增强功能
 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.tsx'),
    meta: {
      title: '首页',
      icon: 'icon-home',
      transition: 'fade',
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
      icon: 'icon-user',
      transition: 'slide',
    },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.tsx'),
    meta: {
      title: '仪表板',
      icon: 'icon-dashboard',
      requiresAuth: true,
      transition: 'scale',
    },
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('../views/Products.tsx'),
    meta: {
      title: '产品管理',
      icon: 'icon-grid',
      requiresAuth: true,
      permission: 'products.view',
      transition: 'slide-up',
    },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.tsx'),
    meta: {
      title: '设置',
      icon: 'icon-settings',
      requiresAuth: true,
      permission: ['admin', 'settings'],
      transition: 'fade',
    },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.tsx'),
    meta: {
      title: '个人资料',
      icon: 'icon-user',
      requiresAuth: true,
      transition: 'scale',
    },
  },
  {
    path: '/help',
    name: 'Help',
    component: () => import('../views/Help.tsx'),
    meta: {
      title: '帮助中心',
      icon: 'icon-help',
      transition: 'fade',
    },
  },
]
