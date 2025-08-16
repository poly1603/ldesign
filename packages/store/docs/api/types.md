# 类型定义 API

@ldesign/store 提供了完整的 TypeScript 类型定义，确保类型安全和良好的开发体验。

## 核心类型

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

### BaseStore

所有 Store 的基类类型。

```typescript
abstract class BaseStore implements Store {
  readonly $id: string
  readonly $state: Ref<any>

  constructor(id: string, options?: StoreOptions)

  $patch(partialState: any): void
  $patch(mutator: (state: any) => void): void
  $reset(): void
  $subscribe(callback: SubscriptionCallback): () => void
  $onAction(callback: ActionCallback): () => void
  $dispose(): void
  $hydrate(data: any): void
  $serialize(): any
  $nextTick(callback?: () => void): Promise<void>
  $watch<T>(
    getter: (state: any) => T,
    callback: (newValue: T, oldValue: T) => void,
    options?: WatchOptions
  ): () => void
}
```

### StoreOptions

Store 配置选项类型。

```typescript
interface StoreOptions {
  persist?: PersistOptions
  devtools?: boolean
  actions?: ActionDefinition[]
  getters?: GetterDefinition[]
  state?: StateDefinition[]
  plugins?: Plugin[]
}
```

## 装饰器类型

### StateDecoratorOptions

状态装饰器选项类型。

```typescript
interface StateDecoratorOptions {
  default?: any
  reactive?: boolean
  readonly?: boolean
  serialize?: boolean
}
```

### ActionDecoratorOptions

动作装饰器选项类型。

```typescript
interface ActionDecoratorOptions {
  name?: string
  validate?: boolean
  track?: boolean
}
```

### AsyncActionOptions

异步动作装饰器选项类型。

```typescript
interface AsyncActionOptions extends ActionDecoratorOptions {
  loadingState?: string
  errorState?: string
  autoLoading?: boolean
  timeout?: number
}
```

### CachedActionOptions

缓存动作装饰器选项类型。

```typescript
interface CachedActionOptions {
  key?: string | ((...args: any[]) => string)
  maxSize?: number
  serialize?: boolean
}
```

### GetterDecoratorOptions

计算属性装饰器选项类型。

```typescript
interface GetterDecoratorOptions {
  cache?: boolean
  dependencies?: string[]
}
```

### CachedGetterOptions

缓存计算属性装饰器选项类型。

```typescript
interface CachedGetterOptions {
  ttl?: number
  maxSize?: number
}
```

## 持久化类型

### PersistOptions

持久化配置选项类型。

```typescript
interface PersistOptions {
  key?: string
  storage?: 'localStorage' | 'sessionStorage' | StorageAdapter
  paths?: string[]
  beforeRestore?: (context: PersistContext) => void
  afterRestore?: (context: PersistContext) => void
  serializer?: Serializer
  debug?: boolean
}
```

### StorageAdapter

存储适配器接口。

```typescript
interface StorageAdapter {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
  clear: () => void
}
```

### Serializer

序列化器接口。

```typescript
interface Serializer {
  serialize: (value: any) => string
  deserialize: (value: string) => any
}
```

### PersistContext

持久化上下文类型。

```typescript
interface PersistContext {
  store: Store
  key: string
  data: any
  options: PersistOptions
}
```

## 订阅类型

### SubscriptionCallback

状态订阅回调类型。

```typescript
type SubscriptionCallback = (
  mutation: {
    type: string
    payload: any
    storeId: string
  },
  state: any
) => void
```

### ActionCallback

动作监听回调类型。

```typescript
type ActionCallback = (context: {
  name: string
  args: any[]
  store: Store
  after: (callback: () => void) => void
  onError: (callback: (error: Error) => void) => void
}) => void
```

## Hook 类型

### StoreSetup

Hook Store 设置函数类型。

```typescript
interface StoreSetup<T> {
  state: Record<string, Ref<any>>
  actions: Record<string, Function>
  getters: Record<string, ComputedRef<any>>
}
```

### StateOptions

Hook 状态选项类型。

```typescript
interface StateOptions {
  persist?: boolean | PersistOptions
  reactive?: boolean
  readonly?: boolean
}
```

### ActionOptions

Hook 动作选项类型。

```typescript
interface ActionOptions {
  debounce?: number
  throttle?: number
  cache?: number
  loading?: Ref<boolean>
}
```

### GetterOptions

Hook 计算属性选项类型。

```typescript
interface GetterOptions {
  cache?: boolean
  lazy?: boolean
  onTrack?: (event: DebuggerEvent) => void
  onTrigger?: (event: DebuggerEvent) => void
}
```

## 工具类型

### Cache

缓存接口类型。

```typescript
interface Cache<K, V> {
  get: (key: K) => V | undefined
  set: (key: K, value: V, ttl?: number) => void
  has: (key: K) => boolean
  delete: (key: K) => boolean
  clear: () => void
  size: number
  keys: () => IterableIterator<K>
  values: () => IterableIterator<V>
  entries: () => IterableIterator<[K, V]>
}
```

### CacheOptions

缓存选项类型。

```typescript
interface CacheOptions {
  maxSize?: number
  ttl?: number
  onEvict?: (key: any, value: any) => void
}
```

### MemoizeOptions

记忆化选项类型。

```typescript
interface MemoizeOptions {
  maxSize?: number
  ttl?: number
  keyGenerator?: (...args: any[]) => string
}
```

### DebounceOptions

防抖选项类型。

```typescript
interface DebounceOptions {
  leading?: boolean
  trailing?: boolean
  maxWait?: number
}
```

### ThrottleOptions

节流选项类型。

```typescript
interface ThrottleOptions {
  leading?: boolean
  trailing?: boolean
}
```

## 验证类型

### ValidationResult

验证结果类型。

```typescript
interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}
```

### ValidationError

验证错误类型。

```typescript
interface ValidationError {
  path: string
  message: string
  value: any
}
```

### ValidationRule

验证规则类型。

```typescript
interface ValidationRule<T> {
  field: keyof T
  validator: (value: any, data: T) => boolean | string
  message?: string
}
```

## 事件类型

### EventBus

事件总线接口类型。

```typescript
interface EventBus {
  on: <T>(event: string, handler: (data: T) => void) => () => void
  off: (event: string, handler?: Function) => void
  emit: <T>(event: string, data?: T) => void
  once: <T>(event: string, handler: (data: T) => void) => () => void
  clear: () => void
}
```

## 插件类型

### Plugin

插件接口类型。

```typescript
interface Plugin {
  name: string
  install: (store: Store, options?: any) => void
}
```

### StorePlugin

Store 插件类型。

```typescript
interface StorePlugin {
  name: string
  install: (store: Store, options?: any) => void
  beforeCreate?: (options: StoreOptions) => void
  created?: (store: Store) => void
  beforeMount?: (store: Store) => void
  mounted?: (store: Store) => void
  beforeDestroy?: (store: Store) => void
  destroyed?: (store: Store) => void
}
```

## 元数据类型

### StoreMetadata

Store 元数据类型。

```typescript
interface StoreMetadata {
  states: StateMetadata[]
  actions: ActionMetadata[]
  getters: GetterMetadata[]
  options: StoreOptions
}
```

### StateMetadata

状态元数据类型。

```typescript
interface StateMetadata {
  name: string
  type: string
  defaultValue: any
  options: StateDecoratorOptions
}
```

### ActionMetadata

动作元数据类型。

```typescript
interface ActionMetadata {
  name: string
  type: 'sync' | 'async'
  options: ActionDecoratorOptions
}
```

### GetterMetadata

计算属性元数据类型。

```typescript
interface GetterMetadata {
  name: string
  dependencies: string[]
  options: GetterDecoratorOptions
}
```

## 高级类型

### DeepReadonly

深度只读类型。

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}
```

### DeepPartial

深度可选类型。

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
```

### StoreState

提取 Store 状态类型。

```typescript
type StoreState<T> = T extends Store ? T['$state']['value'] : never
```

### StoreActions

提取 Store 动作类型。

```typescript
type StoreActions<T> = {
  [K in keyof T]: T[K] extends Function ? T[K] : never
}
```

### StoreGetters

提取 Store 计算属性类型。

```typescript
type StoreGetters<T> = {
  [K in keyof T]: T[K] extends ComputedRef<infer U> ? U : never
}
```

## 条件类型

### IsRef

检查是否为 Ref 类型。

```typescript
type IsRef<T> = T extends Ref<any> ? true : false
```

### IsReactive

检查是否为 Reactive 类型。

```typescript
type IsReactive<T> = T extends object ? true : false
```

### UnwrapRef

解包 Ref 类型。

```typescript
type UnwrapRef<T> = T extends Ref<infer U> ? U : T
```

## 泛型约束

### StoreConstraint

Store 约束类型。

```typescript
interface StoreConstraint {
  [key: string]: any
  $id: string
  $state: Ref<any>
}
```

### ActionConstraint

动作约束类型。

```typescript
type ActionConstraint = (...args: any[]) => any
```

### GetterConstraint

计算属性约束类型。

```typescript
type GetterConstraint = ComputedRef<any>
```

## 实用类型示例

### 类型安全的 Store 定义

```typescript
interface UserState {
  id: string | null
  name: string
  email: string
  isLoggedIn: boolean
}

interface UserActions {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<UserState>) => void
}

interface UserGetters {
  displayName: string
  initials: string
}

class UserStore extends BaseStore implements UserState, UserActions, UserGetters {
  @State({ default: null })
  id: string | null = null

  @State({ default: '' })
  name: string = ''

  @State({ default: '' })
  email: string = ''

  @AsyncAction()
  async login(credentials: LoginCredentials): Promise<void> {
    // 实现登录逻辑
  }

  @Action()
  logout(): void {
    // 实现登出逻辑
  }

  @Action()
  updateProfile(data: Partial<UserState>): void {
    // 实现更新逻辑
  }

  @Getter()
  get displayName(): string {
    return this.name || this.email
  }

  @Getter()
  get initials(): string {
    return this.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  @Getter()
  get isLoggedIn(): boolean {
    return this.id !== null
  }
}
```

### 类型安全的 Hook Store

```typescript
interface CounterState {
  count: number
  step: number
}

interface CounterActions {
  increment: () => void
  decrement: () => void
  reset: () => void
}

interface CounterGetters {
  doubleCount: number
  isPositive: boolean
}

export const useCounter = createStore<CounterState & CounterActions & CounterGetters>(
  'counter',
  () => {
    const count = ref(0)
    const step = ref(1)

    const increment = () => (count.value += step.value)
    const decrement = () => (count.value -= step.value)
    const reset = () => (count.value = 0)

    const doubleCount = computed(() => count.value * 2)
    const isPositive = computed(() => count.value > 0)

    return {
      state: { count, step },
      actions: { increment, decrement, reset },
      getters: { doubleCount, isPositive },
    }
  }
)
```

## 常见问题

### Q: 如何为自定义 Store 添加类型约束？

A: 使用接口继承和泛型约束：

```typescript
interface MyStoreState {
  data: any[]
  loading: boolean
}

interface MyStoreActions {
  fetchData: () => Promise<void>
}

class MyStore extends BaseStore implements MyStoreState, MyStoreActions {
  // 实现接口
}
```

### Q: 如何确保装饰器的类型安全？

A: 使用明确的类型注解：

```typescript
class TypedStore extends BaseStore {
  @State({ default: [] as User[] })
  users: User[] = []

  @AsyncAction()
  async fetchUsers(): Promise<User[]> {
    // 返回类型明确
    return await userApi.getUsers()
  }
}
```

### Q: 如何处理复杂的嵌套类型？

A: 使用类型别名和泛型：

```typescript
type NestedState<T> = {
  [K in keyof T]: T[K] extends object ? NestedState<T[K]> : T[K]
}

interface ComplexState {
  user: {
    profile: {
      personal: {
        name: string
        age: number
      }
    }
  }
}

class ComplexStore extends BaseStore {
  @State({ default: {} as ComplexState })
  state: ComplexState = {} as ComplexState
}
```

## 下一步

- 查看 [基础示例](/examples/basic) 了解类型的实际使用
- 学习 [高级示例](/examples/advanced) 掌握复杂类型技巧
- 探索 [实战项目](/examples/real-world/) 查看完整的类型系统应用
