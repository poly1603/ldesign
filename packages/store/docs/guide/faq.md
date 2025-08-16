# 常见问题解答 (FAQ)

## 基础问题

### Q: @ldesign/store 与 Pinia 有什么区别？

A: @ldesign/store 是基于 Pinia 构建的增强版状态管理库，主要区别：

- **装饰器支持**：提供类似 Angular 的装饰器语法
- **性能优化**：内置 Store 池、性能监控、缓存等功能
- **企业级功能**：权限管理、数据验证、错误处理等
- **多种使用方式**：支持类、Hook、Provider 等多种模式
- **完全兼容**：底层使用 Pinia，可以与现有 Pinia Store 共存

### Q: 为什么选择装饰器语法？

A: 装饰器语法提供了多个优势：

1. **代码组织更清晰**：状态、计算属性、方法分离明确
2. **类型安全**：完整的 TypeScript 支持
3. **元数据支持**：可以添加验证、缓存等元信息
4. **IDE 友好**：更好的代码提示和重构支持
5. **可扩展性**：易于添加新功能和优化

### Q: 是否必须使用装饰器？

A: 不是必须的。@ldesign/store 支持多种使用方式：

```typescript
// 1. 装饰器方式（推荐）
class CounterStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0
}

// 2. Hook 方式（类似 Pinia）
export const useCounterStore = createStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++
    },
  },
})

// 3. Provider 方式
const CounterProvider = createStoreProvider({
  stores: { counter: CounterStore },
})
```

### Q: 学习成本如何？

A: 学习成本相对较低：

- **有 Pinia 经验**：几乎无学习成本，只需了解装饰器语法
- **有 Vuex 经验**：需要适应响应式思维，但比 Vuex 简单
- **新手**：建议先学习 Vue 3 和 Composition API 基础

## 技术问题

### Q: 支持哪些 Vue 版本？

A: 目前只支持 Vue 3.0+，因为依赖于：

- Composition API
- Pinia (Vue 3 专用)
- 现代 JavaScript 特性

### Q: 是否支持服务端渲染 (SSR)？

A: 完全支持，包括：

- **Nuxt.js**：提供专门的 Nuxt 模块
- **Vite SSR**：开箱即用
- **自定义 SSR**：兼容所有 Vue 3 SSR 方案

```typescript
// Nuxt 配置
export default defineNuxtConfig({
  modules: ['@ldesign/store/nuxt'],
})
```

### Q: 性能如何？

A: 性能表现优秀：

- **基础性能**：与 Pinia 相当（因为底层就是 Pinia）
- **额外优化**：
  - Store 池减少实例创建开销
  - 智能缓存减少重复计算
  - 性能监控帮助识别瓶颈
  - 防抖节流减少不必要的更新

### Q: 包体积多大？

A: 体积控制良好：

- **核心包**：~15KB (gzipped)
- **完整功能**：~25KB (gzipped)
- **Tree Shaking**：支持按需导入
- **无额外依赖**：除了 Pinia 和 Vue

### Q: 是否支持 TypeScript？

A: 完全支持，并且是 TypeScript First：

- **完整类型定义**：所有 API 都有类型
- **类型推导**：自动推导状态和方法类型
- **泛型支持**：支持泛型 Store
- **装饰器类型**：装饰器参数类型检查

## 使用问题

### Q: 如何在组件中使用 Store？

A: 多种使用方式：

```typescript
// 1. 直接实例化
const store = new CounterStore('counter')

// 2. Hook 方式
const store = useCounterStore()

// 3. Provider 注入
const store = useStore('counter')

// 4. 组合式 API
const { count, increment } = useStoreState(store)
```

### Q: 如何处理异步操作？

A: 使用 @AsyncAction 装饰器：

```typescript
class UserStore extends BaseStore {
  @AsyncAction()
  async fetchUser(id: string) {
    this.loading = true
    try {
      const user = await api.getUser(id)
      this.user = user
    } catch (error) {
      this.error = error
    } finally {
      this.loading = false
    }
  }
}
```

### Q: 如何实现数据持久化？

A: 使用 @PersistentState 装饰器：

```typescript
class SettingsStore extends BaseStore {
  @PersistentState({
    key: 'user-settings',
    storage: localStorage,
  })
  settings: UserSettings = defaultSettings
}
```

### Q: 如何在 Store 之间通信？

A: 多种方式：

```typescript
// 1. 直接引用
class OrderStore extends BaseStore {
  private userStore = new UserStore('user')

  @Action()
  createOrder() {
    if (!this.userStore.isLoggedIn) {
      throw new Error('请先登录')
    }
  }
}

// 2. 事件系统
class EventStore extends BaseStore {
  @Action()
  emitEvent(event: string, data: any) {
    this.$emit(event, data)
  }
}

// 3. Provider 模式
const { userStore, orderStore } = useStores()
```

## 高级问题

### Q: 如何自定义装饰器？

A: 可以创建自定义装饰器：

```typescript
import { createDecorator } from '@ldesign/store'

// 创建自定义装饰器
export const Validate = createDecorator('validate', options => {
  return (target, propertyKey, descriptor) => {
    // 装饰器逻辑
  }
})

// 使用
class FormStore extends BaseStore {
  @Validate({ required: true, email: true })
  @State({ default: '' })
  email: string = ''
}
```

### Q: 如何实现权限控制？

A: 使用权限装饰器：

```typescript
class AdminStore extends BaseStore {
  @RequirePermission('admin:users:delete')
  @Action()
  deleteUser(id: string) {
    // 只有有权限的用户才能执行
  }

  @RequireRole('admin')
  @Action()
  systemSettings() {
    // 只有管理员角色才能执行
  }
}
```

### Q: 如何优化大型应用的性能？

A: 多种优化策略：

1. **使用 Store 池**

   ```typescript
   @PooledStore({ maxSize: 20 })
   class FrequentStore extends BaseStore {}
   ```

2. **启用缓存**

   ```typescript
   @CachedGetter(['data'])
   get expensiveComputation() {}
   ```

3. **性能监控**

   ```typescript
   @MonitorAction
   @Action()
   heavyOperation() {}
   ```

4. **按需加载**
   ```typescript
   const LazyStore = defineAsyncComponent(() => import('./LazyStore'))
   ```

### Q: 如何处理错误？

A: 内置错误处理机制：

```typescript
class ErrorHandlingStore extends BaseStore {
  @Action()
  @ErrorHandler((error, context) => {
    console.error('Store error:', error)
    // 自定义错误处理
  })
  riskyOperation() {
    throw new Error('Something went wrong')
  }
}
```

## 生态问题

### Q: 有哪些配套工具？

A: 丰富的生态系统：

- **开发工具**：Vue DevTools 支持
- **测试工具**：Vitest/Jest 集成
- **构建工具**：Vite/Webpack 支持
- **代码生成**：CLI 工具和模板
- **文档工具**：TypeDoc 集成

### Q: 社区支持如何？

A: 活跃的社区：

- **GitHub**：定期更新和 bug 修复
- **文档**：详细的文档和示例
- **示例项目**：多个实际项目示例
- **社区讨论**：Discord/微信群

### Q: 未来规划？

A: 持续发展：

- **性能优化**：更多性能优化功能
- **开发体验**：更好的开发工具
- **生态扩展**：更多框架支持
- **企业功能**：更多企业级特性

## 迁移问题

### Q: 如何从 Pinia 迁移？

A: 渐进式迁移：

1. **安装 @ldesign/store**
2. **保持现有 Pinia Store 不变**
3. **新功能使用 @ldesign/store**
4. **逐步迁移现有 Store**

### Q: 如何从 Vuex 迁移？

A: 分步骤迁移：

1. **理解概念差异**
2. **转换状态结构**
3. **移除 mutations**
4. **更新组件使用方式**

### Q: 迁移成本高吗？

A: 成本可控：

- **Pinia 迁移**：几乎无成本
- **Vuex 迁移**：中等成本，但收益明显
- **渐进式迁移**：可以逐步进行
- **向后兼容**：不会破坏现有功能

## 获取帮助

如果你的问题没有在这里找到答案：

1. **查看文档**：[完整文档](/guide/)
2. **查看示例**：[示例项目](/examples/)
3. **搜索 Issues**：[GitHub Issues](https://github.com/ldesign-team/store/issues)
4. **提问讨论**：[GitHub Discussions](https://github.com/ldesign-team/store/discussions)
5. **加入社区**：微信群、Discord 等
