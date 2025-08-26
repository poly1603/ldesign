# 快速开始

本指南将帮助你快速上手 @ldesign/store，并了解其核心概念和基本用法。

## 安装

```bash
# 使用 npm
npm install @ldesign/store

# 使用 yarn
yarn add @ldesign/store

# 使用 pnpm
pnpm add @ldesign/store
```

## 基础用法

### 1. 创建 Store

```typescript
import { defineStore } from '@ldesign/store'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Counter'
  }),
  
  getters: {
    doubleCount: (state) => state.count * 2,
    
    greeting(): string {
      return `Hello, ${this.name}!`
    }
  },
  
  actions: {
    increment() {
      this.count++
    },
    
    decrement() {
      this.count--
    },
    
    async incrementAsync() {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.increment()
    }
  }
})
```

### 2. 在组件中使用

```vue
<template>
  <div>
    <h2>{{ store.greeting }}</h2>
    <p>Count: {{ store.count }}</p>
    <p>Double Count: {{ store.doubleCount }}</p>
    
    <button @click="store.increment()">+</button>
    <button @click="store.decrement()">-</button>
    <button @click="store.incrementAsync()">Async +</button>
  </div>
</template>

<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'

const store = useCounterStore()
</script>
```

## 高级功能

### 装饰器风格

```typescript
import { Store, State, Action, Getter } from '@ldesign/store'

@Store('user')
export class UserStore {
  @State
  users: User[] = []
  
  @State
  loading = false
  
  @Getter
  get activeUsers() {
    return this.users.filter(user => user.active)
  }
  
  @Action
  async fetchUsers() {
    this.loading = true
    try {
      this.users = await api.getUsers()
    } finally {
      this.loading = false
    }
  }
  
  @Action
  addUser(user: User) {
    this.users.push(user)
  }
}
```

### 性能优化

```typescript
import { defineStore, debounced, cached } from '@ldesign/store'

export const useSearchStore = defineStore('search', {
  state: () => ({
    query: '',
    results: [],
    cache: new Map()
  }),
  
  actions: {
    // 防抖搜索
    @debounced(300)
    async search(query: string) {
      this.query = query
      this.results = await this.performSearch(query)
    },
    
    // 缓存搜索结果
    @cached
    async performSearch(query: string) {
      const response = await api.search(query)
      return response.data
    }
  }
})
```

### 数据持久化

```typescript
export const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: 'light',
    language: 'zh-CN',
    autoSave: true
  }),
  
  // 启用持久化
  persist: {
    enabled: true,
    storage: 'localStorage',
    key: 'app-settings'
  },
  
  actions: {
    updateTheme(theme: string) {
      this.theme = theme
      // 自动保存到 localStorage
    }
  }
})
```

### 实时同步

```typescript
export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [],
    connected: false
  }),
  
  // WebSocket 同步
  sync: {
    enabled: true,
    type: 'websocket',
    url: 'ws://localhost:8080/chat'
  },
  
  actions: {
    sendMessage(message: string) {
      const msg = {
        id: Date.now(),
        text: message,
        timestamp: new Date()
      }
      
      this.messages.push(msg)
      // 自动通过 WebSocket 同步到其他客户端
    }
  }
})
```

## 最佳实践

### 1. Store 组织

```typescript
// stores/index.ts
export { useUserStore } from './user'
export { useProductStore } from './product'
export { useCartStore } from './cart'

// 在组件中统一导入
import { useUserStore, useProductStore } from '@/stores'
```

### 2. 类型定义

```typescript
// types/store.ts
export interface User {
  id: number
  name: string
  email: string
  active: boolean
}

export interface Product {
  id: number
  name: string
  price: number
  category: string
}

// stores/user.ts
import type { User } from '@/types/store'

export const useUserStore = defineStore('user', {
  state: (): { users: User[] } => ({
    users: []
  })
})
```

### 3. 错误处理

```typescript
export const useApiStore = defineStore('api', {
  state: () => ({
    loading: false,
    error: null as string | null
  }),
  
  actions: {
    async fetchData() {
      this.loading = true
      this.error = null
      
      try {
        const data = await api.getData()
        return data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
```

## 下一步

- 查看 [示例页面](/examples/) 了解更多用法
- 阅读 [API 参考](/api/) 了解详细接口
- 探索 [高级功能](/examples/enterprise) 了解企业级特性

## 常见问题

### Q: 如何在 TypeScript 中获得更好的类型支持？

A: 确保在 `tsconfig.json` 中启用装饰器支持：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Q: 如何调试 Store 状态？

A: 使用 Vue DevTools 或者在 actions 中添加日志：

```typescript
actions: {
  increment() {
    console.log('Before:', this.count)
    this.count++
    console.log('After:', this.count)
  }
}
```

### Q: 如何测试 Store？

A: 使用 Vitest 或其他测试框架：

```typescript
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from '@/stores/counter'

describe('Counter Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  it('should increment count', () => {
    const store = useCounterStore()
    store.increment()
    expect(store.count).toBe(1)
  })
})
```
