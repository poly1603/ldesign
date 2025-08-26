# 缓存机制

@ldesign/store 提供了强大的缓存机制，帮助您优化应用性能，减少重复计算和网络请求。

## 🎯 缓存类型

### 计算缓存

使用 `@Cache` 装饰器缓存计算结果：

```typescript
import { BaseStore, State, Getter, Cache } from '@ldesign/store'

export class DataStore extends BaseStore {
  @State
  items = []

  @Getter
  @Cache({ ttl: 5000 }) // 缓存5秒
  get expensiveComputation() {
    console.log('执行昂贵的计算...')
    return this.items
      .filter(item => item.active)
      .map(item => this.processItem(item))
      .sort((a, b) => a.priority - b.priority)
  }
}
```

### 方法缓存

缓存方法的返回值：

```typescript
export class ApiStore extends BaseStore {
  @Action
  @Cache({ 
    ttl: 60000, // 缓存1分钟
    key: (userId) => `user-${userId}` // 自定义缓存键
  })
  async fetchUser(userId) {
    console.log(`从API获取用户 ${userId}`)
    return await api.getUser(userId)
  }
}
```

## 🔧 缓存配置

### 基本配置

```typescript
@Cache({
  ttl: 30000,           // 生存时间（毫秒）
  maxSize: 100,         // 最大缓存条目数
  key: 'custom-key',    // 自定义缓存键
  storage: 'memory'     // 存储类型：memory | localStorage | sessionStorage
})
```

### 高级配置

```typescript
@Cache({
  ttl: 60000,
  maxSize: 50,
  key: (arg1, arg2) => `${arg1}-${arg2}`,
  serialize: JSON.stringify,
  deserialize: JSON.parse,
  onHit: (key, value) => console.log('缓存命中:', key),
  onMiss: (key) => console.log('缓存未命中:', key),
  onExpire: (key, value) => console.log('缓存过期:', key)
})
```

## 📊 缓存策略

### LRU 缓存

最近最少使用缓存策略：

```typescript
export class LRUCacheStore extends BaseStore {
  @State
  @Cache({ 
    strategy: 'lru',
    maxSize: 100
  })
  cachedData = new Map()

  @Action
  addData(key, value) {
    this.cachedData.set(key, value)
  }
}
```

### 时间过期缓存

基于时间的缓存过期：

```typescript
export class TTLCacheStore extends BaseStore {
  @Getter
  @Cache({ 
    strategy: 'ttl',
    ttl: 300000, // 5分钟
    refreshOnAccess: true // 访问时刷新过期时间
  })
  get timeBasedData() {
    return this.computeExpensiveData()
  }
}
```

## 🚀 实际应用

### API 响应缓存

```typescript
export class ApiCacheStore extends BaseStore {
  @Action
  @Cache({ 
    ttl: 300000, // 5分钟
    key: (endpoint, params) => `${endpoint}-${JSON.stringify(params)}`
  })
  async apiCall(endpoint, params = {}) {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(params)
    })
    return response.json()
  }

  @Action
  async getProducts(category, page = 1) {
    return this.apiCall('/api/products', { category, page })
  }
}
```

### 搜索结果缓存

```typescript
export class SearchStore extends BaseStore {
  @State
  query = ''

  @Getter
  @Cache({ 
    ttl: 60000,
    key: () => this.query,
    condition: () => this.query.length >= 2 // 只缓存长度>=2的查询
  })
  get searchResults() {
    if (this.query.length < 2) return []
    
    return this.performSearch(this.query)
  }

  @Action
  @Cache({ ttl: 300000 })
  async performSearch(query) {
    return await api.search(query)
  }
}
```

## 🛠️ 缓存管理

### 手动缓存控制

```typescript
export class CacheControlStore extends BaseStore {
  @Action
  clearCache(pattern?: string) {
    if (pattern) {
      // 清除匹配模式的缓存
      this.$cache.clear(pattern)
    } else {
      // 清除所有缓存
      this.$cache.clearAll()
    }
  }

  @Action
  refreshCache(key: string) {
    // 刷新特定缓存
    this.$cache.refresh(key)
  }

  @Action
  getCacheStats() {
    return {
      size: this.$cache.size,
      hitRate: this.$cache.hitRate,
      missRate: this.$cache.missRate
    }
  }
}
```

### 缓存预热

```typescript
export class PrewarmCacheStore extends BaseStore {
  @Action
  async prewarmCache() {
    // 预加载常用数据
    const commonQueries = ['popular', 'trending', 'featured']
    
    await Promise.all(
      commonQueries.map(query => this.searchProducts(query))
    )
  }

  @Action
  @Cache({ ttl: 600000 }) // 10分钟
  async searchProducts(query) {
    return await api.searchProducts(query)
  }
}
```

## 📱 持久化缓存

### 本地存储缓存

```typescript
export class PersistentCacheStore extends BaseStore {
  @Getter
  @Cache({ 
    storage: 'localStorage',
    ttl: 86400000, // 24小时
    key: 'user-preferences'
  })
  get userPreferences() {
    return this.computeUserPreferences()
  }

  @Action
  @Cache({ 
    storage: 'sessionStorage',
    ttl: 3600000 // 1小时
  })
  async getSessionData() {
    return await api.getSessionData()
  }
}
```

## 🎯 最佳实践

### 1. 合理设置 TTL

```typescript
// ✅ 根据数据特性设置合适的TTL
@Cache({ ttl: 300000 })  // 用户数据：5分钟
async getUserProfile() { }

@Cache({ ttl: 3600000 }) // 配置数据：1小时
async getAppConfig() { }

@Cache({ ttl: 86400000 }) // 静态数据：24小时
async getStaticContent() { }
```

### 2. 使用条件缓存

```typescript
// ✅ 只缓存有意义的结果
@Cache({ 
  condition: (result) => result && result.length > 0
})
async searchData(query) {
  return await api.search(query)
}
```

### 3. 监控缓存性能

```typescript
export class CacheMonitorStore extends BaseStore {
  @Action
  logCacheStats() {
    const stats = this.$cache.getStats()
    console.log('缓存统计:', {
      命中率: `${(stats.hitRate * 100).toFixed(2)}%`,
      缓存大小: stats.size,
      内存使用: `${(stats.memoryUsage / 1024 / 1024).toFixed(2)} MB`
    })
  }
}
```

## 🔧 自定义缓存实现

### 创建自定义缓存策略

```typescript
import { createCacheStrategy } from '@ldesign/store'

const customCache = createCacheStrategy({
  name: 'custom-lfu', // 最少使用频率
  
  set(key, value, options) {
    // 自定义设置逻辑
  },
  
  get(key) {
    // 自定义获取逻辑
  },
  
  has(key) {
    // 检查是否存在
  },
  
  delete(key) {
    // 删除缓存项
  },
  
  clear() {
    // 清空缓存
  }
})

// 使用自定义缓存策略
@Cache({ strategy: customCache })
```

缓存机制是提升应用性能的重要工具，合理使用可以显著改善用户体验。记住要根据数据的特性和使用模式选择合适的缓存策略。
