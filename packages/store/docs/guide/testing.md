# 测试策略

@ldesign/store 提供了完整的测试工具和策略，帮助您构建可靠的应用程序。

## 🧪 测试工具概览

### 核心测试工具

```typescript
import { 
  createTestStore,
  createMockStore,
  createStoreSnapshot,
  restoreStoreSnapshot
} from '@ldesign/store/testing'
```

### 测试环境配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts']
  }
})

// tests/setup.ts
import { config } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { vi } from 'vitest'

// 全局测试配置
config.global.plugins = [
  createTestingPinia({
    createSpy: vi.fn,
    stubActions: false
  })
]

// 模拟全局对象
global.fetch = vi.fn()
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
```

## 🏪 Store 单元测试

### 基础 Store 测试

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createTestStore } from '@ldesign/store/testing'
import { UserStore } from '@/stores/UserStore'

describe('UserStore', () => {
  let userStore: UserStore

  beforeEach(() => {
    userStore = createTestStore(UserStore)
  })

  describe('状态管理', () => {
    it('应该正确初始化状态', () => {
      expect(userStore.user).toBeNull()
      expect(userStore.loading).toBe(false)
      expect(userStore.isLoggedIn).toBe(false)
    })

    it('应该正确更新用户状态', () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com'
      }

      userStore.setUser(mockUser)
      
      expect(userStore.user).toEqual(mockUser)
      expect(userStore.isLoggedIn).toBe(true)
    })
  })

  describe('异步操作', () => {
    it('应该成功登录用户', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com'
      }

      // 模拟 API 响应
      vi.spyOn(api, 'login').mockResolvedValue({
        user: mockUser,
        token: 'mock-token'
      })

      const credentials = {
        username: 'testuser',
        password: 'password'
      }

      await userStore.login(credentials)

      expect(userStore.user).toEqual(mockUser)
      expect(userStore.loading).toBe(false)
      expect(api.login).toHaveBeenCalledWith(credentials)
    })

    it('应该处理登录失败', async () => {
      const error = new Error('Invalid credentials')
      vi.spyOn(api, 'login').mockRejectedValue(error)

      const credentials = {
        username: 'testuser',
        password: 'wrongpassword'
      }

      await expect(userStore.login(credentials)).rejects.toThrow('Invalid credentials')
      
      expect(userStore.user).toBeNull()
      expect(userStore.loading).toBe(false)
    })
  })

  describe('计算属性', () => {
    it('应该正确计算用户权限', () => {
      userStore.setUser({
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        roles: ['admin']
      })

      expect(userStore.isAdmin).toBe(true)
      expect(userStore.canAccess('admin:manage')).toBe(true)
    })
  })
})
```

### 装饰器测试

```typescript
describe('装饰器功能测试', () => {
  let store: TestStore

  beforeEach(() => {
    store = createTestStore(TestStore)
  })

  describe('@Cache 装饰器', () => {
    it('应该缓存计算结果', () => {
      const spy = vi.spyOn(store, 'expensiveCalculation')
      
      // 第一次调用
      const result1 = store.cachedValue
      expect(spy).toHaveBeenCalledTimes(1)
      
      // 第二次调用应该使用缓存
      const result2 = store.cachedValue
      expect(spy).toHaveBeenCalledTimes(1)
      expect(result1).toBe(result2)
    })

    it('应该在TTL过期后重新计算', async () => {
      const spy = vi.spyOn(store, 'expensiveCalculation')
      
      // 第一次调用
      store.cachedValue
      expect(spy).toHaveBeenCalledTimes(1)
      
      // 等待缓存过期
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      // 缓存过期后应该重新计算
      store.cachedValue
      expect(spy).toHaveBeenCalledTimes(2)
    })
  })

  describe('@Debounce 装饰器', () => {
    it('应该防抖函数调用', async () => {
      const spy = vi.spyOn(store, 'debouncedMethod')
      
      // 快速连续调用
      store.debouncedSearch('test1')
      store.debouncedSearch('test2')
      store.debouncedSearch('test3')
      
      // 应该只调用一次
      expect(spy).toHaveBeenCalledTimes(0)
      
      // 等待防抖延迟
      await new Promise(resolve => setTimeout(resolve, 350))
      
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenLastCalledWith('test3')
    })
  })
})
```

## 🔄 集成测试

### Store 间交互测试

```typescript
describe('Store 集成测试', () => {
  let userStore: UserStore
  let cartStore: CartStore
  let orderStore: OrderStore

  beforeEach(() => {
    userStore = createTestStore(UserStore)
    cartStore = createTestStore(CartStore)
    orderStore = createTestStore(OrderStore)
  })

  it('应该在用户登录后加载购物车', async () => {
    const mockUser = { id: '1', name: 'Test User' }
    const mockCart = [
      { id: '1', productId: 'p1', quantity: 2 }
    ]

    vi.spyOn(api, 'login').mockResolvedValue({
      user: mockUser,
      token: 'token'
    })
    vi.spyOn(api, 'getCart').mockResolvedValue(mockCart)

    // 用户登录
    await userStore.login({ username: 'test', password: 'password' })
    
    // 加载购物车
    await cartStore.loadCart(mockUser.id)

    expect(cartStore.items).toEqual(mockCart)
  })

  it('应该在创建订单时清空购物车', async () => {
    // 设置初始状态
    userStore.setUser({ id: '1', name: 'Test User' })
    cartStore.setItems([
      { id: '1', productId: 'p1', quantity: 2 }
    ])

    const mockOrder = { id: 'order1', userId: '1', items: cartStore.items }
    vi.spyOn(api, 'createOrder').mockResolvedValue(mockOrder)

    // 创建订单
    await orderStore.createOrder(cartStore.items)

    expect(orderStore.orders).toContain(mockOrder)
    expect(cartStore.items).toHaveLength(0)
  })
})
```

### 中间件测试

```typescript
describe('中间件测试', () => {
  let store: TestStore
  let middleware: any

  beforeEach(() => {
    middleware = {
      before: vi.fn(),
      after: vi.fn(),
      error: vi.fn()
    }
    
    store = createTestStore(TestStore, {
      middlewares: [middleware]
    })
  })

  it('应该在操作前后调用中间件', async () => {
    await store.testAction('test')

    expect(middleware.before).toHaveBeenCalled()
    expect(middleware.after).toHaveBeenCalled()
  })

  it('应该在错误时调用错误中间件', async () => {
    vi.spyOn(store, 'failingAction').mockRejectedValue(new Error('Test error'))

    try {
      await store.failingAction()
    } catch (error) {
      // 预期的错误
    }

    expect(middleware.error).toHaveBeenCalled()
  })
})
```

## 🎨 Vue 组件测试

### 组件与 Store 集成测试

```vue
<!-- UserProfile.vue -->
<template>
  <div class="user-profile">
    <div v-if="loading">加载中...</div>
    <div v-else-if="user">
      <h2>{{ user.name }}</h2>
      <p>{{ user.email }}</p>
      <button @click="logout">退出登录</button>
    </div>
    <div v-else>
      <p>请先登录</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/UserStore'

const userStore = useUserStore()

const user = computed(() => userStore.user)
const loading = computed(() => userStore.loading)

const logout = () => {
  userStore.logout()
}
</script>
```

```typescript
// UserProfile.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import UserProfile from '@/components/UserProfile.vue'
import { useUserStore } from '@/stores/UserStore'

describe('UserProfile.vue', () => {
  let wrapper: any
  let userStore: any

  beforeEach(() => {
    wrapper = mount(UserProfile, {
      global: {
        plugins: [createTestingPinia()]
      }
    })
    userStore = useUserStore()
  })

  it('应该显示加载状态', () => {
    userStore.loading = true
    
    expect(wrapper.text()).toContain('加载中...')
  })

  it('应该显示用户信息', () => {
    userStore.user = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    }
    userStore.loading = false

    expect(wrapper.text()).toContain('Test User')
    expect(wrapper.text()).toContain('test@example.com')
  })

  it('应该在点击退出时调用 logout', async () => {
    userStore.user = { id: '1', name: 'Test User' }
    
    const logoutButton = wrapper.find('button')
    await logoutButton.trigger('click')

    expect(userStore.logout).toHaveBeenCalled()
  })

  it('应该在未登录时显示提示', () => {
    userStore.user = null
    userStore.loading = false

    expect(wrapper.text()).toContain('请先登录')
  })
})
```

## 📊 性能测试

### Store 性能基准测试

```typescript
import { describe, it, expect } from 'vitest'
import { PerformanceBenchmark } from '@ldesign/store/testing'

describe('Store 性能测试', () => {
  it('应该在合理时间内完成大量状态更新', async () => {
    const store = createTestStore(ProductStore)
    const benchmark = new PerformanceBenchmark('大量状态更新')

    benchmark.add('批量添加产品', () => {
      for (let i = 0; i < 1000; i++) {
        store.addProduct({
          id: i.toString(),
          name: `Product ${i}`,
          price: Math.random() * 100
        })
      }
    })

    const results = await benchmark.run()
    const result = results[0]

    expect(result.opsPerSecond).toBeGreaterThan(100) // 至少100 ops/sec
    expect(result.meanTime).toBeLessThan(10) // 平均时间小于10ms
  })

  it('应该高效处理计算属性', async () => {
    const store = createTestStore(ProductStore)
    
    // 添加大量数据
    for (let i = 0; i < 1000; i++) {
      store.addProduct({
        id: i.toString(),
        name: `Product ${i}`,
        price: Math.random() * 100,
        category: `Category ${i % 10}`
      })
    }

    const benchmark = new PerformanceBenchmark('计算属性性能')

    benchmark.add('过滤产品', () => {
      const filtered = store.filteredProducts
      return filtered.length
    })

    const results = await benchmark.run()
    const result = results[0]

    expect(result.opsPerSecond).toBeGreaterThan(1000) // 至少1000 ops/sec
  })
})
```

### 内存泄漏测试

```typescript
describe('内存泄漏测试', () => {
  it('应该正确清理 Store 实例', () => {
    const initialMemory = getMemoryUsage()
    
    // 创建大量 Store 实例
    const stores = []
    for (let i = 0; i < 100; i++) {
      stores.push(createTestStore(TestStore))
    }
    
    const afterCreation = getMemoryUsage()
    
    // 清理 Store 实例
    stores.forEach(store => store.$dispose())
    
    // 强制垃圾回收
    if (global.gc) {
      global.gc()
    }
    
    const afterCleanup = getMemoryUsage()
    
    // 验证内存是否被正确释放
    const memoryIncrease = afterCleanup.used - initialMemory.used
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024) // 小于10MB
  })
})
```

## 🔧 测试工具和辅助函数

### 自定义测试工具

```typescript
// testing/utils.ts
export function createMockApi() {
  return {
    login: vi.fn(),
    logout: vi.fn(),
    getUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn()
  }
}

export function createTestUser(overrides = {}) {
  return {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    roles: ['user'],
    ...overrides
  }
}

export function waitForStoreUpdate(store: any, property: string, expectedValue: any) {
  return new Promise((resolve) => {
    const unwatch = store.$watch(
      () => store[property],
      (newValue) => {
        if (newValue === expectedValue) {
          unwatch()
          resolve(newValue)
        }
      },
      { immediate: true }
    )
  })
}

export function mockLocalStorage() {
  const storage = new Map()
  
  return {
    getItem: vi.fn((key) => storage.get(key) || null),
    setItem: vi.fn((key, value) => storage.set(key, value)),
    removeItem: vi.fn((key) => storage.delete(key)),
    clear: vi.fn(() => storage.clear())
  }
}
```

### 测试数据工厂

```typescript
// testing/factories.ts
export class TestDataFactory {
  static createUser(overrides = {}) {
    return {
      id: faker.datatype.uuid(),
      name: faker.name.fullName(),
      email: faker.internet.email(),
      roles: ['user'],
      createdAt: faker.date.past(),
      ...overrides
    }
  }

  static createProduct(overrides = {}) {
    return {
      id: faker.datatype.uuid(),
      name: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price()),
      category: faker.commerce.department(),
      description: faker.commerce.productDescription(),
      stock: faker.datatype.number({ min: 0, max: 100 }),
      ...overrides
    }
  }

  static createOrder(overrides = {}) {
    return {
      id: faker.datatype.uuid(),
      userId: faker.datatype.uuid(),
      items: [this.createProduct()],
      total: parseFloat(faker.commerce.price()),
      status: 'pending',
      createdAt: faker.date.recent(),
      ...overrides
    }
  }
}
```

## 🎯 测试最佳实践

### 1. 测试结构

```typescript
// ✅ 清晰的测试结构
describe('UserStore', () => {
  describe('状态管理', () => {
    it('应该正确初始化状态', () => {})
    it('应该正确更新状态', () => {})
  })
  
  describe('异步操作', () => {
    it('应该成功处理API调用', () => {})
    it('应该处理API错误', () => {})
  })
})
```

### 2. 模拟和存根

```typescript
// ✅ 合理使用模拟
beforeEach(() => {
  vi.spyOn(api, 'getUser').mockResolvedValue(mockUser)
})

// ❌ 过度模拟
beforeEach(() => {
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
  vi.spyOn(Date, 'now').mockReturnValue(123456789)
})
```

### 3. 测试隔离

```typescript
// ✅ 每个测试独立
beforeEach(() => {
  store = createTestStore(UserStore)
  vi.clearAllMocks()
})
```

### 4. 有意义的断言

```typescript
// ✅ 具体的断言
expect(userStore.user).toEqual({
  id: '1',
  name: 'Test User',
  email: 'test@example.com'
})

// ❌ 模糊的断言
expect(userStore.user).toBeTruthy()
```

完善的测试策略是保证代码质量的关键，@ldesign/store 提供了全面的测试工具和最佳实践指导。
