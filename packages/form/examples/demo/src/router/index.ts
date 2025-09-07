/**
 * 路由配置
 * 
 * @description
 * 定义应用的路由结构，包含首页和三个功能演示页面
 */

import type { RouteRecordRaw } from 'vue-router'

// 懒加载组件
const Home = () => import('../views/Home.vue')
const VanillaDemo = () => import('../views/VanillaDemo.vue')
const WebComponentsDemo = () => import('../views/WebComponentsDemo.vue')
const VueDemo = () => import('../views/VueDemo.vue')

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页',
      description: '@ldesign/form 演示项目首页'
    }
  },
  {
    path: '/vanilla',
    name: 'VanillaDemo',
    component: VanillaDemo,
    meta: {
      title: '原生JavaScript演示',
      description: '使用纯JavaScript实现的查询表单演示'
    }
  },
  {
    path: '/webcomponents',
    name: 'WebComponentsDemo',
    component: WebComponentsDemo,
    meta: {
      title: 'Web Components演示',
      description: '使用Lit框架实现的Web Components查询表单演示'
    }
  },
  {
    path: '/vue',
    name: 'VueDemo',
    component: VueDemo,
    meta: {
      title: 'Vue组件演示',
      description: '使用Vue 3组合式API和@ldesign/form hooks实现的查询表单演示'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

export default routes
