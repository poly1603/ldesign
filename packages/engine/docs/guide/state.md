# 状态管理

引擎提供了强大的状态管理系统，支持响应式状态、模块化管理和持久化存储。

## 基本概念

状态管理器提供了简单而强大的 API 来管理应用状态：

```typescript
interface StateManager {
  set: <T>(key: string, value: T) => void
  get: <T>(key: string) => T | undefined
  remove: (key: string) => void
  clear: () => void
  watch: <T>(key: string, callback: WatchCallback<T>) => () => void
}

type WatchCallback<T = any> = (newValue: T, oldValue: T) => void
```

## 基本用法

### 设置和获取状态

```typescript
import { createEngine } from '@ldesign/engine'
import { createApp } from 'vue'
import App from './App.vue'

const engine = createEngine({
  config: {
    debug: true
  }
})
const app = createApp(App)
engine.install(app)

// 设置状态
engine.state.set('user', {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
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

### 删除状态

```typescript
// 删除状态
engine.state.remove('temporaryData')

// 清空所有状态
engine.state.clear()

// 检查状态是否存在（通过 get 方法）
const user = engine.state.get('user')
if (user !== undefined) {
  console.log('用户状态存在')
}
```

## 响应式状态

### 监听状态变化

```typescript
// 监听特定状态的变化
const unsubscribe = engine.state.watch('user', (newUser, oldUser) => {
  console.log('用户状态变化:')
  console.log('旧值:', oldUser)
  console.log('新值:', newUser)

  // 响应状态变化
  if (newUser && !oldUser) {
    console.log('用户已登录')
    engine.events.emit('user:login', newUser)
  }
  else if (!newUser && oldUser) {
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
      language: 'zh-CN',
    },
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
    },
  },
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
  email: 'john@example.com',
})

// 更新用户偏好
userActions.updatePreferences(engine, {
  theme: 'dark',
  language: 'en-US',
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
      prefix: 'myapp:',
    },
  },
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
      body: value,
    })
  },

  removeItem: async (key: string): Promise<void> => {
    await fetch(`/api/state/${key}`, { method: 'DELETE' })
  },
}

// 使用自定义适配器
const engine = createApp(App, {
  state: {
    persistence: {
      keys: ['user.data'],
      adapter: customStorageAdapter,
    },
  },
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
    role: { type: 'string', enum: ['admin', 'user', 'guest'] },
  },
  required: ['id', 'name', 'email'],
}

// 设置状态验证
engine.state.setValidator('user', userStateSchema)

// 无效状态会抛出错误
try {
  engine.state.set('user', { name: '' }) // 验证失败
}
catch (error) {
  console.error('状态验证失败:', error.message)
}
```

### 自定义验证器

```typescript
// 自定义验证函数
function validateUser(user: any): boolean {
  if (!user || typeof user !== 'object')
    return false
  if (!user.id || !user.name || !user.email)
    return false
  if (!user.email.includes('@'))
    return false
  return true
}

// 使用自定义验证器
engine.state.setValidator('user', validateUser)
```

## 状态中间件

### 状态变化中间件

```typescript
// 创建状态中间件
function stateLoggingMiddleware(key: string, newValue: any, oldValue: any) {
  console.log(`状态变化: ${key}`, { oldValue, newValue })

  // 记录到分析系统
  analytics.track('state_changed', {
    key,
    hasOldValue: oldValue !== undefined,
    hasNewValue: newValue !== undefined,
  })
}

// 注册中间件
engine.state.use(stateLoggingMiddleware)
```

### 状态转换中间件

```typescript
// 状态转换中间件
function stateTransformMiddleware(key: string, value: any) {
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
  ;(window as any).__ENGINE_STATE__ = engine.state

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
function createSnapshot() {
  return {
    timestamp: Date.now(),
    state: JSON.parse(JSON.stringify(engine.state.getAll())),
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
function restoreSnapshot(index: number) {
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
    permissions: ['read', 'write'],
  },
  app: {
    settings: { language: 'zh-CN' },
    ui: { sidebarOpen: true },
  },
  data: {
    posts: [],
    comments: [],
    loading: false,
  },
}

// ❌ 不好的状态结构
const badStateStructure = {
  userId: 1,
  userName: 'John',
  userTheme: 'dark',
  appLanguage: 'zh-CN',
  sidebarOpen: true,
  postsData: [],
  isLoadingPosts: false,
}
```

### 2. 状态更新模式

```typescript
// ✅ 不可变更新
function updateUserProfile(updates: Partial<UserProfile>) {
  const currentProfile = engine.state.get('user.profile')
  engine.state.set('user.profile', {
    ...currentProfile,
    ...updates,
  })
}

// ❌ 直接修改状态
function badUpdateUserProfile(updates: Partial<UserProfile>) {
  const profile = engine.state.get('user.profile')
  Object.assign(profile, updates) // 直接修改原对象
  engine.state.set('user.profile', profile)
}
```

### 3. 状态访问封装

```typescript
// 创建状态访问器
function createStateAccessor<T>(key: string) {
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
    },
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

## 状态计算和派生

### 计算属性

```typescript
// 创建计算属性
function createComputed<T>(dependencies: string[], computeFn: (...values: any[]) => T) {
  let cachedValue: T
  let isDirty = true

  // 监听依赖变化
  dependencies.forEach((dep) => {
    engine.state.subscribe(dep, () => {
      isDirty = true
    })
  })

  return {
    get value(): T {
      if (isDirty) {
        const depValues = dependencies.map(dep => engine.state.get(dep))
        cachedValue = computeFn(...depValues)
        isDirty = false
      }
      return cachedValue
    },
  }
}

// 使用计算属性
const fullName = createComputed(
  ['user.firstName', 'user.lastName'],
  (firstName: string, lastName: string) => {
    return firstName && lastName ? `${firstName} ${lastName}` : ''
  }
)

const isAuthenticated = createComputed(['user.profile'], (profile: User) => !!profile)

// 获取计算值
console.log('全名:', fullName.value)
console.log('是否已认证:', isAuthenticated.value)
```

### 状态派生器

```typescript
class StateDeriver {
  private derivedStates = new Map<string, any>()
  private dependencies = new Map<string, string[]>()

  constructor(private engine: Engine) {}

  // 定义派生状态
  derive<T>(key: string, dependencies: string[], deriveFn: (...values: any[]) => T) {
    this.dependencies.set(key, dependencies)

    // 初始计算
    this.updateDerived(key, deriveFn)

    // 监听依赖变化
    dependencies.forEach((dep) => {
      this.engine.state.subscribe(dep, () => {
        this.updateDerived(key, deriveFn)
      })
    })
  }

  private updateDerived(key: string, deriveFn: Function) {
    const deps = this.dependencies.get(key) || []
    const values = deps.map(dep => this.engine.state.get(dep))
    const newValue = deriveFn(...values)

    this.derivedStates.set(key, newValue)
    this.engine.events.emit('state:derived', { key, value: newValue })
  }

  get<T>(key: string): T {
    return this.derivedStates.get(key)
  }
}

// 使用状态派生器
const deriver = new StateDeriver(engine)

// 派生用户显示名称
deriver.derive(
  'userDisplayName',
  ['user.profile', 'user.preferences.showFullName'],
  (profile: User, showFullName: boolean) => {
    if (!profile)
      return '未登录'
    return showFullName ? profile.fullName : profile.firstName
  }
)

// 派生购物车总价
deriver.derive(
  'cartTotal',
  ['cart.items', 'cart.discounts'],
  (items: CartItem[], discounts: Discount[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const discountAmount = discounts.reduce((sum, discount) => sum + discount.amount, 0)
    return Math.max(0, subtotal - discountAmount)
  }
)
```

## 状态事务

### 批量状态更新

```typescript
class StateTransaction {
  private changes = new Map<string, any>()
  private committed = false

  constructor(private engine: Engine) {}

  // 添加状态变更
  set<T>(key: string, value: T) {
    if (this.committed) {
      throw new Error('Transaction already committed')
    }
    this.changes.set(key, value)
    return this
  }

  // 提交事务
  commit() {
    if (this.committed) {
      throw new Error('Transaction already committed')
    }

    // 批量应用所有变更
    this.changes.forEach((value, key) => {
      this.engine.state.set(key, value)
    })

    this.committed = true
    this.engine.events.emit('state:transaction:committed', {
      changes: Array.from(this.changes.entries()),
    })
  }

  // 回滚事务
  rollback() {
    this.changes.clear()
    this.committed = true
    this.engine.events.emit('state:transaction:rollback')
  }

  // 获取变更预览
  getChanges() {
    return new Map(this.changes)
  }
}

// 使用状态事务
function updateUserProfile(profileData: Partial<User>) {
  const transaction = new StateTransaction(engine)

  try {
    transaction
      .set('user.profile', { ...engine.state.get('user.profile'), ...profileData })
      .set('user.lastUpdated', Date.now())
      .set('ui.profileFormDirty', false)

    // 验证变更
    const changes = transaction.getChanges()
    if (validateChanges(changes)) {
      transaction.commit()
      engine.notifications.success('用户资料更新成功')
    }
    else {
      transaction.rollback()
      engine.notifications.error('用户资料验证失败')
    }
  }
  catch (error) {
    transaction.rollback()
    engine.notifications.error(`更新失败: ${error.message}`)
  }
}
```

### 状态锁定

```typescript
class StateLock {
  private locks = new Set<string>()

  constructor(private engine: Engine) {
    this.interceptStateChanges()
  }

  // 锁定状态键
  lock(key: string) {
    this.locks.add(key)
    this.engine.events.emit('state:locked', { key })
  }

  // 解锁状态键
  unlock(key: string) {
    this.locks.delete(key)
    this.engine.events.emit('state:unlocked', { key })
  }

  // 检查是否被锁定
  isLocked(key: string): boolean {
    return (
      this.locks.has(key)
      || Array.from(this.locks).some(lockedKey => key.startsWith(`${lockedKey}.`))
    )
  }

  private interceptStateChanges() {
    const originalSet = this.engine.state.set.bind(this.engine.state)

    this.engine.state.set = (key: string, value: any) => {
      if (this.isLocked(key)) {
        throw new Error(`State key "${key}" is locked`)
      }
      return originalSet(key, value)
    }
  }
}

// 使用状态锁定
const stateLock = new StateLock(engine)

// 在异步操作期间锁定状态
async function saveUserData() {
  stateLock.lock('user')

  try {
    await api.saveUser(engine.state.get('user'))
    engine.notifications.success('保存成功')
  }
  catch (error) {
    engine.notifications.error('保存失败')
  }
  finally {
    stateLock.unlock('user')
  }
}
```

## 状态同步和协作

### 多窗口状态同步

```typescript
class CrossWindowStateSync {
  private channel: BroadcastChannel

  constructor(private engine: Engine, channelName = 'engine-state-sync') {
    this.channel = new BroadcastChannel(channelName)
    this.setupSync()
  }

  private setupSync() {
    // 监听本地状态变化，广播给其他窗口
    this.engine.state.subscribe('*', (key, newValue) => {
      this.channel.postMessage({
        type: 'state-change',
        key,
        value: newValue,
        timestamp: Date.now(),
        source: window.location.href,
      })
    })

    // 监听其他窗口的状态变化
    this.channel.addEventListener('message', (event) => {
      const { type, key, value, source } = event.data

      if (type === 'state-change' && source !== window.location.href) {
        // 临时禁用广播，避免循环
        this.withoutBroadcast(() => {
          this.engine.state.set(key, value)
        })
      }
    })
  }

  private withoutBroadcast(fn: () => void) {
    const originalSubscribe = this.engine.state.subscribe
    this.engine.state.subscribe = () => () => {} // 临时禁用订阅

    try {
      fn()
    }
    finally {
      this.engine.state.subscribe = originalSubscribe
    }
  }

  destroy() {
    this.channel.close()
  }
}

// 启用多窗口同步
const crossWindowSync = new CrossWindowStateSync(engine)
```

### 服务器状态同步

```typescript
class ServerStateSync {
  private ws: WebSocket
  private syncKeys: Set<string>

  constructor(private engine: Engine, private wsUrl: string, syncKeys: string[] = []) {
    this.syncKeys = new Set(syncKeys)
    this.connect()
  }

  private connect() {
    this.ws = new WebSocket(this.wsUrl)

    this.ws.onopen = () => {
      console.log('状态同步连接已建立')
      this.requestInitialState()
    }

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      this.handleServerMessage(message)
    }

    this.ws.onclose = () => {
      console.log('状态同步连接已断开，尝试重连...')
      setTimeout(() => this.connect(), 5000)
    }

    // 监听需要同步的状态变化
    this.syncKeys.forEach((key) => {
      this.engine.state.subscribe(key, (newValue) => {
        this.sendStateChange(key, newValue)
      })
    })
  }

  private requestInitialState() {
    this.ws.send(
      JSON.stringify({
        type: 'request-state',
        keys: Array.from(this.syncKeys),
      })
    )
  }

  private handleServerMessage(message: any) {
    switch (message.type) {
      case 'state-update':
        this.engine.state.set(message.key, message.value)
        break

      case 'initial-state':
        Object.entries(message.state).forEach(([key, value]) => {
          this.engine.state.set(key, value)
        })
        break

      case 'state-conflict':
        this.handleConflict(message)
        break
    }
  }

  private sendStateChange(key: string, value: any) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'state-change',
          key,
          value,
          timestamp: Date.now(),
        })
      )
    }
  }

  private handleConflict(message: any) {
    // 冲突解决策略：服务器优先
    this.engine.state.set(message.key, message.serverValue)

    this.engine.notifications.warning(`状态冲突已解决: ${message.key}`, { duration: 3000 })
  }
}

// 启用服务器同步
const serverSync = new ServerStateSync(engine, 'ws://localhost:8080/state-sync', [
  'user.profile',
  'app.settings',
  'collaboration.data',
])
```

## 状态性能优化

### 状态分片

```typescript
class StateSharding {
  private shards = new Map<string, Map<string, any>>()

  constructor(private engine: Engine) {}

  // 创建分片
  createShard(shardName: string) {
    if (!this.shards.has(shardName)) {
      this.shards.set(shardName, new Map())
    }
    return this.getShardAPI(shardName)
  }

  private getShardAPI(shardName: string) {
    const shard = this.shards.get(shardName)!

    return {
      set: (key: string, value: any) => {
        shard.set(key, value)
        this.engine.events.emit(`shard:${shardName}:changed`, { key, value })
      },

      get: (key: string) => shard.get(key),

      has: (key: string) => shard.has(key),

      delete: (key: string) => {
        const deleted = shard.delete(key)
        if (deleted) {
          this.engine.events.emit(`shard:${shardName}:deleted`, { key })
        }
        return deleted
      },

      clear: () => {
        shard.clear()
        this.engine.events.emit(`shard:${shardName}:cleared`)
      },

      size: () => shard.size,

      keys: () => Array.from(shard.keys()),

      values: () => Array.from(shard.values()),

      entries: () => Array.from(shard.entries()),
    }
  }

  // 获取分片
  getShard(shardName: string) {
    return this.getShardAPI(shardName)
  }

  // 分片统计
  getStats() {
    const stats = new Map<string, number>()
    this.shards.forEach((shard, name) => {
      stats.set(name, shard.size)
    })
    return stats
  }
}

// 使用状态分片
const sharding = new StateSharding(engine)

// 创建用户数据分片
const userShard = sharding.createShard('users')
const postShard = sharding.createShard('posts')

// 分片操作
userShard.set('user:1', { id: 1, name: 'John' })
userShard.set('user:2', { id: 2, name: 'Jane' })

postShard.set('post:1', { id: 1, title: 'Hello World', authorId: 1 })

// 监听分片变化
engine.events.on('shard:users:changed', ({ key, value }) => {
  console.log(`用户分片变化: ${key}`, value)
})
```

### 状态懒加载

```typescript
class LazyState {
  private loaders = new Map<string, () => Promise<any>>()
  private loaded = new Set<string>()
  private loading = new Set<string>()

  constructor(private engine: Engine) {}

  // 注册懒加载器
  register(key: string, loader: () => Promise<any>) {
    this.loaders.set(key, loader)
  }

  // 懒加载状态
  async load(key: string): Promise<any> {
    // 如果已加载，直接返回
    if (this.loaded.has(key)) {
      return this.engine.state.get(key)
    }

    // 如果正在加载，等待完成
    if (this.loading.has(key)) {
      return new Promise((resolve) => {
        const checkLoaded = () => {
          if (this.loaded.has(key)) {
            resolve(this.engine.state.get(key))
          }
          else {
            setTimeout(checkLoaded, 10)
          }
        }
        checkLoaded()
      })
    }

    // 开始加载
    const loader = this.loaders.get(key)
    if (!loader) {
      throw new Error(`No loader registered for key: ${key}`)
    }

    this.loading.add(key)

    try {
      const value = await loader()
      this.engine.state.set(key, value)
      this.loaded.add(key)
      this.loading.delete(key)

      this.engine.events.emit('state:lazy-loaded', { key, value })
      return value
    }
    catch (error) {
      this.loading.delete(key)
      this.engine.events.emit('state:lazy-load-error', { key, error })
      throw error
    }
  }

  // 预加载
  async preload(keys: string[]) {
    const promises = keys.map(key => this.load(key))
    return Promise.allSettled(promises)
  }

  // 卸载状态
  unload(key: string) {
    this.engine.state.remove(key)
    this.loaded.delete(key)
    this.engine.events.emit('state:unloaded', { key })
  }
}

// 使用懒加载状态
const lazyState = new LazyState(engine)

// 注册懒加载器
lazyState.register('user.posts', async () => {
  const userId = engine.state.get('user.profile.id')
  const response = await fetch(`/api/users/${userId}/posts`)
  return response.json()
})

lazyState.register('app.config', async () => {
  const response = await fetch('/api/config')
  return response.json()
})

// 懒加载使用
async function showUserPosts() {
  try {
    engine.state.set('ui.loading', true)
    const posts = await lazyState.load('user.posts')
    console.log('用户文章:', posts)
  }
  catch (error) {
    engine.notifications.error('加载文章失败')
  }
  finally {
    engine.state.set('ui.loading', false)
  }
}

// 预加载关键数据
lazyState.preload(['app.config', 'user.preferences'])
```

## 状态测试

### 状态模拟

```typescript
class StateMocker {
  private originalState: Map<string, any> = new Map()
  private mocked = false

  constructor(private engine: Engine) {}

  // 开始模拟
  mock(mockState: Record<string, any>) {
    if (this.mocked) {
      throw new Error('State is already mocked')
    }

    // 保存原始状态
    const currentState = this.engine.state.getAll()
    Object.entries(currentState).forEach(([key, value]) => {
      this.originalState.set(key, value)
    })

    // 清空并设置模拟状态
    this.engine.state.clear()
    Object.entries(mockState).forEach(([key, value]) => {
      this.engine.state.set(key, value)
    })

    this.mocked = true
  }

  // 恢复原始状态
  restore() {
    if (!this.mocked) {
      return
    }

    this.engine.state.clear()
    this.originalState.forEach((value, key) => {
      this.engine.state.set(key, value)
    })

    this.originalState.clear()
    this.mocked = false
  }

  // 部分模拟
  mockPartial(mockState: Record<string, any>) {
    Object.entries(mockState).forEach(([key, value]) => {
      if (!this.originalState.has(key)) {
        this.originalState.set(key, this.engine.state.get(key))
      }
      this.engine.state.set(key, value)
    })
    this.mocked = true
  }
}

// 在测试中使用
describe('状态测试', () => {
  let stateMocker: StateMocker

  beforeEach(() => {
    stateMocker = new StateMocker(engine)
  })

  afterEach(() => {
    stateMocker.restore()
  })

  it('应该正确处理用户登录状态', () => {
    // 模拟登录状态
    stateMocker.mock({
      'user.profile': { id: 1, name: 'Test User' },
      'user.isAuthenticated': true,
    })

    // 测试依赖于状态的功能
    const isLoggedIn = userService.isLoggedIn()
    expect(isLoggedIn).toBe(true)

    const userName = userService.getCurrentUserName()
    expect(userName).toBe('Test User')
  })
})
```

## 状态最佳实践总结

### 1. 架构设计

- **模块化**: 按功能域组织状态结构
- **层次化**: 使用嵌套结构表达关系
- **标准化**: 统一状态键命名规范
- **类型安全**: 使用 TypeScript 定义状态类型

### 2. 性能优化

- **分片**: 大型状态使用分片管理
- **懒加载**: 按需加载非关键状态
- **缓存**: 缓存计算结果和派生状态
- **批处理**: 批量更新减少通知次数

### 3. 数据一致性

- **事务**: 使用事务保证原子性
- **锁定**: 防止并发修改冲突
- **验证**: 确保状态数据有效性
- **同步**: 多端状态保持一致

### 4. 开发体验

- **调试**: 提供状态变化追踪
- **测试**: 支持状态模拟和快照
- **文档**: 记录状态结构和用法
- **工具**: 集成开发者工具

通过状态管理系统，你可以构建可预测、可调试的应用状态，实现复杂的状态逻辑和数据流管理。
