# Engine API

本文档详细介绍了 Vue3 Engine 的完整 API 接口。

## Engine 实例

### 属性

#### `app`

- **类型**: `App<Element>`
- **描述**: Vue 应用实例
- **只读**: 是

```typescript
const vueApp = engine.app
```

#### `config`

- **类型**: `ConfigManager`
- **描述**: 配置管理器实例

```typescript
// 获取配置
const appName = engine.config.get('app.name')
const debug = engine.config.get('debug')

// 设置配置
engine.config.set('debug', true)
```

#### `state`

- **类型**: `StateManager`
- **描述**: 状态管理器实例

```typescript
// 设置状态
engine.state.set('user', { name: '张三' })

// 获取状态
const user = engine.state.get('user')
```

#### `events`

- **类型**: `EventManager`
- **描述**: 事件管理器实例

```typescript
// 监听事件
engine.events.on('user:login', (user) => {
  console.log('用户登录:', user)
})

// 发送事件
engine.events.emit('user:login', userData)
```

#### `logger`

- **类型**: `Logger`
- **描述**: 日志记录器实例

```typescript
// 记录日志
engine.logger.info('应用启动')
engine.logger.error('错误信息', error)
```

#### `cache`

- **类型**: `CacheManager`
- **描述**: 缓存管理器实例

```typescript
// 缓存数据
engine.cache.set('user:123', userData, 60000)

// 获取缓存
const user = engine.cache.get('user:123')
```

#### `notifications`

- **类型**: `NotificationManager`
- **描述**: 通知管理器实例

```typescript
// 显示通知
engine.notifications.show({
  type: 'success',
  title: '成功',
  message: '操作完成'
})
```

#### `security`

- **类型**: `SecurityManager`
- **描述**: 安全管理器实例

```typescript
// 清理输入
const clean = engine.security.sanitize(userInput)

// 生成 CSRF 令牌
const token = engine.security.generateCSRFToken()
```

#### `performance`

- **类型**: `PerformanceManager`
- **描述**: 性能管理器实例

```typescript
// 开始监控
engine.performance.startMonitoring()

// 记录事件
const eventId = engine.performance.startEvent('api-call', 'fetchData')
```

### 方法

#### `mount(container)`

挂载 Vue 应用到指定容器。

- **参数**:
  - `container` (string | Element): 挂载容器的选择器或 DOM 元素
- **返回值**: `Engine`
- **示例**:

```typescript
// 使用选择器
engine.mount('#app')

// 使用DOM元素
const container = document.getElementById('app')
engine.mount(container)
```

#### `unmount()`

卸载 Vue 应用。

- **返回值**: `void`
- **示例**:

```typescript
engine.unmount()
```

#### `use(plugin, options?)`

安装插件。

- **参数**:
  - `plugin` (Plugin): 插件实例
  - `options?` (any): 插件选项
- **返回值**: `Engine`
- **示例**:

```typescript
import { myPlugin } from './plugins/my-plugin'

engine.use(myPlugin, {
  option1: 'value1',
  option2: 'value2',
})
```

#### `addMiddleware(middleware)`

添加中间件。

- **参数**:
  - `middleware` (Middleware): 中间件实例
- **返回值**: `Engine`
- **示例**:

```typescript
import { authMiddleware } from './middleware/auth'

engine.addMiddleware(authMiddleware)
```

#### `removeMiddleware(name)`

移除指定名称的中间件。

- **参数**:
  - `name` (string): 中间件名称
- **返回值**: `boolean`
- **示例**:

```typescript
const removed = engine.removeMiddleware('auth')
console.log(removed) // true 或 false
```

#### `getPlugin(name)`

获取指定名称的插件。

- **参数**:
  - `name` (string): 插件名称
- **返回值**: `Plugin | undefined`
- **示例**:

```typescript
const authPlugin = engine.getPlugin('auth')
if (authPlugin) {
  console.log('认证插件已安装')
}
```

#### `hasPlugin(name)`

检查是否安装了指定名称的插件。

- **参数**:
  - `name` (string): 插件名称
- **返回值**: `boolean`
- **示例**:

```typescript
if (engine.hasPlugin('auth')) {
  console.log('认证插件已安装')
}
```

#### `getMiddleware(name)`

获取指定名称的中间件。

- **参数**:
  - `name` (string): 中间件名称
- **返回值**: `Middleware | undefined`
- **示例**:

```typescript
const authMiddleware = engine.getMiddleware('auth')
if (authMiddleware) {
  console.log('认证中间件已安装')
}
```

#### `hasMiddleware(name)`

检查是否安装了指定名称的中间件。

- **参数**:
  - `name` (string): 中间件名称
- **返回值**: `boolean`
- **示例**:

```typescript
if (engine.hasMiddleware('auth')) {
  console.log('认证中间件已安装')
}
```

## StateManager API

### 方法

#### `set(key, value)`

设置状态值。

- **参数**:
  - `key` (string): 状态键，支持点分隔的嵌套路径
  - `value` (any): 状态值
- **返回值**: `void`
- **示例**:

```typescript
// 设置简单值
engine.state.set('count', 0)

// 设置对象
engine.state.set('user', { name: '张三', age: 25 })

// 设置嵌套值
engine.state.set('user.name', '李四')
```

#### `get(key, defaultValue?)`

获取状态值。

- **参数**:
  - `key` (string): 状态键，支持点分隔的嵌套路径
  - `defaultValue?` (any): 默认值
- **返回值**: `any`
- **示例**:

```typescript
// 获取简单值
const count = engine.state.get('count')

// 获取对象
const user = engine.state.get('user')

// 获取嵌套值
const userName = engine.state.get('user.name')

// 使用默认值
const theme = engine.state.get('theme', 'light')
```

#### `has(key)`

检查状态是否存在。

- **参数**:
  - `key` (string): 状态键
- **返回值**: `boolean`
- **示例**:

```typescript
if (engine.state.has('user')) {
  console.log('用户已登录')
}
```

#### `delete(key)`

删除状态。

- **参数**:
  - `key` (string): 状态键
- **返回值**: `boolean`
- **示例**:

```typescript
const deleted = engine.state.delete('user')
console.log(deleted) // true 或 false
```

#### `clear()`

清空所有状态。

- **返回值**: `void`
- **示例**:

```typescript
engine.state.clear()
```

#### `watch(key, callback)`

监听状态变化。

- **参数**:
  - `key` (string): 状态键
  - `callback` (Function): 回调函数
- **返回值**: `Function` (取消监听函数)
- **示例**:

```typescript
const unwatch = engine.state.watch('user', (newUser, oldUser) => {
  console.log('用户状态变化:', { newUser, oldUser })
})

// 取消监听
unwatch()
```

#### `computed(getter)`

创建计算状态。

- **参数**:
  - `getter` (Function): 计算函数
- **返回值**: `ComputedRef`
- **示例**:

```typescript
const fullName = engine.state.computed(() => {
  const user = engine.state.get('user')
  return user ? `${user.firstName} ${user.lastName}` : ''
})

console.log(fullName.value) // 计算结果
```

## EventManager API

### 方法

#### `on(event, listener)`

监听事件。

- **参数**:
  - `event` (string): 事件名称
  - `listener` (Function): 事件监听器
- **返回值**: `Function` (取消监听函数)
- **示例**:

```typescript
const off = engine.events.on('user:login', (user) => {
  console.log('用户登录:', user)
})

// 取消监听
off()
```

#### `once(event, listener)`

监听事件一次。

- **参数**:
  - `event` (string): 事件名称
  - `listener` (Function): 事件监听器
- **返回值**: `Function` (取消监听函数)
- **示例**:

```typescript
engine.events.once('app:ready', () => {
  console.log('应用已准备就绪')
})
```

#### `off(event, listener?)`

取消事件监听。

- **参数**:
  - `event` (string): 事件名称
  - `listener?` (Function): 事件监听器（可选）
- **返回值**: `void`
- **示例**:

```typescript
// 取消特定监听器
engine.events.off('user:login', loginHandler)

// 取消所有监听器
engine.events.off('user:login')
```

#### `emit(event, ...args)`

发送事件。

- **参数**:
  - `event` (string): 事件名称
  - `...args` (any[]): 事件参数
- **返回值**: `boolean`
- **示例**:

```typescript
// 发送简单事件
engine.events.emit('user:logout')

// 发送带参数的事件
engine.events.emit('user:login', userData)

// 发送多个参数
engine.events.emit('data:update', id, newData, timestamp)
```

#### `listenerCount(event)`

获取事件监听器数量。

- **参数**:
  - `event` (string): 事件名称
- **返回值**: `number`
- **示例**:

```typescript
const count = engine.events.listenerCount('user:login')
console.log(`user:login 事件有 ${count} 个监听器`)
```

#### `eventNames()`

获取所有事件名称。

- **返回值**: `string[]`
- **示例**:

```typescript
const events = engine.events.eventNames()
console.log('所有事件:', events)
```

## Logger API

### 方法

#### `debug(message, data?)`

记录调试日志。

- **参数**:
  - `message` (string): 日志消息
  - `data?` (any): 附加数据
- **返回值**: `void`
- **示例**:

```typescript
engine.logger.debug('调试信息', { component: 'UserList' })
```

#### `info(message, data?)`

记录信息日志。

- **参数**:
  - `message` (string): 日志消息
  - `data?` (any): 附加数据
- **返回值**: `void`
- **示例**:

```typescript
engine.logger.info('用户登录', { userId: 123 })
```

#### `warn(message, data?)`

记录警告日志。

- **参数**:
  - `message` (string): 日志消息
  - `data?` (any): 附加数据
- **返回值**: `void`
- **示例**:

```typescript
engine.logger.warn('性能警告', { loadTime: 2000 })
```

#### `error(message, data?)`

记录错误日志。

- **参数**:
  - `message` (string): 日志消息
  - `data?` (any): 附加数据
- **返回值**: `void`
- **示例**:

```typescript
engine.logger.error('操作失败', { error: error.message })
```

#### `child(context)`

创建子日志器。

- **参数**:
  - `context` (object): 上下文对象
- **返回值**: `Logger`
- **示例**:

```typescript
const componentLogger = engine.logger.child({ component: 'UserList' })
componentLogger.info('组件渲染') // 自动包含 component: 'UserList'
```

## NotificationManager API

### 方法

#### `success(message, options?)`

显示成功通知。

- **参数**:
  - `message` (string): 通知消息
  - `options?` (NotificationOptions): 通知选项
- **返回值**: `string` (通知 ID)
- **示例**:

```typescript
const id = engine.notifications.success('操作成功')

// 带选项
engine.notifications.success('保存成功', {
  duration: 3000,
  position: 'top-right',
})
```

#### `info(message, options?)`

显示信息通知。

- **参数**:
  - `message` (string): 通知消息
  - `options?` (NotificationOptions): 通知选项
- **返回值**: `string` (通知 ID)
- **示例**:

```typescript
engine.notifications.info('这是一条信息')
```

#### `warning(message, options?)`

显示警告通知。

- **参数**:
  - `message` (string): 通知消息
  - `options?` (NotificationOptions): 通知选项
- **返回值**: `string` (通知 ID)
- **示例**:

```typescript
engine.notifications.warning('请注意')
```

#### `error(message, options?)`

显示错误通知。

- **参数**:
  - `message` (string): 通知消息
  - `options?` (NotificationOptions): 通知选项
- **返回值**: `string` (通知 ID)
- **示例**:

```typescript
engine.notifications.error('操作失败')
```

#### `dismiss(id)`

关闭指定通知。

- **参数**:
  - `id` (string): 通知 ID
- **返回值**: `boolean`
- **示例**:

```typescript
const id = engine.notifications.info('消息')
setTimeout(() => {
  engine.notifications.dismiss(id)
}, 2000)
```

#### `clear()`

清除所有通知。

- **返回值**: `void`
- **示例**:

```typescript
engine.notifications.clear()
```

#### `group(name)`

创建通知组。

- **参数**:
  - `name` (string): 组名称
- **返回值**: `NotificationGroup`
- **示例**:

```typescript
const uploadGroup = engine.notifications.group('upload')
uploadGroup.info('开始上传')
uploadGroup.success('上传完成')
```

## 类型定义

### `EngineConfig`

```typescript
interface EngineConfig {
  appName?: string
  version?: string
  debug?: boolean
  [key: string]: any
}
```

### `NotificationOptions`

```typescript
interface NotificationOptions {
  duration?: number
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  persistent?: boolean
  actions?: NotificationAction[]
  icon?: string
  className?: string
}
```

### `NotificationAction`

```typescript
interface NotificationAction {
  label: string
  action: () => void
  style?: 'primary' | 'secondary' | 'danger'
}
```

### `Plugin`

```typescript
interface Plugin {
  name: string
  install: (engine: Engine, options?: any) => void | Promise<void>
  dependencies?: string[]
}
```

### `Middleware`

```typescript
interface Middleware {
  name: string
  handler: (context: MiddlewareContext, next: () => Promise<void>) => Promise<void>
}
```

### `MiddlewareContext`

```typescript
interface MiddlewareContext {
  engine: Engine
  phase: 'beforeMount' | 'afterMount' | 'beforeUnmount' | 'afterUnmount'
  data?: any
}
```
