# 智能缓存

LDesign Router 的智能缓存系统是其核心创新功能之一，采用 LRU + TTL 混合策略，可以显著提升应用性能，减
少重复加载。

## 🎯 缓存概述

### 什么是路由缓存？

路由缓存是指将已加载的路由组件和相关数据保存在内存中，当用户再次访问相同路由时，直接从缓存中获取，避
免重复加载和渲染。

### 缓存优势

- **⚡ 极速访问** - 缓存命中时，页面几乎瞬间显示
- **💾 减少请求** - 避免重复的网络请求和数据加载
- **🔋 节省资源** - 减少 CPU 和内存的重复消耗
- **🌐 离线支持** - 缓存的页面可以在网络不佳时正常显示

## 🚀 基础配置

### 启用缓存

在创建路由器时启用缓存功能：

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHistory(),
  routes,

  // 启用智能缓存
  cache: {
    max: 20, // 最大缓存数量
    ttl: 5 * 60 * 1000, // 5分钟过期时间
    include: [
      // 包含规则
      'Home', // 路由名称
      /^User/, // 正则匹配
      '/products', // 路径匹配
    ],
    exclude: [
      // 排除规则
      '/login', // 登录页面
      'RealTimeData', // 实时数据页面
    ],
  },
})
```

### 缓存配置选项

| 选项      | 类型                   | 默认值          | 说明                 |
| --------- | ---------------------- | --------------- | -------------------- |
| `max`     | `number`               | `10`            | 最大缓存数量         |
| `ttl`     | `number`               | `5 * 60 * 1000` | 缓存过期时间（毫秒） |
| `include` | `(string \| RegExp)[]` | `[]`            | 包含规则             |
| `exclude` | `(string \| RegExp)[]` | `[]`            | 排除规则             |

## 🎨 缓存策略

### LRU 算法

LRU (Least Recently Used) 算法确保最近使用的页面保留在缓存中：

```typescript
// 缓存访问顺序示例
// 访问顺序: A -> B -> C -> A -> D
// 缓存状态: [D, A, C, B] (最新访问的在前)
// 当缓存满时，B 会被淘汰
```

### TTL 机制

TTL (Time To Live) 机制确保缓存数据的新鲜度：

```typescript
const router = createRouter({
  cache: {
    ttl: 10 * 60 * 1000, // 10分钟后过期
    // 过期的缓存会被自动清除
  },
})
```

### 混合策略

LDesign Router 结合了 LRU 和 TTL 两种策略：

1. **空间限制** - LRU 算法控制缓存数量
2. **时间限制** - TTL 机制控制缓存时效
3. **智能清理** - 自动清除过期和最少使用的缓存

## 🔧 缓存规则

### 包含规则

指定哪些路由应该被缓存：

```typescript
const router = createRouter({
  cache: {
    include: [
      // 路由名称匹配
      'Home',
      'ProductList',
      'UserProfile',

      // 正则表达式匹配
      /^Admin/, // 所有以 Admin 开头的路由
      /User\w+/, // 所有 User 开头的路由

      // 路径匹配
      '/dashboard',
      '/products',
      '/user/:id',
    ],
  },
})
```

### 排除规则

指定哪些路由不应该被缓存：

```typescript
const router = createRouter({
  cache: {
    exclude: [
      // 实时数据页面
      '/realtime-data',
      '/live-chat',

      // 敏感页面
      '/payment',
      '/login',
      '/register',

      // 正则匹配
      /^\/api/, // API 路由
      /\?.*nocache/, // 包含 nocache 参数的路由
    ],
  },
})
```

### 路由级缓存控制

在路由配置中控制缓存行为：

```typescript
const routes = [
  {
    path: '/user/:id',
    component: UserProfile,
    meta: {
      cache: true, // 启用缓存
      cacheTTL: 10 * 60 * 1000, // 自定义过期时间
      cacheKey: 'user-profile', // 自定义缓存键
    },
  },
  {
    path: '/realtime-data',
    component: RealTimeData,
    meta: {
      cache: false, // 禁用缓存
    },
  },
]
```

## 📊 缓存管理

### 获取缓存统计

```typescript
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 获取缓存统计信息
const cacheStats = router.getCacheStats()

console.log('缓存统计:', {
  size: cacheStats.size, // 当前缓存数量
  maxSize: cacheStats.maxSize, // 最大缓存数量
  hitRate: cacheStats.hitRate, // 命中率
  totalHits: cacheStats.totalHits, // 总命中次数
  totalMisses: cacheStats.totalMisses, // 总未命中次数
})
```

### 手动清除缓存

```typescript
const router = useRouter()

// 清除所有缓存
router.clearRouteCache()

// 清除指定路由的缓存
router.clearRouteCache('/user/123')
router.clearRouteCache('UserProfile')

// 清除匹配模式的缓存
router.clearRouteCache(/^\/user/)
```

### 缓存预热

```typescript
// 预热重要页面的缓存
async function preloadImportantPages() {
  const importantRoutes = ['/dashboard', '/user/profile', '/products']

  for (const route of importantRoutes) {
    await router.preloadRoute(route)
  }
}

// 在应用启动后预热
onMounted(() => {
  setTimeout(preloadImportantPages, 2000)
})
```

## 🎯 实际应用

### 电商应用缓存策略

```typescript
const router = createRouter({
  routes,
  cache: {
    max: 30,
    ttl: 15 * 60 * 1000, // 15分钟
    include: [
      // 缓存商品相关页面
      'ProductList',
      'ProductDetail',
      'CategoryList',

      // 缓存用户页面
      /^User/,

      // 缓存静态页面
      '/about',
      '/help',
      '/terms',
    ],
    exclude: [
      // 不缓存实时数据
      '/cart',
      '/checkout',
      '/payment',

      // 不缓存个人敏感信息
      '/orders',
      '/wallet',
    ],
  },
})
```

### 管理后台缓存策略

```typescript
const router = createRouter({
  routes,
  cache: {
    max: 15,
    ttl: 10 * 60 * 1000, // 10分钟
    include: [
      // 缓存列表页面
      'UserList',
      'ProductList',
      'OrderList',

      // 缓存仪表板
      'Dashboard',
      'Analytics',
    ],
    exclude: [
      // 不缓存编辑页面
      /Edit$/,
      /Create$/,

      // 不缓存实时监控
      '/monitor',
      '/logs',
    ],
  },
})
```

### 内容管理系统

```typescript
const router = createRouter({
  routes,
  cache: {
    max: 50,
    ttl: 30 * 60 * 1000, // 30分钟
    include: [
      // 缓存文章页面
      /^\/article/,

      // 缓存分类页面
      /^\/category/,

      // 缓存标签页面
      /^\/tag/,
    ],
    exclude: [
      // 不缓存编辑器
      '/editor',
      '/admin',
    ],
  },
})
```

## 🔍 缓存监控

### 性能监控

```typescript
// 监控缓存性能
router.afterEach((to, from) => {
  const stats = router.getCacheStats()

  // 记录缓存命中率
  if (stats.hitRate < 0.7) {
    console.warn('缓存命中率较低:', stats.hitRate)
  }

  // 发送统计数据
  analytics.track('cache_performance', {
    hitRate: stats.hitRate,
    cacheSize: stats.size,
    route: to.path,
  })
})
```

### 缓存事件监听

```typescript
// 监听缓存事件
router.onCacheHit((route, cacheKey) => {
  console.log('缓存命中:', route.path)
})

router.onCacheMiss((route, reason) => {
  console.log('缓存未命中:', route.path, reason)
})

router.onCacheEvict((cacheKey, reason) => {
  console.log('缓存被清除:', cacheKey, reason)
})
```

## 🎨 高级技巧

### 动态缓存配置

```typescript
// 根据用户类型动态调整缓存策略
function setupCacheForUser(userType: string) {
  let cacheConfig

  switch (userType) {
    case 'premium':
      cacheConfig = {
        max: 50,
        ttl: 30 * 60 * 1000, // 30分钟
        include: [/.*/], // 缓存所有页面
      }
      break

    case 'regular':
      cacheConfig = {
        max: 20,
        ttl: 15 * 60 * 1000, // 15分钟
        include: [/^\/public/], // 只缓存公共页面
      }
      break

    default:
      cacheConfig = {
        max: 10,
        ttl: 5 * 60 * 1000, // 5分钟
        include: ['/'], // 只缓存首页
      }
  }

  router.updateCacheConfig(cacheConfig)
}
```

### 条件缓存

```typescript
// 根据条件决定是否缓存
function conditionalCache(route: RouteLocation): boolean {
  // 移动端减少缓存
  if (isMobile()) {
    return route.meta.mobileCacheEnabled === true
  }

  // 网络较慢时增加缓存
  if (isSlowNetwork()) {
    return route.meta.cache !== false
  }

  // 内存不足时禁用缓存
  if (isLowMemory()) {
    return false
  }

  return route.meta.cache === true
}

router.setCacheCondition(conditionalCache)
```

### 缓存优先级

```typescript
// 设置缓存优先级
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    meta: {
      cache: true,
      cachePriority: 'high', // 高优先级，不易被清除
    },
  },
  {
    path: '/temp-page',
    component: TempPage,
    meta: {
      cache: true,
      cachePriority: 'low', // 低优先级，优先清除
    },
  },
]
```

## 🎯 最佳实践

### 1. 合理设置缓存大小

```typescript
// ✅ 推荐：根据应用规模设置
const router = createRouter({
  cache: {
    max: 20, // 中型应用推荐 15-25
    ttl: 10 * 60 * 1000, // 根据数据更新频率调整
  },
})

// ❌ 避免：缓存过大或过小
const router = createRouter({
  cache: {
    max: 100, // 过大，可能导致内存问题
    max: 3, // 过小，缓存效果不明显
  },
})
```

### 2. 精确的缓存规则

```typescript
// ✅ 推荐：精确的包含/排除规则
cache: {
  include: [
    'ProductList',    // 具体的路由名称
    /^User(?!Edit)/   // 精确的正则表达式
  ],
  exclude: [
    '/payment',       // 明确排除敏感页面
    /\/edit$/         // 排除编辑页面
  ]
}
```

### 3. 监控和调优

```typescript
// ✅ 推荐：定期监控缓存性能
setInterval(() => {
  const stats = router.getCacheStats()

  if (stats.hitRate < 0.6) {
    console.warn('缓存命中率过低，需要调整策略')
  }

  if (stats.size === stats.maxSize) {
    console.info('缓存已满，考虑增加缓存大小')
  }
}, 60000) // 每分钟检查一次
```

通过合理配置和使用智能缓存，你的应用可以获得显著的性能提升。LDesign Router 的缓存系统让这一切变得简
单而高效。
