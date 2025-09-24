# LDesign Router 增强功能指南

本文档介绍了 LDesign Router 的所有增强功能和优化特性。

## 🚀 性能优化

### 智能缓存系统

```typescript
import { smartRouteCache, componentCacheOptimizer } from '@ldesign/router'

// 使用智能路由缓存
const cachedRoute = smartRouteCache.get('/user/123')
if (!cachedRoute) {
  // 缓存未命中，执行路由解析
  smartRouteCache.set('/user/123', resolvedRoute)
}

// 组件缓存优化
const component = await componentCacheOptimizer.getComponent(
  '/components/UserProfile',
  () => import('./UserProfile.vue')
)
```

### 路由预热

```typescript
import { routePrewarmer } from '@ldesign/router'

// 预热常用路由
routePrewarmer.prewarmRoutes([
  { path: '/', component: Home },
  { path: '/user/:id', component: User },
  { path: '/dashboard', component: Dashboard }
])

// 获取预热统计
const stats = routePrewarmer.getStats()
console.log(`预热了 ${stats.prewarmedCount} 个路由`)
```

### 内存优化

```typescript
import { memoryOptimizer } from '@ldesign/router'

// 启动自动内存清理
memoryOptimizer.startAutoCleanup(60000) // 每分钟清理一次

// 手动执行内存清理
memoryOptimizer.performCleanup()

// 获取内存使用情况
const usage = memoryOptimizer.getMemoryUsage()
if (usage.needsCleanup) {
  console.warn('内存使用率过高，建议清理缓存')
}
```

## 🛡️ 代码质量

### 错误处理增强

```typescript
import { routerErrorHandler, RouterErrorType, createRouterError } from '@ldesign/router'

// 自定义错误恢复策略
routerErrorHandler.addRecoveryStrategy({
  type: RouterErrorType.COMPONENT_LOAD_FAILED,
  maxRetries: 3,
  retryDelay: 1000,
  handler: async (error) => {
    console.log('组件加载失败，尝试重新加载')
    return true // 允许重试
  }
})

// 处理路由错误
router.onError(async (error, route) => {
  const recovered = await routerErrorHandler.handleError(error, route)
  if (!recovered) {
    // 错误无法恢复，显示错误页面
    router.push('/error')
  }
})
```

### 代码质量检查

```typescript
import { codeQualityChecker } from '@ldesign/router'

// 执行质量检查
const issues = codeQualityChecker.check({
  routes: routeConfig,
  currentRoute: router.currentRoute.value
})

// 生成质量报告
const report = codeQualityChecker.generateReport()
console.log(report)

// 获取问题统计
const stats = codeQualityChecker.getIssueStats()
console.log(`发现 ${stats.total} 个问题，其中 ${stats.bySeverity.ERROR || 0} 个错误`)
```

## 🔧 开发工具

### 开发调试面板

```typescript
import { createDevTools } from '@ldesign/router'

// 创建开发工具
const devTools = createDevTools(router, {
  enabled: process.env.NODE_ENV === 'development',
  hotkeys: {
    toggle: 'Ctrl+Shift+D',
    inspect: 'Ctrl+Shift+I'
  },
  features: {
    routeInspector: true,
    performanceMonitor: true,
    qualityChecker: true
  }
})

// 开发工具会自动显示在页面底部
// 使用快捷键 Ctrl+Shift+D 切换显示
```

### 测试工具

```typescript
import { setupRouterTest, createTestRouter } from '@ldesign/router'

// 快速设置测试环境
const { utils, assertions, performance } = setupRouterTest([
  { path: '/', component: Home },
  { path: '/user/:id', component: User }
])

// 测试路由导航
await utils.navigateTo('/user/123')
assertions.expectPath('/user/123')
assertions.expectParams({ id: '123' })

// 性能测试
const duration = await performance.measureNavigation(utils, '/dashboard')
console.log(`导航耗时: ${duration}ms`)
```

## 🎯 功能扩展

### 中间件系统

```typescript
import { middlewareManager, authMiddleware, loggingMiddleware } from '@ldesign/router'

// 注册内置中间件
middlewareManager.register(authMiddleware)
middlewareManager.register(loggingMiddleware)

// 自定义中间件
middlewareManager.register({
  name: 'analytics',
  priority: 50,
  handler: async (to, from, next, context) => {
    // 记录页面访问
    analytics.track('page_view', {
      path: to.path,
      referrer: from.path
    })
    next()
  }
})

// 在路由器中使用中间件
router.beforeEach(async (to, from, next) => {
  await middlewareManager.execute(to, from, next)
})
```

### 路由状态管理

```typescript
import { createRouteStateManager, useRouteState } from '@ldesign/router'

// 创建状态管理器
const stateManager = createRouteStateManager(router)

// 在组件中使用
export default {
  setup() {
    const {
      current,
      previous,
      history,
      isNavigating,
      canGoBack,
      mostVisitedRoutes
    } = useRouteState(stateManager)

    return {
      current,
      previous,
      history,
      isNavigating,
      canGoBack,
      mostVisitedRoutes
    }
  }
}
```

### 路由分析

```typescript
import { createRouteAnalytics } from '@ldesign/router'

// 创建分析器
const analytics = createRouteAnalytics(router, {
  enabled: true,
  sampleRate: 0.1, // 10% 采样率
  collectPerformance: true,
  collectBehavior: true,
  endpoint: '/api/analytics'
})

// 获取分析报告
const report = analytics.getReport()
console.log('路由分析报告:', report)

// 报告包含：
// - 总访问次数
// - 独特路由数量
// - 路由访问统计
// - 性能统计
// - 用户行为事件
```

## 📊 监控和分析

### 性能监控

```typescript
import { getPerformanceStats } from '@ldesign/router'

// 获取性能统计
const stats = getPerformanceStats()
console.log('缓存命中率:', stats.monitor.hitRate)
console.log('内存使用率:', stats.memory.usageRatio)
console.log('预热路由数:', stats.prewarmer.prewarmedCount)
```

### 实时监控

```typescript
// 订阅路由状态变化
const unsubscribe = stateManager.subscribe((state) => {
  console.log('当前路由:', state.current.path)
  console.log('导航状态:', state.isNavigating)
  console.log('历史记录数:', state.history.length)
})

// 取消订阅
unsubscribe()
```

## 🎨 最佳实践

### 1. 性能优化建议

```typescript
// 启用所有性能优化功能
const router = createRouter({
  routes,
  // 启用路由预热
  preload: { enabled: true, strategy: 'hover' },
  // 启用智能缓存
  cache: { enabled: true, strategy: 'memory', maxSize: 50 },
  // 启用性能监控
  performance: { enabled: true, warningThreshold: 100 }
})

// 预热关键路由
routePrewarmer.prewarmRoutes(criticalRoutes)

// 启动内存优化
memoryOptimizer.startAutoCleanup()
```

### 2. 开发环境配置

```typescript
if (process.env.NODE_ENV === 'development') {
  // 启用开发工具
  const devTools = createDevTools(router)
  
  // 启用代码质量检查
  const issues = codeQualityChecker.check({ routes })
  if (issues.length > 0) {
    console.warn('发现代码质量问题:', issues)
  }
  
  // 启用详细日志
  middlewareManager.register(loggingMiddleware)
}
```

### 3. 生产环境配置

```typescript
if (process.env.NODE_ENV === 'production') {
  // 启用路由分析
  const analytics = createRouteAnalytics(router, {
    sampleRate: 0.05, // 5% 采样率
    endpoint: '/api/analytics'
  })
  
  // 启用错误恢复
  routerErrorHandler.addRecoveryStrategy(/* ... */)
  
  // 启用性能监控
  const performanceMonitor = createPerformanceMonitor(router)
}
```

## 🔗 集成示例

### 与 Vue 3 集成

```typescript
import { createApp } from 'vue'
import { createRouter } from '@ldesign/router'
import { middlewareManager, authMiddleware } from '@ldesign/router'

const app = createApp(App)
const router = createRouter({ routes })

// 注册中间件
middlewareManager.register(authMiddleware)

// 使用中间件
router.beforeEach(middlewareManager.execute.bind(middlewareManager))

app.use(router)
app.mount('#app')
```

### 与状态管理集成

```typescript
import { createStore } from 'vuex'
import { createRouteStateManager } from '@ldesign/router'

const store = createStore({ /* ... */ })
const stateManager = createRouteStateManager(router)

// 同步路由状态到 Vuex
stateManager.subscribe((state) => {
  store.commit('updateRouteState', state)
})
```

这些增强功能让 LDesign Router 成为一个功能完整、性能优异的现代路由解决方案。
