# Hook API

@ldesign/store 提供了函数式的 Hook API，让你可以用类似 React Hook 的方式管理状态。

## createStore

创建一个函数式的 Store。

```typescript
createStore<T>(
  id: string,
  setup: () => StoreSetup<T>,
  options?: StoreOptions
): () => T
```

**参数：**

- `id: string` - Store 的唯一标识符
- `setup: () => StoreSetup<T>` - Store 设置函数
- `options?: StoreOptions` - 可选的配置选项

**StoreSetup 接口：**

```typescript
interface StoreSetup<T> {
  state: Record<string, Ref<any>> // 状态对象
  actions: Record<string, Function> // 动作函数
  getters: Record<string, ComputedRef<any>> // 计算属性
}
```

**示例：**

```typescript
import { createStore } from '@ldesign/store'
import { computed, ref } from 'vue'

export const useCounter = createStore('counter', () => {
  // 状态
  const count = ref(0)
  const step = ref(1)

  // 动作
  const increment = () => (count.value += step.value)
  const decrement = () => (count.value -= step.value)
  const reset = () => (count.value = 0)

  // 计算属性
  const doubleCount = computed(() => count.value * 2)
  const isPositive = computed(() => count.value > 0)

  return {
    state: { count, step },
    actions: { increment, decrement, reset },
    getters: { doubleCount, isPositive },
  }
})

// 使用
const counter = useCounter()
counter.increment()
console.log(counter.count) // 1
console.log(counter.doubleCount) // 2
```

## useStore

获取已存在的 Store 实例。

```typescript
useStore<T>(id: string): T | null
```

**参数：**

- `id: string` - Store 的唯一标识符

**示例：**

```typescript
// 在其他组件中使用
const counter = useStore('counter')
if (counter) {
  counter.increment()
}
```

## useState

创建响应式状态。

```typescript
useState<T>(
  initialValue: T,
  options?: StateOptions
): [Ref<T>, (value: T) => void]
```

**参数：**

- `initialValue: T` - 初始值
- `options?: StateOptions` - 状态选项

**StateOptions 接口：**

```typescript
interface StateOptions {
  persist?: boolean | PersistOptions // 是否持久化
  reactive?: boolean // 是否深度响应式
  readonly?: boolean // 是否只读
}
```

**示例：**

```typescript
import { useState } from '@ldesign/store'

export const useUserState = createStore('user', () => {
  // 基础状态
  const [name, setName] = useState('', { persist: true })

  // 复杂状态
  const [profile, setProfile] = useState(
    {
      email: '',
      avatar: null,
    },
    { reactive: true, persist: true }
  )

  // 只读状态
  const [version] = useState('1.0.0', { readonly: true })

  return {
    state: { name, profile, version },
    actions: { setName, setProfile },
    getters: {},
  }
})
```

## useAction

创建动作函数。

```typescript
useAction<T extends (...args: any[]) => any>(
  action: T,
  options?: ActionOptions
): T
```

**参数：**

- `action: T` - 动作函数
- `options?: ActionOptions` - 动作选项

**ActionOptions 接口：**

```typescript
interface ActionOptions {
  debounce?: number // 防抖延迟
  throttle?: number // 节流间隔
  cache?: number // 缓存时间
  loading?: Ref<boolean> // 加载状态引用
}
```

**示例：**

```typescript
import { useAction } from '@ldesign/store'

export const useSearchStore = createStore('search', () => {
  const query = ref('')
  const results = ref([])
  const loading = ref(false)

  // 防抖搜索
  const search = useAction(
    async (q: string) => {
      query.value = q
      if (!q.trim()) {
        results.value = []
        return
      }

      const response = await searchApi.search(q)
      results.value = response.data
    },
    {
      debounce: 300,
      loading,
    }
  )

  // 缓存的数据获取
  const fetchData = useAction(
    async (id: string) => {
      const response = await api.getData(id)
      return response.data
    },
    {
      cache: 60000, // 缓存 1 分钟
    }
  )

  return {
    state: { query, results, loading },
    actions: { search, fetchData },
    getters: {},
  }
})
```

## useGetter

创建计算属性。

```typescript
useGetter<T>(
  getter: () => T,
  dependencies?: any[],
  options?: GetterOptions
): ComputedRef<T>
```

**参数：**

- `getter: () => T` - 计算函数
- `dependencies?: any[]` - 依赖数组
- `options?: GetterOptions` - 计算属性选项

**GetterOptions 接口：**

```typescript
interface GetterOptions {
  cache?: boolean // 是否缓存
  lazy?: boolean // 是否懒计算
  onTrack?: (event: DebuggerEvent) => void // 依赖追踪回调
  onTrigger?: (event: DebuggerEvent) => void // 触发回调
}
```

**示例：**

```typescript
import { useGetter } from '@ldesign/store'

export const useShoppingCart = createStore('cart', () => {
  const items = ref([])
  const taxRate = ref(0.1)

  // 基础计算属性
  const itemCount = useGetter(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  // 缓存的计算属性
  const subtotal = useGetter(
    () => items.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
    { cache: true }
  )

  // 依赖其他计算属性
  const tax = useGetter(() => subtotal.value * taxRate.value)
  const total = useGetter(() => subtotal.value + tax.value)

  return {
    state: { items, taxRate },
    actions: {},
    getters: { itemCount, subtotal, tax, total },
  }
})
```

## usePersist

创建持久化状态。

```typescript
usePersist<T>(
  key: string,
  initialValue: T,
  options?: PersistOptions
): [Ref<T>, (value: T) => void]
```

**参数：**

- `key: string` - 存储键名
- `initialValue: T` - 初始值
- `options?: PersistOptions` - 持久化选项

**PersistOptions 接口：**

```typescript
interface PersistOptions {
  storage?: 'localStorage' | 'sessionStorage' // 存储类型
  serializer?: {
    read: (value: string) => T
    write: (value: T) => string
  }
  beforeRestore?: (stored: string, defaults: T) => T // 恢复前处理
  afterRestore?: (restored: T) => T // 恢复后处理
}
```

**示例：**

```typescript
import { usePersist } from '@ldesign/store'

export const useSettings = createStore('settings', () => {
  // 基础持久化
  const [theme, setTheme] = usePersist('theme', 'light')

  // 自定义序列化
  const [preferences, setPreferences] = usePersist(
    'preferences',
    {
      language: 'zh-CN',
      notifications: true,
    },
    {
      serializer: {
        read: value => JSON.parse(value),
        write: value => JSON.stringify(value),
      },
    }
  )

  // 使用 sessionStorage
  const [sessionData, setSessionData] = usePersist('session', null, {
    storage: 'sessionStorage',
  })

  return {
    state: { theme, preferences, sessionData },
    actions: { setTheme, setPreferences, setSessionData },
    getters: {},
  }
})
```

## useWatch

监听状态变化。

```typescript
useWatch<T>(
  source: WatchSource<T>,
  callback: WatchCallback<T>,
  options?: WatchOptions
): WatchStopHandle
```

**参数：**

- `source: WatchSource<T>` - 监听源
- `callback: WatchCallback<T>` - 回调函数
- `options?: WatchOptions` - 监听选项

**示例：**

```typescript
import { useWatch } from '@ldesign/store'

export const useDataSync = createStore('dataSync', () => {
  const data = ref([])
  const lastSync = ref(null)

  // 监听数据变化并同步
  useWatch(
    data,
    async (newData, oldData) => {
      if (newData.length !== oldData.length) {
        await syncToServer(newData)
        lastSync.value = new Date()
      }
    },
    { deep: true }
  )

  // 监听多个源
  useWatch([data, lastSync], ([newData, newLastSync]) => {
    console.log('数据或同步时间变化:', newData, newLastSync)
  })

  return {
    state: { data, lastSync },
    actions: {},
    getters: {},
  }
})
```

## 组合式 API 集成

### 与 Vue 3 组合式 API 结合

```typescript
// composables/useCounter.ts
import { createStore } from '@ldesign/store'
import { computed, onMounted, onUnmounted, ref } from 'vue'

export const useCounter = createStore('counter', () => {
  const count = ref(0)
  const isActive = ref(false)

  // 生命周期
  onMounted(() => {
    console.log('Counter store mounted')
    isActive.value = true
  })

  onUnmounted(() => {
    console.log('Counter store unmounted')
    isActive.value = false
  })

  // 动作
  const increment = () => {
    if (isActive.value) {
      count.value++
    }
  }

  const decrement = () => {
    if (isActive.value) {
      count.value--
    }
  }

  // 计算属性
  const doubleCount = computed(() => count.value * 2)
  const status = computed(() => (isActive.value ? 'active' : 'inactive'))

  return {
    state: { count, isActive },
    actions: { increment, decrement },
    getters: { doubleCount, status },
  }
})
```

### 在组件中使用

```vue
<script setup lang="ts">
import { useCounter } from '@/composables/useCounter'

const counter = useCounter()
</script>

<template>
  <div>
    <h1>计数器: {{ counter.count }}</h1>
    <p>状态: {{ counter.status }}</p>
    <p>双倍值: {{ counter.doubleCount }}</p>

    <button @click="counter.increment">+1</button>
    <button @click="counter.decrement">-1</button>
  </div>
</template>
```

## 高级用法

### Store 组合

```typescript
// 组合多个 Store
export const useApp = createStore('app', () => {
  const user = useUser()
  const cart = useShoppingCart()
  const settings = useSettings()

  // 组合动作
  const logout = async () => {
    await user.logout()
    cart.clearCart()
    settings.resetToDefaults()
  }

  // 组合计算属性
  const appStatus = computed(() => ({
    user: user.isLoggedIn,
    cartItems: cart.itemCount,
    theme: settings.theme,
  }))

  return {
    state: {},
    actions: { logout },
    getters: { appStatus },
  }
})
```

### 条件性 Store

```typescript
// 根据条件创建不同的 Store
export function useConditionalStore(type: 'admin' | 'user') {
  return createStore(`${type}-store`, () => {
    if (type === 'admin') {
      return setupAdminStore()
    } else {
      return setupUserStore()
    }
  })
}

function setupAdminStore() {
  const users = ref([])
  const permissions = ref([])

  const addUser = (user: User) => users.value.push(user)
  const removeUser = (id: string) => {
    const index = users.value.findIndex(u => u.id === id)
    if (index > -1) users.value.splice(index, 1)
  }

  return {
    state: { users, permissions },
    actions: { addUser, removeUser },
    getters: {},
  }
}

function setupUserStore() {
  const profile = ref(null)
  const preferences = ref({})

  const updateProfile = (data: any) => (profile.value = data)

  return {
    state: { profile, preferences },
    actions: { updateProfile },
    getters: {},
  }
}
```

## 类型安全

### 强类型 Store

```typescript
interface CounterState {
  count: number
  step: number
}

interface CounterActions {
  increment: () => void
  decrement: () => void
  setStep: (step: number) => void
}

interface CounterGetters {
  doubleCount: number
  isPositive: boolean
}

export const useTypedCounter = createStore<CounterState & CounterActions & CounterGetters>(
  'typed-counter',
  () => {
    const count = ref(0)
    const step = ref(1)

    const increment = () => (count.value += step.value)
    const decrement = () => (count.value -= step.value)
    const setStep = (newStep: number) => (step.value = newStep)

    const doubleCount = computed(() => count.value * 2)
    const isPositive = computed(() => count.value > 0)

    return {
      state: { count, step },
      actions: { increment, decrement, setStep },
      getters: { doubleCount, isPositive },
    }
  }
)
```

## 常见问题

### Q: Hook API 和装饰器 API 有什么区别？

A: Hook API 更适合函数式编程风格，装饰器 API 更适合面向对象风格：

```typescript
// Hook API - 函数式
const useCounter = createStore('counter', () => {
  const count = ref(0)
  const increment = () => count.value++
  return { state: { count }, actions: { increment }, getters: {} }
})

// 装饰器 API - 面向对象
class CounterStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0

  @Action()
  increment() {
    this.count++
  }
}
```

### Q: 如何在 Hook API 中使用持久化？

A: 使用 `usePersist` 或在 `useState` 中设置 `persist` 选项：

```typescript
const useSettings = createStore('settings', () => {
  const [theme] = usePersist('theme', 'light')
  const [lang] = useState('zh-CN', { persist: true })

  return {
    state: { theme, lang },
    actions: {},
    getters: {},
  }
})
```

### Q: Hook API 支持 TypeScript 吗？

A: 完全支持，提供完整的类型推断和类型安全：

```typescript
const useTypedStore = createStore('typed', () => {
  const count = ref<number>(0) // 明确类型
  const items = ref<Item[]>([]) // 泛型支持

  return {
    state: { count, items },
    actions: {},
    getters: {},
  }
})
```

## 下一步

- 学习 [Vue 集成](/api/vue) 了解 Vue 特定功能
- 查看 [工具函数](/api/utils) 了解辅助工具
- 探索 [类型定义](/api/types) 了解完整的类型系统
