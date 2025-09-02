/**
 * 路由配置文件
 * 配置应用的路由规则，包括传统组件路由和模板路由
 */

import type { RouteRecordRaw } from '@ldesign/router'
import Home from '../pages/Home.vue'
import ThemeDemo from '../pages/ThemeDemo.vue'

/**
 * 路由配置
 * 使用 @ldesign/router 的类型定义
 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      title: '首页',
      description: 'LDesign Demo 首页展示',
      // 路由级别的缓存配置
      cache: true,
      // 预加载配置
      preload: true,
    },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../pages/Login.vue'),
    meta: {
      title: '登录',
      description: '用户登录页面',
      // 登录页不需要缓存
      cache: false,
      // 预加载配置
      preload: true,
      // 页面切换动画
      animation: 'slide',
    },
  },
  {
    path: '/i18n-demo',
    name: 'i18nDemo',
    component: () => import('../views/I18nDemo.vue'),
    meta: {
      title: 'I18n 功能演示',
      description: '展示 @ldesign/i18n 的所有 Vue 组件和功能',
      // 演示页面需要缓存
      cache: true,
      // 预加载配置
      preload: true,
      // 页面切换动画
      animation: 'fade',
    },
  },
]
