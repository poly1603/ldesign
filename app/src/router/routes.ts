/**
 * 路由配置文件
 * 配置应用的路由规则，包括传统组件路由和模板路由
 */

import type { RouteRecordRaw } from '@ldesign/router'
import Home from '../pages/Home.vue'

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
    path: '/theme-demo',
    name: 'theme-demo',
    component: Home, // 重定向到首页，因为首页已经有主题演示功能
    meta: {
      title: '主题演示',
      description: '主题切换演示页面',
      cache: true,
      preload: true,
    },
  },
  {
    path: '/color-scales',
    name: 'color-scales',
    component: () => import('../pages/ColorScales.vue'),
    meta: {
      title: '色阶展示',
      description: '@ldesign/color 10级色阶展示页面',
      cache: true,
      preload: true,
      animation: 'fade',
    },
  },

  {
    path: '/http-demo',
    name: 'http-demo',
    component: () => import('../pages/HttpDemo.vue'),
    meta: {
      title: 'HTTP 演示',
      description: '@ldesign/http 包功能演示页面',
      cache: true,
      preload: true,
      animation: 'fade',
    },
  },
  {
    path: '/http-test',
    name: 'http-test',
    component: () => import('../http/test-page.vue'),
    meta: {
      title: 'HTTP 插件重构测试',
      description: '验证重构后的 HTTP 插件功能',
      cache: false,
      preload: false,
      animation: 'slide',
    },
  },
  {
    path: '/store-test',
    name: 'store-test',
    component: () => import('../store/test-page.vue'),
    meta: {
      title: 'Store 状态管理测试',
      description: '验证 @ldesign/store 包的功能和集成效果',
      cache: false,
      preload: false,
      animation: 'slide',
    },
  },
  {
    path: '/crypto-demo',
    name: 'crypto-demo',
    component: () => import('../pages/CryptoDemo.vue'),
    meta: {
      title: 'Crypto 加密演示',
      description: '验证 @ldesign/crypto 包的功能和集成效果',
      cache: true,
      preload: true,
      animation: 'fade',
    },
  },
  {
    path: '/cache-demo',
    name: 'cache-demo',
    component: () => import('../pages/CacheDemo.vue'),
    meta: {
      title: 'Cache 缓存演示',
      description: '验证 @ldesign/cache 包的功能和集成效果',
      cache: true,
      preload: true,
      animation: 'fade',
    },
  },

]
