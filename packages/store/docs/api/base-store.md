# BaseStore

`BaseStore` 是 @ldesign/store 的核心基类，提供了类式 Store 的基础功能。所有类式 Store 都应该继承自 `BaseStore`。

## 类型定义

```typescript
abstract class BaseStore<
  TState extends StateDefinition = StateDefinition,
  TActions extends ActionDefinition = ActionDefinition,
  TGetters extends GetterDefinition = GetterDefinition
> implements IBaseStore<TState, TActions, TGetters>
```

### 泛型参数

- `TState`: 状态定义类型，必须继承自 `StateDefinition`
- `TActions`: 动作定义类型，必须继承自 `ActionDefinition`
- `TGetters`: 计算属性定义类型，必须继承自 `GetterDefinition`

## 构造函数

```typescript
constructor(
  id: string,
  options?: Partial<StoreOptions<TState, TActions, TGetters>>
)
```

### 参数

- `id`: Store 的唯一标识符，用于在 Pinia 中注册
- `options`: Store 配置选项（可选）
  - `state`: 状态初始化函数
  - `actions`: 动作方法定义对象
  - `getters`: 计算属性定义对象
  - `cache`: 缓存配置选项
  - `persist`: 持久化配置选项

### 示例

```typescript
class UserStore extends BaseStore<
  () => { name: string; age: number },
  { setName: (name: string) => void },
  { displayName: (state: any) => string }
> {
  constructor() {
    super('user', {
      state: () => ({ name: '', age: 0 }),
      actions: {
        setName(name: string) {
          this.name = name
        }
      },
      getters: {
        displayName: (state) => `User: ${state.name}`
      }
    })
  }
}
```

## 实例属性

### $id

```typescript
readonly $id: string
```

Store 的唯一标识符。

### $state

```typescript
get $state(): TState
```

获取当前 Store 的状态对象。返回响应式的状态对象，可以直接读取和修改状态值。

**示例:**

```typescript
const userStore = new UserStore()
console.log(userStore.$state.name) // 读取状态
userStore.$state.name = 'John'      // 修改状态
```

### $actions

```typescript
get $actions(): TActions
```

获取当前 Store 的所有动作方法。返回包含所有动作方法的对象，这些方法已经绑定了正确的上下文。

**示例:**

```typescript
const userStore = new UserStore()
userStore.$actions.setName('John')  // 调用动作方法
```

### $getters

```typescript
get $getters(): TGetters
```

获取当前 Store 的所有计算属性。返回包含所有计算属性的对象，这些属性会根据状态的变化自动重新计算。

**示例:**

```typescript
const userStore = new UserStore()
console.log(userStore.$getters.displayName) // 获取计算属性值
```

## 实例方法

### $patch

```typescript
$patch(partialState: Partial<TState>): void
$patch(mutator: (state: TState) => void): void
```

部分更新状态。支持两种更新方式：

1. 传入部分状态对象，会与当前状态合并
2. 传入修改函数，可以直接修改状态

**参数:**

- `partialState`: 部分状态对象，会与当前状态合并
- `mutator`: 状态修改函数，接收当前状态作为参数

**示例:**

```typescript
const userStore = new UserStore()

// 方式1：传入部分状态对象
userStore.$patch({ name: 'John' })

// 方式2：传入修改函数
userStore.$patch((state) => {
  state.name = 'John'
  state.age = 25
})
```

### $reset

```typescript
$reset(): void
```

重置 Store 状态到初始值。

**示例:**

```typescript
const userStore = new UserStore()
userStore.$state.name = 'John'
userStore.$reset()
console.log(userStore.$state.name) // ''
```

### $subscribe

```typescript
$subscribe(
  callback: (mutation: any, state: TState) => void,
  options?: { detached?: boolean }
): () => void
```

订阅状态变化。

**参数:**

- `callback`: 状态变化回调函数
- `options`: 订阅选项
  - `detached`: 是否在组件卸载时自动取消订阅

**返回值:**

返回取消订阅的函数。

**示例:**

```typescript
const userStore = new UserStore()

const unsubscribe = userStore.$subscribe((mutation, state) => {
  console.log('状态变化:', mutation)
  console.log('新状态:', state)
})

// 取消订阅
unsubscribe()
```

### $onAction

```typescript
$onAction(
  callback: (context: any) => void,
  detached?: boolean
): () => void
```

监听动作执行。

**参数:**

- `callback`: 动作执行回调函数
- `detached`: 是否在组件卸载时自动取消监听

**返回值:**

返回取消监听的函数。

**示例:**

```typescript
const userStore = new UserStore()

const unsubscribe = userStore.$onAction((context) => {
  console.log('动作执行:', context.name)
  console.log('参数:', context.args)
})

// 取消监听
unsubscribe()
```

## 装饰器支持

`BaseStore` 完全支持装饰器语法：

```typescript
import { BaseStore, State, Action, Getter } from '@ldesign/store'

class UserStore extends BaseStore {
  @State({ default: '' })
  name!: string

  @State({ default: 0 })
  age!: number

  @Action()
  setName(name: string) {
    this.name = name
  }

  @Action()
  setAge(age: number) {
    this.age = age
  }

  @Getter()
  get displayName(): string {
    return `${this.name} (${this.age}岁)`
  }

  @Getter({ cache: true })
  get expensiveComputation(): number {
    // 耗时计算，结果会被缓存
    return this.performHeavyCalculation()
  }

  private performHeavyCalculation(): number {
    // 模拟耗时计算
    let result = 0
    for (let i = 0; i < 1000000; i++) {
      result += Math.random()
    }
    return result
  }
}
```

## 生命周期钩子

```typescript
class MyStore extends BaseStore {
  constructor() {
    super('my-store')
  }

  // Store 初始化完成后调用
  protected onInitialized() {
    console.log('Store 初始化完成')
  }

  // Store 销毁前调用
  protected onDestroy() {
    console.log('Store 即将销毁')
  }
}
```

## 错误处理

```typescript
class UserStore extends BaseStore {
  @State({ default: null })
  error!: string | null

  @Action({ async: true })
  async fetchUser(id: number) {
    try {
      this.error = null
      const response = await fetch(`/api/users/${id}`)
      if (!response.ok) {
        throw new Error('获取用户失败')
      }
      const user = await response.json()
      this.name = user.name
      this.age = user.age
    } catch (error) {
      this.error = error.message
      throw error // 重新抛出错误供调用者处理
    }
  }
}
```

## 最佳实践

### 1. 合理的类型定义

```typescript
// 定义清晰的接口
interface UserState {
  id: number | null
  name: string
  email: string
  avatar: string
}

interface UserActions {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<UserState>) => void
}

interface UserGetters {
  isLoggedIn: boolean
  displayName: string
  avatarUrl: string
}

class UserStore extends BaseStore<
  () => UserState,
  UserActions,
  UserGetters
> {
  // 实现...
}
```

### 2. 状态初始化

```typescript
class UserStore extends BaseStore {
  constructor() {
    super('user', {
      state: () => ({
        id: null,
        name: '',
        email: '',
        avatar: '',
        preferences: {
          theme: 'light',
          language: 'zh-CN'
        }
      })
    })
  }
}
```

### 3. 异步动作处理

```typescript
class DataStore extends BaseStore {
  @State({ default: false })
  loading!: boolean

  @State({ default: null })
  error!: string | null

  @Action({ async: true })
  async fetchData() {
    this.loading = true
    this.error = null

    try {
      const data = await api.fetchData()
      this.data = data
    } catch (error) {
      this.error = error.message
    } finally {
      this.loading = false
    }
  }
}
```

## 注意事项

1. **继承要求**: 所有类式 Store 必须继承自 `BaseStore`
2. **ID 唯一性**: 每个 Store 的 ID 必须在应用中唯一
3. **装饰器顺序**: 装饰器的执行顺序可能影响功能，建议按照 `@State`、`@Action`、`@Getter` 的顺序使用
4. **异步动作**: 异步动作应该使用 `@Action({ async: true })` 装饰器
5. **错误处理**: 建议在 Store 中统一处理错误，并提供错误状态给组件使用

## 相关链接

- [装饰器详解](/guide/decorators)
- [类式使用指南](/guide/class-usage)
- [性能优化](/guide/performance)
- [最佳实践](/guide/best-practices)
