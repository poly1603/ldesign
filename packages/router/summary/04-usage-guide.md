# 使用指南

## 快速上手

### 基础安装和配置

```bash
# 安装依赖
pnpm add @ldesign/router

# 如果使用 TypeScript
pnpm add -D typescript @types/node
```

### 基本路由配置

```typescript
import type { RouteRecordRaw } from '@ldesign/router'
// src/router/index.ts
import { createRouter, createWebHistory } from '@ldesign/router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: '首页',
      cache: true,
      requiresAuth: false,
    },
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: { title: '关于我们' },
  },
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: () => import('../views/UserProfile.vue'),
    props: true,
    meta: {
      title: '用户资料',
      requiresAuth: true,
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,

  // 高级功能配置
  preloadStrategy: 'hover',
  performance: true,
  cache: {
    max: 20,
    ttl: 5 * 60 * 1000,
    include: [/^\/user/, 'Home'],
    exclude: ['/login', '/register'],
  },
})

export default router
```

### 应用集成

```typescript
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 注册路由器
app.use(router)

// 等待路由器准备就绪
router.isReady().then(() => {
  app.mount('#app')
})
```

## 核心功能使用

### 1. 路由导航

```typescript
// 编程式导航
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 导航到指定路由
router.push('/about')
router.push({ name: 'UserProfile', params: { id: '123' } })
router.push({ path: '/search', query: { q: 'vue' } })

// 替换当前路由
router.replace('/login')

// 历史导航
router.go(-1) // 后退
router.back() // 后退
router.forward() // 前进
```

```vue
<!-- 声明式导航 -->
<template>
  <nav>
    <!-- 基础链接 -->
    <RouterLink to="/"> 首页 </RouterLink>
    <RouterLink to="/about"> 关于 </RouterLink>

    <!-- 命名路由 -->
    <RouterLink :to="{ name: 'UserProfile', params: { id: userId } }"> 用户资料 </RouterLink>

    <!-- 带查询参数 -->
    <RouterLink :to="{ path: '/search', query: { q: searchTerm } }"> 搜索结果 </RouterLink>

    <!-- 自定义样式 -->
    <RouterLink to="/products" active-class="active" exact-active-class="exact-active">
      产品列表
    </RouterLink>
  </nav>

  <!-- 路由视图 -->
  <main>
    <RouterView />
  </main>
</template>
```

### 2. 路由信息获取

```vue
<script setup lang="ts">
import { useRoute, useRouter } from '@ldesign/router'
import { computed, watch } from 'vue'

const route = useRoute()
const router = useRouter()

// 获取路由参数
const userId = computed(() => route.params.id)
const searchQuery = computed(() => route.query.q)

// 监听路由变化
watch(
  () => route.params.id,
  (newId, oldId) => {
    console.log(`用户ID从 ${oldId} 变更为 ${newId}`)
    // 重新加载用户数据
    loadUserData(newId)
  }
)

// 监听查询参数变化
watch(
  () => route.query,
  newQuery => {
    console.log('查询参数变化:', newQuery)
  }
)

// 获取路由元信息
const pageTitle = computed(() => route.meta.title)
const requiresAuth = computed(() => route.meta.requiresAuth)
</script>
```

### 3. 导航守卫

```typescript
// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  // 检查认证状态
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
    return
  }

  // 权限检查
  if (to.meta.roles && !hasPermission(to.meta.roles)) {
    next('/403')
    return
  }

  // 加载用户数据
  if (to.name === 'UserProfile') {
    try {
      await loadUserData(to.params.id)
      next()
    } catch (error) {
      next('/404')
    }
  } else {
    next()
  }
})

// 全局解析守卫
router.beforeResolve(async (to, from, next) => {
  // 在导航被确认之前调用
  // 可以进行最后的检查和数据加载
  next()
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 更新页面标题
  document.title = to.meta.title || 'My App'

  // 发送页面浏览统计
  analytics.track('page_view', {
    path: to.path,
    name: to.name,
  })
})

// 路由级守卫
const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    beforeEnter: (to, from, next) => {
      if (!isAdmin()) {
        next('/403')
      } else {
        next()
      }
    },
  },
]
```

### 4. 组件内守卫

```vue
<script setup lang="ts">
import { onBeforeRouteEnter, onBeforeRouteLeave, onBeforeRouteUpdate } from '@ldesign/router'

// 进入路由前
onBeforeRouteEnter((to, from, next) => {
  // 组件实例还未创建，无法访问 this
  console.log('即将进入路由:', to.path)
  next()
})

// 路由更新时
onBeforeRouteUpdate((to, from, next) => {
  // 当前路由改变，但该组件被复用时调用
  console.log('路由更新:', from.path, '->', to.path)
  next()
})

// 离开路由前
onBeforeRouteLeave((to, from, next) => {
  // 检查是否有未保存的更改
  if (hasUnsavedChanges.value) {
    const answer = window.confirm('有未保存的更改，确定要离开吗？')
    if (answer) {
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
})
</script>
```

## 高级功能使用

### 1. 智能预加载

```typescript
// 全局预加载策略
const router = createRouter({
  history: createWebHistory(),
  routes,
  preloadStrategy: 'hover', // 'hover' | 'visible' | 'idle' | 'immediate'
})

// 组件级预加载控制
```

```vue
<template>
  <!-- 悬停预加载 -->
  <RouterLink to="/products" preload="hover"> 产品列表 </RouterLink>

  <!-- 可见时预加载 -->
  <RouterLink to="/about" preload="visible"> 关于我们 </RouterLink>

  <!-- 禁用预加载 -->
  <RouterLink to="/contact" preload="none"> 联系我们 </RouterLink>
</template>
```

```typescript
// 编程式预加载
const router = useRouter()

// 预加载指定路由
router.preloadRoute('/products')
router.preloadRoute({ name: 'UserProfile', params: { id: '123' } })

// 批量预加载
router.preloadRoutes(['/about', '/contact', '/products'])

// 清除预加载缓存
router.clearPreloadCache()
```

### 2. 路由缓存

```typescript
// 全局缓存配置
const router = createRouter({
  history: createWebHistory(),
  routes,
  cache: {
    max: 20, // 最大缓存数量
    ttl: 5 * 60 * 1000, // 缓存时间（5分钟）
    include: [
      // 包含规则
      /^\/user/, // 正则表达式
      'ProductList', // 路由名称
      '/dashboard', // 路径
    ],
    exclude: [
      // 排除规则
      '/login',
      '/register',
      /^\/admin/,
    ],
  },
})

// 路由级缓存控制
const routes = [
  {
    path: '/user/:id',
    component: UserProfile,
    meta: {
      cache: true, // 启用缓存
      cacheTTL: 10 * 60 * 1000, // 自定义缓存时间
    },
  },
  {
    path: '/realtime-data',
    component: RealtimeData,
    meta: {
      cache: false, // 禁用缓存
    },
  },
]
```

```typescript
// 编程式缓存控制
const router = useRouter()

// 获取缓存统计
const cacheStats = router.getCacheStats()
console.log('缓存命中率:', cacheStats.hitRate)
console.log('缓存大小:', cacheStats.size)

// 清除指定路由缓存
router.clearRouteCache('/user/123')

// 清除所有缓存
router.clearRouteCache()
```

### 3. 性能监控

```typescript
// 启用性能监控
const router = createRouter({
  history: createWebHistory(),
  routes,
  performance: true,
})

// 获取性能统计
router.afterEach(() => {
  const stats = router.getPerformanceStats()

  console.log('性能统计:', {
    总导航次数: stats.totalNavigations,
    平均导航时间: stats.averageDuration,
    最快导航: stats.fastestNavigation,
    最慢导航: stats.slowestNavigation,
    成功率: stats.successRate,
  })

  // 发送性能数据到监控服务
  if (stats.averageDuration > 1000) {
    analytics.track('slow_navigation', {
      duration: stats.averageDuration,
      route: router.currentRoute.value.path,
    })
  }
})

// 获取详细性能报告
const detailedReport = router.getDetailedReport()
console.log('性能分解:', detailedReport.breakdown)
console.log('优化建议:', detailedReport.recommendations)
```

### 4. 错误处理

```typescript
// 全局错误处理
router.onError((error, to, from) => {
  console.error('路由错误:', error)

  // 根据错误类型处理
  if (error.type === 'COMPONENT_LOAD_ERROR') {
    // 组件加载失败，显示错误页面
    router.push('/error')
  } else if (error.type === 'NAVIGATION_ABORTED') {
    // 导航被中止，可能是用户取消
    console.log('导航被用户取消')
  }

  // 发送错误报告
  errorReporting.captureException(error, {
    tags: {
      section: 'router',
      route_from: from.path,
      route_to: to.path,
    },
  })
})

// 组件级错误处理
```

```vue
<script setup lang="ts">
import { onErrorCaptured } from 'vue'

// 捕获子组件错误
onErrorCaptured((error, instance, info) => {
  console.error('组件错误:', error)

  // 错误恢复逻辑
  if (error.message.includes('网络错误')) {
    // 显示重试按钮
    showRetryButton.value = true
  }

  // 阻止错误继续传播
  return false
})
</script>
```

## 最佳实践

### 1. 项目结构组织

```
src/
├── router/
│   ├── index.ts           # 主路由配置
│   ├── routes/            # 路由模块
│   │   ├── auth.ts        # 认证相关路由
│   │   ├── admin.ts       # 管理后台路由
│   │   └── public.ts      # 公共路由
│   ├── guards/            # 路由守卫
│   │   ├── auth.ts        # 认证守卫
│   │   ├── permission.ts  # 权限守卫
│   │   └── index.ts       # 守卫汇总
│   └── utils/             # 路由工具
│       ├── meta.ts        # 元信息处理
│       └── cache.ts       # 缓存工具
├── views/                 # 页面组件
├── components/            # 通用组件
└── composables/           # 组合式函数
```

### 2. 类型安全的路由

```typescript
// 定义路由名称类型
type RouteNames = 'Home' | 'About' | 'UserProfile' | 'ProductList' | 'ProductDetail'

// 定义路由参数类型
interface RouteParams {
  UserProfile: { id: string }
  ProductDetail: { id: string; category?: string }
}

// 类型安全的导航函数
function navigateTo<T extends RouteNames>(
  name: T,
  params?: T extends keyof RouteParams ? RouteParams[T] : never
) {
  router.push({ name, params })
}

// 使用
navigateTo('UserProfile', { id: '123' }) // ✅ 正确
navigateTo('UserProfile', { name: 'John' }) // ❌ 类型错误
```

### 3. 性能优化技巧

```typescript
// 1. 路由懒加载
const routes = [
  {
    path: '/heavy-component',
    component: () =>
      import(
        /* webpackChunkName: "heavy-component" */
        '../views/HeavyComponent.vue'
      ),
  },
]

// 2. 预加载关键路由
router.afterEach(to => {
  if (to.name === 'Home') {
    // 在首页预加载常用页面
    router.preloadRoutes(['/about', '/products'])
  }
})

// 3. 智能缓存配置
const router = createRouter({
  cache: {
    max: 50,
    ttl: 10 * 60 * 1000,
    include: [
      /^\/user/, // 用户相关页面
      /^\/product/, // 产品页面
      'Dashboard', // 仪表板
    ],
    exclude: [
      '/realtime', // 实时数据页面
      '/payment', // 支付页面
    ],
  },
})
```

这个使用指南涵盖了从基础配置到高级功能的完整使用方法，帮助开发者充分利用 @ldesign/router 的强大功能
。
