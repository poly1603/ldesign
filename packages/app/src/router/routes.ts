import type { RouteRecordRaw } from '@ldesign/router'

/**
 * 简化的路由配置 - 只保留基本路由
 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.tsx'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.tsx'),
  },
]
