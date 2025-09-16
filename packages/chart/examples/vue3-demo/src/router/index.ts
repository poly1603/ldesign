import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/components',
    name: 'Components',
    component: () => import('../views/Components.vue')
  },
  {
    path: '/composables',
    name: 'Composables',
    component: () => import('../views/Composables.vue')
  },
  {
    path: '/advanced',
    name: 'Advanced',
    component: () => import('../views/Advanced.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
