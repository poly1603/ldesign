/**
 * 路由配置
 */

import type { RouteRecordRaw } from 'vue-router'

// 懒加载组件
const Home = () => import('../views/Home.vue')
const Features = () => import('../views/Features.vue')
const Examples = () => import('../views/Examples.vue')
const Performance = () => import('../views/Performance.vue')
const Plugins = () => import('../views/Plugins.vue')
const SSR = () => import('../views/SSR.vue')
const Docs = () => import('../views/Docs.vue')

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'nav.home',
      description: 'pages.home.description',
    },
  },
  {
    path: '/features',
    name: 'Features',
    component: Features,
    meta: {
      title: 'nav.features',
      description: 'pages.features.description',
    },
  },
  {
    path: '/examples',
    name: 'Examples',
    component: Examples,
    meta: {
      title: 'nav.examples',
      description: 'pages.examples.description',
    },
  },
  {
    path: '/performance',
    name: 'Performance',
    component: Performance,
    meta: {
      title: 'nav.performance',
      description: 'pages.performance.description',
    },
  },
  {
    path: '/plugins',
    name: 'Plugins',
    component: Plugins,
    meta: {
      title: 'nav.plugins',
      description: 'pages.plugins.description',
    },
  },
  {
    path: '/ssr',
    name: 'SSR',
    component: SSR,
    meta: {
      title: 'nav.ssr',
      description: 'pages.ssr.description',
    },
  },
  {
    path: '/docs',
    name: 'Docs',
    component: Docs,
    meta: {
      title: 'nav.docs',
      description: 'pages.docs.description',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: {
      title: 'pages.notFound.title',
      description: 'pages.notFound.description',
    },
  },
]
