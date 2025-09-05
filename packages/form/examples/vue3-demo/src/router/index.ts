import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/HomePage.vue'),
    meta: {
      title: '首页'
    }
  },
  {
    path: '/basic',
    name: 'BasicForm',
    component: () => import('@/pages/BasicFormPage.vue'),
    meta: {
      title: '基础表单'
    }
  },
  {
    path: '/query',
    name: 'QueryForm',
    component: () => import('@/pages/QueryFormPage.vue'),
    meta: {
      title: '查询表单'
    }
  },
  {
    path: '/complex',
    name: 'ComplexForm',
    component: () => import('@/pages/ComplexFormPage.vue'),
    meta: {
      title: '复杂表单'
    }
  },
  {
    path: '/hooks',
    name: 'HooksUsage',
    component: () => import('@/pages/HooksUsagePage.vue'),
    meta: {
      title: 'Hooks 用法'
    }
  },
  {
    path: '/custom',
    name: 'CustomComponents',
    component: () => import('@/pages/CustomComponentsPage.vue'),
    meta: {
      title: '自定义组件'
    }
  }
]

export default routes
