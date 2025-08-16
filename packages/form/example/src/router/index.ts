import type { RouteRecordRaw } from 'vue-router'

import DynamicDemo from '../views/DynamicDemo.vue'
// 导入页面组件
import Home from '../views/Home.vue'
import LayoutDemo from '../views/LayoutDemo.vue'
import ValidationDemo from '../views/ValidationDemo.vue'

// 路由配置
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '基础示例',
    },
  },
  {
    path: '/validation',
    name: 'Validation',
    component: ValidationDemo,
    meta: {
      title: '表单验证',
    },
  },
  {
    path: '/dynamic',
    name: 'Dynamic',
    component: DynamicDemo,
    meta: {
      title: '动态表单',
    },
  },
  {
    path: '/layout',
    name: 'Layout',
    component: LayoutDemo,
    meta: {
      title: '复杂布局',
    },
  },
]
