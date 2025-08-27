/**
 * 路由配置
 * 
 * 定义应用的路由结构，将被Engine的Router扩展使用
 */

import type { RouteRecordRaw } from '@ldesign/router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页',
      description: '应用首页，展示Engine与Router集成概览',
    },
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: {
      title: '关于',
      description: '关于Engine Router Demo应用',
    },
  },
  {
    path: '/features',
    name: 'Features',
    component: () => import('@/views/Features.vue'),
    meta: {
      title: '功能特性',
      description: '展示Engine和Router的功能特性',
    },
  },
  {
    path: '/config',
    name: 'Config',
    component: () => import('@/views/Config.vue'),
    meta: {
      title: '配置示例',
      description: '展示Engine和Router的配置选项',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面未找到',
      description: '404错误页面',
    },
  },
]
