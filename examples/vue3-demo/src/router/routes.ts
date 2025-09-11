/**
 * 路由配置
 */

import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: {
      title: '首页',
      showInNav: true,
      description: '图表组件库概览和快速开始'
    }
  },
  {
    path: '/basic-charts',
    name: 'BasicCharts',
    component: () => import('../views/BasicChartsView.vue'),
    meta: {
      title: '基础图表',
      showInNav: true,
      description: '折线图、柱状图、饼图等基础图表类型'
    }
  },
  {
    path: '/advanced-charts',
    name: 'AdvancedCharts',
    component: () => import('../views/AdvancedChartsView.vue'),
    meta: {
      title: '高级图表',
      showInNav: true,
      description: '散点图、雷达图、仪表盘等高级图表类型'
    }
  },
  {
    path: '/composables',
    name: 'Composables',
    component: () => import('../views/ComposablesView.vue'),
    meta: {
      title: 'Composables',
      showInNav: true,
      description: '使用 Composition API 创建图表'
    }
  },
  {
    path: '/directives',
    name: 'Directives',
    component: () => import('../views/DirectivesView.vue'),
    meta: {
      title: '指令用法',
      showInNav: true,
      description: '使用 v-chart 指令创建图表'
    }
  },
  {
    path: '/interactive',
    name: 'Interactive',
    component: () => import('../views/InteractiveView.vue'),
    meta: {
      title: '交互功能',
      showInNav: true,
      description: '图表交互、事件处理、动态更新'
    }
  },
  {
    path: '/themes',
    name: 'Themes',
    component: () => import('../views/ThemesView.vue'),
    meta: {
      title: '主题定制',
      showInNav: true,
      description: '主题切换和自定义主题'
    }
  },
  {
    path: '/performance',
    name: 'Performance',
    component: () => import('../views/PerformanceView.vue'),
    meta: {
      title: '性能优化',
      showInNav: true,
      description: '大数据量图表和性能优化技巧'
    }
  },
  {
    path: '/export',
    name: 'Export',
    component: () => import('../views/ExportView.vue'),
    meta: {
      title: '导出功能',
      showInNav: true,
      description: '图表导出为图片、PDF、Excel 等格式'
    }
  },
  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: {
      title: '页面未找到',
      hidden: true
    }
  }
]

export default routes
