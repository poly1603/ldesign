# 实现细节详解

## 目录重构实现

### 重构前的问题

原始的 `src` 目录结构存在以下问题：

1. **文件组织混乱**：核心文件直接放在根目录下
2. **功能分类不清**：相关功能文件分散在不同位置
3. **导入路径复杂**：缺乏统一的导入规范
4. **可维护性差**：难以快速定位和修改功能

### 重构后的目录结构

```
src/
├── core/                    # 核心功能模块
│   ├── router.ts           # 路由器核心实现
│   ├── matcher.ts          # 路由匹配器
│   ├── history.ts          # 历史管理
│   ├── constants.ts        # 常量定义
│   └── index.ts            # 核心模块导出
├── advanced/                # 高级功能模块
│   ├── cache.ts            # 路由缓存
│   ├── preloader.ts        # 路由预加载
│   ├── performance.ts      # 性能监控
│   └── index.ts            # 高级功能导出
├── components/              # Vue组件
│   ├── RouterView.tsx      # 路由视图组件
│   ├── RouterLink.tsx      # 路由链接组件
│   ├── types.ts            # 组件类型定义
│   └── index.ts            # 组件模块导出
├── composables/             # 组合式API
│   ├── useRouter.ts        # 路由器相关hooks
│   ├── useRoute.ts         # 路由信息hooks
│   ├── useNavigation.ts    # 导航相关hooks
│   ├── useGuards.ts        # 守卫相关hooks
│   └── index.ts            # composables导出
├── guards/                  # 路由守卫
│   ├── navigation-guards.ts # 导航守卫实现
│   ├── route-guards.ts     # 路由守卫实现
│   ├── guard-manager.ts    # 守卫管理器
│   └── index.ts            # 守卫模块导出
├── utils/                   # 工具函数
│   ├── url.ts              # URL处理工具
│   ├── params.ts           # 参数处理工具
│   ├── common.ts           # 通用工具
│   └── index.ts            # 工具导出
├── types/                   # 类型定义
│   ├── core.ts             # 核心类型
│   ├── components.ts       # 组件类型
│   ├── composables.ts      # composables类型
│   ├── guards.ts           # 守卫类型
│   ├── advanced.ts         # 高级功能类型
│   └── index.ts            # 类型导出
├── errors/                  # 错误处理
│   ├── navigation-errors.ts # 导航错误
│   ├── route-errors.ts     # 路由错误
│   └── index.ts            # 错误导出
└── index.ts                 # 主入口文件
```

### 重构优势

1. **清晰的功能分层**：每个目录都有明确的职责
2. **统一的导出模式**：每个目录都有 index.ts 文件统一导出
3. **便于维护和扩展**：新功能可以轻松添加到对应目录
4. **更好的开发体验**：IDE 可以更好地提供代码提示和导航

## 核心功能实现

### 1. 路由匹配器优化

**缓存机制实现**：

```typescript
class RouterMatcher {
  private resolveCache = new Map<string, RouteLocationNormalized>()

  resolve(
    location: RouteLocationRaw,
    currentLocation: RouteLocationNormalized
  ): RouteLocationNormalized {
    // 生成缓存键
    const cacheKey = typeof location === 'string' ? location : JSON.stringify(location)

    // 检查缓存
    const cached = this.resolveCache.get(cacheKey)
    if (cached) {
      return cached
    }

    // 执行匹配逻辑
    const resolved = this.performMatch(location, currentLocation)

    // 缓存结果
    this.resolveCache.set(cacheKey, resolved)

    return resolved
  }
}
```

**路径匹配算法**：

```typescript
private matchPath(pattern: string, path: string): boolean {
  const patternParts = pattern.split('/')
  const pathParts = path.split('/')

  if (patternParts.length !== pathParts.length) {
    return false
  }

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i]
    const pathPart = pathParts[i]

    if (patternPart?.startsWith(':')) {
      // 动态参数匹配
      continue
    } else if (patternPart !== pathPart) {
      return false
    }
  }

  return true
}
```

### 2. 历史管理实现

**多模式支持**：

```typescript
// Web History 模式
export function createWebHistory(base?: string): RouterHistory {
  const normalizedBase = normalizeBase(base)

  return createHistory({
    base: normalizedBase,
    location: () => window.location.pathname + window.location.search + window.location.hash,
    state: () => window.history.state,
    push: (to: HistoryLocation, data?: HistoryState) => {
      window.history.pushState(data, '', createHref(normalizedBase, to))
    },
    replace: (to: HistoryLocation, data?: HistoryState) => {
      window.history.replaceState(data, '', createHref(normalizedBase, to))
    },
    go: (delta: number) => {
      window.history.go(delta)
    },
    listen: (callback: NavigationCallback) => {
      const popstateHandler = (event: PopStateEvent) => {
        const to = window.location.pathname + window.location.search + window.location.hash
        const from = getCurrentLocation()
        callback(to, from, {
          type: NavigationType.pop,
          direction: NavigationDirection.unknown,
          delta: 0,
        })
      }

      window.addEventListener('popstate', popstateHandler)
      return () => window.removeEventListener('popstate', popstateHandler)
    },
  })
}

// Memory History 模式
export function createMemoryHistory(base?: string): RouterHistory {
  const normalizedBase = normalizeBase(base)
  let currentLocation = '/'
  let currentState: HistoryState = {}
  const stack: Array<{ location: string; state: HistoryState }> = [
    { location: currentLocation, state: currentState },
  ]
  let position = 0

  return createHistory({
    base: normalizedBase,
    location: () => currentLocation,
    state: () => currentState,
    push: (to: HistoryLocation, data?: HistoryState) => {
      stack.splice(position + 1)
      stack.push({ location: to, state: data || {} })
      position = stack.length - 1
      currentLocation = to
      currentState = data || {}
    },
    replace: (to: HistoryLocation, data?: HistoryState) => {
      stack[position] = { location: to, state: data || {} }
      currentLocation = to
      currentState = data || {}
    },
    go: (delta: number) => {
      const newPosition = position + delta
      if (newPosition >= 0 && newPosition < stack.length) {
        position = newPosition
        const entry = stack[position]
        if (entry) {
          currentLocation = entry.location
          currentState = entry.state
        }
      }
    },
    listen: () => () => {}, // Memory 模式不需要监听器
  })
}
```

## 高级功能实现

### 1. 智能缓存系统

**LRU 算法实现**：

```typescript
class RouteCacheManager {
  private cache = new Map<string, CacheItem>()

  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null
    let leastUsedItem: CacheItem | null = null

    for (const [key, item] of this.cache.entries()) {
      if (!leastUsedItem || item.accessCount < leastUsedItem.accessCount) {
        leastUsedKey = key
        leastUsedItem = item
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey)
    }
  }

  set(route: RouteLocationNormalized): void {
    const key = this.getRouteKey(route)

    if (!this.shouldCache(route)) {
      return
    }

    const now = Date.now()
    const existing = this.cache.get(key)

    if (existing) {
      existing.lastAccess = now
      existing.accessCount++
    } else {
      if (this.cache.size >= this.config.max) {
        this.evictLeastUsed()
      }

      this.cache.set(key, {
        route,
        timestamp: now,
        accessCount: 1,
        lastAccess: now,
      })
    }
  }
}
```

**TTL 过期机制**：

```typescript
private isExpired(item: CacheItem): boolean {
  return Date.now() - item.timestamp > this.config.ttl
}

private cleanupExpired(): void {
  const now = Date.now()
  for (const [key, item] of this.cache.entries()) {
    if (now - item.timestamp > this.config.ttl) {
      this.cache.delete(key)
    }
  }
}
```

### 2. 预加载系统实现

**Intersection Observer 集成**：

```typescript
class RoutePreloader {
  private intersectionObserver?: IntersectionObserver

  private initializeIntersectionObserver(): void {
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      return
    }

    this.intersectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const route = (entry.target as any).__routePreloadData
            if (route) {
              this.preloadRoute(route)
              this.intersectionObserver!.unobserve(entry.target)
            }
          }
        })
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    )
  }

  observeLink(element: Element, route: RouteRecordNormalized): void {
    if (this.strategy !== 'visible' || !this.intersectionObserver) {
      return
    }

    ;(element as any).__routePreloadData = route
    this.intersectionObserver.observe(element)
  }
}
```

**空闲时预加载**：

```typescript
private preloadOnIdle(): void {
  if (typeof window === 'undefined') {
    return
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      this.preloadAllRoutes()
    })
  } else {
    // 降级到 setTimeout
    setTimeout(() => {
      this.preloadAllRoutes()
    }, 100)
  }
}
```

### 3. 性能监控实现

**导航性能追踪**：

```typescript
class PerformanceMonitor {
  private activeNavigations = new Map<string, Partial<PerformanceMetrics>>()

  startNavigation(from: RouteLocationNormalized, to: RouteLocationRaw): string {
    if (!this.enabled) {
      return ''
    }

    const navigationId = this.generateNavigationId()
    const now = this.now()

    this.activeNavigations.set(navigationId, {
      navigationStart: now,
    })

    return navigationId
  }

  endNavigation(navigationId: string, success: boolean, error?: any): void {
    if (!this.enabled || !navigationId) {
      return
    }

    const metrics = this.activeNavigations.get(navigationId)
    if (!metrics || !metrics.navigationStart) {
      return
    }

    const now = this.now()
    const finalMetrics: PerformanceMetrics = {
      navigationStart: metrics.navigationStart,
      navigationEnd: now,
      duration: now - metrics.navigationStart,
      routeResolution: metrics.routeResolution || 0,
      guardExecution: metrics.guardExecution || 0,
      componentLoad: metrics.componentLoad || 0,
      renderTime: metrics.renderTime || 0,
    }

    this.activeNavigations.delete(navigationId)
    // 记录到历史中用于分析
  }

  private now(): number {
    return typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now()
  }
}
```

## 组件实现细节

### RouterView 组件

**TSX 实现**：

```typescript
export const RouterView = defineComponent({
  name: 'RouterView',
  props: {
    name: {
      type: String,
      default: 'default',
    },
    depth: {
      type: Number,
      default: 0,
    },
  },

  setup(props, { slots }) {
    const route = useRoute()
    const router = useRouter()

    const component = computed(() => {
      const matched = route.matched[props.depth]
      if (!matched) return null

      const components = matched.components
      return components?.[props.name] || components?.default
    })

    return () => {
      if (!component.value) {
        return slots.default?.()
      }

      // 检查缓存
      const cached = router.getCachedComponent?.(route)
      if (cached) {
        return h(cached, { key: route.fullPath })
      }

      // 渲染组件
      return h(component.value, {
        key: route.fullPath,
        ...route.params,
      })
    }
  },
})
```

### RouterLink 组件

**智能预加载集成**：

```typescript
export const RouterLink = defineComponent({
  name: 'RouterLink',
  props: {
    to: {
      type: [String, Object] as PropType<RouteLocationRaw>,
      required: true,
    },
    preload: {
      type: String as PropType<PreloadStrategy>,
      default: 'none',
    },
    activeClass: String,
    exactActiveClass: String,
  },

  setup(props, { slots, attrs }) {
    const router = useRouter()
    const route = useRoute()
    const linkRef = ref<HTMLElement>()

    // 解析目标路由
    const targetRoute = computed(() => {
      return router.resolve(props.to, route)
    })

    // 活跃状态计算
    const isActive = computed(() => {
      return router.isActive(targetRoute.value, route)
    })

    const isExactActive = computed(() => {
      return router.isExactActive(targetRoute.value, route)
    })

    // 预加载处理
    const handleMouseEnter = () => {
      if (props.preload === 'hover') {
        router.preloadRoute?.(targetRoute.value)
      }
    }

    // 可见性预加载
    onMounted(() => {
      if (props.preload === 'visible' && linkRef.value) {
        router.observeLink?.(linkRef.value, targetRoute.value)
      }
    })

    onUnmounted(() => {
      if (linkRef.value) {
        router.unobserveLink?.(linkRef.value)
      }
    })

    // 导航处理
    const navigate = (e: MouseEvent) => {
      if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) {
        return
      }

      e.preventDefault()
      router.push(props.to)
    }

    return () => {
      const classes = {
        [props.activeClass || 'router-link-active']: isActive.value,
        [props.exactActiveClass || 'router-link-exact-active']: isExactActive.value,
      }

      return h(
        'a',
        {
          ref: linkRef,
          href: targetRoute.value.href,
          class: classes,
          onMouseenter: handleMouseEnter,
          onClick: navigate,
          ...attrs,
        },
        slots.default?.()
      )
    }
  },
})
```

## 类型系统实现

### 类型安全的路由定义

```typescript
// 路由记录类型增强
interface RouteRecordRaw {
  path: string
  name?: string | symbol
  component?: RouteComponent
  components?: Record<string, RouteComponent>
  redirect?: RouteLocationRaw
  children?: RouteRecordRaw[]
  meta?: RouteMeta
  beforeEnter?: NavigationGuard | NavigationGuard[]
}

// 类型安全的参数提取
type ExtractParams<T extends string> = T extends `${infer _Start}:${infer Param}/${infer Rest}`
  ? { [K in Param]: string } & ExtractParams<Rest>
  : T extends `${infer _Start}:${infer Param}`
  ? { [K in Param]: string }
  : {}

// 使用示例
type UserRouteParams = ExtractParams<'/user/:id/posts/:postId'>
// 结果: { id: string; postId: string }
```

### 组合式 API 类型定义

```typescript
// useRouter 返回类型
interface Router {
  currentRoute: Ref<RouteLocationNormalized>
  push: (to: RouteLocationRaw) => Promise<NavigationFailure | void>
  replace: (to: RouteLocationRaw) => Promise<NavigationFailure | void>
  go: (delta: number) => void
  back: () => void
  forward: () => void
  beforeEach: (guard: NavigationGuard) => () => void
  beforeResolve: (guard: NavigationGuard) => () => void
  afterEach: (guard: NavigationHookAfter) => () => void
  onError: (handler: ErrorHandler) => () => void
  isReady: () => Promise<void>
  addRoute: (route: RouteRecordRaw) => () => void
  removeRoute: (name: string | symbol) => void
  hasRoute: (name: string | symbol) => boolean
  getRoutes: () => RouteRecordNormalized[]
  resolve: (
    to: RouteLocationRaw,
    currentLocation?: RouteLocationNormalized
  ) => RouteLocationNormalized
}
```

这些实现细节展示了 @ldesign/router 如何通过精心设计的架构和优化的算法，提供高性能、类型安全且功能丰
富的路由解决方案。
