import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import NativeJS from '../views/NativeJS.vue'
import VueComponent from '../views/VueComponent.vue'
import VueHook from '../views/VueHook.vue'
import VueDirective from '../views/VueDirective.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页' }
  },
  {
    path: '/native-js',
    name: 'NativeJS',
    component: NativeJS,
    meta: { title: '原生 JavaScript' }
  },
  {
    path: '/vue-component',
    name: 'VueComponent',
    component: VueComponent,
    meta: { title: 'Vue 组件' }
  },
  {
    path: '/vue-hook',
    name: 'VueHook',
    component: VueHook,
    meta: { title: 'Vue Hook' }
  },
  {
    path: '/vue-directive',
    name: 'VueDirective',
    component: VueDirective,
    meta: { title: 'Vue 指令' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
