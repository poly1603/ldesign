# 📚 API 参考文档

LDesign Engine 提供了丰富的 API 接口，本文档详细介绍了所有可用的方法和配置选项。

## 🚀 核心 API

### createEngine(config?)

创建引擎实例的工厂函数。

```typescript
import { createEngine } from '@ldesign/engine'

const engine = createEngine({
  debug: true,
  plugins: {
    logger: true,
    cache: true,
    notifications: true,
  },
})
```

**参数：**

- `config` (可选): 引擎配置对象

**返回值：**

- `Engine`: 引擎实例

### Engine 实例

引擎实例是 LDesign Engine 的核心，提供了所有功能模块的访问入口。

```typescript
interface Engine {
  // 核心属性
  version: string
  isDebug: boolean

  // 功能模块
  plugins: PluginManager
  events: EventManager
  state: StateManager
  cache: CacheManager
  logger: Logger
  notifications: NotificationManager
  security: SecurityManager
  performance: PerformanceManager
  errors: ErrorManager
  middleware: MiddlewareManager
  directives: DirectiveManager

  // 核心方法
  mount: (app: App, selector?: string) => void
  unmount: () => void
  use: (plugin: Plugin) => void
  extend: (name: string, value: any) => void
}
```

## 🔌 插件系统 API

### PluginManager

插件管理器负责插件的注册、启用、禁用和生命周期管理。

```typescript
interface PluginManager {
  register: (plugin: Plugin) => boolean
  unregister: (name: string) => boolean
  enable: (name: string) => boolean
  disable: (name: string) => boolean
  get: (name: string) => Plugin | undefined
  getAll: () => Plugin[]
  isEnabled: (name: string) => boolean
  getDependencies: (name: string) => string[]
  getLoadOrder: () => string[]
}
```

**示例：**

```typescript
// 注册插件
const success = engine.plugins.register({
  name: 'my-plugin',
  version: '1.0.0',
  install(engine) {
    // 插件安装逻辑
  },
})

// 启用插件
engine.plugins.enable('my-plugin')

// 获取所有插件
const plugins = engine.plugins.getAll()
```

### Plugin 接口

```typescript
interface Plugin {
  name: string
  version: string
  description?: string
  author?: string
  dependencies?: string[]
  install: (engine: Engine) => void | Promise<void>
  uninstall?: (engine: Engine) => void | Promise<void>
}
```

## 📡 事件系统 API

### EventManager

事件管理器提供发布订阅模式的事件处理机制。

```typescript
interface EventManager {
  on: <T = any>(event: string, listener: EventListener<T>) => UnsubscribeFn
  once: <T = any>(event: string, listener: EventListener<T>) => UnsubscribeFn
  off: (event: string, listener?: EventListener) => void
  emit: <T = any>(event: string, data?: T) => void
  clear: (event?: string) => void
  getListeners: (event: string) => EventListener[]
  getEvents: () => string[]
}
```

**示例：**

```typescript
// 监听事件
const unsubscribe = engine.events.on('user:login', user => {
  console.log('用户登录:', user)
})

// 触发事件
engine.events.emit('user:login', { id: 1, name: 'Alice' })

// 一次性监听
engine.events.once('app:ready', () => {
  console.log('应用已准备就绪')
})

// 移除监听
unsubscribe()
```

## 💾 状态管理 API

### StateManager

状态管理器提供响应式状态管理功能。

```typescript
interface StateManager {
  get: <T = any>(key: string) => T | undefined
  set: <T = any>(key: string, value: T) => void
  remove: (key: string) => void
  has: (key: string) => boolean
  clear: () => void
  watch: <T = any>(key: string, callback: StateWatcher<T>) => UnwatchFn
  keys: () => string[]
  namespace: (name: string) => StateManager
  getSnapshot: () => Record<string, any>
  restoreFromSnapshot: (snapshot: Record<string, any>) => void
  merge: (state: Record<string, any>) => void
}
```

**示例：**

```typescript
// 设置状态
engine.state.set('user.profile', {
  name: 'Alice',
  email: 'alice@example.com',
})

// 获取状态
const profile = engine.state.get('user.profile')

// 监听状态变化
const unwatch = engine.state.watch('user.profile', (newValue, oldValue) => {
  console.log('用户资料已更新:', newValue)
})

// 使用命名空间
const userState = engine.state.namespace('user')
userState.set('isLoggedIn', true)
```

## 🧠 缓存管理 API

### CacheManager

缓存管理器提供高效的数据缓存功能。

```typescript
interface CacheManager {
  get: <T = any>(key: string) => T | undefined
  set: <T = any>(key: string, value: T, ttl?: number) => void
  delete: (key: string) => boolean
  has: (key: string) => boolean
  clear: () => void
  size: () => number
  keys: () => string[]
  values: () => any[]
  entries: () => [string, any][]
  namespace: (name: string) => CacheManager
  getStats: () => CacheStats
  resetStats: () => void
}
```

**示例：**

```typescript
// 设置缓存（5分钟过期）
engine.cache.set('user:123', userData, 5 * 60 * 1000)

// 获取缓存
const user = engine.cache.get('user:123')

// 使用命名空间
const apiCache = engine.cache.namespace('api')
apiCache.set('users', usersData)

// 获取统计信息
const stats = engine.cache.getStats()
console.log(`命中率: ${stats.hitRate * 100}%`)
```

## 📝 日志系统 API

### Logger

日志管理器提供多级别的日志记录功能。

```typescript
interface Logger {
  debug: (message: string, ...args: any[]) => void
  info: (message: string, ...args: any[]) => void
  warn: (message: string, ...args: any[]) => void
  error: (message: string, ...args: any[]) => void
  setLevel: (level: LogLevel) => void
  getLevel: () => LogLevel
  addTransport: (transport: LogTransport) => void
  removeTransport: (transport: LogTransport) => void
  getLogs: (level?: LogLevel) => LogEntry[]
  clearLogs: () => void
}
```

**示例：**

```typescript
// 记录不同级别的日志
engine.logger.debug('调试信息')
engine.logger.info('普通信息')
engine.logger.warn('警告信息')
engine.logger.error('错误信息')

// 设置日志级别
engine.logger.setLevel('warn') // 只显示 warn 和 error

// 获取日志
const logs = engine.logger.getLogs()
```

## 🔔 通知系统 API

### NotificationManager

通知管理器提供全局通知功能。

```typescript
interface NotificationManager {
  show: (notification: NotificationOptions) => string
  hide: (id: string) => boolean
  clear: () => void
  getAll: () => Notification[]
  setDefaults: (defaults: Partial<NotificationOptions>) => void
}

interface NotificationOptions {
  type?: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  duration?: number
  closable?: boolean
  actions?: NotificationAction[]
}
```

**示例：**

```typescript
// 显示通知
const id = engine.notifications.show({
  type: 'success',
  title: '操作成功',
  message: '数据已保存',
  duration: 3000,
})

// 隐藏通知
engine.notifications.hide(id)

// 清空所有通知
engine.notifications.clear()
```

## 🔒 安全管理 API

### SecurityManager

安全管理器提供输入清理和安全验证功能。

```typescript
interface SecurityManager {
  sanitizeInput: (input: string) => string
  sanitizeHtml: (html: string) => string
  validateUrl: (url: string) => boolean
  escapeHtml: (text: string) => string
  unescapeHtml: (html: string) => string
  generateNonce: () => string
  hashPassword: (password: string) => Promise<string>
  verifyPassword: (password: string, hash: string) => Promise<boolean>
}
```

**示例：**

```typescript
// 清理用户输入
const cleanInput = engine.security.sanitizeInput('<script>alert("xss")</script>Hello')
// 结果: 'Hello'

// 清理 HTML
const cleanHtml = engine.security.sanitizeHtml('<div>Safe</div><script>alert("xss")</script>')
// 结果: '<div>Safe</div>'

// 验证 URL
const isValid = engine.security.validateUrl('https://example.com')
// 结果: true
```

## ⚡ 性能监控 API

### PerformanceManager

性能管理器提供性能监控和分析功能。

```typescript
interface PerformanceManager {
  startEvent: (type: PerformanceEventType, name: string, metadata?: any) => string
  endEvent: (id: string, metadata?: any) => void
  recordEvent: (event: PerformanceEvent) => string
  getEvents: (type?: PerformanceEventType) => PerformanceEvent[]
  clearEvents: () => void
  collectMetrics: () => PerformanceMetrics
  recordMetrics: (metrics: PerformanceMetrics) => void
  getMetrics: () => PerformanceMetrics[]
  clearMetrics: () => void
  startMonitoring: () => void
  stopMonitoring: () => void
  isMonitoring: () => boolean
}
```

**示例：**

```typescript
// 开始性能监控
engine.performance.startMonitoring()

// 记录性能事件
const eventId = engine.performance.startEvent('api-call', 'getUserData')
// ... 执行 API 调用
engine.performance.endEvent(eventId)

// 收集性能指标
const metrics = engine.performance.collectMetrics()
console.log('性能指标:', metrics)
```

## 🚨 错误处理 API

### ErrorManager

错误管理器提供全面的错误捕获和处理功能。

```typescript
interface ErrorManager {
  captureError: (error: Error, component?: any, info?: string) => void
  onError: (handler: ErrorHandler) => void
  offError: (handler: ErrorHandler) => void
  getErrors: () => ErrorInfo[]
  clearErrors: () => void
  getErrorsByLevel: (level: ErrorLevel) => ErrorInfo[]
  getRecentErrors: (count: number) => ErrorInfo[]
  searchErrors: (query: string) => ErrorInfo[]
  exportErrors: (format: 'json' | 'csv') => string
}
```

**示例：**

```typescript
// 注册错误处理器
engine.errors.onError(errorInfo => {
  console.error('捕获到错误:', errorInfo)
  // 发送到错误监控服务
})

// 手动捕获错误
try {
  riskyOperation()
} catch (error) {
  engine.errors.captureError(error, component, '操作失败')
}

// 获取错误列表
const errors = engine.errors.getErrors()
```

## 🔧 中间件 API

### MiddlewareManager

中间件管理器提供请求/响应拦截功能。

```typescript
interface MiddlewareManager {
  add: (type: MiddlewareType, middleware: Middleware, priority?: number) => void
  remove: (type: MiddlewareType, middleware: Middleware) => void
  execute: (type: MiddlewareType, context: any) => Promise<any>
  clear: (type?: MiddlewareType) => void
  getMiddlewares: (type: MiddlewareType) => Middleware[]
}
```

**示例：**

```typescript
// 添加请求中间件
engine.middleware.add('request', async (context, next) => {
  console.log('请求开始:', context.url)
  await next()
  console.log('请求完成')
})

// 添加错误处理中间件
engine.middleware.add('error', async (context, next) => {
  try {
    await next()
  } catch (error) {
    console.error('中间件捕获错误:', error)
    throw error
  }
})
```

## 🎯 指令系统 API

### DirectiveManager

指令管理器提供自定义指令功能。

```typescript
interface DirectiveManager {
  register: (name: string, directive: DirectiveDefinition) => void
  unregister: (name: string) => void
  get: (name: string) => DirectiveDefinition | undefined
  getAll: () => Record<string, DirectiveDefinition>
  isRegistered: (name: string) => boolean
}
```

**示例：**

```typescript
// 注册自定义指令
engine.directives.register('highlight', {
  mounted(el, binding) {
    el.style.backgroundColor = binding.value || 'yellow'
  },
  updated(el, binding) {
    el.style.backgroundColor = binding.value || 'yellow'
  },
})

// 在模板中使用
// <div v-highlight="'red'">高亮文本</div>
```

## 🎨 Vue 组合式 API

LDesign Engine 提供了便捷的 Vue 组合式 API。

```typescript
// 获取引擎实例
import { useEngine } from '@ldesign/engine'

// 获取状态管理器
import { useEngineState } from '@ldesign/engine'

// 获取事件管理器
import { useEngineEvents } from '@ldesign/engine'

// 获取缓存管理器
import { useEngineCache } from '@ldesign/engine'

// 获取日志管理器
import { useEngineLogger } from '@ldesign/engine'
const engine = useEngine()
const state = useEngineState()
const events = useEngineEvents()
const cache = useEngineCache()
const logger = useEngineLogger()
```

## 📋 类型定义

LDesign Engine 提供了完整的 TypeScript 类型定义，确保类型安全。

```typescript
import type {
  CacheManager,
  DirectiveManager,
  Engine,
  ErrorManager,
  EventManager,
  Logger,
  MiddlewareManager,
  NotificationManager,
  PerformanceManager,
  Plugin,
  PluginManager,
  SecurityManager,
  StateManager,
} from '@ldesign/engine'
```

## 🔧 配置选项

### EngineConfig

```typescript
interface EngineConfig {
  debug?: boolean
  plugins?: PluginConfig
  security?: SecurityConfig
  performance?: PerformanceConfig
  cache?: CacheConfig
  logger?: LoggerConfig
  notifications?: NotificationConfig
}
```

详细的配置选项请参考各个模块的具体文档。

---

更多详细信息和示例，请查看：

- [快速开始指南](../guide/quick-start.md)
- [核心概念](../guide/concepts.md)
- [最佳实践](../guide/best-practices.md)
- [示例项目](../../example/)
