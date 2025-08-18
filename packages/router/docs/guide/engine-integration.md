# 引擎集成

@ldesign/router 与 @ldesign/engine 深度集成，提供了统一的插件系统、状态管理和生命周期管理。

## 🎯 核心概念

引擎集成提供以下核心功能：

- **插件化架构**: 路由器作为引擎插件运行
- **状态集成**: 路由状态与全局状态管理集成
- **生命周期管理**: 统一的组件和插件生命周期
- **错误处理**: 集中的错误处理和恢复机制

## 🚀 快速开始

### 基础集成

```typescript
import { createEngine } from '@ldesign/engine'
import { createRouterEnginePlugin } from '@ldesign/router/engine'

// 创建引擎实例
const engine = createEngine({
  version: '1.0.0',
  debug: true,
})

// 创建路由引擎插件
const routerPlugin = createRouterEnginePlugin({
  routes: [
    { path: '/', component: () => import('./views/Home.vue') },
    { path: '/about', component: () => import('./views/About.vue') },
  ],
  mode: 'history', // 'history' | 'hash' | 'memory'
  base: '/',
  version: '1.0.0',
})

// 注册路由插件
await engine.use(routerPlugin)

// 启动应用
await engine.mount('#app')
```

### 与其他插件集成

```typescript
import { createEngine } from '@ldesign/engine'
import { createRouterEnginePlugin } from '@ldesign/router/engine'
import { createI18nEnginePlugin } from '@ldesign/i18n/engine'
import { createStoreEnginePlugin } from '@ldesign/store/engine'

const engine = createEngine({
  version: '1.0.0',
  debug: process.env.NODE_ENV === 'development',
})

// 注册状态管理插件
await engine.use(
  createStoreEnginePlugin({
    version: '1.0.0',
    stores: {
      user: () => import('./stores/user'),
      app: () => import('./stores/app'),
    },
  })
)

// 注册国际化插件
await engine.use(
  createI18nEnginePlugin({
    version: '1.0.0',
    locale: 'zh-CN',
    messages: {
      'zh-CN': () => import('./locales/zh-CN.json'),
      'en-US': () => import('./locales/en-US.json'),
    },
  })
)

// 注册路由插件
await engine.use(
  createRouterEnginePlugin({
    routes: routeConfig,
    version: '1.0.0',
    mode: 'history',
  })
)

// 启动应用
await engine.mount('#app')
```

## 🔄 状态集成

### 路由状态管理

路由器自动将路由状态集成到引擎的状态管理系统中：

```typescript
// 在组件中访问路由状态
import { useEngineState } from '@ldesign/engine'

export default {
  setup() {
    const { state } = useEngineState()

    // 访问路由状态
    const routerState = computed(() => state.value.router)

    return {
      currentRoute: computed(() => routerState.value.currentRoute),
      isNavigating: computed(() => routerState.value.isNavigating),
      navigationHistory: computed(() => routerState.value.history),
    }
  },
}
```

### 状态持久化

```typescript
const routerPlugin = createRouterEnginePlugin({
  routes: routeConfig,
  version: '1.0.0',

  // 启用状态集成
  stateIntegration: {
    enabled: true,

    // 启用状态持久化
    persistent: true,

    // 持久化配置
    persistConfig: {
      key: 'router-state',
      storage: 'localStorage', // 'localStorage' | 'sessionStorage'

      // 要持久化的状态字段
      include: ['history', 'forwardHistory'],

      // 排除的字段
      exclude: ['isNavigating', 'error'],
    },
  },
})
```

## 🎨 插件开发

### 创建路由插件

```typescript
import { defineEnginePlugin } from '@ldesign/engine'
import { useRouter } from '@ldesign/router'

// 创建自定义路由插件
export const createCustomRouterPlugin = defineEnginePlugin({
  name: 'custom-router',
  version: '1.0.0',

  async install(engine) {
    const router = engine.router

    if (!router) {
      throw new Error('Router plugin is required')
    }

    // 添加全局前置守卫
    router.beforeEach((to, from, next) => {
      // 记录导航日志
      engine.logger.info(`导航: ${from.path} -> ${to.path}`)

      // 检查权限
      if (to.meta.requiresAuth && !engine.store?.user?.isAuthenticated) {
        next('/login')
      } else {
        next()
      }
    })

    // 添加导航错误处理
    router.onError(error => {
      engine.errors.captureError(error, null, 'router-navigation')
    })

    // 性能监控
    router.afterEach((to, from) => {
      engine.performance.mark(`route-${to.name}-end`)
      engine.performance.measure(
        `route-${to.name}`,
        `route-${to.name}-start`,
        `route-${to.name}-end`
      )
    })
  },

  async uninstall(engine) {
    // 清理资源
    engine.logger.info('Custom router plugin uninstalled')
  },
})
```

### 插件配置

```typescript
const customPlugin = createCustomRouterPlugin({
  // 插件特定配置
  logLevel: 'info',
  enablePerformanceMonitoring: true,
  authRedirectPath: '/login',
})

await engine.use(customPlugin)
```

## 🛡️ 错误处理

### 集中错误处理

```typescript
const routerPlugin = createRouterEnginePlugin({
  routes: routeConfig,
  version: '1.0.0',

  // 错误处理配置
  errorHandling: {
    // 启用错误捕获
    enabled: true,

    // 导航错误处理
    onNavigationError: (error, to, from) => {
      console.error('导航错误:', error)

      // 上报错误
      engine.errors.captureError(error, null, 'navigation')

      // 回退到安全路由
      return '/error'
    },

    // 组件加载错误处理
    onComponentError: (error, component, route) => {
      console.error('组件加载错误:', error)

      // 显示错误页面
      return () => import('./components/ErrorBoundary.vue')
    },
  },
})
```

### 错误边界组件

```vue
<!-- ErrorBoundary.vue -->
<template>
  <div class="error-boundary">
    <div v-if="hasError" class="error-content">
      <h2>页面加载失败</h2>
      <p>{{ errorMessage }}</p>
      <button @click="retry">重试</button>
      <button @click="goHome">返回首页</button>
    </div>
    <slot v-else />
  </div>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from '@ldesign/router'
import { useEngine } from '@ldesign/engine'

const router = useRouter()
const engine = useEngine()

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((error, instance, info) => {
  hasError.value = true
  errorMessage.value = error.message

  // 上报错误到引擎
  engine.errors.captureError(error, instance, info)

  return false // 阻止错误继续传播
})

function retry() {
  hasError.value = false
  errorMessage.value = ''
  // 重新加载当前路由
  router.go(0)
}

function goHome() {
  hasError.value = false
  router.push('/')
}
</script>
```

## 📊 性能监控

### 路由性能监控

```typescript
const routerPlugin = createRouterEnginePlugin({
  routes: routeConfig,
  version: '1.0.0',

  // 性能监控配置
  performance: {
    enabled: true,

    // 监控指标
    metrics: {
      navigationTime: true,
      componentLoadTime: true,
      routeMatchTime: true,
    },

    // 性能阈值
    thresholds: {
      navigationTime: 1000, // 1秒
      componentLoadTime: 500, // 500毫秒
      routeMatchTime: 100, // 100毫秒
    },

    // 性能报告
    onPerformanceReport: metrics => {
      engine.performance.report('router', metrics)
    },
  },
})
```

### 自定义性能监控

```vue
<script setup>
import { useRouter } from '@ldesign/router'
import { useEngine } from '@ldesign/engine'
import { onMounted, watch } from 'vue'

const router = useRouter()
const engine = useEngine()

// 监控路由变化性能
watch(
  () => router.currentRoute.value,
  (to, from) => {
    if (from) {
      const navigationTime = performance.now() - navigationStartTime

      // 记录性能指标
      engine.performance.record('route-navigation', {
        from: from.path,
        to: to.path,
        duration: navigationTime,
        timestamp: Date.now(),
      })

      // 性能警告
      if (navigationTime > 1000) {
        engine.logger.warn(`慢导航检测: ${from.path} -> ${to.path} (${navigationTime}ms)`)
      }
    }
  }
)

let navigationStartTime = 0

// 监听导航开始
router.beforeEach((to, from, next) => {
  navigationStartTime = performance.now()
  next()
})
</script>
```

## 🔧 高级配置

### 自定义引擎适配器

```typescript
import { EngineAdapter } from '@ldesign/router/engine'

class CustomEngineAdapter extends EngineAdapter {
  async install(engine) {
    await super.install(engine)

    // 自定义安装逻辑
    this.setupCustomFeatures(engine)
  }

  private setupCustomFeatures(engine) {
    // 添加自定义中间件
    engine.middleware.add('router-auth', (context, next) => {
      if (context.route?.meta?.requiresAuth) {
        // 权限检查逻辑
        return this.checkAuth(context, next)
      }
      return next()
    })

    // 添加自定义指令
    engine.directives.add('router-link-active', {
      mounted(el, binding) {
        // 自定义指令逻辑
      },
    })
  }

  private async checkAuth(context, next) {
    const user = await engine.store.user.getCurrentUser()
    if (user) {
      return next()
    } else {
      return engine.router.push('/login')
    }
  }
}

// 使用自定义适配器
const routerPlugin = createRouterEnginePlugin({
  routes: routeConfig,
  adapter: CustomEngineAdapter,
})
```

### 微前端集成

```typescript
// 主应用
const mainEngine = createEngine({
  version: '1.0.0',
  microFrontend: {
    enabled: true,
    mode: 'host', // 'host' | 'remote'
  },
})

// 路由配置支持微前端
const routes = [
  {
    path: '/app1/*',
    name: 'MicroApp1',
    component: () => import('./micro-apps/App1.vue'),
    meta: {
      microApp: {
        name: 'app1',
        entry: 'http://localhost:3001',
        container: '#micro-app1',
      },
    },
  },
]

const routerPlugin = createRouterEnginePlugin({
  routes,
  microFrontend: {
    enabled: true,

    // 微前端路由同步
    syncRoutes: true,

    // 状态共享
    sharedState: ['user', 'theme'],

    // 通信机制
    communication: {
      enabled: true,
      channel: 'router-events',
    },
  },
})
```

## 🎯 最佳实践

### 1. 插件顺序

```typescript
const engine = createEngine({ version: '1.0.0' })

// 按依赖顺序注册插件
await engine.use(
  createStoreEnginePlugin({
    /* 状态管理 */
  })
)
await engine.use(
  createI18nEnginePlugin({
    /* 国际化 */
  })
)
await engine.use(
  createRouterEnginePlugin({
    /* 路由 */
  })
)
await engine.use(
  createUIEnginePlugin({
    /* UI组件 */
  })
)
```

### 2. 环境配置

```typescript
const isDev = process.env.NODE_ENV === 'development'

const routerPlugin = createRouterEnginePlugin({
  routes: routeConfig,
  version: '1.0.0',

  // 开发环境配置
  debug: isDev,

  // 生产环境优化
  performance: {
    enabled: !isDev,
    lazy: !isDev,
  },

  // 错误处理
  errorHandling: {
    enabled: true,
    reportErrors: !isDev,
  },
})
```

### 3. 资源管理

```typescript
// 在组件中正确使用引擎资源
export default {
  setup() {
    const engine = useEngine()
    const router = useRouter()

    onUnmounted(() => {
      // 清理资源
      engine.cleanup()
    })

    return {
      // 导出需要的功能
    }
  },
}
```

## 🔍 调试技巧

### 开发工具集成

```typescript
const routerPlugin = createRouterEnginePlugin({
  routes: routeConfig,
  version: '1.0.0',

  // 开发工具配置
  devtools: {
    enabled: process.env.NODE_ENV === 'development',

    // 路由调试
    routeInspector: true,

    // 性能分析
    performanceProfiler: true,

    // 状态检查器
    stateInspector: true,
  },
})
```

### 日志配置

```typescript
const engine = createEngine({
  version: '1.0.0',

  // 日志配置
  logger: {
    level: 'debug',

    // 路由日志
    categories: {
      router: 'info',
      navigation: 'debug',
      performance: 'warn',
    },
  },
})
```

## 📚 相关文档

- [引擎核心](https://ldesign.dev/engine/) - 了解引擎架构
- [插件开发](./custom-plugins.md) - 学习插件开发
- [性能监控](./performance-monitoring.md) - 深入性能优化
- [状态管理集成](https://ldesign.dev/store/integration) - 状态管理集成指南
