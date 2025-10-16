/**
 * 路由配置
 * 集中管理所有路由定义
 */

import type { RouteRecordRaw } from '@ldesign/router'

// 路由懒加载
const Main = () => import('@/views/Main.vue')
const Home = () => import('@/views/Home.vue')
const Login = () => import('@/views/Login.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const About = () => import('@/views/About.vue')
const TemplateDemo = () => import('@/pages/TemplateDemo.vue')

/**
 * 公开路由
 * 不需要认证即可访问
 */
export const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: Main,
    meta: {
      titleKey: 'nav.home',
      requiresAuth: false,
      layout: 'default'
    },
    children: [
      {
        path: '',
        name: 'Home',
        component: Home,
        meta: {
          titleKey: 'nav.home',
          requiresAuth: false,
          layout: 'default'
        }
      },
      {
        path: 'about',
        name: 'About',
        component: About,
        meta: {
          titleKey: 'nav.about',
          requiresAuth: false,
          layout: 'default'
        }
      },
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: Login, // 使用原始登录页
    meta: {
      titleKey: 'nav.login',
      requiresAuth: false,
      layout: 'blank'  // 登录页面使用全屏布局，不显示导航栏和页脚
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
      titleKey: 'nav.dashboard',
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
      titleKey: 'errors.404.title',
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