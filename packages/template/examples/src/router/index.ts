import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/template-gallery',
      name: 'TemplateGallery',
      component: () => import('../views/TemplateGallery.vue'),
    },
    {
      path: '/hook-demo',
      name: 'HookDemo',
      component: () => import('../views/HookDemo.vue'),
    },
    {
      path: '/component-demo',
      name: 'ComponentDemo',
      component: () => import('../views/ComponentDemo.vue'),
    },
    {
      path: '/device-demo',
      name: 'DeviceDemo',
      component: () => import('../views/DeviceDemo.vue'),
    },
    {
      path: '/template-selector-demo',
      name: 'TemplateSelectorDemo',
      component: () => import('../views/TemplateSelectorDemo.vue'),
    },
  ],
})

export default router
