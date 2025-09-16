# 基础使用示例

## 🎯 简单缓存操作

### 字符串缓存

```typescript
import { createCache } from '@ldesign/cache'

const cache = createCache()

// 设置字符串
await cache.set('app-name', 'My Awesome App')

// 获取字符串
const appName = await cache.get('app-name')
console.log(appName) // 'My Awesome App'

// 检查是否存在
const exists = await cache.has('app-name')
console.log(exists) // true

// 删除缓存
await cache.remove('app-name')
```

### 对象缓存

```typescript
// 设置对象
const userProfile = {
  id: 1,
  name: '张三',
  email: 'zhangsan@example.com',
  avatar: 'https://example.com/avatar.jpg',
  preferences: {
    theme: 'dark',
    language: 'zh-CN',
    notifications: true,
  },
}

await cache.set('user-profile', userProfile)

// 获取对象
const profile = await cache.get('user-profile')
console.log(profile.name) // '张三'
console.log(profile.preferences.theme) // 'dark'
```

### 数组缓存

```typescript
// 设置数组
const todoList = [
  { id: 1, text: '学习 Vue 3', completed: false },
  { id: 2, text: '使用 @ldesign/cache', completed: true },
  { id: 3, text: '构建应用', completed: false },
]

await cache.set('todo-list', todoList)

// 获取数组
const todos = await cache.get('todo-list')
console.log(todos.length) // 3
console.log(todos[1].text) // '使用 @ldesign/cache'
```

## ⏰ TTL (生存时间) 示例

### 基础 TTL

```typescript
// 设置5分钟后过期的缓存
await cache.set('session-token', 'abc123', {
  ttl: 5 * 60 * 1000, // 5分钟
})

// 立即获取（有效）
const token1 = await cache.get('session-token')
console.log(token1) // 'abc123'

// 5分钟后获取（已过期）
setTimeout(async () => {
  const token2 = await cache.get('session-token')
  console.log(token2) // null
}, 5 * 60 * 1000 + 100)
```

### 不同数据的 TTL 策略

```typescript
// 用户会话 - 2小时
await cache.set('user-session', sessionData, {
  ttl: 2 * 60 * 60 * 1000,
})

// API 响应缓存 - 5分钟
await cache.set('api-users-list', usersList, {
  ttl: 5 * 60 * 1000,
})

// 用户配置 - 30天
await cache.set('user-config', userConfig, {
  ttl: 30 * 24 * 60 * 60 * 1000,
})

// 临时计算结果 - 30秒
await cache.set('calculation-result', result, {
  ttl: 30 * 1000,
})
```

## 🏪 存储引擎示例

### localStorage 示例

```typescript
// 创建专用 localStorage 缓存
const localCache = createCache({
  defaultEngine: 'localStorage',
  keyPrefix: 'app_local_',
})

// 存储用户偏好（持久化）
await localCache.set('user-preferences', {
  theme: 'dark',
  sidebar: 'collapsed',
  language: 'zh-CN',
})

// 页面刷新后仍然可以获取
const preferences = await localCache.get('user-preferences')
```

### sessionStorage 示例

```typescript
// 创建专用 sessionStorage 缓存
const sessionCache = createCache({
  defaultEngine: 'sessionStorage',
  keyPrefix: 'app_session_',
})

// 存储表单草稿（会话级）
await sessionCache.set('form-draft', {
  title: '文章标题',
  content: '文章内容...',
  tags: ['技术', 'Vue'],
})

// 同一会话中可以获取，新标签页无法获取
const draft = await sessionCache.get('form-draft')
```

### Memory 示例

```typescript
// 创建内存缓存（高性能）
const memoryCache = createCache({
  defaultEngine: 'memory',
  engines: {
    memory: {
      maxSize: 50 * 1024 * 1024, // 50MB
      maxItems: 1000,
      cleanupInterval: 5 * 60 * 1000, // 5分钟清理
    },
  },
})

// 缓存计算结果
async function fibonacci(n: number): Promise<number> {
  const cacheKey = `fib:${n}`

  // 检查缓存
  let result = await memoryCache.get(cacheKey)
  if (result !== null) {
    console.log('缓存命中:', n)
    return result
  }

  // 计算结果
  if (n <= 1) {
    result = n
  }
  else {
    result = (await fibonacci(n - 1)) + (await fibonacci(n - 2))
  }

  // 缓存结果
  await memoryCache.set(cacheKey, result, {
    ttl: 10 * 60 * 1000, // 10分钟
  })

  return result
}

// 使用
console.log(await fibonacci(40)) // 第一次计算
console.log(await fibonacci(40)) // 第二次从缓存获取
```

### IndexedDB 示例

```typescript
// 创建 IndexedDB 缓存（大容量）
const dbCache = createCache({
  defaultEngine: 'indexedDB',
  engines: {
    indexedDB: {
      dbName: 'MyAppDB',
      version: 1,
      storeName: 'cache',
    },
  },
})

// 存储大量数据
const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `用户${i}`,
  data: `数据${i}`.repeat(100), // 模拟大数据
}))

await dbCache.set('user-dataset', largeDataset)

// 获取大数据
const dataset = await dbCache.get('user-dataset')
console.log(`加载了 ${dataset.length} 条记录`)
```

### Cookie 示例

```typescript
// 创建 Cookie 缓存
const cookieCache = createCache({
  defaultEngine: 'cookie',
  engines: {
    cookie: {
      domain: '.example.com',
      secure: true,
      sameSite: 'strict',
    },
  },
})

// 存储认证令牌
await cookieCache.set('auth-token', 'jwt-token-here', {
  ttl: 24 * 60 * 60 * 1000, // 24小时
  httpOnly: false, // 允许 JS 访问
  secure: true, // 仅 HTTPS
})

// 存储用户ID
await cookieCache.set('user-id', '12345', {
  ttl: 7 * 24 * 60 * 60 * 1000, // 7天
})
```

## 🧠 智能策略示例

### 启用智能策略

```typescript
const smartCache = createCache({
  strategy: {
    enabled: true,
    debug: true, // 查看策略选择过程
  },
})

// 系统会自动选择最优引擎
await smartCache.set('small-config', { theme: 'dark' })
// → 选择 localStorage（小数据，持久化）

await smartCache.set('large-dataset', bigArray)
// → 选择 IndexedDB（大数据，结构化存储）

await smartCache.set('api-cache', apiResponse, { ttl: 30000 })
// → 选择 Memory（短期，高性能）

await smartCache.set('form-data', formObject, { ttl: 30 * 60 * 1000 })
// → 选择 sessionStorage（中期，会话级）
```

### 自定义策略权重

```typescript
const customCache = createCache({
  strategy: {
    enabled: true,
    weights: {
      size: 0.4, // 数据大小权重
      ttl: 0.3, // TTL 权重
      type: 0.2, // 数据类型权重
      frequency: 0.1, // 访问频率权重
    },
  },
})
```

## 🔒 安全示例

### 数据加密

```typescript
const secureCache = createCache({
  security: {
    encryption: {
      enabled: true,
      secretKey: 'your-256-bit-secret-key-here',
      algorithm: 'AES',
    },
  },
})

// 敏感数据会被自动加密
await secureCache.set('user-password', 'user-secret-password')
await secureCache.set('credit-card', {
  number: '1234-5678-9012-3456',
  cvv: '123',
  expiry: '12/25',
})

// 获取时自动解密
const password = await secureCache.get('user-password')
console.log(password) // 'user-secret-password'
```

### 键名混淆

```typescript
const obfuscatedCache = createCache({
  security: {
    obfuscation: {
      enabled: true,
      algorithm: 'hash',
      prefix: 'secure_',
    },
  },
})

// 键名会被混淆
await obfuscatedCache.set('user-123-profile', userData)
// 实际存储键名: 'secure_a7b8c9d0e1f2g3h4...'

// 获取时自动反混淆
const data = await obfuscatedCache.get('user-123-profile')
```

## 📊 监控示例

### 基础统计

```typescript
// 获取缓存统计信息
const stats = await cache.getStats()

console.log('缓存统计:', {
  总项目数: stats.totalItems,
  总大小: stats.totalSizeFormatted,
  命中率: `${stats.hitRatePercentage}%`,
  未命中次数: stats.missCount,
  过期项目: stats.expiredItems,
})

// 获取引擎使用情况
for (const [engine, engineStats] of Object.entries(stats.engines)) {
  console.log(`${engine}:`, {
    可用: engineStats.available,
    项目数: engineStats.itemCount,
    大小: engineStats.sizeFormatted,
  })
}
```

### 事件监听

```typescript
// 监听缓存操作事件
cache.on('set', (event) => {
  console.log('数据已设置:', {
    键名: event.key,
    引擎: event.engine,
    大小: event.size,
    时间: new Date(event.timestamp),
  })
})

cache.on('get', (event) => {
  console.log('数据已获取:', {
    键名: event.key,
    命中: event.hit,
    引擎: event.engine,
  })
})

cache.on('remove', (event) => {
  console.log('数据已删除:', event.key)
})

cache.on('error', (event) => {
  console.error('缓存错误:', event.error)
})
```

## 🎪 实际应用示例

### 购物车管理

```typescript
class ShoppingCart {
  private cache = createCache({
    keyPrefix: 'cart_',
    defaultTTL: 7 * 24 * 60 * 60 * 1000, // 7天
  })

  async addItem(product: any) {
    const cart = await this.getCart()

    const existingItem = cart.find(item => item.id === product.id)
    if (existingItem) {
      existingItem.quantity += 1
    }
    else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        addedAt: Date.now(),
      })
    }

    await this.cache.set('items', cart)
    return cart
  }

  async removeItem(productId: number) {
    const cart = await this.getCart()
    const filteredCart = cart.filter(item => item.id !== productId)
    await this.cache.set('items', filteredCart)
    return filteredCart
  }

  async getCart() {
    return (await this.cache.get('items')) || []
  }

  async getTotalPrice() {
    const cart = await this.getCart()
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  async clearCart() {
    await this.cache.remove('items')
  }
}

// 使用购物车
const cart = new ShoppingCart()

await cart.addItem({ id: 1, name: 'iPhone 15', price: 5999 })
await cart.addItem({ id: 2, name: 'MacBook Pro', price: 12999 })

const items = await cart.getCart()
const total = await cart.getTotalPrice()

console.log('购物车商品:', items)
console.log('总价:', total)
```

### API 响应缓存

```typescript
class APIClient {
  private cache = createCache({
    keyPrefix: 'api_',
    strategy: { enabled: true },
  })

  async fetchUser(userId: number, useCache = true) {
    const cacheKey = `user:${userId}`

    if (useCache) {
      // 尝试从缓存获取
      const cachedUser = await this.cache.get(cacheKey)
      if (cachedUser !== null) {
        console.log('从缓存获取用户:', userId)
        return cachedUser
      }
    }

    // 从服务器获取
    console.log('从服务器获取用户:', userId)
    const response = await fetch(`/api/users/${userId}`)
    const user = await response.json()

    // 缓存响应（10分钟）
    await this.cache.set(cacheKey, user, {
      ttl: 10 * 60 * 1000,
    })

    return user
  }

  async fetchUserList(page = 1, pageSize = 20) {
    const cacheKey = `users:page:${page}:size:${pageSize}`

    // 检查缓存
    let userList = await this.cache.get(cacheKey)
    if (userList !== null) {
      return userList
    }

    // 获取数据
    const response = await fetch(`/api/users?page=${page}&size=${pageSize}`)
    userList = await response.json()

    // 缓存列表（5分钟）
    await this.cache.set(cacheKey, userList, {
      ttl: 5 * 60 * 1000,
    })

    return userList
  }

  async invalidateUser(userId: number) {
    // 删除用户相关的所有缓存
    const keys = await this.cache.keys()
    const userKeys = keys.filter(key => key.includes(`user:${userId}`))

    for (const key of userKeys) {
      await this.cache.remove(key)
    }
  }
}

// 使用 API 客户端
const api = new APIClient()

// 第一次调用 - 从服务器获取
const user1 = await api.fetchUser(123)

// 第二次调用 - 从缓存获取
const user2 = await api.fetchUser(123)

// 获取用户列表
const userList = await api.fetchUserList(1, 10)
```

### 表单数据自动保存

```typescript
class FormAutoSave {
  private cache = createCache({
    keyPrefix: 'form_',
    defaultEngine: 'sessionStorage',
  })

  private saveTimer: NodeJS.Timeout | null = null

  constructor(private formId: string) {}

  // 保存表单数据（防抖）
  saveFormData(data: any) {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
    }

    this.saveTimer = setTimeout(async () => {
      await this.cache.set(this.formId, {
        data,
        savedAt: Date.now(),
      })
      console.log('表单数据已自动保存')
    }, 1000) // 1秒后保存
  }

  // 加载表单数据
  async loadFormData() {
    const saved = await this.cache.get(this.formId)
    if (saved) {
      console.log('加载表单草稿，保存于:', new Date(saved.savedAt))
      return saved.data
    }
    return null
  }

  // 清除表单数据
  async clearFormData() {
    await this.cache.remove(this.formId)
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
    }
  }
}

// 使用表单自动保存
const formAutoSave = new FormAutoSave('contact-form')

// 模拟表单输入
const formData = {
  name: '张三',
  email: 'zhangsan@example.com',
  message: '这是一条测试消息',
}

// 保存表单数据
formAutoSave.saveFormData(formData)

// 页面刷新后恢复数据
const savedData = await formAutoSave.loadFormData()
if (savedData) {
  console.log('恢复表单数据:', savedData)
}
```

## 🔧 错误处理示例

### 基础错误处理

```typescript
async function safeGetCache(key: string, defaultValue: any = null) {
  try {
    const value = await cache.get(key)
    return value !== null ? value : defaultValue
  }
  catch (error) {
    console.error(`获取缓存失败: ${key}`, error)
    return defaultValue
  }
}

async function safeSetCache(key: string, value: any, options?: any) {
  try {
    await cache.set(key, value, options)
    console.log(`缓存设置成功: ${key}`)
    return true
  }
  catch (error) {
    console.error(`缓存设置失败: ${key}`, error)
    return false
  }
}

// 使用安全函数
const userData = await safeGetCache('user-data', { name: '默认用户' })
const success = await safeSetCache('user-data', newUserData)
```

### 存储配额处理

```typescript
// 处理存储配额超限
cache.on('error', async (event) => {
  if (event.error.name === 'QuotaExceededError') {
    console.warn('存储配额超限，开始清理...')

    // 清理过期数据
    await cache.cleanup()

    // 获取使用情况
    const stats = await cache.getEngineStats(event.engine)
    console.log(`${event.engine} 使用率:`, `${stats.usagePercentage}%`)

    if (stats.usagePercentage > 90) {
      // 清理最久未使用的数据
      await cache.clearLRU(0.2) // 清理20%的数据
    }

    // 重试操作
    try {
      await cache.set(event.key, event.value, { engine: 'memory' })
      console.log('已切换到内存存储')
    }
    catch (retryError) {
      console.error('重试失败:', retryError)
    }
  }
})
```

## 🎯 TypeScript 示例

### 类型安全的缓存

```typescript
// 定义数据类型
interface UserProfile {
  id: number
  name: string
  email: string
  avatar?: string
  preferences: {
    theme: 'light' | 'dark'
    language: string
    notifications: boolean
  }
}

interface AppConfig {
  version: string
  features: string[]
  maintenance: boolean
}

// 类型安全的缓存操作
class TypedCache {
  private cache = createCache()

  async setUserProfile(profile: UserProfile) {
    await this.cache.set('user-profile', profile)
  }

  async getUserProfile(): Promise<UserProfile | null> {
    return await this.cache.get<UserProfile>('user-profile')
  }

  async setAppConfig(config: AppConfig) {
    await this.cache.set('app-config', config)
  }

  async getAppConfig(): Promise<AppConfig | null> {
    return await this.cache.get<AppConfig>('app-config')
  }
}

// 使用类型安全的缓存
const typedCache = new TypedCache()

await typedCache.setUserProfile({
  id: 1,
  name: '张三',
  email: 'zhangsan@example.com',
  preferences: {
    theme: 'dark',
    language: 'zh-CN',
    notifications: true,
  },
})

const profile = await typedCache.getUserProfile()
if (profile) {
  // TypeScript 提供完整的类型检查
  console.log(profile.name) // ✅ 类型安全
  console.log(profile.preferences.theme) // ✅ 类型安全
  // console.log(profile.invalidProperty) // ❌ TypeScript 错误
}
```

## 🔗 下一步

现在你已经掌握了基础用法，可以继续学习：

- [存储引擎详解](/guide/storage-engines) - 深入了解各种存储引擎
- [智能策略](/guide/smart-strategy) - 掌握智能选择策略
- [安全特性](/guide/security) - 学习数据保护功能
- [Vue 集成](/guide/vue-integration) - Vue 3 深度集成
- [最佳实践](/guide/best-practices) - 生产环境最佳实践
