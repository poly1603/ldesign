# 装饰器使用指南

@ldesign/store 提供了丰富的装饰器，让你能够以声明式的方式定义状态管理逻辑。

## @State 装饰器

`@State` 装饰器用于定义响应式状态。

### 基础用法

```typescript
import { BaseStore, State } from '@ldesign/store'

class UserStore extends BaseStore {
  @State({ default: '' })
  name: string = ''

  @State({ default: 0 })
  age: number = 0

  @State({ default: [] })
  hobbies: string[] = []
}
```

### 配置选项

```typescript
interface StateDecoratorOptions {
  default?: any // 默认值
  deep?: boolean // 是否深度响应式
  persist?: boolean // 是否持久化
}
```

### 特殊状态装饰器

#### @ReactiveState - 深度响应式状态

```typescript
class ProfileStore extends BaseStore {
  @ReactiveState({
    default: {
      personal: { name: '', age: 0 },
      contact: { email: '', phone: '' },
    },
  })
  profile: UserProfile = {
    personal: { name: '', age: 0 },
    contact: { email: '', phone: '' },
  }
}
```

#### @PersistentState - 持久化状态

```typescript
class SettingsStore extends BaseStore {
  @PersistentState({ default: 'light' })
  theme: string = 'light'

  @PersistentState({ default: 'zh-CN' })
  language: string = 'zh-CN'
}
```

#### @ReadonlyState - 只读状态

```typescript
class ConfigStore extends BaseStore {
  @ReadonlyState({ value: '1.0.0' })
  version: string

  @ReadonlyState({ value: 'production' })
  environment: string
}
```

## @Action 装饰器

`@Action` 装饰器用于定义状态变更方法。

### 基础用法

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

  @Action()
  toggleTodo(id: number) {
    const todo = this.todos.find(t => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
    }
  }

  @Action()
  removeTodo(id: number) {
    const index = this.todos.findIndex(t => t.id === id)
    if (index > -1) {
      this.todos.splice(index, 1)
    }
  }
}
```

### 配置选项

```typescript
interface ActionDecoratorOptions {
  async?: boolean // 是否异步
  cache?: boolean // 是否缓存结果
  cacheTime?: number // 缓存时间（毫秒）
  debounce?: number // 防抖延迟（毫秒）
  throttle?: number // 节流间隔（毫秒）
}
```

### 特殊 Action 装饰器

#### @AsyncAction - 异步操作

```typescript
class ApiStore extends BaseStore {
  @State({ default: [] })
  users: User[] = []

  @State({ default: false })
  loading: boolean = false

  @AsyncAction()
  async fetchUsers() {
    this.loading = true
    try {
      const response = await fetch('/api/users')
      this.users = await response.json()
    } finally {
      this.loading = false
    }
  }
}
```

#### @CachedAction - 缓存结果

```typescript
class DataStore extends BaseStore {
  @CachedAction(5000) // 缓存 5 秒
  async expensiveCalculation(input: number) {
    // 模拟耗时计算
    await new Promise(resolve => setTimeout(resolve, 1000))
    return input * Math.random()
  }
}
```

#### @DebouncedAction - 防抖操作

```typescript
class SearchStore extends BaseStore {
  @State({ default: '' })
  query: string = ''

  @State({ default: [] })
  results: SearchResult[] = []

  @DebouncedAction(300) // 300ms 防抖
  async search(query: string) {
    this.query = query
    if (query.trim()) {
      const response = await fetch(`/api/search?q=${query}`)
      this.results = await response.json()
    } else {
      this.results = []
    }
  }
}
```

#### @ThrottledAction - 节流操作

```typescript
class ScrollStore extends BaseStore {
  @State({ default: 0 })
  scrollY: number = 0

  @ThrottledAction(16) // 约 60fps
  updateScrollPosition(y: number) {
    this.scrollY = y
  }
}
```

## @Getter 装饰器

`@Getter` 装饰器用于定义计算属性。

### 基础用法

```typescript
class ShoppingCartStore extends BaseStore {
  @State({ default: [] })
  items: CartItem[] = []

  @Getter()
  get totalItems() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  @Getter()
  get totalPrice() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  @Getter()
  get isEmpty() {
    return this.items.length === 0
  }
}
```

### 配置选项

```typescript
interface GetterDecoratorOptions {
  cache?: boolean // 是否缓存
  deps?: string[] // 依赖的状态字段
}
```

### 特殊 Getter 装饰器

#### @CachedGetter - 缓存计算结果

```typescript
class AnalyticsStore extends BaseStore {
  @State({ default: [] })
  data: DataPoint[] = []

  @CachedGetter(['data'])
  get complexAnalysis() {
    // 复杂的数据分析计算
    return this.data.reduce((result, point) => {
      // 耗时的计算逻辑
      return result + point.value * Math.log(point.timestamp)
    }, 0)
  }
}
```

#### @DependentGetter - 指定依赖

```typescript
class UserStore extends BaseStore {
  @State({ default: '' })
  firstName: string = ''

  @State({ default: '' })
  lastName: string = ''

  @State({ default: 0 })
  age: number = 0

  @DependentGetter(['firstName', 'lastName'])
  get fullName() {
    return `${this.firstName} ${this.lastName}`.trim()
  }

  @DependentGetter(['age'])
  get ageGroup() {
    if (this.age < 18) return 'minor'
    if (this.age < 65) return 'adult'
    return 'senior'
  }
}
```

#### @MemoizedGetter - 记忆化计算

```typescript
class FibonacciStore extends BaseStore {
  @State({ default: 10 })
  n: number = 10

  @MemoizedGetter(['n'])
  get fibonacci() {
    const fib = (num: number): number => {
      if (num <= 1) return num
      return fib(num - 1) + fib(num - 2)
    }
    return fib(this.n)
  }
}
```

## 装饰器组合使用

你可以组合使用多个装饰器来创建功能丰富的 Store：

```typescript
class BlogStore extends BaseStore {
  // 状态定义
  @PersistentState({ default: [] })
  posts: BlogPost[] = []

  @State({ default: false })
  loading: boolean = false

  @State({ default: '' })
  searchQuery: string = ''

  @ReadonlyState({ value: 'blog-v1' })
  version: string

  // 异步操作
  @AsyncAction()
  async fetchPosts() {
    this.loading = true
    try {
      const response = await fetch('/api/posts')
      this.posts = await response.json()
    } finally {
      this.loading = false
    }
  }

  // 防抖搜索
  @DebouncedAction(300)
  async searchPosts(query: string) {
    this.searchQuery = query
    if (query.trim()) {
      const response = await fetch(`/api/posts/search?q=${query}`)
      this.posts = await response.json()
    }
  }

  // 缓存的复杂计算
  @CachedGetter(['posts'])
  get postsByCategory() {
    return this.posts.reduce((acc, post) => {
      const category = post.category || 'uncategorized'
      if (!acc[category]) acc[category] = []
      acc[category].push(post)
      return acc
    }, {} as Record<string, BlogPost[]>)
  }

  // 依赖特定字段的计算
  @DependentGetter(['searchQuery', 'posts'])
  get filteredPosts() {
    if (!this.searchQuery.trim()) return this.posts
    return this.posts.filter(
      post =>
        post.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(this.searchQuery.toLowerCase())
    )
  }
}
```

## 最佳实践

1. **合理使用缓存**：对于计算密集的 getter，使用 `@CachedGetter`
2. **防抖搜索**：对于搜索功能，使用 `@DebouncedAction`
3. **节流滚动**：对于滚动事件，使用 `@ThrottledAction`
4. **持久化设置**：对于用户设置，使用 `@PersistentState`
5. **只读配置**：对于配置常量，使用 `@ReadonlyState`

## 下一步

- [Hook 使用方式](/guide/hooks) - 了解函数式的使用方法
- [Provider 模式](/guide/provider) - 学习依赖注入模式
- [性能优化](/guide/performance) - 优化你的状态管理
