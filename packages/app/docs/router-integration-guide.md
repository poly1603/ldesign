# 路由器集成指南

本文档详细介绍如何在 `@ldesign/app` 项目中集成 `@ldesign/router` 路由包。

## 🎯 集成概述

`@ldesign/router` 提供了完整的 LDesign Engine 集成支持，通过 Engine 插件机制实现无缝集成。这种集成方
式不仅简化了路由器的使用，还提供了更好的状态管理、事件系统和生命周期管理。

## 📦 安装依赖

路由器依赖已经在 `package.json` 中配置：

```json
{
  "dependencies": {
    "@ldesign/router": "workspace:*"
  }
}
```

## 🚀 基础集成

### 1. 导入路由器插件

在 `src/main.ts` 中导入并使用路由器插件：

```typescript
import { createApp } from '@ldesign/engine'
import { createRouterEnginePlugin } from '@ldesign/router'
import App from './App.vue'

// 定义路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./views/Home.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('./views/About.vue'),
    meta: { title: '关于' },
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('./views/Contact.vue'),
    meta: { title: '联系我们' },
  },
]

async function bootstrap() {
  // 创建 Engine 应用
  const engine = createApp(App)

  // 集成路由器插件
  await engine.use(
    createRouterEnginePlugin({
      routes,
      mode: 'hash', // 使用 hash 模式
      base: '/',
      linkActiveClass: 'router-link-active',
      linkExactActiveClass: 'router-link-exact-active',
    })
  )

  // 挂载应用
  engine.mount('#app')
}

bootstrap().catch(console.error)
```

### 2. 在组件中使用路由器

```vue
<template>
  <div class="app">
    <nav class="navigation">
      <RouterLink to="/" class="nav-link">首页</RouterLink>
      <RouterLink to="/about" class="nav-link">关于</RouterLink>
      <RouterLink to="/contact" class="nav-link">联系我们</RouterLink>
    </nav>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from '@ldesign/router'
</script>
```

## 🔧 高级配置

### 1. 自定义路由模式

```typescript
// History 模式（推荐用于生产环境）
await engine.use(
  createRouterEnginePlugin({
    routes,
    mode: 'history',
    base: '/app/',
  })
)

// Hash 模式（兼容性更好）
await engine.use(
  createRouterEnginePlugin({
    routes,
    mode: 'hash',
    base: '/',
  })
)

// Memory 模式（用于 SSR 或测试）
await engine.use(
  createRouterEnginePlugin({
    routes,
    mode: 'memory',
  })
)
```

### 2. 滚动行为配置

```typescript
await engine.use(
  createRouterEnginePlugin({
    routes,
    scrollBehavior(to, from, savedPosition) {
      // 如果有保存的位置，恢复到该位置
      if (savedPosition) {
        return savedPosition
      }

      // 如果有锚点，滚动到锚点
      if (to.hash) {
        return {
          el: to.hash,
          behavior: 'smooth',
        }
      }

      // 默认滚动到顶部
      return { top: 0 }
    },
  })
)
```

### 3. 路由守卫

```typescript
// 在路由配置中添加守卫
const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    beforeEnter: (to, from, next) => {
      // 检查用户权限
      if (checkUserPermission()) {
        next()
      } else {
        next('/login')
      }
    },
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
      },
    ],
  },
]
```

## 🎨 组件使用

### 1. RouterLink 组件

```vue
<template>
  <!-- 基础链接 -->
  <RouterLink to="/about">关于我们</RouterLink>

  <!-- 命名路由 -->
  <RouterLink :to="{ name: 'User', params: { id: 123 } }"> 用户详情 </RouterLink>

  <!-- 带查询参数 -->
  <RouterLink :to="{ path: '/search', query: { q: 'vue' } }"> 搜索结果 </RouterLink>

  <!-- 替换当前历史记录 -->
  <RouterLink to="/login" replace>登录</RouterLink>

  <!-- 自定义样式 -->
  <RouterLink
    to="/products"
    class="btn btn-primary"
    active-class="btn-active"
    exact-active-class="btn-exact-active"
  >
    产品列表
  </RouterLink>
</template>
```

### 2. RouterView 组件

```vue
<template>
  <!-- 基础视图 -->
  <RouterView />

  <!-- 带过渡动画 -->
  <RouterView v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>

  <!-- 带缓存 -->
  <RouterView v-slot="{ Component, route }">
    <KeepAlive :include="['Home', 'About']">
      <component :is="Component" :key="route.path" />
    </KeepAlive>
  </RouterView>
</template>
```

## 🔌 组合式 API

### 1. 基础 API

```vue
<script setup lang="ts">
import { useRouter, useRoute } from '@ldesign/router'

const router = useRouter()
const route = useRoute()

// 编程式导航
const goToAbout = () => {
  router.push('/about')
}

const goBack = () => {
  router.back()
}

// 响应式路由信息
console.log('当前路径:', route.path)
console.log('路由参数:', route.params)
console.log('查询参数:', route.query)
</script>
```

### 2. 便捷 API

```vue
<script setup lang="ts">
import { useParams, useQuery, useHash, useMeta, useMatched } from '@ldesign/router'

// 获取路由参数
const params = useParams()
console.log('用户ID:', params.id)

// 获取查询参数
const query = useQuery()
console.log('搜索关键词:', query.q)

// 获取哈希值
const hash = useHash()
console.log('当前哈希:', hash.value)

// 获取路由元信息
const meta = useMeta()
console.log('页面标题:', meta.title)

// 获取匹配的路由记录
const matched = useMatched()
console.log('匹配的路由:', matched.value)
</script>
```

## 🎯 Engine 集成特性

### 1. 状态同步

路由状态会自动同步到 Engine 状态管理：

```typescript
// 访问路由状态
const currentRoute = engine.state.get('router:currentRoute')
const routerMode = engine.state.get('router:mode')
const basePath = engine.state.get('router:base')
```

### 2. 事件监听

```typescript
// 监听路由变化
engine.events.on('router:navigated', ({ to, from }) => {
  console.log(`从 ${from.path} 导航到 ${to.path}`)

  // 更新页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // 发送页面浏览统计
  analytics.track('page_view', {
    path: to.path,
    title: to.meta.title,
  })
})

// 监听路由错误
engine.events.on('router:error', error => {
  console.error('路由错误:', error)
  // 可以重定向到错误页面
  engine.router.push('/error')
})
```

### 3. 直接访问路由器

```typescript
// 通过 Engine 访问路由器实例
const router = engine.router

// 编程式导航
router.push('/dashboard')
router.replace('/login')
router.go(-1)

// 路由信息
console.log('当前路由:', router.currentRoute.value)
console.log('所有路由:', router.getRoutes())
```
