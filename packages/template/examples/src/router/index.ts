import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 导入页面组件
import Home from '../views/Home.vue'
import HookDemo from '../views/HookDemo.vue'
import ComponentDemo from '../views/ComponentDemo.vue'
import DeviceDemo from '../views/DeviceDemo.vue'
import TemplateGallery from '../views/TemplateGallery.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页',
      description: 'LDesign 模板系统演示首页'
    }
  },
  {
    path: '/hook-demo',
    name: 'HookDemo',
    component: HookDemo,
    meta: {
      title: 'useTemplate Hook 演示',
      description: '展示如何使用 useTemplate Hook 进行模板管理'
    }
  },
  {
    path: '/component-demo',
    name: 'ComponentDemo',
    component: ComponentDemo,
    meta: {
      title: 'TemplateRenderer 组件演示',
      description: '展示如何使用 TemplateRenderer 组件'
    }
  },
  {
    path: '/device-demo',
    name: 'DeviceDemo',
    component: DeviceDemo,
    meta: {
      title: '响应式设备切换演示',
      description: '展示模板系统的响应式设备切换功能'
    }
  },
  {
    path: '/template-gallery',
    name: 'TemplateGallery',
    component: TemplateGallery,
    meta: {
      title: '模板画廊',
      description: '浏览所有可用的模板'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - LDesign Template System`
  } else {
    document.title = 'LDesign Template System'
  }
  next()
})

export default router
