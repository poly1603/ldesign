/**
 * Vue Router 配置
 * 
 * 定义应用的路由配置
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 路由组件懒加载
const LauncherConfigEditor = () => import('../views/LauncherConfigEditor.vue')
const AppConfigEditor = () => import('../views/AppConfigEditor.vue')
const PackageJsonEditor = () => import('../views/PackageJsonEditor.vue')

/**
 * 路由配置
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/launcher'
  },
  {
    path: '/launcher',
    name: 'LauncherConfig',
    component: LauncherConfigEditor,
    meta: {
      title: 'Launcher 配置',
      description: '配置 @ldesign/launcher 的各项参数'
    }
  },
  {
    path: '/app',
    name: 'AppConfig',
    component: AppConfigEditor,
    meta: {
      title: 'App 配置',
      description: '配置应用程序的各项参数'
    }
  },
  {
    path: '/package',
    name: 'PackageJson',
    component: PackageJsonEditor,
    meta: {
      title: 'Package.json',
      description: '管理项目的依赖和脚本'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/launcher'
  }
]

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的滚动位置，恢复到该位置
    if (savedPosition) {
      return savedPosition
    }
    // 否则滚动到顶部
    return { top: 0 }
  }
})

/**
 * 全局前置守卫
 */
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - LDesign 配置编辑器`
  } else {
    document.title = 'LDesign 配置编辑器'
  }
  
  next()
})

/**
 * 全局后置钩子
 */
router.afterEach((to, from) => {
  // 这里可以添加页面访问统计等逻辑
  console.log(`导航到: ${to.path}`)
})

export default router
