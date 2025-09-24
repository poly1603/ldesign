/**
 * 路由配置
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./views/Home.vue'),
    meta: {
      title: '首页'
    }
  },
  {
    path: '/basic',
    name: 'Basic',
    component: () => import('./views/BasicForm.vue'),
    meta: {
      title: '基础表单'
    }
  },
  {
    path: '/validation',
    name: 'Validation',
    component: () => import('./views/ValidationExample.vue'),
    meta: {
      title: '验证示例'
    }
  },
  {
    path: '/advanced',
    name: 'Advanced',
    component: () => import('./views/AdvancedForm.vue'),
    meta: {
      title: '高级功能'
    }
  },
  {
    path: '/adapter',
    name: 'Adapter',
    component: () => import('./views/AdapterExample.vue'),
    meta: {
      title: '适配器示例'
    }
  },
  {
    path: '/horizontal-layout',
    name: 'HorizontalLayout',
    component: () => import('./views/HorizontalLayoutExample.vue'),
    meta: {
      title: '水平布局示例'
    }
  },
  {
    path: '/collapsible',
    name: 'Collapsible',
    component: () => import('./views/CollapsibleExample.vue'),
    meta: {
      title: '展开/收起示例'
    }
  },
  {
    path: '/playground',
    name: 'Playground',
    component: () => import('./views/PlaygroundExample.vue'),
    meta: {
      title: 'Playground'
    }
  }
]

export default routes
