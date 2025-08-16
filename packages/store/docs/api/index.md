# API 参考

@ldesign/store 提供了丰富的 API 来满足不同的状态管理需求。本文档详细介绍了所有可用的 API。

## 核心类

### BaseStore

所有 Store 的基类，提供了基础的状态管理功能。

```typescript
class BaseStore {
  constructor(id: string, options?: StoreOptions)

  // 状态管理
  $patch(partialState: Partial<State>): void
  $reset(): void
  $subscribe(callback: SubscriptionCallback): () => void
  $onAction(callback: ActionCallback): () => void

  // 生命周期
  $dispose(): void
}
```

#### 构造函数

```typescript
constructor(id: string, options?: StoreOptions)
```

**参数:**

- `id: string` - Store 的唯一标识符
- `options?: StoreOptions` - 可选的配置选项

**StoreOptions:**

```typescript
interface StoreOptions {
  persist?: PersistOptions
  devtools?: boolean
  actions?: ActionDefinition[]
  getters?: GetterDefinition[]
  state?: StateDefinition[]
}
```

#### 方法

##### $patch()

批量更新状态。

```typescript
$patch(partialState: Partial<State>): void
```

**示例:**

```typescript
store.$patch({
  count: 10,
  name: 'Updated Name',
})
```

##### $reset()

重置 Store 到初始状态。

```typescript
$reset(): void
```

##### $subscribe()

订阅状态变化。

```typescript
$subscribe(callback: SubscriptionCallback): () => void
```

**SubscriptionCallback:**

```typescript
type SubscriptionCallback = (mutation: { type: string; payload: any }, state: State) => void
```

**返回值:** 取消订阅的函数

##### $onAction()

监听 Action 执行。

```typescript
$onAction(callback: ActionCallback): () => void
```

**ActionCallback:**

```typescript
type ActionCallback = (context: {
  name: string
  args: any[]
  after: (callback: () => void) => void
  onError: (callback: (error: Error) => void) => void
}) => void
```

## 装饰器 API

### 状态装饰器

#### @State

定义基础状态。

```typescript
@State(options?: StateDecoratorOptions)
```

**StateDecoratorOptions:**

```typescript
interface StateDecoratorOptions {
  default?: any
  reactive?: boolean
  readonly?: boolean
}
```

**示例:**

```typescript
class MyStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0
}
```

#### @ReactiveState

定义深度响应式状态。

```typescript
@ReactiveState(options?: StateDecoratorOptions)
```

**示例:**

```typescript
class MyStore extends BaseStore {
  @ReactiveState({ default: {} })
  user: User = {}
}
```

#### @PersistentState

定义持久化状态。

```typescript
@PersistentState(options?: PersistentStateOptions)
```

**PersistentStateOptions:**

```typescript
interface PersistentStateOptions extends StateDecoratorOptions {
  key?: string
  storage?: 'localStorage' | 'sessionStorage'
  adapter?: StorageAdapter
  serialize?: (value: any) => string
  deserialize?: (value: string) => any
}
```

#### @ReadonlyState

定义只读状态。

```typescript
@ReadonlyState(options?: StateDecoratorOptions)
```

### 动作装饰器

#### @Action

定义基础动作。

```typescript
@Action(options?: ActionDecoratorOptions)
```

**ActionDecoratorOptions:**

```typescript
interface ActionDecoratorOptions {
  debounce?: number
  throttle?: number
  cache?: boolean | number
}
```

#### @AsyncAction

定义异步动作。

```typescript
@AsyncAction(options?: ActionDecoratorOptions)
```

#### @CachedAction

定义缓存动作。

```typescript
@CachedAction(ttl?: number)
```

**参数:**

- `ttl?: number` - 缓存时间（毫秒），默认 5000ms

#### @DebouncedAction

定义防抖动作。

```typescript
@DebouncedAction(delay: number)
```

**参数:**

- `delay: number` - 防抖延迟（毫秒）

#### @ThrottledAction

定义节流动作。

```typescript
@ThrottledAction(interval: number)
```

**参数:**

- `interval: number` - 节流间隔（毫秒）

### 计算装饰器

#### @Getter

定义基础计算属性。

```typescript
@Getter(options?: GetterDecoratorOptions)
```

**GetterDecoratorOptions:**

```typescript
interface GetterDecoratorOptions {
  cache?: boolean
  dependencies?: string[]
}
```

#### @CachedGetter

定义缓存计算属性。

```typescript
@CachedGetter(dependencies?: string[])
```

**参数:**

- `dependencies?: string[]` - 依赖的状态字段

#### @MemoizedGetter

定义记忆化计算属性。

```typescript
@MemoizedGetter(options?: MemoizedOptions)
```

**MemoizedOptions:**

```typescript
interface MemoizedOptions {
  maxSize?: number
  ttl?: number
}
```

#### @DependentGetter

定义依赖特定字段的计算属性。

```typescript
@DependentGetter(dependencies: string[])
```

## Hook API

### createStore

创建 Hook 式 Store。

```typescript
function createStore<T>(id: string, setup: () => T): () => T
```

**参数:**

- `id: string` - Store 标识符
- `setup: () => T` - Store 设置函数

**返回值:** Hook 函数

**示例:**

```typescript
const useCounter = createStore('counter', () => {
  const count = ref(0)
  const increment = () => count.value++

  return {
    state: { count },
    actions: { increment },
    getters: {},
  }
})
```

### createState

创建简单状态 Hook。

```typescript
function createState<T>(defaultValue: T, options?: StateOptions): () => StateHookReturn<T>
```

**StateHookReturn:**

```typescript
interface StateHookReturn<T> {
  value: Ref<T>
  setValue: (value: T) => void
  reset: () => void
}
```

### createAsyncAction

创建异步动作 Hook。

```typescript
function createAsyncAction<T extends (...args: any[]) => Promise<any>>(
  action: T
): () => AsyncActionHookReturn<T>
```

**AsyncActionHookReturn:**

```typescript
interface AsyncActionHookReturn<T> {
  execute: T
  loading: Ref<boolean>
  error: Ref<Error | null>
  data: Ref<ReturnType<T> | null>
}
```

### createPersistedState

创建持久化状态 Hook。

```typescript
function createPersistedState<T>(
  key: string,
  defaultValue: T,
  options?: PersistOptions
): () => PersistedStateHookReturn<T>
```

**PersistedStateHookReturn:**

```typescript
interface PersistedStateHookReturn<T> {
  value: Ref<T>
  setValue: (value: T) => void
  save: () => void
  load: () => void
  clear: () => void
}
```

### createComputed

创建计算属性 Hook。

```typescript
function createComputed<T>(getter: () => T, options?: ComputedOptions): () => ComputedRef<T>
```

## Vue 集成 API

### StoreProvider

提供 Store 的 Vue 组件。

```vue
<StoreProvider :stores="stores" :pinia="pinia" :global="true">
  <slot />
</StoreProvider>
```

**Props:**

```typescript
interface StoreProviderProps {
  stores: Record<string, any>
  pinia?: Pinia
  global?: boolean
  devtools?: boolean
}
```

### useStoreProvider

获取 Store Provider 上下文。

```typescript
function useStoreProvider(): StoreProviderContext
```

**StoreProviderContext:**

```typescript
interface StoreProviderContext {
  getStore: <T>(id: string) => T | undefined
  hasStore: (id: string) => boolean
  registerStore: (id: string, store: any) => void
  unregisterStore: (id: string) => void
}
```

### useStore

获取特定 Store 实例。

```typescript
function useStore<T>(id: string): T
```

### useState

使用特定状态。

```typescript
function useState<T>(storeId: string, stateKey: string): StateHookReturn<T>
```

### useAction

使用特定动作。

```typescript
function useAction<T extends (...args: any[]) => any>(
  storeId: string,
  actionName: string
): ActionHookReturn<T>
```

**ActionHookReturn:**

```typescript
interface ActionHookReturn<T> {
  execute: T
  loading: Ref<boolean>
  error: Ref<Error | null>
  data: Ref<ReturnType<T> | null>
  reset: () => void
}
```

### useGetter

使用特定计算属性。

```typescript
function useGetter<T>(storeId: string, getterName: string): ComputedRef<T>
```

### useBatch

批量操作 Hook。

```typescript
function useBatch(): BatchHookReturn
```

**BatchHookReturn:**

```typescript
interface BatchHookReturn {
  batch: (fn: () => void) => void
  batchAsync: (fn: () => Promise<void>) => Promise<void>
}
```

### usePersist

持久化操作 Hook。

```typescript
function usePersist(storeId: string): PersistHookReturn
```

**PersistHookReturn:**

```typescript
interface PersistHookReturn {
  save: () => void
  load: () => void
  clear: () => void
  isPersisted: Ref<boolean>
}
```

## 工具函数

### 状态工具

#### deepClone

深度克隆对象。

```typescript
function deepClone<T>(obj: T): T
```

#### deepEqual

深度比较两个对象。

```typescript
function deepEqual(a: any, b: any): boolean
```

#### getNestedValue

获取嵌套对象的值。

```typescript
function getNestedValue(obj: any, path: string): any
```

#### setNestedValue

设置嵌套对象的值。

```typescript
function setNestedValue(obj: any, path: string, value: any): void
```

### 函数工具

#### debounce

创建防抖函数。

```typescript
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T
```

#### throttle

创建节流函数。

```typescript
function throttle<T extends (...args: any[]) => any>(fn: T, interval: number): T
```

#### isFunction

检查是否为函数。

```typescript
function isFunction(value: any): value is Function
```

#### isObject

检查是否为对象。

```typescript
function isObject(value: any): value is object
```

#### isPromise

检查是否为 Promise。

```typescript
function isPromise(value: any): value is Promise<any>
```

#### generateId

生成唯一 ID。

```typescript
function generateId(): string
```

## 类型定义

### 核心类型

```typescript
// Store 相关
interface StoreOptions {
  persist?: PersistOptions
  devtools?: boolean
}

interface PersistOptions {
  key?: string
  storage?: 'localStorage' | 'sessionStorage'
  adapter?: StorageAdapter
  serialize?: (value: any) => string
  deserialize?: (value: string) => any
}

// 装饰器相关
interface DecoratorMetadata {
  type: DecoratorType
  options: any
  target: any
  propertyKey: string
}

type DecoratorType = 'state' | 'action' | 'getter'

// Hook 相关
interface UseStoreReturn<T> {
  state: T['state']
  actions: T['actions']
  getters: T['getters']
}

// Provider 相关
interface ProviderOptions {
  stores: Record<string, any>
  pinia?: Pinia
  global?: boolean
}
```

### 工具类型

```typescript
// 推断类型
type InferState<T> = T extends { state: infer S } ? S : never
type InferActions<T> = T extends { actions: infer A } ? A : never
type InferGetters<T> = T extends { getters: infer G } ? G : never

// 构造函数类型
type Constructor<T = {}> = new (...args: any[]) => T

// 装饰器工厂类型
type DecoratorFactory = (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void
```

## 常量

### 元数据键

```typescript
const DECORATOR_METADATA_KEY: unique symbol
const STORE_PROVIDER_KEY: InjectionKey<StoreProviderContext>
```

### 默认配置

```typescript
const DEFAULT_PERSIST_OPTIONS: PersistOptions
const DEFAULT_DEBOUNCE_DELAY: number
const DEFAULT_THROTTLE_INTERVAL: number
const DEFAULT_CACHE_TTL: number
```

## 错误类型

```typescript
class StoreError extends Error {
  constructor(message: string, cause?: Error)
}

class PersistError extends StoreError {
  constructor(message: string, key: string, cause?: Error)
}

class DecoratorError extends StoreError {
  constructor(message: string, target: any, propertyKey: string)
}
```

## 下一步

- 查看 [示例](/examples/) 了解实际用法
- 阅读 [最佳实践](/guide/best-practices) 编写更好的代码
- 探索 [高级用法](/guide/advanced) 了解进阶技巧
