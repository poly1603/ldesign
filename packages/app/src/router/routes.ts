import type { RouteRecordRaw } from '@ldesign/router'

/**
 * 路由配置
 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login'),
    meta: {
      title: '登录',
      icon: 'icon-user',
      transition: 'fade',
    },
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home/index.tsx'),
    meta: {
      title: '首页',
      icon: 'icon-home',
      transition: 'slide',
    },
  },
]
