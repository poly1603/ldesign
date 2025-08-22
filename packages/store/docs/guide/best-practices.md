# 最佳实践

本指南总结了使用 @ldesign/store 的最佳实践，帮助你构建可维护、高性能的状态管理应用。

## 架构设计

### 1. Store 职责分离

每个 Store 应该只负责一个特定的业务领域：

```typescript
// ✅ 好的设计 - 单一职责
class UserStore extends BaseStore {
  @PersistentState({ default: null })
  currentUser: User | null = null

  @AsyncAction()
  async login(credentials: LoginCredentials) {
    /* ... */
  }

  @AsyncAction()
  async logout() {
    /* ... */
  }

  @Getter()
  get isLoggedIn() {
    return this.currentUser !== null
  }
}

class CartStore extends BaseStore {
  @PersistentState({ default: [] })
  items: CartItem[] = []

  @Action()
  addItem(product: Product) {
    /* ... */
  }

  @Action()
  removeItem(productId: string) {
    /* ... */
  }
}

// ❌ 不好的设计 - 职责混乱
class MixedStore extends BaseStore {
  // 用户相关
  @State({ default: null })
  user: User | null = null

  // 购物车相关
  @State({ default: [] })
  cartItems: CartItem[] = []

  // 产品相关
  @State({ default: [] })
  products: Product[] = []
}
```

### 2. 合理的 Store 层次结构

```typescript
// 应用级 Store - 全局状态
class AppStore extends BaseStore {
  @PersistentState({ default: 'light' })
  theme: 'light' | 'dark' = 'light'

  @State({ default: false })
  loading: boolean = false

  @State({ default: null })
  error: string | null = null
}

// 功能级 Store - 特定功能
class ShoppingStore extends BaseStore {
  private userStore: UserStore
  private cartStore: CartStore
  private productStore: ProductStore

  constructor(id: string) {
    super(id)
    this.userStore = new UserStore('user')
    this.cartStore = new CartStore('cart')
    this.productStore = new ProductStore('product')
  }

  // 组合操作
  @AsyncAction()
  async checkout() {
    if (!this.userStore.isLoggedIn) {
      throw new Error('请先登录')
    }

    if (this.cartStore.isEmpty) {
      throw new Error('购物车为空')
    }

    // 执行结账逻辑
    const order = await orderApi.create({
      userId: this.userStore.currentUser!.id,
      items: this.cartStore.items,
    })

    this.cartStore.clear()
    return order
  }
}
```

### 3. 依赖注入模式

使用 Provider 模式管理 Store 依赖：

```typescript
// stores/container.ts
export class StoreContainer {
  private stores = new Map<string, any>()

  register<T>(id: string, factory: () => T): void {
    this.stores.set(id, factory)
  }

  get<T>(id: string): T {
    const factory = this.stores.get(id)
    if (!factory) {
      throw new Error(`Store ${id} not found`)
    }
    return factory()
  }
}

export const container = new StoreContainer()

// 注册 Store
container.register('user', () => new UserStore('user'))
container.register('cart', () => new CartStore('cart'))
container.register('products', () => new ProductStore('products'))
```

## 状态设计

### 1. 状态规范化

避免嵌套过深的状态结构：

```typescript
// ✅ 规范化的状态结构
class NormalizedUserStore extends BaseStore {
  @State({ default: {} })
  usersById: Record<string, User> = {}

  @State({ default: [] })
  userIds: string[] = []

  @State({ default: null })
  currentUserId: string | null = null

  @Getter()
  get users() {
    return this.userIds.map(id => this.usersById[id])
  }

  @Getter()
  get currentUser() {
    return this.currentUserId ? this.usersById[this.currentUserId] : null
  }

  @Action()
  addUser(user: User) {
    this.usersById[user.id] = user
    if (!this.userIds.includes(user.id)) {
      this.userIds.push(user.id)
    }
  }
}

// ❌ 非规范化的状态结构
class DenormalizedUserStore extends BaseStore {
  @State({ default: [] })
  users: User[] = [] // 可能包含重复数据

  @State({ default: null })
  currentUser: User | null = null // 数据重复
}
```

### 2. 合理使用持久化

只持久化必要的状态：

```typescript
class SettingsStore extends BaseStore {
  // ✅ 需要持久化的用户偏好
  @PersistentState({ default: 'light' })
  theme: 'light' | 'dark' = 'light'

  @PersistentState({ default: 'zh-CN' })
  language: string = 'zh-CN'

  // ✅ 临时状态不需要持久化
  @State({ default: false })
  loading: boolean = false

  @State({ default: null })
  error: string | null = null

  // ❌ 敏感信息不应该持久化到 localStorage
  // @PersistentState({ default: null })
  // authToken: string | null = null
}
```

### 3. 类型安全

充分利用 TypeScript 的类型系统：

```typescript
// 定义清晰的接口
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'guest'
  preferences: UserPreferences
}

interface UserPreferences {
  theme: 'light' | 'dark'
  language: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
}

class TypeSafeUserStore extends BaseStore {
  @PersistentState({ default: null })
  currentUser: User | null = null

  @Action()
  updatePreferences(updates: Partial<UserPreferences>) {
    if (this.currentUser) {
      this.currentUser.preferences = {
        ...this.currentUser.preferences,
        ...updates,
      }
    }
  }

  // 类型安全的 getter
  @Getter()
  get userRole(): User['role'] {
    return this.currentUser?.role || 'guest'
  }

  // 类型守卫
  @Getter()
  get isAdmin(): boolean {
    return this.userRole === 'admin'
  }
}
```

## 动作设计

### 1. 纯函数原则

Action 应该是纯函数，避免副作用：

```typescript
class PureActionStore extends BaseStore {
  @State({ default: [] })
  items: Item[] = []

  // ✅ 纯函数 - 只修改状态
  @Action()
  addItem(item: Item) {
    this.items.push({ ...item, id: generateId() })
  }

  // ✅ 异步操作明确标记
  @AsyncAction()
  async saveItems() {
    await api.saveItems(this.items)
  }

  // ❌ 避免在 Action 中直接操作 DOM
  // @Action()
  // addItemAndUpdateUI(item: Item) {
  //   this.items.push(item)
  //   document.getElementById('count').textContent = this.items.length.toString()
  // }
}
```

### 2. 错误处理

统一的错误处理策略：

```typescript
class ErrorHandlingStore extends BaseStore {
  @State({ default: null })
  error: AppError | null = null

  @State({ default: false })
  loading: boolean = false

  @AsyncAction()
  async fetchData(id: string) {
    this.loading = true
    this.error = null

    try {
      const data = await api.getData(id)
      this.data = data
    } catch (error) {
      this.error = this.normalizeError(error)
      // 记录错误日志
      this.logError(error, 'fetchData', { id })
      throw error // 重新抛出，让调用者处理
    } finally {
      this.loading = false
    }
  }

  private normalizeError(error: unknown): AppError {
    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'UNKNOWN_ERROR',
        timestamp: new Date(),
      }
    }
    return {
      message: '未知错误',
      code: 'UNKNOWN_ERROR',
      timestamp: new Date(),
    }
  }

  private logError(error: unknown, action: string, context: any) {
    console.error(`Action ${action} failed:`, error, context)
    // 发送到错误监控服务
    errorReporting.report(error, { action, context })
  }

  @Action()
  clearError() {
    this.error = null
  }
}
```

### 3. 乐观更新

对于用户交互，使用乐观更新提升体验：

```typescript
class OptimisticUpdateStore extends BaseStore {
  @State({ default: [] })
  todos: Todo[] = []

  @Action()
  async toggleTodoOptimistic(id: string) {
    // 立即更新 UI
    const todo = this.todos.find(t => t.id === id)
    if (!todo) return

    const originalCompleted = todo.completed
    todo.completed = !todo.completed

    try {
      // 发送到服务器
      await todoApi.update(id, { completed: todo.completed })
    } catch (error) {
      // 失败时回滚
      todo.completed = originalCompleted
      throw error
    }
  }

  @Action()
  async addTodoOptimistic(text: string) {
    // 创建临时 ID
    const tempId = `temp_${Date.now()}`
    const tempTodo: Todo = {
      id: tempId,
      text,
      completed: false,
      pending: true,
    }

    // 立即添加到列表
    this.todos.push(tempTodo)

    try {
      // 发送到服务器
      const savedTodo = await todoApi.create({ text })

      // 替换临时项目
      const index = this.todos.findIndex(t => t.id === tempId)
      if (index > -1) {
        this.todos[index] = { ...savedTodo, pending: false }
      }
    } catch (error) {
      // 失败时移除临时项目
      const index = this.todos.findIndex(t => t.id === tempId)
      if (index > -1) {
        this.todos.splice(index, 1)
      }
      throw error
    }
  }
}
```

## 性能优化

### 1. 合理使用缓存

```typescript
class CacheOptimizedStore extends BaseStore {
  @State({ default: [] })
  rawData: DataItem[] = []

  // ✅ 对计算密集的操作使用缓存
  @CachedGetter(['rawData'])
  get processedData() {
    return this.rawData.map(item => this.expensiveProcessing(item))
  }

  // ✅ 对 API 请求使用缓存
  @CachedAction(300000) // 5分钟缓存
  async fetchStaticConfig() {
    return await configApi.getConfig()
  }

  // ❌ 不要对简单操作使用缓存
  // @CachedGetter(['count'])
  // get doubleCount() {
  //   return this.count * 2
  // }
}
```

### 2. 批量操作

```typescript
class BatchOperationStore extends BaseStore {
  @State({ default: [] })
  items: Item[] = []

  // ✅ 批量更新
  @Action()
  updateItemsBatch(updates: Array<{ id: string; changes: Partial<Item> }>) {
    const updatedItems = this.items.map(item => {
      const update = updates.find(u => u.id === item.id)
      return update ? { ...item, ...update.changes } : item
    })

    this.$patch({ items: updatedItems })
  }

  // ❌ 避免在循环中多次更新状态
  // @Action()
  // updateItemsOneByOne(updates: Array<{ id: string; changes: Partial<Item> }>) {
  //   updates.forEach(update => {
  //     const item = this.items.find(i => i.id === update.id)
  //     if (item) {
  //       Object.assign(item, update.changes) // 每次都触发响应式更新
  //     }
  //   })
  // }
}
```

## 测试策略

### 1. 单元测试

```typescript
// stores/__tests__/user.test.ts
import { beforeEach, describe, expect, it } from 'vitest'
import { UserStore } from '../user'

describe('UserStore', () => {
  let store: UserStore

  beforeEach(() => {
    store = new UserStore('test-user')
  })

  it('should initialize with default state', () => {
    expect(store.currentUser).toBeNull()
    expect(store.isLoggedIn).toBe(false)
  })

  it('should login user successfully', async () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' }

    // Mock API
    vi.mocked(userApi.login).mockResolvedValue({ user: mockUser, token: 'token' })

    await store.login({ email: 'test@example.com', password: 'password' })

    expect(store.currentUser).toEqual(mockUser)
    expect(store.isLoggedIn).toBe(true)
  })

  it('should handle login error', async () => {
    vi.mocked(userApi.login).mockRejectedValue(new Error('Invalid credentials'))

    await expect(store.login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow(
      'Invalid credentials'
    )

    expect(store.currentUser).toBeNull()
    expect(store.isLoggedIn).toBe(false)
  })
})
```

### 2. 集成测试

```typescript
// tests/integration/shopping-flow.test.ts
import { describe, expect, it } from 'vitest'
import { CartStore } from '@/stores/cart'
import { ShoppingStore } from '@/stores/shopping'
import { UserStore } from '@/stores/user'

describe('Shopping Flow Integration', () => {
  it('should complete full shopping flow', async () => {
    const userStore = new UserStore('user')
    const cartStore = new CartStore('cart')
    const shoppingStore = new ShoppingStore('shopping')

    // 1. 用户登录
    await userStore.login({ email: 'test@example.com', password: 'password' })
    expect(userStore.isLoggedIn).toBe(true)

    // 2. 添加商品到购物车
    const product = { id: '1', name: 'Test Product', price: 100 }
    cartStore.addItem(product, 2)
    expect(cartStore.itemCount).toBe(2)
    expect(cartStore.total).toBe(200)

    // 3. 结账
    const order = await shoppingStore.checkout()
    expect(order).toBeDefined()
    expect(cartStore.isEmpty).toBe(true)
  })
})
```

## 代码组织

### 1. 文件结构

```
src/
├── stores/
│   ├── modules/           # 业务模块 Store
│   │   ├── user.ts
│   │   ├── cart.ts
│   │   └── products.ts
│   ├── shared/            # 共享 Store
│   │   ├── app.ts
│   │   └── settings.ts
│   ├── types/             # 类型定义
│   │   ├── user.ts
│   │   └── cart.ts
│   ├── utils/             # 工具函数
│   │   ├── storage.ts
│   │   └── api.ts
│   └── index.ts           # 导出入口
├── composables/           # Vue 组合函数
│   ├── useAuth.ts
│   └── useCart.ts
└── components/
    └── ...
```

### 2. 导出策略

```typescript
export { CartStore } from './modules/cart'
export { ProductStore } from './modules/products'
// stores/index.ts
// 导出 Store 类
export { UserStore } from './modules/user'

// 导出 Store 实例（单例模式）
export const userStore = new UserStore('user')
export const cartStore = new CartStore('cart')
export const productStore = new ProductStore('products')

export type { CartItem, Product } from './types/cart'
// 导出类型
export type { LoginCredentials, User } from './types/user'

// 导出工具函数
export { createStoreInstance, disposeStore } from './utils/factory'
```

### 3. 命名约定

```typescript
// ✅ 清晰的命名
class UserManagementStore extends BaseStore {
  @State({ default: null })
  currentUser: User | null = null

  @AsyncAction()
  async authenticateUser(credentials: LoginCredentials) {
    /* ... */
  }

  @Getter()
  get isUserAuthenticated() {
    return this.currentUser !== null
  }
}

// ❌ 模糊的命名
class Store extends BaseStore {
  @State({ default: null })
  data: any = null

  @AsyncAction()
  async doSomething(params: any) {
    /* ... */
  }

  @Getter()
  get result() {
    return this.data !== null
  }
}
```

## 调试和开发工具

### 1. 开发时调试

```typescript
class DebuggableStore extends BaseStore {
  constructor(id: string) {
    super(id)

    if (process.env.NODE_ENV === 'development') {
      this.enableDebugMode()
    }
  }

  private enableDebugMode() {
    // 监听状态变化
    this.$subscribe((mutation, state) => {
      console.group(`🔄 ${this.constructor.name} State Change`)
      console.log('Mutation:', mutation)
      console.log('New State:', state)
      console.groupEnd()
    })

    // 监听 Action 执行
    this.$onAction(({ name, args, after, onError }) => {
      const startTime = Date.now()

      console.log(`🚀 Action: ${name}`, args)

      after(() => {
        console.log(`✅ Action ${name} completed in ${Date.now() - startTime}ms`)
      })

      onError(error => {
        console.error(`❌ Action ${name} failed:`, error)
      })
    })
  }
}
```

### 2. 生产环境监控

```typescript
class MonitoredStore extends BaseStore {
  private analytics = new AnalyticsService()

  @AsyncAction()
  async performCriticalOperation(data: any) {
    const operationId = generateId()

    try {
      this.analytics.trackEvent('critical_operation_start', {
        operationId,
        timestamp: Date.now(),
      })

      const result = await this.executeCriticalLogic(data)

      this.analytics.trackEvent('critical_operation_success', {
        operationId,
        duration: Date.now() - startTime,
      })

      return result
    } catch (error) {
      this.analytics.trackEvent('critical_operation_error', {
        operationId,
        error: error.message,
      })
      throw error
    }
  }
}
```

## 迁移和升级

### 1. 版本兼容性

```typescript
// 处理数据迁移
class MigratableStore extends BaseStore {
  private static readonly CURRENT_VERSION = 2

  @PersistentState({
    default: { version: MigratableStore.CURRENT_VERSION },
    beforeLoad: this.migrateData.bind(this),
  })
  data: AppData = { version: MigratableStore.CURRENT_VERSION }

  private migrateData(rawData: string): string {
    try {
      const data = JSON.parse(rawData)
      const version = data.version || 1

      if (version < MigratableStore.CURRENT_VERSION) {
        return JSON.stringify(this.performMigration(data, version))
      }

      return rawData
    } catch (error) {
      console.error('数据迁移失败:', error)
      return JSON.stringify({ version: MigratableStore.CURRENT_VERSION })
    }
  }

  private performMigration(data: any, fromVersion: number): AppData {
    let migrated = { ...data }

    // 从版本 1 迁移到版本 2
    if (fromVersion < 2) {
      migrated = {
        ...migrated,
        newField: 'default value',
        version: 2,
      }
    }

    return migrated
  }
}
```

## 总结

遵循这些最佳实践可以帮助你：

1. **构建可维护的代码** - 清晰的职责分离和类型安全
2. **提升应用性能** - 合理的缓存和批量操作
3. **确保代码质量** - 完善的测试和错误处理
4. **便于团队协作** - 统一的代码组织和命名约定
5. **支持长期发展** - 版本兼容性和迁移策略

记住，最佳实践不是一成不变的规则，而是指导原则。根据你的具体需求和团队情况，灵活应用这些实践。

## 下一步

- 查看 [API 参考](/api/) 了解详细接口
- 探索 [示例](/examples/) 查看实际应用
- 阅读 [性能优化](/guide/performance) 提升应用性能
