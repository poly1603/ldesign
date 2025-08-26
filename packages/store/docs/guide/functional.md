# 函数式 Store

函数式 Store 是 @ldesign/store 提供的一种简洁、直观的状态管理方式。它使用函数式 API 来定义状态、动作和计算属性，非常适合喜欢函数式编程风格的开发者。

## 基本用法

使用 `createFunctionalStore` 函数创建一个函数式 Store：

```typescript
import { createFunctionalStore } from '@ldesign/store'

const useCounterStore = createFunctionalStore({
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
```

## 在组件中使用

```vue
<template>
  <div>
    <h2>{{ store.displayName }}</h2>
    <p>计数: {{ store.$state.count }}</p>
    <p>双倍计数: {{ store.doubleCount }}</p>
    
    <button @click="store.increment()">增加</button>
    <button @click="store.decrement()">减少</button>
    <button @click="store.reset()">重置</button>
  </div>
</template>

<script setup lang="ts">
const store = useCounterStore()
</script>
```

## 类型安全

函数式 Store 提供完整的 TypeScript 类型支持：

```typescript
interface CounterState {
  count: number
  name: string
}

interface CounterActions {
  increment: () => void
  decrement: () => void
  reset: () => void
}

interface CounterGetters {
  doubleCount: number
  displayName: string
}

const useCounterStore = createFunctionalStore<
  CounterState,
  CounterActions,
  CounterGetters
>({
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
```

## 异步动作

函数式 Store 支持异步动作：

```typescript
const useUserStore = createFunctionalStore({
  id: 'user',
  state: () => ({
    user: null,
    loading: false,
    error: null
  }),
  actions: {
    async fetchUser(id: number) {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(`/api/users/${id}`)
        const user = await response.json()
        this.user = user
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    
    clearUser() {
      this.user = null
      this.error = null
    }
  },
  getters: {
    isLoggedIn: (state) => state.user !== null,
    userName: (state) => state.user?.name || '未登录'
  }
})
```

## 配置选项

函数式 Store 支持多种配置选项：

### 持久化

```typescript
const useSettingsStore = createFunctionalStore({
  id: 'settings',
  state: () => ({
    theme: 'light',
    language: 'zh-CN'
  }),
  // 持久化配置
  persist: {
    storage: 'localStorage',
    paths: ['theme', 'language']
  },
  actions: {
    setTheme(theme: string) {
      this.theme = theme
    },
    setLanguage(language: string) {
      this.language = language
    }
  }
})
```

### 性能优化

```typescript
const useDataStore = createFunctionalStore({
  id: 'data',
  state: () => ({
    items: [],
    searchKeyword: ''
  }),
  actions: {
    // 防抖搜索
    search: {
      handler(keyword: string) {
        this.searchKeyword = keyword
        // 执行搜索逻辑
      },
      debounce: 300
    },
    
    // 节流更新
    updatePosition: {
      handler(x: number, y: number) {
        // 更新位置
      },
      throttle: 100
    }
  },
  getters: {
    // 缓存计算结果
    filteredItems: {
      get: (state) => {
        return state.items.filter(item => 
          item.name.includes(state.searchKeyword)
        )
      },
      cache: { ttl: 5000 } // 缓存 5 秒
    }
  }
})
```

## 最佳实践

### 1. 合理的状态结构

```typescript
// ✅ 好的做法：扁平化状态结构
const useUserStore = createFunctionalStore({
  id: 'user',
  state: () => ({
    id: null,
    name: '',
    email: '',
    avatar: '',
    isLoading: false,
    error: null
  })
})

// ❌ 避免：过度嵌套
const useUserStore = createFunctionalStore({
  id: 'user',
  state: () => ({
    user: {
      profile: {
        personal: {
          name: '',
          email: ''
        }
      }
    },
    ui: {
      loading: {
        profile: false
      }
    }
  })
})
```

### 2. 动作命名规范

```typescript
const usePostStore = createFunctionalStore({
  id: 'post',
  state: () => ({
    posts: [],
    currentPost: null
  }),
  actions: {
    // ✅ 使用动词开头
    fetchPosts() { /* ... */ },
    createPost(post) { /* ... */ },
    updatePost(id, updates) { /* ... */ },
    deletePost(id) { /* ... */ },
    
    // ✅ 清晰的状态设置
    setCurrentPost(post) { /* ... */ },
    clearCurrentPost() { /* ... */ }
  }
})
```

### 3. 计算属性优化

```typescript
const useShoppingCartStore = createFunctionalStore({
  id: 'cart',
  state: () => ({
    items: []
  }),
  getters: {
    // ✅ 简单的计算属性
    itemCount: (state) => state.items.length,
    
    // ✅ 复杂计算使用缓存
    totalPrice: {
      get: (state) => {
        return state.items.reduce((total, item) => {
          return total + item.price * item.quantity
        }, 0)
      },
      cache: { ttl: 1000 }
    }
  }
})
```

## 与其他方式的比较

| 特性 | 函数式 Store | 类式 Store | 组合式 Store |
|------|-------------|------------|-------------|
| 学习曲线 | 低 | 中 | 中 |
| 类型安全 | 优秀 | 优秀 | 优秀 |
| 代码简洁性 | 高 | 中 | 高 |
| 装饰器支持 | 无 | 有 | 无 |
| Vue 3 风格 | 中 | 低 | 高 |
| 适用场景 | 中小型项目 | 大型项目 | Vue 3 项目 |

## 总结

函数式 Store 是一种简洁、直观的状态管理方式，特别适合：

- 中小型项目
- 喜欢函数式编程风格的开发者
- 需要快速原型开发的场景
- 不需要复杂装饰器功能的项目

通过合理使用函数式 Store，你可以构建出高效、可维护的状态管理解决方案。
