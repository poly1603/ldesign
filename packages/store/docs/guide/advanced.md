# 高级功能

本章节介绍 @ldesign/store 的高级功能和使用技巧，帮助您构建更复杂和强大的应用程序。

## 🚀 状态持久化

### 基本持久化

使用 `@Persist` 装饰器可以自动持久化状态：

```typescript
import { BaseStore, State, Persist } from '@ldesign/store'

export class UserStore extends BaseStore {
  @State
  @Persist
  user = null

  @State
  @Persist({ key: 'user-settings', storage: 'session' })
  settings = {}
}
```

### 持久化配置

```typescript
export class AppStore extends BaseStore {
  @State
  @Persist({
    key: 'app-data',
    storage: 'local', // 'local' | 'session' | 'cookie'
    serializer: JSON, // 自定义序列化器
    version: 1, // 版本控制
    migrate: (data, version) => {
      // 数据迁移逻辑
      if (version < 1) {
        return { ...data, newField: 'default' }
      }
      return data
    }
  })
  appData = {}
}
```

## 🎯 性能优化

### 缓存机制

使用 `@Cache` 装饰器缓存计算结果：

```typescript
export class DataStore extends BaseStore {
  @State
  items = []

  @Getter
  @Cache({ ttl: 5000 }) // 缓存5秒
  get expensiveComputation() {
    return this.items
      .filter(item => item.active)
      .map(item => this.processItem(item))
      .sort((a, b) => a.priority - b.priority)
  }

  @Action
  @Cache({ key: 'api-data', ttl: 60000 })
  async fetchData(params) {
    return await api.getData(params)
  }
}
```

### 防抖和节流

```typescript
export class SearchStore extends BaseStore {
  @State
  query = ''
  
  @State
  results = []

  @Action
  @Debounce(300) // 防抖300ms
  async search(query) {
    this.query = query
    this.results = await api.search(query)
  }

  @Action
  @Throttle(1000) // 节流1秒
  async saveProgress() {
    await api.saveProgress(this.getState())
  }
}
```

## 🔄 实时同步

### WebSocket 集成

```typescript
export class RealtimeStore extends BaseStore {
  @State
  connected = false

  @State
  messages = []

  @Action
  async connect() {
    const ws = new WebSocket('ws://localhost:8080')
    
    ws.onopen = () => {
      this.connected = true
    }
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      this.addMessage(message)
    }
    
    ws.onclose = () => {
      this.connected = false
    }
  }

  @Action
  addMessage(message) {
    this.messages.push(message)
  }
}
```

### 多实例同步

```typescript
export class SyncStore extends BaseStore {
  @State
  @Sync // 自动在多个实例间同步
  sharedData = {}

  @Action
  updateSharedData(data) {
    this.sharedData = { ...this.sharedData, ...data }
  }
}
```

## 🛠️ 中间件系统

### 创建中间件

```typescript
import { createMiddleware } from '@ldesign/store'

// 日志中间件
export const loggerMiddleware = createMiddleware({
  name: 'logger',
  before: (action, store) => {
    console.log(`[${store.name}] 执行动作: ${action.name}`)
  },
  after: (action, store, result) => {
    console.log(`[${store.name}] 动作完成: ${action.name}`, result)
  },
  error: (action, store, error) => {
    console.error(`[${store.name}] 动作错误: ${action.name}`, error)
  }
})

// 性能监控中间件
export const performanceMiddleware = createMiddleware({
  name: 'performance',
  before: (action, store) => {
    performance.mark(`${store.name}-${action.name}-start`)
  },
  after: (action, store) => {
    performance.mark(`${store.name}-${action.name}-end`)
    performance.measure(
      `${store.name}-${action.name}`,
      `${store.name}-${action.name}-start`,
      `${store.name}-${action.name}-end`
    )
  }
})
```

### 使用中间件

```typescript
export class AppStore extends BaseStore {
  static middlewares = [
    loggerMiddleware,
    performanceMiddleware
  ]

  @State
  data = null

  @Action
  async loadData() {
    this.data = await api.getData()
  }
}
```

## 🔐 权限管理

### 基于角色的访问控制

```typescript
export class AuthStore extends BaseStore {
  @State
  user = null

  @State
  permissions = []

  @Getter
  get hasPermission() {
    return (permission) => {
      return this.permissions.includes(permission)
    }
  }

  @Action
  @RequirePermission('admin')
  async deleteUser(userId) {
    await api.deleteUser(userId)
  }
}

// 权限装饰器
function RequirePermission(permission) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = function(...args) {
      const authStore = useAuthStore()
      if (!authStore.hasPermission(permission)) {
        throw new Error(`需要权限: ${permission}`)
      }
      return originalMethod.apply(this, args)
    }
  }
}
```

## 🧪 测试支持

### Store 测试

```typescript
import { createTestStore } from '@ldesign/store/testing'

describe('UserStore', () => {
  let store

  beforeEach(() => {
    store = createTestStore(UserStore)
  })

  it('应该正确登录用户', async () => {
    const mockUser = { id: 1, name: 'Test User' }
    
    // 模拟 API 响应
    vi.spyOn(api, 'login').mockResolvedValue(mockUser)
    
    await store.login({ username: 'test', password: 'password' })
    
    expect(store.user).toEqual(mockUser)
    expect(store.isLoggedIn).toBe(true)
  })
})
```

### 时间旅行调试

```typescript
export class DebugStore extends BaseStore {
  @State
  @TimeTravel // 启用时间旅行
  history = []

  @Action
  addItem(item) {
    this.history.push(item)
  }

  // 在开发工具中可以回退到任意状态
}
```

## 🔧 自定义装饰器

### 创建装饰器

```typescript
import { createDecorator } from '@ldesign/store'

// 验证装饰器
export const Validate = (validator) => {
  return createDecorator({
    name: 'validate',
    before: (value, target, propertyKey) => {
      if (!validator(value)) {
        throw new Error(`验证失败: ${propertyKey}`)
      }
    }
  })
}

// 使用自定义装饰器
export class FormStore extends BaseStore {
  @State
  @Validate(email => /\S+@\S+\.\S+/.test(email))
  email = ''

  @Action
  updateEmail(email) {
    this.email = email // 会自动验证
  }
}
```

## 📊 性能监控

### 内置性能监控

```typescript
export class MonitoredStore extends BaseStore {
  @State
  @Monitor // 监控状态变化
  data = []

  @Action
  @Monitor({ 
    threshold: 100, // 超过100ms警告
    sample: 0.1 // 10%采样率
  })
  async heavyOperation() {
    // 耗时操作
  }
}
```

### 性能报告

```typescript
import { getPerformanceReport } from '@ldesign/store'

// 获取性能报告
const report = getPerformanceReport()
console.log('Store 性能报告:', report)
```

## 🌐 国际化支持

### 多语言状态

```typescript
export class I18nStore extends BaseStore {
  @State
  @Persist
  locale = 'zh-CN'

  @State
  messages = {}

  @Getter
  get t() {
    return (key) => {
      return this.messages[this.locale]?.[key] || key
    }
  }

  @Action
  async setLocale(locale) {
    this.locale = locale
    this.messages[locale] = await import(`./locales/${locale}.json`)
  }
}
```

## 🚀 下一步

现在您已经了解了 @ldesign/store 的高级功能，可以：

- 查看[最佳实践](./best-practices.md)了解推荐的使用模式
- 阅读[API 文档](/api/)获取详细的 API 参考
- 查看[示例代码](/examples/)学习实际应用
- 参与[社区讨论](https://github.com/ldesign/store/discussions)分享经验
