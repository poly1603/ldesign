import type { RouteRecordRaw } from '@ldesign/router'

/**
 * 应用路由配置
 *
 * 使用 @ldesign/router 的路由格式
 */
export const routes: RouteRecordRaw[] = [
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
    path: '/i18n',
    name: 'I18nDemo',
    component: () => import('../views/I18nDemo.vue'),
    meta: {
      title: '国际化演示',
      description: 'I18n 功能演示页面',
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
