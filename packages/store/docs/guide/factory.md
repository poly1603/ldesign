# Store 工厂

Store 工厂是 @ldesign/store 提供的统一 Store 创建和管理机制。它允许你使用统一的 API 创建不同类型的 Store，并提供了强大的实例管理和配置功能。

## 基本概念

Store 工厂通过 `StoreFactory` 类提供统一的 Store 创建接口，支持：

- 类式 Store (Class Store)
- 函数式 Store (Functional Store)  
- 组合式 Store (Composition Store)
- 统一的配置管理
- 实例缓存和复用
- 类型安全保障

## 基本用法

```typescript
import { StoreFactory, StoreType } from '@ldesign/store'

// 创建函数式 Store
const counterStore = StoreFactory.create({
  type: StoreType.FUNCTIONAL,
  id: 'counter',
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++
    }
  },
  getters: {
    doubleCount: (state) => state.count * 2
  }
})

// 创建组合式 Store
const userStore = StoreFactory.create({
  type: StoreType.COMPOSITION,
  id: 'user',
  setup: ({ state, computed }) => {
    const user = state(null)
    const isLoggedIn = computed(() => user.value !== null)
    
    const login = (userData) => {
      user.value = userData
    }
    
    return { user, isLoggedIn, login }
  }
})
```

## Store 类型

### StoreType.FUNCTIONAL

创建函数式 Store：

```typescript
const todoStore = StoreFactory.create({
  type: StoreType.FUNCTIONAL,
  id: 'todo',
  state: () => ({
    todos: [],
    filter: 'all'
  }),
  actions: {
    addTodo(text: string) {
      this.todos.push({
        id: Date.now(),
        text,
        completed: false
      })
    },
    toggleTodo(id: number) {
      const todo = this.todos.find(t => t.id === id)
      if (todo) {
        todo.completed = !todo.completed
      }
    },
    setFilter(filter: string) {
      this.filter = filter
    }
  },
  getters: {
    filteredTodos: (state) => {
      switch (state.filter) {
        case 'active':
          return state.todos.filter(t => !t.completed)
        case 'completed':
          return state.todos.filter(t => t.completed)
        default:
          return state.todos
      }
    },
    todoCount: (state) => state.todos.length
  }
})
```

### StoreType.COMPOSITION

创建组合式 Store：

```typescript
const settingsStore = StoreFactory.create({
  type: StoreType.COMPOSITION,
  id: 'settings',
  setup: ({ state, computed, watch }) => {
    const theme = state('light')
    const language = state('zh-CN')
    const fontSize = state(14)
    
    const isDarkMode = computed(() => theme.value === 'dark')
    
    // 监听主题变化
    watch(theme, (newTheme) => {
      document.body.className = `theme-${newTheme}`
    })
    
    const toggleTheme = () => {
      theme.value = theme.value === 'light' ? 'dark' : 'light'
    }
    
    const setLanguage = (lang: string) => {
      language.value = lang
    }
    
    const increaseFontSize = () => {
      fontSize.value = Math.min(fontSize.value + 2, 24)
    }
    
    const decreaseFontSize = () => {
      fontSize.value = Math.max(fontSize.value - 2, 10)
    }
    
    return {
      theme,
      language,
      fontSize,
      isDarkMode,
      toggleTheme,
      setLanguage,
      increaseFontSize,
      decreaseFontSize
    }
  }
})
```

### StoreType.CLASS

创建类式 Store（需要预定义类）：

```typescript
import { BaseStore, State, Action, Getter } from '@ldesign/store'

class ProductStore extends BaseStore {
  @State({ default: [] })
  products!: Product[]
  
  @State({ default: false })
  loading!: boolean
  
  @Action({ async: true })
  async fetchProducts() {
    this.loading = true
    try {
      const response = await fetch('/api/products')
      this.products = await response.json()
    } finally {
      this.loading = false
    }
  }
  
  @Getter()
  get productCount() {
    return this.products.length
  }
}

// 使用工厂创建
const productStore = StoreFactory.create({
  type: StoreType.CLASS,
  id: 'product',
  class: ProductStore
})
```

## 统一配置

Store 工厂支持统一的配置选项：

```typescript
const storeWithConfig = StoreFactory.create({
  type: StoreType.FUNCTIONAL,
  id: 'configured-store',
  state: () => ({
    data: [],
    preferences: {}
  }),
  actions: {
    updateData(data) {
      this.data = data
    }
  },
  
  // 持久化配置
  persist: {
    storage: 'localStorage',
    paths: ['preferences'],
    serializer: {
      serialize: JSON.stringify,
      deserialize: JSON.parse
    }
  },
  
  // 缓存配置
  cache: {
    ttl: 5000,
    maxSize: 100
  },
  
  // 性能优化配置
  performance: {
    debounce: {
      updateData: 300
    },
    throttle: {
      // 其他需要节流的动作
    }
  }
})
```

## 实例管理

Store 工厂自动管理 Store 实例，避免重复创建：

```typescript
// 第一次创建
const store1 = StoreFactory.create({
  type: StoreType.FUNCTIONAL,
  id: 'shared-store',
  state: () => ({ count: 0 })
})

// 第二次调用，返回相同实例
const store2 = StoreFactory.create({
  type: StoreType.FUNCTIONAL,
  id: 'shared-store',  // 相同的 ID
  state: () => ({ count: 0 })
})

console.log(store1 === store2) // true
```

### 强制重新创建

```typescript
// 清除现有实例
StoreFactory.clear('shared-store')

// 或者使用 force 选项
const newStore = StoreFactory.create({
  type: StoreType.FUNCTIONAL,
  id: 'shared-store',
  state: () => ({ count: 0 }),
  force: true  // 强制重新创建
})
```

## 批量管理

```typescript
// 批量创建 Store
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

// 批量清理
StoreFactory.clearAll()

// 获取所有实例
const allStores = StoreFactory.getAllInstances()
console.log('当前活跃的 Store 数量:', allStores.size)
```

## 类型安全

Store 工厂提供完整的 TypeScript 类型支持：

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
      // 登录逻辑
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

// 类型会被正确推导
userStore.login({ username: 'user', password: 'pass' }) // ✅ 类型正确
userStore.invalidMethod() // ❌ 类型错误
```

## 插件系统

Store 工厂支持插件扩展：

```typescript
// 定义插件
const loggerPlugin = {
  name: 'logger',
  install(factory: StoreFactory) {
    factory.addHook('beforeCreate', (options) => {
      console.log(`创建 Store: ${options.id}`)
    })
    
    factory.addHook('afterCreate', (store, options) => {
      console.log(`Store ${options.id} 创建完成`)
    })
  }
}

// 使用插件
StoreFactory.use(loggerPlugin)

// 现在创建 Store 时会自动记录日志
const store = StoreFactory.create({
  type: StoreType.FUNCTIONAL,
  id: 'logged-store',
  state: () => ({ data: null })
})
```

## 最佳实践

### 1. 统一的 Store 配置

```typescript
// 创建配置工厂函数
function createStoreConfig(baseConfig: any) {
  return {
    ...baseConfig,
    // 统一的持久化配置
    persist: {
      storage: 'localStorage',
      ...baseConfig.persist
    },
    // 统一的缓存配置
    cache: {
      ttl: 5000,
      ...baseConfig.cache
    }
  }
}

// 使用配置工厂
const userStore = StoreFactory.create(createStoreConfig({
  type: StoreType.FUNCTIONAL,
  id: 'user',
  state: () => ({ user: null }),
  persist: {
    paths: ['user']  // 只持久化用户信息
  }
}))
```

### 2. Store 注册表

```typescript
// 创建 Store 注册表
class StoreRegistry {
  private static stores = new Map()
  
  static register<T>(name: string, factory: () => T): T {
    if (!this.stores.has(name)) {
      this.stores.set(name, factory())
    }
    return this.stores.get(name)
  }
  
  static get<T>(name: string): T {
    return this.stores.get(name)
  }
}

// 注册 Store
const useUserStore = () => StoreRegistry.register('user', () =>
  StoreFactory.create({
    type: StoreType.FUNCTIONAL,
    id: 'user',
    state: () => ({ user: null })
  })
)

const useCartStore = () => StoreRegistry.register('cart', () =>
  StoreFactory.create({
    type: StoreType.FUNCTIONAL,
    id: 'cart',
    state: () => ({ items: [] })
  })
)
```

## 总结

Store 工厂提供了统一、灵活的 Store 创建和管理机制，特别适合：

- 大型应用的 Store 管理
- 需要统一配置的项目
- 多种 Store 类型混合使用的场景
- 需要实例管理和优化的应用

通过 Store 工厂，你可以构建出更加规范、可维护的状态管理架构。
