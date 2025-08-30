/**
 * 路由配置
 */

import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./pages/Home.vue'),
    meta: {
      title: '首页'
    }
  },
  {
    path: '/built-in-templates',
    name: 'BuiltInTemplates',
    component: () => import('./pages/BuiltInTemplates.vue'),
    meta: {
      title: '内置模板'
    }
  },
  {
    path: '/dynamic-loading',
    name: 'DynamicLoading',
    component: () => import('./pages/DynamicLoadingDemo.vue'),
    meta: {
      title: '动态加载演示'
    }
  },
  {
    path: '/component-demo',
    name: 'ComponentDemo',
    component: () => import('./pages/ComponentDemo.vue'),
    meta: {
      title: '组件演示'
    }
  },
  // Hook 演示页面暂缺，先移除该路由，避免 404 与编译错误
  {
    path: '/responsive-demo',
    name: 'ResponsiveDemo',
    component: () => import('./pages/ResponsiveDemo.vue'),
    meta: {
      title: '响应式演示'
    }
  },
  {
    path: '/performance-demo',
    name: 'PerformanceDemo',
    component: () => import('./pages/PerformanceDemo.vue'),
    meta: {
      title: '性能演示'
    }
  }
]

export default routes
