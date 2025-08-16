# 基本概念

了解 @ldesign/store 的核心概念，帮助你更好地使用这个状态管理库。

## 核心概念

### Store (存储)

Store 是状态管理的核心单元，包含应用的状态、操作和计算属性。在 @ldesign/store 中，Store 可以通过多种
方式定义：

```typescript
// 类式定义
class UserStore extends BaseStore {
  @State({ default: null })
  user: User | null = null
}

// Hook 式定义
const useUserStore = createStore('user', () => {
  const user = ref(null)
  return { state: { user }, actions: {}, getters: {} }
})
```

### State (状态)

State 是存储在 Store 中的数据。状态应该是响应式的，当状态发生变化时，使用该状态的组件会自动更新。

```typescript
class CounterStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0

  @State({ default: 'Counter' })
  title: string = 'Counter'
}
```

#### 状态特性

- **响应式**: 状态变化会自动触发视图更新
- **类型安全**: 完整的 TypeScript 类型支持
- **持久化**: 可选的本地存储持久化
- **深度响应**: 支持嵌套对象的响应式

### Action (动作)

Action 是修改状态的方法。所有的状态变更都应该通过 Action 进行，这样可以保证状态变更的可追踪性。

```typescript
class TodoStore extends BaseStore {
  @State({ default: [] })
  todos: Todo[] = []

  @Action()
  addTodo(text: string) {
    this.todos.push({
      id: Date.now(),
      text,
      completed: false,
    })
  }

  @AsyncAction()
  async fetchTodos() {
    const response = await api.getTodos()
    this.todos = response.data
  }
}
```

#### Action 特性

- **同步/异步**: 支持同步和异步操作
- **性能优化**: 内置防抖、节流、缓存功能
- **错误处理**: 统一的错误处理机制
- **可追踪**: 所有 Action 调用都可以被监听

### Getter (计算属性)

Getter 是基于状态计算得出的值。它们会被缓存，只有当依赖的状态发生变化时才会重新计算。

```typescript
class ShoppingCartStore extends BaseStore {
  @State({ default: [] })
  items: CartItem[] = []

  @Getter()
  get totalPrice() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  @Getter()
  get itemCount() {
    return this.items.length
  }

  @CachedGetter(['items'])
  get expensiveCalculation() {
    // 复杂计算，会被缓存
    return this.items.reduce((result, item) => {
      return result + someExpensiveOperation(item)
    }, 0)
  }
}
```

#### Getter 特性

- **自动缓存**: 只有依赖变化时才重新计算
- **依赖追踪**: 自动追踪依赖的状态
- **类型推导**: 自动推导返回类型
- **性能优化**: 支持手动缓存控制

## 装饰器系统

@ldesign/store 提供了丰富的装饰器来声明式地定义 Store 的各个部分。

### 状态装饰器

```typescript
class ExampleStore extends BaseStore {
  // 基础状态
  @State({ default: 'hello' })
  message: string = 'hello'

  // 深度响应式状态
  @ReactiveState({ default: { theme: 'dark' } })
  settings: Settings = { theme: 'dark' }

  // 持久化状态
  @PersistentState({ default: [] })
  favorites: string[] = []

  // 只读状态
  @ReadonlyState({ value: '1.0.0' })
  version: string
}
```

### 动作装饰器

```typescript
class ApiStore extends BaseStore {
  // 基础动作
  @Action()
  updateData(data: any) {
    this.data = data
  }

  // 异步动作
  @AsyncAction()
  async fetchData() {
    const response = await api.getData()
    this.data = response
  }

  // 防抖动作
  @DebouncedAction(300)
  search(query: string) {
    this.performSearch(query)
  }

  // 缓存动作
  @CachedAction(5000)
  expensiveOperation(input: any) {
    return performExpensiveCalculation(input)
  }
}
```

### 计算装饰器

```typescript
class DataStore extends BaseStore {
  @State({ default: [] })
  items: Item[] = []

  // 基础计算属性
  @Getter()
  get itemCount() {
    return this.items.length
  }

  // 缓存计算属性
  @CachedGetter(['items'])
  get processedItems() {
    return this.items.map(item => processItem(item))
  }

  // 依赖特定字段的计算属性
  @DependentGetter(['items'])
  get sortedItems() {
    return [...this.items].sort((a, b) => a.name.localeCompare(b.name))
  }
}
```

## 使用模式

### 1. 类式模式

面向对象的使用方式，适合复杂的业务逻辑：

```typescript
class UserManagementStore extends BaseStore {
  @PersistentState({ default: null })
  currentUser: User | null = null

  @State({ default: [] })
  users: User[] = []

  @State({ default: false })
  loading: boolean = false

  @AsyncAction()
  async login(credentials: LoginCredentials) {
    this.loading = true
    try {
      this.currentUser = await authApi.login(credentials)
    } finally {
      this.loading = false
    }
  }

  @Getter()
  get isLoggedIn() {
    return this.currentUser !== null
  }
}
```

### 2. Hook 模式

函数式的使用方式，适合简单的状态管理：

```typescript
export const useCounter = createStore('counter', () => {
  const count = ref(0)
  const step = ref(1)

  const increment = () => (count.value += step.value)
  const decrement = () => (count.value -= step.value)
  const reset = () => (count.value = 0)

  const displayText = computed(() => `Count: ${count.value}`)
  const isPositive = computed(() => count.value > 0)

  return {
    state: { count, step },
    actions: { increment, decrement, reset },
    getters: { displayText, isPositive },
  }
})
```

### 3. Provider 模式

依赖注入模式，适合大型应用的架构设计：

```vue
<script setup lang="ts">
import { StoreProvider } from '@ldesign/store/vue'
import { CartStore, SettingsStore, UserStore } from '@/stores'

const stores = {
  user: UserStore,
  cart: CartStore,
  settings: SettingsStore,
}
</script>

<template>
  <StoreProvider :stores="stores">
    <RouterView />
  </StoreProvider>
</template>
```

### 4. 组合式 API 模式

与 Vue 3 组合式 API 深度集成：

```vue
<script setup lang="ts">
import { useAction, useState, useStore } from '@ldesign/store/vue'

// 使用整个 Store
const userStore = useStore('user')

// 使用特定状态
const { value: username, setValue: setUsername } = useState('user', 'name')

// 使用特定 Action
const { execute: login, loading, error } = useAction('user', 'login')
</script>
```

## 响应式系统

@ldesign/store 基于 Vue 3 的响应式系统，提供了强大的响应式能力：

### 深度响应式

```typescript
class SettingsStore extends BaseStore {
  @ReactiveState({
    default: {
      theme: { mode: 'dark', color: 'blue' },
      layout: { sidebar: true, header: true },
    },
  })
  config: AppConfig = {
    theme: { mode: 'dark', color: 'blue' },
    layout: { sidebar: true, header: true },
  }

  @Action()
  updateTheme(mode: 'light' | 'dark') {
    // 深度响应式，嵌套属性变化也会触发更新
    this.config.theme.mode = mode
  }
}
```

### 计算属性依赖

```typescript
class DataAnalysisStore extends BaseStore {
  @State({ default: [] })
  rawData: DataPoint[] = []

  @State({ default: 'all' })
  filter: string = 'all'

  @Getter()
  get filteredData() {
    // 自动依赖 rawData 和 filter
    return this.rawData.filter(item => this.filter === 'all' || item.category === this.filter)
  }

  @Getter()
  get statistics() {
    // 自动依赖 filteredData
    return {
      count: this.filteredData.length,
      average:
        this.filteredData.reduce((sum, item) => sum + item.value, 0) / this.filteredData.length,
    }
  }
}
```

## 性能优化

### 缓存机制

```typescript
class PerformanceStore extends BaseStore {
  @State({ default: [] })
  largeDataset: DataItem[] = []

  // 缓存计算结果
  @CachedGetter(['largeDataset'])
  get processedData() {
    return this.largeDataset.map(item => expensiveProcessing(item))
  }

  // 缓存 Action 结果
  @CachedAction(10000) // 缓存 10 秒
  async fetchExpensiveData(params: any) {
    return await api.getExpensiveData(params)
  }
}
```

### 防抖和节流

```typescript
class SearchStore extends BaseStore {
  @State({ default: '' })
  query: string = ''

  @State({ default: [] })
  results: SearchResult[] = []

  // 防抖搜索，避免频繁请求
  @DebouncedAction(300)
  async search(query: string) {
    this.query = query
    if (query.trim()) {
      this.results = await searchApi.search(query)
    } else {
      this.results = []
    }
  }

  // 节流更新，限制更新频率
  @ThrottledAction(100)
  updateScrollPosition(position: number) {
    this.scrollPosition = position
  }
}
```

## 最佳实践

1. **单一职责**: 每个 Store 应该只负责一个特定的业务领域
2. **状态规范化**: 避免嵌套过深的状态结构
3. **Action 纯净**: Action 应该是纯函数，避免副作用
4. **合理缓存**: 对于计算密集的操作使用缓存
5. **类型安全**: 充分利用 TypeScript 的类型系统

## 下一步

- 学习 [装饰器详解](/guide/decorators)
- 了解 [Hook 使用方式](/guide/hooks)
- 探索 [Provider 模式](/guide/provider)
- 查看 [性能优化](/guide/performance) 技巧
