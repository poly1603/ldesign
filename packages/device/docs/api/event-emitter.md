# EventEmitter API

高性能事件发射器实现,支持优先级、命名空间、通配符等高级特性。

## 类概述

`EventEmitter` 是一个功能强大的事件系统实现,提供:

- 基础事件监听和触发
- 监听器优先级控制
- 命名空间支持(批量管理监听器)
- 通配符事件监听
- 性能监控
- 内存泄漏检测
- 错误处理

## 构造函数

### `constructor()`

创建事件发射器实例。

**示例:**

```typescript
import { EventEmitter } from '@ldesign/device'

// 基础事件映射
interface MyEvents {
  userLogin: { userId: string, username: string }
  dataUpdate: { data: any[] }
  error: Error
}

const emitter = new EventEmitter<MyEvents>()
```

## 配置方法

### `setMaxListeners(max: number): this`

设置最大监听器数量,超过时会发出警告。

**参数:**
- **max** (`number`): 最大监听器数量

**返回值:** `this` (支持链式调用)

**示例:**

```typescript
emitter.setMaxListeners(200)
```

### `setErrorHandler(handler: (error: Error, event: string) => void): this`

设置全局错误处理器。

**参数:**
- **handler** (`function`): 错误处理函数

**返回值:** `this`

**示例:**

```typescript
emitter.setErrorHandler((error, event) => {
  console.error(`事件 ${event} 发生错误:`, error)
  // 上报到监控系统
})
```

### `enablePerformanceMonitoring(enable: boolean = true): this`

启用性能监控。

**参数:**
- **enable** (`boolean`, 默认: `true`): 是否启用

**返回值:** `this`

**示例:**

```typescript
emitter.enablePerformanceMonitoring(true)
```

## 监听器管理

### `on<K>(event: K | '*', listener: EventListener<T[K]>, options?): this`

添加事件监听器。

**参数:**
- **event** (`string | '*'`): 事件名称,支持 `'*'` 通配符监听所有事件
- **listener** (`function`): 监听器函数
- **options** (`object`, 可选): 配置选项
  - **priority** (`number`, 默认: `0`): 优先级,数字越大优先级越高
  - **namespace** (`string`, 可选): 命名空间,用于批量移除

**返回值:** `this`

**示例:**

```typescript
// 基础监听
emitter.on('userLogin', (data) => {
  console.log('用户登录:', data.username)
})

// 带优先级
emitter.on('dataUpdate', (data) => {
  console.log('高优先级处理')
}, { priority: 10 })

emitter.on('dataUpdate', (data) => {
  console.log('低优先级处理')
}, { priority: 5 })

// 带命名空间
emitter.on('userLogin', handler, { namespace: 'analytics' })

// 通配符监听所有事件
emitter.on('*', (data) => {
  console.log('有事件触发:', data)
})
```

### `once<K>(event: K | '*', listener: EventListener<T[K]>, options?): this`

添加一次性事件监听器,触发后自动移除。

**参数:** 同 `on()` 方法

**返回值:** `this`

**示例:**

```typescript
// 只监听一次
emitter.once('userLogin', (data) => {
  console.log('首次登录:', data.username)
})

// 带优先级的一次性监听
emitter.once('dataUpdate', handler, { priority: 10 })
```

### `off<K>(event: K | '*', listener?: EventListener<T[K]>): this`

移除事件监听器。

**参数:**
- **event** (`string | '*'`): 事件名称
- **listener** (`function`, 可选): 要移除的监听器函数,不传则移除该事件的所有监听器

**返回值:** `this`

**示例:**

```typescript
const handler = (data) => console.log(data)

// 添加监听器
emitter.on('userLogin', handler)

// 移除特定监听器
emitter.off('userLogin', handler)

// 移除该事件的所有监听器
emitter.off('userLogin')

// 移除所有通配符监听器
emitter.off('*')
```

### `offNamespace(namespace: string): this`

移除指定命名空间的所有监听器。

**参数:**
- **namespace** (`string`): 命名空间名称

**返回值:** `this`

**示例:**

```typescript
// 添加多个带命名空间的监听器
emitter.on('event1', handler1, { namespace: 'module-a' })
emitter.on('event2', handler2, { namespace: 'module-a' })
emitter.on('event3', handler3, { namespace: 'module-b' })

// 批量移除 module-a 的所有监听器
emitter.offNamespace('module-a')
```

### `removeAllListeners<K>(event?: K | '*'): this`

移除所有事件监听器。

**参数:**
- **event** (`string | '*'`, 可选): 事件名称,不传则移除所有事件的所有监听器

**返回值:** `this`

**示例:**

```typescript
// 移除所有监听器
emitter.removeAllListeners()

// 移除特定事件的所有监听器
emitter.removeAllListeners('userLogin')
```

## 事件触发

### `emit<K>(event: K, data: T[K]): this`

触发事件,按优先级顺序执行监听器。

**参数:**
- **event** (`string`): 事件名称
- **data** (`any`): 传递给监听器的数据

**返回值:** `this`

**示例:**

```typescript
// 触发事件
emitter.emit('userLogin', {
  userId: '123',
  username: 'admin'
})

// 触发数据更新事件
emitter.emit('dataUpdate', {
  data: [1, 2, 3]
})
```

## 查询方法

### `listenerCount<K>(event: K | '*'): number`

获取指定事件的监听器数量。

**参数:**
- **event** (`string | '*'`): 事件名称

**返回值:** `number`

**示例:**

```typescript
const count = emitter.listenerCount('userLogin')
console.log('监听器数量:', count)
```

### `listeners<K>(event: K | '*'): EventListener<T[K]>[]`

获取指定事件的所有监听器。

**参数:**
- **event** (`string | '*'`): 事件名称

**返回值:** `EventListener[]` - 监听器函数数组

**示例:**

```typescript
const listeners = emitter.listeners('userLogin')
console.log('监听器列表:', listeners)
```

### `eventNames(): Array<keyof T | string>`

获取所有事件名称。

**返回值:** `string[]`

**示例:**

```typescript
const names = emitter.eventNames()
console.log('所有事件:', names) // ['userLogin', 'dataUpdate', '*']
```

### `hasListeners<K>(event: K | '*'): boolean`

检查是否有指定事件的监听器。

**参数:**
- **event** (`string | '*'`): 事件名称

**返回值:** `boolean`

**示例:**

```typescript
if (emitter.hasListeners('userLogin')) {
  console.log('有用户登录监听器')
}
```

### `getTotalListenerCount(): number`

获取所有监听器总数。

**返回值:** `number`

**示例:**

```typescript
const total = emitter.getTotalListenerCount()
console.log('总监听器数:', total)
```

## 性能监控

### `getPerformanceMetrics(): object`

获取性能指标(需要先启用性能监控)。

**返回值:** 包含以下属性的对象:
- **totalEmits** (`number`): 总触发次数
- **totalListenerCalls** (`number`): 监听器调用总次数
- **errors** (`number`): 错误次数
- **averageListenersPerEvent** (`number`): 每次事件平均监听器数量

**示例:**

```typescript
emitter.enablePerformanceMonitoring()

// 一段时间后
const metrics = emitter.getPerformanceMetrics()
console.log('性能指标:', metrics)
// {
//   totalEmits: 1000,
//   totalListenerCalls: 3500,
//   errors: 2,
//   averageListenersPerEvent: 3.5
// }
```

### `resetPerformanceMetrics(): this`

重置性能指标。

**返回值:** `this`

**示例:**

```typescript
emitter.resetPerformanceMetrics()
```

## 内存管理

### `detectMemoryLeaks(threshold: number = 50): Array<{ event: string, count: number }>`

检测内存泄漏(监听器过多的事件)。

**参数:**
- **threshold** (`number`, 默认: `50`): 阈值,超过此数量视为可能泄漏

**返回值:** 监听器过多的事件列表

**示例:**

```typescript
const leaks = emitter.detectMemoryLeaks(50)
if (leaks.length > 0) {
  console.warn('可能存在内存泄漏:', leaks)
  // [{ event: 'dataUpdate', count: 120 }]
}
```

## 完整示例

### 基础使用

```typescript
import { EventEmitter } from '@ldesign/device'

// 定义事件类型
interface AppEvents {
  userLogin: { userId: string, username: string }
  userLogout: { userId: string }
  dataUpdate: { type: string, data: any[] }
  error: Error
}

// 创建事件发射器
const emitter = new EventEmitter<AppEvents>()

// 监听用户登录
emitter.on('userLogin', (data) => {
  console.log('用户登录:', data.username)
})

// 监听数据更新
emitter.on('dataUpdate', (data) => {
  console.log('数据更新:', data.type)
})

// 触发事件
emitter.emit('userLogin', {
  userId: '123',
  username: 'admin'
})

emitter.emit('dataUpdate', {
  type: 'user-list',
  data: [1, 2, 3]
})
```

### 优先级控制

```typescript
const emitter = new EventEmitter()

// 高优先级监听器(先执行)
emitter.on('process', (data) => {
  console.log('1. 验证数据')
}, { priority: 10 })

// 中优先级监听器
emitter.on('process', (data) => {
  console.log('2. 处理数据')
}, { priority: 5 })

// 低优先级监听器(后执行)
emitter.on('process', (data) => {
  console.log('3. 记录日志')
}, { priority: 1 })

emitter.emit('process', { data: 'test' })
// 输出顺序:
// 1. 验证数据
// 2. 处理数据
// 3. 记录日志
```

### 命名空间管理

```typescript
const emitter = new EventEmitter()

// 模块 A 的监听器
emitter.on('event1', handler1, { namespace: 'module-a' })
emitter.on('event2', handler2, { namespace: 'module-a' })

// 模块 B 的监听器
emitter.on('event1', handler3, { namespace: 'module-b' })
emitter.on('event3', handler4, { namespace: 'module-b' })

// 卸载模块 A 时,批量移除其所有监听器
emitter.offNamespace('module-a')
```

### 通配符监听

```typescript
const emitter = new EventEmitter()

// 监听所有事件
emitter.on('*', (data) => {
  console.log('事件触发:', data)
  // 可用于全局日志记录、调试等
})

emitter.emit('userLogin', { userId: '123' })
emitter.emit('dataUpdate', { data: [] })
// 两个事件都会被通配符监听器捕获
```

### 错误处理

```typescript
const emitter = new EventEmitter()

// 设置全局错误处理器
emitter.setErrorHandler((error, event) => {
  console.error(`事件 ${event} 处理出错:`, error.message)
  // 上报到监控系统
  sendToMonitoring({ event, error })
})

// 这个监听器会抛出错误
emitter.on('process', (data) => {
  throw new Error('处理失败')
})

// 触发事件时,错误会被捕获并传递给错误处理器
emitter.emit('process', { data: 'test' })
```

### 性能监控示例

```typescript
const emitter = new EventEmitter()

// 启用性能监控
emitter.enablePerformanceMonitoring()

// 添加监听器
emitter.on('dataUpdate', handler1)
emitter.on('dataUpdate', handler2)
emitter.on('dataUpdate', handler3)

// 触发多次事件
for (let i = 0; i < 1000; i++) {
  emitter.emit('dataUpdate', { index: i })
}

// 查看性能指标
const metrics = emitter.getPerformanceMetrics()
console.log('性能报告:', {
  总触发次数: metrics.totalEmits,
  监听器调用总次数: metrics.totalListenerCalls,
  平均每次事件的监听器数: metrics.averageListenersPerEvent.toFixed(2),
  错误次数: metrics.errors
})
```

### 内存泄漏检测

```typescript
const emitter = new EventEmitter()

// 添加大量监听器
for (let i = 0; i < 100; i++) {
  emitter.on('dataUpdate', (data) => {
    console.log(data)
  })
}

// 检测内存泄漏
const leaks = emitter.detectMemoryLeaks(50)
if (leaks.length > 0) {
  console.warn('检测到可能的内存泄漏:')
  leaks.forEach(({ event, count }) => {
    console.warn(`事件 "${event}" 有 ${count} 个监听器(超过阈值 50)`)
  })
}
```

### 实战:状态管理

```typescript
import { EventEmitter } from '@ldesign/device'

interface StoreEvents {
  stateChange: { state: any, prevState: any }
  mutation: { type: string, payload: any }
}

class Store extends EventEmitter<StoreEvents> {
  private state: any = {}

  setState(newState: any) {
    const prevState = { ...this.state }
    this.state = { ...this.state, ...newState }

    this.emit('stateChange', {
      state: this.state,
      prevState
    })
  }

  commit(type: string, payload: any) {
    this.emit('mutation', { type, payload })
  }

  subscribe(handler: (state: any) => void) {
    this.on('stateChange', ({ state }) => handler(state))
  }
}

// 使用
const store = new Store()

store.subscribe((state) => {
  console.log('状态更新:', state)
})

store.setState({ user: { name: 'admin' } })
```

## 类型定义

```typescript
type EventListener<T = unknown> = (data: T) => void

interface ListenerOptions {
  priority?: number    // 优先级
  namespace?: string   // 命名空间
}

class EventEmitter<T extends Record<string, unknown>> {
  on<K extends keyof T>(
    event: K | '*',
    listener: EventListener<T[K]>,
    options?: ListenerOptions
  ): this

  once<K extends keyof T>(
    event: K | '*',
    listener: EventListener<T[K]>,
    options?: ListenerOptions
  ): this

  off<K extends keyof T>(
    event: K | '*',
    listener?: EventListener<T[K]>
  ): this

  emit<K extends keyof T>(event: K, data: T[K]): this

  // ... 其他方法
}
```

## 注意事项

1. **类型安全**: 使用 TypeScript 时建议定义事件映射接口,获得完整的类型检查
2. **优先级**: 监听器按优先级从高到低执行,相同优先级按添加顺序执行
3. **一次性监听**: `once()` 添加的监听器在触发后会自动移除
4. **错误隔离**: 某个监听器抛出错误不会影响其他监听器的执行
5. **性能**: 启用性能监控会有轻微的性能开销,建议仅在需要时启用
6. **内存管理**: 及时移除不需要的监听器,避免内存泄漏
7. **命名空间**: 使用命名空间可以方便地批量管理和移除监听器

## 相关链接

- [DeviceDetector API](./device-detector.md)
- [类型定义](./types.md)
- [返回首页](./index.md)
