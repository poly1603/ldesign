# 🚀 @ldesign/cache

> 一个功能强大、智能高效的浏览器缓存管理器库

[![npm version](https://img.shields.io/npm/v/@ldesign/cache.svg)](https://www.npmjs.com/package/@ldesign/cache)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Vue 3](https://img.shields.io/badge/Vue%203-Ready-green.svg)](https://vuejs.org/)
[![Test Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg)](./coverage)
[![License](https://img.shields.io/npm/l/@ldesign/cache.svg)](./LICENSE)

## ✨ 特性亮点

### 🎯 多存储引擎支持

- **localStorage** - 持久化存储小量数据
- **sessionStorage** - 会话级存储
- **Cookie** - 需要服务器交互的数据
- **IndexedDB** - 大量结构化数据存储
- **Memory** - 高性能临时缓存

### 🧠 智能存储策略

根据数据特征自动选择最适合的存储引擎：

- 📏 **数据大小** - 小数据用 localStorage，大数据用 IndexedDB
- ⏰ **过期时间** - 短期用内存，长期用持久化存储
- 🏷️ **数据类型** - 简单类型用 localStorage，复杂对象用 IndexedDB

### 🔒 安全特性

- 🔐 **键名混淆** - 防止键名泄露
- 🛡️ **数据加密** - AES 加密保护敏感数据
- 🔧 **自定义算法** - 支持自定义加密和混淆算法

### 🎨 Vue 3 深度集成

- 📦 **丰富的组合式函数** - 提供多种专用的缓存管理函数
- 🔄 **响应式缓存** - 自动同步缓存与组件状态，支持双向绑定
- 📊 **统计监控** - `useCacheStats()` 实时监控缓存性能
- 🎯 **类型化支持** - 完整的 TypeScript 类型支持，提供最佳开发体验
- ⚡ **性能优化** - 内置防抖、节流和自动保存机制

## 🚀 快速开始

### 安装

```bash
# 使用 pnpm（推荐）
pnpm add @ldesign/cache

# 使用 npm
npm install @ldesign/cache

# 使用 yarn
yarn add @ldesign/cache
```

### 基础使用

```typescript
import { createCache } from '@ldesign/cache'

// 创建缓存管理器
const cache = createCache({
  defaultEngine: 'localStorage',
  defaultTTL: 24 * 60 * 60 * 1000, // 24小时
  security: {
    encryption: { enabled: true },
    obfuscation: { enabled: true },
  },
})

// 设置缓存
await cache.set('user-profile', {
  name: '张三',
  age: 25,
  preferences: ['编程', '阅读'],
})

// 获取缓存
const profile = await cache.get('user-profile')
console.log(profile) // { name: '张三', age: 25, preferences: ['编程', '阅读'] }

// 设置带过期时间的缓存
await cache.set('temp-data', 'temporary', { ttl: 5000 }) // 5秒后过期
```

### Vue 3 集成

#### 基础缓存管理

```vue
<template>
  <div>
    <h2>用户资料</h2>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <div v-else>
      <p>姓名: {{ userProfile?.name }}</p>
      <p>年龄: {{ userProfile?.age }}</p>
      <button @click="updateProfile">更新资料</button>
    </div>

    <div class="stats">
      <h3>缓存统计</h3>
      <p>总项目数: {{ stats?.totalItems }}</p>
      <p>总大小: {{ formattedStats?.totalSizeFormatted }}</p>
      <p>命中率: {{ formattedStats?.hitRatePercentage }}%</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCache, useCacheStats } from '@ldesign/cache/vue'

// 使用缓存
const { set, get, loading, error } = useCache({
  defaultEngine: 'localStorage',
  keyPrefix: 'app_',
})

// 使用缓存统计
const { stats, formattedStats, refresh } = useCacheStats({
  refreshInterval: 5000, // 每5秒刷新
})

// 响应式用户资料
const userProfile = ref(null)

// 加载用户资料
onMounted(async () => {
  userProfile.value = await get('user-profile')
})

// 更新资料
const updateProfile = async () => {
  const newProfile = {
    name: '李四',
    age: 30,
    lastUpdated: new Date().toISOString(),
  }

  await set('user-profile', newProfile)
  userProfile.value = newProfile
}
</script>
```

#### 专用组合式函数

```vue
<template>
  <div>
    <!-- 简单值缓存 -->
    <div>
      <h3>用户名</h3>
      <input v-model="username" placeholder="输入用户名" />
      <p>当前值: {{ username }}</p>
    </div>

    <!-- 列表管理 -->
    <div>
      <h3>待办事项</h3>
      <input v-model="newTodo" @keyup.enter="addTodo" placeholder="添加待办事项" />
      <ul>
        <li v-for="(todo, index) in todos" :key="index">
          {{ todo }}
          <button @click="removeTodo(index)">删除</button>
        </li>
      </ul>
    </div>

    <!-- 计数器 -->
    <div>
      <h3>访问计数</h3>
      <p>访问次数: {{ count }}</p>
      <button @click="increment">增加</button>
      <button @click="decrement">减少</button>
      <button @click="reset">重置</button>
    </div>

    <!-- 对象管理 -->
    <div>
      <h3>用户设置</h3>
      <label>
        <input type="checkbox" v-model="settings.notifications" />
        启用通知
      </label>
      <label>
        主题:
        <select v-model="settings.theme">
          <option value="light">浅色</option>
          <option value="dark">深色</option>
        </select>
      </label>
    </div>

    <!-- 异步数据 -->
    <div>
      <h3>用户信息</h3>
      <div v-if="userLoading">加载中...</div>
      <div v-else-if="userError">错误: {{ userError.message }}</div>
      <div v-else>
        <p>ID: {{ userData?.id }}</p>
        <p>邮箱: {{ userData?.email }}</p>
        <button @click="refreshUser">刷新</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  useCacheValue,
  useCacheList,
  useCacheCounter,
  useCacheObject,
  useCacheAsync
} from '@ldesign/cache/vue'

// 简单值缓存 - 自动保存用户名
const username = useCacheValue('username', '', {
  autoSave: { debounce: 500 } // 500ms 防抖保存
})

// 列表管理 - 待办事项
const { items: todos, add: addTodo, remove: removeTodo } = useCacheList<string>('todos', [])
const newTodo = ref('')

const addTodo = () => {
  if (newTodo.value.trim()) {
    add(newTodo.value.trim())
    newTodo.value = ''
  }
}

// 计数器 - 访问次数
const { count, increment, decrement, reset } = useCacheCounter('visit-count', 0, {
  min: 0,
  max: 999
})

// 对象管理 - 用户设置
const settings = useCacheObject('user-settings', {
  notifications: true,
  theme: 'light'
}, {
  autoSave: { throttle: 1000 } // 1秒节流保存
})

// 异步数据 - 用户信息
const {
  data: userData,
  loading: userLoading,
  error: userError,
  refresh: refreshUser
} = useCacheAsync('user-info', async () => {
  const response = await fetch('/api/user')
  return response.json()
}, {
  ttl: 5 * 60 * 1000, // 5分钟缓存
  staleWhileRevalidate: true // 后台更新
})
</script>
```

## 📖 详细文档

- 文档开发：`pnpm docs:dev`
- 文档构建：`pnpm docs:build`
- 文档预览：`pnpm docs:preview`

### Vue 组合式函数 API

#### `useCache(options?)`
基础缓存管理函数，提供完整的缓存操作能力。

```typescript
const {
  set, get, remove, clear, has,
  loading, error,
  cache, // 响应式缓存实例
  enableAutoSave, disableAutoSave,
  isEmpty, isValid, hasError, isReady
} = useCache({
  defaultEngine: 'localStorage',
  keyPrefix: 'app_',
  defaultTTL: 24 * 60 * 60 * 1000
})
```

#### `useCacheValue<T>(key, defaultValue, options?)`
管理单个缓存值，支持响应式双向绑定。

```typescript
const username = useCacheValue('username', '', {
  autoSave: { debounce: 500, throttle: 1000 }
})
// 直接修改 username.value 会自动保存到缓存
```

#### `useCacheList<T>(key, defaultValue, options?)`
管理数组类型的缓存数据。

```typescript
const {
  items, add, remove, update, clear,
  length, isEmpty
} = useCacheList<string>('todos', [])
```

#### `useCacheObject<T>(key, defaultValue, options?)`
管理对象类型的缓存数据。

```typescript
const settings = useCacheObject('settings', { theme: 'light' }, {
  autoSave: { throttle: 1000 }
})
// 支持深度响应式，修改 settings.theme 会自动保存
```

#### `useCacheCounter(key, defaultValue, options?)`
管理数值计数器。

```typescript
const {
  count, increment, decrement, reset,
  canIncrement, canDecrement
} = useCacheCounter('counter', 0, {
  min: 0, max: 100, step: 1
})
```

#### `useCacheBoolean(key, defaultValue, options?)`
管理布尔值。

```typescript
const { value, toggle, setTrue, setFalse } = useCacheBoolean('feature-enabled', false)
```

#### `useCacheAsync<T>(key, fetcher, options?)`
管理异步数据，支持 SWR 模式。

```typescript
const {
  data, loading, error,
  refresh, mutate
} = useCacheAsync('user-data', fetchUserData, {
  ttl: 5 * 60 * 1000,
  staleWhileRevalidate: true
})
```

#### `useCacheStats(options?)`
监控缓存性能统计。

```typescript
const {
  stats, formattedStats,
  refresh, startAutoRefresh, stopAutoRefresh
} = useCacheStats({
  refreshInterval: 5000
})
```

### 配置选项

```typescript
interface CacheOptions {
  // 基础配置
  defaultEngine?: 'localStorage' | 'sessionStorage' | 'cookie' | 'indexedDB' | 'memory'
  defaultTTL?: number // 默认过期时间（毫秒）
  keyPrefix?: string // 键前缀
  debug?: boolean // 调试模式

  // 安全配置
  security?: {
    encryption?: {
      enabled: boolean
      algorithm?: 'AES' | 'custom'
      secretKey?: string
      customEncrypt?: (data: string) => string
      customDecrypt?: (data: string) => string
    }
    obfuscation?: {
      enabled: boolean
      prefix?: string
      algorithm?: 'hash' | 'base64' | 'custom'
      customObfuscate?: (key: string) => string
      customDeobfuscate?: (key: string) => string
    }
  }

  // 智能策略配置
  strategy?: {
    enabled: boolean
    sizeThresholds?: {
      small: number // 小数据阈值
      medium: number // 中等数据阈值
      large: number // 大数据阈值
    }
    ttlThresholds?: {
      short: number // 短期缓存阈值
      medium: number // 中期缓存阈值
      long: number // 长期缓存阈值
    }
    enginePriority?: StorageEngine[] // 引擎优先级
  }

  // 存储引擎配置
  engines?: {
    localStorage?: { maxSize?: number, keyPrefix?: string }
    sessionStorage?: { maxSize?: number, keyPrefix?: string }
    cookie?: { domain?: string, path?: string, secure?: boolean }
    indexedDB?: { dbName?: string, version?: number, storeName?: string }
    memory?: { maxSize?: number, cleanupInterval?: number }
  }
}
```

### 高级用法

#### 1. 自定义加密算法

```typescript
const cache = createCache({
  security: {
    encryption: {
      enabled: true,
      algorithm: 'custom',
      customEncrypt: (data) => {
        // 你的自定义加密逻辑
        return btoa(data) // 简单的 Base64 示例
      },
      customDecrypt: (data) => {
        // 你的自定义解密逻辑
        return atob(data)
      },
    },
  },
})
```

#### 2. 智能存储策略

```typescript
const cache = createCache({
  strategy: {
    enabled: true,
    sizeThresholds: {
      small: 1024, // 1KB 以下用 localStorage
      medium: 64 * 1024, // 64KB 以下用 sessionStorage
      large: 1024 * 1024, // 1MB 以上用 IndexedDB
    },
    ttlThresholds: {
      short: 5 * 60 * 1000, // 5分钟以下用内存
      medium: 24 * 60 * 60 * 1000, // 24小时以下用 sessionStorage
      long: 7 * 24 * 60 * 60 * 1000, // 7天以上用 localStorage
    },
  },
})

// 库会自动选择最适合的存储引擎
await cache.set('large-dataset', bigData) // 自动选择 IndexedDB
await cache.set('temp-token', token, { ttl: 1000 }) // 自动选择内存缓存
```

#### 3. 事件监听

```typescript
// 监听缓存事件
cache.on('set', (event) => {
  console.log(`缓存设置: ${event.key} -> ${event.engine}`)
})

cache.on('expired', (event) => {
  console.log(`缓存过期: ${event.key}`)
})

cache.on('error', (event) => {
  console.error(`缓存错误: ${event.error?.message}`)
})
```

#### 4. 批量操作

```typescript
// 批量设置
const items = [
  { key: 'user1', value: { name: '用户1' } },
  { key: 'user2', value: { name: '用户2' } },
  { key: 'user3', value: { name: '用户3' } },
]

await Promise.all(items.map(item => cache.set(item.key, item.value)))

// 批量获取
const keys = ['user1', 'user2', 'user3']
const values = await Promise.all(keys.map(key => cache.get(key)))
```

## 🎯 新增功能

### 🔄 批量操作

高效处理大量数据：

```typescript
// 批量设置
const results = await cache.mset([
  { key: 'user:1', value: user1, options: { ttl: 3600000 } },
  { key: 'user:2', value: user2 },
  { key: 'user:3', value: user3 },
])

// 批量获取
const users = await cache.mget(['user:1', 'user:2', 'user:3'])
// { 'user:1': {...}, 'user:2': {...}, 'user:3': null }

// 批量删除
const removeResults = await cache.mremove(['user:1', 'user:2'])

// 批量检查
const exists = await cache.mhas(['user:1', 'user:2'])
// { 'user:1': true, 'user:2': false }
```

### 📁 命名空间

按模块隔离缓存：

```typescript
import { createNamespace } from '@ldesign/cache'

// 创建根命名空间
const rootNs = createNamespace('app')

// 创建子命名空间
const userNs = rootNs.namespace('user')
const authNs = rootNs.namespace('auth')

// 使用命名空间
await userNs.set('profile', userProfile)  // 键: app:user:profile
await authNs.set('token', token)         // 键: app:auth:token

// 清空命名空间
await userNs.clear()  // 仅清空 user 命名空间
await rootNs.clear(true)  // 清空所有命名空间

// 导出/导入数据
const data = await userNs.export()
await userNs.import(data)
```

### 🔄 跨标签页同步

实时同步缓存数据：

```typescript
import { SyncManager } from '@ldesign/cache'

const sync = new SyncManager(cache, {
  enabled: true,
  channel: 'my-app-cache',
  debounce: 100,
  engines: ['localStorage'],
  events: ['set', 'remove', 'clear'],
})

// 监听同步事件
sync.on('sync', (message) => {
  console.log('同步消息:', message)
})

// 请求全量同步
await sync.requestSync()
```

### 🔥 缓存预热

导入导出和预热缓存：

```typescript
import { WarmupManager } from '@ldesign/cache'

const warmup = new WarmupManager(cache)

// 导出缓存
const exported = await warmup.export(
  key => key.startsWith('important:')  // 仅导出重要数据
)

// 导入缓存
await warmup.import(exported, {
  overwrite: false,  // 不覆盖已存在的
  prefix: 'imported:',  // 添加前缀
})

// 预热缓存
await warmup.warmup([
  { key: 'config', fetcher: () => fetch('/api/config').then(r => r.json()) },
  { key: 'user', fetcher: () => fetch('/api/user').then(r => r.json()) },
])

// 从 URL 预热
await warmup.warmupFromUrl('https://api.example.com/cache-data.json')
```

### 🌪️ 淘汰策略

支持多种淘汰策略：

```typescript
import { EvictionStrategyFactory } from '@ldesign/cache'

// 创建策略
const lru = EvictionStrategyFactory.create('LRU')  // 最近最少使用
const lfu = EvictionStrategyFactory.create('LFU')  // 最不常用
const fifo = EvictionStrategyFactory.create('FIFO')  // 先进先出
const ttl = EvictionStrategyFactory.create('TTL')  // TTL 优先
const arc = EvictionStrategyFactory.create('ARC')  // 自适应策略

// 记录访问
lru.recordAccess('key1')
lru.recordAdd('key2')

// 获取应淘汰的键
const evictKey = lru.getEvictionKey()
if (evictKey) {
  await cache.remove(evictKey)
}

// 获取统计
const stats = lru.getStats()
```

### 💾 自动保存 (Vue)

响应式缓存带节流自动保存：

```vue
<script setup>
import { useCache } from '@ldesign/cache/vue'

const { useReactiveCache } = useCache()

// 创建响应式缓存
const draft = useReactiveCache('form-draft', {
  title: '',
  content: '',
})

// 启用自动保存（节流 500ms）
const stopAutoSave = draft.enableAutoSave({
  ttl: 30 * 60 * 1000,  // 30分钟过期
  throttle: 500,  // 节流 500ms
})

// 需要时停止自动保存
onUnmounted(() => {
  stopAutoSave()
})
</script>

<template>
  <form>
    <input v-model="draft.value.value.title" />
    <textarea v-model="draft.value.value.content" />
  </form>
</template>
```

### 📊 性能监控

实时监控缓存性能：

```typescript
import { PerformanceMonitor } from '@ldesign/cache'

const monitor = new PerformanceMonitor({
  enabled: true,
  slowThreshold: 100,  // 慢操作阈值 100ms
  samplingRate: 0.1,   // 10% 采样率
  collector: (metrics) => {
    // 发送到监控系统
    console.log('性能指标:', metrics)
  },
})

// 监听慢操作
monitor.on('slow', (metrics) => {
  console.warn(`慢操作: ${metrics.operation} 耗时 ${metrics.duration}ms`)
})

// 测量操作
await monitor.measure('cache.set', async () => {
  await cache.set('key', 'value')
}, { key: 'key', engine: 'localStorage' })

// 获取统计
const stats = monitor.getStats()
const percentiles = monitor.getPercentiles([50, 95, 99])

// 生成报告
console.log(monitor.generateReport())
```

### 🔄 重试与容错

自动重试、断路器、降级策略：

```typescript
import { 
  RetryManager, 
  CircuitBreaker, 
  FallbackHandler,
  withRetry,
  withCircuitBreaker,
  withFallback 
} from '@ldesign/cache'

// 自动重试
const retry = new RetryManager()
const result = await retry.retry(
  () => fetch('/api/data').then(r => r.json()),
  {
    maxAttempts: 3,
    strategy: 'exponential',
    jitter: true,
    onRetry: (error, attempt) => {
      console.log(`重试 ${attempt} 次: ${error.message}`)
    },
  }
)

// 断路器
const breaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000,
})

try {
  await breaker.execute(() => riskyOperation())
} catch (error) {
  if (error.message === 'Circuit breaker is OPEN') {
    console.log('服务不可用，请稍后重试')
  }
}

// 降级策略
const fallback = new FallbackHandler<any>()
  .addFallback(() => getFromCache())
  .addFallback(() => getDefaultValue())

const data = await fallback.execute(
  () => getFromAPI(),
  {
    onFallback: (level, error) => {
      console.log(`降级到方案 ${level}: ${error.message}`)
    },
  }
)

// 装饰器模式
const fetchWithRetry = withRetry(fetch, { maxAttempts: 3 })
const fetchWithBreaker = withCircuitBreaker(fetch)
const fetchWithFallback = withFallback(
  () => fetch('/api/data'),
  () => fetch('/api/backup'),
  () => Promise.resolve({ default: true })
)
```

### 🗜️ 数据压缩

自动压缩大数据，减少存储空间占用：

```typescript
import { withCompression, Compressor } from '@ldesign/cache'

// 使用压缩装饰器
const compressedCache = withCompression(cache, {
  enabled: true,
  algorithm: 'gzip', // 'gzip' | 'deflate' | 'brotli' | 'none'
  minSize: 1024, // 最小压缩大小（1KB）
  level: 6, // 压缩级别（1-9）
})

// 存储大数据（会自动压缩）
await compressedCache.set('largeData', bigJsonObject)
const data = await compressedCache.get('largeData') // 自动解压

// 直接使用压缩器
const compressor = new Compressor({
  algorithm: 'gzip',
  minSize: 500,
})

const result = await compressor.compress(JSON.stringify(data))
console.log(`压缩率: ${(result.ratio * 100).toFixed(1)}%`)
console.log(`节省空间: ${result.originalSize - result.compressedSize} bytes`)

// 获取压缩建议
const stats = compressor.getCompressionStats(jsonString)
console.log(`推荐算法: ${stats.recommendedAlgorithm}`)
console.log(`预计节省: ${stats.potentialSavings} bytes`)
```

### 🚀 智能预取

基于访问模式预测和预加载数据：

```typescript
import { withPrefetching, Prefetcher } from '@ldesign/cache'

// 使用预取装饰器
const smartCache = withPrefetching(cache, {
  maxConcurrent: 3, // 最大并发预取数
  timeout: 5000, // 预取超时
  enablePredictive: true, // 启用预测性预取
  predictionWindow: 5, // 预测窗口大小
  minConfidence: 0.6, // 最小置信度
  prefetchOnIdle: true, // 空闲时预取
  idleThreshold: 2000, // 空闲阈值（毫秒）
})

// 添加预取规则
smartCache.prefetcher.addRule({
  id: 'user-profile',
  trigger: (context) => {
    // 当访问用户列表时，预取用户详情
    return context.currentKey?.startsWith('users/list')
  },
  keys: (context) => {
    // 根据上下文生成需要预取的键
    return ['users/1', 'users/2', 'users/3']
  },
  fetcher: async (key) => {
    // 获取数据的函数
    return fetch(`/api/${key}`).then(r => r.json())
  },
  priority: 10, // 高优先级
  strategy: 'eager', // 立即预取
})

// 访问数据（会触发预取和预测）
const userList = await smartCache.get('users/list')
// 后续访问可能已经被预取
const user1 = await smartCache.get('users/1') // 即时返回

// 手动预取
await smartCache.prefetcher.prefetch(
  ['posts/1', 'posts/2', 'posts/3'],
  async (key) => fetch(`/api/${key}`).then(r => r.json()),
  { priority: 5, strategy: 'lazy' }
)

// 获取预取统计
const stats = smartCache.prefetcher.getStats()
console.log(`预取任务: ${stats.totalTasks}`)
console.log(`访问模式: ${stats.patterns}`)
console.log(`预测: `, stats.predictions)
```

## 🎉 使用场景

### 1. 用户状态管理

```typescript
// 保存用户登录状态
await cache.set(
  'user-session',
  {
    token: 'jwt-token',
    userId: 123,
    permissions: ['read', 'write'],
  },
  {
    ttl: 2 * 60 * 60 * 1000, // 2小时过期
    encrypt: true, // 加密敏感信息
  }
)
```

### 2. API 响应缓存

```typescript
// 缓存 API 响应
const cacheKey = `api-users-${page}-${pageSize}`
let users = await cache.get(cacheKey)

if (!users) {
  users = await fetchUsers(page, pageSize)
  await cache.set(cacheKey, users, { ttl: 5 * 60 * 1000 }) // 5分钟缓存
}
```

### 3. 表单数据暂存

```typescript
// 自动保存表单数据
const formCache = cache.useReactiveCache('form-draft', {})
const stopAutoSave = formCache.enableAutoSave({ ttl: 30 * 60 * 1000 }) // 30分钟

// 表单数据会自动保存到缓存
formCache.value.value = {
  name: '张三',
  email: 'zhangsan@example.com',
}
```

### 4. 大数据集缓存

```typescript
// 缓存大型数据集
await cache.set('large-dataset', {
  records: Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    data: `record-${i}`,
  })),
}) // 自动选择 IndexedDB 存储
```

## 📊 性能特性

### 智能引擎选择

- 🔍 **自动检测** - 根据数据特征自动选择最优存储引擎
- ⚡ **性能优化** - 内存缓存用于高频访问，IndexedDB 用于大数据
- 📈 **统计监控** - 实时监控命中率、存储使用情况

### 内存管理

- 🧹 **自动清理** - 定期清理过期项
- 💾 **空间管理** - 智能释放存储空间
- 📏 **大小限制** - 防止存储溢出

## 🔧 API 参考

### CacheManager

```typescript
class CacheManager {
  // 基础操作
  set<T>(key: string, value: T, options?: SetOptions): Promise<void>
  get<T>(key: string): Promise<T | null>
  remove(key: string): Promise<void>
  clear(engine?: StorageEngine): Promise<void>
  has(key: string): Promise<boolean>

  // 批量操作
  keys(engine?: StorageEngine): Promise<string[]>
  getMetadata(key: string): Promise<CacheMetadata | null>

  // 统计和监控
  getStats(): Promise<CacheStats>
  cleanup(): Promise<void>

  // 事件监听
  on(event: CacheEventType, listener: CacheEventListener): void
  off(event: CacheEventType, listener: CacheEventListener): void

  // 生命周期
  destroy(): Promise<void>
}
```

### Vue 组合式函数

```typescript
// useCache
const {
  set,
  get,
  remove,
  clear,
  has,
  keys,
  loading,
  error,
  isReady,
  hasError,
  useReactiveCache,
  getStats,
  cleanup,
} = useCache(options)

// useCacheStats
const { stats, formattedStats, engineUsage, performanceMetrics, refresh, cleanupAndRefresh }
  = useCacheStats({ refreshInterval: 5000 })
```

## 🛠️ 开发指南

### 本地开发

```bash
# 克隆项目
git clone https://github.com/ldesign/ldesign.git
cd ldesign/packages/cache

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 运行测试
pnpm test

# 构建
pnpm build
```

### 测试

```bash
# 运行所有测试
pnpm test:run

# 测试覆盖率
pnpm test:coverage

# E2E 测试
pnpm test:e2e

# 测试 UI
pnpm test:ui
```

## 📊 性能表现

### 基准测试结果

| 引擎         | 设置 (ops/sec) | 获取 (ops/sec) | 包大小           |
| ------------ | -------------- | -------------- | ---------------- |
| Memory       | 1,000,000      | 2,000,000      | ~45KB            |
| localStorage | 10,000         | 20,000         | (Gzipped: ~15KB) |
| IndexedDB    | 2,000          | 5,000          |                  |

### 测试覆盖率

- ✅ **单元测试**: 70 个测试用例全部通过
- ✅ **集成测试**: 覆盖所有主要功能
- ✅ **E2E 测试**: 真实浏览器环境验证
- 📊 **覆盖率**: 57.73% (持续提升中)

## 🌍 浏览器支持

| 浏览器  | 版本 | localStorage | sessionStorage | Cookie | IndexedDB | Memory |
| ------- | ---- | ------------ | -------------- | ------ | --------- | ------ |
| Chrome  | 60+  | ✅           | ✅             | ✅     | ✅        | ✅     |
| Firefox | 55+  | ✅           | ✅             | ✅     | ✅        | ✅     |
| Safari  | 12+  | ✅           | ✅             | ✅     | ✅        | ✅     |
| Edge    | 79+  | ✅           | ✅             | ✅     | ✅        | ✅     |

## 📚 文档和资源

- 📖 [完整文档](./docs) - 详细的使用指南和 API 文档
- 🎮 [在线演示](./examples) - 交互式功能演示
- 💡 [最佳实践](./docs/guide/best-practices.md) - 生产环境使用建议
- 🔧 [故障排除](./docs/guide/troubleshooting.md) - 常见问题解决方案
- 🎯 [迁移指南](./docs/guide/migration.md) - 从其他库迁移

## 🛠️ 开发

### 本地开发

```bash
# 克隆项目
git clone https://github.com/ldesign/ldesign.git
cd ldesign/packages/cache

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 运行测试
pnpm test

# 构建项目
pnpm build

# 启动文档
pnpm docs:dev

# 启动示例
cd examples && pnpm dev
```

### 测试

```bash
# 运行所有测试
pnpm test:run

# 监听模式测试
pnpm test

# 测试覆盖率
pnpm test:coverage

# E2E 测试
pnpm test:e2e

# 测试 UI
pnpm test:ui
```

### 构建

```bash
# 构建库
pnpm build

# 构建文档
pnpm docs:build

# 类型检查
pnpm type-check

# 代码检查
pnpm lint
```

## 🤝 贡献

我们欢迎所有形式的贡献！

### 贡献方式

1. 🐛 **报告 Bug** - 在 [Issues](https://github.com/ldesign/ldesign/issues) 中报告问题
2. 💡 **功能建议** - 提出新功能想法
3. 📝 **改进文档** - 帮助完善文档
4. 🔧 **提交代码** - 修复 Bug 或添加新功能

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

[MIT](./LICENSE) © LDesign Team

---

<div align="center">

**如果这个项目对你有帮助，请给我们一个 ⭐️**

[GitHub](https://github.com/ldesign/ldesign) • [文档](./docs) • [示例](./examples) •
[讨论](https://github.com/ldesign/ldesign/discussions)

</div>
