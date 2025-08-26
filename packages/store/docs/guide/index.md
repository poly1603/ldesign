# @ldesign/store 指南

欢迎使用 @ldesign/store！这是一个基于 Pinia 的 Vue 3 状态管理库，支持多种使用方式，让状态管理变得更加灵活和强大。

## 🚀 快速开始

@ldesign/store 提供了多种使用方式，您可以根据项目需求和个人偏好选择最适合的方式：

### 类式 Store
使用面向对象的方式定义 Store，支持装饰器语法：

```typescript
import { BaseStore, State, Action, Getter } from '@ldesign/store'

export class CounterStore extends BaseStore {
  @State
  count = 0

  @Getter
  get doubleCount() {
    return this.count * 2
  }

  @Action
  increment() {
    this.count++
  }
}
```

### 函数式 Store
使用函数的方式定义 Store：

```typescript
import { createFunctionalStore } from '@ldesign/store'

export const useCounterStore = createFunctionalStore('counter', () => {
  const count = ref(0)
  
  const doubleCount = computed(() => count.value * 2)
  
  const increment = () => {
    count.value++
  }

  return { count, doubleCount, increment }
})
```

### 组合式 Store
使用 Composition API 的方式：

```typescript
import { createCompositionStore } from '@ldesign/store'

export const useCounterStore = createCompositionStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  const increment = () => count.value++
  
  return { count, doubleCount, increment }
})
```

## 📚 核心特性

### 🎯 多种使用方式
- **类式 Store**: 面向对象，支持装饰器
- **函数式 Store**: 函数式编程风格
- **组合式 Store**: Composition API 风格
- **Store 工厂**: 动态创建 Store

### 🔧 强大的装饰器
- `@State`: 定义响应式状态
- `@Action`: 定义动作方法
- `@Getter`: 定义计算属性
- `@Cache`: 缓存计算结果
- `@Debounce`: 防抖处理
- `@Throttle`: 节流处理

### 🚀 高级功能
- **状态持久化**: 自动保存和恢复状态
- **性能优化**: 内置缓存和优化机制
- **实时同步**: 支持多实例状态同步
- **中间件系统**: 可扩展的中间件架构

### 🛠️ 开发体验
- **TypeScript 支持**: 完整的类型定义
- **开发工具**: 丰富的调试工具
- **热重载**: 开发时状态保持
- **错误处理**: 完善的错误处理机制

## 🎯 适用场景

### 小型项目
对于简单的状态管理需求，可以使用函数式或组合式 Store：

```typescript
// 简单的用户状态管理
export const useUserStore = createFunctionalStore('user', () => {
  const user = ref(null)
  const isLoggedIn = computed(() => !!user.value)
  
  const login = async (credentials) => {
    user.value = await api.login(credentials)
  }
  
  return { user, isLoggedIn, login }
})
```

### 中型项目
使用类式 Store 和装饰器，获得更好的组织结构：

```typescript
export class UserStore extends BaseStore {
  @State user = null
  @State loading = false

  @Getter
  get isLoggedIn() {
    return !!this.user
  }

  @Action
  @Debounce(300)
  async login(credentials) {
    this.loading = true
    try {
      this.user = await api.login(credentials)
    } finally {
      this.loading = false
    }
  }
}
```

### 大型项目
使用完整的企业级功能，包括持久化、中间件等：

```typescript
export class AppStore extends BaseStore {
  @State @Persist user = null
  @State @Cache settings = {}

  @Action
  async initializeApp() {
    await this.loadUserSettings()
    await this.setupRealTimeSync()
  }
}
```

## 📖 学习路径

### 1. 基础概念
- [安装指南](./installation.md) - 如何安装和配置
- [基本概念](./concepts.md) - 核心概念和术语
- [快速开始](./getting-started.md) - 第一个 Store

### 2. 使用方式
- [类式 Store](./class-usage.md) - 面向对象的使用方式
- [装饰器详解](./decorators.md) - 装饰器的使用和配置
- [函数式 Store](./functional.md) - 函数式编程风格
- [组合式 Store](./composition.md) - Composition API 风格

### 3. 高级功能
- [状态持久化](./persistence.md) - 状态的保存和恢复
- [性能优化](./performance.md) - 性能优化技巧
- [实时同步](./realtime.md) - 多实例状态同步

### 4. 最佳实践
- [最佳实践](./best-practices.md) - 推荐的使用模式
- [故障排除](./troubleshooting.md) - 常见问题解决
- [迁移指南](./migration.md) - 从其他状态管理库迁移

## 🤝 社区支持

- **GitHub**: [https://github.com/ldesign/store](https://github.com/ldesign/store)
- **Issues**: 报告 Bug 和功能请求
- **Discussions**: 社区讨论和问答
- **文档**: 完整的 API 文档和示例

## 🎉 开始使用

准备好开始了吗？让我们从[安装指南](./installation.md)开始，或者直接查看[示例代码](/examples/)来快速上手！
