# @ldesign/router 性能优化最佳实践

## 📖 目录

1. [路由懒加载](#路由懒加载)
2. [缓存策略](#缓存策略)
3. [预加载优化](#预加载优化)
4. [导航性能](#导航性能)
5. [内存优化](#内存优化)
6. [组件优化](#组件优化)
7. [监控和调试](#监控和调试)

---

## 🚀 路由懒加载

### 基础懒加载

使用动态导入实现组件懒加载，减少初始包体积：

```typescript
const routes = [
  {
    path: '/dashboard',
    // ✅ 推荐：使用动态导入
    component: () => import('./views/Dashboard.vue'),
  },
  {
    path: '/profile',
    // ❌ 不推荐：同步导入
    component: ProfileView,
  }
]
```

### 分块加载（Chunk Splitting）

使用 Vite/Webpack 的魔法注释控制代码分块：

```typescript
const routes = [
  {
    path: '/admin',
    component: () => import(
      /* webpackChunkName: "admin" */
      /* viteChunkName: "admin" */
      './views/Admin.vue'
    ),
    children: [
      {
        path: 'users',
        component: () => import(
          /* webpackChunkName: "admin" */
          './views/admin/Users.vue'
        ),
      }
    ]
  }
]
```

### 路由级代码分割

根据业务模块分割代码：

```typescript
// 按功能模块分组
const routes = [
  {
    path: '/user',
    component: () => import(
      /* webpackChunkName: "user" */
      './layouts/UserLayout.vue'
    ),
    children: [
      {
        path: 'profile',
        component: () => import(
          /* webpackChunkName: "user" */
          './views/user/Profile.vue'
        ),
      },
      {
        path: 'settings',
        component: () => import(
          /* webpackChunkName: "user" */
          './views/user/Settings.vue'
        ),
      }
    ]
  },
  {
    path: '/product',
    component: () => import(
      /* webpackChunkName: "product" */
      './layouts/ProductLayout.vue'
    ),
    children: [
      // 产品相关路由...
    ]
  }
]
```

---

## 💾 缓存策略

### LRU 缓存配置

根据应用规模调整缓存大小：

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'

// 小型应用（<50个路由）
const router = createRouter({
  history: createWebHistory(),
  routes,
  cache: {
    enabled: true,
    strategy: 'memory',
    maxSize: 20, // 缓存20个路由
  }
})

// 中型应用（50-200个路由）
const router = createRouter({
  history: createWebHistory(),
  routes,
  cache: {
    enabled: true,
    strategy: 'memory',
    maxSize: 50, // 缓存50个路由
  }
})

// 大型应用（>200个路由）
const router = createRouter({
  history: createWebHistory(),
  routes,
  cache: {
    enabled: true,
    strategy: 'memory',
    maxSize: 100, // 缓存100个路由
    // 启用智能缓存
    adaptive: true, // 根据命中率自动调整
  }
})
```

### 组件缓存

使用 `keep-alive` 缓存组件实例：

```vue
<template>
  <RouterView>
    <template #default="{ Component, route }">
      <keep-alive :max="10">
        <component
          :is="Component"
          :key="route.fullPath"
          v-if="route.meta.keepAlive"
        />
      </keep-alive>
      <component
        :is="Component"
        :key="route.fullPath"
        v-else
      />
    </template>
  </RouterView>
</template>

<script setup lang="ts">
// 路由配置
const routes = [
  {
    path: '/list',
    component: () => import('./views/List.vue'),
    meta: {
      keepAlive: true, // 启用缓存
    }
  },
  {
    path: '/detail/:id',
    component: () => import('./views/Detail.vue'),
    meta: {
      keepAlive: false, // 不缓存
    }
  }
]
</script>
```

### 路由元信息缓存

为常访问的路由设置缓存策略：

```typescript
const routes = [
  {
    path: '/dashboard',
    component: () => import('./views/Dashboard.vue'),
    meta: {
      cache: {
        enabled: true,
        ttl: 5 * 60 * 1000, // 5分钟
        priority: 'high', // 高优先级
      }
    }
  },
  {
    path: '/reports/:id',
    component: () => import('./views/Report.vue'),
    meta: {
      cache: {
        enabled: true,
        ttl: 10 * 60 * 1000, // 10分钟
        priority: 'normal',
      }
    }
  }
]
```

---

## ⚡ 预加载优化

### Hover 预加载

鼠标悬停时预加载目标路由：

```vue
<template>
  <RouterLink
    to="/dashboard"
    preload="hover"
    :preload-delay="200"
  >
    Dashboard
  </RouterLink>
</template>
```

### Visibility 预加载

当链接进入视口时预加载：

```vue
<template>
  <RouterLink
    to="/reports"
    preload="visibility"
    :preload-threshold="0.5"
  >
    Reports
  </RouterLink>
</template>
```

### Idle 预加载

浏览器空闲时预加载：

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHistory(),
  routes,
  preload: {
    enabled: true,
    strategy: 'idle',
    // 预加载相关路由
    autoPreloadRelated: true,
    // 最大并发数
    maxConcurrent: 3,
  }
})
```

### 智能预加载

根据用户行为模式预加载：

```typescript
import { SmartPreloader } from '@ldesign/router'

const preloader = new SmartPreloader({
  // 基于历史记录预测
  useBehaviorPrediction: true,
  // 预加载权重
  weights: {
    frequency: 0.4, // 访问频率权重
    recency: 0.3,   // 最近访问权重
    relationship: 0.3, // 路由关系权重
  }
})

router.beforeEach((to, from, next) => {
  preloader.learn(from, to) // 学习导航模式
  preloader.preloadPredicted() // 预加载预测路由
  next()
})
```

---

## 🏃 导航性能

### 导航节流

防止过快的连续导航：

```typescript
import { createNavigationOptimizer } from '@ldesign/router'

const optimizer = createNavigationOptimizer({
  throttle: {
    minInterval: 50, // 最小导航间隔50ms
    logThrottled: true, // 记录被节流的导航
  }
})

router.beforeEach((to, from, next) => {
  if (!optimizer.throttler.shouldNavigate(to.path)) {
    return // 跳过被节流的导航
  }
  next()
})
```

### 守卫优化

并行执行独立的守卫：

```typescript
import { ParallelGuardExecutor } from '@ldesign/router'

const guardExecutor = new ParallelGuardExecutor()

// 独立的守卫可以并行执行
const independentGuards = [
  checkAuthentication,
  checkPermissions,
  logAnalytics,
]

router.beforeEach(async (to, from, next) => {
  const result = await guardExecutor.executeInParallel(
    independentGuards.map(guard => () => guard(to, from))
  )
  
  next(result === true ? undefined : result)
})
```

### 导航超时处理

避免导航卡死：

```typescript
import { withTimeout } from '@ldesign/router'

router.beforeEach(async (to, from, next) => {
  try {
    await withTimeout(
      async () => {
        // 执行异步守卫逻辑
        await checkPermissions(to)
        await loadUserData(to)
      },
      5000 // 5秒超时
    )
    next()
  } catch (error) {
    console.error('Navigation timeout:', error)
    next(false)
  }
})
```

---

## 💾 内存优化

### 自动内存管理

启用自动内存清理：

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHistory(),
  routes,
  memory: {
    // 启用自动内存管理
    autoManagement: true,
    // 内存阈值
    thresholds: {
      warning: 30, // 30MB 警告
      critical: 60, // 60MB 严重
    },
    // 清理策略
    cleanupStrategy: 'moderate',
  }
})
```

### 组件卸载清理

在组件卸载时清理资源：

```vue
<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 清理定时器
const timers: number[] = []

onBeforeUnmount(() => {
  // 清理定时器
  timers.forEach(timer => clearTimeout(timer))
  timers.length = 0
  
  // 清理事件监听器
  window.removeEventListener('resize', handleResize)
  
  // 取消pending的请求
  abortController.abort()
})
</script>
```

### 限制缓存项数量

```typescript
const router = createRouter({
  history: createWebHistory(),
  routes,
  cache: {
    enabled: true,
    maxSize: 50, // 最多缓存50个路由
    // 缓存淘汰策略
    evictionPolicy: 'lru', // LRU 策略
  }
})
```

---

## 🎨 组件优化

### 异步组件

使用异步组件优化加载：

```typescript
import { defineAsyncComponent } from 'vue'

const routes = [
  {
    path: '/heavy-component',
    component: defineAsyncComponent({
      loader: () => import('./views/HeavyComponent.vue'),
      // 加载时显示
      loadingComponent: LoadingSpinner,
      // 加载失败显示
      errorComponent: ErrorView,
      // 延迟显示加载组件
      delay: 200,
      // 超时时间
      timeout: 10000,
      // 重试次数
      onError(error, retry, fail, attempts) {
        if (attempts <= 3) {
          retry()
        } else {
          fail()
        }
      }
    })
  }
]
```

### 虚拟滚动

对长列表使用虚拟滚动：

```vue
<template>
  <VirtualList
    :items="items"
    :item-height="50"
    :buffer="10"
  >
    <template #default="{ item }">
      <ListItem :data="item" />
    </template>
  </VirtualList>
</template>
```

### 图片懒加载

```vue
<template>
  <img
    v-lazy="imageUrl"
    alt="Description"
    loading="lazy"
  />
</template>
```

---

## 📊 监控和调试

### 性能监控

使用内置性能监控：

```typescript
import {
  createPerformancePlugin,
  NavigationPerformanceMonitor
} from '@ldesign/router'

const perfMonitor = new NavigationPerformanceMonitor({
  slowNavigationThreshold: 500, // 慢导航阈值
  onSlowNavigation: (metrics) => {
    console.warn('慢导航检测:', metrics)
    // 上报到监控系统
    reportToMonitoring(metrics)
  }
})

router.use(createPerformancePlugin({
  monitor: perfMonitor,
  trackNavigation: true,
  trackComponentLoad: true,
}))

// 获取性能统计
const stats = perfMonitor.getStats()
console.log('导航性能:', stats)
```

### 开发工具

使用开发工具调试：

```typescript
import { createDevTools } from '@ldesign/router/debug'

if (process.env.NODE_ENV === 'development') {
  const devTools = createDevTools(router)
  
  // 启用路由调试
  devTools.enable()
  
  // 查看路由信息
  devTools.inspect()
  
  // 性能分析
  devTools.analyzePerformance()
}
```

### 性能预算

设置性能预算并监控：

```typescript
const perfBudget = {
  // 路由匹配时间预算
  matchTime: 1, // 1ms
  // 导航完成时间预算
  navigationTime: 100, // 100ms
  // 组件加载时间预算
  componentLoadTime: 500, // 500ms
  // 内存使用预算
  memoryUsage: 50 * 1024 * 1024, // 50MB
}

router.afterEach((to, from) => {
  const metrics = router.getPerformanceMetrics()
  
  if (metrics.navigationTime > perfBudget.navigationTime) {
    console.warn(
      `导航时间超出预算: ${metrics.navigationTime}ms > ${perfBudget.navigationTime}ms`
    )
  }
})
```

---

## 🎯 性能检查清单

在生产部署前检查以下项目：

### ✅ 代码分割
- [ ] 使用路由懒加载
- [ ] 合理划分代码块
- [ ] 避免过大的 chunk

### ✅ 缓存策略
- [ ] 启用路由匹配缓存
- [ ] 配置组件缓存
- [ ] 设置合理的缓存大小

### ✅ 预加载
- [ ] 配置预加载策略
- [ ] 启用智能预加载
- [ ] 避免过度预加载

### ✅ 导航优化
- [ ] 启用导航节流
- [ ] 优化守卫执行
- [ ] 设置导航超时

### ✅ 内存管理
- [ ] 启用自动内存管理
- [ ] 清理组件资源
- [ ] 限制缓存大小

### ✅ 监控
- [ ] 启用性能监控
- [ ] 设置性能预算
- [ ] 集成监控系统

---

## 📈 性能指标参考

| 指标 | 优秀 | 良好 | 需要改进 |
|------|------|------|----------|
| 路由匹配时间 | < 0.3ms | < 1ms | > 1ms |
| 导航完成时间 | < 35ms | < 100ms | > 100ms |
| 组件加载时间 | < 200ms | < 500ms | > 500ms |
| 缓存命中率 | > 85% | > 70% | < 70% |
| 内存占用 | < 40MB | < 60MB | > 60MB |
| 首次加载大小 | < 18KB | < 25KB | > 25KB |

---

## 🔗 相关资源

- [性能优化方案](../OPTIMIZATION_PLAN.md)
- [API 文档](../README.md#api-文档)
- [示例项目](../examples/)
- [性能测试报告](../benchmarks/)

---

*最后更新：2025-10-10*
