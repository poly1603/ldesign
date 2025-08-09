# 快速开始

本指南将帮助你快速上手 LDesign Router，从安装到创建第一个路由应用。

## 安装

### 使用包管理器

::: code-group

```bash [npm]
npm install @ldesign/router
```

```bash [pnpm]
pnpm add @ldesign/router
```

```bash [yarn]
yarn add @ldesign/router
```

:::

### CDN

```html
<script src="https://unpkg.com/@ldesign/router@latest/dist/index.min.js"></script>
```

## 基础使用

### 1. 创建路由配置

首先，定义你的路由配置：

```typescript
// routes.ts
import { RouteRecordRaw } from '@ldesign/router'
import Home from './views/Home.vue'
import About from './views/About.vue'
import Products from './views/Products.vue'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页',
    },
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: {
      title: '关于我们',
    },
  },
  {
    path: '/products',
    name: 'Products',
    component: Products,
    meta: {
      title: '产品列表',
      requiresAuth: true,
    },
  },
]
```

### 2. 配置应用

使用 LDesign Engine 配置路由：

```typescript
// main.ts
import { createApp } from '@ldesign/engine'
import { routerPlugin } from '@ldesign/router'
import { routes } from './routes'
import App from './App.vue'

const engine = createApp(App)

// 配置路由插件
await engine.use(
  routerPlugin({
    routes,
    mode: 'hash', // 或 'history'
    base: '/',

    // 启用增强组件（可选）
    enhancedComponents: {
      enabled: true,
      options: {
        enhancementConfig: {
          // 自定义权限检查器
          permissionChecker: permission => {
            // 实现你的权限检查逻辑
            return true
          },
        },
      },
    },
  })
)

await engine.mount('#app')
```

### 3. 使用路由组件

在你的 Vue 组件中使用路由：

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <!-- 导航菜单 -->
    <nav>
      <RouterLink to="/" variant="tab">首页</RouterLink>
      <RouterLink to="/about" variant="tab">关于</RouterLink>
      <RouterLink to="/products" variant="tab" permission="products.view"> 产品 </RouterLink>
    </nav>

    <!-- 路由视图 -->
    <main>
      <RouterView transition="fade" keep-alive track-performance />
    </main>
  </div>
</template>

<style>
nav {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

main {
  padding: 2rem;
}
</style>
```

## 增强功能示例

### 智能预加载

```vue
<template>
  <!-- 鼠标悬停时预加载 -->
  <RouterLink to="/heavy-page" preload="hover" preload-delay="300"> 重型页面 </RouterLink>

  <!-- 组件可见时预加载 -->
  <RouterLink to="/lazy-page" preload="visible"> 懒加载页面 </RouterLink>
</template>
```

### 权限控制

```vue
<template>
  <!-- 需要权限的链接 -->
  <RouterLink to="/admin" permission="admin" fallback-to="/login" variant="button">
    管理后台
  </RouterLink>

  <!-- 多权限检查 -->
  <RouterLink to="/settings" :permission="['user', 'settings']"> 设置 </RouterLink>
</template>
```

### 样式变体

```vue
<template>
  <!-- 按钮样式 -->
  <RouterLink to="/action" variant="button" size="large"> 执行操作 </RouterLink>

  <!-- 卡片样式 -->
  <RouterLink to="/feature" variant="card" icon="icon-star"> 特色功能 </RouterLink>

  <!-- 面包屑样式 -->
  <nav class="breadcrumb">
    <RouterLink to="/" variant="breadcrumb">首页</RouterLink>
    <RouterLink to="/products" variant="breadcrumb">产品</RouterLink>
    <RouterLink to="/products/123" variant="breadcrumb">产品详情</RouterLink>
  </nav>
</template>
```

### 图标和徽章

```vue
<template>
  <!-- 带图标的链接 -->
  <RouterLink to="/messages" icon="icon-message" icon-position="left"> 消息 </RouterLink>

  <!-- 带徽章的链接 -->
  <RouterLink to="/notifications" badge="5" badge-color="#ff4757" badge-variant="count">
    通知
  </RouterLink>
</template>
```

### 过渡动画

```vue
<template>
  <!-- 自定义过渡动画 -->
  <RouterView
    :transition="{
      name: 'slide',
      mode: 'out-in',
      duration: 300,
    }"
  />

  <!-- 根据路由选择过渡 -->
  <RouterView :transition="getTransition" />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from '@ldesign/router'

const route = useRoute()

const getTransition = computed(() => {
  return route.meta.transition || 'fade'
})
</script>
```

## 组合式 API

LDesign Router 提供了丰富的组合式 API：

```vue
<script setup>
import { useRouter, useRoute, useRouteParams, useRouteQuery } from '@ldesign/router'

const router = useRouter()
const route = useRoute()
const params = useRouteParams()
const query = useRouteQuery()

// 编程式导航
const goToProducts = () => {
  router.push('/products')
}

// 监听路由变化
watch(route, newRoute => {
  console.log('路由变化:', newRoute.path)
})
</script>
```

## 性能监控

启用性能监控来优化你的应用：

```vue
<template>
  <RouterView track-performance @performance="handlePerformance" />
</template>

<script setup>
const handlePerformance = data => {
  console.log('路由性能数据:', data)
  // { route: '/home', duration: 150, component: 'Home' }

  // 发送到分析服务
  analytics.track('route_performance', data)
}
</script>
```

## 错误处理

配置错误处理和回退：

```vue
<template>
  <RouterView
    :loading-component="LoadingSpinner"
    :error-component="ErrorPage"
    :empty-component="EmptyState"
    error-boundary
    @error="handleError"
  />
</template>

<script setup>
import LoadingSpinner from './components/LoadingSpinner.vue'
import ErrorPage from './components/ErrorPage.vue'
import EmptyState from './components/EmptyState.vue'

const handleError = error => {
  console.error('路由错误:', error)
  // 错误上报
  errorReporting.captureException(error)
}
</script>
```

## 下一步

现在你已经了解了 LDesign Router 的基础用法，可以继续学习：

- [路由配置](/guide/route-configuration) - 深入了解路由配置选项
- [增强的 RouterLink](/guide/enhanced-router-link) - 探索 RouterLink 的所有功能
- [增强的 RouterView](/guide/enhanced-router-view) - 了解 RouterView 的高级特性
- [权限控制](/guide/permission-control) - 学习如何实现权限控制
- [API 参考](/api/) - 查看完整的 API 文档
