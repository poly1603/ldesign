import type { RouteRecordRaw } from '@ldesign/router'

/**
 * 简化的路由配置
 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home/index.tsx'),
    meta: {
      title: '首页',
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login'),
    meta: {
      title: '登录',
    },
  },
]
