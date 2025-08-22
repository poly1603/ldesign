# Hook 使用指南

Hook 使用方式提供了函数式的状态管理方法，类似于 React Hooks，让你可以用更简洁的方式创建和使用状态。

## 基础 Hook 使用

### createStore Hook

`createStore` 是创建 Hook 式 Store 的核心函数：

```typescript
import { createStore } from '@ldesign/store'
import { computed, ref } from 'vue'

// 创建计数器 Hook
export const useCounter = createStore('counter', () => {
  // 状态
  const count = ref(0)
  const step = ref(1)

  // 动作
  const increment = () => (count.value += step.value)
  const decrement = () => (count.value -= step.value)
  const reset = () => (count.value = 0)
  const setStep = (newStep: number) => (step.value = Math.max(1, newStep))

  // 计算属性
  const displayText = computed(() => `Count: ${count.value}`)
  const isPositive = computed(() => count.value > 0)
  const isNegative = computed(() => count.value < 0)

  return {
    state: { count, step },
    actions: { increment, decrement, reset, setStep },
    getters: { displayText, isPositive, isNegative },
  }
})
```

### 在组件中使用

```vue
<script setup lang="ts">
import { useCounter } from '@/stores/useCounter'

const counter = useCounter()
</script>

<template>
  <div class="counter">
    <h2>{{ counter.getters.displayText }}</h2>
    <p>当前计数: {{ counter.state.count }}</p>
    <p v-if="counter.getters.isPositive" class="positive">正数</p>
    <p v-if="counter.getters.isNegative" class="negative">负数</p>

    <div class="controls">
      <label>
        步长:
        <input v-model.number="counter.state.step" type="number" min="1" max="10" />
      </label>

      <div class="buttons">
        <button @click="counter.actions.decrement">-{{ counter.state.step }}</button>
        <button @click="counter.actions.reset">重置</button>
        <button @click="counter.actions.increment">+{{ counter.state.step }}</button>
      </div>
    </div>
  </div>
</template>
```

## 复杂状态管理

### 待办事项 Hook

```typescript
import { createStore } from '@ldesign/store'
import { computed, ref } from 'vue'

interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: Date
  priority: 'low' | 'medium' | 'high'
}

export const useTodos = createStore('todos', () => {
  // 状态
  const todos = ref<Todo[]>([])
  const filter = ref<'all' | 'active' | 'completed'>('all')
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 动作
  const addTodo = (text: string, priority: Todo['priority'] = 'medium') => {
    if (text.trim()) {
      todos.value.push({
        id: Date.now(),
        text: text.trim(),
        completed: false,
        createdAt: new Date(),
        priority,
      })
    }
  }

  const toggleTodo = (id: number) => {
    const todo = todos.value.find(t => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
    }
  }

  const removeTodo = (id: number) => {
    const index = todos.value.findIndex(t => t.id === id)
    if (index > -1) {
      todos.value.splice(index, 1)
    }
  }

  const updateTodo = (id: number, updates: Partial<Todo>) => {
    const todo = todos.value.find(t => t.id === id)
    if (todo) {
      Object.assign(todo, updates)
    }
  }

  const setFilter = (newFilter: typeof filter.value) => {
    filter.value = newFilter
  }

  const clearCompleted = () => {
    todos.value = todos.value.filter(todo => !todo.completed)
  }

  const markAllCompleted = () => {
    const hasIncomplete = todos.value.some(todo => !todo.completed)
    todos.value.forEach(todo => {
      todo.completed = hasIncomplete
    })
  }

  // 异步动作
  const fetchTodos = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/api/todos')
      if (!response.ok) throw new Error('获取待办事项失败')

      const data = await response.json()
      todos.value = data.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
      }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
    } finally {
      loading.value = false
    }
  }

  const saveTodos = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todos.value),
      })

      if (!response.ok) throw new Error('保存失败')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '保存失败'
    } finally {
      loading.value = false
    }
  }

  // 计算属性
  const filteredTodos = computed(() => {
    switch (filter.value) {
      case 'active':
        return todos.value.filter(todo => !todo.completed)
      case 'completed':
        return todos.value.filter(todo => todo.completed)
      default:
        return todos.value
    }
  })

  const totalCount = computed(() => todos.value.length)
  const activeCount = computed(() => todos.value.filter(todo => !todo.completed).length)
  const completedCount = computed(() => todos.value.filter(todo => todo.completed).length)

  const todosByPriority = computed(() => {
    return todos.value.reduce((acc, todo) => {
      if (!acc[todo.priority]) acc[todo.priority] = []
      acc[todo.priority].push(todo)
      return acc
    }, {} as Record<Todo['priority'], Todo[]>)
  })

  const completionRate = computed(() => {
    if (totalCount.value === 0) return 0
    return Math.round((completedCount.value / totalCount.value) * 100)
  })

  const hasCompleted = computed(() => completedCount.value > 0)
  const allCompleted = computed(() => totalCount.value > 0 && activeCount.value === 0)

  return {
    state: {
      todos,
      filter,
      loading,
      error,
    },
    actions: {
      addTodo,
      toggleTodo,
      removeTodo,
      updateTodo,
      setFilter,
      clearCompleted,
      markAllCompleted,
      fetchTodos,
      saveTodos,
    },
    getters: {
      filteredTodos,
      totalCount,
      activeCount,
      completedCount,
      todosByPriority,
      completionRate,
      hasCompleted,
      allCompleted,
    },
  }
})
```

### 用户认证 Hook

```typescript
import { createStore } from '@ldesign/store'
import { computed, ref } from 'vue'

interface User {
  id: number
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'user'
}

interface LoginCredentials {
  email: string
  password: string
}

export const useAuth = createStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))

  // 动作
  const setUser = (newUser: User | null) => {
    user.value = newUser
  }

  const setToken = (newToken: string | null) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('auth_token', newToken)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  const setError = (newError: string | null) => {
    error.value = newError
  }

  const clearError = () => {
    error.value = null
  }

  // 异步动作
  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    clearError()

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        throw new Error('登录失败')
      }

      const data = await response.json()
      setUser(data.user)
      setToken(data.token)

      return data.user
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登录失败'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true

    try {
      if (token.value) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        })
      }
    } catch (err) {
      console.error('登出请求失败:', err)
    } finally {
      setUser(null)
      setToken(null)
      clearError()
      loading.value = false
    }
  }

  const register = async (userData: Omit<User, 'id'> & { password: string }) => {
    loading.value = true
    clearError()

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        throw new Error('注册失败')
      }

      const data = await response.json()
      setUser(data.user)
      setToken(data.token)

      return data.user
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '注册失败'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user.value || !token.value) {
      throw new Error('用户未登录')
    }

    loading.value = true
    clearError()

    try {
      const response = await fetch(`/api/users/${user.value.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('更新失败')
      }

      const updatedUser = await response.json()
      setUser({ ...user.value, ...updatedUser })

      return updatedUser
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新失败'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const checkAuth = async () => {
    if (!token.value) return false

    loading.value = true

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        return true
      } else {
        // Token 无效，清除认证信息
        setUser(null)
        setToken(null)
        return false
      }
    } catch (err) {
      console.error('检查认证状态失败:', err)
      setUser(null)
      setToken(null)
      return false
    } finally {
      loading.value = false
    }
  }

  // 计算属性
  const isLoggedIn = computed(() => user.value !== null && token.value !== null)
  const userName = computed(() => user.value?.name || '游客')
  const userEmail = computed(() => user.value?.email || '')
  const userRole = computed(() => user.value?.role || 'user')
  const isAdmin = computed(() => userRole.value === 'admin')
  const userAvatar = computed(() => {
    if (user.value?.avatar) return user.value.avatar
    if (user.value?.name) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.value.name
      )}&background=random`
    }
    return '/default-avatar.png'
  })

  const hasError = computed(() => error.value !== null)

  return {
    state: {
      user,
      loading,
      error,
      token,
    },
    actions: {
      login,
      logout,
      register,
      updateProfile,
      checkAuth,
      setUser,
      setToken,
      setError,
      clearError,
    },
    getters: {
      isLoggedIn,
      userName,
      userEmail,
      userRole,
      isAdmin,
      userAvatar,
      hasError,
    },
  }
})
```

## 工具 Hooks

### createState - 简单状态

```typescript
import { createState } from '@ldesign/store'

// 创建简单的状态 Hook
export const useTheme = createState<'light' | 'dark'>('light')

// 使用
const theme = useTheme()
theme.setValue('dark')
console.log(theme.value) // 'dark'
theme.reset() // 重置为 'light'
```

### createAsyncAction - 异步操作

```typescript
import { createAsyncAction } from '@ldesign/store'

// 创建异步操作 Hook
export const useFetchUser = createAsyncAction(async (userId: number) => {
  const response = await fetch(`/api/users/${userId}`)
  if (!response.ok) throw new Error('获取用户失败')
  return response.json()
})

// 使用
const fetchUser = useFetchUser()

// 执行异步操作
async function handleFetch() {
  try {
    const user = await fetchUser.execute(123)
    console.log('用户数据:', user)
  } catch (error) {
    console.error('错误:', fetchUser.error.value)
  }
}

// 响应式状态
console.log('加载中:', fetchUser.loading.value)
console.log('数据:', fetchUser.data.value)
console.log('错误:', fetchUser.error.value)
```

### createPersistedState - 持久化状态

```typescript
import { createPersistedState } from '@ldesign/store'

// 创建持久化状态
export const useSettings = createPersistedState('app-settings', {
  theme: 'light',
  language: 'zh-CN',
  notifications: true,
})

// 使用
const settings = useSettings()

// 自动持久化到 localStorage
settings.setValue({
  theme: 'dark',
  language: 'en-US',
  notifications: false,
})

// 手动操作
settings.save() // 保存到存储
settings.load() // 从存储加载
settings.clear() // 清除存储
```

## Hook 组合

### 组合多个 Hooks

```typescript
// 组合认证和用户偏好
export function useUserSession() {
  const auth = useAuth()
  const settings = useSettings()

  // 组合计算属性
  const userTheme = computed(() => {
    if (auth.getters.isLoggedIn.value) {
      return settings.value.value.theme
    }
    return 'light'
  })

  // 组合动作
  const loginAndLoadSettings = async (credentials: LoginCredentials) => {
    await auth.actions.login(credentials)
    if (auth.getters.isLoggedIn.value) {
      // 登录后加载用户设置
      settings.load()
    }
  }

  const logoutAndClearSettings = async () => {
    await auth.actions.logout()
    settings.clear()
  }

  return {
    // 暴露子 hooks
    auth,
    settings,

    // 组合的计算属性
    userTheme,

    // 组合的动作
    loginAndLoadSettings,
    logoutAndClearSettings,
  }
}
```

### 自定义 Hook 工厂

```typescript
// 创建通用的列表管理 Hook
export function createListHook<T>(
  name: string,
  fetchFn: () => Promise<T[]>,
  createFn?: (item: Omit<T, 'id'>) => Promise<T>,
  updateFn?: (id: string, updates: Partial<T>) => Promise<T>,
  deleteFn?: (id: string) => Promise<void>
) {
  return createStore(name, () => {
    const items = ref<T[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchItems = async () => {
      loading.value = true
      error.value = null

      try {
        items.value = await fetchFn()
      } catch (err) {
        error.value = err instanceof Error ? err.message : '获取失败'
      } finally {
        loading.value = false
      }
    }

    const createItem = async (itemData: Omit<T, 'id'>) => {
      if (!createFn) throw new Error('创建功能未实现')

      loading.value = true
      try {
        const newItem = await createFn(itemData)
        items.value.push(newItem)
        return newItem
      } finally {
        loading.value = false
      }
    }

    const updateItem = async (id: string, updates: Partial<T>) => {
      if (!updateFn) throw new Error('更新功能未实现')

      loading.value = true
      try {
        const updatedItem = await updateFn(id, updates)
        const index = items.value.findIndex((item: any) => item.id === id)
        if (index > -1) {
          items.value[index] = updatedItem
        }
        return updatedItem
      } finally {
        loading.value = false
      }
    }

    const deleteItem = async (id: string) => {
      if (!deleteFn) throw new Error('删除功能未实现')

      loading.value = true
      try {
        await deleteFn(id)
        const index = items.value.findIndex((item: any) => item.id === id)
        if (index > -1) {
          items.value.splice(index, 1)
        }
      } finally {
        loading.value = false
      }
    }

    return {
      state: { items, loading, error },
      actions: { fetchItems, createItem, updateItem, deleteItem },
      getters: {
        count: computed(() => items.value.length),
        hasItems: computed(() => items.value.length > 0),
        hasError: computed(() => error.value !== null),
      },
    }
  })
}

// 使用工厂创建具体的 Hook
export const useProducts = createListHook(
  'products',
  () => productApi.getAll(),
  data => productApi.create(data),
  (id, updates) => productApi.update(id, updates),
  id => productApi.delete(id)
)
```

## 最佳实践

### 1. Hook 命名规范

```typescript
// ✅ 好的命名
export const useCounter = createStore('counter', () => {
  /* ... */
})
export const useAuth = createStore('auth', () => {
  /* ... */
})
export const useTodos = createStore('todos', () => {
  /* ... */
})

// ❌ 不好的命名
export const counter = createStore('counter', () => {
  /* ... */
})
export const authStore = createStore('auth', () => {
  /* ... */
})
```

### 2. 状态结构

```typescript
// ✅ 清晰的状态结构
return {
  state: {
    /* 响应式状态 */
  },
  actions: {
    /* 动作方法 */
  },
  getters: {
    /* 计算属性 */
  },
}

// ❌ 混乱的结构
return {
  count,
  increment,
  displayText,
  loading,
  fetchData,
}
```

### 3. 错误处理

```typescript
// ✅ 统一的错误处理
async function fetchData() {
  loading.value = true
  error.value = null

  try {
    data.value = await api.getData()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '未知错误'
    console.error('获取数据失败:', err)
  } finally {
    loading.value = false
  }
}
```

## 下一步

- 学习 [Provider 模式](/guide/provider) 了解依赖注入
- 查看 [性能优化](/guide/performance) 提升应用性能
- 探索 [最佳实践](/guide/best-practices) 编写更好的代码
