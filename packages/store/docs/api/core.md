# 核心 API

@ldesign/store 的核心 API 提供了状态管理的基础功能，包括 Store 基类、状态管理方法和生命周期管理。

## BaseStore

所有 Store 的基类，提供了基础的状态管理功能。

### 构造函数

```typescript
constructor(id: string, options?: StoreOptions)
```

**参数：**

- `id: string` - Store 的唯一标识符，用于区分不同的 Store 实例
- `options?: StoreOptions` - 可选的配置选项

**StoreOptions 接口：**

```typescript
interface StoreOptions {
  persist?: PersistOptions // 持久化配置
  devtools?: boolean // 是否启用开发工具支持
  actions?: ActionDefinition[] // 预定义的动作
  getters?: GetterDefinition[] // 预定义的计算属性
  state?: StateDefinition[] // 预定义的状态
  plugins?: Plugin[] // 插件列表
}
```

**示例：**

```typescript
import { BaseStore } from '@ldesign/store'

class UserStore extends BaseStore {
  constructor() {
    super('user', {
      persist: {
        key: 'user-store',
        storage: 'localStorage',
      },
      devtools: true,
    })
  }
}

const userStore = new UserStore()
```

### 实例方法

#### $dispose()

销毁 Store 实例，清理所有资源。

```typescript
$dispose(): void
```

**说明：**

- 清理所有事件监听器
- 清理定时器和异步操作
- 清理缓存数据
- 释放内存引用

**示例：**

```typescript
// 组件卸载时清理 Store
onUnmounted(() => {
  userStore.$dispose()
})
```

### 状态管理方法

#### $patch()

批量更新状态，提供事务性的状态更新。

```typescript
$patch(partialState: Partial<State>): void
$patch(mutator: (state: State) => void): void
```

**参数：**

- `partialState: Partial<State>` - 要更新的部分状态对象
- `mutator: (state: State) => void` - 状态变更函数

**示例：**

```typescript
// 对象方式更新
store.$patch({
  count: 10,
  name: 'Updated Name',
})

// 函数方式更新
store.$patch(state => {
  state.count++
  state.items.push(newItem)
})
```

**返回值：** `void`

**注意事项：**

- 使用 `$patch` 可以减少响应式更新的次数，提升性能
- 函数方式适合复杂的状态变更逻辑
- 所有变更会在一个事务中完成

#### $reset()

重置 Store 到初始状态。

```typescript
$reset(): void
```

**示例：**

```typescript
store.$reset()
console.log(store.count) // 回到初始值
```

**行为：**

- 将所有状态字段重置为初始值
- 清除所有错误状态
- 触发重置事件

#### $subscribe()

订阅状态变化，监听 Store 的状态更新。

```typescript
$subscribe(
  callback: SubscriptionCallback,
  options?: SubscriptionOptions
): () => void
```

**参数：**

- `callback: SubscriptionCallback` - 状态变化回调函数
- `options?: SubscriptionOptions` - 订阅选项

**SubscriptionCallback 类型：**

```typescript
type SubscriptionCallback = (
  mutation: {
    type: string // 变更类型
    payload: any // 变更数据
    storeId: string // Store ID
  },
  state: State // 当前状态
) => void
```

**SubscriptionOptions 接口：**

```typescript
interface SubscriptionOptions {
  immediate?: boolean // 是否立即执行回调
  deep?: boolean // 是否深度监听
  flush?: 'pre' | 'post' | 'sync' // 回调执行时机
}
```

**示例：**

```typescript
const unsubscribe = store.$subscribe(
  (mutation, state) => {
    console.log('状态变化:', mutation.type, mutation.payload)
    console.log('当前状态:', state)
  },
  {
    immediate: true,
    deep: true,
  }
)

// 取消订阅
unsubscribe()
```

**返回值：** `() => void` - 取消订阅的函数

#### $onAction()

监听 Action 执行，提供 Action 级别的钩子。

```typescript
$onAction(callback: ActionCallback): () => void
```

**参数：**

- `callback: ActionCallback` - Action 执行回调

**ActionCallback 类型：**

```typescript
type ActionCallback = (context: {
  name: string // Action 名称
  args: any[] // Action 参数
  store: Store // Store 实例
  after: (callback: () => void) => void // 执行后回调
  onError: (callback: (error: Error) => void) => void // 错误回调
}) => void
```

**示例：**

```typescript
const unsubscribe = store.$onAction(({ name, args, after, onError }) => {
  console.log(`开始执行 Action: ${name}`, args)

  after(() => {
    console.log(`Action ${name} 执行完成`)
  })

  onError(error => {
    console.error(`Action ${name} 执行失败:`, error)
  })
})
```

**返回值：** `() => void` - 取消监听的函数

### 生命周期方法

#### $dispose()

销毁 Store 实例，清理资源。

```typescript
$dispose(): void
```

**示例：**

```typescript
store.$dispose()
```

**行为：**

- 清除所有订阅
- 停止所有定时器
- 清理持久化数据（可选）
- 触发销毁事件

#### $hydrate()

从持久化存储中恢复状态。

```typescript
$hydrate(data: any): void
```

**参数：**

- `data: any` - 要恢复的状态数据

**示例：**

```typescript
const savedData = localStorage.getItem('store-data')
if (savedData) {
  store.$hydrate(JSON.parse(savedData))
}
```

#### $serialize()

序列化当前状态为可持久化的格式。

```typescript
$serialize(): any
```

**示例：**

```typescript
const serializedData = store.$serialize()
localStorage.setItem('store-data', JSON.stringify(serializedData))
```

**返回值：** `any` - 序列化后的状态数据

### 状态访问

#### $state

获取当前状态的响应式引用。

```typescript
readonly $state: Ref<State>
```

**示例：**

```typescript
console.log(store.$state.value) // 当前完整状态
```

#### $id

获取 Store 的唯一标识符。

```typescript
readonly $id: string
```

**示例：**

```typescript
console.log(store.$id) // 'user'
```

### 工具方法

#### $nextTick()

等待下一次状态更新完成。

```typescript
$nextTick(callback?: () => void): Promise<void>
```

**参数：**

- `callback?: () => void` - 可选的回调函数

**示例：**

```typescript
store.count++
await store.$nextTick()
console.log('状态更新完成')

// 或使用回调
store.$nextTick(() => {
  console.log('状态更新完成')
})
```

#### $watch()

监听特定状态字段的变化。

```typescript
$watch<T>(
  getter: (state: State) => T,
  callback: (newValue: T, oldValue: T) => void,
  options?: WatchOptions
): () => void
```

**参数：**

- `getter: (state: State) => T` - 状态获取函数
- `callback: (newValue: T, oldValue: T) => void` - 变化回调
- `options?: WatchOptions` - 监听选项

**WatchOptions 接口：**

```typescript
interface WatchOptions {
  immediate?: boolean // 是否立即执行
  deep?: boolean // 是否深度监听
  flush?: 'pre' | 'post' | 'sync'
}
```

**示例：**

```typescript
const unwatch = store.$watch(
  state => state.count,
  (newCount, oldCount) => {
    console.log(`计数从 ${oldCount} 变为 ${newCount}`)
  },
  { immediate: true }
)

// 停止监听
unwatch()
```

## 错误处理

### StoreError

Store 相关错误的基类。

```typescript
class StoreError extends Error {
  constructor(message: string, public storeId: string, public cause?: Error)
}
```

**属性：**

- `message: string` - 错误消息
- `storeId: string` - 发生错误的 Store ID
- `cause?: Error` - 原始错误（如果有）

### ActionError

Action 执行错误。

```typescript
class ActionError extends StoreError {
  constructor(message: string, public actionName: string, storeId: string, cause?: Error)
}
```

**属性：**

- `actionName: string` - 发生错误的 Action 名称

### ValidationError

验证错误。

```typescript
class ValidationError extends StoreError {
  constructor(message: string, public field: string, public value: any, storeId: string)
}
```

**属性：**

- `field: string` - 验证失败的字段名
- `value: any` - 验证失败的值

## 类型定义

### Store

Store 实例的基础接口。

```typescript
interface Store {
  readonly $id: string
  readonly $state: Ref<any>
  $patch: ((partialState: any) => void) & ((mutator: (state: any) => void) => void)
  $reset: () => void
  $subscribe: (callback: SubscriptionCallback) => () => void
  $onAction: (callback: ActionCallback) => () => void
  $dispose: () => void
  $hydrate: (data: any) => void
  $serialize: () => any
  $nextTick: (callback?: () => void) => Promise<void>
  $watch: <T>(
    getter: (state: any) => T,
    callback: (newValue: T, oldValue: T) => void,
    options?: WatchOptions
  ) => () => void
}
```

### StoreDefinition

Store 定义接口。

```typescript
interface StoreDefinition<Id extends string = string, S = {}, G = {}, A = {}> {
  id: Id
  state?: () => S
  getters?: G & GettersTree<S, G>
  actions?: A & ActionsTree<S, G, A>
}
```

## 常见问题

### Q: 如何在多个组件间共享 Store 实例？

A: 使用单例模式或依赖注入：

```typescript
// 单例模式
// 依赖注入
import { inject, provide } from 'vue'

export const userStore = new UserStore('user')

// 提供
provide('userStore', userStore)

// 注入
const userStore = inject('userStore')
```

### Q: Store 的状态更新是同步还是异步的？

A: 状态更新本身是同步的，但响应式更新可能是异步的。使用 `$nextTick()` 等待更新完成：

```typescript
store.count++
await store.$nextTick()
// 此时 DOM 已更新
```

### Q: 如何处理 Store 的内存泄漏？

A: 及时调用 `$dispose()` 方法清理资源：

```typescript
onUnmounted(() => {
  store.$dispose()
})
```

### Q: 可以在 Store 外部直接修改状态吗？

A: 不推荐。应该通过 Action 或 `$patch()` 方法修改状态：

```typescript
// ❌ 不推荐
store.count++

// ✅ 推荐
store.increment()
// 或
store.$patch({ count: store.count + 1 })
```

## 性能优化 API

### StorePool

Store 实例池管理器，用于复用 Store 实例，减少内存分配。

#### useStorePool()

获取 Store 池实例。

```typescript
function useStorePool(options?: StorePoolOptions): StorePool
```

**参数：**

```typescript
interface StorePoolOptions {
  maxSize?: number // 池的最大大小，默认 50
  maxIdleTime?: number // 最大空闲时间（毫秒），默认 300000（5分钟）
  enableGC?: boolean // 是否启用垃圾回收，默认 true
}
```

**返回值：**

```typescript
interface StorePool {
  getStore<T>(storeClass: new (...args: any[]) => T, id: string, ...args: any[]): T
  returnStore<T>(instance: T): void
  warmUp<T>(storeClass: new (...args: any[]) => T, count: number, ...args: any[]): void
  getStats(): PoolStats
  clear(): void
  destroy(): void
}
```

**示例：**

```typescript
import { useStorePool } from '@ldesign/store'

const pool = useStorePool({
  maxSize: 20,
  maxIdleTime: 600000, // 10分钟
  enableGC: true,
})

// 获取池化的 Store 实例
const store = pool.getStore(UserStore, 'user-1')

// 使用完毕后归还
pool.returnStore(store)

// 预热池
pool.warmUp(UserStore, 5)
```

#### @PooledStore

Store 池化装饰器，自动管理 Store 实例的生命周期。

```typescript
function PooledStore(options?: StorePoolOptions): ClassDecorator
```

**示例：**

```typescript
import { PooledStore, BaseStore } from '@ldesign/store'

@PooledStore({ maxSize: 10, maxIdleTime: 300000 })
class OptimizedStore extends BaseStore {
  // Store 实例会被自动池化管理
}
```

### PerformanceMonitor

性能监控系统，用于监控和分析 Store 的性能。

#### usePerformanceMonitor()

获取性能监控实例。

```typescript
function usePerformanceMonitor(): PerformanceMonitor
```

**返回值：**

```typescript
interface PerformanceMonitor {
  recordActionTime(actionName: string, executionTime: number): void
  recordGetterTime(getterName: string, computationTime: number): void
  recordStateUpdate(stateName: string): void
  updateMemoryUsage(storeCount: number, cacheSize: number): void
  getPerformanceReport(): PerformanceReport
  clearMetrics(): void
}
```

**示例：**

```typescript
import { usePerformanceMonitor } from '@ldesign/store'

const monitor = usePerformanceMonitor()

// 获取性能报告
const report = monitor.getPerformanceReport()
console.log('慢速操作:', report.slowActions)
console.log('频繁更新:', report.frequentUpdates)

// 清理性能数据
monitor.clearMetrics()
```

#### @MonitorAction

Action 性能监控装饰器。

```typescript
function MonitorAction(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor
```

**示例：**

```typescript
import { MonitorAction, BaseStore } from '@ldesign/store'

class MonitoredStore extends BaseStore {
  @MonitorAction
  @Action()
  async heavyOperation() {
    // 这个方法的执行时间会被自动监控
  }
}
```

#### @MonitorGetter

Getter 性能监控装饰器。

```typescript
function MonitorGetter(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor
```

**示例：**

```typescript
class MonitoredStore extends BaseStore {
  @MonitorGetter
  @Getter({ deps: ['data'] })
  get expensiveComputation() {
    // 这个计算属性的执行时间会被监控
    return this.data.map(/* 复杂计算 */)
  }
}
```

#### getOptimizationSuggestions()

根据性能报告生成优化建议。

```typescript
function getOptimizationSuggestions(report: PerformanceReport): string[]
```

**示例：**

```typescript
import { usePerformanceMonitor, getOptimizationSuggestions } from '@ldesign/store'

const monitor = usePerformanceMonitor()
const report = monitor.getPerformanceReport()
const suggestions = getOptimizationSuggestions(report)

suggestions.forEach(suggestion => {
  console.log('💡', suggestion)
})
```

## 下一步

- 学习 [装饰器 API](/api/decorators) 了解装饰器的详细用法
- 查看 [Hook API](/api/hooks) 了解函数式状态管理
- 探索 [Vue 集成](/api/vue) 了解 Vue 特定功能
- 阅读 [性能优化指南](/guide/performance) 了解性能优化最佳实践
