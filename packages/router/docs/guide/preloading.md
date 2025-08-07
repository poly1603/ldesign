# 路由预加载

路由预加载是 LDesign Router 的一个强大功能，它可以在用户实际访问页面之前就开始加载组件，从而显著提升
用户体验。

## 什么是路由预加载？

路由预加载是指在用户可能访问某个路由之前，提前加载该路由的组件和资源。这样当用户真正导航到该路由时，
页面可以立即显示，无需等待加载时间。

## 预加载策略

LDesign Router 提供了多种预加载策略：

### 1. `none` - 不预加载

```typescript
const router = createRouter({
  // ...
  preloadStrategy: 'none',
})
```

这是最保守的策略，不会进行任何预加载。适合带宽有限或对性能要求不高的场景。

### 2. `immediate` - 立即预加载

```typescript
const router = createRouter({
  // ...
  preloadStrategy: 'immediate',
})
```

应用启动后立即预加载所有路由组件。适合小型应用或网络条件良好的环境。

### 3. `visible` - 可见时预加载

```typescript
const router = createRouter({
  // ...
  preloadStrategy: 'visible',
})
```

当路由链接进入视口时开始预加载。这是推荐的默认策略，平衡了性能和用户体验。

### 4. `hover` - 悬停时预加载

```typescript
const router = createRouter({
  // ...
  preloadStrategy: 'hover',
})
```

当用户悬停在路由链接上时开始预加载。适合桌面应用，可以在用户点击前的短暂时间内完成加载。

## 路由级别的预加载配置

你可以为每个路由单独配置预加载策略：

```typescript
const routes = [
  {
    path: '/',
    component: () => import('./Home.vue'),
    meta: {
      preload: 'immediate', // 首页立即预加载
    },
  },
  {
    path: '/dashboard',
    component: () => import('./Dashboard.vue'),
    meta: {
      preload: 'visible', // 仪表盘可见时预加载
    },
  },
  {
    path: '/settings',
    component: () => import('./Settings.vue'),
    meta: {
      preload: 'hover', // 设置页悬停时预加载
    },
  },
  {
    path: '/admin',
    component: () => import('./Admin.vue'),
    meta: {
      preload: 'none', // 管理页面不预加载
    },
  },
]
```

## 手动预加载

你也可以通过编程方式手动预加载路由：

```typescript
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 预加载特定路由
const preloadRoute = async (routeName: string) => {
  const route = router.getRoutes().find(r => r.name === routeName)
  if (route) {
    await router.preloadRoute(route)
    console.log(`路由 ${routeName} 预加载完成`)
  }
}

// 预加载多个路由
const preloadCriticalRoutes = async () => {
  const criticalRoutes = ['Home', 'Dashboard', 'Profile']
  await Promise.all(criticalRoutes.map(name => preloadRoute(name)))
  console.log('关键路由预加载完成')
}
```

## 预加载与 RouterLink

RouterLink 组件会根据配置的预加载策略自动处理预加载：

```vue
<template>
  <!-- 这些链接会根据全局策略进行预加载 -->
  <router-link to="/dashboard">仪表盘</router-link>
  <router-link to="/profile">个人资料</router-link>

  <!-- 强制预加载 -->
  <router-link to="/settings" :preload="true">设置</router-link>

  <!-- 禁用预加载 -->
  <router-link to="/admin" :preload="false">管理</router-link>
</template>
```

## 预加载缓存管理

预加载的组件会被缓存，你可以管理这些缓存：

```typescript
// 清除所有预加载缓存
router.clearPreloadCache()

// 清除特定路由的预加载缓存
router.clearPreloadCache('Dashboard')

// 检查预加载状态
const isPreloaded = router.isRoutePreloaded('Dashboard')
```

## 最佳实践

### 1. 选择合适的策略

- **小型应用**：使用 `immediate` 策略
- **中型应用**：使用 `visible` 策略
- **大型应用**：使用 `hover` 策略，并为关键路由设置 `immediate`

### 2. 优先级设置

为不同重要性的路由设置不同的预加载策略：

```typescript
const routes = [
  // 高优先级 - 立即预加载
  { path: '/', meta: { preload: 'immediate', priority: 1 } },
  { path: '/dashboard', meta: { preload: 'immediate', priority: 1 } },

  // 中优先级 - 可见时预加载
  { path: '/products', meta: { preload: 'visible', priority: 2 } },
  { path: '/orders', meta: { preload: 'visible', priority: 2 } },

  // 低优先级 - 悬停时预加载
  { path: '/settings', meta: { preload: 'hover', priority: 3 } },
  { path: '/help', meta: { preload: 'hover', priority: 3 } },
]
```

### 3. 监控预加载效果

```typescript
// 监听预加载事件
router.onPreloadStart(route => {
  console.log(`开始预加载: ${route.name}`)
})

router.onPreloadComplete(route => {
  console.log(`预加载完成: ${route.name}`)
})

router.onPreloadError((route, error) => {
  console.error(`预加载失败: ${route.name}`, error)
})
```

### 4. 网络感知预加载

根据网络状况调整预加载策略：

```typescript
// 检测网络状况
const connection = (navigator as any).connection
if (connection) {
  const { effectiveType, saveData } = connection

  let strategy = 'visible'

  if (saveData) {
    strategy = 'none' // 节省流量模式
  } else if (effectiveType === '4g') {
    strategy = 'immediate' // 4G 网络
  } else if (effectiveType === '3g') {
    strategy = 'hover' // 3G 网络
  }

  router.setPreloadStrategy(strategy)
}
```

## 性能考虑

### 内存使用

预加载会增加内存使用，特别是在 `immediate` 策略下。监控内存使用情况：

```typescript
// 获取预加载统计
const stats = router.getPreloadStats()
console.log('预加载统计:', {
  totalPreloaded: stats.totalPreloaded,
  memoryUsage: stats.memoryUsage,
  cacheHitRate: stats.cacheHitRate,
})
```

### 网络带宽

在带宽有限的环境中，谨慎使用预加载：

```typescript
// 根据网络速度调整
const adjustPreloadStrategy = () => {
  const connection = (navigator as any).connection
  if (connection && connection.downlink < 1) {
    // 网速较慢时禁用预加载
    router.setPreloadStrategy('none')
  }
}
```

## 故障排除

### 预加载失败

```typescript
router.onPreloadError((route, error) => {
  // 记录错误
  console.error(`路由 ${route.name} 预加载失败:`, error)

  // 可以选择重试
  setTimeout(() => {
    router.preloadRoute(route)
  }, 5000)
})
```

### 调试预加载

```typescript
// 开启预加载调试
router.enablePreloadDebug()

// 查看预加载日志
router.getPreloadLogs().forEach(log => {
  console.log(`${log.timestamp}: ${log.message}`)
})
```

路由预加载是提升用户体验的重要工具，合理使用可以让你的应用感觉更加流畅和响应迅速。
