# createFunctionalStore

`createFunctionalStore` 是创建函数式 Store 的核心 API，提供了一种函数式编程风格的状态管理方案。

## 📖 API 签名

```typescript
function createFunctionalStore<T>(
  name: string,
  setup: () => T,
  options?: FunctionalStoreOptions
): () => T
```

## 🔧 参数说明

### name
- **类型**: `string`
- **描述**: Store 的唯一标识符
- **必需**: 是

### setup
- **类型**: `() => T`
- **描述**: Store 的设置函数，返回状态和方法
- **必需**: 是

### options
- **类型**: `FunctionalStoreOptions`
- **描述**: 可选配置项
- **必需**: 否

```typescript
interface FunctionalStoreOptions {
  persist?: boolean | PersistOptions
  middleware?: Middleware[]
  devtools?: boolean
}
```

## 🚀 基本用法

### 简单计数器

```typescript
import { createFunctionalStore } from '@ldesign/store'
import { ref, computed } from 'vue'

export const useCounterStore = createFunctionalStore('counter', () => {
  // 状态
  const count = ref(0)
  const step = ref(1)

  // 计算属性
  const doubleCount = computed(() => count.value * 2)
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
    step.value = Math.max(1, newStep)
  }

  // 返回公开的状态和方法
  return {
    // 状态
    count: readonly(count),
    step: readonly(step),
    
    // 计算属性
    doubleCount,
    isPositive,
    
    // 方法
    increment,
    decrement,
    reset,
    setStep
  }
})
```

### 异步数据获取

```typescript
export const useUserStore = createFunctionalStore('user', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isLoggedIn = computed(() => !!user.value)

  const login = async (credentials) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.login(credentials)
      user.value = response.user
      
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      loading.value = true
      await api.logout()
      user.value = null
    } finally {
      loading.value = false
    }
  }

  const fetchProfile = async () => {
    if (!user.value) return

    try {
      loading.value = true
      const profile = await api.getUserProfile(user.value.id)
      user.value = { ...user.value, ...profile }
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),
    isLoggedIn,
    login,
    logout,
    fetchProfile
  }
})
```

## ⚙️ 高级配置

### 持久化配置

```typescript
export const useSettingsStore = createFunctionalStore('settings', () => {
  const theme = ref('light')
  const language = ref('zh-CN')
  const notifications = ref(true)

  const updateTheme = (newTheme) => {
    theme.value = newTheme
  }

  const updateLanguage = (newLanguage) => {
    language.value = newLanguage
  }

  const toggleNotifications = () => {
    notifications.value = !notifications.value
  }

  return {
    theme: readonly(theme),
    language: readonly(language),
    notifications: readonly(notifications),
    updateTheme,
    updateLanguage,
    toggleNotifications
  }
}, {
  persist: {
    key: 'app-settings',
    storage: 'localStorage',
    paths: ['theme', 'language', 'notifications']
  }
})
```

### 中间件配置

```typescript
import { loggerMiddleware, performanceMiddleware } from '@ldesign/store/middlewares'

export const useApiStore = createFunctionalStore('api', () => {
  const cache = ref(new Map())
  const requestCount = ref(0)

  const get = async (url) => {
    requestCount.value++
    
    if (cache.value.has(url)) {
      return cache.value.get(url)
    }

    const response = await fetch(url)
    const data = await response.json()
    
    cache.value.set(url, data)
    return data
  }

  const clearCache = () => {
    cache.value.clear()
  }

  return {
    requestCount: readonly(requestCount),
    get,
    clearCache
  }
}, {
  middleware: [loggerMiddleware, performanceMiddleware],
  devtools: true
})
```

## 🔄 响应式系统

### 深度响应式

```typescript
export const useFormStore = createFunctionalStore('form', () => {
  const formData = reactive({
    personal: {
      name: '',
      email: '',
      phone: ''
    },
    address: {
      street: '',
      city: '',
      zipCode: ''
    }
  })

  const errors = reactive({})
  const touched = reactive({})

  const updateField = (path, value) => {
    set(formData, path, value)
    set(touched, path, true)
    
    // 清除该字段的错误
    if (has(errors, path)) {
      unset(errors, path)
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.personal.name) {
      newErrors['personal.name'] = '姓名不能为空'
    }
    
    if (!formData.personal.email) {
      newErrors['personal.email'] = '邮箱不能为空'
    }

    Object.assign(errors, newErrors)
    return Object.keys(newErrors).length === 0
  }

  const reset = () => {
    Object.assign(formData, {
      personal: { name: '', email: '', phone: '' },
      address: { street: '', city: '', zipCode: '' }
    })
    
    Object.keys(errors).forEach(key => delete errors[key])
    Object.keys(touched).forEach(key => delete touched[key])
  }

  return {
    formData: readonly(formData),
    errors: readonly(errors),
    touched: readonly(touched),
    updateField,
    validate,
    reset
  }
})
```

## 🎯 组合模式

### Store 组合

```typescript
export const useShoppingStore = createFunctionalStore('shopping', () => {
  // 组合其他 Store
  const userStore = useUserStore()
  const productStore = useProductStore()

  const cart = ref([])
  const wishlist = ref([])

  const addToCart = (productId, quantity = 1) => {
    if (!userStore.isLoggedIn) {
      throw new Error('请先登录')
    }

    const product = productStore.getProduct(productId)
    if (!product) {
      throw new Error('产品不存在')
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

  const removeFromCart = (productId) => {
    const index = cart.value.findIndex(item => item.productId === productId)
    if (index > -1) {
      cart.value.splice(index, 1)
    }
  }

  const cartTotal = computed(() => {
    return cart.value.reduce((total, item) => {
      const product = productStore.getProduct(item.productId)
      return total + (product?.price || 0) * item.quantity
    }, 0)
  })

  const cartItemCount = computed(() => {
    return cart.value.reduce((count, item) => count + item.quantity, 0)
  })

  return {
    cart: readonly(cart),
    wishlist: readonly(wishlist),
    cartTotal,
    cartItemCount,
    addToCart,
    removeFromCart
  }
})
```

## 🧪 测试支持

### 测试工具

```typescript
import { createTestFunctionalStore } from '@ldesign/store/testing'

describe('useCounterStore', () => {
  it('should increment count', () => {
    const store = createTestFunctionalStore(useCounterStore)
    
    expect(store.count).toBe(0)
    
    store.increment()
    expect(store.count).toBe(1)
    
    store.setStep(5)
    store.increment()
    expect(store.count).toBe(6)
  })

  it('should handle async operations', async () => {
    const store = createTestFunctionalStore(useUserStore)
    
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
  isPositive: ComputedRef<boolean>
  increment: () => void
  decrement: () => void
  reset: () => void
  setStep: (step: number) => void
}

export const useCounterStore: () => CounterStore = createFunctionalStore('counter', () => {
  // 实现...
})
```

### 泛型支持

```typescript
function createTypedFunctionalStore<T extends Record<string, any>>(
  name: string,
  setup: () => T,
  options?: FunctionalStoreOptions
): () => T {
  return createFunctionalStore(name, setup, options)
}

// 使用
export const useTypedStore = createTypedFunctionalStore('typed', () => {
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

### 1. 返回只读状态

```typescript
// ✅ 返回只读状态，防止外部直接修改
return {
  count: readonly(count),
  increment,
  decrement
}

// ❌ 直接返回可变状态
return {
  count,
  increment,
  decrement
}
```

### 2. 合理的状态结构

```typescript
// ✅ 扁平化的状态结构
const name = ref('')
const email = ref('')
const loading = ref(false)

// ❌ 过度嵌套的状态
const state = reactive({
  user: {
    profile: {
      personal: {
        name: '',
        email: ''
      }
    }
  },
  ui: {
    loading: false
  }
})
```

### 3. 错误处理

```typescript
// ✅ 完善的错误处理
const fetchData = async () => {
  try {
    loading.value = true
    error.value = null
    
    const data = await api.getData()
    items.value = data
  } catch (err) {
    error.value = err.message
    console.error('获取数据失败:', err)
  } finally {
    loading.value = false
  }
}
```

`createFunctionalStore` 提供了一种简洁、灵活的函数式状态管理方案，特别适合喜欢 Composition API 风格的开发者。
