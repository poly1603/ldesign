# @ldesign/store

🚀 一个基于 Pinia 的现代化、高性能状态管理库，为 Vue 3 应用提供类型安全、多范式的状态管理解决方案。

[![npm version](https://badge.fury.io/js/@ldesign%2Fstore.svg)](https://badge.fury.io/js/@ldesign%2Fstore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## ✨ 特性亮点

- 🎯 **多种编程范式**: 支持类式、函数式、Composition API 等多种使用方式
- 🔒 **完整类型安全**: 基于 TypeScript，提供严格的类型检查和智能提示
- ⚡ **极致性能优化**: 内置缓存、防抖、节流、状态持久化等性能优化机制
- 🎨 **优雅装饰器**: 提供丰富的装饰器，让代码更简洁优雅
- 🔧 **开发者友好**: 完整的 DevTools 支持、性能监控和调试工具
- 📦 **轻量高效**: 基于 Pinia 构建，体积小巧，性能卓越
- 🌈 **灵活扩展**: 支持插件系统，可根据需求自由扩展功能

## 📦 安装

```bash
# npm
npm install @ldesign/store pinia

# yarn
yarn add @ldesign/store pinia

# pnpm
pnpm add @ldesign/store pinia
```

## 🚀 快速开始

### 基础配置

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

### 🎯 多种使用方式

#### 1️⃣ 类式 Store（面向对象）

```typescript
import { BaseStore } from '@ldesign/store'

class CounterStore extends BaseStore<
  { count: number },
  { increment: () => void; decrement: () => void },
  { doubleCount: number }
> {
  constructor() {
    super('counter', {
      state: () => ({ count: 0 }),
      actions: {
        increment() { this.count++ },
        decrement() { this.count-- }
      },
      getters: {
        doubleCount: (state) => state.count * 2
      }
    })
  }
}

const useCounterStore = () => new CounterStore()
```

#### 2️⃣ 函数式 Store（简洁直观）

```typescript
import { createFunctionalStore } from '@ldesign/store'

const useCounterStore = createFunctionalStore({
  id: 'counter',
  state: () => ({ count: 0 }),
  actions: {
    increment() { this.count++ },
    decrement() { this.count-- }
  },
  getters: {
    doubleCount: (state) => state.count * 2
  },
  // 性能优化配置
  cache: { maxSize: 100, defaultTTL: 5000 },
  persist: { storage: localStorage }
})
```

#### 3️⃣ Composition API Store（现代化）

```typescript
import { createCompositionStore } from '@ldesign/store'

const useCounterStore = createCompositionStore(
  { id: 'counter' },
  ({ state, computed }) => {
    const count = state(0)
    const doubleCount = computed(() => count.value * 2)

    const increment = () => count.value++
    const decrement = () => count.value--

    return { count, doubleCount, increment, decrement }
  }
)
```

### 🎨 在组件中使用

```vue
<template>
  <div class="counter">
    <h2>计数器: {{ store.count }}</h2>
    <p>双倍值: {{ store.doubleCount }}</p>
    <div class="buttons">
      <button @click="store.increment" class="btn-primary">➕ 增加</button>
      <button @click="store.decrement" class="btn-secondary">➖ 减少</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const store = useCounterStore()
</script>
```

## 🎨 装饰器魔法

让你的代码更加优雅和强大：

```typescript
import { BaseStore, State, Action, Getter, Cache, Debounce, Throttle } from '@ldesign/store'

class UserStore extends BaseStore {
  @State()
  users: User[] = []

  @State({ reactive: true })
  currentUser: User | null = null

  @State({ readonly: true })
  readonly config = { apiUrl: '/api/users' }

  // 🚀 缓存 API 调用结果 5 秒
  @Action()
  @Cache({ ttl: 5000 })
  async fetchUsers() {
    const response = await fetch(this.config.apiUrl)
    this.users = await response.json()
  }

  // ⏰ 防抖搜索，避免频繁请求
  @Action()
  @Debounce(300)
  async searchUsers(query: string) {
    const response = await fetch(`${this.config.apiUrl}?q=${query}`)
    this.users = await response.json()
  }

  // 🎯 节流更新，控制更新频率
  @Action()
  @Throttle(1000)
  updateUserStatus(userId: string, status: string) {
    const user = this.users.find(u => u.id === userId)
    if (user) user.status = status
  }

  // 💾 缓存计算结果
  @Getter()
  @Cache()
  get activeUsers() {
    return this.users.filter(user => user.active)
  }

  @Getter()
  get usersByRole() {
    return (role: string) => this.users.filter(user => user.role === role)
  }
}
```

## ⚡ 性能优化特性

### 智能缓存系统

```typescript
const useDataStore = createFunctionalStore({
  id: 'data',
  state: () => ({ items: [], loading: false }),

  // 🎯 配置缓存策略
  cache: {
    maxSize: 100,        // 最大缓存条目
    defaultTTL: 5000,    // 默认过期时间
    cleanupInterval: 60000 // 清理间隔
  },

  actions: {
    async fetchData(params: any) {
      const cacheKey = `fetchData:${JSON.stringify(params)}`

      // 检查缓存
      const cached = this.$getCache(cacheKey)
      if (cached) return cached

      // 获取数据并缓存
      this.loading = true
      try {
        const data = await api.getData(params)
        this.$setCache(cacheKey, data, 10000) // 缓存 10 秒
        this.items = data
        return data
      } finally {
        this.loading = false
      }
    }
  }
})
```

### 状态持久化

```typescript
const useSettingsStore = createFunctionalStore({
  id: 'settings',
  state: () => ({
    theme: 'light',
    language: 'zh-CN',
    preferences: {}
  }),

  // 💾 持久化配置
  persist: {
    storage: localStorage,
    paths: ['theme', 'language'], // 只持久化指定字段
    serializer: {
      serialize: JSON.stringify,
      deserialize: JSON.parse
    }
  }
})
```

## 🏭 Store 工厂模式

统一管理多个 Store 实例：

```typescript
import { StoreFactory, StoreType } from '@ldesign/store'

// 创建不同类型的 Store
const userStoreFactory = StoreFactory.create({
  type: StoreType.CLASS,
  id: 'user',
  storeClass: UserStore
})

const settingsStoreFactory = StoreFactory.create({
  type: StoreType.FUNCTIONAL,
  id: 'settings',
  state: () => ({ theme: 'light' }),
  actions: { toggleTheme() { this.theme = this.theme === 'light' ? 'dark' : 'light' } }
})

// 获取 Store 实例
const userStore = userStoreFactory()
const settingsStore = settingsStoreFactory()

// 工厂管理
console.log(StoreFactory.getIds()) // ['user', 'settings']
console.log(StoreFactory.getStats()) // { totalStores: 2, activeInstances: 2 }
```

## 🎯 最佳实践

### 1. Store 设计原则

```typescript
// ✅ 好的设计
class UserStore extends BaseStore {
  // 单一职责：只管理用户相关状态
  @State() users: User[] = []
  @State() currentUser: User | null = null

  @Action() async fetchUsers() { /* ... */ }
  @Action() async updateUser(user: User) { /* ... */ }
}

// ❌ 避免的设计
class AppStore extends BaseStore {
  // 职责过多：混合了用户、设置、通知等
  @State() users: User[] = []
  @State() settings: Settings = {}
  @State() notifications: Notification[] = []
}
```

### 2. 类型安全实践

```typescript
// 定义严格的接口
interface UserState {
  users: User[]
  loading: boolean
  error: string | null
}

interface UserActions {
  fetchUsers(): Promise<void>
  addUser(user: Omit<User, 'id'>): Promise<User>
  removeUser(id: string): Promise<void>
}

interface UserGetters {
  activeUsers: User[]
  userCount: number
  getUserById: (id: string) => User | undefined
}

// 使用严格类型约束
class UserStore extends BaseStore<UserState, UserActions, UserGetters> {
  // TypeScript 会确保实现符合接口定义
}
```

### 3. 性能优化策略

```typescript
class OptimizedStore extends BaseStore {
  // 🎯 合理使用缓存
  @Getter()
  @Cache({ ttl: 5000 }) // 缓存 5 秒
  get expensiveComputation() {
    return this.data.reduce((acc, item) => acc + item.value, 0)
  }

  // ⏰ 防抖频繁操作
  @Action()
  @Debounce(300)
  async search(query: string) {
    // 避免频繁搜索请求
  }

  // 🚀 节流高频更新
  @Action()
  @Throttle(100)
  updatePosition(x: number, y: number) {
    // 控制位置更新频率
  }
}
```

## 📚 完整示例

查看 `examples` 目录获取更多示例：

- 🌟 [基础用法示例](./examples/basic) - 快速上手
- 🚀 [高级功能示例](./examples/advanced) - 装饰器和性能优化
- ⚡ [性能优化示例](./examples/performance) - 缓存和持久化
- 🔧 [TypeScript 集成](./examples/typescript) - 类型安全实践
- 🎨 [Vue 3 完整应用](./examples/vue-app) - 真实项目示例

## 🤝 贡献

我们欢迎所有形式的贡献！

1. 🍴 Fork 项目
2. 🌟 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 💾 提交更改 (`git commit -m 'Add amazing feature'`)
4. 📤 推送分支 (`git push origin feature/amazing-feature`)
5. 🎉 创建 Pull Request

查看 [贡献指南](./CONTRIBUTING.md) 了解更多详情。

## 📄 许可证

MIT License © 2024 - 查看 [LICENSE](./LICENSE) 文件了解详细信息。

---

<div align="center">

**如果这个项目对你有帮助，请给我们一个 ⭐️**

[🏠 首页](https://github.com/ldesign/store) • [📖 文档](./docs) • [🐛 问题反馈](https://github.com/ldesign/store/issues) • [💬 讨论](https://github.com/ldesign/store/discussions)

</div>
