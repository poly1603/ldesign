import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./pages/HomePage.vue')
    },
    {
      path: '/performance',
      name: 'Performance',
      component: () => import('./pages/PerformanceTest.vue')
    },
    {
      path: '/advanced',
      name: 'Advanced',
      component: () => import('./pages/AdvancedDemo.vue')
    }
  ]
})

export default router
