# 架构设计详解

## 整体架构

@ldesign/router 采用模块化、分层的架构设计，确保代码的可维护性、可扩展性和性能。

### 架构层次

```
┌─────────────────────────────────────────┐
│              应用层 (App Layer)           │
│  Vue Components, Composables, Directives │
├─────────────────────────────────────────┤
│             API 层 (API Layer)           │
│    Router, RouterView, RouterLink       │
├─────────────────────────────────────────┤
│            核心层 (Core Layer)           │
│   Matcher, History, Navigation Guards   │
├─────────────────────────────────────────┤
│           高级功能层 (Advanced)           │
│   Cache, Preloader, Performance Monitor │
├─────────────────────────────────────────┤
│           工具层 (Utils Layer)           │
│     URL Parser, Type Guards, Helpers    │
└─────────────────────────────────────────┘
```

## 核心模块设计

### 1. Router 核心 (core/router.ts)

**职责**：

- 路由器实例管理
- 导航控制和状态管理
- 守卫执行和生命周期管理
- 插件系统集成

**设计模式**：

- **工厂模式**：`createRouter()` 函数
- **观察者模式**：路由变化监听
- **命令模式**：导航操作封装

```typescript
// 核心架构
class Router {
  private matcher: RouterMatcher
  private history: RouterHistory
  private currentRoute: Ref<RouteLocationNormalized>
  private guards: GuardManager
  private plugins: PluginManager

  // 高级功能模块
  private preloader?: RoutePreloader
  private cacheManager?: RouteCacheManager
  private performanceMonitor?: PerformanceMonitor
}
```

### 2. 路由匹配器 (core/matcher.ts)

**职责**：

- 路由规则解析和编译
- 路径匹配算法实现
- 动态路由参数提取
- 路由记录管理

**优化策略**：

- **缓存机制**：匹配结果缓存
- **索引优化**：路由名称快速查找
- **算法优化**：高效的路径匹配

```typescript
interface RouterMatcher {
  addRoute: (record: RouteRecordRaw, parent?: string | symbol) => () => void
  removeRoute: (name: string | symbol) => void
  resolve: (location: RouteLocationRaw, current: RouteLocationNormalized) => RouteLocationNormalized
  getRoutes: () => RouteRecordNormalized[]
}
```

### 3. 历史管理 (core/history.ts)

**职责**：

- 浏览器历史记录管理
- 不同历史模式支持 (hash, history, memory)
- 状态同步和事件监听
- 跨平台兼容性

**模式支持**：

- **Web History**：HTML5 History API
- **Hash History**：基于 URL hash
- **Memory History**：内存模式（SSR/测试）

## 高级功能架构

### 1. 预加载系统 (advanced/preloader.ts)

**架构设计**：

```typescript
class RoutePreloader {
  private strategy: PreloadStrategy
  private preloadQueue: Set<string>
  private preloadedComponents: Map<string, Promise<Component>>
  private intersectionObserver?: IntersectionObserver

  // 策略模式实现
  private strategies = {
    hover: new HoverPreloadStrategy(),
    visible: new VisiblePreloadStrategy(),
    idle: new IdlePreloadStrategy(),
    immediate: new ImmediatePreloadStrategy(),
  }
}
```

**策略模式**：

- **悬停预加载**：鼠标悬停时触发
- **可见预加载**：元素进入视口时触发
- **空闲预加载**：浏览器空闲时触发
- **立即预加载**：路由注册时立即触发

### 2. 缓存系统 (advanced/cache.ts)

**缓存策略**：

```typescript
class RouteCacheManager {
  private cache: Map<string, CacheItem>
  private config: RouteCacheConfig

  // LRU 算法实现
  private evictLeastUsed(): void

  // TTL 过期检查
  private isExpired(item: CacheItem): boolean

  // 缓存策略
  private shouldCache(route: RouteLocationNormalized): boolean
}
```

**缓存特性**：

- **LRU 淘汰**：最近最少使用算法
- **TTL 过期**：基于时间的自动过期
- **规则过滤**：include/exclude 规则支持
- **内存管理**：智能内存使用控制

### 3. 性能监控 (advanced/performance.ts)

**监控指标**：

```typescript
interface PerformanceMetrics {
  navigationStart: number
  navigationEnd: number
  duration: number
  routeResolution: number
  guardExecution: number
  componentLoad: number
  renderTime: number
}
```

**监控功能**：

- **导航时间**：完整导航流程耗时
- **组件加载**：异步组件加载时间
- **守卫执行**：导航守卫执行时间
- **渲染性能**：组件渲染时间

## 组件架构

### 1. RouterView 组件

**设计理念**：

- **声明式渲染**：基于路由状态的组件渲染
- **嵌套支持**：多层级路由视图
- **过渡动画**：内置过渡效果支持
- **缓存集成**：与缓存系统无缝集成

```typescript
// RouterView 核心逻辑
const RouterView = defineComponent({
  setup(props, { slots }) {
    const route = useRoute()
    const router = useRouter()

    const component = computed(() => {
      const matched = route.matched[props.depth || 0]
      return matched?.components?.[props.name || 'default']
    })

    return () => {
      if (!component.value) return null

      // 缓存检查
      const cached = router.getCachedComponent(route)
      if (cached) return cached

      // 组件渲染
      return h(component.value, { key: route.fullPath })
    }
  },
})
```

### 2. RouterLink 组件

**功能特性**：

- **智能预加载**：集成预加载策略
- **活跃状态**：自动活跃类名管理
- **无障碍支持**：完整的 a11y 支持
- **自定义渲染**：灵活的渲染选项

```typescript
// RouterLink 核心逻辑
const RouterLink = defineComponent({
  setup(props, { slots }) {
    const router = useRouter()
    const route = useRoute()

    // 预加载集成
    const handleMouseEnter = () => {
      if (props.preload === 'hover') {
        router.preloadRoute(props.to)
      }
    }

    // 活跃状态计算
    const isActive = computed(() => {
      return router.isActive(props.to, route)
    })

    return () =>
      h(
        'a',
        {
          href: router.resolve(props.to).href,
          class: { 'router-link-active': isActive.value },
          onMouseenter: handleMouseEnter,
          onClick: e => {
            e.preventDefault()
            router.push(props.to)
          },
        },
        slots.default?.()
      )
  },
})
```

## 插件系统架构

### 插件接口设计

```typescript
interface RouterPlugin {
  name: string
  version?: string
  install: (router: Router, options?: any) => void
  uninstall?: (router: Router) => void
}

// 插件管理器
class PluginManager {
  private plugins = new Map<string, RouterPlugin>()

  install(plugin: RouterPlugin, options?: any): void
  uninstall(name: string): void
  has(name: string): boolean
  get(name: string): RouterPlugin | undefined
}
```

### 生命周期钩子

```typescript
// 插件生命周期
interface PluginHooks {
  beforeInstall?: (router: Router) => void
  afterInstall?: (router: Router) => void
  beforeUninstall?: (router: Router) => void
  afterUninstall?: (router: Router) => void

  // 导航钩子
  beforeEach?: (to: RouteLocation, from: RouteLocation) => void
  afterEach?: (to: RouteLocation, from: RouteLocation) => void
}
```

## 类型系统设计

### 核心类型定义

```typescript
// 路由记录类型
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

// 路由位置类型
interface RouteLocationNormalized {
  name: string | symbol | undefined
  path: string
  params: RouteParams
  query: RouteQuery
  hash: string
  fullPath: string
  href: string
  matched: RouteRecordNormalized[]
  meta: RouteMeta
}
```

### 泛型支持

```typescript
// 类型安全的路由定义
interface TypedRouteRecord<T extends string = string> {
  path: T
  name: T
  component: RouteComponent
  meta?: RouteMeta
}

// 类型安全的导航
interface TypedRouter<T extends Record<string, any> = Record<string, any>> {
  push: <K extends keyof T>(name: K, params?: T[K]) => Promise<void>
  replace: <K extends keyof T>(name: K, params?: T[K]) => Promise<void>
}
```

## 错误处理架构

### 错误分类

```typescript
// 错误类型枚举
enum RouterErrorType {
  NAVIGATION_ABORTED = 'NAVIGATION_ABORTED',
  NAVIGATION_CANCELLED = 'NAVIGATION_CANCELLED',
  NAVIGATION_DUPLICATED = 'NAVIGATION_DUPLICATED',
  ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND',
  COMPONENT_LOAD_ERROR = 'COMPONENT_LOAD_ERROR',
}

// 错误处理器
interface ErrorHandler {
  (error: RouterError, to: RouteLocation, from: RouteLocation): void
}
```

### 错误恢复机制

```typescript
class ErrorRecovery {
  private retryCount = new Map<string, number>()
  private maxRetries = 3

  async handleComponentLoadError(route: RouteLocation, error: Error): Promise<Component | null> {
    const key = route.fullPath
    const count = this.retryCount.get(key) || 0

    if (count < this.maxRetries) {
      this.retryCount.set(key, count + 1)
      // 重试加载
      return this.retryLoadComponent(route)
    }

    // 降级处理
    return this.getFallbackComponent()
  }
}
```

## 性能优化策略

### 1. 内存优化

- **弱引用**：避免内存泄漏
- **对象池**：重用对象实例
- **垃圾回收**：主动清理无用数据

### 2. 计算优化

- **缓存机制**：计算结果缓存
- **懒计算**：按需计算
- **批量处理**：减少重复计算

### 3. 网络优化

- **预加载**：提前加载资源
- **缓存策略**：减少网络请求
- **压缩传输**：优化传输效率

这种架构设计确保了 @ldesign/router 具有良好的可维护性、可扩展性和性能表现，为用户提供了强大而灵活的
路由解决方案。
