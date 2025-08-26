# Store 模块化

在大型应用中，合理的 Store 模块化设计是保持代码可维护性的关键。@ldesign/store 提供了多种模块化方案。

## 🏗️ 模块化策略

### 按功能模块划分

```
stores/
├── user/
│   ├── UserStore.ts
│   ├── AuthStore.ts
│   └── ProfileStore.ts
├── product/
│   ├── ProductStore.ts
│   ├── CategoryStore.ts
│   └── CartStore.ts
├── order/
│   ├── OrderStore.ts
│   └── PaymentStore.ts
└── common/
    ├── AppStore.ts
    └── NotificationStore.ts
```

### 按层级划分

```
stores/
├── domain/          # 业务领域层
│   ├── UserDomain.ts
│   └── ProductDomain.ts
├── application/     # 应用服务层
│   ├── UserService.ts
│   └── ProductService.ts
└── infrastructure/  # 基础设施层
    ├── ApiStore.ts
    └── CacheStore.ts
```

## 🔧 模块定义

### 基础模块

```typescript
// stores/user/UserStore.ts
export class UserStore extends BaseStore {
  @State
  currentUser = null

  @State
  users = []

  @Action
  async fetchUser(id: string) {
    this.currentUser = await api.getUser(id)
  }
}

// stores/user/index.ts
export { UserStore } from './UserStore'
export { AuthStore } from './AuthStore'
export { ProfileStore } from './ProfileStore'

export const userModule = {
  UserStore,
  AuthStore,
  ProfileStore
}
```

### 模块间通信

```typescript
// stores/order/OrderStore.ts
export class OrderStore extends BaseStore {
  @State
  orders = []

  // 注入其他模块的 Store
  private userStore = new UserStore()
  private productStore = new ProductStore()

  @Action
  async createOrder(items: CartItem[]) {
    // 检查用户登录状态
    if (!this.userStore.isLoggedIn) {
      throw new Error('请先登录')
    }

    // 验证产品库存
    for (const item of items) {
      const product = this.productStore.getProduct(item.productId)
      if (product.stock < item.quantity) {
        throw new Error(`${product.name} 库存不足`)
      }
    }

    // 创建订单
    const order = await api.createOrder({
      userId: this.userStore.currentUser.id,
      items
    })

    this.orders.push(order)
    return order
  }
}
```

## 🔄 模块组合

### Store 组合器

```typescript
import { createStoreComposer } from '@ldesign/store'

export const createAppStores = () => {
  const composer = createStoreComposer()

  // 注册核心模块
  composer.register('user', UserStore)
  composer.register('product', ProductStore)
  composer.register('order', OrderStore)

  // 配置模块依赖
  composer.configure('order', {
    dependencies: ['user', 'product']
  })

  return composer.create()
}

// 使用
const stores = createAppStores()
const orderStore = stores.order
```

### 模块工厂

```typescript
export class StoreModuleFactory {
  private modules = new Map()
  private instances = new Map()

  register<T extends BaseStore>(name: string, StoreClass: new () => T) {
    this.modules.set(name, StoreClass)
  }

  get<T extends BaseStore>(name: string): T {
    if (!this.instances.has(name)) {
      const StoreClass = this.modules.get(name)
      if (!StoreClass) {
        throw new Error(`Store module "${name}" not found`)
      }
      this.instances.set(name, new StoreClass())
    }
    return this.instances.get(name)
  }

  create() {
    return new Proxy(this, {
      get(target, prop: string) {
        return target.get(prop)
      }
    })
  }
}

// 使用
const factory = new StoreModuleFactory()
factory.register('user', UserStore)
factory.register('product', ProductStore)

const stores = factory.create()
const userStore = stores.user // 自动创建实例
```

## 🎯 模块通信模式

### 事件总线模式

```typescript
import { EventEmitter } from 'events'

export class EventBus extends EventEmitter {
  private static instance: EventBus

  static getInstance() {
    if (!this.instance) {
      this.instance = new EventBus()
    }
    return this.instance
  }
}

export class UserStore extends BaseStore {
  private eventBus = EventBus.getInstance()

  @Action
  async login(credentials: LoginCredentials) {
    const user = await api.login(credentials)
    this.currentUser = user

    // 发布登录事件
    this.eventBus.emit('user:login', user)
  }
}

export class CartStore extends BaseStore {
  private eventBus = EventBus.getInstance()

  constructor() {
    super()
    // 监听用户登录事件
    this.eventBus.on('user:login', this.handleUserLogin.bind(this))
  }

  @Action
  private async handleUserLogin(user: User) {
    // 加载用户的购物车
    await this.loadUserCart(user.id)
  }
}
```

### 依赖注入模式

```typescript
import { Container } from 'inversify'

export class DIContainer {
  private container = new Container()

  constructor() {
    this.setupBindings()
  }

  private setupBindings() {
    this.container.bind<UserStore>('UserStore').to(UserStore).inSingletonScope()
    this.container.bind<ProductStore>('ProductStore').to(ProductStore).inSingletonScope()
    this.container.bind<OrderStore>('OrderStore').to(OrderStore).inSingletonScope()
  }

  get<T>(identifier: string): T {
    return this.container.get<T>(identifier)
  }
}

// 在 Store 中使用
export class OrderStore extends BaseStore {
  constructor(
    @inject('UserStore') private userStore: UserStore,
    @inject('ProductStore') private productStore: ProductStore
  ) {
    super()
  }
}
```

## 🚀 模块懒加载

### 动态导入

```typescript
export class LazyStoreLoader {
  private loadedModules = new Map()

  async loadModule(moduleName: string) {
    if (this.loadedModules.has(moduleName)) {
      return this.loadedModules.get(moduleName)
    }

    let module
    switch (moduleName) {
      case 'user':
        module = await import('./user')
        break
      case 'product':
        module = await import('./product')
        break
      case 'order':
        module = await import('./order')
        break
      default:
        throw new Error(`Unknown module: ${moduleName}`)
    }

    this.loadedModules.set(moduleName, module)
    return module
  }
}

// 使用
const loader = new LazyStoreLoader()

// 在需要时加载模块
const userModule = await loader.loadModule('user')
const userStore = new userModule.UserStore()
```

### 路由级别的模块加载

```typescript
// router/index.ts
import { createRouter } from 'vue-router'

const router = createRouter({
  routes: [
    {
      path: '/user',
      component: () => import('@/views/UserView.vue'),
      beforeEnter: async () => {
        // 加载用户相关的 Store 模块
        await import('@/stores/user')
      }
    },
    {
      path: '/products',
      component: () => import('@/views/ProductView.vue'),
      beforeEnter: async () => {
        await import('@/stores/product')
      }
    }
  ]
})
```

## 🔧 模块配置

### 环境配置

```typescript
interface ModuleConfig {
  apiBaseUrl: string
  cacheEnabled: boolean
  debugMode: boolean
}

export class ConfigurableStore extends BaseStore {
  protected config: ModuleConfig

  constructor(config: ModuleConfig) {
    super()
    this.config = config
  }

  @Action
  async fetchData() {
    const url = `${this.config.apiBaseUrl}/data`
    const response = await fetch(url)
    return response.json()
  }
}

// 不同环境的配置
const devConfig: ModuleConfig = {
  apiBaseUrl: 'http://localhost:3000/api',
  cacheEnabled: false,
  debugMode: true
}

const prodConfig: ModuleConfig = {
  apiBaseUrl: 'https://api.example.com',
  cacheEnabled: true,
  debugMode: false
}

// 根据环境创建 Store
const config = process.env.NODE_ENV === 'development' ? devConfig : prodConfig
const store = new ConfigurableStore(config)
```

## 📦 模块打包

### Webpack 配置

```javascript
// webpack.config.js
module.exports = {
  entry: {
    'user-module': './src/stores/user/index.ts',
    'product-module': './src/stores/product/index.ts',
    'order-module': './src/stores/order/index.ts'
  },
  output: {
    filename: '[name].js',
    library: '[name]',
    libraryTarget: 'umd'
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        common: {
          name: 'common',
          chunks: 'all',
          minChunks: 2
        }
      }
    }
  }
}
```

### Vite 配置

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'src/main.ts',
        'user-module': 'src/stores/user/index.ts',
        'product-module': 'src/stores/product/index.ts'
      },
      output: {
        manualChunks: {
          'store-core': ['@ldesign/store'],
          'user-stores': ['./src/stores/user'],
          'product-stores': ['./src/stores/product']
        }
      }
    }
  }
})
```

## 🧪 模块测试

### 模块单元测试

```typescript
// tests/stores/user/UserStore.test.ts
describe('UserStore', () => {
  let userStore: UserStore

  beforeEach(() => {
    userStore = new UserStore()
  })

  it('should fetch user correctly', async () => {
    const mockUser = { id: '1', name: 'Test User' }
    vi.spyOn(api, 'getUser').mockResolvedValue(mockUser)

    await userStore.fetchUser('1')

    expect(userStore.currentUser).toEqual(mockUser)
  })
})
```

### 模块集成测试

```typescript
// tests/integration/user-order.test.ts
describe('User-Order Integration', () => {
  let userStore: UserStore
  let orderStore: OrderStore

  beforeEach(() => {
    userStore = new UserStore()
    orderStore = new OrderStore()
  })

  it('should create order after user login', async () => {
    // 用户登录
    await userStore.login({ username: 'test', password: 'password' })

    // 创建订单
    const order = await orderStore.createOrder([
      { productId: '1', quantity: 2 }
    ])

    expect(order.userId).toBe(userStore.currentUser.id)
  })
})
```

## 🎯 最佳实践

### 1. 单一职责

```typescript
// ✅ 每个模块只负责一个业务领域
export class UserStore extends BaseStore {
  // 只处理用户相关的状态和操作
}

export class ProductStore extends BaseStore {
  // 只处理产品相关的状态和操作
}
```

### 2. 明确的模块边界

```typescript
// ✅ 通过接口定义模块边界
interface IUserStore {
  currentUser: User | null
  login(credentials: LoginCredentials): Promise<User>
  logout(): Promise<void>
}

export class UserStore extends BaseStore implements IUserStore {
  // 实现接口
}
```

### 3. 避免循环依赖

```typescript
// ❌ 避免循环依赖
// UserStore -> OrderStore -> UserStore

// ✅ 使用事件或依赖注入解决
// UserStore -> EventBus <- OrderStore
```

模块化是构建大型应用的基础，合理的模块化设计可以让您的代码更加清晰、可维护和可测试。
