# API 参考

@ldesign/store 提供了丰富的 API 来满足不同的状态管理需求。

## 核心 API

### [Store API](./store)
核心的 Store 创建和管理 API。

### [装饰器 API](./decorators)
装饰器风格的状态管理 API。

### [工具函数](./utils)
实用的工具函数和辅助方法。

## API 分类

### 状态管理
- `defineStore()` - 定义 Store
- `useStore()` - 使用 Store
- `createPinia()` - 创建 Pinia 实例

### 装饰器
- `@Store()` - Store 类装饰器
- `@State()` - 状态属性装饰器
- `@Action()` - 动作方法装饰器
- `@Getter()` - 计算属性装饰器

### 性能优化
- `@Debounced()` - 防抖装饰器
- `@Throttled()` - 节流装饰器
- `@Cached()` - 缓存装饰器
- `@Memoized()` - 记忆化装饰器

### 持久化
- `@Persistent()` - 持久化装饰器
- `createPersistencePlugin()` - 创建持久化插件
- `StorageAdapter` - 存储适配器接口

### 实时同步
- `@Realtime()` - 实时同步装饰器
- `WebSocketManager` - WebSocket 管理器
- `createRealtimePlugin()` - 创建实时同步插件

## 类型定义

### 基础类型
```typescript
interface StoreDefinition {
  id: string
  state: () => any
  getters?: Record<string, any>
  actions?: Record<string, any>
}

interface StoreOptions {
  persist?: PersistOptions
  realtime?: RealtimeOptions
  plugins?: Plugin[]
}
```

### 装饰器类型
```typescript
interface StoreMetadata {
  id: string
  states: string[]
  actions: string[]
  getters: string[]
}

interface DecoratorOptions {
  cache?: boolean
  debounce?: number
  throttle?: number
}
```

## 使用示例

### 基础用法
```typescript
import { defineStore } from '@ldesign/store'

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++
    }
  }
})
```

### 装饰器用法
```typescript
import { Store, State, Action } from '@ldesign/store'

@Store('counter')
export class CounterStore {
  @State count = 0
  
  @Action
  increment() {
    this.count++
  }
}
```

## 配置选项

### 全局配置
```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createStorePlugin } from '@ldesign/store'

const app = createApp(App)
const pinia = createPinia()

pinia.use(createStorePlugin({
  // 全局配置选项
  devtools: true,
  persistence: {
    enabled: true,
    storage: 'localStorage'
  }
}))

app.use(pinia)
```

### Store 配置
```typescript
export const useUserStore = defineStore('user', {
  state: () => ({ users: [] }),
  
  // Store 特定配置
  persist: {
    enabled: true,
    key: 'user-store',
    storage: 'sessionStorage'
  },
  
  realtime: {
    enabled: true,
    url: 'ws://localhost:8080'
  }
})
```

## 最佳实践

1. **命名规范**: 使用 `use` 前缀命名 Store
2. **类型安全**: 始终使用 TypeScript
3. **模块化**: 按功能划分 Store
4. **性能优化**: 合理使用缓存和防抖
5. **错误处理**: 添加适当的错误处理逻辑

## 迁移指南

从其他状态管理库迁移到 @ldesign/store 的指南和最佳实践。

## 常见问题

### Q: 如何在 TypeScript 中获得更好的类型支持？
A: 确保在 `tsconfig.json` 中启用装饰器支持。

### Q: 如何调试 Store 状态？
A: 使用 Vue DevTools 或在 actions 中添加日志。

### Q: 如何测试 Store？
A: 使用 Vitest 或其他测试框架进行单元测试。
