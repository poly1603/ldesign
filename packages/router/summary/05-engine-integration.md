# Engine 集成详解

## 概述

@ldesign/router 提供了完整的 LDesign Engine 集成支持，通过 Engine 插件机制实现无缝集成。这种集成方式
不仅简化了路由器的使用，还提供了更好的状态管理、事件系统和生命周期管理。

## 设计理念

### 1. 插件化架构

遵循 LDesign Engine 的插件规范，将路由器作为一个标准的 Engine 插件：

```typescript
interface Plugin {
  name: string
  version: string
  dependencies?: string[]
  install: (engine: Engine) => Promise<void>
  uninstall?: (engine: Engine) => Promise<void>
}
```

### 2. 状态同步

自动将路由状态同步到 Engine 的状态管理系统：

- `router:currentRoute` - 当前路由信息
- `router:mode` - 路由模式（history/hash/memory）
- `router:base` - 基础路径

### 3. 事件集成

集成 Engine 事件系统，支持路由变化监听：

- `router:navigated` - 路由导航完成事件
- `router:error` - 路由错误事件
- `plugin:router:installed` - 插件安装完成事件
- `plugin:router:uninstalled` - 插件卸载事件

## 核心实现

### 1. 插件工厂函数

#### createRouterEnginePlugin

主要的插件创建函数，支持完整的配置选项：

```typescript
export function createRouterEnginePlugin(options: RouterEnginePluginOptions): Plugin {
  const {
    name = 'router',
    version = '1.0.0',
    routes,
    mode = 'history',
    base = '/',
    scrollBehavior,
    linkActiveClass,
    linkExactActiveClass,
  } = options

  return {
    name,
    version,
    dependencies: [],

    async install(engine) {
      // 1. 获取 Vue 应用实例
      const vueApp = engine.getApp()

      // 2. 创建历史管理器
      const history = createHistory(mode, base)

      // 3. 创建路由器实例
      const router = createRouter({ history, routes, ... })

      // 4. 安装到 Vue 应用
      vueApp.use(router)

      // 5. 注册到 Engine
      engine.setRouter(router)

      // 6. 同步状态
      syncRouterState(engine, router)

      // 7. 监听路由变化
      setupRouterListeners(engine, router)

      // 8. 等待路由器准备就绪
      await router.isReady()
    },

    async uninstall(engine) {
      // 清理路由器引用和状态
      cleanupRouter(engine)
    }
  }
}
```

#### routerPlugin

向后兼容的别名函数：

```typescript
export function routerPlugin(options: RouterEnginePluginOptions): Plugin {
  return createRouterEnginePlugin(options)
}
```

#### createDefaultRouterEnginePlugin

使用默认配置的便捷函数：

```typescript
export function createDefaultRouterEnginePlugin(routes: RouteRecordRaw[]): Plugin {
  return createRouterEnginePlugin({
    routes,
    mode: 'history',
    base: '/',
  })
}
```

### 2. 状态同步机制

```typescript
function syncRouterState(engine: Engine, router: Router) {
  // 同步当前路由信息
  engine.state.set('router:currentRoute', router.currentRoute)
  engine.state.set('router:mode', mode)
  engine.state.set('router:base', base)

  // 监听路由变化，更新状态
  router.afterEach((to, from) => {
    engine.state.set('router:currentRoute', to)

    // 触发路由变化事件
    engine.events.emit('router:navigated', { to, from })
  })
}
```

### 3. 错误处理

```typescript
function setupErrorHandling(engine: Engine, router: Router) {
  // 监听路由错误
  router.onError(error => {
    engine.logger.error('Router navigation error:', error)
    engine.events.emit('router:error', error)
  })
}
```

## 使用方式

### 1. 基础集成

```typescript
import { createApp } from '@ldesign/engine'
import { createRouterEnginePlugin } from '@ldesign/router'

const engine = createApp(App)

await engine.use(
  createRouterEnginePlugin({
    routes: [
      { path: '/', component: Home },
      { path: '/about', component: About },
    ],
  })
)
```

### 2. 高级配置

```typescript
const routerPlugin = createRouterEnginePlugin({
  name: 'app-router',
  version: '1.0.0',
  routes,
  mode: 'hash',
  base: '/app',
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
  linkActiveClass: 'router-link-active',
  linkExactActiveClass: 'router-link-exact-active',
})

await engine.use(routerPlugin)
```

### 3. 访问路由器

```typescript
// 通过 Engine 访问路由器
const router = engine.router

// 编程式导航
router.push('/about')
router.replace('/home')
router.go(-1)

// 监听路由变化
engine.events.on('router:navigated', ({ to, from }) => {
  console.log(`Navigated from ${from.path} to ${to.path}`)
})
```

## 优势特性

### 1. 一键集成

- 无需手动创建路由器实例
- 无需手动安装到 Vue 应用
- 自动处理所有集成细节

### 2. 状态管理

- 自动同步路由状态到 Engine
- 支持响应式状态访问
- 统一的状态管理体验

### 3. 事件系统

- 集成 Engine 事件系统
- 支持路由变化监听
- 统一的事件处理机制

### 4. 生命周期管理

- 遵循 Engine 插件规范
- 支持插件安装和卸载
- 自动清理资源

### 5. 错误处理

- 统一的错误处理机制
- 集成 Engine 日志系统
- 完善的错误报告

## 最佳实践

### 1. 插件配置

```typescript
// 推荐：使用明确的配置
const routerPlugin = createRouterEnginePlugin({
  routes: routeConfig,
  mode: 'history',
  base: process.env.BASE_URL || '/',
  scrollBehavior: scrollBehaviorConfig,
})
```

### 2. 路由监听

```typescript
// 推荐：使用 Engine 事件系统
engine.events.on('router:navigated', ({ to, from }) => {
  // 处理路由变化
  updatePageTitle(to.meta.title)
  trackPageView(to.path)
})
```

### 3. 错误处理

```typescript
// 推荐：统一错误处理
engine.events.on('router:error', error => {
  // 处理路由错误
  console.error('Router error:', error)
  // 可以重定向到错误页面
  engine.router.push('/error')
})
```

## 技术细节

### 1. 依赖管理

- 插件不依赖其他 Engine 插件
- 自动检测 Vue 应用实例
- 兼容不同的 Engine 版本

### 2. 性能优化

- 延迟加载路由器实例
- 避免重复安装
- 优化状态同步性能

### 3. 类型安全

- 完整的 TypeScript 支持
- 类型安全的配置选项
- 智能的类型推导

## 总结

Engine 集成是 @ldesign/router 的核心特性之一，它提供了：

1. **简化的集成体验** - 一行代码完成路由器集成
2. **统一的状态管理** - 自动同步路由状态到 Engine
3. **完整的事件支持** - 集成 Engine 事件系统
4. **标准的插件规范** - 遵循 Engine 插件架构
5. **优秀的开发体验** - 完整的类型支持和错误处理

这种集成方式不仅简化了开发流程，还提供了更好的可维护性和扩展性，是使用 @ldesign/router 的推荐方式。
