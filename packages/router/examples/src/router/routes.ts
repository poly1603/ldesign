/**
 * 路由配置定义
 * 
 * 本文件定义了所有的路由规则，展示了各种路由功能：
 * 1. 静态路由
 * 2. 动态路由参数
 * 3. 嵌套路由
 * 4. 路由元信息
 * 5. 懒加载组件
 * 6. 设备适配路由
 */

import type { RouteRecordRaw } from '@ldesign/router'

/**
 * 路由配置数组
 */
export const routes: RouteRecordRaw[] = [
  // 首页路由
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: '首页',
      description: '展示 @ldesign/router 的主要功能和特性',
      icon: 'home',
      transition: 'fade'
    }
  },

  // 基础功能演示
  {
    path: '/basic',
    name: 'Basic',
    component: () => import('../views/basic/BasicLayout.vue'),
    meta: {
      title: '基础功能',
      description: '演示路由的基础功能',
      icon: 'basic'
    },
    children: [
      {
        path: '',
        name: 'BasicOverview',
        component: () => import('../views/basic/Overview.vue'),
        meta: {
          title: '功能概览',
          description: '基础路由功能概览'
        }
      },
      {
        path: 'navigation',
        name: 'BasicNavigation',
        component: () => import('../views/basic/Navigation.vue'),
        meta: {
          title: '导航功能',
          description: '演示各种导航方式'
        }
      },
      {
        path: 'params/:id',
        name: 'BasicParams',
        component: () => import('../views/basic/Params.vue'),
        meta: {
          title: '路由参数',
          description: '演示动态路由参数的使用'
        }
      },
      {
        path: 'query',
        name: 'BasicQuery',
        component: () => import('../views/basic/Query.vue'),
        meta: {
          title: '查询参数',
          description: '演示查询参数的处理'
        }
      }
    ]
  },



  // 重定向规则
  {
    path: '/home',
    redirect: '/'
  }
]
