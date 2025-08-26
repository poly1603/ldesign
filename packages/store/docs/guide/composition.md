# 组合式 Store

组合式 Store 是 @ldesign/store 提供的最接近 Vue 3 Composition API 风格的状态管理方式。它使用 `setup` 函数来定义状态和逻辑，让 Vue 3 开发者感到非常熟悉和自然。

## 基本用法

使用 `createCompositionStore` 函数创建一个组合式 Store：

```typescript
import { createCompositionStore } from '@ldesign/store'

const useCounterStore = createCompositionStore({
  id: 'counter',
  setup: ({ state, computed }) => {
    // 定义响应式状态
    const count = state(0)
    const name = state('Counter')
    
    // 定义计算属性
    const doubleCount = computed(() => count.value * 2)
    const displayName = computed(() => `${name.value}: ${count.value}`)
    
    // 定义动作方法
    const increment = () => {
      count.value++
    }
    
    const decrement = () => {
      count.value--
    }
    
    const reset = () => {
      count.value = 0
    }
    
    // 返回公开的状态和方法
    return {
      count,
      name,
      doubleCount,
      displayName,
      increment,
      decrement,
      reset
    }
  }
})
```

## 在组件中使用

```vue
<template>
  <div>
    <h2>{{ store.$state.displayName.value }}</h2>
    <p>计数: {{ store.$state.count.value }}</p>
    <p>双倍计数: {{ store.$state.doubleCount.value }}</p>
    
    <button @click="store.$state.increment()">增加</button>
    <button @click="store.$state.decrement()">减少</button>
    <button @click="store.$state.reset()">重置</button>
  </div>
</template>

<script setup lang="ts">
const store = useCounterStore()
</script>
```

## 响应式 API

组合式 Store 提供了完整的 Vue 3 响应式 API：

```typescript
const useDataStore = createCompositionStore({
  id: 'data',
  setup: ({ state, computed, reactive, watch, onUnmounted }) => {
    // ref 状态
    const count = state(0)
    const message = state('Hello')
    
    // reactive 对象
    const user = reactive({
      name: 'John',
      age: 30,
      preferences: {
        theme: 'dark',
        language: 'zh-CN'
      }
    })
    
    // 计算属性
    const userInfo = computed(() => {
      return `${user.name} (${user.age}岁)`
    })
    
    // 监听器
    watch(count, (newValue, oldValue) => {
      console.log(`计数从 ${oldValue} 变为 ${newValue}`)
    })
    
    // 监听对象属性
    watch(() => user.preferences.theme, (theme) => {
      document.body.className = `theme-${theme}`
    })
    
    // 生命周期钩子
    const timer = setInterval(() => {
      count.value++
    }, 1000)
    
    onUnmounted(() => {
      clearInterval(timer)
    })
    
    return {
      count,
      message,
      user,
      userInfo
    }
  }
})
```

## 异步操作

组合式 Store 中的异步操作非常直观：

```typescript
const useUserStore = createCompositionStore({
  id: 'user',
  setup: ({ state, computed }) => {
    const user = state(null)
    const loading = state(false)
    const error = state(null)
    
    // 计算属性
    const isLoggedIn = computed(() => user.value !== null)
    const userName = computed(() => user.value?.name || '未登录')
    
    // 异步动作
    const fetchUser = async (id: number) => {
      loading.value = true
      error.value = null
      
      try {
        const response = await fetch(`/api/users/${id}`)
        if (!response.ok) {
          throw new Error('获取用户信息失败')
        }
        const userData = await response.json()
        user.value = userData
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }
    
    const logout = () => {
      user.value = null
      error.value = null
    }
    
    return {
      user,
      loading,
      error,
      isLoggedIn,
      userName,
      fetchUser,
      logout
    }
  }
})
```

## 组合函数复用

组合式 Store 可以很好地与 Vue 3 的组合函数配合使用：

```typescript
// 可复用的组合函数
function useAsyncState<T>(asyncFn: () => Promise<T>) {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const execute = async () => {
    loading.value = true
    error.value = null
    
    try {
      data.value = await asyncFn()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  return {
    data,
    loading,
    error,
    execute
  }
}

// 在 Store 中使用组合函数
const usePostStore = createCompositionStore({
  id: 'post',
  setup: ({ state }) => {
    const posts = state([])
    const currentPostId = state(null)
    
    // 使用组合函数
    const {
      data: currentPost,
      loading: postLoading,
      error: postError,
      execute: fetchPost
    } = useAsyncState(async () => {
      if (!currentPostId.value) return null
      const response = await fetch(`/api/posts/${currentPostId.value}`)
      return response.json()
    })
    
    const setCurrentPost = (id: number) => {
      currentPostId.value = id
      fetchPost()
    }
    
    return {
      posts,
      currentPost,
      postLoading,
      postError,
      setCurrentPost
    }
  }
})
```

## 持久化配置

```typescript
const useSettingsStore = createCompositionStore({
  id: 'settings',
  setup: ({ state }) => {
    const theme = state('light')
    const language = state('zh-CN')
    const notifications = state(true)
    
    const toggleTheme = () => {
      theme.value = theme.value === 'light' ? 'dark' : 'light'
    }
    
    const setLanguage = (lang: string) => {
      language.value = lang
    }
    
    return {
      theme,
      language,
      notifications,
      toggleTheme,
      setLanguage
    }
  },
  // 持久化配置
  persist: {
    storage: 'localStorage',
    paths: ['theme', 'language', 'notifications']
  }
})
```

## 类型安全

组合式 Store 提供完整的 TypeScript 类型推导：

```typescript
interface User {
  id: number
  name: string
  email: string
}

const useUserStore = createCompositionStore({
  id: 'user',
  setup: ({ state, computed }) => {
    const user = state<User | null>(null)
    const loading = state(false)
    
    const isLoggedIn = computed(() => user.value !== null)
    
    const setUser = (userData: User) => {
      user.value = userData
    }
    
    return {
      user,
      loading,
      isLoggedIn,
      setUser
    }
  }
})

// 类型会被正确推导
const store = useUserStore()
// store.$state.user.value 的类型是 User | null
// store.$state.isLoggedIn.value 的类型是 boolean
```

## 最佳实践

### 1. 合理组织状态

```typescript
// ✅ 好的做法：按功能分组
const useShoppingCartStore = createCompositionStore({
  id: 'cart',
  setup: ({ state, computed }) => {
    // 商品相关状态
    const items = state([])
    const selectedItems = state([])
    
    // UI 相关状态
    const isOpen = state(false)
    const loading = state(false)
    
    // 计算属性
    const totalPrice = computed(() => {
      return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
    })
    
    const itemCount = computed(() => items.value.length)
    
    // 动作方法
    const addItem = (item) => { /* ... */ }
    const removeItem = (id) => { /* ... */ }
    const toggleCart = () => { isOpen.value = !isOpen.value }
    
    return {
      // 状态
      items,
      selectedItems,
      isOpen,
      loading,
      // 计算属性
      totalPrice,
      itemCount,
      // 方法
      addItem,
      removeItem,
      toggleCart
    }
  }
})
```

### 2. 使用组合函数提高复用性

```typescript
// 可复用的分页逻辑
function usePagination(initialPage = 1, initialPageSize = 10) {
  const currentPage = ref(initialPage)
  const pageSize = ref(initialPageSize)
  const total = ref(0)
  
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
  const hasNext = computed(() => currentPage.value < totalPages.value)
  const hasPrev = computed(() => currentPage.value > 1)
  
  const nextPage = () => {
    if (hasNext.value) currentPage.value++
  }
  
  const prevPage = () => {
    if (hasPrev.value) currentPage.value--
  }
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }
  
  return {
    currentPage,
    pageSize,
    total,
    totalPages,
    hasNext,
    hasPrev,
    nextPage,
    prevPage,
    goToPage
  }
}

// 在 Store 中使用
const usePostListStore = createCompositionStore({
  id: 'postList',
  setup: ({ state }) => {
    const posts = state([])
    const loading = state(false)
    
    // 使用分页组合函数
    const pagination = usePagination(1, 20)
    
    const fetchPosts = async () => {
      loading.value = true
      try {
        const response = await fetch(`/api/posts?page=${pagination.currentPage.value}&size=${pagination.pageSize.value}`)
        const data = await response.json()
        posts.value = data.items
        pagination.total.value = data.total
      } finally {
        loading.value = false
      }
    }
    
    return {
      posts,
      loading,
      ...pagination,
      fetchPosts
    }
  }
})
```

## 总结

组合式 Store 是最接近 Vue 3 原生开发体验的状态管理方式，特别适合：

- Vue 3 项目
- 喜欢 Composition API 风格的开发者
- 需要复杂响应式逻辑的场景
- 希望最大化代码复用的项目

通过组合式 Store，你可以充分利用 Vue 3 的响应式系统和组合函数，构建出灵活、可维护的状态管理解决方案。
