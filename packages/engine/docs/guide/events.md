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
  email: 'john@example.com',
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
// 基于名称前缀
engine.events.on('user:login', handleLogin)
engine.events.on('user:logout', handleLogout)
engine.events.on('user:profile:updated', handleProfileUpdate)

// 使用命名空间对象
const userNS = engine.events.namespace('user')
userNS.on('login', handleLogin)
userNS.once('logout', handleLogout)
userNS.emit('login', { id: 1 })
userNS.clear() // 清理 user:* 所有监听

// 嵌套命名空间（通过前缀组合）
const paymentNS = engine.events.namespace('order:payment')
paymentNS.on('completed', handlePaymentCompleted)
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

## 高级能力

### 批量监听

```ts
engine.events.addListeners([
  { event: 'user:login', handler: onLogin },
  { event: 'user:logout', handler: onLogout, options: { once: true, priority: 10 } },
])
```

### 事件管道

```ts
// 将 source 的数据转换后转发到 target
engine.events.pipe('source', 'target', (d) => ({ value: d }))
```

### 条件监听

```ts
engine.events.onWhen('order:paid', (d) => d.amount > 0, (d) => {
  console.log('有效付款', d)
})
```

### 防抖与节流

```ts
const debouncer = engine.events.debounce('search', 200)
const throttler = engine.events.throttle('scroll', 100)

debouncer.emit('hello')
throttler.emit({ y: 100 })
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

engine.events.on(
  'user:action',
  adminUserFilter((user) => {
    console.log('管理员操作:', user)
  })
)
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
  PROFILE_UPDATED: 'user:profile:updated',
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
function emitTypedEvent<K extends keyof EventMap>(event: K, data: EventMap[K]) {
  engine.events.emit(event, data)
}

// 使用
emitTypedEvent('user:login', {
  id: 1,
  name: 'John',
  email: 'john@example.com',
})
```

## 事件优先级

事件监听器支持优先级设置，数字越大优先级越高：

```typescript
// 高优先级监听器（先执行）
engine.events.on('user:login', handleCriticalLogin, 100)

// 普通优先级监听器
engine.events.on('user:login', handleNormalLogin, 50)

// 低优先级监听器（后执行）
engine.events.on('user:login', handleLoggingLogin, 10)

// 执行顺序：handleCriticalLogin -> handleNormalLogin -> handleLoggingLogin
```

## 事件中间件

为事件处理添加中间件支持：

```typescript
// 事件中间件接口
interface EventMiddleware {
  name: string
  handler: (event: string, data: any, next: () => void) => void
}

// 日志中间件
const loggingMiddleware: EventMiddleware = {
  name: 'logging',
  handler: (event, data, next) => {
    console.log(`📡 事件触发: ${event}`, data)
    const startTime = Date.now()

    next()

    const duration = Date.now() - startTime
    console.log(`📡 事件完成: ${event} (${duration}ms)`)
  },
}

// 验证中间件
const validationMiddleware: EventMiddleware = {
  name: 'validation',
  handler: (event, data, next) => {
    if (event.startsWith('user:') && !data?.id) {
      console.warn(`⚠️ 用户事件缺少ID: ${event}`)
      return // 阻止事件继续传播
    }
    next()
  },
}

// 注册事件中间件
engine.events.use(loggingMiddleware)
engine.events.use(validationMiddleware)
```

## 事件聚合器

创建事件聚合器来处理复杂的事件组合：

```typescript
class EventAggregator {
  private events: Map<string, any[]> = new Map()
  private timers: Map<string, NodeJS.Timeout> = new Map()

  constructor(private engine: Engine) {}

  // 批量处理事件
  batch(eventName: string, batchSize: number, timeout: number) {
    return {
      on: (handler: (events: any[]) => void) => {
        this.engine.events.on(eventName, (data) => {
          const events = this.events.get(eventName) || []
          events.push(data)
          this.events.set(eventName, events)

          // 达到批量大小，立即处理
          if (events.length >= batchSize) {
            this.processBatch(eventName, handler)
          }
          else {
            // 设置超时处理
            this.resetTimer(eventName, timeout, handler)
          }
        })
      },
    }
  }

  // 事件去重
  dedupe(eventName: string, keyExtractor: (data: any) => string) {
    const seen = new Set<string>()

    return {
      on: (handler: (data: any) => void) => {
        this.engine.events.on(eventName, (data) => {
          const key = keyExtractor(data)
          if (!seen.has(key)) {
            seen.add(key)
            handler(data)
          }
        })
      },
    }
  }

  // 事件节流
  throttle(eventName: string, interval: number) {
    let lastEmit = 0

    return {
      on: (handler: (data: any) => void) => {
        this.engine.events.on(eventName, (data) => {
          const now = Date.now()
          if (now - lastEmit >= interval) {
            lastEmit = now
            handler(data)
          }
        })
      },
    }
  }

  private processBatch(eventName: string, handler: (events: any[]) => void) {
    const events = this.events.get(eventName) || []
    if (events.length > 0) {
      handler([...events])
      this.events.set(eventName, [])
    }

    const timer = this.timers.get(eventName)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(eventName)
    }
  }

  private resetTimer(eventName: string, timeout: number, handler: (events: any[]) => void) {
    const existingTimer = this.timers.get(eventName)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    const timer = setTimeout(() => {
      this.processBatch(eventName, handler)
    }, timeout)

    this.timers.set(eventName, timer)
  }
}

// 使用事件聚合器
const aggregator = new EventAggregator(engine)

// 批量处理用户操作
aggregator.batch('user:action', 10, 1000).on((actions) => {
  console.log('批量处理用户操作:', actions)
  // 批量发送到分析服务
  sendBatchAnalytics(actions)
})

// 去重处理错误事件
aggregator
  .dedupe('error:occurred', error => error.message)
  .on((error) => {
    console.log('新的错误类型:', error)
    // 只处理新类型的错误
  })

// 节流处理滚动事件
aggregator.throttle('ui:scroll', 100).on((scrollData) => {
  console.log('节流滚动事件:', scrollData)
  // 更新滚动位置
})
```

## 事件存储和回放

实现事件存储和回放功能：

```typescript
class EventStore {
  private events: Array<{
    name: string
    data: any
    timestamp: number
    id: string
  }> = []

  constructor(private engine: Engine) {
    this.setupEventCapture()
  }

  private setupEventCapture() {
    // 拦截所有事件并存储
    const originalEmit = this.engine.events.emit.bind(this.engine.events)

    this.engine.events.emit = (eventName: string, data?: any) => {
      // 存储事件
      this.events.push({
        name: eventName,
        data: data ? JSON.parse(JSON.stringify(data)) : undefined,
        timestamp: Date.now(),
        id: this.generateId(),
      })

      // 调用原始emit方法
      return originalEmit(eventName, data)
    }
  }

  // 获取事件历史
  getHistory(filter?: {
    eventName?: string
    startTime?: number
    endTime?: number
    limit?: number
  }) {
    let filtered = this.events

    if (filter?.eventName) {
      filtered = filtered.filter(e => e.name === filter.eventName)
    }

    if (filter?.startTime) {
      filtered = filtered.filter(e => e.timestamp >= filter.startTime!)
    }

    if (filter?.endTime) {
      filtered = filtered.filter(e => e.timestamp <= filter.endTime!)
    }

    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit)
    }

    return filtered
  }

  // 回放事件
  async replay(events?: Array<{ name: string, data: any }>, delay = 0) {
    const eventsToReplay = events || this.events

    for (const event of eventsToReplay) {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      this.engine.events.emit(event.name, event.data)
    }
  }

  // 导出事件
  export() {
    return {
      events: this.events,
      exportTime: Date.now(),
      version: '1.0.0',
    }
  }

  // 导入事件
  import(data: { events: any[], exportTime: number, version: string }) {
    this.events = [...this.events, ...data.events]
  }

  // 清空事件历史
  clear() {
    this.events = []
  }

  private generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// 使用事件存储
const eventStore = new EventStore(engine)

// 查看最近的用户事件
const userEvents = eventStore.getHistory({
  eventName: 'user:action',
  limit: 10,
})

// 回放最近1小时的事件
const recentEvents = eventStore.getHistory({
  startTime: Date.now() - 3600000, // 1小时前
})
await eventStore.replay(recentEvents, 100) // 100ms间隔回放
```

## 事件总线扩展

创建专门的事件总线来处理特定领域的事件：

```typescript
class DomainEventBus {
  private engine: Engine
  private namespace: string

  constructor(engine: Engine, namespace: string) {
    this.engine = engine
    this.namespace = namespace
  }

  // 发送领域事件
  emit(eventName: string, data?: any) {
    const fullEventName = `${this.namespace}:${eventName}`
    this.engine.events.emit(fullEventName, data)
  }

  // 监听领域事件
  on(eventName: string, handler: (data: any) => void) {
    const fullEventName = `${this.namespace}:${eventName}`
    this.engine.events.on(fullEventName, handler)
  }

  // 一次性监听
  once(eventName: string, handler: (data: any) => void) {
    const fullEventName = `${this.namespace}:${eventName}`
    this.engine.events.once(fullEventName, handler)
  }

  // 取消监听
  off(eventName: string, handler?: (data: any) => void) {
    const fullEventName = `${this.namespace}:${eventName}`
    this.engine.events.off(fullEventName, handler)
  }

  // 创建子总线
  createSubBus(subNamespace: string) {
    return new DomainEventBus(this.engine, `${this.namespace}:${subNamespace}`)
  }
}

// 创建领域事件总线
const userBus = new DomainEventBus(engine, 'user')
const orderBus = new DomainEventBus(engine, 'order')
const paymentBus = orderBus.createSubBus('payment')

// 使用领域事件总线
userBus.on('registered', (user) => {
  console.log('新用户注册:', user)
})

orderBus.on('created', (order) => {
  console.log('订单创建:', order)
})

paymentBus.on('completed', (payment) => {
  console.log('支付完成:', payment)
})

// 发送事件
userBus.emit('registered', { id: 1, name: 'John' })
orderBus.emit('created', { id: 'order-123', userId: 1 })
paymentBus.emit('completed', { orderId: 'order-123', amount: 100 })
```

## 事件性能优化

### 事件池化

```typescript
class EventPool {
  private pool: Map<string, any[]> = new Map()
  private maxPoolSize = 100

  get<T>(eventName: string): T {
    const pool = this.pool.get(eventName) || []
    return pool.pop() || this.createEvent<T>(eventName)
  }

  release(eventName: string, event: any) {
    const pool = this.pool.get(eventName) || []

    if (pool.length < this.maxPoolSize) {
      // 重置事件对象
      this.resetEvent(event)
      pool.push(event)
      this.pool.set(eventName, pool)
    }
  }

  private createEvent<T>(eventName: string): T {
    // 根据事件名称创建对应的事件对象
    return {} as T
  }

  private resetEvent(event: any) {
    // 重置事件对象的属性
    Object.keys(event).forEach((key) => {
      delete event[key]
    })
  }
}

// 使用事件池
const eventPool = new EventPool()

function emitPooledEvent(eventName: string, data: any) {
  const event = eventPool.get(eventName)
  Object.assign(event, data)

  engine.events.emit(eventName, event)

  // 事件处理完成后回收
  setTimeout(() => {
    eventPool.release(eventName, event)
  }, 0)
}
```

### 事件批处理

```typescript
class EventBatcher {
  private batches: Map<string, any[]> = new Map()
  private timers: Map<string, NodeJS.Timeout> = new Map()
  private batchSize = 10
  private batchTimeout = 100

  constructor(private engine: Engine) {}

  emit(eventName: string, data: any) {
    const batch = this.batches.get(eventName) || []
    batch.push(data)
    this.batches.set(eventName, batch)

    // 达到批处理大小，立即发送
    if (batch.length >= this.batchSize) {
      this.flushBatch(eventName)
    }
    else {
      // 设置定时器
      this.resetTimer(eventName)
    }
  }

  private flushBatch(eventName: string) {
    const batch = this.batches.get(eventName)
    if (batch && batch.length > 0) {
      this.engine.events.emit(`${eventName}:batch`, batch)
      this.batches.set(eventName, [])
    }

    const timer = this.timers.get(eventName)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(eventName)
    }
  }

  private resetTimer(eventName: string) {
    const existingTimer = this.timers.get(eventName)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    const timer = setTimeout(() => {
      this.flushBatch(eventName)
    }, this.batchTimeout)

    this.timers.set(eventName, timer)
  }
}

// 使用事件批处理
const batcher = new EventBatcher(engine)

// 监听批处理事件
engine.events.on('analytics:batch', (events) => {
  console.log('批量发送分析数据:', events)
  // 批量发送到分析服务
})

// 发送单个事件（会被批处理）
batcher.emit('analytics', { action: 'click', target: 'button1' })
batcher.emit('analytics', { action: 'view', target: 'page1' })
```

## 事件测试

### 事件模拟

```typescript
class EventMocker {
  private originalEmit: Function
  private mockedEvents: Map<string, any[]> = new Map()

  constructor(private engine: Engine) {
    this.originalEmit = this.engine.events.emit.bind(this.engine.events)
  }

  // 开始模拟
  start() {
    this.engine.events.emit = (eventName: string, data?: any) => {
      const events = this.mockedEvents.get(eventName) || []
      events.push(data)
      this.mockedEvents.set(eventName, events)

      // 不调用原始emit，只记录
      return true
    }
  }

  // 停止模拟
  stop() {
    this.engine.events.emit = this.originalEmit
  }

  // 获取模拟的事件
  getEmittedEvents(eventName: string) {
    return this.mockedEvents.get(eventName) || []
  }

  // 清空模拟事件
  clear() {
    this.mockedEvents.clear()
  }

  // 验证事件是否被发送
  wasEmitted(eventName: string, data?: any) {
    const events = this.getEmittedEvents(eventName)

    if (data === undefined) {
      return events.length > 0
    }

    return events.some(event => JSON.stringify(event) === JSON.stringify(data))
  }
}

// 在测试中使用
describe('事件测试', () => {
  let mocker: EventMocker

  beforeEach(() => {
    mocker = new EventMocker(engine)
    mocker.start()
  })

  afterEach(() => {
    mocker.stop()
    mocker.clear()
  })

  it('应该发送用户登录事件', () => {
    const userData = { id: 1, name: 'John' }

    // 执行登录逻辑
    userService.login(userData)

    // 验证事件是否被发送
    expect(mocker.wasEmitted('user:login', userData)).toBe(true)
  })
})
```

## 事件最佳实践总结

### 1. 性能优化

- **批处理**: 对高频事件使用批处理
- **池化**: 重用事件对象减少 GC 压力
- **节流**: 对 UI 事件进行节流处理
- **异步处理**: 使用异步处理避免阻塞

### 2. 错误处理

- **隔离错误**: 事件处理器中的错误不应影响其他监听器
- **错误事件**: 为错误情况定义专门的事件
- **降级处理**: 提供错误时的降级方案

### 3. 内存管理

- **及时清理**: 组件销毁时清理事件监听器
- **弱引用**: 对临时监听器使用弱引用
- **事件历史**: 限制事件历史的大小

### 4. 调试和监控

- **事件日志**: 在开发环境记录事件流
- **性能监控**: 监控事件处理的性能
- **事件统计**: 收集事件使用统计

通过事件系统，你可以构建松耦合、可扩展的应用架构，让不同模块之间能够优雅地进行通信。
