# API 参考

LDesign Engine 提供了丰富的 API 来构建强大的 Vue 应用。本节包含所有公共 API 的详细文档。

## 核心 API

### 引擎创建

```typescript
import { createEngine } from '@ldesign/engine'

// 创建引擎实例
const engine = createEngine(config?: EngineConfig)
```

### 引擎配置

```typescript
interface EngineConfig {
  config?: AppConfig
  plugins?: Plugin[]
  middleware?: Middleware[]
  state?: StateConfig
  events?: EventConfig
  cache?: CacheConfig
  security?: SecurityConfig
  performance?: PerformanceConfig
  logger?: LoggerConfig
}
```

## 管理器 API

LDesign Engine 包含多个管理器，每个管理器负责特定的功能领域：

### 🔌 [插件管理器](./plugin-manager.md)

管理插件的注册、卸载和生命周期。

```typescript
engine.plugins.register(plugin: Plugin)
engine.plugins.unregister(name: string)
engine.plugins.isRegistered(name: string): boolean
```

### ⚡ [中间件管理器](./middleware-manager.md)

处理中间件的注册和执行。

```typescript
engine.middleware.use(middleware: Middleware)
engine.middleware.execute(context: MiddlewareContext)
```

### 📡 [事件管理器](./event-manager.md)

> 更新提示：事件管理器新增命名空间、批量监听、事件管道、条件监听、防抖/节流；缓存管理器新增 warmup、preload 以及统计信息增强。

提供发布订阅模式的事件系统。

```typescript
engine.events.on(event: string, handler: Function)
engine.events.emit(event: string, data?: any)
engine.events.off(event: string, handler?: Function)
```

### 💾 [状态管理器](./state-manager.md)

管理应用的响应式状态。

```typescript
engine.state.set(key: string, value: any)
engine.state.get(key: string): any
engine.state.subscribe(key: string, callback: Function)
```

### 📝 [日志管理器](./logger.md)

提供结构化的日志记录功能。

```typescript
engine.logger.info(message: string, meta?: any)
engine.logger.error(message: string, error?: Error)
engine.logger.warn(message: string, meta?: any)
```

### 🔔 [通知管理器](./notification-manager.md)

管理全局通知和消息。

```typescript
engine.notifications.success(message: string, options?: NotificationOptions)
engine.notifications.error(message: string, options?: NotificationOptions)
```

### 🛡️ [安全管理器](./security-manager.md)

提供安全防护功能。

```typescript
engine.security.sanitize(input: string): string
engine.security.validateCSRF(token: string): boolean
```

### ⚡ [性能管理器](./performance-manager.md)

监控和优化应用性能。

```typescript
engine.performance.mark(name: string)
engine.performance.measure(name: string, start: string, end: string)
```

### 💾 [缓存管理器](./cache-manager.md)

提供多种缓存策略。

```typescript
engine.cache.set(key: string, value: any, ttl?: number)
engine.cache.get(key: string): any
engine.cache.delete(key: string): boolean
```

### 🎯 [指令管理器](./directive-manager.md)

管理自定义 Vue 指令。

```typescript
engine.directives.register(name: string, directive: DirectiveDefinition)
engine.directives.unregister(name: string)
```

### ❌ [错误管理器](./error-manager.md)

处理错误捕获和报告。

```typescript
engine.errors.capture(error: Error, context?: any)
engine.errors.report(error: Error, options?: ReportOptions)
```

## 工厂函数

### createEngine

创建引擎实例的主要工厂函数。

```typescript
function createEngine(config?: EngineConfig): Engine
```

**参数：**

- `config` - 可选的引擎配置对象

**返回值：**

- `Engine` - 引擎实例

**示例：**

```typescript
import { createEngine } from '@ldesign/engine'

const engine = createEngine({
  config: {
    debug: true,
    appName: 'My App',
  },
  plugins: [myPlugin],
  middleware: [authMiddleware],
})
```

### createPlugin

创建插件的工厂函数。

```typescript
function createPlugin(definition: PluginDefinition): Plugin
```

**参数：**

- `definition` - 插件定义对象

**返回值：**

- `Plugin` - 插件实例

**示例：**

```typescript
import { createPlugin } from '@ldesign/engine'

const myPlugin = createPlugin({
  name: 'my-plugin',
  version: '1.0.0',
  install: (engine) => {
    // 插件安装逻辑
  },
})
```

### createMiddleware

创建中间件的工厂函数。

```typescript
function createMiddleware(definition: MiddlewareDefinition): Middleware
```

**参数：**

- `definition` - 中间件定义对象

**返回值：**

- `Middleware` - 中间件实例

**示例：**

```typescript
import { createMiddleware } from '@ldesign/engine'

const authMiddleware = createMiddleware({
  name: 'auth',
  handler: async (context, next) => {
    // 认证逻辑
    await next()
  },
})
```

## 类型定义

### 核心类型

```typescript
// 引擎实例
interface Engine {
  readonly config: AppConfig
  readonly plugins: PluginManager
  readonly middleware: MiddlewareManager
  readonly events: EventManager
  readonly state: StateManager
  readonly logger: Logger
  readonly notifications: NotificationManager
  readonly security: SecurityManager
  readonly performance: PerformanceManager
  readonly cache: CacheManager
  readonly directives: DirectiveManager
  readonly errors: ErrorManager

  use: (plugin: Plugin) => Engine
  mount: (app: App) => void
  unmount: () => void
  destroy: () => void
}

// 插件定义
interface Plugin {
  name: string
  version?: string
  dependencies?: string[]
  install: (engine: Engine) => void | Promise<void>
  uninstall?: (engine: Engine) => void | Promise<void>
}

// 中间件定义
interface Middleware {
  name: string
  priority?: number
  handler: MiddlewareHandler
}

type MiddlewareHandler = (context: MiddlewareContext, next: () => Promise<void>) => Promise<void>

// 中间件上下文
interface MiddlewareContext {
  engine: Engine
  phase: string
  data?: any
  [key: string]: any
}
```

### 配置类型

```typescript
// 应用配置
interface AppConfig {
  appName?: string
  version?: string
  debug?: boolean
  logLevel?: LogLevel
  enablePerformanceMonitoring?: boolean
  enableErrorReporting?: boolean
  autoSaveState?: boolean
  stateSaveInterval?: number
  [key: string]: any
}

// 日志级别
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

// 状态配置
interface StateConfig {
  initialState?: Record<string, any>
  persistence?: PersistenceConfig
  validation?: ValidationConfig
  history?: HistoryConfig
}

// 事件配置
interface EventConfig {
  maxListeners?: number
  queueSize?: number
  async?: boolean
  enablePriority?: boolean
  namespaces?: string[]
  middleware?: EventMiddleware[]
  debug?: EventDebugConfig
}
```

## 工具函数

### 配置合并

```typescript
import { mergeConfig } from '@ldesign/engine'

const merged = mergeConfig(baseConfig, overrideConfig)
```

### 类型检查

```typescript
import { isEngine, isMiddleware, isPlugin } from '@ldesign/engine'

if (isPlugin(obj)) {
  // obj 是有效的插件
}
```

### 版本检查

```typescript
import { checkVersion, compareVersions } from '@ldesign/engine'

const isCompatible = checkVersion('1.0.0', '>=1.0.0')
const comparison = compareVersions('1.2.0', '1.1.0') // 1
```

## 常量

### 事件名称

```typescript
// 引擎生命周期事件
export const ENGINE_EVENTS = {
  CREATED: 'engine:created',
  MOUNTED: 'engine:mounted',
  UNMOUNTED: 'engine:unmounted',
  DESTROYED: 'engine:destroyed',
} as const

// 插件事件
export const PLUGIN_EVENTS = {
  REGISTERED: 'plugin:registered',
  UNREGISTERED: 'plugin:unregistered',
  ERROR: 'plugin:error',
} as const

// 状态事件
export const STATE_EVENTS = {
  CHANGED: 'state:changed',
  PERSISTED: 'state:persisted',
  RESTORED: 'state:restored',
} as const
```

### 默认配置

```typescript
export const DEFAULT_CONFIG: EngineConfig = {
  config: {
    debug: false,
    logLevel: 'info',
    enablePerformanceMonitoring: true,
    enableErrorReporting: false,
    autoSaveState: true,
    stateSaveInterval: 30000,
  },
}
```

## 错误类型

```typescript
// 引擎错误
export class EngineError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'EngineError'
  }
}

// 插件错误
export class PluginError extends EngineError {
  constructor(message: string, public pluginName: string) {
    super(message)
    this.name = 'PluginError'
  }
}

// 配置错误
export class ConfigError extends EngineError {
  constructor(message: string, public configKey?: string) {
    super(message)
    this.name = 'ConfigError'
  }
}
```

## 使用示例

### 基础使用

```typescript
import { createEngine } from '@ldesign/engine'

// 创建引擎
const engine = createEngine({
  config: {
    debug: true,
    appName: 'My Application',
  },
})

// 使用状态管理
engine.state.set('user', { name: 'John', age: 30 })
const user = engine.state.get('user')

// 使用事件系统
engine.events.on('user:login', (user) => {
  console.log('用户登录:', user)
})

engine.events.emit('user:login', user)

// 使用日志
engine.logger.info('应用启动完成')
```

### 高级使用

```typescript
import { createEngine, createPlugin } from '@ldesign/engine'

// 创建自定义插件
const analyticsPlugin = createPlugin({
  name: 'analytics',
  install: (engine) => {
    // 监听所有事件进行分析
    engine.events.on('*', (eventName, data) => {
      sendAnalytics(eventName, data)
    })
  },
})

// 创建引擎并使用插件
const engine = createEngine({
  plugins: [analyticsPlugin],
  config: {
    enablePerformanceMonitoring: true,
  },
})

// 性能监控
engine.performance.mark('operation-start')
await performOperation()
engine.performance.mark('operation-end')
engine.performance.measure('operation', 'operation-start', 'operation-end')
```

## 下一步

- 查看 [指南](../guide/) 了解详细使用方法
- 浏览 [示例](../examples/) 查看实际应用
- 参考具体的 [管理器 API](./plugin-manager.md) 文档
