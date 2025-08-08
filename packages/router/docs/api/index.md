# API 参考

LDesign Router 提供了丰富而强大的 API，让你能够灵活地控制应用的路由行为。

## 📚 API 概览

### 核心 API

| API                                      | 描述           | 类型 |
| ---------------------------------------- | -------------- | ---- |
| [createRouter](/api/router)              | 创建路由器实例 | 函数 |
| [Router](/api/router)                    | 路由器类       | 类   |
| [RouteLocation](/api/route-location)     | 路由位置对象   | 接口 |
| [NavigationGuard](/api/navigation-guard) | 导航守卫       | 类型 |
| [RouterHistory](/api/router-history)     | 历史管理       | 接口 |

### 组件 API

| 组件                           | 描述         | 文档     |
| ------------------------------ | ------------ | -------- |
| [RouterView](/api/router-view) | 路由视图组件 | 组件 API |
| [RouterLink](/api/router-link) | 路由链接组件 | 组件 API |

### 组合式 API

| API                          | 描述           | 返回值                  |
| ---------------------------- | -------------- | ----------------------- |
| [useRouter](/api/use-router) | 获取路由器实例 | Router                  |
| [useRoute](/api/use-route)   | 获取当前路由   | RouteLocationNormalized |

## 🚀 快速查找

### 按功能分类

#### 🏗️ 路由器创建和配置

- `createRouter()` - 创建路由器
- `createWebHistory()` - Web History 模式
- `createWebHashHistory()` - Hash 模式
- `createMemoryHistory()` - Memory 模式

#### 🧭 导航控制

- `router.push()` - 导航到新路由
- `router.replace()` - 替换当前路由
- `router.go()` - 历史导航
- `router.back()` - 后退
- `router.forward()` - 前进

#### 🛡️ 路由守卫

- `router.beforeEach()` - 全局前置守卫
- `router.beforeResolve()` - 全局解析守卫
- `router.afterEach()` - 全局后置钩子
- `beforeRouteEnter` - 组件进入守卫
- `beforeRouteUpdate` - 组件更新守卫
- `beforeRouteLeave` - 组件离开守卫

#### 🎯 路由管理

- `router.addRoute()` - 动态添加路由
- `router.removeRoute()` - 移除路由
- `router.hasRoute()` - 检查路由是否存在
- `router.getRoutes()` - 获取所有路由
- `router.resolve()` - 解析路由

#### 🚀 高级功能

- `router.preloadRoute()` - 预加载路由
- `router.clearPreloadCache()` - 清除预加载缓存
- `router.getPerformanceStats()` - 获取性能统计
- `router.getCacheStats()` - 获取缓存统计
- `router.clearRouteCache()` - 清除路由缓存

### 按使用场景分类

#### 🎨 组件开发

```typescript
// 在组件中使用
import { useRoute, useRouter } from '@ldesign/router'

const router = useRouter()
const route = useRoute()
```

#### 🔧 路由配置

```typescript
// 路由配置
import { createRouter, createWebHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHistory(),
  routes: [...]
})
```

#### 🛡️ 权限控制

```typescript
// 路由守卫
router.beforeEach((to, from, next) => {
  // 权限检查逻辑
})
```

#### 📊 性能优化

```typescript
// 预加载和缓存
router.preloadRoute('/heavy-page')
const stats = router.getPerformanceStats()
```

## 🎯 类型定义

### 核心类型

```typescript
// 路由记录
interface RouteRecordRaw {
  path: string
  name?: string
  component?: Component
  components?: Record<string, Component>
  redirect?: RouteLocationRaw
  props?: boolean | Record<string, any> | Function
  meta?: RouteMeta
  beforeEnter?: NavigationGuard | NavigationGuard[]
  children?: RouteRecordRaw[]
}

// 路由位置
interface RouteLocationNormalized {
  path: string
  name: string | null | undefined
  params: RouteParams
  query: LocationQuery
  hash: string
  meta: RouteMeta
  matched: RouteRecordNormalized[]
}

// 导航守卫
type NavigationGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => any
```

### 配置类型

```typescript
// 路由器选项
interface RouterOptions {
  history: RouterHistory
  routes: RouteRecordRaw[]
  preloadStrategy?: PreloadStrategy
  performance?: boolean
  cache?: CacheOptions
  scrollBehavior?: ScrollBehavior
  parseQuery?: (query: string) => LocationQuery
  stringifyQuery?: (query: LocationQuery) => string
}

// 缓存选项
interface CacheOptions {
  max?: number
  ttl?: number
  include?: (string | RegExp)[]
  exclude?: (string | RegExp)[]
}

// 预加载策略
type PreloadStrategy = 'hover' | 'visible' | 'idle' | 'immediate'
```

## 📖 使用示例

### 基础使用

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'
import { createApp } from 'vue'

// 创建路由器
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
  ],
})

// 创建应用
const app = createApp(App)
app.use(router)
app.mount('#app')
```

### 高级配置

```typescript
const router = createRouter({
  history: createWebHistory(),
  routes,

  // 🚀 启用高级功能
  preloadStrategy: 'hover',
  performance: true,
  cache: {
    max: 20,
    ttl: 5 * 60 * 1000,
    include: [/^\/user/],
    exclude: ['/login'],
  },

  // 滚动行为
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})
```

### 组件中使用

```vue
<script setup>
import { useRoute, useRouter } from '@ldesign/router'

const router = useRouter()
const route = useRoute()

function goBack() {
  router.back()
}

function goToUser(id) {
  router.push({ name: 'User', params: { id } })
}
</script>

<template>
  <div>
    <h1>{{ route.meta.title }}</h1>
    <button @click="goBack">返回</button>
    <button @click="goToUser('123')">用户资料</button>
  </div>
</template>
```

## 🔍 错误处理

### 导航错误

```typescript
// 处理导航错误
router.push('/some-route').catch(error => {
  if (error.name === 'NavigationDuplicated') {
    // 重复导航
  } else if (error.name === 'NavigationCancelled') {
    // 导航被取消
  } else if (error.name === 'NavigationAborted') {
    // 导航被中止
  } else {
    // 其他错误
    console.error('导航失败:', error)
  }
})

// 全局错误处理
router.onError((error, to, from) => {
  console.error('路由错误:', error)
  // 发送错误报告
})
```

### 类型错误

```typescript
// 类型安全的路由使用
interface UserParams {
  id: string
}

// 正确的类型定义
function goToUser(id: string) {
  router.push({
    name: 'User',
    params: { id } as UserParams,
  })
}
```

## 🎯 性能优化

### 预加载优化

```typescript
// 智能预加载
router.preloadRoute('/heavy-page')

// 批量预加载
function preloadImportantRoutes() {
  ;['Dashboard', 'Profile', 'Settings'].forEach(name => {
    router.preloadRoute({ name })
  })
}

// 清除预加载缓存
router.clearPreloadCache()
```

### 缓存优化

```typescript
// 获取缓存统计
const cacheStats = router.getCacheStats()
console.log('缓存命中率:', cacheStats.hitRate)

// 清除特定缓存
router.clearRouteCache('/user/123')

// 清除所有缓存
router.clearRouteCache()
```

### 性能监控

```typescript
// 获取性能统计
const stats = router.getPerformanceStats()
console.log('平均导航时间:', stats.averageDuration)

// 性能告警
router.afterEach(() => {
  const stats = router.getPerformanceStats()
  if (stats.averageDuration > 1000) {
    console.warn('导航性能较慢')
  }
})
```

## 📚 深入学习

### 推荐阅读顺序

1. **[Router](/api/router)** - 了解路由器的完整 API
2. **[RouteLocation](/api/route-location)** - 理解路由位置对象
3. **[NavigationGuard](/api/navigation-guard)** - 掌握导航守卫
4. **[RouterView](/api/router-view)** - 学习路由视图组件
5. **[RouterLink](/api/router-link)** - 掌握路由链接组件

### 实践建议

- 🎯 **从基础开始** - 先掌握基本的路由配置和导航
- 🚀 **逐步进阶** - 然后学习守卫、预加载等高级功能
- 🔧 **实际应用** - 在项目中实践，加深理解
- 📖 **查阅文档** - 遇到问题时及时查阅 API 文档

---

<div style="text-align: center; margin: 2rem 0;">
  <a href="/api/router" style="display: inline-block; padding: 12px 24px; background: #1890ff; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 0 8px;">
    📖 Router API
  </a>
  <a href="/guide/" style="display: inline-block; padding: 12px 24px; border: 1px solid #1890ff; color: #1890ff; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 0 8px;">
    📚 返回指南
  </a>
</div>
