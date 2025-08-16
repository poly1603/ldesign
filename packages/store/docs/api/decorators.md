# 装饰器 API

@ldesign/store 提供了丰富的装饰器系统，让你可以用声明式的方式定义状态、动作和计算属性。

## 前置要求

### TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "useDefineForClassFields": false
  }
}
```

### 运行时支持

```typescript
// main.ts
import 'reflect-metadata'
```

## 状态装饰器

### @State

定义基础响应式状态。

```typescript
@State(options?: StateDecoratorOptions)
```

**StateDecoratorOptions 接口：**

```typescript
interface StateDecoratorOptions {
  default?: any // 默认值
  reactive?: boolean // 是否深度响应式，默认 true
  readonly?: boolean // 是否只读，默认 false
  serialize?: boolean // 是否参与序列化，默认 true
}
```

**示例：**

```typescript
class UserStore extends BaseStore {
  @State({ default: '' })
  name: string = ''

  @State({ default: 0 })
  age: number = 0

  @State({ default: [], reactive: true })
  hobbies: string[] = []

  @State({ default: null, readonly: true })
  readonly id: string | null = null
}
```

**特性：**

- 自动创建响应式状态
- 支持类型推断
- 可配置默认值和行为

### @ReactiveState

定义深度响应式状态，适用于复杂对象。

```typescript
@ReactiveState(options?: StateDecoratorOptions)
```

**示例：**

```typescript
class SettingsStore extends BaseStore {
  @ReactiveState({
    default: {
      theme: 'light',
      language: 'zh-CN',
      notifications: {
        email: true,
        push: false,
      },
    },
  })
  preferences: UserPreferences = {
    theme: 'light',
    language: 'zh-CN',
    notifications: {
      email: true,
      push: false,
    },
  }
}
```

**与 @State 的区别：**

- 强制深度响应式
- 适合嵌套对象
- 性能开销稍大

### @PersistentState

定义自动持久化的状态。

```typescript
@PersistentState(options?: PersistentStateOptions)
```

**PersistentStateOptions 接口：**

```typescript
interface PersistentStateOptions extends StateDecoratorOptions {
  key?: string // 存储键名，默认使用字段名
  storage?: 'localStorage' | 'sessionStorage' // 存储类型
  adapter?: StorageAdapter // 自定义存储适配器
  serialize?: (value: any) => string // 自定义序列化
  deserialize?: (value: string) => any // 自定义反序列化
  condition?: () => boolean // 持久化条件
  ttl?: number // 过期时间（毫秒）
}
```

**示例：**

```typescript
class AppStore extends BaseStore {
  // 基础持久化
  @PersistentState({ default: 'light' })
  theme: 'light' | 'dark' = 'light'

  // 自定义存储键
  @PersistentState({
    default: [],
    key: 'user_favorites_v2',
  })
  favorites: string[] = []

  // 使用 sessionStorage
  @PersistentState({
    default: null,
    storage: 'sessionStorage',
  })
  currentSession: Session | null = null

  // 自定义序列化
  @PersistentState({
    default: new Date(),
    serialize: (date: Date) => date.toISOString(),
    deserialize: (str: string) => new Date(str),
  })
  lastVisit: Date = new Date()

  // 条件持久化
  @PersistentState({
    default: [],
    condition: () => this.isLoggedIn,
  })
  userSpecificData: any[] = []
}
```

### @ReadonlyState

定义只读状态，通常用于配置或常量。

```typescript
@ReadonlyState(options?: ReadonlyStateOptions)
```

**ReadonlyStateOptions 接口：**

```typescript
interface ReadonlyStateOptions {
  value: any // 只读值
  computed?: boolean // 是否为计算属性
}
```

**示例：**

```typescript
class ConfigStore extends BaseStore {
  @ReadonlyState({ value: '1.0.0' })
  readonly version: string

  @ReadonlyState({ value: 'production' })
  readonly environment: string

  @ReadonlyState({
    value: {
      apiUrl: 'https://api.example.com',
      timeout: 5000,
    },
  })
  readonly apiConfig: ApiConfig
}
```

## 动作装饰器

### @Action

定义基础动作方法。

```typescript
@Action(options?: ActionDecoratorOptions)
```

**ActionDecoratorOptions 接口：**

```typescript
interface ActionDecoratorOptions {
  name?: string // 动作名称，默认使用方法名
  validate?: boolean // 是否验证参数，默认 false
  track?: boolean // 是否跟踪执行，默认 true
}
```

**示例：**

```typescript
class CounterStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0

  @Action()
  increment() {
    this.count++
  }

  @Action()
  add(value: number) {
    this.count += value
  }

  @Action({ name: 'reset_counter' })
  reset() {
    this.count = 0
  }
}
```

### @AsyncAction

定义异步动作，自动管理加载状态。

```typescript
@AsyncAction(options?: AsyncActionOptions)
```

**AsyncActionOptions 接口：**

```typescript
interface AsyncActionOptions extends ActionDecoratorOptions {
  loadingState?: string // 加载状态字段名，默认 'loading'
  errorState?: string // 错误状态字段名，默认 'error'
  autoLoading?: boolean // 是否自动管理加载状态，默认 true
  timeout?: number // 超时时间（毫秒）
}
```

**示例：**

```typescript
class UserStore extends BaseStore {
  @State({ default: null })
  user: User | null = null

  @State({ default: false })
  loading: boolean = false

  @State({ default: null })
  error: string | null = null

  @AsyncAction()
  async fetchUser(id: number) {
    // loading 自动设置为 true
    const response = await userApi.getUser(id)
    this.user = response.data
    // loading 自动设置为 false
  }

  @AsyncAction({
    loadingState: 'saving',
    errorState: 'saveError',
    timeout: 10000,
  })
  async saveUser(userData: Partial<User>) {
    const response = await userApi.updateUser(this.user!.id, userData)
    this.user = { ...this.user!, ...response.data }
  }
}
```

### @CachedAction

缓存动作执行结果。

```typescript
@CachedAction(ttl?: number, options?: CachedActionOptions)
```

**参数：**

- `ttl?: number` - 缓存时间（毫秒），默认 5000ms
- `options?: CachedActionOptions` - 缓存选项

**CachedActionOptions 接口：**

```typescript
interface CachedActionOptions {
  key?: string | ((args: any[]) => string) // 缓存键生成函数
  maxSize?: number // 最大缓存数量
  serialize?: boolean // 是否序列化参数作为键
}
```

**示例：**

```typescript
class DataStore extends BaseStore {
  @State({ default: new Map() })
  cache: Map<string, any> = new Map()

  // 缓存 5 秒
  @CachedAction(5000)
  async fetchExpensiveData(params: any) {
    console.log('执行昂贵的计算...')
    return await performExpensiveCalculation(params)
  }

  // 永久缓存
  @CachedAction()
  async fetchStaticConfig() {
    return await configApi.getConfig()
  }

  // 自定义缓存键
  @CachedAction(60000, {
    key: args => `user-${args[0]}-profile`,
    maxSize: 100,
  })
  async fetchUserProfile(userId: string) {
    return await userApi.getProfile(userId)
  }
}
```

### @DebouncedAction

防抖动作，防止频繁调用。

```typescript
@DebouncedAction(delay: number, options?: DebouncedActionOptions)
```

**参数：**

- `delay: number` - 防抖延迟（毫秒）
- `options?: DebouncedActionOptions` - 防抖选项

**DebouncedActionOptions 接口：**

```typescript
interface DebouncedActionOptions {
  leading?: boolean // 是否在延迟开始时执行，默认 false
  trailing?: boolean // 是否在延迟结束时执行，默认 true
  maxWait?: number // 最大等待时间
}
```

**示例：**

```typescript
class SearchStore extends BaseStore {
  @State({ default: '' })
  query: string = ''

  @State({ default: [] })
  results: SearchResult[] = []

  // 300ms 防抖搜索
  @DebouncedAction(300)
  async search(query: string) {
    this.query = query
    if (!query.trim()) {
      this.results = []
      return
    }

    const response = await searchApi.search(query)
    this.results = response.data
  }

  // 立即执行一次，然后防抖
  @DebouncedAction(500, { leading: true })
  async saveQuery(query: string) {
    await queryApi.save(query)
  }
}
```

### @ThrottledAction

节流动作，限制执行频率。

```typescript
@ThrottledAction(interval: number, options?: ThrottledActionOptions)
```

**参数：**

- `interval: number` - 节流间隔（毫秒）
- `options?: ThrottledActionOptions` - 节流选项

**ThrottledActionOptions 接口：**

```typescript
interface ThrottledActionOptions {
  leading?: boolean // 是否在间隔开始时执行，默认 true
  trailing?: boolean // 是否在间隔结束时执行，默认 false
}
```

**示例：**

```typescript
class ScrollStore extends BaseStore {
  @State({ default: 0 })
  scrollY: number = 0

  @State({ default: false })
  isScrolling: boolean = false

  // 每 100ms 最多执行一次
  @ThrottledAction(100)
  updateScrollPosition(y: number) {
    this.scrollY = y
    this.isScrolling = true

    setTimeout(() => {
      this.isScrolling = false
    }, 150)
  }

  // 滚动开始和结束都执行
  @ThrottledAction(200, { leading: true, trailing: true })
  trackScrolling(y: number) {
    console.log('滚动位置:', y)
  }
}
```

## 计算属性装饰器

### @Getter

定义基础计算属性。

```typescript
@Getter(options?: GetterDecoratorOptions)
```

**GetterDecoratorOptions 接口：**

```typescript
interface GetterDecoratorOptions {
  cache?: boolean // 是否缓存结果，默认 true
  dependencies?: string[] // 依赖的状态字段
}
```

**示例：**

```typescript
class ShoppingCartStore extends BaseStore {
  @State({ default: [] })
  items: CartItem[] = []

  @State({ default: 0.1 })
  taxRate: number = 0.1

  @Getter()
  get itemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  @Getter()
  get subtotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  @Getter()
  get tax() {
    return this.subtotal * this.taxRate
  }

  @Getter()
  get total() {
    return this.subtotal + this.tax
  }
}
```

### @CachedGetter

手动指定依赖的缓存计算属性。

```typescript
@CachedGetter(dependencies: string[], options?: CachedGetterOptions)
```

**参数：**

- `dependencies: string[]` - 依赖的状态字段列表
- `options?: CachedGetterOptions` - 缓存选项

**CachedGetterOptions 接口：**

```typescript
interface CachedGetterOptions {
  ttl?: number // 缓存时间（毫秒）
  maxSize?: number // 最大缓存数量
}
```

**示例：**

```typescript
class AnalyticsStore extends BaseStore {
  @State({ default: [] })
  rawData: DataPoint[] = []

  @State({ default: 'daily' })
  timeframe: 'daily' | 'weekly' | 'monthly' = 'daily'

  // 只有 rawData 变化时才重新计算
  @CachedGetter(['rawData'])
  get processedData() {
    console.log('处理原始数据...')
    return this.rawData.map(point => ({
      ...point,
      processed: true,
      timestamp: new Date(point.timestamp),
    }))
  }

  // 依赖多个字段
  @CachedGetter(['rawData', 'timeframe'])
  get aggregatedData() {
    console.log('聚合数据...')
    return this.aggregateByTimeframe(this.processedData, this.timeframe)
  }
}
```

### @MemoizedGetter

记忆化计算属性，支持参数化计算。

```typescript
@MemoizedGetter(options?: MemoizedGetterOptions)
```

**MemoizedGetterOptions 接口：**

```typescript
interface MemoizedGetterOptions {
  maxSize?: number // 最大缓存数量，默认 100
  ttl?: number // 缓存时间（毫秒）
  keyGenerator?: (...args: any[]) => string // 自定义键生成器
}
```

**示例：**

```typescript
class ProductStore extends BaseStore {
  @State({ default: [] })
  products: Product[] = []

  // 记忆化过滤结果
  @MemoizedGetter({ maxSize: 10, ttl: 60000 })
  getFilteredProducts(category: string, priceRange: [number, number]) {
    console.log(`过滤产品: ${category}, ${priceRange}`)
    return this.products.filter(
      product =>
        product.category === category &&
        product.price >= priceRange[0] &&
        product.price <= priceRange[1]
    )
  }

  // 自定义键生成器
  @MemoizedGetter({
    maxSize: 20,
    keyGenerator: (query, filters) => `${query}-${JSON.stringify(filters)}`,
  })
  searchProducts(query: string, filters: any = {}) {
    console.log(`搜索产品: ${query}`)
    return this.products.filter(product => {
      const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase())
      const matchesFilters = Object.entries(filters).every(([key, value]) => product[key] === value)
      return matchesQuery && matchesFilters
    })
  }
}
```

### @DependentGetter

明确指定依赖字段的计算属性。

```typescript
@DependentGetter(dependencies: string[], options?: GetterDecoratorOptions)
```

**示例：**

```typescript
class UserProfileStore extends BaseStore {
  @State({ default: '' })
  firstName: string = ''

  @State({ default: '' })
  lastName: string = ''

  @State({ default: '' })
  email: string = ''

  @State({ default: null })
  avatar: string | null = null

  // 只依赖 firstName 和 lastName
  @DependentGetter(['firstName', 'lastName'])
  get fullName() {
    return `${this.firstName} ${this.lastName}`.trim()
  }

  // 依赖 avatar 和计算出的 fullName
  @DependentGetter(['avatar', 'firstName', 'lastName'])
  get profileSummary() {
    return {
      name: this.fullName,
      avatar: this.avatar || this.generateAvatar(this.fullName),
      initials: this.getInitials(this.fullName),
    }
  }

  private generateAvatar(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }
}
```

## 装饰器组合

### 多装饰器组合

```typescript
class ComplexStore extends BaseStore {
  @PersistentState({ default: [] })
  items: Item[] = []

  @State({ default: false })
  loading: boolean = false

  // 组合使用多个装饰器
  @AsyncAction()
  @CachedAction(30000)
  @DebouncedAction(500)
  async searchItems(query: string) {
    const response = await itemApi.search(query)
    return response.data
  }

  @CachedGetter(['items'])
  @MemoizedGetter({ maxSize: 50 })
  getItemsByCategory(category: string) {
    return this.items.filter(item => item.category === category)
  }
}
```

### 自定义装饰器

```typescript
// 创建自定义装饰器
function LogExecution(message?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      console.log(`执行 ${message || propertyKey}:`, args)
      const result = originalMethod.apply(this, args)
      console.log(`${message || propertyKey} 执行完成:`, result)
      return result
    }
  }
}

// 使用自定义装饰器
class LoggedStore extends BaseStore {
  @LogExecution('用户登录')
  @AsyncAction()
  async login(credentials: LoginCredentials) {
    return await authApi.login(credentials)
  }
}
```

## 装饰器元数据

### 获取装饰器信息

```typescript
import { getStoreMetadata } from '@ldesign/store'

class ExampleStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0

  @Action()
  increment() {
    this.count++
  }

  @Getter()
  get doubleCount() {
    return this.count * 2
  }
}

// 获取 Store 的元数据
const metadata = getStoreMetadata(ExampleStore)
console.log(metadata.states) // 状态字段信息
console.log(metadata.actions) // 动作方法信息
console.log(metadata.getters) // 计算属性信息
```

## 常见问题

### Q: 装饰器的执行顺序是什么？

A: 装饰器从下到上执行：

```typescript
@First
@Second
@Third
method() {}

// 执行顺序：Third -> Second -> First
```

### Q: 如何在装饰器中访问 Store 实例？

A: 使用 `this` 关键字：

```typescript
@Action()
customAction() {
  console.log(this.$id)  // 访问 Store ID
  this.otherAction()     // 调用其他方法
}
```

### Q: 装饰器会影响性能吗？

A: 装饰器本身的性能影响很小，主要开销来自功能实现（如缓存、防抖等）。

### Q: 可以在运行时动态添加装饰器吗？

A: 不可以。装饰器是编译时特性，需要在类定义时指定。

## 下一步

- 学习 [Hook API](/api/hooks) 了解函数式状态管理
- 查看 [Vue 集成](/api/vue) 了解 Vue 特定功能
- 探索 [工具函数](/api/utils) 了解辅助工具
