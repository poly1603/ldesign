# LDesign Router 实现细节

## 🏗️ 核心架构实现

### 1. Router 核心类设计

Router 类是整个路由系统的核心，采用了事件驱动的架构模式：

```typescript
class Router {
  private currentRoute: Ref<RouteLocationNormalized>
  private matcher: RouteMatcher
  private history: RouterHistory
  private guards: NavigationGuards
  private preloader: RoutePreloader
  private cache: RouteCache
  private performance: PerformanceMonitor

  constructor(options: RouterOptions) {
    this.history = options.history
    this.matcher = new RouteMatcher(options.routes)
    this.guards = new NavigationGuards()
    this.preloader = new RoutePreloader(options.preloadStrategy)
    this.cache = new RouteCache(options.cache)
    this.performance = new PerformanceMonitor(options.performance)
  }
}
```

#### 关键设计决策

1. **响应式状态管理**: 使用 Vue 3 的 `ref` 和 `computed` 管理路由状态
2. **模块化设计**: 将不同功能拆分为独立的模块
3. **事件驱动**: 通过事件系统协调各模块间的通信
4. **插件架构**: 支持功能的动态扩展

### 2. 路由匹配器 (RouteMatcher) 实现

路由匹配器是性能优化的关键组件：

```typescript
class RouteMatcher {
  private routes: Map<string, RouteRecordNormalized>
  private pathCache: Map<string, RouteMatch>
  private regexCache: Map<string, RegExp>

  match(location: RouteLocationRaw): RouteMatch {
    // 1. 缓存查找
    const cached = this.pathCache.get(location.path)
    if (cached && this.isCacheValid(cached)) {
      return cached
    }

    // 2. 路径匹配
    const match = this.performMatch(location)

    // 3. 缓存结果
    this.pathCache.set(location.path, match)

    return match
  }

  private performMatch(location: RouteLocationRaw): RouteMatch {
    // 高效的路径匹配算法实现
    for (const [pattern, route] of this.routes) {
      const regex = this.getRegex(pattern)
      const match = location.path.match(regex)

      if (match) {
        return {
          route,
          params: this.extractParams(match, route),
          query: location.query || {},
          hash: location.hash || '',
        }
      }
    }

    throw new Error(`No route found for ${location.path}`)
  }
}
```

#### 优化策略

1. **路径缓存**: 缓存匹配结果，避免重复计算
2. **正则表达式缓存**: 缓存编译后的正则表达式
3. **快速路径**: 对常见路径模式进行优化
4. **参数提取优化**: 高效的参数解析算法

### 3. 历史管理 (History) 实现

历史管理采用了策略模式，支持多种历史模式：

```typescript
// 抽象基类
abstract class RouterHistory {
  protected listeners: NavigationCallback[] = []

  abstract location(): string
  abstract push(to: string, data?: any): void
  abstract replace(to: string, data?: any): void
  abstract go(delta: number): void

  listen(callback: NavigationCallback): () => void {
    this.listeners.push(callback)
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  protected triggerListeners(to: string, from: string, info: any) {
    this.listeners.forEach(callback => {
      try {
        callback(to, from, info)
      } catch (error) {
        console.error('Navigation listener error:', error)
      }
    })
  }
}

// Web History 实现
class WebHistory extends RouterHistory {
  constructor(private base: string = '') {
    super()
    window.addEventListener('popstate', this.handlePopState.bind(this))
  }

  location(): string {
    return window.location.pathname + window.location.search + window.location.hash
  }

  push(to: string, data?: any): void {
    const from = this.location()
    window.history.pushState(data, '', this.base + to)
    this.triggerListeners(to, from, { type: 'push' })
  }

  private handlePopState(event: PopStateEvent): void {
    const to = this.location()
    const from = this.previousLocation || '/'
    this.triggerListeners(to, from, { type: 'pop', state: event.state })
  }
}
```

#### 设计亮点

1. **统一接口**: 所有历史模式实现相同的接口
2. **事件处理**: 统一的事件监听和触发机制
3. **错误处理**: 完善的错误处理和恢复机制
4. **状态管理**: 正确处理浏览器历史状态

### 4. 智能预加载系统实现

预加载系统是 LDesign Router 的创新功能：

```typescript
class RoutePreloader {
  private preloadQueue: Map<string, Promise<any>> = new Map()
  private strategy: PreloadStrategy
  private maxConcurrent = 3
  private currentLoading = 0

  constructor(strategy: PreloadStrategy = 'hover') {
    this.strategy = strategy
  }

  async preload(route: RouteLocationRaw): Promise<void> {
    const key = this.getRouteKey(route)

    // 避免重复预加载
    if (this.preloadQueue.has(key)) {
      return this.preloadQueue.get(key)
    }

    // 控制并发数量
    if (this.currentLoading >= this.maxConcurrent) {
      await this.waitForSlot()
    }

    const promise = this.performPreload(route)
    this.preloadQueue.set(key, promise)

    return promise
  }

  private async performPreload(route: RouteLocationRaw): Promise<void> {
    this.currentLoading++

    try {
      const resolved = this.router.resolve(route)
      const component = resolved.matched[0]?.components?.default

      if (component && typeof component === 'function') {
        // 预加载组件
        await component()

        // 预加载相关资源
        await this.preloadAssets(resolved)
      }
    } catch (error) {
      console.warn('Preload failed:', error)
    } finally {
      this.currentLoading--
    }
  }

  // 不同策略的实现
  setupStrategy(element: HTMLElement, route: RouteLocationRaw) {
    switch (this.strategy) {
      case 'hover':
        element.addEventListener('mouseenter', () => this.preload(route))
        break
      case 'visible':
        this.setupIntersectionObserver(element, route)
        break
      case 'idle':
        this.scheduleIdlePreload(route)
        break
      case 'immediate':
        this.preload(route)
        break
    }
  }
}
```

#### 创新特性

1. **多策略支持**: 四种不同的预加载策略
2. **并发控制**: 限制同时预加载的数量
3. **智能队列**: 避免重复预加载
4. **资源预加载**: 不仅预加载组件，还预加载相关资源

### 5. 智能缓存系统实现

缓存系统采用 LRU + TTL 混合策略：

```typescript
class RouteCache {
  private cache: Map<string, CacheEntry> = new Map()
  private accessOrder: string[] = []
  private maxSize: number
  private defaultTTL: number
  private includeRules: (string | RegExp)[]
  private excludeRules: (string | RegExp)[]

  constructor(options: CacheOptions) {
    this.maxSize = options.max || 10
    this.defaultTTL = options.ttl || 5 * 60 * 1000
    this.includeRules = options.include || []
    this.excludeRules = options.exclude || []
  }

  get(key: string): any {
    const entry = this.cache.get(key)

    if (!entry) return null

    // 检查 TTL
    if (Date.now() > entry.expireTime) {
      this.delete(key)
      return null
    }

    // 更新访问顺序 (LRU)
    this.updateAccessOrder(key)

    return entry.value
  }

  set(key: string, value: any, ttl?: number): void {
    // 检查是否应该缓存
    if (!this.shouldCache(key)) return

    const expireTime = Date.now() + (ttl || this.defaultTTL)

    // 如果缓存已满，移除最少使用的项
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU()
    }

    this.cache.set(key, { value, expireTime, accessTime: Date.now() })
    this.updateAccessOrder(key)
  }

  private shouldCache(key: string): boolean {
    // 检查排除规则
    for (const rule of this.excludeRules) {
      if (this.matchRule(key, rule)) return false
    }

    // 检查包含规则
    if (this.includeRules.length === 0) return true

    for (const rule of this.includeRules) {
      if (this.matchRule(key, rule)) return true
    }

    return false
  }

  private evictLRU(): void {
    const lruKey = this.accessOrder[0]
    if (lruKey) {
      this.delete(lruKey)
    }
  }
}
```

#### 核心算法

1. **LRU 算法**: 基于访问时间的最近最少使用算法
2. **TTL 机制**: 基于时间的自动过期机制
3. **规则匹配**: 灵活的包含/排除规则系统
4. **内存管理**: 自动清理过期和超量的缓存

### 6. 性能监控系统实现

性能监控提供实时的性能分析：

```typescript
class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    totalNavigations: 0,
    totalDuration: 0,
    successCount: 0,
    failureCount: 0,
    navigationHistory: [],
  }

  startNavigation(navigationId: string): void {
    const start = performance.now()
    this.navigationStarts.set(navigationId, start)
  }

  endNavigation(navigationId: string, success: boolean, error?: any): void {
    const start = this.navigationStarts.get(navigationId)
    if (!start) return

    const duration = performance.now() - start
    this.navigationStarts.delete(navigationId)

    // 更新统计信息
    this.metrics.totalNavigations++
    this.metrics.totalDuration += duration

    if (success) {
      this.metrics.successCount++
    } else {
      this.metrics.failureCount++
    }

    // 记录导航历史
    this.metrics.navigationHistory.push({
      id: navigationId,
      duration,
      success,
      error,
      timestamp: Date.now(),
    })

    // 保持历史记录在合理范围内
    if (this.metrics.navigationHistory.length > this.maxHistorySize) {
      this.metrics.navigationHistory.shift()
    }

    // 性能告警
    this.checkPerformanceThresholds(duration, success)
  }

  getStats(): PerformanceStats {
    const { totalNavigations, totalDuration, successCount } = this.metrics

    return {
      totalNavigations,
      averageDuration: totalNavigations > 0 ? totalDuration / totalNavigations : 0,
      successRate: totalNavigations > 0 ? successCount / totalNavigations : 1,
      fastestNavigation: Math.min(...this.metrics.navigationHistory.map(n => n.duration)),
      slowestNavigation: Math.max(...this.metrics.navigationHistory.map(n => n.duration)),
    }
  }

  private checkPerformanceThresholds(duration: number, success: boolean): void {
    // 性能告警阈值
    if (duration > 1000) {
      console.warn(`⚠️ 导航耗时过长: ${duration}ms`)
    }

    if (!success) {
      console.error('❌ 导航失败')
    }

    const stats = this.getStats()
    if (stats.successRate < 0.95) {
      console.warn(`⚠️ 导航成功率较低: ${(stats.successRate * 100).toFixed(1)}%`)
    }
  }
}
```

#### 监控指标

1. **导航时间**: 从开始到完成的总时间
2. **成功率**: 成功导航与总导航的比率
3. **内存使用**: 路由相关的内存占用
4. **缓存效率**: 缓存命中率和使用情况

## 🔧 关键技术实现

### 1. 响应式系统集成

与 Vue 3 响应式系统的深度集成：

```typescript
// 响应式路由状态
const currentRoute = ref<RouteLocationNormalized>(initialRoute)

// 计算属性
const routeParams = computed(() => currentRoute.value.params)
const routeQuery = computed(() => currentRoute.value.query)

// 监听路由变化
watch(
  currentRoute,
  (to, from) => {
    // 执行路由变化逻辑
  },
  { deep: true }
)
```

### 2. TypeScript 类型系统

完整的类型定义和推导：

```typescript
// 路由参数类型推导
interface RouteParams {
  id: string
  category?: string
}

// 类型安全的路由定义
const routes: RouteRecordRaw[] = [
  {
    path: '/user/:id',
    name: 'User',
    component: UserComponent,
    props: (route): RouteParams => ({
      id: route.params.id as string,
      category: route.query.category as string,
    }),
  },
]
```

### 3. 错误处理机制

完善的错误处理和恢复：

```typescript
class NavigationError extends Error {
  constructor(
    message: string,
    public code: NavigationErrorCode,
    public from: RouteLocationNormalized,
    public to: RouteLocationNormalized
  ) {
    super(message)
    this.name = 'NavigationError'
  }
}

// 错误处理
router.onError((error, to, from) => {
  if (error instanceof NavigationError) {
    // 处理导航错误
    handleNavigationError(error)
  } else {
    // 处理其他错误
    handleGenericError(error)
  }
})
```

## 📊 性能优化实现

### 1. 路径匹配优化

- **缓存机制**: 缓存匹配结果
- **快速路径**: 优化常见路径模式
- **正则优化**: 高效的正则表达式

### 2. 内存管理

- **弱引用**: 使用 WeakMap 避免内存泄漏
- **自动清理**: 定期清理过期缓存
- **大小限制**: 限制缓存大小

### 3. 异步优化

- **并发控制**: 限制同时加载的组件数量
- **优先级队列**: 根据重要性排序预加载
- **取消机制**: 支持取消不需要的预加载

这些实现细节展示了 LDesign Router 在性能、可维护性和扩展性方面的深度思考和精心设计。
