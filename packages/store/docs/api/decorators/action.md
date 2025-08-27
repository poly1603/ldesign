# @Action 装饰器

`@Action` 装饰器用于标记 Store 类中的操作方法，这些方法是修改状态的唯一途径。

## 📖 基本语法

```typescript
@Action
methodName(parameters): ReturnType {
  // 操作逻辑
}
```

## 🔧 参数说明

`@Action` 装饰器可以不带参数使用，也可以接受配置选项：

```typescript
@Action(options?: ActionOptions)
```

### ActionOptions

```typescript
interface ActionOptions {
  name?: string           // 自定义操作名称
  async?: boolean         // 是否为异步操作，默认自动检测
  validate?: boolean      // 是否启用参数验证，默认 false
  middleware?: Middleware[] // 操作级中间件
  retry?: RetryOptions    // 重试配置
  timeout?: number        // 超时时间（毫秒）
}

interface RetryOptions {
  times: number           // 重试次数
  delay: number          // 重试延迟（毫秒）
  exponential?: boolean  // 是否指数退避
}
```

## 🚀 基本用法

### 同步操作

```typescript
import { BaseStore, State, Action } from '@ldesign/store'

export class CounterStore extends BaseStore {
  @State
  count = 0

  @State
  step = 1

  @Action
  increment() {
    this.count += this.step
  }

  @Action
  decrement() {
    this.count -= this.step
  }

  @Action
  reset() {
    this.count = 0
  }

  @Action
  setStep(newStep: number) {
    if (newStep > 0) {
      this.step = newStep
    }
  }

  @Action
  incrementBy(amount: number) {
    this.count += amount
  }
}
```

### 异步操作

```typescript
export class UserStore extends BaseStore {
  @State
  user: User | null = null

  @State
  users: User[] = []

  @State
  loading = false

  @State
  error: string | null = null

  @Action
  async login(credentials: LoginCredentials) {
    try {
      this.loading = true
      this.error = null
      
      const response = await api.login(credentials)
      this.user = response.user
      
      return response
    } catch (error) {
      this.error = error.message
      throw error
    } finally {
      this.loading = false
    }
  }

  @Action
  async fetchUsers() {
    try {
      this.loading = true
      this.error = null
      
      const users = await api.getUsers()
      this.users = users
    } catch (error) {
      this.error = error.message
      throw error
    } finally {
      this.loading = false
    }
  }

  @Action
  async updateUser(userId: string, updates: Partial<User>) {
    try {
      this.loading = true
      this.error = null
      
      const updatedUser = await api.updateUser(userId, updates)
      
      // 更新用户列表
      const index = this.users.findIndex(u => u.id === userId)
      if (index !== -1) {
        this.users[index] = updatedUser
      }
      
      // 如果是当前用户，更新当前用户信息
      if (this.user?.id === userId) {
        this.user = updatedUser
      }
      
      return updatedUser
    } catch (error) {
      this.error = error.message
      throw error
    } finally {
      this.loading = false
    }
  }

  @Action
  logout() {
    this.user = null
    this.error = null
  }
}
```

## ⚙️ 高级配置

### 自定义操作名称

```typescript
export class DataStore extends BaseStore {
  @State
  data: any[] = []

  @Action({ name: 'loadInitialData' })
  async fetchData() {
    this.data = await api.getData()
  }

  @Action({ name: 'refreshData' })
  async refetch() {
    this.data = await api.getData()
  }
}
```

### 重试配置

```typescript
export class ApiStore extends BaseStore {
  @State
  data: any = null

  @Action({
    retry: {
      times: 3,
      delay: 1000,
      exponential: true
    }
  })
  async fetchCriticalData() {
    const response = await api.getCriticalData()
    this.data = response.data
  }

  @Action({
    retry: {
      times: 5,
      delay: 500
    },
    timeout: 10000
  })
  async uploadFile(file: File) {
    return await api.uploadFile(file)
  }
}
```

### 参数验证

```typescript
import { z } from 'zod'

export class FormStore extends BaseStore {
  @State
  formData = {
    name: '',
    email: '',
    age: 0
  }

  @Action({
    validate: true,
    schema: z.object({
      name: z.string().min(2),
      email: z.string().email(),
      age: z.number().min(0).max(120)
    })
  })
  updateFormData(data: { name: string; email: string; age: number }) {
    this.formData = { ...this.formData, ...data }
  }

  @Action({
    validate: true,
    schema: z.string().email()
  })
  updateEmail(email: string) {
    this.formData.email = email
  }
}
```

### 操作级中间件

```typescript
const auditMiddleware = createMiddleware({
  name: 'audit',
  before: (action, store, args) => {
    console.log(`审计: ${action.name} 开始执行`, args)
  },
  after: (action, store, result) => {
    console.log(`审计: ${action.name} 执行完成`, result)
  }
})

export class AdminStore extends BaseStore {
  @State
  users: User[] = []

  @Action({
    middleware: [auditMiddleware]
  })
  async deleteUser(userId: string) {
    await api.deleteUser(userId)
    this.users = this.users.filter(u => u.id !== userId)
  }

  @Action({
    middleware: [auditMiddleware]
  })
  async updateUserRole(userId: string, role: string) {
    const updatedUser = await api.updateUserRole(userId, role)
    const index = this.users.findIndex(u => u.id === userId)
    if (index !== -1) {
      this.users[index] = updatedUser
    }
  }
}
```

## 🔄 复杂操作示例

### 批量操作

```typescript
export class ProductStore extends BaseStore {
  @State
  products: Product[] = []

  @State
  selectedProducts: Set<string> = new Set()

  @Action
  async batchUpdateProducts(updates: Array<{ id: string; data: Partial<Product> }>) {
    try {
      const promises = updates.map(({ id, data }) => 
        api.updateProduct(id, data)
      )
      
      const updatedProducts = await Promise.all(promises)
      
      // 批量更新本地状态
      updatedProducts.forEach(product => {
        const index = this.products.findIndex(p => p.id === product.id)
        if (index !== -1) {
          this.products[index] = product
        }
      })
      
      return updatedProducts
    } catch (error) {
      console.error('批量更新失败:', error)
      throw error
    }
  }

  @Action
  async batchDeleteProducts(productIds: string[]) {
    try {
      await Promise.all(
        productIds.map(id => api.deleteProduct(id))
      )
      
      // 从本地状态中移除
      this.products = this.products.filter(
        p => !productIds.includes(p.id)
      )
      
      // 清除选中状态
      productIds.forEach(id => {
        this.selectedProducts.delete(id)
      })
    } catch (error) {
      console.error('批量删除失败:', error)
      throw error
    }
  }
}
```

### 事务操作

```typescript
export class OrderStore extends BaseStore {
  @State
  orders: Order[] = []

  @State
  inventory: Map<string, number> = new Map()

  @Action
  async createOrderWithInventoryCheck(orderData: CreateOrderData) {
    // 开始事务
    const transaction = await api.beginTransaction()
    
    try {
      // 1. 检查库存
      for (const item of orderData.items) {
        const available = this.inventory.get(item.productId) || 0
        if (available < item.quantity) {
          throw new Error(`产品 ${item.productId} 库存不足`)
        }
      }
      
      // 2. 创建订单
      const order = await api.createOrder(orderData, transaction)
      
      // 3. 更新库存
      for (const item of orderData.items) {
        await api.updateInventory(
          item.productId, 
          -item.quantity, 
          transaction
        )
        
        // 更新本地库存
        const current = this.inventory.get(item.productId) || 0
        this.inventory.set(item.productId, current - item.quantity)
      }
      
      // 4. 提交事务
      await api.commitTransaction(transaction)
      
      // 5. 更新本地状态
      this.orders.push(order)
      
      return order
    } catch (error) {
      // 回滚事务
      await api.rollbackTransaction(transaction)
      throw error
    }
  }
}
```

### 状态同步操作

```typescript
export class SyncStore extends BaseStore {
  @State
  localData: any[] = []

  @State
  remoteData: any[] = []

  @State
  syncStatus: 'idle' | 'syncing' | 'success' | 'error' = 'idle'

  @Action
  async syncData() {
    try {
      this.syncStatus = 'syncing'
      
      // 获取远程数据
      const remote = await api.getRemoteData()
      this.remoteData = remote
      
      // 比较本地和远程数据
      const conflicts = this.findConflicts(this.localData, remote)
      
      if (conflicts.length > 0) {
        // 处理冲突
        const resolved = await this.resolveConflicts(conflicts)
        this.localData = resolved
      } else {
        // 无冲突，直接同步
        this.localData = remote
      }
      
      // 上传本地更改
      await api.uploadLocalChanges(this.localData)
      
      this.syncStatus = 'success'
    } catch (error) {
      this.syncStatus = 'error'
      throw error
    }
  }

  @Action
  private findConflicts(local: any[], remote: any[]) {
    // 冲突检测逻辑
    return []
  }

  @Action
  private async resolveConflicts(conflicts: any[]) {
    // 冲突解决逻辑
    return conflicts
  }
}
```

## 🧪 测试操作

### 同步操作测试

```typescript
import { describe, it, expect } from 'vitest'
import { createTestStore } from '@ldesign/store/testing'
import { CounterStore } from '@/stores/CounterStore'

describe('CounterStore 操作测试', () => {
  it('应该正确执行增加操作', () => {
    const store = createTestStore(CounterStore)
    
    expect(store.count).toBe(0)
    
    store.increment()
    expect(store.count).toBe(1)
    
    store.incrementBy(5)
    expect(store.count).toBe(6)
  })

  it('应该正确设置步长', () => {
    const store = createTestStore(CounterStore)
    
    store.setStep(3)
    expect(store.step).toBe(3)
    
    store.increment()
    expect(store.count).toBe(3)
  })
})
```

### 异步操作测试

```typescript
describe('UserStore 异步操作测试', () => {
  it('应该成功登录用户', async () => {
    const store = createTestStore(UserStore)
    const mockUser = { id: '1', name: 'Test User' }
    
    vi.spyOn(api, 'login').mockResolvedValue({
      user: mockUser,
      token: 'mock-token'
    })
    
    const result = await store.login({
      username: 'test',
      password: 'password'
    })
    
    expect(store.user).toEqual(mockUser)
    expect(store.loading).toBe(false)
    expect(result.user).toEqual(mockUser)
  })

  it('应该处理登录失败', async () => {
    const store = createTestStore(UserStore)
    
    vi.spyOn(api, 'login').mockRejectedValue(
      new Error('Invalid credentials')
    )
    
    await expect(
      store.login({ username: 'test', password: 'wrong' })
    ).rejects.toThrow('Invalid credentials')
    
    expect(store.user).toBeNull()
    expect(store.error).toBe('Invalid credentials')
    expect(store.loading).toBe(false)
  })
})
```

## 🎯 最佳实践

### 1. 操作命名

```typescript
// ✅ 清晰的操作命名
@Action
async fetchUsers() { }

@Action
async createUser(userData: CreateUserData) { }

@Action
async updateUserProfile(userId: string, profile: UserProfile) { }

// ❌ 模糊的操作命名
@Action
async doSomething() { }

@Action
async handle(data: any) { }
```

### 2. 错误处理

```typescript
// ✅ 完善的错误处理
@Action
async fetchData() {
  try {
    this.loading = true
    this.error = null
    
    const data = await api.getData()
    this.data = data
  } catch (error) {
    this.error = error.message
    console.error('获取数据失败:', error)
    throw error
  } finally {
    this.loading = false
  }
}

// ❌ 缺少错误处理
@Action
async fetchData() {
  const data = await api.getData()
  this.data = data
}
```

### 3. 状态更新

```typescript
// ✅ 原子性状态更新
@Action
async updateUser(userId: string, updates: Partial<User>) {
  const updatedUser = await api.updateUser(userId, updates)
  
  // 同时更新相关状态
  const index = this.users.findIndex(u => u.id === userId)
  if (index !== -1) {
    this.users[index] = updatedUser
  }
  
  if (this.currentUser?.id === userId) {
    this.currentUser = updatedUser
  }
}

// ❌ 不一致的状态更新
@Action
async updateUser(userId: string, updates: Partial<User>) {
  await api.updateUser(userId, updates)
  // 忘记更新本地状态
}
```

### 4. 参数验证

```typescript
// ✅ 参数验证
@Action
createUser(userData: CreateUserData) {
  if (!userData.email || !userData.name) {
    throw new Error('邮箱和姓名是必需的')
  }
  
  // 创建用户逻辑
}

// ❌ 缺少参数验证
@Action
createUser(userData: any) {
  // 直接使用未验证的数据
}
```

`@Action` 装饰器是状态修改的唯一入口，正确使用它可以确保状态变化的可预测性和可追踪性。
