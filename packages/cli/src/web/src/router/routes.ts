/**
 * 路由配置
 * 定义应用的所有路由
 */

import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: {
      title: '仪表盘'
    }
  },
  {
    path: '/projects',
    name: 'ProjectManager',
    component: () => import('../views/ProjectManager.vue'),
    meta: {
      title: '项目管理'
    }
  },
  {
    path: '/projects/:id',
    name: 'ProjectDetail',
    component: () => import('../views/ProjectDetail.vue'),
    meta: {
      title: '项目详情'
    }
  },
  {
    path: '/projects/:id/:action',
    name: 'ProjectAction',
    component: () => import('../views/ProjectAction.vue'),
    meta: {
      title: '项目操作'
    }
  },
  {
    path: '/node',
    name: 'NodeManager',
    component: () => import('../views/NodeManager.vue'),
    meta: {
      title: 'Node 管理'
    }
  },
  {
    path: '/npm-sources',
    name: 'NpmSourceManager',
    component: () => import('../views/NpmSourceManager.vue'),
    meta: {
      title: 'NPM 源管理'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: {
      title: '设置'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: {
      title: '页面未找到'
    }
  }
]
