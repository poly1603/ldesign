# 迁移指南

## 从其他缓存库迁移

### 从 localStorage 直接使用迁移

#### 之前的代码

```javascript
// 原始 localStorage 使用
localStorage.setItem('user', JSON.stringify(userData))
const user = JSON.parse(localStorage.getItem('user') || '{}')
localStorage.removeItem('user')
```

#### 迁移后的代码

```typescript
import { CacheManager } from '@ldesign/cache'

const cache = new CacheManager({
  engines: {
    localStorage: { keyPrefix: 'app_' }
  }
})

// 自动序列化/反序列化
await cache.set('user', userData)
const user = await cache.get<UserData>('user')
await cache.delete('user')
```

### 从 Vue 2 + Vuex 迁移

#### 之前的代码 (Vuex)

```javascript
// store.js
export default new Vuex.Store({
  state: {
    cachedData: {}
  },
  mutations: {
    SET_CACHE(state, { key, value }) {
      Vue.set(state.cachedData, key, value)
    },
    CLEAR_CACHE(state, key) {
      Vue.delete(state.cachedData, key)
    }
  },
  actions: {
    async fetchData({ commit }, key) {
      const data = await api.getData(key)
      commit('SET_CACHE', { key, value: data })
      return data
    }
  }
})

// 组件中使用
export default {
  computed: {
    ...mapState(['cachedData'])
  },
  methods: {
    ...mapActions(['fetchData']),
    async loadData() {
      this.loading = true
      try {
        await this.fetchData('user-profile')
      } finally {
        this.loading = false
      }
    }
  }
}
```

#### 迁移后的代码 (Vue 3 + @ldesign/cache)

```vue
<script setup>
import { useCache } from '@ldesign/cache/vue'

// 自动处理加载状态、错误处理和缓存
const { data: userProfile, loading, error, refresh } = useCache('user-profile', {
  fetcher: () => api.getData('user-profile'),
  ttl: 5 * 60 * 1000, // 5分钟缓存
  staleWhileRevalidate: true
})
</script>
```

### 从 React Query 迁移

#### 之前的代码 (React Query)

```javascript
import { useQuery } from 'react-query'

function UserProfile() {
  const { data, isLoading, error, refetch } = useQuery(
    'user-profile',
    () => fetchUserProfile(),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000
    }
  )

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return <div>{data.name}</div>
}
```

#### 迁移后的代码 (Vue 3 + @ldesign/cache)

```vue
<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>{{ data.name }}</div>
</template>

<script setup>
import { useCache } from '@ldesign/cache/vue'

const { data, loading, error, refresh } = useCache('user-profile', {
  fetcher: fetchUserProfile,
  ttl: 5 * 60 * 1000,
  staleWhileRevalidate: true
})
</script>
```

## 版本升级指南

### 从 0.0.x 升级到 0.1.x

#### 破坏性变更

1. **配置结构调整**

```typescript
// 0.0.x
const cache = new CacheManager({
  storage: 'localStorage',
  prefix: 'app_',
  encryption: true
})

// 0.1.x
const cache = new CacheManager({
  engines: {
    localStorage: { keyPrefix: 'app_' }
  },
  security: {
    encryption: { enabled: true }
  }
})
```

2. **API 方法变更**

```typescript
// 0.0.x
cache.put('key', value, 3600) // TTL 作为第三个参数

// 0.1.x
cache.set('key', value, { ttl: 3600 * 1000 }) // TTL 在选项中，单位为毫秒
```

3. **Vue 组合函数重命名**

```typescript
// 0.0.x
import { useCacheState } from '@ldesign/cache/vue'

// 0.1.x
import { useCache } from '@ldesign/cache/vue'
```

#### 迁移步骤

1. **更新依赖**

```bash
pnpm update @ldesign/cache
```

2. **运行迁移脚本**

```bash
npx @ldesign/cache-migrate
```

3. **更新配置**

```typescript
// 创建迁移配置映射
const migrateConfig = (oldConfig) => {
  return {
    engines: {
      [oldConfig.storage]: {
        keyPrefix: oldConfig.prefix,
        maxSize: oldConfig.maxSize
      }
    },
    security: {
      encryption: {
        enabled: oldConfig.encryption,
        secretKey: oldConfig.encryptionKey
      }
    }
  }
}

const newConfig = migrateConfig(oldConfig)
const cache = new CacheManager(newConfig)
```

4. **更新 API 调用**

```typescript
// 批量替换工具函数
const migrateApiCalls = (cache) => {
  // 包装旧 API
  cache.put = (key, value, ttl) => {
    return cache.set(key, value, { ttl: ttl * 1000 })
  }
  
  cache.fetch = (key) => {
    return cache.get(key)
  }
  
  return cache
}
```

## 数据迁移

### 迁移现有缓存数据

```typescript
import { CacheManager } from '@ldesign/cache'

async function migrateCacheData() {
  const oldCache = new OldCacheLibrary()
  const newCache = new CacheManager()
  
  // 获取所有旧缓存键
  const oldKeys = await oldCache.getAllKeys()
  
  for (const key of oldKeys) {
    try {
      const value = await oldCache.get(key)
      const metadata = await oldCache.getMetadata(key)
      
      // 迁移到新缓存
      await newCache.set(key, value, {
        ttl: metadata.ttl,
        engine: mapStorageEngine(metadata.storage)
      })
      
      console.log(`✅ 迁移成功: ${key}`)
    } catch (error) {
      console.error(`❌ 迁移失败: ${key}`, error)
    }
  }
  
  console.log('🎉 数据迁移完成')
}

function mapStorageEngine(oldEngine) {
  const mapping = {
    'local': 'localStorage',
    'session': 'sessionStorage',
    'memory': 'memory',
    'idb': 'indexedDB'
  }
  return mapping[oldEngine] || 'localStorage'
}
```

### 渐进式迁移

```typescript
class HybridCache {
  constructor(oldCache, newCache) {
    this.oldCache = oldCache
    this.newCache = newCache
    this.migrated = new Set()
  }
  
  async get(key) {
    // 优先从新缓存获取
    let value = await this.newCache.get(key)
    
    if (value === null && !this.migrated.has(key)) {
      // 从旧缓存获取并迁移
      value = await this.oldCache.get(key)
      if (value !== null) {
        await this.newCache.set(key, value)
        await this.oldCache.delete(key)
        this.migrated.add(key)
      }
    }
    
    return value
  }
  
  async set(key, value, options) {
    // 只写入新缓存
    await this.newCache.set(key, value, options)
    this.migrated.add(key)
  }
}
```

## 性能优化迁移

### 从同步 API 迁移到异步 API

```typescript
// 旧的同步代码
function processData() {
  const config = cache.getSync('config')
  const user = cache.getSync('user')
  
  // 处理数据...
  
  cache.setSync('result', result)
}

// 新的异步代码
async function processData() {
  const [config, user] = await cache.getMany(['config', 'user'])
  
  // 处理数据...
  
  await cache.set('result', result)
}
```

### 批量操作优化

```typescript
// 迁移前：循环单个操作
for (const item of items) {
  await cache.set(item.key, item.value)
}

// 迁移后：批量操作
await cache.setMany(
  Object.fromEntries(items.map(item => [item.key, item.value]))
)
```

## 测试迁移

### 更新测试代码

```typescript
// 旧测试
describe('Cache', () => {
  it('should store and retrieve data', () => {
    cache.put('key', 'value')
    expect(cache.get('key')).toBe('value')
  })
})

// 新测试
describe('Cache', () => {
  it('should store and retrieve data', async () => {
    await cache.set('key', 'value')
    const result = await cache.get('key')
    expect(result).toBe('value')
  })
})
```

### 兼容性测试

```typescript
describe('Migration Compatibility', () => {
  it('should handle old data format', async () => {
    // 模拟旧格式数据
    localStorage.setItem('old_key', JSON.stringify({
      value: 'test',
      timestamp: Date.now(),
      ttl: 3600
    }))
    
    // 测试新缓存能否读取
    const result = await cache.get('old_key')
    expect(result).toBe('test')
  })
})
```

## 故障排除

### 常见迁移问题

1. **序列化格式不兼容**

```typescript
// 解决方案：自定义序列化器
const cache = new CacheManager({
  serializer: {
    serialize: (value) => {
      // 兼容旧格式
      return JSON.stringify({ data: value, version: '0.1.0' })
    },
    deserialize: (str) => {
      const parsed = JSON.parse(str)
      return parsed.data || parsed // 兼容新旧格式
    }
  }
})
```

2. **键名冲突**

```typescript
// 解决方案：键名映射
const keyMapping = {
  'old_user_key': 'user:profile',
  'old_config_key': 'app:config'
}

const mappedKey = keyMapping[originalKey] || originalKey
```

3. **TTL 单位不一致**

```typescript
// 解决方案：TTL 转换
const convertTTL = (oldTTL) => {
  // 旧版本使用秒，新版本使用毫秒
  return typeof oldTTL === 'number' ? oldTTL * 1000 : oldTTL
}
```

## 回滚计划

### 准备回滚

```typescript
// 保留旧缓存数据的备份
async function createBackup() {
  const backup = {}
  const keys = await oldCache.getAllKeys()
  
  for (const key of keys) {
    backup[key] = {
      value: await oldCache.get(key),
      metadata: await oldCache.getMetadata(key)
    }
  }
  
  localStorage.setItem('cache_backup', JSON.stringify(backup))
}

// 回滚函数
async function rollback() {
  const backup = JSON.parse(localStorage.getItem('cache_backup'))
  
  for (const [key, data] of Object.entries(backup)) {
    await oldCache.set(key, data.value, data.metadata)
  }
  
  console.log('🔄 回滚完成')
}
```

## 迁移检查清单

- [ ] 更新依赖版本
- [ ] 更新配置结构
- [ ] 迁移 API 调用
- [ ] 更新 Vue 组合函数
- [ ] 迁移缓存数据
- [ ] 更新测试代码
- [ ] 性能测试
- [ ] 兼容性测试
- [ ] 准备回滚计划
- [ ] 文档更新
- [ ] 团队培训
