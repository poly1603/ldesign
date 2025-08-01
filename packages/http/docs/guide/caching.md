# 缓存系统

@ldesign/http 内置了强大的缓存系统，可以显著提升应用性能，减少不必要的网络请求。

## 快速开始

### 启用缓存

```typescript
import { createHttpClient } from '@ldesign/http'

const http = createHttpClient({
  cache: {
    enabled: true,
    ttl: 300000, // 5 分钟缓存
  }
})

// 第一次请求 - 从网络获取
const response1 = await http.get('/api/users')

// 第二次请求 - 从缓存返回（5分钟内）
const response2 = await http.get('/api/users') // 瞬间返回
```

### 缓存配置

```typescript
const http = createHttpClient({
  cache: {
    enabled: true, // 启用缓存
    ttl: 300000, // 缓存时间（毫秒）
    storage: 'memory', // 存储类型：'memory' | 'localStorage'
    keyGenerator: config => `${config.method}:${config.url}` // 自定义键生成器
  }
})
```

## 缓存存储

### 内存缓存（默认）

数据存储在内存中，页面刷新后丢失：

```typescript
import { createHttpClient, createMemoryStorage } from '@ldesign/http'

const http = createHttpClient({
  cache: {
    enabled: true,
    storage: createMemoryStorage()
  }
})
```

**优点：**

- ⚡ 访问速度极快
- 🔒 数据安全（不持久化）
- 💾 不占用磁盘空间

**缺点：**

- 📱 页面刷新后丢失
- 🚫 无法跨标签页共享

### LocalStorage 缓存

数据持久化存储在浏览器本地：

```typescript
import { createHttpClient, createLocalStorage } from '@ldesign/http'

const http = createHttpClient({
  cache: {
    enabled: true,
    storage: createLocalStorage('my_app_cache_') // 可选前缀
  }
})
```

**优点：**

- 💾 数据持久化
- 🌐 跨标签页共享
- 🔄 页面刷新后保留

**缺点：**

- 📦 存储空间有限（通常 5-10MB）
- 🐌 访问速度相对较慢
- 🔍 数据可被用户查看

### 自定义存储

实现自己的缓存存储：

```typescript
import { CacheStorage } from '@ldesign/http'

class CustomCacheStorage implements CacheStorage {
  async get(key: string): Promise<any> {
    // 从你的存储系统获取数据
    return await yourStorage.get(key)
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    // 存储数据到你的存储系统
    await yourStorage.set(key, value, ttl)
  }

  async delete(key: string): Promise<void> {
    await yourStorage.delete(key)
  }

  async clear(): Promise<void> {
    await yourStorage.clear()
  }
}

const http = createHttpClient({
  cache: {
    enabled: true,
    storage: new CustomCacheStorage()
  }
})
```

## 缓存策略

### TTL（生存时间）

设置缓存的有效期：

```typescript
const http = createHttpClient({
  cache: {
    enabled: true,
    ttl: 300000, // 5 分钟
  }
})

// 也可以为单个请求设置 TTL
await http.get('/api/users', {
  cache: {
    ttl: 600000 // 10 分钟
  }
})
```

### 缓存键生成

自定义缓存键的生成规则：

```typescript
const http = createHttpClient({
  cache: {
    enabled: true,
    keyGenerator: (config) => {
      // 包含查询参数的缓存键
      const params = new URLSearchParams(config.params).toString()
      return `${config.method}:${config.url}${params ? `?${params}` : ''}`
    }
  }
})
```

### 条件缓存

只缓存特定的请求：

```typescript
const http = createHttpClient({
  cache: {
    enabled: true,
    keyGenerator: (config) => {
      // 只缓存 GET 请求
      if (config.method !== 'GET') {
        return null // 返回 null 表示不缓存
      }
      return `${config.method}:${config.url}`
    }
  }
})
```

## 缓存控制

### 跳过缓存

强制从网络获取最新数据：

```typescript
// 方法 1：禁用单次请求的缓存
const response = await http.get('/api/users', {
  cache: {
    enabled: false
  }
})

// 方法 2：使用特殊参数
const response2 = await http.get('/api/users', {
  params: {
    _nocache: Date.now()
  }
})
```

### 清除缓存

```typescript
// 清除所有缓存
await http.clearCache()

// 清除特定缓存（需要自定义实现）
const cacheManager = http.getCacheManager()
await cacheManager.delete({
  url: '/api/users',
  method: 'GET'
})
```

### 预加载缓存

提前加载数据到缓存：

```typescript
// 预加载用户数据
await http.get('/api/users') // 数据进入缓存

// 后续使用时直接从缓存获取
const users = await http.get('/api/users') // 瞬间返回
```

## Vue 集成

### useQuery 缓存

```vue
<script setup lang="ts">
import { useQuery } from '@ldesign/http/vue'

// 带缓存的查询
const { data, loading, isStale } = useQuery(
  'users', // 查询键
  { url: '/api/users' },
  {
    staleTime: 300000, // 5分钟内数据不过期
    cacheTime: 600000, // 缓存保留10分钟
  }
)
</script>
```

### 缓存失效

```vue
<script setup lang="ts">
import { useMutation, useQuery } from '@ldesign/http/vue'

const { data, invalidate } = useQuery('users', { url: '/api/users' })

const { mutate: createUser } = useMutation(
  userData => http.post('/api/users', userData),
  {
    onSuccess: () => {
      // 创建成功后使缓存失效
      invalidate()
    }
  }
)
</script>
```

## 高级用法

### 缓存标签

为缓存添加标签，便于批量管理：

```typescript
class TaggedCacheStorage implements CacheStorage {
  private cache = new Map()
  private tags = new Map()

  async set(key: string, value: any, ttl?: number, tags?: string[]): Promise<void> {
    this.cache.set(key, { value, timestamp: Date.now(), ttl })

    if (tags) {
      tags.forEach((tag) => {
        if (!this.tags.has(tag)) {
          this.tags.set(tag, new Set())
        }
        this.tags.get(tag).add(key)
      })
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    const keys = this.tags.get(tag)
    if (keys) {
      keys.forEach(key => this.cache.delete(key))
      this.tags.delete(tag)
    }
  }

  // ... 其他方法
}
```

### 缓存预热

应用启动时预加载关键数据：

```typescript
async function warmupCache() {
  const criticalEndpoints = [
    '/api/user/profile',
    '/api/app/config',
    '/api/menu/items'
  ]

  await Promise.all(
    criticalEndpoints.map(url => http.get(url))
  )
}

// 应用启动时调用
warmupCache()
```

### 缓存同步

在多个客户端实例间同步缓存：

```typescript
class SyncedCacheStorage implements CacheStorage {
  constructor(private baseStorage: CacheStorage) {
    // 监听其他标签页的缓存更新
    window.addEventListener('storage', this.handleStorageChange)
  }

  private handleStorageChange = (event: StorageEvent) => {
    if (event.key?.startsWith('cache_sync_')) {
      // 同步缓存更新
      this.syncFromStorage(event.key, event.newValue)
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.baseStorage.set(key, value, ttl)

    // 通知其他标签页
    localStorage.setItem(`cache_sync_${key}`, JSON.stringify({
      action: 'set',
      value,
      ttl,
      timestamp: Date.now()
    }))
  }

  // ... 其他方法
}
```

## 性能优化

### 缓存大小限制

```typescript
class LimitedCacheStorage implements CacheStorage {
  private cache = new Map()
  private maxSize = 100 // 最大缓存项数

  async set(key: string, value: any, ttl?: number): Promise<void> {
    // 如果超出限制，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    })
  }

  // ... 其他方法
}
```

### 压缩缓存

```typescript
import { compress, decompress } from 'lz-string'

class CompressedCacheStorage implements CacheStorage {
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const compressed = compress(JSON.stringify(value))
    localStorage.setItem(key, compressed)
  }

  async get(key: string): Promise<any> {
    const compressed = localStorage.getItem(key)
    if (!compressed)
      return null

    const decompressed = decompress(compressed)
    return JSON.parse(decompressed)
  }

  // ... 其他方法
}
```

## 最佳实践

### 1. 合理设置 TTL

```typescript
const http = createHttpClient({
  cache: {
    enabled: true,
    keyGenerator: (config) => {
      // 根据数据类型设置不同的 TTL
      if (config.url.includes('/user/profile')) {
        return { key: `profile:${config.url}`, ttl: 600000 } // 10分钟
      }
      if (config.url.includes('/static/config')) {
        return { key: `config:${config.url}`, ttl: 3600000 } // 1小时
      }
      return { key: config.url, ttl: 300000 } // 默认5分钟
    }
  }
})
```

### 2. 缓存失效策略

```typescript
// 数据变更后及时清除相关缓存
async function updateUser(userId: number, data: any) {
  await http.put(`/api/users/${userId}`, data)

  // 清除相关缓存
  await cacheManager.delete({ url: `/api/users/${userId}` })
  await cacheManager.delete({ url: '/api/users' })
}
```

### 3. 监控缓存效果

```typescript
class MonitoredCacheStorage implements CacheStorage {
  private hits = 0
  private misses = 0

  async get(key: string): Promise<any> {
    const value = await this.baseStorage.get(key)

    if (value) {
      this.hits++
    }
    else {
      this.misses++
    }

    console.log(`缓存命中率: ${(this.hits / (this.hits + this.misses) * 100).toFixed(2)}%`)

    return value
  }

  // ... 其他方法
}
```

缓存系统是提升应用性能的重要工具，合理使用可以显著改善用户体验。记住要根据数据的特性和业务需求来配置缓存策略。
