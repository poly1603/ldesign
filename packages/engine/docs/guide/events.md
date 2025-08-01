# 事件系统

事件系统是引擎的核心通信机制，允许不同组件之间进行松耦合的通信。

## 基本概念

事件系统基于发布-订阅模式，支持同步和异步事件处理：

```typescript
interface EventManager {
  on: <T = any>(event: string, handler: EventHandler<T>) => void
  off: (event: string, handler?: EventHandler) => void
  emit: <T = any>(event: string, data?: T) => void
  once: <T = any>(event: string, handler: EventHandler<T>) => void
}

type EventHandler<T = any> = (data: T) => void | Promise<void>
```

## 基本用法

### 监听事件

```typescript
import { createApp } from '@ldesign/engine'
import App from './App.vue'

const engine = createApp(App)

// 监听事件
engine.events.on('user:login', (userData) => {
  console.log('用户登录:', userData)
  // 更新UI状态
  engine.state.set('currentUser', userData)
})

// 监听一次性事件
engine.events.once('app:ready', () => {
  console.log('应用已准备就绪')
  // 执行初始化后的操作
})
```

### 发送事件

```typescript
// 发送事件
engine.events.emit('user:login', {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com'
})

// 发送无数据事件
engine.events.emit('app:ready')
```

### 取消监听

```typescript
// 定义事件处理函数
function handleUserLogin(userData) {
  console.log('处理用户登录:', userData)
}

// 监听事件
engine.events.on('user:login', handleUserLogin)

// 取消特定处理函数
engine.events.off('user:login', handleUserLogin)

// 取消所有该事件的监听
engine.events.off('user:login')
```

## 内置事件

引擎提供了一系列内置事件，你可以监听这些事件来响应引擎的状态变化：

### 应用生命周期事件

```typescript
// 应用挂载前
engine.events.on('app:beforeMount', () => {
  console.log('应用即将挂载')
})

// 应用挂载后
engine.events.on('app:mounted', () => {
  console.log('应用已挂载')
})

// 应用卸载前
engine.events.on('app:beforeUnmount', () => {
  console.log('应用即将卸载')
})

// 应用卸载后
engine.events.on('app:unmounted', () => {
  console.log('应用已卸载')
})
```

### 插件事件

```typescript
// 插件注册
engine.events.on('plugin:registered', (plugin) => {
  console.log('插件已注册:', plugin.name)
})

// 插件卸载
engine.events.on('plugin:unregistered', (pluginName) => {
  console.log('插件已卸载:', pluginName)
})
```

### 状态变化事件

```typescript
// 状态更新
engine.events.on('state:updated', ({ key, value, oldValue }) => {
  console.log(`状态 ${key} 从 ${oldValue} 更新为 ${value}`)
})

// 状态删除
engine.events.on('state:removed', ({ key, value }) => {
  console.log(`状态 ${key} 已删除，值为:`, value)
})
```

### 错误事件

```typescript
// 全局错误
engine.events.on('error:global', (error) => {
  console.error('全局错误:', error)
  // 发送错误报告
  sendErrorReport(error)
})

// 中间件错误
engine.events.on('middleware:error', ({ phase, error, middleware }) => {
  console.error(`中间件 ${middleware} 在 ${phase} 阶段出错:`, error)
})
```

## 事件命名空间

使用命名空间来组织事件，避免命名冲突：

```typescript
// 用户相关事件
engine.events.on('user:login', handleLogin)
engine.events.on('user:logout', handleLogout)
engine.events.on('user:profile:updated', handleProfileUpdate)

// 数据相关事件
engine.events.on('data:loaded', handleDataLoaded)
engine.events.on('data:error', handleDataError)

// UI相关事件
engine.events.on('ui:modal:opened', handleModalOpened)
engine.events.on('ui:notification:shown', handleNotificationShown)
```

## 异步事件处理

### 异步事件处理器

```typescript
// 异步事件处理
engine.events.on('data:save', async (data) => {
  try {
    // 异步保存数据
    await saveToDatabase(data)
    console.log('数据保存成功')

    // 发送成功事件
    engine.events.emit('data:saved', data)
  }
  catch (error) {
    console.error('数据保存失败:', error)

    // 发送错误事件
    engine.events.emit('data:save:error', { data, error })
  }
})
```

### 等待事件完成

```typescript
// 创建Promise来等待事件
function waitForEvent<T>(eventName: string): Promise<T> {
  return new Promise((resolve) => {
    engine.events.once(eventName, resolve)
  })
}

// 使用示例
async function initializeApp() {
  // 等待配置加载完成
  const config = await waitForEvent<AppConfig>('config:loaded')
  console.log('配置已加载:', config)

  // 等待用户认证完成
  const user = await waitForEvent<User>('auth:completed')
  console.log('用户认证完成:', user)
}
```

## 事件过滤和转换

### 事件过滤

```typescript
// 创建过滤器
function createEventFilter<T>(predicate: (data: T) => boolean) {
  return (handler: EventHandler<T>) => {
    return (data: T) => {
      if (predicate(data)) {
        handler(data)
      }
    }
  }
}

// 使用过滤器
const adminUserFilter = createEventFilter<User>(user => user.role === 'admin')

engine.events.on('user:action', adminUserFilter((user) => {
  console.log('管理员操作:', user)
}))
```

### 事件转换

```typescript
// 事件数据转换
engine.events.on('api:response', (response) => {
  // 转换API响应为应用数据格式
  const transformedData = transformApiResponse(response)

  // 发送转换后的事件
  engine.events.emit('data:updated', transformedData)
})
```

## 事件调试

### 事件日志

```typescript
// 启用事件调试
if (engine.config.debug) {
  // 监听所有事件（使用通配符）
  engine.events.on('*', (eventName, data) => {
    console.log(`🔔 事件: ${eventName}`, data)
  })
}
```

### 事件统计

```typescript
// 事件统计
const eventStats = new Map<string, number>()

engine.events.on('*', (eventName) => {
  const count = eventStats.get(eventName) || 0
  eventStats.set(eventName, count + 1)
})

// 查看事件统计
setInterval(() => {
  console.table(Object.fromEntries(eventStats))
}, 10000)
```

## 事件最佳实践

### 1. 事件命名规范

```typescript
// ✅ 好的命名
engine.events.emit('user:profile:updated', userData)
engine.events.emit('api:request:started', requestInfo)
engine.events.emit('ui:modal:closed', modalId)

// ❌ 不好的命名
engine.events.emit('update', userData)
engine.events.emit('done', result)
engine.events.emit('event1', data)
```

### 2. 错误处理

```typescript
// 在事件处理器中进行错误处理
engine.events.on('data:process', async (data) => {
  try {
    await processData(data)
  }
  catch (error) {
    // 不要让错误传播到事件系统
    engine.logger.error('数据处理失败:', error)
    engine.events.emit('data:process:error', { data, error })
  }
})
```

### 3. 避免内存泄漏

```typescript
// 在组件卸载时清理事件监听
class MyComponent {
  private eventHandlers: Array<() => void> = []

  constructor(private engine: Engine) {
    // 保存清理函数
    this.eventHandlers.push(
      this.addEventHandler('user:login', this.handleUserLogin),
      this.addEventHandler('user:logout', this.handleUserLogout)
    )
  }

  private addEventHandler(event: string, handler: EventHandler) {
    this.engine.events.on(event, handler)
    return () => this.engine.events.off(event, handler)
  }

  destroy() {
    // 清理所有事件监听
    this.eventHandlers.forEach(cleanup => cleanup())
    this.eventHandlers = []
  }
}
```

### 4. 事件文档化

```typescript
/**
 * 用户相关事件
 */
export const USER_EVENTS = {
  /** 用户登录成功 - 携带用户数据 */
  LOGIN: 'user:login',
  /** 用户登出 - 携带用户ID */
  LOGOUT: 'user:logout',
  /** 用户资料更新 - 携带更新的字段 */
  PROFILE_UPDATED: 'user:profile:updated'
} as const

// 使用常量而不是字符串
engine.events.on(USER_EVENTS.LOGIN, handleUserLogin)
engine.events.emit(USER_EVENTS.LOGIN, userData)
```

### 5. 事件类型安全

```typescript
// 定义事件类型
interface EventMap {
  'user:login': { id: number, name: string, email: string }
  'user:logout': { id: number }
  'data:loaded': { type: string, data: any[] }
  'error:occurred': { message: string, stack?: string }
}

// 类型安全的事件发送
function emitTypedEvent<K extends keyof EventMap>(
  event: K,
  data: EventMap[K]
) {
  engine.events.emit(event, data)
}

// 使用
emitTypedEvent('user:login', {
  id: 1,
  name: 'John',
  email: 'john@example.com'
})
```

通过事件系统，你可以构建松耦合、可扩展的应用架构，让不同模块之间能够优雅地进行通信。
