# 新功能使用指南

本文档介绍 @ldesign/store 最新添加的实用功能。

## 📦 增强的持久化管理器

### 概述

`EnhancedPersistenceManager` 提供了比传统 localStorage 更强大的状态持久化功能，支持版本管理、数据迁移、压缩、加密等高级特性。

### 基础用法

```typescript
import { createEnhancedPersistence, PersistenceStrategy } from '@ldesign/store'

// 创建持久化管理器
const persistence = createEnhancedPersistence({
  key: 'my-app-state',
  strategy: PersistenceStrategy.DEBOUNCED,
  delay: 1000
})

// 保存状态
await persistence.save({ count: 0, user: { name: 'John' } })

// 加载状态
const state = await persistence.load()
```

### 持久化策略

#### 1. 立即持久化 (IMMEDIATE)
每次状态变化立即保存，适合关键数据。

```typescript
const persistence = createEnhancedPersistence({
  key: 'critical-data',
  strategy: PersistenceStrategy.IMMEDIATE
})
```

#### 2. 防抖持久化 (DEBOUNCED)
在最后一次变化后延迟保存，适合频繁变化的数据。

```typescript
const persistence = createEnhancedPersistence({
  key: 'user-input',
  strategy: PersistenceStrategy.DEBOUNCED,
  delay: 1000 // 1秒后保存
})
```

#### 3. 节流持久化 (THROTTLED)
按固定间隔保存，适合高频更新的数据。

```typescript
const persistence = createEnhancedPersistence({
  key: 'realtime-data',
  strategy: PersistenceStrategy.THROTTLED,
  delay: 5000 // 每5秒最多保存一次
})
```

#### 4. 手动持久化 (MANUAL)
完全手动控制保存时机。

```typescript
const persistence = createEnhancedPersistence({
  key: 'manual-save',
  strategy: PersistenceStrategy.MANUAL
})

// 手动触发保存
await persistence.flush(state)
```

### 部分字段持久化

只持久化指定的字段，减少存储空间。

```typescript
const persistence = createEnhancedPersistence({
  key: 'partial-state',
  paths: ['user.name', 'user.email', 'settings'] // 只保存这些字段
})
```

### 版本管理和迁移

自动处理状态结构变化。

```typescript
const persistence = createEnhancedPersistence({
  key: 'versioned-state',
  version: 3,
  migrations: {
    // 从版本1升级到版本2
    2: (oldState) => ({
      ...oldState,
      newField: 'default value'
    }),
    // 从版本2升级到版本3
    3: (oldState) => ({
      ...oldState,
      user: {
        ...oldState.user,
        role: 'user'
      }
    })
  }
})
```

### 数据压缩和加密

```typescript
const persistence = createEnhancedPersistence({
  key: 'secure-data',
  compress: true,
  encrypt: true,
  encryptionKey: 'your-secret-key-here'
})
```

### 使用 IndexedDB

对于大量数据，使用 IndexedDB 替代 localStorage。

```typescript
import { createEnhancedPersistence, IndexedDBStorage } from '@ldesign/store'

const persistence = createEnhancedPersistence({
  key: 'large-dataset',
  storage: new IndexedDBStorage('my-app-db', 'state-store')
})
```

### 自定义序列化

```typescript
import superjson from 'superjson'

const persistence = createEnhancedPersistence({
  key: 'custom-serialization',
  serializer: (state) => superjson.stringify(state),
  deserializer: (data) => superjson.parse(data)
})
```

### 错误处理

```typescript
const persistence = createEnhancedPersistence({
  key: 'error-handling',
  onError: (error) => {
    console.error('Persistence error:', error)
    // 发送错误到监控系统
    sendToSentry(error)
  }
})
```

## 🚀 智能预加载器

### 概述

`SmartPreloader` 基于用户行为模式智能预加载数据，提升应用响应速度。

### 基础用法

```typescript
import { createSmartPreloader, PreloadPriority, PreloadStrategy } from '@ldesign/store'

// 创建预加载器
const preloader = createSmartPreloader()

// 注册预加载任务
preloader.register({
  id: 'user-profile',
  name: 'Load User Profile',
  loader: () => fetch('/api/user/profile').then(r => r.json()),
  priority: PreloadPriority.HIGH,
  strategy: PreloadStrategy.PREDICTIVE
})

// 执行预加载
await preloader.preload('user-profile')

// 获取结果
const result = preloader.getResult('user-profile')
if (result?.success) {
  console.log('User profile:', result.data)
}
```

### 优先级管理

#### 高优先级 (HIGH)
立即加载，适合关键数据。

```typescript
preloader.register({
  id: 'critical-data',
  name: 'Critical Data',
  loader: loadCriticalData,
  priority: PreloadPriority.HIGH
})
```

#### 中优先级 (MEDIUM)
空闲时加载，适合次要数据。

```typescript
preloader.register({
  id: 'secondary-data',
  name: 'Secondary Data',
  loader: loadSecondaryData,
  priority: PreloadPriority.MEDIUM
})
```

#### 低优先级 (LOW)
延迟加载，适合可选数据。

```typescript
preloader.register({
  id: 'optional-data',
  name: 'Optional Data',
  loader: loadOptionalData,
  priority: PreloadPriority.LOW
})
```

### 依赖管理

```typescript
// 注册依赖任务
preloader.register({
  id: 'user-settings',
  name: 'User Settings',
  loader: loadUserSettings,
  dependencies: ['user-profile'] // 先加载用户资料
})

// 自动处理依赖顺序
await preloader.preload('user-settings')
```

### 缓存控制

```typescript
preloader.register({
  id: 'cached-data',
  name: 'Cached Data',
  loader: loadData,
  cacheDuration: 60000 // 缓存1分钟
})

// 清除缓存
preloader.clearCache('cached-data')
// 或清除所有缓存
preloader.clearCache()
```

### 超时和重试

```typescript
preloader.register({
  id: 'unreliable-api',
  name: 'Unreliable API',
  loader: fetchUnreliableData,
  timeout: 5000,  // 5秒超时
  retries: 3      // 失败后重试3次
})
```

### 智能预加载

基于用户行为模式自动预加载。

```typescript
// 在路由变化时调用
router.afterEach((to) => {
  preloader.smartPreload(to.path)
})

// 预加载器会：
// 1. 记录用户访问模式
// 2. 预测下一步可能访问的路由
// 3. 自动预加载相关数据
```

### 批量操作

```typescript
// 批量注册
preloader.registerBatch([
  {
    id: 'task1',
    name: 'Task 1',
    loader: loadTask1,
    priority: PreloadPriority.HIGH
  },
  {
    id: 'task2',
    name: 'Task 2',
    loader: loadTask2,
    priority: PreloadPriority.MEDIUM
  }
])

// 批量预加载
const results = await preloader.preloadBatch(['task1', 'task2'])

// 按优先级预加载
await preloader.preloadByPriority(PreloadPriority.HIGH)
```

### 与 Vue Router 集成

```typescript
import { createRouter } from 'vue-router'
import { createSmartPreloader, PreloadPriority } from '@ldesign/store'

const preloader = createSmartPreloader()
const router = createRouter({ /* ... */ })

// 注册路由相关的预加载任务
preloader.register({
  id: 'dashboard-data',
  name: 'Dashboard Data',
  loader: () => import('@/api/dashboard').then(m => m.loadDashboard()),
  priority: PreloadPriority.HIGH,
  strategy: PreloadStrategy.ROUTE_BASED
})

// 路由守卫中触发预加载
router.beforeEach(async (to, from, next) => {
  // 智能预加载
  preloader.smartPreload(to.path)
  next()
})
```

## 🎯 最佳实践

### 1. 持久化管理器

- 使用防抖策略处理频繁变化的数据
- 为敏感数据启用加密
- 定期清理过期的持久化数据
- 使用版本迁移处理结构变化

### 2. 智能预加载器

- 为关键数据设置高优先级
- 合理设置缓存时间
- 使用依赖管理确保加载顺序
- 监控预加载性能指标

## 📚 完整示例

```typescript
import { defineStore } from 'pinia'
import { 
  createEnhancedPersistence, 
  createSmartPreloader,
  PersistenceStrategy,
  PreloadPriority 
} from '@ldesign/store'

// 创建持久化管理器
const persistence = createEnhancedPersistence({
  key: 'user-store',
  strategy: PersistenceStrategy.DEBOUNCED,
  delay: 1000,
  version: 1,
  paths: ['user', 'settings']
})

// 创建预加载器
const preloader = createSmartPreloader()

// 定义 Store
export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    settings: {}
  }),
  
  actions: {
    async init() {
      // 加载持久化数据
      const saved = await persistence.load()
      if (saved) {
        this.$patch(saved)
      }
      
      // 注册预加载任务
      preloader.register({
        id: 'user-data',
        name: 'User Data',
        loader: () => this.fetchUser(),
        priority: PreloadPriority.HIGH
      })
    },
    
    async fetchUser() {
      const data = await fetch('/api/user').then(r => r.json())
      this.user = data
      await persistence.save(this.$state)
      return data
    },
    
    async updateSettings(settings) {
      this.settings = { ...this.settings, ...settings }
      await persistence.save(this.$state)
    }
  }
})
```

## 🔗 相关文档

- [API 文档](./API.md)
- [性能优化指南](./PERFORMANCE_OPTIMIZATIONS.md)
- [改进说明](./IMPROVEMENTS.md)

