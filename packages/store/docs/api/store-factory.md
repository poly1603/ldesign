# StoreFactory

`StoreFactory` 是 @ldesign/store 的统一 Store 创建和管理工厂类。它提供了统一的 API 来创建不同类型的 Store，并管理 Store 实例的生命周期。

## 类型定义

```typescript
class StoreFactory {
  static create<
    TState extends StateDefinition = StateDefinition,
    TActions extends ActionDefinition = ActionDefinition,
    TGetters extends GetterDefinition = GetterDefinition,
    T = any
  >(options: UnifiedStoreOptions<TState, TActions, TGetters, T>): T
}
```

## 静态方法

### create

```typescript
static create<TState, TActions, TGetters, T>(
  options: UnifiedStoreOptions<TState, TActions, TGetters, T>
): T
```

创建 Store 实例。根据配置选项创建不同类型的 Store，支持类式、函数式、组合式三种类型。

**泛型参数:**

- `TState`: 状态定义类型
- `TActions`: 动作定义类型
- `TGetters`: 计算属性定义类型
- `T`: 返回类型

**参数:**

- `options`: 统一的 Store 配置选项

**返回值:**

创建的 Store 实例。

**抛出异常:**

- `Error`: 当 Store 类型未知时抛出错误

### UnifiedStoreOptions

```typescript
interface UnifiedStoreOptions<TState, TActions, TGetters, T> {
  type: StoreType
  id: string
  state?: TState
  actions?: TActions
  getters?: TGetters
  setup?: CompositionSetupFunction<T>
  class?: new () => T
  persist?: PersistOptions
  cache?: CacheOptions
  force?: boolean
}
```

**属性说明:**

- `type`: Store 类型（`StoreType.FUNCTIONAL` | `StoreType.COMPOSITION` | `StoreType.CLASS`）
- `id`: Store 唯一标识符
- `state`: 状态初始化函数（函数式 Store）
- `actions`: 动作方法定义（函数式 Store）
- `getters`: 计算属性定义（函数式 Store）
- `setup`: 组合式设置函数（组合式 Store）
- `class`: Store 类构造函数（类式 Store）
- `persist`: 持久化配置选项
- `cache`: 缓存配置选项
- `force`: 是否强制重新创建实例

## Store 类型

### StoreType 枚举

```typescript
enum StoreType {
  FUNCTIONAL = 'functional',
  COMPOSITION = 'composition',
  CLASS = 'class'
}
```

## 使用示例

### 创建函数式 Store

```typescript
import { StoreFactory, StoreType } from '@ldesign/store'

const counterStore = StoreFactory.create({
  type: StoreType.FUNCTIONAL,
  id: 'counter',
  state: () => ({
    count: 0,
    name: 'Counter'
  }),
  actions: {
    increment() {
      this.count++
    },
    decrement() {
      this.count--
    },
    reset() {
      this.count = 0
    }
  },
  getters: {
    doubleCount: (state) => state.count * 2,
    displayName: (state) => `${state.name}: ${state.count}`
  }
})

// 使用 Store
const store = counterStore()
console.log(store.$state.count) // 0
store.increment()
console.log(store.doubleCount) // 2
```

### 创建组合式 Store

```typescript
const userStore = StoreFactory.create({
  type: StoreType.COMPOSITION,
  id: 'user',
  setup: ({ state, computed }) => {
    const user = state(null)
    const loading = state(false)
    
    const isLoggedIn = computed(() => user.value !== null)
    const userName = computed(() => user.value?.name || '未登录')
    
    const login = async (credentials) => {
      loading.value = true
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify(credentials)
        })
        user.value = await response.json()
      } finally {
        loading.value = false
      }
    }
    
    const logout = () => {
      user.value = null
    }
    
    return {
      user,
      loading,
      isLoggedIn,
      userName,
      login,
      logout
    }
  }
})

// 使用 Store
const store = userStore()
console.log(store.$state.isLoggedIn.value) // false
await store.$state.login({ username: 'user', password: 'pass' })
```

### 创建类式 Store

```typescript
import { BaseStore, State, Action, Getter } from '@ldesign/store'

class ProductStore extends BaseStore {
  @State({ default: [] })
  products!: Product[]
  
  @State({ default: false })
  loading!: boolean
  
  @State({ default: null })
  error!: string | null
  
  @Action({ async: true })
  async fetchProducts() {
    this.loading = true
    this.error = null
    
    try {
      const response = await fetch('/api/products')
      this.products = await response.json()
    } catch (error) {
      this.error = error.message
    } finally {
      this.loading = false
    }
  }
  
  @Getter()
  get productCount() {
    return this.products.length
  }
  
  @Getter({ cache: true })
  get expensiveCalculation() {
    return this.products.reduce((sum, product) => {
      return sum + this.calculateComplexValue(product)
    }, 0)
  }
  
  private calculateComplexValue(product: Product): number {
    // 复杂计算逻辑
    return product.price * product.rating * Math.random()
  }
}

const productStore = StoreFactory.create({
  type: StoreType.CLASS,
  id: 'product',
  class: ProductStore
})

// 使用 Store
console.log(productStore.$state.products) // []
await productStore.fetchProducts()
console.log(productStore.productCount) // 产品数量
```

## 配置选项

### 持久化配置

```typescript
const persistentStore = StoreFactory.create({
  type: StoreType.FUNCTIONAL,
  id: 'settings',
  state: () => ({
    theme: 'light',
    language: 'zh-CN',
    fontSize: 14
  }),
  actions: {
    setTheme(theme: string) {
      this.theme = theme
    },
    setLanguage(language: string) {
      this.language = language
    }
  },
  persist: {
    storage: 'localStorage',
    paths: ['theme', 'language'], // 只持久化指定字段
    serializer: {
      serialize: JSON.stringify,
      deserialize: JSON.parse
    },
    beforeRestore: (context) => {
      console.log('恢复状态前:', context)
    },
    afterRestore: (context) => {
      console.log('恢复状态后:', context)
    }
  }
})
```

### 缓存配置

```typescript
const cachedStore = StoreFactory.create({
  type: StoreType.FUNCTIONAL,
  id: 'data',
  state: () => ({
    items: [],
    searchKeyword: ''
  }),
  actions: {
    search(keyword: string) {
      this.searchKeyword = keyword
    }
  },
  getters: {
    filteredItems: (state) => {
      return state.items.filter(item => 
        item.name.includes(state.searchKeyword)
      )
    }
  },
  cache: {
    ttl: 5000,        // 缓存生存时间（毫秒）
    maxSize: 100,     // 最大缓存条目数
    strategy: 'lru'   // 缓存策略：lru | fifo
  }
})
```

## 实例管理

### 实例缓存

StoreFactory 自动管理 Store 实例，相同 ID 的 Store 会返回同一个实例：

```typescript
const store1 = StoreFactory.create({
  type: StoreType.FUNCTIONAL,
  id: 'shared',
  state: () => ({ count: 0 })
})

const store2 = StoreFactory.create({
  type: StoreType.FUNCTIONAL,
  id: 'shared', // 相同 ID
  state: () => ({ count: 0 })
})

console.log(store1 === store2) // true
```

### 强制重新创建

```typescript
const newStore = StoreFactory.create({
  type: StoreType.FUNCTIONAL,
  id: 'shared',
  state: () => ({ count: 0 }),
  force: true // 强制重新创建
})
```

### 清理实例

```typescript
// 清理指定 Store 实例
StoreFactory.clear('shared')

// 清理所有实例
StoreFactory.clearAll()

// 获取所有实例
const instances = StoreFactory.getAllInstances()
console.log('活跃实例数量:', instances.size)
```

## 批量操作

### 批量创建

```typescript
const stores = StoreFactory.createBatch([
  {
    type: StoreType.FUNCTIONAL,
    id: 'user',
    state: () => ({ user: null })
  },
  {
    type: StoreType.FUNCTIONAL,
    id: 'cart',
    state: () => ({ items: [] })
  },
  {
    type: StoreType.COMPOSITION,
    id: 'settings',
    setup: ({ state }) => ({
      theme: state('light')
    })
  }
])

console.log(stores) // [userStore, cartStore, settingsStore]
```

## 类型安全

### 完整类型定义

```typescript
interface UserState {
  id: number | null
  name: string
  email: string
}

interface UserActions {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<UserState>) => void
}

interface UserGetters {
  isLoggedIn: boolean
  displayName: string
}

const userStore = StoreFactory.create<UserState, UserActions, UserGetters>({
  type: StoreType.FUNCTIONAL,
  id: 'user',
  state: () => ({
    id: null,
    name: '',
    email: ''
  }),
  actions: {
    async login(credentials) {
      // 实现登录逻辑
    },
    logout() {
      this.id = null
      this.name = ''
      this.email = ''
    },
    updateProfile(updates) {
      Object.assign(this, updates)
    }
  },
  getters: {
    isLoggedIn: (state) => state.id !== null,
    displayName: (state) => state.name || '未登录用户'
  }
})

// 类型安全的使用
const store = userStore()
store.login({ username: 'user', password: 'pass' }) // ✅ 类型正确
store.invalidMethod() // ❌ TypeScript 错误
```

## 错误处理

```typescript
try {
  const store = StoreFactory.create({
    type: 'invalid' as any, // 无效的 Store 类型
    id: 'test'
  })
} catch (error) {
  console.error('创建 Store 失败:', error.message)
}
```

## 最佳实践

### 1. 统一配置管理

```typescript
// 创建配置工厂
function createStoreConfig(baseConfig: any) {
  return {
    ...baseConfig,
    persist: {
      storage: 'localStorage',
      ...baseConfig.persist
    },
    cache: {
      ttl: 5000,
      maxSize: 100,
      ...baseConfig.cache
    }
  }
}

// 使用配置工厂
const store = StoreFactory.create(createStoreConfig({
  type: StoreType.FUNCTIONAL,
  id: 'configured-store',
  state: () => ({ data: null })
}))
```

### 2. Store 注册表

```typescript
class StoreRegistry {
  private static registry = new Map<string, any>()
  
  static register<T>(name: string, factory: () => T): T {
    if (!this.registry.has(name)) {
      this.registry.set(name, factory())
    }
    return this.registry.get(name)
  }
  
  static get<T>(name: string): T | undefined {
    return this.registry.get(name)
  }
  
  static clear(name?: string) {
    if (name) {
      this.registry.delete(name)
    } else {
      this.registry.clear()
    }
  }
}

// 使用注册表
const useUserStore = () => StoreRegistry.register('user', () =>
  StoreFactory.create({
    type: StoreType.FUNCTIONAL,
    id: 'user',
    state: () => ({ user: null })
  })
)
```

## 相关链接

- [函数式 Store](/guide/functional)
- [组合式 Store](/guide/composition)
- [类式 Store](/guide/class-usage)
- [Store 工厂指南](/guide/factory)
