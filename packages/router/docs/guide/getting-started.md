# 快速开始

本指南将帮助你在几分钟内上手 LDesign Router，体验现代化的 Vue 路由解决方案。

## 前置要求

- Node.js 16+
- Vue 3.2+
- TypeScript 4.5+ (推荐)

## 安装

::: code-group

```bash [npm]
npm install @ldesign/router
```

```bash [yarn]
yarn add @ldesign/router
```

```bash [pnpm]
pnpm add @ldesign/router
```

:::

## 基本使用

### 1. 创建路由配置

首先，让我们创建一个基本的路由配置文件：

```typescript
// router/index.ts
import { createRouter, createWebHistory } from '@ldesign/router'
import type { RouteRecordRaw } from '@ldesign/router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: '首页',
      cache: true,
      preload: 'immediate',
    },
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: {
      title: '关于我们',
      transition: {
        name: 'fade',
        mode: 'out-in',
      },
    },
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('../views/Products.vue'),
    children: [
      {
        path: ':id',
        name: 'ProductDetail',
        component: () => import('../views/ProductDetail.vue'),
        props: true,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 启用高级功能
  preloadStrategy: 'visible',
  performance: true,
  cache: {
    max: 20,
    ttl: 10 * 60 * 1000, // 10分钟
    include: ['Home', 'Products'],
    exclude: ['Login'],
  },
})

export default router
```

### 2. 在应用中使用路由

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)
app.mount('#app')
```

### 3. 创建应用模板

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <nav>
      <router-link to="/">首页</router-link>
      <router-link to="/about">关于</router-link>
      <router-link to="/products">产品</router-link>
    </nav>

    <main>
      <router-view v-slot="{ Component, route }">
        <transition
          :name="route.meta.transition?.name || 'fade'"
          :mode="route.meta.transition?.mode || 'out-in'"
          appear
        >
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style>
/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

### 4. 创建页面组件

```vue
<!-- views/Home.vue -->
<template>
  <div class="home">
    <h1>欢迎来到首页</h1>
    <p>这是一个使用 LDesign Router 的示例应用。</p>

    <div class="features">
      <h2>主要特性</h2>
      <ul>
        <li>🚀 高性能路由匹配</li>
        <li>📦 智能预加载</li>
        <li>🔄 路由缓存</li>
        <li>📊 性能监控</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from '@ldesign/router'

const router = useRouter()
const route = useRoute()

console.log('当前路由:', route.name)
console.log('路由器实例:', router)
</script>
```

## 高级功能预览

### 路由守卫

```typescript
// 全局前置守卫
router.beforeEach((to, from, next) => {
  console.log(`导航到: ${to.path}`)
  next()
})

// 全局后置钩子
router.afterEach((to, from) => {
  document.title = to.meta.title || 'My App'
})
```

### 组合式 API

```vue
<script setup lang="ts">
import { useRouter, useRoute, onBeforeRouteLeave } from '@ldesign/router'

const router = useRouter()
const route = useRoute()

// 编程式导航
const goToAbout = () => {
  router.push('/about')
}

// 路由守卫
onBeforeRouteLeave((to, from) => {
  const answer = window.confirm('确定要离开吗？')
  if (!answer) return false
})
</script>
```

### 性能监控

```typescript
// 获取性能统计
const stats = router.getPerformanceStats()
console.log('路由性能统计:', stats)

// 获取缓存统计
const cacheStats = router.getCacheStats()
console.log('缓存统计:', cacheStats)
```

## 下一步

恭喜！你已经成功创建了第一个 LDesign Router 应用。接下来你可以：

- 📖 阅读[核心概念](/guide/concepts)了解更多基础知识
- 🛠️ 学习[路由配置](/guide/routes)的详细用法
- 🚀 探索[高级功能](/guide/lazy-loading)如懒加载、预加载等
- 💡 查看[最佳实践](/guide/performance-tips)优化你的应用

## 常见问题

### 如何启用 TypeScript 支持？

LDesign Router 原生支持 TypeScript，只需确保你的项目配置了 TypeScript 即可。

### 如何迁移现有的 Vue Router 项目？

LDesign Router 的 API 与 Vue Router 高度兼容，大部分情况下只需要更改导入路径即可。

### 性能如何？

LDesign Router 经过精心优化，在大多数场景下性能优于传统路由器。内置的预加载和缓存功能可以显著提升用
户体验。

::: tip 提示遇到问题？查看我们的[故障排除指南](/guide/troubleshooting)或在
[GitHub](https://github.com/ldesign/ldesign/issues) 上提交问题。 :::
