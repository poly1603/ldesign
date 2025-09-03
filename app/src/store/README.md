# Store 状态管理插件

这个模块为 LDesign Demo 应用提供了完整的状态管理功能，基于 `@ldesign/store` 包实现。

## 功能特性

### 🏗️ 核心功能
- **多种 Store 模式**: 支持装饰器、函数式、组合式三种创建方式
- **基于 Pinia**: 使用现代化的 Vue 状态管理库
- **TypeScript 支持**: 完整的类型安全保障
- **性能优化**: 内置缓存和性能优化机制
- **持久化存储**: 可选的状态持久化功能

### 🔌 Engine 集成
- **插件化架构**: 通过 `createStoreEnginePlugin` 集成到 LDesign Engine
- **自动安装**: 自动配置 Pinia 和相关依赖
- **全局注入**: 提供 `$store` 全局属性
- **事件系统**: 支持 store 创建和销毁事件
- **性能监控**: 可选的性能监控功能

## 使用方法

### 基础配置

```typescript
import { createStoreEnginePlugin } from '@ldesign/store'

const storePlugin = createStoreEnginePlugin({
  storeConfig: {
    enablePerformanceOptimization: true,
    enablePersistence: false,
    debug: process.env.NODE_ENV === 'development'
  },
  globalPropertyName: '$store',
  enablePerformanceMonitoring: true
})
```

### 在 Engine 中使用

```typescript
import { createAndMountApp } from '@ldesign/engine'
import { storePlugin } from './store'

const engine = createAndMountApp(App, '#app', {
  plugins: [storePlugin]
})
```

### 创建 Store

#### 函数式 Store
```typescript
import { createFunctionalStore } from '@ldesign/store'

const counterStore = createFunctionalStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++
    },
    decrement() {
      this.count--
    }
  }
})
```

#### 组合式 Store
```typescript
import { createCompositionStore } from '@ldesign/store'

const userStore = createCompositionStore('user', () => {
  const name = ref('')
  const email = ref('')
  
  const updateUser = (data) => {
    name.value = data.name
    email.value = data.email
  }
  
  return {
    name,
    email,
    updateUser
  }
})
```

#### 装饰器 Store
```typescript
import { BaseStore, State, Action, Getter } from '@ldesign/store'

class TodoStore extends BaseStore {
  @State
  todos: Todo[] = []
  
  @Action
  addTodo(todo: Todo) {
    this.todos.push(todo)
  }
  
  @Getter
  get completedTodos() {
    return this.todos.filter(todo => todo.completed)
  }
}
```

### 在组件中使用

```vue
<template>
  <div>
    <p>计数: {{ counter.count }}</p>
    <button @click="counter.increment">增加</button>
    <button @click="counter.decrement">减少</button>
  </div>
</template>

<script setup>
import { useStore } from '@ldesign/store/vue'

const counter = useStore(counterStore)
</script>
```

## 配置选项

### StoreEnginePluginOptions

```typescript
interface StoreEnginePluginOptions {
  // 插件基础信息
  name?: string
  version?: string
  description?: string
  dependencies?: string[]

  // Store 配置
  storeConfig?: {
    enablePerformanceOptimization?: boolean
    enablePersistence?: boolean
    debug?: boolean
    defaultCacheOptions?: {
      ttl?: number
      maxSize?: number
    }
    defaultPersistOptions?: {
      key?: string
      storage?: Storage
      paths?: string[]
    }
  }

  // Vue 插件配置
  globalInjection?: boolean
  globalPropertyName?: string

  // 自动安装配置
  autoInstall?: boolean
  enablePerformanceMonitoring?: boolean
  debug?: boolean
}
```

## 测试页面

访问 `/store-test` 路由可以查看完整的功能演示，包括：

- 基础状态管理测试
- 函数式 Store 测试
- 组合式 Store 测试
- 性能测试
- 插件状态检查

## 性能优化

### 缓存配置
```typescript
const storePlugin = createStoreEnginePlugin({
  storeConfig: {
    enablePerformanceOptimization: true,
    defaultCacheOptions: {
      ttl: 300000, // 5分钟缓存
      maxSize: 100 // 最大缓存条目数
    }
  }
})
```

### 持久化配置
```typescript
const storePlugin = createStoreEnginePlugin({
  storeConfig: {
    enablePersistence: true,
    defaultPersistOptions: {
      key: 'my-app-store',
      storage: localStorage,
      paths: ['user', 'settings'] // 只持久化指定的 store
    }
  }
})
```

## 调试模式

开发环境下可以启用调试模式：

```typescript
const storePlugin = createStoreEnginePlugin({
  debug: true,
  enablePerformanceMonitoring: true,
  storeConfig: {
    debug: true
  }
})
```

调试模式会输出详细的日志信息，包括：
- 插件安装过程
- Store 创建和销毁
- 性能监控数据
- 错误信息

## 最佳实践

1. **模块化**: 将不同功能的状态分离到不同的 store 中
2. **类型安全**: 充分利用 TypeScript 的类型检查
3. **性能优化**: 合理使用缓存和持久化功能
4. **错误处理**: 在 actions 中添加适当的错误处理
5. **测试**: 为 store 编写单元测试

## 相关链接

- [@ldesign/store 包文档](../../packages/store/README.md)
- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
