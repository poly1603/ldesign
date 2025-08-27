# createCompositionStore

`createCompositionStore` 是创建组合式 Store 的核心 API，基于 Vue 3 Composition API 设计，提供更灵活的状态管理方案。

## 📖 API 签名

```typescript
function createCompositionStore<T>(
  name: string,
  setup: () => T,
  options?: CompositionStoreOptions
): () => T
```

## 🔧 参数说明

### name
- **类型**: `string`
- **描述**: Store 的唯一标识符
- **必需**: 是

### setup
- **类型**: `() => T`
- **描述**: 组合函数，返回状态和方法的组合
- **必需**: 是

### options
- **类型**: `CompositionStoreOptions`
- **描述**: 可选配置项
- **必需**: 否

```typescript
interface CompositionStoreOptions {
  persist?: boolean | PersistOptions
  middleware?: Middleware[]
  devtools?: boolean
  plugins?: Plugin[]
}
```

## 🚀 基本用法

### 简单计数器

```typescript
import { createCompositionStore } from '@ldesign/store'
import { ref, computed } from 'vue'

export const useCounterStore = createCompositionStore('counter', () => {
  // 状态
  const count = ref(0)
  const step = ref(1)

  // 计算属性
  const doubleCount = computed(() => count.value * 2)
  const isEven = computed(() => count.value % 2 === 0)
  const isPositive = computed(() => count.value > 0)

  // 方法
  const increment = () => {
    count.value += step.value
  }

  const decrement = () => {
    count.value -= step.value
  }

  const reset = () => {
    count.value = 0
  }

  const setStep = (newStep: number) => {
    if (newStep > 0) {
      step.value = newStep
    }
  }

  const incrementBy = (amount: number) => {
    count.value += amount
  }

  // 返回公开的接口
  return {
    // 状态（只读）
    count: readonly(count),
    step: readonly(step),
    
    // 计算属性
    doubleCount,
    isEven,
    isPositive,
    
    // 方法
    increment,
    decrement,
    reset,
    setStep,
    incrementBy
  }
})
```

### 用户管理 Store

```typescript
export const useUserStore = createCompositionStore('user', () => {
  // 状态
  const user = ref<User | null>(null)
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const isLoggedIn = computed(() => !!user.value)
  const userCount = computed(() => users.value.length)
  const activeUsers = computed(() => 
    users.value.filter(u => u.status === 'active')
  )

  // 内部方法
  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const setError = (message: string | null) => {
    error.value = message
  }

  // 公开方法
  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.login(credentials)
      user.value = response.user
      
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : '登录失败'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      
      if (user.value) {
        await api.logout()
      }
      
      user.value = null
      setError(null)
    } catch (err) {
      console.error('登出失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const fetchedUsers = await api.getUsers()
      users.value = fetchedUsers
    } catch (err) {
      const message = err instanceof Error ? err.message : '获取用户列表失败'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      setLoading(true)
      setError(null)
      
      const updatedUser = await api.updateUser(userId, updates)
      
      // 更新用户列表
      const index = users.value.findIndex(u => u.id === userId)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      
      // 如果是当前用户，更新当前用户信息
      if (user.value?.id === userId) {
        user.value = updatedUser
      }
      
      return updatedUser
    } catch (err) {
      const message = err instanceof Error ? err.message : '更新用户失败'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await api.deleteUser(userId)
      
      // 从用户列表中移除
      users.value = users.value.filter(u => u.id !== userId)
    } catch (err) {
      const message = err instanceof Error ? err.message : '删除用户失败'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    // 状态
    user: readonly(user),
    users: readonly(users),
    loading: readonly(loading),
    error: readonly(error),
    
    // 计算属性
    isLoggedIn,
    userCount,
    activeUsers,
    
    // 方法
    login,
    logout,
    fetchUsers,
    updateUser,
    deleteUser
  }
})
```

## ⚙️ 高级配置

### 持久化配置

```typescript
export const useSettingsStore = createCompositionStore('settings', () => {
  const theme = ref('light')
  const language = ref('zh-CN')
  const notifications = ref(true)
  const autoSave = ref(false)

  const updateTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
  }

  const updateLanguage = (newLanguage: string) => {
    language.value = newLanguage
  }

  const toggleNotifications = () => {
    notifications.value = !notifications.value
  }

  const toggleAutoSave = () => {
    autoSave.value = !autoSave.value
  }

  const resetSettings = () => {
    theme.value = 'light'
    language.value = 'zh-CN'
    notifications.value = true
    autoSave.value = false
  }

  return {
    theme: readonly(theme),
    language: readonly(language),
    notifications: readonly(notifications),
    autoSave: readonly(autoSave),
    updateTheme,
    updateLanguage,
    toggleNotifications,
    toggleAutoSave,
    resetSettings
  }
}, {
  persist: {
    key: 'app-settings',
    storage: 'localStorage',
    paths: ['theme', 'language', 'notifications', 'autoSave']
  }
})
```

### 中间件集成

```typescript
import { loggerMiddleware, performanceMiddleware } from '@ldesign/store/middlewares'

export const useApiStore = createCompositionStore('api', () => {
  const cache = ref(new Map<string, any>())
  const requestCount = ref(0)
  const lastRequestTime = ref<number | null>(null)

  const get = async (url: string) => {
    requestCount.value++
    lastRequestTime.value = Date.now()
    
    // 检查缓存
    if (cache.value.has(url)) {
      return cache.value.get(url)
    }

    try {
      const response = await fetch(url)
      const data = await response.json()
      
      // 缓存结果
      cache.value.set(url, data)
      
      return data
    } catch (error) {
      console.error('API 请求失败:', error)
      throw error
    }
  }

  const post = async (url: string, data: any) => {
    requestCount.value++
    lastRequestTime.value = Date.now()
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      return await response.json()
    } catch (error) {
      console.error('API 请求失败:', error)
      throw error
    }
  }

  const clearCache = () => {
    cache.value.clear()
  }

  const getCacheSize = () => {
    return cache.value.size
  }

  return {
    requestCount: readonly(requestCount),
    lastRequestTime: readonly(lastRequestTime),
    get,
    post,
    clearCache,
    getCacheSize
  }
}, {
  middleware: [loggerMiddleware, performanceMiddleware],
  devtools: true
})
```

## 🔄 组合模式

### Store 组合

```typescript
export const useShoppingStore = createCompositionStore('shopping', () => {
  // 组合其他 Store
  const userStore = useUserStore()
  const productStore = useProductStore()

  // 本地状态
  const cart = ref<CartItem[]>([])
  const wishlist = ref<string[]>([])
  const checkoutStep = ref(1)

  // 计算属性
  const cartTotal = computed(() => {
    return cart.value.reduce((total, item) => {
      const product = productStore.getProduct(item.productId)
      return total + (product?.price || 0) * item.quantity
    }, 0)
  })

  const cartItemCount = computed(() => {
    return cart.value.reduce((count, item) => count + item.quantity, 0)
  })

  const canCheckout = computed(() => {
    return userStore.isLoggedIn && cart.value.length > 0
  })

  // 方法
  const addToCart = (productId: string, quantity: number = 1) => {
    if (!userStore.isLoggedIn) {
      throw new Error('请先登录')
    }

    const product = productStore.getProduct(productId)
    if (!product) {
      throw new Error('产品不存在')
    }

    if (product.stock < quantity) {
      throw new Error('库存不足')
    }

    const existingItem = cart.value.find(item => item.productId === productId)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.value.push({
        productId,
        quantity,
        addedAt: Date.now()
      })
    }
  }

  const removeFromCart = (productId: string) => {
    const index = cart.value.findIndex(item => item.productId === productId)
    if (index > -1) {
      cart.value.splice(index, 1)
    }
  }

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    const item = cart.value.find(item => item.productId === productId)
    if (item) {
      item.quantity = quantity
    }
  }

  const clearCart = () => {
    cart.value = []
    checkoutStep.value = 1
  }

  const addToWishlist = (productId: string) => {
    if (!wishlist.value.includes(productId)) {
      wishlist.value.push(productId)
    }
  }

  const removeFromWishlist = (productId: string) => {
    const index = wishlist.value.indexOf(productId)
    if (index > -1) {
      wishlist.value.splice(index, 1)
    }
  }

  const proceedToCheckout = () => {
    if (!canCheckout.value) {
      throw new Error('无法进行结账')
    }
    checkoutStep.value = 2
  }

  return {
    // 状态
    cart: readonly(cart),
    wishlist: readonly(wishlist),
    checkoutStep: readonly(checkoutStep),
    
    // 计算属性
    cartTotal,
    cartItemCount,
    canCheckout,
    
    // 方法
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    proceedToCheckout
  }
})
```

## 🧪 测试支持

### 测试工具

```typescript
import { createTestCompositionStore } from '@ldesign/store/testing'

describe('useCounterStore', () => {
  it('should increment count', () => {
    const store = createTestCompositionStore(useCounterStore)
    
    expect(store.count).toBe(0)
    
    store.increment()
    expect(store.count).toBe(1)
    
    store.setStep(5)
    store.increment()
    expect(store.count).toBe(6)
  })

  it('should handle async operations', async () => {
    const store = createTestCompositionStore(useUserStore)
    
    // 模拟 API 响应
    vi.spyOn(api, 'login').mockResolvedValue({
      user: { id: 1, name: 'Test User' }
    })

    await store.login({ username: 'test', password: 'password' })
    
    expect(store.user).toEqual({ id: 1, name: 'Test User' })
    expect(store.isLoggedIn).toBe(true)
  })
})
```

## 🔧 TypeScript 支持

### 类型定义

```typescript
interface CounterStore {
  count: Readonly<Ref<number>>
  step: Readonly<Ref<number>>
  doubleCount: ComputedRef<number>
  isEven: ComputedRef<boolean>
  increment: () => void
  decrement: () => void
  reset: () => void
  setStep: (step: number) => void
}

export const useCounterStore: () => CounterStore = createCompositionStore('counter', () => {
  // 实现...
})
```

### 泛型支持

```typescript
function createTypedCompositionStore<T extends Record<string, any>>(
  name: string,
  setup: () => T,
  options?: CompositionStoreOptions
): () => T {
  return createCompositionStore(name, setup, options)
}

// 使用
export const useTypedStore = createTypedCompositionStore('typed', () => {
  const data = ref<string[]>([])
  
  const addItem = (item: string) => {
    data.value.push(item)
  }

  return {
    data: readonly(data),
    addItem
  }
})
```

## 🎯 最佳实践

### 1. 状态封装

```typescript
// ✅ 返回只读状态
return {
  count: readonly(count),
  increment,
  decrement
}

// ❌ 直接暴露可变状态
return {
  count,
  increment,
  decrement
}
```

### 2. 方法组织

```typescript
// ✅ 清晰的方法分组
return {
  // 状态
  user: readonly(user),
  loading: readonly(loading),
  
  // 计算属性
  isLoggedIn,
  userCount,
  
  // 操作方法
  login,
  logout,
  fetchUsers
}
```

### 3. 错误处理

```typescript
// ✅ 统一的错误处理
const login = async (credentials) => {
  try {
    setLoading(true)
    setError(null)
    // 登录逻辑
  } catch (err) {
    setError(err.message)
    throw err
  } finally {
    setLoading(false)
  }
}
```

`createCompositionStore` 提供了基于 Composition API 的灵活状态管理方案，特别适合复杂的业务逻辑和状态组合。
