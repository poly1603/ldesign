# Cache 缓存管理

Cache 模块提供了多层缓存系统，支持内存缓存、文件缓存和智能驱逐策略，帮助提升应用性能。

## 导入方式

```typescript
// 完整导入
import { CacheManager, MemoryCache, FileCache } from '@ldesign/kit'

// 按需导入
import { CacheManager } from '@ldesign/kit/cache'

// 单独导入
import { CacheManager } from '@ldesign/kit'
```

## CacheManager

缓存管理器类，提供统一的缓存操作接口。

### 创建缓存实例

#### `create(options?: CacheOptions): CacheManager`

创建缓存管理器实例。

```typescript
// 默认内存缓存
const cache = CacheManager.create()

// 自定义配置
const cache = CacheManager.create({
  type: 'memory', // 缓存类型：memory | file
  defaultTTL: 3600, // 默认过期时间（秒）
  maxSize: 1000, // 最大缓存项数
  strategy: 'lru', // 驱逐策略：lru | fifo | lfu
  checkPeriod: 600, // 过期检查间隔（秒）
  enableEvents: true, // 启用事件
})

// 文件缓存
const fileCache = CacheManager.create({
  type: 'file',
  cacheDir: './cache', // 缓存目录
  defaultTTL: 86400, // 24小时
  maxSize: 100, // 最大文件数
  compression: true, // 启用压缩
})
```

### 基本操作

#### `set(key: string, value: any, ttl?: number): Promise<void>`

设置缓存值。

```typescript
// 基本设置
await cache.set('user:123', userData)

// 设置过期时间
await cache.set('session:abc', sessionData, 1800) // 30分钟

// 设置复杂对象
await cache.set(
  'config',
  {
    database: { host: 'localhost', port: 5432 },
    redis: { host: 'localhost', port: 6379 },
  },
  3600
)
```

#### `get<T>(key: string): Promise<T | null>`

获取缓存值。

```typescript
// 获取用户数据
const user = await cache.get<User>('user:123')
if (user) {
  console.log('用户名:', user.name)
}

// 获取配置
const config = await cache.get<Config>('config')
```

#### `has(key: string): Promise<boolean>`

检查缓存是否存在。

```typescript
if (await cache.has('user:123')) {
  console.log('用户缓存存在')
}

const hasSession = await cache.has('session:abc')
```

#### `delete(key: string): Promise<boolean>`

删除缓存。

```typescript
await cache.delete('user:123')
const deleted = await cache.delete('session:abc')
console.log('删除成功:', deleted)
```

#### `clear(): Promise<void>`

清空所有缓存。

```typescript
await cache.clear()
console.log('缓存已清空')
```

### 高级操作

#### `getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T>`

获取或设置缓存（缓存穿透保护）。

```typescript
// 获取用户数据，如果不存在则从数据库加载
const user = await cache.getOrSet(
  'user:123',
  async () => {
    console.log('从数据库加载用户')
    return await database.getUser(123)
  },
  3600
)

// 获取 API 数据
const apiData = await cache.getOrSet(
  'api:weather',
  async () => {
    const response = await fetch('https://api.weather.com/current')
    return response.json()
  },
  300
) // 5分钟缓存
```

#### `mget(keys: string[]): Promise<Array<any | null>>`

批量获取缓存。

```typescript
const keys = ['user:123', 'user:456', 'user:789']
const users = await cache.mget(keys)

users.forEach((user, index) => {
  if (user) {
    console.log(`用户 ${keys[index]}:`, user.name)
  }
})
```

#### `mset(entries: Array<[string, any, number?]>): Promise<void>`

批量设置缓存。

```typescript
await cache.mset([
  ['user:123', userData1, 3600],
  ['user:456', userData2, 3600],
  ['config', configData, 7200],
])
```

#### `mdel(keys: string[]): Promise<number>`

批量删除缓存。

```typescript
const deletedCount = await cache.mdel(['user:123', 'user:456'])
console.log(`删除了 ${deletedCount} 个缓存项`)
```

#### `keys(pattern?: string): Promise<string[]>`

获取缓存键列表。

```typescript
// 获取所有键
const allKeys = await cache.keys()

// 获取匹配模式的键
const userKeys = await cache.keys('user:*')
const sessionKeys = await cache.keys('session:*')
```

#### `size(): Promise<number>`

获取缓存项数量。

```typescript
const count = await cache.size()
console.log(`当前缓存项数量: ${count}`)
```

#### `flush(): Promise<void>`

刷新缓存（清理过期项）。

```typescript
await cache.flush()
console.log('过期缓存已清理')
```

### 事件监听

#### `on(event: string, listener: Function): void`

监听缓存事件。

```typescript
// 缓存命中
cache.on('hit', key => {
  console.log(`缓存命中: ${key}`)
})

// 缓存未命中
cache.on('miss', key => {
  console.log(`缓存未命中: ${key}`)
})

// 缓存设置
cache.on('set', (key, value, ttl) => {
  console.log(`缓存设置: ${key}, TTL: ${ttl}`)
})

// 缓存删除
cache.on('del', key => {
  console.log(`缓存删除: ${key}`)
})

// 缓存过期
cache.on('expired', (key, value) => {
  console.log(`缓存过期: ${key}`)
})

// 缓存驱逐
cache.on('evicted', (key, value) => {
  console.log(`缓存驱逐: ${key}`)
})
```

### 统计信息

#### `stats(): Promise<CacheStats>`

获取缓存统计信息。

```typescript
const stats = await cache.stats()

console.log('缓存统计:')
console.log('- 总请求数:', stats.requests)
console.log('- 命中数:', stats.hits)
console.log('- 未命中数:', stats.misses)
console.log('- 命中率:', stats.hitRate)
console.log('- 当前大小:', stats.size)
console.log('- 最大大小:', stats.maxSize)
console.log('- 内存使用:', stats.memoryUsage)
```

#### `resetStats(): Promise<void>`

重置统计信息。

```typescript
await cache.resetStats()
console.log('统计信息已重置')
```

## MemoryCache

内存缓存实现，提供高性能的内存缓存功能。

### 创建实例

```typescript
const memoryCache = new MemoryCache({
  maxSize: 1000, // 最大缓存项数
  defaultTTL: 3600, // 默认过期时间
  strategy: 'lru', // 驱逐策略
  checkPeriod: 600, // 过期检查间隔
  serialize: false, // 是否序列化存储
})
```

### 驱逐策略

#### LRU (Least Recently Used)

最近最少使用策略，删除最久未访问的项。

```typescript
const lruCache = new MemoryCache({
  strategy: 'lru',
  maxSize: 100,
})
```

#### FIFO (First In, First Out)

先进先出策略，删除最早添加的项。

```typescript
const fifoCache = new MemoryCache({
  strategy: 'fifo',
  maxSize: 100,
})
```

#### LFU (Least Frequently Used)

最少使用策略，删除访问频率最低的项。

```typescript
const lfuCache = new MemoryCache({
  strategy: 'lfu',
  maxSize: 100,
})
```

## FileCache

文件缓存实现，提供持久化的缓存功能。

### 创建实例

```typescript
const fileCache = new FileCache({
  cacheDir: './cache', // 缓存目录
  maxSize: 100, // 最大文件数
  defaultTTL: 86400, // 默认过期时间
  compression: true, // 启用压缩
  encryption: {
    // 加密配置
    enabled: true,
    algorithm: 'aes-256-gcm',
    key: process.env.CACHE_ENCRYPTION_KEY,
  },
})
```

### 压缩和加密

```typescript
// 启用压缩
const compressedCache = new FileCache({
  cacheDir: './cache',
  compression: true,
  compressionLevel: 6, // 压缩级别 1-9
})

// 启用加密
const encryptedCache = new FileCache({
  cacheDir: './cache',
  encryption: {
    enabled: true,
    algorithm: 'aes-256-gcm',
    key: 'your-secret-key',
  },
})
```

## 实际应用示例

### API 响应缓存

```typescript
class APIService {
  private cache = CacheManager.create({
    defaultTTL: 300, // 5分钟
    maxSize: 1000,
  })

  async getUserProfile(userId: string) {
    const cacheKey = `user:profile:${userId}`

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        console.log(`从 API 获取用户 ${userId} 的资料`)
        const response = await fetch(`/api/users/${userId}`)
        return response.json()
      },
      600
    ) // 10分钟缓存
  }

  async searchUsers(query: string) {
    const cacheKey = `search:users:${query}`

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        console.log(`搜索用户: ${query}`)
        const response = await fetch(`/api/users/search?q=${query}`)
        return response.json()
      },
      180
    ) // 3分钟缓存
  }

  async invalidateUser(userId: string) {
    await this.cache.delete(`user:profile:${userId}`)

    // 清理相关的搜索缓存
    const searchKeys = await this.cache.keys('search:users:*')
    await this.cache.mdel(searchKeys)
  }
}
```

### 数据库查询缓存

```typescript
class DatabaseService {
  private cache = CacheManager.create({
    type: 'file',
    cacheDir: './db-cache',
    defaultTTL: 3600,
    compression: true,
  })

  async getUser(id: number) {
    const cacheKey = `db:user:${id}`

    return this.cache.getOrSet(cacheKey, async () => {
      console.log(`从数据库查询用户 ${id}`)
      return await this.db.query('SELECT * FROM users WHERE id = ?', [id])
    })
  }

  async getUsersByRole(role: string) {
    const cacheKey = `db:users:role:${role}`

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        console.log(`查询角色为 ${role} 的用户`)
        return await this.db.query('SELECT * FROM users WHERE role = ?', [role])
      },
      1800
    ) // 30分钟缓存
  }

  async updateUser(id: number, data: any) {
    await this.db.query('UPDATE users SET ? WHERE id = ?', [data, id])

    // 清理相关缓存
    await this.cache.delete(`db:user:${id}`)

    // 如果角色发生变化，清理角色缓存
    if (data.role) {
      const roleKeys = await this.cache.keys('db:users:role:*')
      await this.cache.mdel(roleKeys)
    }
  }
}
```

### 计算结果缓存

```typescript
class ComputationService {
  private cache = CacheManager.create({
    defaultTTL: 7200, // 2小时
    maxSize: 500,
  })

  async fibonacci(n: number): Promise<number> {
    if (n <= 1) return n

    const cacheKey = `fib:${n}`

    return this.cache.getOrSet(cacheKey, async () => {
      console.log(`计算斐波那契数列第 ${n} 项`)
      const result = (await this.fibonacci(n - 1)) + (await this.fibonacci(n - 2))
      return result
    })
  }

  async expensiveCalculation(params: any): Promise<any> {
    const cacheKey = `calc:${JSON.stringify(params)}`

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        console.log('执行复杂计算...')
        // 模拟耗时计算
        await new Promise(resolve => setTimeout(resolve, 5000))
        return { result: Math.random() * 1000 }
      },
      3600
    )
  }
}
```

### 多级缓存

```typescript
class MultiLevelCache {
  private l1Cache = CacheManager.create({
    type: 'memory',
    maxSize: 100,
    defaultTTL: 300, // 5分钟
  })

  private l2Cache = CacheManager.create({
    type: 'file',
    cacheDir: './l2-cache',
    maxSize: 1000,
    defaultTTL: 3600, // 1小时
  })

  async get<T>(key: string): Promise<T | null> {
    // 先查 L1 缓存
    let value = await this.l1Cache.get<T>(key)
    if (value !== null) {
      return value
    }

    // 再查 L2 缓存
    value = await this.l2Cache.get<T>(key)
    if (value !== null) {
      // 回填到 L1 缓存
      await this.l1Cache.set(key, value, 300)
      return value
    }

    return null
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    // 同时设置两级缓存
    await Promise.all([
      this.l1Cache.set(key, value, Math.min(ttl || 300, 300)),
      this.l2Cache.set(key, value, ttl),
    ])
  }

  async delete(key: string): Promise<void> {
    await Promise.all([this.l1Cache.delete(key), this.l2Cache.delete(key)])
  }
}
```

## 类型定义

```typescript
interface CacheOptions {
  type?: 'memory' | 'file'
  defaultTTL?: number
  maxSize?: number
  strategy?: 'lru' | 'fifo' | 'lfu'
  checkPeriod?: number
  enableEvents?: boolean
  cacheDir?: string
  compression?: boolean
  encryption?: {
    enabled: boolean
    algorithm: string
    key: string
  }
}

interface CacheStats {
  requests: number
  hits: number
  misses: number
  hitRate: number
  size: number
  maxSize: number
  memoryUsage: number
}
```

## 性能优化建议

1. **选择合适的驱逐策略**: LRU 适合大多数场景，LFU 适合访问模式稳定的场景
2. **合理设置 TTL**: 根据数据更新频率设置合适的过期时间
3. **监控缓存命中率**: 命中率低于 80% 时考虑调整策略
4. **避免缓存穿透**: 使用 `getOrSet` 方法防止并发请求
5. **定期清理**: 设置合理的检查间隔清理过期缓存

## 最佳实践

1. **键命名规范**: 使用有意义的键名，如 `user:profile:123`
2. **缓存粒度**: 根据使用场景选择合适的缓存粒度
3. **缓存更新**: 数据更新时及时清理相关缓存
4. **错误处理**: 缓存操作失败时有降级方案
5. **监控告警**: 监控缓存性能和错误率

## 示例应用

查看 [使用示例](/examples/cache-usage) 了解更多缓存应用的实际场景。
