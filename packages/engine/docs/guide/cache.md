# 缓存管理

Vue3 Engine 提供了强大的缓存管理功能，支持内存缓存、持久化缓存、缓存策略和自动过期等特性。

## 基础用法

### 设置和获取缓存

```typescript
// 设置缓存
engine.cache.set('user:123', { name: 'John', age: 30 })

// 获取缓存
const user = engine.cache.get('user:123')
console.log(user) // { name: 'John', age: 30 }

// 检查缓存是否存在
const exists = engine.cache.has('user:123')
console.log(exists) // true
```

### 带过期时间的缓存

```typescript
// 设置5分钟后过期的缓存
engine.cache.set('session:abc123', sessionData, 5 * 60 * 1000)

// 设置1小时后过期的缓存
engine.cache.set('api:users', userData, { ttl: 3600000 })
```

### 删除缓存

```typescript
// 删除单个缓存
engine.cache.delete('user:123')

// 清空所有缓存
engine.cache.clear()

// 批量删除
engine.cache.deleteMany(['user:123', 'user:456', 'user:789'])
```

## 高级功能

### 缓存命名空间

```typescript
// 使用命名空间组织缓存
const userCache = engine.cache.namespace('users')
const sessionCache = engine.cache.namespace('sessions')

// 在命名空间中操作缓存
userCache.set('123', userData)
sessionCache.set('abc', sessionData)

// 清空特定命名空间
userCache.clear()
```

### 缓存策略

```typescript
// 配置缓存策略
engine.cache.setStrategy('api-data', {
  // 最大缓存数量
  maxSize: 1000,

  // 默认过期时间
  defaultTTL: 300000, // 5分钟

  // 淘汰策略
  evictionPolicy: 'lru', // 最近最少使用

  // 序列化方式
  serializer: 'json',
})
```

### 缓存预热

```typescript
// 推荐：使用内置 warmup API
await engine.cache.warmup([
  { key: 'critical:config', loader: () => fetchCriticalConfig(), ttl: 0 },
  { key: 'critical:users', loader: () => fetchCriticalUsers(), ttl: 3600_000 },
])
```

### 智能预加载

```typescript
// 根据访问路径提前准备可能访问的键
await engine.cache.preload(
  ['user:1', 'user:2', 'user:3'],
  (key) => fetchUserByKey(key),
  { ttl: 10 * 60_000, priority: 'high' }
)
```

### 缓存穿透保护

```typescript
// 防止缓存穿透
async function getDataWithProtection(key: string) {
  // 检查缓存
  let data = engine.cache.get(key)

  if (data === undefined) {
    // 使用分布式锁防止并发请求
    const lock = await engine.cache.acquireLock(`lock:${key}`, 5000)

    try {
      // 再次检查缓存（双重检查）
      data = engine.cache.get(key)

      if (data === undefined) {
        // 从数据源获取数据
        data = await fetchDataFromSource(key)

        // 缓存数据（即使是null也要缓存，防止穿透）
        engine.cache.set(key, data || null, 300000)
      }
    }
    finally {
      await engine.cache.releaseLock(lock)
    }
  }

  return data
}
```

## 缓存事件

### 监听缓存事件

```typescript
// 监听缓存设置事件
engine.events.on('cache:set', (event) => {
  console.log(`缓存设置: ${event.key} = ${event.value}`)
})

// 监听缓存获取事件
engine.events.on('cache:get', (event) => {
  console.log(`缓存${event.hit ? '命中' : '未命中'}: ${event.key}`)
})

// 监听缓存过期事件
engine.events.on('cache:expired', (event) => {
  console.log(`缓存过期: ${event.key}`)
})

// 监听缓存清理事件
engine.events.on('cache:evicted', (event) => {
  console.log(`缓存淘汰: ${event.key} (原因: ${event.reason})`)
})
```

### 缓存统计

```typescript
// 获取缓存统计信息
const stats = engine.cache.getStats()
console.log('缓存统计:', {
  总数量: stats.size,
  命中率: stats.hitRate,
  未命中数: stats.misses,
  命中数: stats.hits,
  内存使用: stats.memoryUsage,
})
```

## 配置选项

### 缓存配置

```typescript
const engine = createEngine({
  cache: {
    // 缓存类型
    type: 'memory', // 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB'

    // 最大缓存大小
    maxSize: 1000,

    // 默认过期时间（毫秒）
    defaultTTL: 300000,

    // 淘汰策略
    evictionPolicy: 'lru', // 'lru' | 'lfu' | 'fifo' | 'random'

    // 序列化配置
    serialization: {
      // 序列化器
      serializer: 'json', // 'json' | 'msgpack' | 'custom'

      // 压缩
      compression: true,
    },

    // 持久化配置
    persistence: {
      // 启用持久化
      enabled: true,

      // 持久化存储
      storage: 'localStorage',

      // 持久化键前缀
      keyPrefix: 'engine-cache:',
    },

    // 性能配置
    performance: {
      // 启用统计
      enableStats: true,

      // 清理间隔
      cleanupInterval: 60000,

      // 批量操作大小
      batchSize: 100,
    },
  },
})
```

## 缓存模式

### 1. Cache-Aside（旁路缓存）

```typescript
class UserService {
  async getUser(id: string) {
    // 先查缓存
    let user = engine.cache.get(`user:${id}`)

    if (!user) {
      // 缓存未命中，查询数据库
      user = await this.fetchUserFromDB(id)

      // 写入缓存
      if (user) {
        engine.cache.set(`user:${id}`, user, 3600000)
      }
    }

    return user
  }

  async updateUser(id: string, data: any) {
    // 更新数据库
    const user = await this.updateUserInDB(id, data)

    // 删除缓存，让下次查询时重新加载
    engine.cache.delete(`user:${id}`)

    return user
  }
}
```

### 2. Write-Through（写穿透）

```typescript
class ConfigService {
  async setConfig(key: string, value: any) {
    // 同时写入缓存和持久化存储
    await Promise.all([engine.cache.set(`config:${key}`, value), this.saveConfigToDB(key, value)])
  }

  async getConfig(key: string) {
    // 先查缓存
    let value = engine.cache.get(`config:${key}`)

    if (value === undefined) {
      // 从数据库加载
      value = await this.loadConfigFromDB(key)

      if (value !== undefined) {
        engine.cache.set(`config:${key}`, value)
      }
    }

    return value
  }
}
```

### 3. Write-Behind（写回）

```typescript
class LogService {
  private writeQueue: Map<string, any> = new Map()

  constructor() {
    // 定期批量写入数据库
    setInterval(() => {
      this.flushWriteQueue()
    }, 5000)
  }

  async logEvent(event: any) {
    const key = `log:${event.id}`

    // 立即写入缓存
    engine.cache.set(key, event)

    // 加入写入队列
    this.writeQueue.set(key, event)
  }

  private async flushWriteQueue() {
    if (this.writeQueue.size === 0)
      return

    const events = Array.from(this.writeQueue.values())
    this.writeQueue.clear()

    // 批量写入数据库
    await this.batchWriteToDB(events)
  }
}
```

## 最佳实践

### 1. 缓存键设计

```typescript
// 使用有意义的键名
const cacheKeys = {
  user: (id: string) => `user:${id}`,
  userProfile: (id: string) => `user:${id}:profile`,
  userPosts: (id: string, page: number) => `user:${id}:posts:${page}`,
  apiResponse: (endpoint: string, params: string) => `api:${endpoint}:${params}`,
}

// 使用键前缀进行分组
engine.cache.set(cacheKeys.user('123'), userData)
engine.cache.set(cacheKeys.userProfile('123'), profileData)
```

### 2. 缓存失效策略

```typescript
class CacheInvalidationService {
  // 基于标签的失效
  async invalidateByTag(tag: string) {
    const keys = engine.cache.getKeysByTag(tag)
    await engine.cache.deleteMany(keys)
  }

  // 基于模式的失效
  async invalidateByPattern(pattern: string) {
    const keys = engine.cache.getKeysByPattern(pattern)
    await engine.cache.deleteMany(keys)
  }

  // 级联失效
  async invalidateUser(userId: string) {
    await this.invalidateByPattern(`user:${userId}:*`)
  }
}
```

### 3. 缓存预加载

```typescript
class CachePreloader {
  async preloadCriticalData() {
    const tasks = [this.preloadUserData(), this.preloadConfigData(), this.preloadStaticData()]

    await Promise.all(tasks)
    engine.logger.info('关键数据预加载完成')
  }

  private async preloadUserData() {
    const activeUsers = await this.getActiveUsers()

    const promises = activeUsers.map(user => engine.cache.set(`user:${user.id}`, user, 3600000))

    await Promise.all(promises)
  }
}
```

### 4. 缓存监控

```typescript
class CacheMonitor {
  constructor() {
    this.setupMonitoring()
  }

  private setupMonitoring() {
    // 监控缓存命中率
    setInterval(() => {
      const stats = engine.cache.getStats()

      if (stats.hitRate < 0.8) {
        engine.logger.warn('缓存命中率过低:', stats.hitRate)
      }

      if (stats.memoryUsage > 0.9) {
        engine.logger.warn('缓存内存使用过高:', stats.memoryUsage)
      }
    }, 30000)

    // 监控缓存大小
    engine.events.on('cache:size-limit-reached', () => {
      engine.logger.warn('缓存大小达到限制，开始清理')
    })
  }
}
```

## 性能优化

### 1. 批量操作

```typescript
// 批量设置缓存
const batchData = new Map([
  ['user:1', userData1],
  ['user:2', userData2],
  ['user:3', userData3],
])

await engine.cache.setMany(batchData)

// 批量获取缓存
const keys = ['user:1', 'user:2', 'user:3']
const results = await engine.cache.getMany(keys)
```

### 2. 异步操作

```typescript
// 异步缓存更新
async function updateCacheAsync(key: string, data: any) {
  // 不等待缓存写入完成
  engine.cache.set(key, data).catch((error) => {
    engine.logger.error('缓存写入失败:', error)
  })

  return data
}
```

### 3. 内存优化

```typescript
// 配置内存限制
engine.cache.configure({
  maxMemoryUsage: 100 * 1024 * 1024, // 100MB

  // 内存压力时的处理策略
  memoryPressureHandler: (usage) => {
    if (usage > 0.9) {
      // 清理过期缓存
      engine.cache.cleanupExpired()

      // 清理最少使用的缓存
      engine.cache.evictLRU(0.1) // 清理10%
    }
  },
})
```

## 错误处理

```typescript
try {
  const data = engine.cache.get('some-key')
  // 处理数据
}
catch (error) {
  engine.logger.error('缓存操作失败:', error)

  // 降级处理
  const data = await fetchFromSource()
  return data
}
```

## 与其他系统集成

### 与状态管理集成

```typescript
// 缓存状态变化
engine.state.watch('user', (newUser, oldUser) => {
  if (newUser) {
    engine.cache.set(`user:${newUser.id}`, newUser)
  }

  if (oldUser) {
    engine.cache.delete(`user:${oldUser.id}`)
  }
})
```

### 与网络请求集成

```typescript
// HTTP 缓存中间件
const cacheMiddleware = {
  name: 'cache',
  handler: async (context, next) => {
    const cacheKey = `http:${context.url}:${JSON.stringify(context.params)}`

    // 检查缓存
    let response = engine.cache.get(cacheKey)

    if (!response) {
      // 执行请求
      await next()
      response = context.response

      // 缓存响应
      if (response.status === 200) {
        engine.cache.set(cacheKey, response, 300000) // 5分钟
      }
    }
    else {
      context.response = response
    }
  },
}
```
