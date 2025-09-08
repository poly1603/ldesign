# 最佳实践

## 🎯 核心原则

### 1. 数据分类管理

根据数据的特性和用途进行分类管理：

```typescript
// ✅ 推荐：按数据特性分类
const cache = createCache({
  strategy: { enabled: true },
})

// 配置数据 - 长期存储
await cache.set('app-config', config, { ttl: 30 * 24 * 60 * 60 * 1000 })

// 会话数据 - 会话级存储
await cache.set('user-session', session, { engine: 'sessionStorage' })

// 临时数据 - 内存存储
await cache.set('api-cache', data, { ttl: 5 * 60 * 1000, engine: 'memory' })
```

### 2. 合理设置 TTL

```typescript
// ✅ 推荐：根据数据特性设置合适的TTL
const TTL = {
  VERY_SHORT: 30 * 1000, // 30秒 - API缓存
  SHORT: 5 * 60 * 1000, // 5分钟 - 临时数据
  MEDIUM: 30 * 60 * 1000, // 30分钟 - 会话数据
  LONG: 24 * 60 * 60 * 1000, // 24小时 - 用户数据
  VERY_LONG: 7 * 24 * 60 * 60 * 1000, // 7天 - 配置数据
}

await cache.set('api-response', data, { ttl: TTL.VERY_SHORT })
await cache.set('user-preferences', prefs, { ttl: TTL.VERY_LONG })
```

### 3. 错误处理

```typescript
// ✅ 推荐：完善的错误处理
async function safeGetCache(key: string, defaultValue: any = null) {
  try {
    const value = await cache.get(key)
    return value !== null ? value : defaultValue
  }
  catch (error) {
    console.error(`缓存获取失败: ${key}`, error)
    return defaultValue
  }
}

async function safeSetCache(key: string, value: any, options?: any) {
  try {
    await cache.set(key, value, options)
    return true
  }
  catch (error) {
    console.error(`缓存设置失败: ${key}`, error)
    return false
  }
}
```

## 建议清单

- 采用命名空间前缀规范（如 app:module:sub:key），并在团队内统一约定。
- 大体量操作使用批量 API（mset/mget/mremove/mhas），导入/迁移/预热尽量分批处理。
- 针对多标签页应用开启同步，并设置前缀过滤与节流。
- 为关键路径数据配置预热，结合监控评估收益。
- 结合错误处理设施（重试/熔断/降级）提高稳定性。

## 🏗️ 架构设计

### 1. 分层缓存策略

```typescript
// 多层缓存架构
class LayeredCache {
  private l1Cache: CacheManager // 内存缓存 - 最快
  private l2Cache: CacheManager // localStorage - 中等
  private l3Cache: CacheManager // IndexedDB - 最大容量

  constructor() {
    this.l1Cache = createCache({ defaultEngine: 'memory' })
    this.l2Cache = createCache({ defaultEngine: 'localStorage' })
    this.l3Cache = createCache({ defaultEngine: 'indexedDB' })
  }

  async get(key: string) {
    // 从 L1 缓存开始查找
    let value = await this.l1Cache.get(key)
    if (value !== null)
      return value

    // L2 缓存
    value = await this.l2Cache.get(key)
    if (value !== null) {
      // 提升到 L1 缓存
      await this.l1Cache.set(key, value, { ttl: 5 * 60 * 1000 })
      return value
    }

    // L3 缓存
    value = await this.l3Cache.get(key)
    if (value !== null) {
      // 提升到上层缓存
      await this.l2Cache.set(key, value)
      await this.l1Cache.set(key, value, { ttl: 5 * 60 * 1000 })
    }

    return value
  }
}
```

### 2. 缓存命名空间

```typescript
// ✅ 推荐：使用命名空间组织缓存
class NamespacedCache {
  private cache: CacheManager

  constructor(namespace: string) {
    this.cache = createCache({
      keyPrefix: `${namespace}:`,
    })
  }

  // 用户相关缓存
  static user = new NamespacedCache('user')

  // 应用配置缓存
  static config = new NamespacedCache('config')

  // API 响应缓存
  static api = new NamespacedCache('api')
}

// 使用
await NamespacedCache.user.set('profile', userProfile)
await NamespacedCache.config.set('theme', 'dark')
await NamespacedCache.api.set('users-list', usersList, { ttl: 5 * 60 * 1000 })
```

## 🚀 性能优化

### 1. 批量操作

```typescript
// ✅ 推荐：使用批量操作
const batchData = {
  'user-name': '张三',
  'user-email': 'zhangsan@example.com',
  'user-theme': 'dark',
}

// 批量设置
await cache.setBatch(batchData)

// 批量获取
const keys = ['user-name', 'user-email', 'user-theme']
const values = await cache.getBatch(keys)

// ❌ 不推荐：逐个操作
for (const [key, value] of Object.entries(batchData)) {
  await cache.set(key, value) // 多次异步调用，性能差
}
```

### 2. 预加载策略

```typescript
// ✅ 推荐：预加载关键数据
class CachePreloader {
  private cache: CacheManager

  constructor(cache: CacheManager) {
    this.cache = cache
  }

  async preloadCriticalData() {
    const criticalKeys = ['user-profile', 'app-config', 'navigation-menu']

    // 并行预加载
    await Promise.all(criticalKeys.map(key => this.cache.get(key)))
  }
}

// 应用启动时预加载
const preloader = new CachePreloader(cache)
await preloader.preloadCriticalData()
```

### 3. 缓存预热

```typescript
// ✅ 推荐：缓存预热
class CacheWarmer {
  private cache: CacheManager

  async warmupCache() {
    // 预热常用数据
    const commonData = await this.fetchCommonData()
    await this.cache.set('common-data', commonData, {
      ttl: 60 * 60 * 1000, // 1小时
    })

    // 预热用户数据
    const userData = await this.fetchUserData()
    await this.cache.set('user-data', userData, {
      ttl: 24 * 60 * 60 * 1000, // 24小时
    })
  }
}
```

## 🔄 数据同步

### 1. 跨标签页同步

```typescript
// ✅ 推荐：实现跨标签页数据同步
class TabSyncCache {
  private cache: CacheManager

  constructor() {
    this.cache = createCache({
      defaultEngine: 'localStorage',
    })

    // 监听存储事件
    window.addEventListener('storage', this.handleStorageChange.bind(this))
  }

  private handleStorageChange(event: StorageEvent) {
    if (event.key?.startsWith(this.cache.keyPrefix)) {
      // 触发本地更新事件
      this.cache.emit('external-change', {
        key: event.key,
        newValue: event.newValue,
        oldValue: event.oldValue,
      })
    }
  }
}
```

### 2. 服务器同步

```typescript
// ✅ 推荐：与服务器数据同步
class ServerSyncCache {
  private cache: CacheManager
  private syncQueue: Array<{ key: string, value: any }> = []

  constructor() {
    this.cache = createCache()

    // 定期同步到服务器
    setInterval(() => {
      this.syncToServer()
    }, 30 * 1000) // 30秒同步一次
  }

  async set(key: string, value: any, options?: any) {
    // 本地缓存
    await this.cache.set(key, value, options)

    // 添加到同步队列
    if (options?.syncToServer !== false) {
      this.syncQueue.push({ key, value })
    }
  }

  private async syncToServer() {
    if (this.syncQueue.length === 0)
      return

    try {
      await fetch('/api/cache/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.syncQueue),
      })

      // 清空同步队列
      this.syncQueue = []
    }
    catch (error) {
      console.error('服务器同步失败:', error)
    }
  }
}
```

## 🔒 安全实践

### 1. 敏感数据处理

```typescript
// ✅ 推荐：敏感数据安全处理
class SecureCache {
  private cache: CacheManager

  constructor() {
    this.cache = createCache({
      security: {
        encryption: { enabled: true },
        obfuscation: { enabled: true },
      },
    })
  }

  // 存储敏感数据
  async setSensitive(key: string, value: any, ttl: number = 15 * 60 * 1000) {
    await this.cache.set(key, value, {
      ttl,
      encrypt: true,
      obfuscateKey: true,
    })

    // 设置自动清理
    setTimeout(() => {
      this.cache.remove(key)
    }, ttl)
  }

  // 获取敏感数据
  async getSensitive(key: string) {
    try {
      return await this.cache.get(key)
    }
    catch (error) {
      console.error('敏感数据获取失败:', error)
      return null
    }
  }
}
```

### 2. 数据验证

```typescript
// ✅ 推荐：数据验证
class ValidatedCache {
  private cache: CacheManager

  async setWithValidation(key: string, value: any, schema: any) {
    // 验证数据格式
    if (!this.validateData(value, schema)) {
      throw new Error('数据格式验证失败')
    }

    await this.cache.set(key, value)
  }

  private validateData(value: any, schema: any): boolean {
    // 实现数据验证逻辑
    return true
  }
}
```

## 📊 监控和调试

### 1. 性能监控

```typescript
// ✅ 推荐：性能监控
class CacheMonitor {
  private cache: CacheManager
  private metrics = {
    hits: 0,
    misses: 0,
    errors: 0,
    totalOperations: 0,
  }

  constructor(cache: CacheManager) {
    this.cache = cache
    this.setupMonitoring()
  }

  private setupMonitoring() {
    this.cache.on('get', (event) => {
      this.metrics.totalOperations++
      if (event.hit) {
        this.metrics.hits++
      }
      else {
        this.metrics.misses++
      }
    })

    this.cache.on('error', () => {
      this.metrics.errors++
    })
  }

  getMetrics() {
    return {
      ...this.metrics,
      hitRate: this.metrics.hits / this.metrics.totalOperations,
      errorRate: this.metrics.errors / this.metrics.totalOperations,
    }
  }
}
```

### 2. 调试工具

```typescript
// ✅ 推荐：调试工具
class CacheDebugger {
  private cache: CacheManager

  constructor(cache: CacheManager) {
    this.cache = cache

    if (process.env.NODE_ENV === 'development') {
      this.enableDebugMode()
    }
  }

  private enableDebugMode() {
    // 监听所有缓存操作
    this.cache.on('*', (event) => {
      console.group(`[Cache] ${event.type}`)
      console.log('Key:', event.key)
      console.log('Engine:', event.engine)
      console.log('Data:', event.data)
      console.log('Timestamp:', new Date(event.timestamp))
      console.groupEnd()
    })
  }

  async dumpCache() {
    const allKeys = await this.cache.keys()
    const dump = {}

    for (const key of allKeys) {
      dump[key] = await this.cache.get(key)
    }

    console.table(dump)
    return dump
  }
}
```

## 🔧 内存管理

### 1. 内存泄漏防护

```typescript
// ✅ 推荐：防止内存泄漏
class MemorySafeCache {
  private cache: CacheManager
  private cleanupTimer: NodeJS.Timeout

  constructor() {
    this.cache = createCache({
      engines: {
        memory: {
          maxSize: 50 * 1024 * 1024, // 50MB限制
          maxItems: 1000, // 最大项目数
          cleanupInterval: 5 * 60 * 1000, // 5分钟清理
        },
      },
    })

    // 定期清理
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, 10 * 60 * 1000) // 10分钟
  }

  private async cleanup() {
    // 清理过期数据
    await this.cache.cleanup()

    // 检查内存使用
    const stats = await this.cache.getEngineStats('memory')
    if (stats.usagePercentage > 80) {
      console.warn('内存缓存使用率过高:', `${stats.usagePercentage}%`)
      // 可以触发额外的清理逻辑
    }
  }

  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    this.cache.destroy()
  }
}
```

### 2. 大数据处理

```typescript
// ✅ 推荐：大数据分块处理
class ChunkedCache {
  private cache: CacheManager
  private chunkSize = 64 * 1024 // 64KB 每块

  async setLargeData(key: string, data: any) {
    const serialized = JSON.stringify(data)

    if (serialized.length <= this.chunkSize) {
      // 小数据直接存储
      await this.cache.set(key, data)
      return
    }

    // 大数据分块存储
    const chunks = this.chunkData(serialized)
    const chunkKeys = []

    for (let i = 0; i < chunks.length; i++) {
      const chunkKey = `${key}:chunk:${i}`
      await this.cache.set(chunkKey, chunks[i], { engine: 'indexedDB' })
      chunkKeys.push(chunkKey)
    }

    // 存储元数据
    await this.cache.set(`${key}:meta`, {
      type: 'chunked',
      chunkKeys,
      totalSize: serialized.length,
    })
  }

  async getLargeData(key: string) {
    // 检查是否为分块数据
    const meta = await this.cache.get(`${key}:meta`)

    if (!meta || meta.type !== 'chunked') {
      // 普通数据
      return await this.cache.get(key)
    }

    // 重组分块数据
    const chunks = []
    for (const chunkKey of meta.chunkKeys) {
      const chunk = await this.cache.get(chunkKey)
      chunks.push(chunk)
    }

    const serialized = chunks.join('')
    return JSON.parse(serialized)
  }

  private chunkData(data: string): string[] {
    const chunks = []
    for (let i = 0; i < data.length; i += this.chunkSize) {
      chunks.push(data.slice(i, i + this.chunkSize))
    }
    return chunks
  }
}
```

## 🎨 Vue 最佳实践

### 1. 组合式函数封装

```typescript
// ✅ 推荐：创建专用的组合式函数
export function useUserProfile() {
  const {
    value: profile,
    set,
    loading,
    error,
  } = useCache('user-profile', {
    defaultValue: {
      name: '',
      email: '',
      avatar: '',
      preferences: {},
    },
    autoSave: true,
    ttl: 24 * 60 * 60 * 1000,
  })

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile.value, ...updates }
    await set(newProfile)
  }

  const resetProfile = async () => {
    await set({
      name: '',
      email: '',
      avatar: '',
      preferences: {},
    })
  }

  return {
    profile,
    updateProfile,
    resetProfile,
    loading,
    error,
  }
}
```

### 2. 响应式缓存模式

```vue
<template>
  <div>
    <!-- 自动保存的表单 -->
    <form @submit.prevent="submitForm">
      <input v-model="formData.name" placeholder="姓名" />
      <input v-model="formData.email" placeholder="邮箱" />
      <textarea v-model="formData.message" placeholder="消息"></textarea>

      <div class="form-status">
        <span v-if="isDirty" class="unsaved">有未保存的更改</span>
        <span v-else class="saved">已保存</span>
      </div>

      <button type="submit">提交</button>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useCache } from '@ldesign/cache/vue'

const { value: formData, set } = useCache('form-draft', {
  defaultValue: {
    name: '',
    email: '',
    message: '',
  },
})

const originalData = ref(JSON.stringify(formData.value))
const isDirty = computed(() => {
  return JSON.stringify(formData.value) !== originalData.value
})

// 防抖保存
let saveTimer: NodeJS.Timeout
watch(
  formData,
  () => {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(async () => {
      await set(formData.value)
      originalData.value = JSON.stringify(formData.value)
    }, 1000) // 1秒后保存
  },
  { deep: true }
)
</script>
```

## 🔄 缓存策略

### 1. 缓存失效策略

```typescript
// ✅ 推荐：智能缓存失效
class SmartInvalidation {
  private cache: CacheManager
  private dependencies = new Map<string, Set<string>>()

  // 设置依赖关系
  setDependency(key: string, dependsOn: string[]) {
    this.dependencies.set(key, new Set(dependsOn))
  }

  async invalidate(key: string) {
    // 删除主缓存
    await this.cache.remove(key)

    // 删除依赖的缓存
    for (const [depKey, deps] of this.dependencies) {
      if (deps.has(key)) {
        await this.cache.remove(depKey)
      }
    }
  }
}

// 使用
const invalidation = new SmartInvalidation()

// 设置依赖关系
invalidation.setDependency('user-dashboard', ['user-profile', 'user-settings'])

// 当用户配置更新时，自动失效相关缓存
await cache.set('user-profile', newProfile)
await invalidation.invalidate('user-profile') // 会同时失效 user-dashboard
```

### 2. 缓存更新策略

```typescript
// ✅ 推荐：缓存更新策略
enum CacheUpdateStrategy {
  WRITE_THROUGH = 'write-through', // 写穿透
  WRITE_BACK = 'write-back', // 写回
  WRITE_AROUND = 'write-around', // 写绕过
}

class StrategicCache {
  private cache: CacheManager
  private strategy: CacheUpdateStrategy

  constructor(strategy: CacheUpdateStrategy = CacheUpdateStrategy.WRITE_THROUGH) {
    this.cache = createCache()
    this.strategy = strategy
  }

  async updateData(key: string, data: any) {
    switch (this.strategy) {
      case CacheUpdateStrategy.WRITE_THROUGH:
        // 同时更新缓存和数据源
        await Promise.all([this.cache.set(key, data), this.updateDataSource(key, data)])
        break

      case CacheUpdateStrategy.WRITE_BACK:
        // 先更新缓存，延迟更新数据源
        await this.cache.set(key, data)
        this.scheduleDataSourceUpdate(key, data)
        break

      case CacheUpdateStrategy.WRITE_AROUND:
        // 直接更新数据源，绕过缓存
        await this.updateDataSource(key, data)
        await this.cache.remove(key)
        break
    }
  }
}
```

## 🚨 常见陷阱

### 1. 避免缓存雪崩

```typescript
// ✅ 推荐：避免缓存雪崩
class AntiAvalancheCache {
  private cache: CacheManager

  async setWithJitter(key: string, value: any, baseTTL: number) {
    // 添加随机抖动，避免同时过期
    const jitter = Math.random() * 0.2 * baseTTL // 20% 抖动
    const ttl = baseTTL + jitter

    await this.cache.set(key, value, { ttl })
  }
}

// ❌ 不推荐：所有缓存同时过期
const sameTTL = 60 * 60 * 1000 // 1小时
await cache.set('data1', value1, { ttl: sameTTL })
await cache.set('data2', value2, { ttl: sameTTL })
await cache.set('data3', value3, { ttl: sameTTL })
// 1小时后所有缓存同时失效，可能导致雪崩
```

### 2. 避免缓存穿透

```typescript
// ✅ 推荐：防止缓存穿透
class AntiPenetrationCache {
  private cache: CacheManager
  private nullCache = new Set<string>()

  async get(key: string, fetcher: () => Promise<any>) {
    // 检查是否为已知的空值
    if (this.nullCache.has(key)) {
      return null
    }

    // 尝试从缓存获取
    let value = await this.cache.get(key)
    if (value !== null) {
      return value
    }

    // 从数据源获取
    value = await fetcher()

    if (value === null) {
      // 缓存空值，防止穿透
      this.nullCache.add(key)
      setTimeout(() => {
        this.nullCache.delete(key)
      }, 5 * 60 * 1000) // 5分钟后重试
    }
    else {
      await this.cache.set(key, value)
    }

    return value
  }
}
```

## 🔗 相关文档

- [性能优化](./performance.md) - 详细性能优化指南
- [安全指南](./security.md) - 安全最佳实践
- [故障排除](./troubleshooting.md) - 常见问题解决
