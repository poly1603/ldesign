# 高级使用示例

## 🎯 复杂应用场景

### 多层缓存架构

```typescript
import { createCache } from '@ldesign/cache'

// 构建多层缓存系统
class MultiLayerCache {
  private l1Cache: CacheManager // 内存缓存 - 最快
  private l2Cache: CacheManager // localStorage - 中等
  private l3Cache: CacheManager // IndexedDB - 最大容量

  constructor() {
    // L1: 内存缓存 - 极速访问
    this.l1Cache = createCache({
      defaultEngine: 'memory',
      keyPrefix: 'l1_',
      engines: {
        memory: {
          maxSize: 20 * 1024 * 1024, // 20MB
          maxItems: 500,
          cleanupInterval: 2 * 60 * 1000, // 2分钟清理
        },
      },
    })

    // L2: localStorage - 持久化
    this.l2Cache = createCache({
      defaultEngine: 'localStorage',
      keyPrefix: 'l2_',
      engines: {
        localStorage: {
          maxSize: 5 * 1024 * 1024, // 5MB
          compression: true,
        },
      },
    })

    // L3: IndexedDB - 大容量
    this.l3Cache = createCache({
      defaultEngine: 'indexedDB',
      keyPrefix: 'l3_',
      engines: {
        indexedDB: {
          dbName: 'MultiLayerCache',
          version: 1,
          storeName: 'cache',
        },
      },
    })
  }

  async get(key: string): Promise<any> {
    // L1 缓存查找
    let value = await this.l1Cache.get(key)
    if (value !== null) {
      console.log('L1 缓存命中:', key)
      return value
    }

    // L2 缓存查找
    value = await this.l2Cache.get(key)
    if (value !== null) {
      console.log('L2 缓存命中:', key)
      // 提升到 L1 缓存
      await this.l1Cache.set(key, value, { ttl: 5 * 60 * 1000 })
      return value
    }

    // L3 缓存查找
    value = await this.l3Cache.get(key)
    if (value !== null) {
      console.log('L3 缓存命中:', key)
      // 提升到上层缓存
      await this.l2Cache.set(key, value, { ttl: 30 * 60 * 1000 })
      await this.l1Cache.set(key, value, { ttl: 5 * 60 * 1000 })
      return value
    }

    console.log('缓存未命中:', key)
    return null
  }

  async set(
    key: string,
    value: any,
    options: {
      level?: 1 | 2 | 3
      ttl?: number
    } = {}
  ) {
    const { level = 1, ttl } = options

    // 根据数据大小和重要性决定存储层级
    const size = JSON.stringify(value).length

    if (level >= 3 || size > 100 * 1024) {
      // 大数据存储到 L3
      await this.l3Cache.set(key, value, { ttl })
    }

    if (level >= 2 || size > 10 * 1024) {
      // 中等数据存储到 L2
      await this.l2Cache.set(key, value, { ttl })
    }

    if (level >= 1) {
      // 热点数据存储到 L1
      await this.l1Cache.set(key, value, {
        ttl: ttl ? Math.min(ttl, 10 * 60 * 1000) : 5 * 60 * 1000,
      })
    }
  }

  async remove(key: string) {
    await Promise.all([
      this.l1Cache.remove(key),
      this.l2Cache.remove(key),
      this.l3Cache.remove(key),
    ])
  }

  async getStats() {
    const [l1Stats, l2Stats, l3Stats] = await Promise.all([
      this.l1Cache.getStats(),
      this.l2Cache.getStats(),
      this.l3Cache.getStats(),
    ])

    return {
      l1: l1Stats,
      l2: l2Stats,
      l3: l3Stats,
      total: {
        items: l1Stats.totalItems + l2Stats.totalItems + l3Stats.totalItems,
        size: l1Stats.totalSize + l2Stats.totalSize + l3Stats.totalSize,
      },
    }
  }
}

// 使用多层缓存
const multiCache = new MultiLayerCache()

// 热点数据 - 存储到所有层级
await multiCache.set('hot-data', hotData, { level: 1 })

// 普通数据 - 存储到 L2 和 L3
await multiCache.set('normal-data', normalData, { level: 2 })

// 大数据 - 只存储到 L3
await multiCache.set('big-data', bigData, { level: 3 })

// 获取数据（自动从最快的层级获取）
const data = await multiCache.get('hot-data')
```

### 智能缓存预测

```typescript
// 基于机器学习的缓存预测
class PredictiveCache {
  private cache = createCache()
  private accessPatterns = new Map<string, number[]>()
  private predictionModel = new Map<string, string[]>()

  async get(key: string): Promise<any> {
    // 记录访问模式
    this.recordAccess(key)

    // 获取数据
    const value = await this.cache.get(key)

    if (value !== null) {
      // 预测下一个可能访问的数据
      await this.predictAndPreload(key)
    }

    return value
  }

  private recordAccess(key: string) {
    const now = Date.now()

    if (!this.accessPatterns.has(key)) {
      this.accessPatterns.set(key, [])
    }

    const pattern = this.accessPatterns.get(key)!
    pattern.push(now)

    // 保持最近50次访问记录
    if (pattern.length > 50) {
      pattern.shift()
    }

    // 更新预测模型
    this.updatePredictionModel(key)
  }

  private updatePredictionModel(currentKey: string) {
    // 分析访问模式，建立关联关系
    const recentAccesses = this.getRecentAccesses(5 * 60 * 1000) // 5分钟内

    if (!this.predictionModel.has(currentKey)) {
      this.predictionModel.set(currentKey, [])
    }

    const predictions = this.predictionModel.get(currentKey)!

    // 找到经常一起访问的键
    for (const otherKey of recentAccesses) {
      if (otherKey !== currentKey && !predictions.includes(otherKey)) {
        predictions.push(otherKey)
      }
    }

    // 保持最多10个预测
    if (predictions.length > 10) {
      predictions.splice(0, predictions.length - 10)
    }
  }

  private getRecentAccesses(timeWindow: number): string[] {
    const now = Date.now()
    const recentKeys: string[] = []

    for (const [key, timestamps] of this.accessPatterns) {
      const recentTimestamps = timestamps.filter(t => now - t < timeWindow)
      if (recentTimestamps.length > 0) {
        recentKeys.push(key)
      }
    }

    return recentKeys
  }

  private async predictAndPreload(currentKey: string) {
    const predictions = this.predictionModel.get(currentKey) || []

    // 预加载预测的数据
    for (const predictedKey of predictions.slice(0, 3)) {
      // 最多预加载3个
      if (!(await this.cache.has(predictedKey))) {
        // 在后台预加载
        this.preloadInBackground(predictedKey)
      }
    }
  }

  private async preloadInBackground(key: string) {
    try {
      // 模拟从数据源获取数据
      const data = await this.fetchFromDataSource(key)
      if (data !== null) {
        await this.cache.set(key, data, { ttl: 10 * 60 * 1000 })
        console.log('预加载完成:', key)
      }
    }
    catch (error) {
      console.warn('预加载失败:', key, error)
    }
  }

  private async fetchFromDataSource(key: string): Promise<any> {
    // 模拟数据源获取
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ key, data: `预加载数据 ${key}`, timestamp: Date.now() })
      }, 100)
    })
  }
}
```

### 分布式缓存同步

```typescript
// 跨设备缓存同步
class DistributedCache {
  private localCache = createCache()
  private syncEndpoint = '/api/cache/sync'
  private syncInterval = 30 * 1000 // 30秒同步一次
  private syncTimer: NodeJS.Timeout | null = null

  constructor(private userId: string) {
    this.startSyncProcess()
  }

  async set(key: string, value: any, options?: any) {
    // 本地设置
    await this.localCache.set(key, value, options)

    // 标记需要同步
    await this.localCache.set(`${key}:sync-pending`, {
      timestamp: Date.now(),
      action: 'set',
      value,
    })
  }

  async get(key: string): Promise<any> {
    // 先从本地获取
    let value = await this.localCache.get(key)

    if (value === null) {
      // 尝试从远程同步
      value = await this.fetchFromRemote(key)
      if (value !== null) {
        await this.localCache.set(key, value)
      }
    }

    return value
  }

  private startSyncProcess() {
    this.syncTimer = setInterval(() => {
      this.syncToRemote()
    }, this.syncInterval)
  }

  private async syncToRemote() {
    try {
      // 获取待同步的数据
      const keys = await this.localCache.keys()
      const pendingKeys = keys.filter(key => key.endsWith(':sync-pending'))

      if (pendingKeys.length === 0)
        return

      const syncData = []
      for (const pendingKey of pendingKeys) {
        const syncInfo = await this.localCache.get(pendingKey)
        const originalKey = pendingKey.replace(':sync-pending', '')

        syncData.push({
          key: originalKey,
          action: syncInfo.action,
          value: syncInfo.value,
          timestamp: syncInfo.timestamp,
        })
      }

      // 发送到服务器
      const response = await fetch(this.syncEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          userId: this.userId,
          operations: syncData,
        }),
      })

      if (response.ok) {
        // 清除同步标记
        for (const pendingKey of pendingKeys) {
          await this.localCache.remove(pendingKey)
        }
        console.log('同步完成:', syncData.length, '项')
      }
    }
    catch (error) {
      console.error('同步失败:', error)
    }
  }

  private async fetchFromRemote(key: string): Promise<any> {
    try {
      const response = await fetch(`${this.syncEndpoint}/${this.userId}/${key}`, {
        headers: {
          Authorization: `Bearer ${await this.getAuthToken()}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        return data.value
      }
    }
    catch (error) {
      console.warn('远程获取失败:', key, error)
    }

    return null
  }

  private async getAuthToken(): Promise<string> {
    return (await this.localCache.get('auth-token')) || ''
  }

  destroy() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
    }
  }
}
```

### 缓存装饰器系统

```typescript
// 高级缓存装饰器
function CacheMethod(
  options: {
    key?: string | ((...args: any[]) => string)
    ttl?: number
    engine?: string
    condition?: (...args: any[]) => boolean
    invalidateOn?: string[]
  } = {}
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const cache = createCache()

    descriptor.value = async function (...args: any[]) {
      // 生成缓存键
      let cacheKey: string
      if (typeof options.key === 'function') {
        cacheKey = options.key(...args)
      }
      else if (options.key) {
        cacheKey = options.key
      }
      else {
        cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`
      }

      // 检查缓存条件
      if (options.condition && !options.condition(...args)) {
        return await originalMethod.apply(this, args)
      }

      // 尝试从缓存获取
      let result = await cache.get(cacheKey)
      if (result !== null) {
        console.log('缓存命中:', cacheKey)
        return result
      }

      // 执行原始方法
      result = await originalMethod.apply(this, args)

      // 缓存结果
      await cache.set(cacheKey, result, {
        ttl: options.ttl,
        engine: options.engine,
      })

      return result
    }

    // 添加缓存失效方法
    target[`${propertyKey}CacheInvalidate`] = async function (...args: any[]) {
      let cacheKey: string
      if (typeof options.key === 'function') {
        cacheKey = options.key(...args)
      }
      else if (options.key) {
        cacheKey = options.key
      }
      else {
        cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`
      }

      await cache.remove(cacheKey)
    }
  }
}

// 使用装饰器
class UserService {
  @CacheMethod({
    key: (userId: number) => `user:${userId}`,
    ttl: 10 * 60 * 1000, // 10分钟
    condition: (userId: number) => userId > 0,
  })
  async getUser(userId: number) {
    console.log('从服务器获取用户:', userId)
    const response = await fetch(`/api/users/${userId}`)
    return response.json()
  }

  @CacheMethod({
    key: 'user-list',
    ttl: 5 * 60 * 1000, // 5分钟
    engine: 'localStorage',
  })
  async getUserList() {
    console.log('从服务器获取用户列表')
    const response = await fetch('/api/users')
    return response.json()
  }

  async updateUser(userId: number, userData: any) {
    // 更新用户
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })

    // 失效相关缓存
    await this.getUserCacheInvalidate(userId)
    await this.getUserListCacheInvalidate()

    return response.json()
  }
}
```

### 缓存事件驱动架构

```typescript
// 事件驱动的缓存系统
class EventDrivenCache {
  private cache = createCache()
  private eventBus = new EventTarget()
  private subscribers = new Map<string, Set<(...args: any[]) => any>>()

  constructor() {
    this.setupCacheEventListeners()
  }

  private setupCacheEventListeners() {
    // 监听缓存操作事件
    this.cache.on('set', (event) => {
      this.emit('cache:set', event)
    })

    this.cache.on('get', (event) => {
      this.emit('cache:get', event)
    })

    this.cache.on('remove', (event) => {
      this.emit('cache:remove', event)

      // 触发依赖失效
      this.invalidateDependencies(event.key)
    })
  }

  // 设置数据依赖关系
  setDependency(key: string, dependsOn: string[]) {
    for (const dependency of dependsOn) {
      if (!this.subscribers.has(dependency)) {
        this.subscribers.set(dependency, new Set())
      }
      this.subscribers.get(dependency)!.add(key)
    }
  }

  // 失效依赖的缓存
  private async invalidateDependencies(key: string) {
    const dependents = this.subscribers.get(key)
    if (dependents) {
      for (const dependent of dependents) {
        await this.cache.remove(dependent)
        this.emit('cache:dependency-invalidated', { key: dependent, cause: key })
      }
    }
  }

  // 事件发射
  private emit(eventType: string, data: any) {
    const event = new CustomEvent(eventType, { detail: data })
    this.eventBus.dispatchEvent(event)
  }

  // 事件监听
  on(eventType: string, handler: (event: CustomEvent) => void) {
    this.eventBus.addEventListener(eventType, handler)
  }

  off(eventType: string, handler: (event: CustomEvent) => void) {
    this.eventBus.removeEventListener(eventType, handler)
  }
}

// 使用事件驱动缓存
const eventCache = new EventDrivenCache()

// 设置依赖关系
eventCache.setDependency('user-dashboard', ['user-profile', 'user-settings'])
eventCache.setDependency('user-stats', ['user-profile'])

// 监听缓存事件
eventCache.on('cache:dependency-invalidated', (event) => {
  console.log('依赖缓存已失效:', event.detail)
})

// 当用户配置更新时，相关缓存会自动失效
await eventCache.set('user-profile', newProfile)
// 这会自动失效 'user-dashboard' 和 'user-stats'
```

### 缓存中间件系统

```typescript
// 缓存中间件接口
interface CacheMiddleware {
  name: string
  beforeSet?: (
    key: string,
    value: any,
    options?: any
  ) => Promise<{ key: string, value: any, options?: any }>
  afterSet?: (key: string, value: any, options?: any) => Promise<void>
  beforeGet?: (key: string, options?: any) => Promise<{ key: string, options?: any }>
  afterGet?: (key: string, value: any, options?: any) => Promise<any>
}

// 压缩中间件
const compressionMiddleware: CacheMiddleware = {
  name: 'compression',
  beforeSet: async (key, value, options) => {
    const serialized = JSON.stringify(value)
    if (serialized.length > 1024) {
      // 1KB 以上启用压缩
      const compressed = await compressData(serialized)
      return {
        key,
        value: { __compressed: true, data: compressed },
        options,
      }
    }
    return { key, value, options }
  },
  afterGet: async (key, value, options) => {
    if (value && value.__compressed) {
      const decompressed = await decompressData(value.data)
      return JSON.parse(decompressed)
    }
    return value
  },
}

// 审计中间件
const auditMiddleware: CacheMiddleware = {
  name: 'audit',
  afterSet: async (key, value, options) => {
    await sendAuditLog({
      action: 'cache_set',
      key,
      size: JSON.stringify(value).length,
      timestamp: Date.now(),
      userId: getCurrentUserId(),
    })
  },
  afterGet: async (key, value, options) => {
    await sendAuditLog({
      action: 'cache_get',
      key,
      hit: value !== null,
      timestamp: Date.now(),
      userId: getCurrentUserId(),
    })
  },
}

// 中间件管理器
class MiddlewareCache {
  private cache = createCache()
  private middlewares: CacheMiddleware[] = []

  use(middleware: CacheMiddleware) {
    this.middlewares.push(middleware)
  }

  async set(key: string, value: any, options?: any) {
    let processedKey = key
    let processedValue = value
    let processedOptions = options

    // 执行 beforeSet 中间件
    for (const middleware of this.middlewares) {
      if (middleware.beforeSet) {
        const result = await middleware.beforeSet(processedKey, processedValue, processedOptions)
        processedKey = result.key
        processedValue = result.value
        processedOptions = result.options
      }
    }

    // 执行实际设置
    await this.cache.set(processedKey, processedValue, processedOptions)

    // 执行 afterSet 中间件
    for (const middleware of this.middlewares) {
      if (middleware.afterSet) {
        await middleware.afterSet(processedKey, processedValue, processedOptions)
      }
    }
  }

  async get(key: string, options?: any) {
    let processedKey = key
    let processedOptions = options

    // 执行 beforeGet 中间件
    for (const middleware of this.middlewares) {
      if (middleware.beforeGet) {
        const result = await middleware.beforeGet(processedKey, processedOptions)
        processedKey = result.key
        processedOptions = result.options
      }
    }

    // 执行实际获取
    let value = await this.cache.get(processedKey, processedOptions)

    // 执行 afterGet 中间件
    for (const middleware of this.middlewares) {
      if (middleware.afterGet) {
        value = await middleware.afterGet(processedKey, value, processedOptions)
      }
    }

    return value
  }
}

// 使用中间件系统
const middlewareCache = new MiddlewareCache()
middlewareCache.use(compressionMiddleware)
middlewareCache.use(auditMiddleware)

// 大数据会被自动压缩和审计
await middlewareCache.set('large-data', largeDataObject)
```

## 🎨 Vue 高级集成

### 全局状态管理

```vue
<!-- GlobalStateManager.vue -->
<template>
  <div class="global-state-manager">
    <h3>全局状态管理</h3>

    <!-- 用户信息 -->
    <div class="state-section">
      <h4>用户信息</h4>
      <div v-if="userLoading">加载中...</div>
      <div v-else-if="user">
        <p>姓名: {{ user.name }}</p>
        <p>邮箱: {{ user.email }}</p>
        <button @click="updateUser">更新用户</button>
      </div>
      <div v-else>
        <button @click="loadUser">加载用户</button>
      </div>
    </div>

    <!-- 应用配置 -->
    <div class="state-section">
      <h4>应用配置</h4>
      <div>
        <label>
          主题:
          <select v-model="config.theme">
            <option value="light">浅色</option>
            <option value="dark">深色</option>
          </select>
        </label>
        <label>
          <input type="checkbox" v-model="config.notifications" />
          启用通知
        </label>
      </div>
    </div>

    <!-- 缓存统计 -->
    <div class="state-section">
      <h4>缓存统计</h4>
      <div class="stats-grid">
        <div>总项目: {{ stats.totalItems }}</div>
        <div>总大小: {{ stats.totalSizeFormatted }}</div>
        <div>命中率: {{ stats.hitRatePercentage }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useCache, useCacheStats } from '@ldesign/cache/vue'

// 用户状态管理
const {
  value: user,
  set: setUser,
  get: getUser,
  loading: userLoading,
} = useCache('global-user', {
  defaultValue: null,
  ttl: 24 * 60 * 60 * 1000, // 24小时
})

// 应用配置管理
const { value: config } = useCache('global-config', {
  defaultValue: {
    theme: 'light',
    notifications: true,
    autoSave: true,
  },
  autoSave: true,
  ttl: 30 * 24 * 60 * 60 * 1000, // 30天
})

// 缓存统计
const { formattedStats: stats, startAutoRefresh } = useCacheStats({
  refreshInterval: 5000,
})

// 监听主题变化
watch(
  () => config.value.theme,
  newTheme => {
    document.documentElement.setAttribute('data-theme', newTheme)
  }
)

// 加载用户
const loadUser = async () => {
  const userData = {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    avatar: 'https://example.com/avatar.jpg',
  }
  await setUser(userData)
}

// 更新用户
const updateUser = async () => {
  const updatedUser = {
    ...user.value,
    name: '李四',
    email: 'lisi@example.com',
  }
  await setUser(updatedUser)
}

onMounted(() => {
  startAutoRefresh()
})
</script>

<style scoped>
.global-state-manager {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.state-section {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

label {
  display: block;
  margin: 0.5rem 0;
}

button {
  padding: 0.5rem 1rem;
  margin: 0.25rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #f0f0f0;
}
</style>
```

### 响应式缓存同步

```vue
<!-- CacheSyncDemo.vue -->
<template>
  <div class="cache-sync-demo">
    <h3>跨组件缓存同步演示</h3>

    <div class="demo-grid">
      <!-- 组件 A -->
      <div class="demo-card">
        <h4>组件 A - 计数器</h4>
        <div class="counter">
          <button @click="decrement">-</button>
          <span class="count">{{ sharedCounter }}</span>
          <button @click="increment">+</button>
        </div>
        <p>最后更新: {{ lastUpdateA }}</p>
      </div>

      <!-- 组件 B -->
      <div class="demo-card">
        <h4>组件 B - 显示器</h4>
        <div class="display">
          <p>当前计数: {{ sharedCounter }}</p>
          <p>是否为偶数: {{ isEven ? '是' : '否' }}</p>
          <button @click="reset">重置</button>
        </div>
        <p>最后更新: {{ lastUpdateB }}</p>
      </div>

      <!-- 组件 C -->
      <div class="demo-card">
        <h4>组件 C - 历史记录</h4>
        <div class="history">
          <div v-for="(record, index) in history" :key="index" class="history-item">
            <span>{{ record.action }}</span>
            <span>{{ record.value }}</span>
            <span>{{ new Date(record.timestamp).toLocaleTimeString() }}</span>
          </div>
        </div>
        <button @click="clearHistory">清除历史</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCache } from '@ldesign/cache/vue'

// 共享计数器状态
const { value: sharedCounter, set: setCounter } = useCache('shared-counter', {
  defaultValue: 0,
  autoSave: true,
})

// 操作历史
const { value: history, set: setHistory } = useCache('counter-history', {
  defaultValue: [],
  autoSave: true,
})

// 组件本地状态
const lastUpdateA = ref('')
const lastUpdateB = ref('')

// 计算属性
const isEven = computed(() => sharedCounter.value % 2 === 0)

// 操作方法
const increment = async () => {
  const newValue = sharedCounter.value + 1
  await setCounter(newValue)
  addToHistory('增加', newValue)
  lastUpdateA.value = new Date().toLocaleTimeString()
}

const decrement = async () => {
  const newValue = sharedCounter.value - 1
  await setCounter(newValue)
  addToHistory('减少', newValue)
  lastUpdateA.value = new Date().toLocaleTimeString()
}

const reset = async () => {
  await setCounter(0)
  addToHistory('重置', 0)
  lastUpdateB.value = new Date().toLocaleTimeString()
}

const addToHistory = async (action: string, value: number) => {
  const newHistory = [
    ...history.value,
    {
      action,
      value,
      timestamp: Date.now(),
    },
  ]

  // 保持最近20条记录
  if (newHistory.length > 20) {
    newHistory.shift()
  }

  await setHistory(newHistory)
}

const clearHistory = async () => {
  await setHistory([])
}

// 监听共享状态变化
watch(sharedCounter, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    lastUpdateB.value = new Date().toLocaleTimeString()
    console.log('计数器已更新:', oldValue, '→', newValue)
  }
})
</script>

<style scoped>
.cache-sync-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.demo-card {
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fafafa;
}

.counter {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
}

.count {
  font-size: 2rem;
  font-weight: bold;
  color: #2563eb;
  min-width: 3rem;
  text-align: center;
}

.history {
  max-height: 200px;
  overflow-y: auto;
  margin: 1rem 0;
}

.history-item {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  gap: 0.5rem;
  padding: 0.25rem;
  border-bottom: 1px solid #e0e0e0;
  font-size: 0.875rem;
}

button {
  padding: 0.5rem 1rem;
  margin: 0.25rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #e0e0e0;
}
</style>
```

## 🔗 相关示例

- [Vue 集成示例](./vue-app.md) - Vue 3 深度集成示例
- [性能优化指南](/guide/performance) - 性能优化实践
- [安全示例](./secure-cache.md) - 安全特性使用示例
- [命名空间迁移](./namespace-migration.md) - 真实项目迁移案例
