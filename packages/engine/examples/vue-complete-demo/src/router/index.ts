/**
 * 路由配置
 * 🗺️ 定义应用的所有路由
 */

import type { RouteRecordRaw } from 'vue-router'
import Cache from '../views/Cache.vue'
import Home from '../views/Home.vue'
import Middleware from '../views/Middleware.vue'
import Notifications from '../views/Notifications.vue'
import Performance from '../views/Performance.vue'
import Plugins from '../views/Plugins.vue'
import Security from '../views/Security.vue'
import State from '../views/State.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页 - Vue3 Engine 演示',
      description: 'Vue3 Engine 核心功能展示',
    },
  },
  {
    path: '/plugins',
    name: 'Plugins',
    component: Plugins,
    meta: {
      title: '插件系统 - Vue3 Engine 演示',
      description: '展示插件系统的强大功能',
    },
  },
  {
    path: '/middleware',
    name: 'Middleware',
    component: Middleware,
    meta: {
      title: '中间件 - Vue3 Engine 演示',
      description: '展示中间件系统的灵活性',
    },
  },
  {
    path: '/state',
    name: 'State',
    component: State,
    meta: {
      title: '状态管理 - Vue3 Engine 演示',
      description: '展示状态管理系统的能力',
    },
  },
  {
    path: '/cache',
    name: 'Cache',
    component: Cache,
    meta: {
      title: '缓存系统 - Vue3 Engine 演示',
      description: '展示缓存系统的性能优化',
    },
  },
  {
    path: '/performance',
    name: 'Performance',
    component: Performance,
    meta: {
      title: '性能监控 - Vue3 Engine 演示',
      description: '展示性能监控系统的实时数据',
    },
  },
  {
    path: '/security',
    name: 'Security',
    component: Security,
    meta: {
      title: '安全防护 - Vue3 Engine 演示',
      description: '展示安全防护系统的能力',
    },
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: Notifications,
    meta: {
      title: '通知系统 - Vue3 Engine 演示',
      description: '展示通知系统的丰富功能',
    },
  },
]

export default routes
