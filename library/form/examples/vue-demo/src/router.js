/**
 * Simple Vue Router
 * 简单的路由系统
 */

import { ref } from 'vue'

export const routes = [
  {
    path: '/',
    name: 'home',
    title: '首页',
    icon: '🏠',
    category: null
  },
  {
    path: '/all-fields',
    name: 'all-fields',
    title: '所有字段',
    icon: '📦',
    category: '字段组件'
  },
  {
    path: '/validation',
    name: 'validation',
    title: '验证规则',
    icon: '✅',
    category: '字段组件'
  },
  {
    path: '/user-profile',
    name: 'user-profile',
    title: '用户资料',
    icon: '👤',
    category: '真实场景'
  },
  {
    path: '/product-form',
    name: 'product-form',
    title: '商品编辑',
    icon: '🛍️',
    category: '真实场景'
  },
  {
    path: '/array-fields',
    name: 'array-fields',
    title: '动态数组',
    icon: '🔄',
    category: '高级功能'
  },
  {
    path: '/conditional-fields',
    name: 'conditional-fields',
    title: '条件字段',
    icon: '🎯',
    category: '高级功能'
  },
  {
    path: '/form-group',
    name: 'form-group',
    title: '表单分组',
    icon: '📁',
    category: '高级功能'
  },
  {
    path: '/survey',
    name: 'survey',
    title: '问卷调查',
    icon: '📋',
    category: '真实场景'
  },
  {
    path: '/settings',
    name: 'settings',
    title: '设置页面',
    icon: '⚙️',
    category: '真实场景'
  },
  {
    path: '/layout',
    name: 'layout',
    title: '布局系统',
    icon: '📐',
    category: '高级功能'
  },
  {
    path: '/theme',
    name: 'theme',
    title: '主题定制',
    icon: '🎨',
    category: '高级功能'
  }
]

// 当前路由
export const currentRoute = ref('/')

// 导航到指定路由
export function navigateTo(path) {
  currentRoute.value = path
  // 更新浏览器 hash
  window.location.hash = path
}

// 根据路由名称获取路由
export function getRouteByName(name) {
  return routes.find(r => r.name === name)
}

// 根据路径获取路由
export function getRouteByPath(path) {
  return routes.find(r => r.path === path)
}

// 按分类分组路由
export function getRoutesByCategory() {
  const grouped = {}
  routes.forEach(route => {
    const category = route.category || '其他'
    if (!grouped[category]) {
      grouped[category] = []
    }
    if (route.category !== null) { // 排除首页
      grouped[category].push(route)
    }
  })
  return grouped
}

// 初始化路由（从 hash 读取）
export function initRouter() {
  const hash = window.location.hash.slice(1) || '/'
  currentRoute.value = hash
}

// 监听浏览器前进后退
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1) || '/'
  currentRoute.value = hash
})



