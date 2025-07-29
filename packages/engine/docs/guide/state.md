# 状态管理

引擎提供了强大的状态管理系统，支持响应式状态、模块化管理和持久化存储。

## 基本概念

状态管理器提供了简单而强大的API来管理应用状态：

```typescript
interface StateManager {
  set<T>(key: string, value: T): void
  get<T>(key: string): T | undefined
  has(key: string): boolean
  remove(key: string): boolean
  clear(): void
  getAll(): Record<string, any>
  subscribe(key: string, callback: StateChangeCallback): () => void
}

type StateChangeCallback<T = any> = (newValue: T, oldValue: T) => void
```

## 基本用法

### 设置和获取状态

```typescript
import { createApp } from '@ldesign/engine'
import App from './App.vue'

const engine = createApp(App)

// 设置状态
engine.state.set('user', {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com'
})

engine.state.set('theme', 'dark')
engine.state.set('isLoading', false)

// 获取状态
const user = engine.state.get('user')
const theme = engine.state.get('theme')
const isLoading = engine.state.get('isLoading')

console.log('当前用户:', user)
console.log('当前主题:', theme)
```

### 检查和删除状态

```typescript
// 检查状态是否存在
if (engine.state.has('user')) {
  console.log('用户状态存在')
}

// 删除状态
engine.state.remove('temporaryData')

// 清空所有状态
engine.state.clear()

// 获取所有状态
const allState = engine.state.getAll()
console.log('所有状态:', allState)
```

## 响应式状态

### 监听状态变化

```typescript
// 监听特定状态的变化
const unsubscribe = engine.state.subscribe('user', (newUser, oldUser) => {
  console.log('用户状态变化:')
  console.log('旧值:', oldUser)
  console.log('新值:', newUser)
  
  // 响应状态变化
  if (newUser && !oldUser) {
    console.log('用户已登录')
    engine.events.emit('user:login', newUser)
  } else if (!newUser && oldUser) {
    console.log('用户已登出')
    engine.events.emit('user:logout', oldUser)
  }
})

// 取消监听
// unsubscribe()
```

### 计算状态

```typescript
// 基于其他状态计算新状态
engine.state.subscribe('user', (user) => {
  // 计算用户权限
  const permissions = user ? calculateUserPermissions(user) : []
  engine.state.set('userPermissions', permissions)
})

engine.state.subscribe('theme', (theme) => {
  // 更新CSS变量
  document.documentElement.setAttribute('data-theme', theme)
})
```

## 状态模块

### 创建状态模块

```typescript
// 用户状态模块
const userStateModule = {
  // 初始状态
  initialState: {
    currentUser: null,
    isAuthenticated: false,
    preferences: {
      theme: 'light',
      language: 'zh-CN'
    }
  },
  
  // 状态操作方法
  actions: {
    login: (engine: Engine, userData: User) => {
      engine.state.set('user.currentUser', userData)
      engine.state.set('user.isAuthenticated', true)
      engine.events.emit('user:login', userData)
    },
    
    logout: (engine: Engine) => {
      const currentUser = engine.state.get('user.currentUser')
      engine.state.set('user.currentUser', null)
      engine.state.set('user.isAuthenticated', false)
      engine.events.emit('user:logout', currentUser)
    },
    
    updatePreferences: (engine: Engine, preferences: Partial<UserPreferences>) => {
      const current = engine.state.get('user.preferences') || {}
      engine.state.set('user.preferences', { ...current, ...preferences })
    }
  }
}

// 注册状态模块
engine.state.registerModule('user', userStateModule)
```

### 使用状态模块

```typescript
// 使用模块的操作方法
const userActions = engine.state.getModule('user').actions

// 用户登录
userActions.login(engine, {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com'
})

// 更新用户偏好
userActions.updatePreferences(engine, {
  theme: 'dark',
  language: 'en-US'
})

// 用户登出
userActions.logout(engine)
```

## 持久化状态

### 本地存储

```typescript
// 配置持久化状态
const engine = createApp(App, {
  state: {
    persistence: {
      // 需要持久化的状态键
      keys: ['user.preferences', 'app.settings', 'ui.layout'],
      // 存储适配器
      adapter: 'localStorage', // 或 'sessionStorage'
      // 存储键前缀
      prefix: 'myapp:'
    }
  }
})

// 持久化的状态会自动保存和恢复
engine.state.set('user.preferences', { theme: 'dark' })
// 页面刷新后，状态会自动恢复
```

### 自定义存储适配器

```typescript
// 创建自定义存储适配器
const customStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    // 从服务器获取状态
    const response = await fetch(`/api/state/${key}`)
    return response.ok ? await response.text() : null
  },
  
  setItem: async (key: string, value: string): Promise<void> => {
    // 保存状态到服务器
    await fetch(`/api/state/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: value
    })
  },
  
  removeItem: async (key: string): Promise<void> => {
    await fetch(`/api/state/${key}`, { method: 'DELETE' })
  }
}

// 使用自定义适配器
const engine = createApp(App, {
  state: {
    persistence: {
      keys: ['user.data'],
      adapter: customStorageAdapter
    }
  }
})
```

## 状态验证

### 状态模式验证

```typescript
// 定义状态模式
const userStateSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string', minLength: 1 },
    email: { type: 'string', format: 'email' },
    role: { type: 'string', enum: ['admin', 'user', 'guest'] }
  },
  required: ['id', 'name', 'email']
}

// 设置状态验证
engine.state.setValidator('user', userStateSchema)

// 无效状态会抛出错误
try {
  engine.state.set('user', { name: '' }) // 验证失败
} catch (error) {
  console.error('状态验证失败:', error.message)
}
```

### 自定义验证器

```typescript
// 自定义验证函数
const validateUser = (user: any): boolean => {
  if (!user || typeof user !== 'object') return false
  if (!user.id || !user.name || !user.email) return false
  if (!user.email.includes('@')) return false
  return true
}

// 使用自定义验证器
engine.state.setValidator('user', validateUser)
```

## 状态中间件

### 状态变化中间件

```typescript
// 创建状态中间件
const stateLoggingMiddleware = (key: string, newValue: any, oldValue: any) => {
  console.log(`状态变化: ${key}`, { oldValue, newValue })
  
  // 记录到分析系统
  analytics.track('state_changed', {
    key,
    hasOldValue: oldValue !== undefined,
    hasNewValue: newValue !== undefined
  })
}

// 注册中间件
engine.state.use(stateLoggingMiddleware)
```

### 状态转换中间件

```typescript
// 状态转换中间件
const stateTransformMiddleware = (key: string, value: any) => {
  // 自动转换日期字符串为Date对象
  if (key.includes('date') && typeof value === 'string') {
    return new Date(value)
  }
  
  // 自动清理敏感信息
  if (key === 'user' && value && value.password) {
    const { password, ...cleanUser } = value
    return cleanUser
  }
  
  return value
}

engine.state.use(stateTransformMiddleware)
```

## 状态调试

### 开发工具集成

```typescript
// 开发环境下启用状态调试
if (engine.config.debug) {
  // 将状态管理器暴露到全局
  (window as any).__ENGINE_STATE__ = engine.state
  
  // 监听所有状态变化
  engine.state.subscribe('*', (key, newValue, oldValue) => {
    console.group(`🔄 状态变化: ${key}`)
    console.log('旧值:', oldValue)
    console.log('新值:', newValue)
    console.trace('调用栈')
    console.groupEnd()
  })
}
```

### 状态快照

```typescript
// 创建状态快照
const createSnapshot = () => {
  return {
    timestamp: Date.now(),
    state: JSON.parse(JSON.stringify(engine.state.getAll()))
  }
}

// 状态历史记录
const stateHistory: Array<ReturnType<typeof createSnapshot>> = []

engine.state.subscribe('*', () => {
  stateHistory.push(createSnapshot())
  
  // 限制历史记录数量
  if (stateHistory.length > 50) {
    stateHistory.shift()
  }
})

// 恢复到指定快照
const restoreSnapshot = (index: number) => {
  const snapshot = stateHistory[index]
  if (snapshot) {
    engine.state.clear()
    Object.entries(snapshot.state).forEach(([key, value]) => {
      engine.state.set(key, value)
    })
  }
}
```

## 状态最佳实践

### 1. 状态结构设计

```typescript
// ✅ 好的状态结构
const goodStateStructure = {
  // 按功能模块组织
  user: {
    profile: { id: 1, name: 'John' },
    preferences: { theme: 'dark' },
    permissions: ['read', 'write']
  },
  app: {
    settings: { language: 'zh-CN' },
    ui: { sidebarOpen: true }
  },
  data: {
    posts: [],
    comments: [],
    loading: false
  }
}

// ❌ 不好的状态结构
const badStateStructure = {
  userId: 1,
  userName: 'John',
  userTheme: 'dark',
  appLanguage: 'zh-CN',
  sidebarOpen: true,
  postsData: [],
  isLoadingPosts: false
}
```

### 2. 状态更新模式

```typescript
// ✅ 不可变更新
const updateUserProfile = (updates: Partial<UserProfile>) => {
  const currentProfile = engine.state.get('user.profile')
  engine.state.set('user.profile', {
    ...currentProfile,
    ...updates
  })
}

// ❌ 直接修改状态
const badUpdateUserProfile = (updates: Partial<UserProfile>) => {
  const profile = engine.state.get('user.profile')
  Object.assign(profile, updates) // 直接修改原对象
  engine.state.set('user.profile', profile)
}
```

### 3. 状态访问封装

```typescript
// 创建状态访问器
const createStateAccessor = <T>(key: string) => {
  return {
    get: (): T | undefined => engine.state.get(key),
    set: (value: T) => engine.state.set(key, value),
    update: (updater: (current: T) => T) => {
      const current = engine.state.get(key)
      if (current !== undefined) {
        engine.state.set(key, updater(current))
      }
    },
    subscribe: (callback: StateChangeCallback<T>) => {
      return engine.state.subscribe(key, callback)
    }
  }
}

// 使用状态访问器
const userState = createStateAccessor<User>('user.profile')
const themeState = createStateAccessor<string>('app.theme')

// 类型安全的状态操作
userState.set({ id: 1, name: 'John', email: 'john@example.com' })
themeState.set('dark')
```

### 4. 状态同步

```typescript
// 状态同步到URL
engine.state.subscribe('app.currentPage', (page) => {
  if (page) {
    history.pushState(null, '', `/${page}`)
  }
})

// 从URL同步状态
window.addEventListener('popstate', () => {
  const page = location.pathname.slice(1)
  engine.state.set('app.currentPage', page)
})
```

通过状态管理系统，你可以构建可预测、可调试的应用状态，实现复杂的状态逻辑和数据流管理。