# LDesign 关键路径优化方案

## 关键路径分析

### 1. 应用启动路径

```
用户访问 → index.html → main.ts → bootstrap.ts → engine → 插件加载 → 组件渲染 → 首屏展示
```

#### 当前启动时间分析：
- **HTML 解析**: ~50ms
- **JavaScript 加载**: ~800ms (过大的 bundle)
- **Engine 初始化**: ~200ms
- **插件加载**: ~300ms (同步加载所有插件)
- **组件渲染**: ~150ms
- **总计**: ~1.5秒 (目标: <800ms)

### 2. 模块加载路径

```
Engine → Shared → Router → I18n → Color → Size → Store → Template → Device → Crypto → API → HTTP → Cache
```

#### 当前问题：
1. **同步加载**: 所有模块同时加载
2. **依赖链长**: 深层依赖导致阻塞
3. **重复加载**: 相同功能在多个模块中重复

## 优化策略

### 1. 启动流程优化

#### 分层加载策略
```typescript
// app/src/bootstrap-optimized.ts
export async function optimizedBootstrap() {
  // 第一层：核心引擎 (必须同步)
  const { createEngine } = await import('@ldesign/engine/core')
  
  // 第二层：基础功能 (并行加载)
  const [
    { routerPlugin },
    { i18nPlugin },
    { sharedUtils }
  ] = await Promise.all([
    import('./router'),
    import('./i18n'),
    import('@ldesign/shared/core')
  ])
  
  // 创建应用实例
  const engine = createEngine({
    plugins: [routerPlugin, i18nPlugin],
    lazy: true // 启用懒加载
  })
  
  // 第三层：UI 组件 (延迟加载)
  requestIdleCallback(async () => {
    const [
      { colorPlugin },
      { sizePlugin },
      { templatePlugin }
    ] = await Promise.all([
      import('./color'),
      import('./size'),
      import('./templates')
    ])
    
    engine.use([colorPlugin, sizePlugin, templatePlugin])
  })
  
  // 第四层：高级功能 (按需加载)
  const advancedPlugins = {
    crypto: () => import('./crypto'),
    device: () => import('./device'),
    cache: () => import('./cache'),
    api: () => import('./api'),
    http: () => import('./http'),
    store: () => import('./store')
  }
  
  // 注册懒加载插件
  Object.entries(advancedPlugins).forEach(([name, loader]) => {
    engine.registerLazyPlugin(name, loader)
  })
  
  return engine
}
```

### 2. 模块拆分优化

#### Engine 模块拆分
```typescript
// packages/engine/src/index-core.ts (核心包 ~20MB)
export {
  createEngine,
  BaseManager,
  EventManager,
  ConfigManager
} from './core'

// packages/engine/src/index-plugins.ts (插件包 ~30MB)
export {
  PluginManager,
  MiddlewareManager,
  HookManager
} from './plugins'

// packages/engine/src/index-ui.ts (UI包 ~40MB)
export {
  DialogManager,
  NotificationManager,
  MessageManager
} from './ui'

// packages/engine/src/index-utils.ts (工具包 ~20MB)
export {
  Logger,
  ErrorHandler,
  PerformanceMonitor
} from './utils'
```

#### Shared 模块拆分
```typescript
// packages/shared/src/index-core.ts (核心工具)
export {
  debounce,
  throttle,
  formatDate,
  isObject,
  deepClone
} from './utils/core'

// packages/shared/src/index-hooks.ts (Vue Hooks)
export {
  useDebounce,
  useThrottle,
  useLocalStorage,
  useEventBus
} from './hooks/core'

// packages/shared/src/index-components.ts (基础组件)
export {
  LButton,
  LDialog,
  LPopup
} from './components/core'
```

### 3. 预加载策略

#### 智能预加载
```typescript
// utils/preloader.ts
export class SmartPreloader {
  private loadQueue = new Map<string, Promise<any>>()
  private loadedModules = new Set<string>()
  
  // 预测性加载
  async preloadByRoute(route: string) {
    const predictions = this.getRoutePredictions(route)
    
    predictions.forEach(module => {
      if (!this.loadedModules.has(module)) {
        this.preload(module)
      }
    })
  }
  
  // 用户行为预测
  async preloadByUserBehavior(interactions: UserInteraction[]) {
    const predictions = this.analyzeUserBehavior(interactions)
    
    predictions.forEach(({ module, probability }) => {
      if (probability > 0.7) { // 70% 概率阈值
        this.preload(module)
      }
    })
  }
  
  private async preload(moduleName: string) {
    if (this.loadQueue.has(moduleName)) {
      return this.loadQueue.get(moduleName)
    }
    
    const loadPromise = this.loadModule(moduleName)
    this.loadQueue.set(moduleName, loadPromise)
    
    try {
      await loadPromise
      this.loadedModules.add(moduleName)
    } catch (error) {
      console.warn(`Failed to preload module: ${moduleName}`, error)
      this.loadQueue.delete(moduleName)
    }
  }
  
  private getRoutePredictions(route: string): string[] {
    const routeModuleMap = {
      '/dashboard': ['store', 'api', 'http'],
      '/settings': ['color', 'size', 'i18n'],
      '/profile': ['crypto', 'device', 'cache'],
      '/admin': ['template', 'router', 'engine']
    }
    
    return routeModuleMap[route] || []
  }
}
```

### 4. 代码分割优化

#### 路由级别分割
```typescript
// app/src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { preload: ['shared', 'color'] }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { preload: ['store', 'api', 'http'] }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { preload: ['color', 'size', 'i18n'] }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由预加载中间件
router.beforeEach(async (to, from, next) => {
  const preloadModules = to.meta?.preload as string[]
  
  if (preloadModules?.length) {
    const preloader = SmartPreloader.getInstance()
    await Promise.all(
      preloadModules.map(module => preloader.preload(module))
    )
  }
  
  next()
})
```

#### 组件级别分割
```typescript
// components/LazyComponentLoader.vue
<template>
  <Suspense>
    <template #default>
      <component :is="dynamicComponent" v-bind="$attrs" />
    </template>
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import { defineAsyncComponent, computed } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

interface Props {
  componentName: string
  module: string
}

const props = defineProps<Props>()

const dynamicComponent = computed(() => {
  return defineAsyncComponent({
    loader: () => import(`@ldesign/${props.module}/components/${props.componentName}`),
    loadingComponent: LoadingSpinner,
    errorComponent: () => import('./ErrorComponent.vue'),
    delay: 200,
    timeout: 5000
  })
})
</script>
```

### 5. 缓存优化

#### 多级缓存策略
```typescript
// utils/cache-optimizer.ts
export class CacheOptimizer {
  private memoryCache = new Map<string, any>()
  private diskCache: IDBDatabase | null = null
  private networkCache = new Map<string, Promise<any>>()
  
  async init() {
    this.diskCache = await this.initIndexedDB()
  }
  
  async get<T>(key: string, loader: () => Promise<T>): Promise<T> {
    // L1: 内存缓存
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key)
    }
    
    // L2: 磁盘缓存
    const diskValue = await this.getDiskCache<T>(key)
    if (diskValue) {
      this.memoryCache.set(key, diskValue)
      return diskValue
    }
    
    // L3: 网络缓存 (防重复请求)
    if (this.networkCache.has(key)) {
      return this.networkCache.get(key)!
    }
    
    // 加载数据
    const loadPromise = loader()
    this.networkCache.set(key, loadPromise)
    
    try {
      const value = await loadPromise
      
      // 缓存到各级
      this.memoryCache.set(key, value)
      await this.setDiskCache(key, value)
      
      return value
    } finally {
      this.networkCache.delete(key)
    }
  }
  
  private async initIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ldesign-cache', 1)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('modules')) {
          db.createObjectStore('modules', { keyPath: 'key' })
        }
      }
    })
  }
}
```

### 6. 性能监控

#### 关键路径监控
```typescript
// utils/performance-tracker.ts
export class PerformanceTracker {
  private marks = new Map<string, number>()
  private measures = new Map<string, number>()
  
  mark(name: string) {
    const timestamp = performance.now()
    this.marks.set(name, timestamp)
    
    if (typeof performance.mark === 'function') {
      performance.mark(name)
    }
  }
  
  measure(name: string, startMark: string, endMark?: string) {
    const startTime = this.marks.get(startMark)
    const endTime = endMark ? this.marks.get(endMark) : performance.now()
    
    if (startTime && endTime) {
      const duration = endTime - startTime
      this.measures.set(name, duration)
      
      if (typeof performance.measure === 'function') {
        performance.measure(name, startMark, endMark)
      }
      
      return duration
    }
    
    return 0
  }
  
  // 关键路径监控
  trackCriticalPath() {
    // 启动阶段
    this.mark('app-start')
    
    // 引擎初始化
    this.mark('engine-init-start')
    // ... 引擎初始化完成后
    this.mark('engine-init-end')
    this.measure('engine-init', 'engine-init-start', 'engine-init-end')
    
    // 插件加载
    this.mark('plugins-load-start')
    // ... 插件加载完成后
    this.mark('plugins-load-end')
    this.measure('plugins-load', 'plugins-load-start', 'plugins-load-end')
    
    // 首屏渲染
    this.mark('first-render-start')
    // ... 首屏渲染完成后
    this.mark('first-render-end')
    this.measure('first-render', 'first-render-start', 'first-render-end')
    
    // 总启动时间
    this.measure('total-startup', 'app-start', 'first-render-end')
  }
  
  getMetrics() {
    return {
      marks: Object.fromEntries(this.marks),
      measures: Object.fromEntries(this.measures),
      navigation: performance.getEntriesByType('navigation')[0],
      resources: performance.getEntriesByType('resource')
    }
  }
  
  // 性能预算检查
  checkPerformanceBudget() {
    const budget = {
      'total-startup': 800, // 800ms
      'engine-init': 200,   // 200ms
      'plugins-load': 300,  // 300ms
      'first-render': 150   // 150ms
    }
    
    const violations: string[] = []
    
    Object.entries(budget).forEach(([metric, limit]) => {
      const actual = this.measures.get(metric)
      if (actual && actual > limit) {
        violations.push(`${metric}: ${actual}ms > ${limit}ms`)
      }
    })
    
    if (violations.length > 0) {
      console.warn('Performance budget violations:', violations)
    }
    
    return violations
  }
}
```

## 实施计划

### 第一阶段：启动优化 (1周)
1. **分层加载实现**
   - 拆分启动流程为4个层次
   - 实现核心模块优先加载
   - 添加性能监控点

2. **模块拆分**
   - 拆分 Engine 为4个子包
   - 拆分 Shared 为3个子包
   - 更新构建配置

### 第二阶段：预加载优化 (1周)
1. **智能预加载**
   - 实现路由预测加载
   - 添加用户行为分析
   - 实现概率阈值控制

2. **代码分割**
   - 实现路由级别分割
   - 实现组件级别分割
   - 添加加载状态管理

### 第三阶段：缓存优化 (1周)
1. **多级缓存**
   - 实现内存+磁盘+网络缓存
   - 添加缓存失效策略
   - 实现缓存预热

2. **性能监控**
   - 实现关键路径监控
   - 添加性能预算检查
   - 实现实时性能报告

### 第四阶段：测试验证 (1周)
1. **性能测试**
   - 启动时间测试
   - 内存使用测试
   - 用户体验测试

2. **优化调整**
   - 根据测试结果调整策略
   - 优化预加载算法
   - 完善监控指标

## 预期效果

### 启动性能
- **总启动时间**: 从 1.5秒 降至 0.8秒 (47% 提升)
- **首屏渲染**: 从 300ms 降至 150ms (50% 提升)
- **交互就绪**: 从 2秒 降至 1秒 (50% 提升)

### 运行时性能
- **路由切换**: 从 200ms 降至 100ms (50% 提升)
- **组件加载**: 从 150ms 降至 75ms (50% 提升)
- **内存占用**: 减少 30-40%

### 用户体验
- **感知性能**: 显著提升
- **交互响应**: 更加流畅
- **加载体验**: 渐进式加载

---

*优化目标: 极致的启动性能和用户体验*