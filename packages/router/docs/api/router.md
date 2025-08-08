# Router API

Router 是 LDesign Router 的核心类，负责管理应用的路由状态和导航。

## 创建路由器

### createRouter

创建一个新的路由器实例。

```typescript
function createRouter(options: RouterOptions): Router
```

**参数：**

- `options: RouterOptions` - 路由器配置选项

**示例：**

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
  ],
  // 高级选项
  preloadStrategy: 'hover',
  performance: true,
  cache: { max: 20 },
})
```

## RouterOptions

路由器配置选项接口。

```typescript
interface RouterOptions {
  history: RouterHistory
  routes: RouteRecordRaw[]
  preloadStrategy?: PreloadStrategy
  performance?: boolean
  cache?: CacheOptions
  scrollBehavior?: ScrollBehavior
  parseQuery?: (query: string) => Record<string, any>
  stringifyQuery?: (query: Record<string, any>) => string
}
```

### 属性详解

#### history

- **类型：** `RouterHistory`
- **必需：** 是
- **说明：** 历史模式实例

```typescript
// Web History 模式
history: createWebHistory()

// Hash 模式
history: createWebHashHistory()

// Memory 模式（用于 SSR）
history: createMemoryHistory()
```

#### routes

- **类型：** `RouteRecordRaw[]`
- **必需：** 是
- **说明：** 路由配置数组

```typescript
routes: [
  {
    path: '/',
    name: 'Home',
    component: () => import('./views/Home.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('./views/User.vue'),
    props: true,
  },
]
```

#### preloadStrategy

- **类型：** `'hover' | 'visible' | 'idle' | 'immediate'`
- **默认值：** `undefined`
- **说明：** 预加载策略

```typescript
// 悬停时预加载
preloadStrategy: 'hover'

// 可见时预加载
preloadStrategy: 'visible'

// 空闲时预加载
preloadStrategy: 'idle'

// 立即预加载
preloadStrategy: 'immediate'
```

#### performance

- **类型：** `boolean`
- **默认值：** `false`
- **说明：** 是否启用性能监控

```typescript
performance: true
```

#### cache

- **类型：** `CacheOptions`
- **默认值：** `undefined`
- **说明：** 缓存配置

```typescript
cache: {
  max: 20,                    // 最大缓存数量
  ttl: 5 * 60 * 1000,        // 缓存时间（毫秒）
  include: [/^\/user/],       // 包含规则
  exclude: ['/login']         // 排除规则
}
```

## Router 实例

### 属性

#### currentRoute

- **类型：** `Ref<RouteLocationNormalized>`
- **说明：** 当前路由位置的响应式引用

```typescript
const router = useRouter()
const currentRoute = router.currentRoute

// 监听路由变化
watch(currentRoute, (to, from) => {
  console.log('路由变化:', from.path, '->', to.path)
})
```

#### options

- **类型：** `RouterOptions`
- **说明：** 路由器配置选项

```typescript
const options = router.options
console.log('预加载策略:', options.preloadStrategy)
```

### 导航方法

#### push

推送一个新的导航条目到历史栈。

```typescript
push(to: RouteLocationRaw): Promise<NavigationFailure | void>
```

**参数：**

- `to: RouteLocationRaw` - 目标路由位置

**示例：**

```typescript
// 字符串路径
router.push('/about')

// 对象形式
router.push({ name: 'User', params: { id: '123' } })

// 带查询参数
router.push({ path: '/search', query: { q: 'vue' } })

// 异步处理
router
  .push('/about')
  .then(() => {
    console.log('导航完成')
  })
  .catch(err => {
    console.log('导航失败:', err)
  })
```

#### replace

替换当前的历史条目。

```typescript
replace(to: RouteLocationRaw): Promise<NavigationFailure | void>
```

**示例：**

```typescript
// 替换当前路由，不会在历史中留下记录
router.replace('/login')
```

#### go

在历史栈中前进或后退指定步数。

```typescript
go(delta: number): void
```

**参数：**

- `delta: number` - 前进或后退的步数

**示例：**

```typescript
router.go(-1) // 后退一步
router.go(1) // 前进一步
router.go(-3) // 后退三步
```

#### back

后退一步，等同于 `go(-1)`。

```typescript
back(): void
```

**示例：**

```typescript
router.back()
```

#### forward

前进一步，等同于 `go(1)`。

```typescript
forward(): void
```

**示例：**

```typescript
router.forward()
```

### 路由管理

#### addRoute

动态添加路由。

```typescript
addRoute(route: RouteRecordRaw): () => void
addRoute(parentName: string, route: RouteRecordRaw): () => void
```

**参数：**

- `route: RouteRecordRaw` - 要添加的路由记录
- `parentName: string` - 父路由名称（可选）

**返回值：**

- `() => void` - 移除该路由的函数

**示例：**

```typescript
// 添加顶级路由
const removeRoute = router.addRoute({
  path: '/new-page',
  name: 'NewPage',
  component: () => import('./views/NewPage.vue'),
})

// 添加子路由
router.addRoute('Parent', {
  path: 'child',
  name: 'Child',
  component: ChildComponent,
})

// 移除路由
removeRoute()
```

#### removeRoute

移除指定的路由。

```typescript
removeRoute(name: string): void
```

**参数：**

- `name: string` - 要移除的路由名称

**示例：**

```typescript
router.removeRoute('OldPage')
```

#### hasRoute

检查是否存在指定名称的路由。

```typescript
hasRoute(name: string): boolean
```

**参数：**

- `name: string` - 路由名称

**示例：**

```typescript
if (router.hasRoute('UserProfile')) {
  console.log('用户资料路由存在')
}
```

#### getRoutes

获取所有路由记录。

```typescript
getRoutes(): RouteRecordNormalized[]
```

**示例：**

```typescript
const routes = router.getRoutes()
console.log('所有路由:', routes)
```

#### resolve

解析路由位置。

```typescript
resolve(to: RouteLocationRaw): RouteLocationResolved
```

**参数：**

- `to: RouteLocationRaw` - 要解析的路由位置

**示例：**

```typescript
const resolved = router.resolve('/user/123')
console.log('解析结果:', resolved)

const resolvedNamed = router.resolve({
  name: 'User',
  params: { id: '123' },
})
```

### 导航守卫

#### beforeEach

注册全局前置守卫。

```typescript
beforeEach(guard: NavigationGuard): () => void
```

**参数：**

- `guard: NavigationGuard` - 导航守卫函数

**示例：**

```typescript
const removeGuard = router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})

// 移除守卫
removeGuard()
```

#### beforeResolve

注册全局解析守卫。

```typescript
beforeResolve(guard: NavigationGuard): () => void
```

**示例：**

```typescript
router.beforeResolve((to, from, next) => {
  // 在导航被确认之前调用
  console.log('即将导航到:', to.path)
  next()
})
```

#### afterEach

注册全局后置钩子。

```typescript
afterEach(hook: NavigationHook): () => void
```

**参数：**

- `hook: NavigationHook` - 导航钩子函数

**示例：**

```typescript
router.afterEach((to, from) => {
  // 更新页面标题
  document.title = to.meta.title || 'My App'

  // 发送页面浏览统计
  analytics.track('page_view', {
    path: to.path,
    name: to.name,
  })
})
```

#### onError

注册错误处理器。

```typescript
onError(handler: ErrorHandler): () => void
```

**参数：**

- `handler: ErrorHandler` - 错误处理函数

**示例：**

```typescript
router.onError((error, to, from) => {
  console.error('路由错误:', error)

  // 发送错误报告
  errorReporting.captureException(error, {
    tags: {
      section: 'router',
      route_from: from.path,
      route_to: to.path,
    },
  })
})
```

### 高级功能

#### preloadRoute

预加载指定路由。

```typescript
preloadRoute(to: RouteLocationRaw): Promise<void>
```

**示例：**

```typescript
// 预加载用户资料页面
router.preloadRoute({ name: 'User', params: { id: '123' } })
```

#### clearPreloadCache

清除预加载缓存。

```typescript
clearPreloadCache(routeKey?: string): void
```

**示例：**

```typescript
// 清除所有预加载缓存
router.clearPreloadCache()

// 清除指定路由的缓存
router.clearPreloadCache('/user/123')
```

#### getPerformanceStats

获取性能统计信息。

```typescript
getPerformanceStats(): PerformanceStats
```

**示例：**

```typescript
const stats = router.getPerformanceStats()
console.log('性能统计:', {
  totalNavigations: stats.totalNavigations,
  averageDuration: stats.averageDuration,
  successRate: stats.successRate,
})
```

#### getCacheStats

获取缓存统计信息。

```typescript
getCacheStats(): CacheStats
```

**示例：**

```typescript
const cacheStats = router.getCacheStats()
console.log('缓存统计:', {
  size: cacheStats.size,
  hitRate: cacheStats.hitRate,
  maxSize: cacheStats.maxSize,
})
```

#### clearRouteCache

清除路由缓存。

```typescript
clearRouteCache(routeKey?: string): void
```

**示例：**

```typescript
// 清除所有缓存
router.clearRouteCache()

// 清除指定路由缓存
router.clearRouteCache('/user/123')
```

### 应用集成

#### install

Vue 插件安装方法。

```typescript
install(app: App): void
```

**示例：**

```typescript
import { createApp } from 'vue'
import router from './router'

const app = createApp(App)
app.use(router) // 内部调用 router.install(app)
```

#### isReady

等待路由器准备就绪。

```typescript
isReady(): Promise<void>
```

**示例：**

```typescript
router.isReady().then(() => {
  console.log('路由器已准备就绪')
  app.mount('#app')
})
```

## 类型定义

### NavigationGuard

```typescript
type NavigationGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => any
```

### NavigationHook

```typescript
type NavigationHook = (to: RouteLocationNormalized, from: RouteLocationNormalized) => any
```

### ErrorHandler

```typescript
type ErrorHandler = (error: any, to: RouteLocationNormalized, from: RouteLocationNormalized) => any
```
