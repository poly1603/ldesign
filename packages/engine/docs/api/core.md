# 核心 API

本文档详细介绍了 Vue3 Engine 的核心 API。

## createApp

创建 Vue 应用和引擎实例的简化 API。

### 语法

```typescript
function createApp(rootComponent: Component, options?: EngineOptions): Engine
```

### 参数

- `rootComponent`: Vue 根组件
- `options`: 引擎配置选项（可选）

### 返回值

返回配置好的引擎实例，该实例已经创建了 Vue 应用并安装了引擎。

### 示例

```typescript
import { createApp, presets } from '@ldesign/engine'
import App from './App.vue'

// 基本用法
const engine = createApp(App)

// 带配置的用法
const engine = createApp(App, {
  ...presets.development(),
  config: {
    debug: true,
    appName: 'My App',
  },
  plugins: [myPlugin],
  middleware: [myMiddleware],
})

// 挂载应用
engine.mount('#app')
```

## createEngine

创建引擎实例的传统 API。

### 语法

```typescript
function createEngine(options?: EngineOptions): Engine
```

### 参数

- `options`: 引擎配置选项（可选）

### 返回值

返回引擎实例。

### 示例

```typescript
import { createEngine } from '@ldesign/engine'
import { createApp } from 'vue'
import App from './App.vue'

// 创建引擎
const engine = createEngine({
  config: {
    debug: true,
    appName: 'My App',
  },
})

// 创建Vue应用
const app = createApp(App)

// 安装引擎
engine.install(app)

// 挂载应用
engine.mount('#app')
```

## Engine 接口

引擎实例提供的核心方法和属性。

### 属性

```typescript
interface Engine {
  // 管理器
  plugins: PluginManager
  middleware: MiddlewareManager
  events: EventManager
  state: StateManager
  directives: DirectiveManager
  errors: ErrorManager
  logger: Logger
  notifications: NotificationManager

  // 扩展接口
  router?: RouterExtension
  store?: StoreExtension
  i18n?: I18nExtension
  theme?: ThemeExtension

  // 配置
  config: EngineConfig
}
```

### 方法

#### install

将引擎安装到 Vue 应用实例。

```typescript
install(app: App): void
```

**参数:**

- `app`: Vue 应用实例

**示例:**

```typescript
const app = createApp(App)
engine.install(app)
```

#### createApp

创建 Vue 应用并自动安装引擎。

```typescript
createApp(rootComponent: Component): App
```

**参数:**

- `rootComponent`: Vue 根组件

**返回值:**

- Vue 应用实例

**示例:**

```typescript
const app = engine.createApp(App)
app.mount('#app')
```

#### use

注册插件到引擎。

```typescript
use(plugin: Plugin): Promise<void>
```

**参数:**

- `plugin`: 插件实例

**示例:**

```typescript
await engine.use(myPlugin)
```

#### mount

挂载应用到指定的 DOM 元素。

```typescript
mount(container: string | Element): void
```

**参数:**

- `container`: DOM 选择器字符串或 DOM 元素

**示例:**

```typescript
engine.mount('#app')
engine.mount(document.getElementById('app'))
```

#### unmount

卸载应用。

```typescript
unmount(): void
```

**示例:**

```typescript
engine.unmount()
```

## EngineOptions

引擎配置选项接口。

```typescript
interface EngineOptions {
  config?: EngineConfig
  plugins?: Plugin[]
  middleware?: Middleware[]
  logger?: LoggerOptions
  state?: StateOptions
  notifications?: NotificationOptions
  extensions?: {
    router?: RouterExtension
    store?: StoreExtension
    i18n?: I18nExtension
    theme?: ThemeExtension
  }
}
```

### config

基础配置选项。

```typescript
interface EngineConfig {
  debug?: boolean // 调试模式
  appName?: string // 应用名称
  version?: string // 应用版本
  env?: string // 环境标识
  [key: string]: any // 自定义配置
}
```

### plugins

插件列表。

```typescript
interface Plugin {
  name: string
  version?: string
  dependencies?: string[]
  install: (engine: Engine) => void | Promise<void>
  uninstall?: (engine: Engine) => void | Promise<void>
}
```

### middleware

中间件列表。

```typescript
interface Middleware {
  name: string
  handler: (context: MiddlewareContext, next: () => Promise<void>) => Promise<void>
}
```

### logger

日志配置选项。

```typescript
interface LoggerOptions {
  level?: LogLevel // 日志级别
  formatter?: LogFormatter // 格式化器
  transports?: LogTransport[] // 输出目标
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
```

### state

状态管理配置选项。

```typescript
interface StateOptions {
  persistence?: {
    keys?: string[] // 需要持久化的状态键
    adapter?: StorageAdapter | string // 存储适配器
    prefix?: string // 存储键前缀
  }
  modules?: Record<string, StateModule> // 状态模块
}
```

### notifications

通知系统配置选项。

```typescript
interface NotificationOptions {
  position?: NotificationPosition // 默认位置
  duration?: number // 默认显示时长
  maxNotifications?: number // 最大通知数量
  theme?: NotificationTheme // 主题样式
}
```

## 预设配置

引擎提供了几种预设配置。

### presets.development()

开发环境预设，包含调试工具和详细日志。

```typescript
function development(): EngineOptions
```

**包含的功能:**

- 调试模式开启
- 详细日志记录
- 性能监控中间件
- 错误处理中间件
- 开发工具集成

**示例:**

```typescript
const engine = createApp(App, {
  ...presets.development(),
  config: {
    appName: 'My App',
  },
})
```

### presets.production()

生产环境预设，优化性能和错误处理。

```typescript
function production(): EngineOptions
```

**包含的功能:**

- 性能优化
- 错误收集和上报
- 日志级别限制
- 安全中间件

**示例:**

```typescript
const engine = createApp(App, {
  ...presets.production(),
  config: {
    appName: 'My App',
    version: '1.0.0',
  },
})
```

### presets.minimal()

最小配置预设，只包含核心功能。

```typescript
function minimal(): EngineOptions
```

**包含的功能:**

- 基础插件管理
- 基础事件系统
- 基础状态管理

**示例:**

```typescript
const engine = createEngine(presets.minimal())
```

## 工具函数

### creators

创建器工具集合。

```typescript
const creators = {
  plugin: (name: string, install: PluginInstaller) => Plugin
  middleware: (name: string, handler: MiddlewareHandler) => Middleware
  directive: (name: string, definition: DirectiveDefinition) => Directive
  errorHandler: (name: string, handler: ErrorHandler) => ErrorHandler
}
```

**示例:**

```typescript
import { creators } from '@ldesign/engine'

// 创建插件
const myPlugin = creators.plugin('my-plugin', (engine) => {
  engine.logger.info('插件已安装')
})

// 创建中间件
const myMiddleware = creators.middleware('my-middleware', async (context, next) => {
  console.log('中间件执行')
  await next()
})
```

### utils

实用工具函数。

```typescript
const utils = {
  isPlugin: (obj: any) => boolean
  isMiddleware: (obj: any) => boolean
  validateConfig: (config: any) => boolean
  mergeOptions: (target: any, source: any) => any
}
```

**示例:**

```typescript
import { utils } from '@ldesign/engine'

// 检查对象是否为插件
if (utils.isPlugin(obj)) {
  engine.use(obj)
}

// 合并配置
const mergedConfig = utils.mergeOptions(defaultConfig, userConfig)
```

## 常量

### ENGINE_EVENTS

内置事件常量。

```typescript
const ENGINE_EVENTS = {
  APP_BEFORE_MOUNT: 'app:beforeMount',
  APP_MOUNTED: 'app:mounted',
  APP_BEFORE_UNMOUNT: 'app:beforeUnmount',
  APP_UNMOUNTED: 'app:unmounted',
  PLUGIN_REGISTERED: 'plugin:registered',
  PLUGIN_UNREGISTERED: 'plugin:unregistered',
  STATE_UPDATED: 'state:updated',
  STATE_REMOVED: 'state:removed',
  ERROR_OCCURRED: 'error:occurred',
} as const
```

**示例:**

```typescript
import { ENGINE_EVENTS } from '@ldesign/engine'

engine.events.on(ENGINE_EVENTS.APP_MOUNTED, () => {
  console.log('应用已挂载')
})
```

### VERSION

引擎版本信息。

```typescript
const VERSION: string
```

**示例:**

```typescript
import { VERSION } from '@ldesign/engine'

console.log('Engine版本:', VERSION)
```
