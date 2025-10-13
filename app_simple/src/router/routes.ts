/**
 * 路由配置
 * 集中管理所有路由定义
 */

import type { RouteRecordRaw } from '@ldesign/router'

// 路由懒加载
const Home = () => import('@/views/Home.vue')
const Login = () => import('@/views/Login.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const About = () => import('@/views/About.vue')

/**
 * 公开路由
 * 不需要认证即可访问
 */
export const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      title: '首页',
      requiresAuth: false,
      layout: 'default'
    }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      title: '登录',
      requiresAuth: false,
      layout: 'auth' // 使用认证布局
    }
  },
  {
    path: '/about',
    name: 'about',
    component: About,
    meta: {
      title: '关于',
      requiresAuth: false,
      layout: 'default'
    }
  },
]

/**
 * 认证路由
 * 需要登录后才能访问
 */
export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: {
      title: '仪表盘',
      requiresAuth: false,  // 暂时禁用认证要求以便测试
      layout: 'default',
      roles: ['user', 'admin'] // 角色权限
    }
  }
]

/**
 * 错误页面路由
 */
export const errorRoutes: RouteRecordRaw[] = [
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/errors/NotFound.vue'),
    meta: {
      title: '404 - 页面未找到',
      layout: 'blank'
    }
  }
]

/**
 * 所有路由
 */
export const routes: RouteRecordRaw[] = [
  ...publicRoutes,
  ...authRoutes,
  ...errorRoutes
]

export default routes