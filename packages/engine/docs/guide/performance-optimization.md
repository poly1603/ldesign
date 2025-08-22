# 性能优化指南

本指南提供了优化 LDesign Engine 应用性能的最佳实践和技巧。

## 性能监控

### 启用性能监控

```typescript
import { createEngine } from '@ldesign/engine'

const engine = createEngine({
  performance: {
    enabled: true,

    // 自动收集指标
    autoCollect: true,

    // 性能预算
    budget: {
      fcp: 1500, // 首次内容绘制 (ms)
      lcp: 2500, // 最大内容绘制 (ms)
      fid: 100, // 首次输入延迟 (ms)
      cls: 0.1, // 累积布局偏移
      memory: 50, // 内存使用限制 (MB)
    },

    // 性能报告
    reporting: {
      enabled: true,
      endpoint: '/api/performance',
      interval: 30000, // 30秒上报一次
    },
  },
})

// 监听性能警告
engine.events.on('performance:budget-exceeded', (metric) => {
  console.warn(`性能预算超标: ${metric.name}`, metric)
})
```

### 性能指标收集

```typescript
// 手动标记性能点
engine.performance.mark('operation-start')
await performHeavyOperation()
engine.performance.mark('operation-end')

// 测量性能
const duration = engine.performance.measure('heavy-operation', 'operation-start', 'operation-end')

console.log(`操作耗时: ${duration}ms`)

// 获取所有性能指标
const metrics = engine.performance.getMetrics()
console.log('性能指标:', metrics)
```

## 应用启动优化

### 延迟加载插件

```typescript
// 只加载关键插件
const engine = createEngine({
  plugins: [
    corePlugin, // 核心功能
    authPlugin, // 认证功能
    // 其他插件延迟加载
  ],
})

// 应用启动后延迟加载非关键插件
setTimeout(() => {
  engine.use(analyticsPlugin)
  engine.use(chatPlugin)
  engine.use(helpPlugin)
}, 1000)

// 或使用 requestIdleCallback
if (window.requestIdleCallback) {
  requestIdleCallback(() => {
    engine.use(nonCriticalPlugin)
  })
}
```

### 异步插件初始化

```typescript
const heavyPlugin = {
  name: 'heavy-plugin',
  install: async (engine) => {
    // 异步初始化，不阻塞应用启动
    setTimeout(async () => {
      const config = await loadHeavyConfig()
      await initializeHeavyFeatures(config)
      engine.events.emit('heavy-plugin:ready')
    }, 0)
  },
}
```

### 状态预热

```typescript
// 预加载关键状态
const engine = createEngine({
  state: {
    initialState: {
      // 只包含关键初始状态
      app: { ready: false },
      user: { isAuthenticated: false },
    },
  },
})

// 异步加载其他状态
async function preloadState() {
  const [userPrefs, appConfig] = await Promise.all([loadUserPreferences(), loadAppConfiguration()])

  engine.state.batch(() => {
    engine.state.set('user.preferences', userPrefs)
    engine.state.set('app.config', appConfig)
    engine.state.set('app.ready', true)
  })
}

preloadState()
```

## 内存优化

### 内存监控

```typescript
// 启用内存监控
const engine = createEngine({
  performance: {
    memoryMonitoring: {
      enabled: true,
      interval: 10000, // 10秒检查一次
      threshold: 50 * 1024 * 1024, // 50MB阈值

      onThresholdExceeded: (memoryInfo) => {
        console.warn('内存使用过高:', memoryInfo)

        // 执行内存清理
        performMemoryCleanup()
      },
    },
  },
})

function performMemoryCleanup() {
  // 清理缓存
  engine.cache.cleanup()

  // 清理状态历史
  engine.state.clearHistory()

  // 清理事件监听器
  engine.events.cleanup()

  // 强制垃圾回收（如果可用）
  if (window.gc) {
    window.gc()
  }
}
```

### 缓存优化

```typescript
// 配置缓存策略
const engine = createEngine({
  cache: {
    // 限制缓存大小
    maxSize: 1000,

    // 使用 LRU 淘汰策略
    evictionPolicy: 'lru',

    // 设置默认过期时间
    defaultTTL: 300000, // 5分钟

    // 启用压缩
    compression: true,

    // 定期清理
    cleanupInterval: 60000, // 1分钟清理一次
  },
})

// 使用缓存命名空间
const apiCache = engine.cache.namespace('api')
const userCache = engine.cache.namespace('user')

// 设置不同的缓存策略
apiCache.setStrategy({
  maxSize: 500,
  defaultTTL: 180000, // 3分钟
})

userCache.setStrategy({
  maxSize: 100,
  defaultTTL: 600000, // 10分钟
})
```

### 状态优化

```typescript
// 状态分片
const engine = createEngine({
  state: {
    // 启用状态分片
    sharding: {
      enabled: true,
      shardSize: 1000, // 每个分片最多1000个状态项
    },

    // 限制历史记录
    history: {
      enabled: true,
      maxSize: 50, // 最多保留50个历史记录
    },
  },
})

// 及时清理不需要的状态
function cleanupUserSession() {
  engine.state.remove('user.temporaryData')
  engine.state.remove('ui.tempState')
  engine.state.clearNamespace('temp')
}

// 使用状态懒加载
const lazyState = {
  get userPosts() {
    if (!this._userPosts) {
      this._userPosts = engine.state.get('user.posts') || []
    }
    return this._userPosts
  },
}
```

## 事件系统优化

### 事件性能优化

```typescript
// 使用事件命名空间
engine.events.on('user:*', handler) // 监听所有用户事件

// 事件节流
const throttledHandler = engine.utils.throttle(handler, 100)
engine.events.on('scroll', throttledHandler)

// 事件防抖
const debouncedHandler = engine.utils.debounce(handler, 300)
engine.events.on('input', debouncedHandler)

// 事件批处理
engine.events
  .batch('analytics', {
    size: 10, // 批量大小
    timeout: 1000, // 超时时间
  })
  .on((events) => {
    // 批量处理事件
    sendAnalyticsBatch(events)
  })
```

### 事件监听器管理

```typescript
class ComponentEventManager {
  private unsubscribers: Array<() => void> = []

  constructor(private engine: Engine) {}

  // 添加监听器
  on(event: string, handler: Function) {
    const unsubscribe = this.engine.events.on(event, handler)
    this.unsubscribers.push(unsubscribe)
    return unsubscribe
  }

  // 清理所有监听器
  cleanup() {
    this.unsubscribers.forEach(unsub => unsub())
    this.unsubscribers = []
  }
}

// 在组件中使用
export default {
  setup() {
    const engine = useEngine()
    const eventManager = new ComponentEventManager(engine)

    eventManager.on('user:login', handleLogin)
    eventManager.on('data:update', handleDataUpdate)

    onUnmounted(() => {
      eventManager.cleanup()
    })
  },
}
```

## 网络优化

### API 请求优化

```typescript
// 请求缓存
const apiCache = engine.cache.namespace('api')

async function fetchUserData(userId: string) {
  const cacheKey = `user:${userId}`

  // 检查缓存
  const cached = apiCache.get(cacheKey)
  if (cached) {
    return cached
  }

  // 发起请求
  const userData = await api.getUser(userId)

  // 缓存结果
  apiCache.set(cacheKey, userData, 300000) // 5分钟

  return userData
}

// 请求去重
const pendingRequests = new Map()

async function fetchWithDeduplication(url: string) {
  if (pendingRequests.has(url)) {
    return pendingRequests.get(url)
  }

  const promise = fetch(url).then(r => r.json())
  pendingRequests.set(url, promise)

  try {
    const result = await promise
    return result
  }
  finally {
    pendingRequests.delete(url)
  }
}
```

### 资源预加载

```typescript
// 预加载关键资源
function preloadCriticalResources() {
  const criticalUrls = ['/api/user/profile', '/api/app/config', '/api/menu/items']

  criticalUrls.forEach((url) => {
    fetch(url)
      .then((response) => {
        if (response.ok) {
          return response.json()
        }
      })
      .then((data) => {
        // 预缓存数据
        const cacheKey = url.replace('/api/', '')
        engine.cache.set(cacheKey, data, 600000) // 10分钟
      })
      .catch((error) => {
        console.warn('预加载失败:', url, error)
      })
  })
}

// 在应用启动后预加载
engine.events.once('app:ready', preloadCriticalResources)
```

## 渲染优化

### 虚拟滚动

```typescript
// 大列表虚拟滚动
const VirtualList = {
  props: {
    items: Array,
    itemHeight: Number,
    containerHeight: Number,
  },

  setup(props) {
    const scrollTop = ref(0)

    const visibleItems = computed(() => {
      const start = Math.floor(scrollTop.value / props.itemHeight)
      const end = Math.min(
        start + Math.ceil(props.containerHeight / props.itemHeight) + 1,
        props.items.length
      )

      return props.items.slice(start, end).map((item, index) => ({
        ...item,
        index: start + index,
      }))
    })

    return { visibleItems, scrollTop }
  },
}
```

### 组件懒加载

```typescript
// 路由级别的懒加载
const routes = [
  {
    path: '/dashboard',
    component: () => import('./views/Dashboard.vue'),
  },
  {
    path: '/profile',
    component: () => import('./views/Profile.vue'),
  },
]

// 组件级别的懒加载
const LazyComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000,
})
```

## 构建优化

### 代码分割

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将第三方库分离
          vendor: ['vue', 'vue-router'],

          // 将 LDesign Engine 分离
          engine: ['@ldesign/engine'],

          // 将大型组件分离
          charts: ['echarts', 'chart.js'],
        },
      },
    },
  },
})
```

### Tree Shaking

```typescript
// 按需导入
import { createEngine } from '@ldesign/engine/core'
import { eventsPlugin } from '@ldesign/engine/events'
import { statePlugin } from '@ldesign/engine/state'

// 而不是
// import { createEngine, statePlugin, eventsPlugin } from '@ldesign/engine'

const engine = createEngine({
  plugins: [statePlugin, eventsPlugin],
})
```

## 性能监控和分析

### 性能指标收集

```typescript
// 自定义性能指标
class PerformanceTracker {
  private metrics = new Map()

  startTiming(name: string) {
    this.metrics.set(name, performance.now())
  }

  endTiming(name: string) {
    const start = this.metrics.get(name)
    if (start) {
      const duration = performance.now() - start
      engine.events.emit('performance:metric', {
        name,
        duration,
        timestamp: Date.now(),
      })
      this.metrics.delete(name)
      return duration
    }
  }
}

const tracker = new PerformanceTracker()

// 使用示例
tracker.startTiming('data-load')
await loadData()
const duration = tracker.endTiming('data-load')
```

### 性能报告

```typescript
// 生成性能报告
function generatePerformanceReport() {
  const report = {
    timestamp: Date.now(),
    metrics: engine.performance.getMetrics(),
    memory: engine.performance.getMemoryInfo(),
    cache: engine.cache.getStats(),
    events: engine.events.getStats(),
    plugins: engine.plugins.getStats(),
  }

  // 发送到分析服务
  sendToAnalytics(report)

  return report
}

// 定期生成报告
setInterval(generatePerformanceReport, 60000) // 每分钟
```

## 性能优化检查清单

### 应用启动

- [ ] 延迟加载非关键插件
- [ ] 使用异步插件初始化
- [ ] 预加载关键状态和资源
- [ ] 启用代码分割

### 内存管理

- [ ] 配置合理的缓存大小
- [ ] 及时清理事件监听器
- [ ] 限制状态历史记录
- [ ] 监控内存使用情况

### 网络优化

- [ ] 启用请求缓存
- [ ] 实现请求去重
- [ ] 预加载关键资源
- [ ] 使用 CDN 加速

### 渲染优化

- [ ] 使用虚拟滚动处理大列表
- [ ] 实现组件懒加载
- [ ] 避免不必要的重渲染
- [ ] 优化动画性能

### 监控和分析

- [ ] 启用性能监控
- [ ] 设置性能预算
- [ ] 收集关键指标
- [ ] 定期生成性能报告

通过遵循这些优化实践，你可以显著提升 LDesign Engine 应用的性能表现。
