# API 文档

## 目录

- [CacheManager](#cachemanager)
- [批量操作](#批量操作)
- [命名空间](#命名空间)
- [数据压缩](#数据压缩)
- [智能预取](#智能预取)
- [性能监控](#性能监控)
- [错误处理](#错误处理)
- [Vue 集成](#vue-集成)
- [类型定义](#类型定义)

## 🔗 快速索引（分页面）

- [CacheManager](/api/cache-manager)
- [批量操作](/api/batch)
- [命名空间](/api/namespace)
- [缓存预热](/api/warmup)
- [跨标签页同步](/api/sync)
- [数据压缩](/api/compression)
- [智能预取](/api/prefetch)
- [性能监控](/api/performance-monitor)
- [错误处理](/api/error-handling)
- [Vue 组合式函数](/api/vue-composables)
- [Vue 集成](/api/vue-integration)
- [类型定义](/api/types)
- [存储引擎](/api/storage-engines)

## CacheManager

缓存管理器是核心类，提供所有基础缓存操作。

### 创建实例

```typescript
import { createCache, CacheManager } from '@ldesign/cache'

// 使用工厂函数
const cache = createCache(options)

// 或直接实例化
const cache = new CacheManager(options)
```

### 配置选项

```typescript
interface CacheOptions {
  // 默认存储引擎
  defaultEngine?: StorageEngine
  
  // 引擎配置
  engines?: {
    memory?: {
      enabled?: boolean
      maxItems?: number
      maxMemory?: number
      evictionStrategy?: EvictionStrategyName
    }
    localStorage?: {
      enabled?: boolean
      prefix?: string
    }
    sessionStorage?: {
      enabled?: boolean
      prefix?: string
    }
    indexedDB?: {
      enabled?: boolean
      dbName?: string
      storeName?: string
      version?: number
    }
    cookie?: {
      enabled?: boolean
      domain?: string
      path?: string
      secure?: boolean
      sameSite?: 'strict' | 'lax' | 'none'
    }
  }
  
  // 安全选项
  security?: {
    encryptByDefault?: boolean
    encryptionKey?: string
    obfuscateKeys?: boolean
  }
  
  // 性能选项
  performance?: {
    cleanupInterval?: number
    maxRetries?: number
    retryDelay?: number
  }
}
```

### 基础方法

#### set(key, value, options?)
设置缓存项。

```typescript
await cache.set('user', { id: 1, name: 'Alice' }, {
  ttl: 3600000,        // 过期时间（毫秒）
  encrypt: true,       // 是否加密
  engine: 'localStorage', // 指定引擎
  tags: ['user'],      // 标签
})
```

#### get(key)
获取缓存项。

```typescript
const user = await cache.get<User>('user')
// 返回: User | null
```

#### remove(key)
删除缓存项。

```typescript
await cache.remove('user')
```

#### clear(engine?)
清空缓存。

```typescript
// 清空所有引擎
await cache.clear()

// 清空特定引擎
await cache.clear('localStorage')
```

#### has(key)
检查键是否存在。

```typescript
const exists = await cache.has('user')
// 返回: boolean
```

#### keys(engine?)
获取所有键。

```typescript
const allKeys = await cache.keys()
// 返回: string[]

const memoryKeys = await cache.keys('memory')
```

#### getMetadata(key)
获取缓存元数据。

```typescript
const metadata = await cache.getMetadata('user')
// 返回: CacheMetadata | null

interface CacheMetadata {
  key: string
  size: number
  createdAt: number
  updatedAt: number
  accessedAt: number
  expiresAt?: number
  ttl?: number
  encrypted: boolean
  compressed?: boolean
  engine: StorageEngine
  tags?: string[]
}
```

#### remember(key, fetcher, options?)
获取或设置缓存（缓存未命中时执行 fetcher）。

```typescript
const data = await cache.remember('api-data', 
  async () => {
    const response = await fetch('/api/data')
    return response.json()
  },
  { ttl: 300000 }
)
```

#### getStats()
获取缓存统计。

```typescript
const stats = await cache.getStats()
// 返回: CacheStats

interface CacheStats {
  totalItems: number
  totalSize: number
  hitRate: number
  missRate: number
  evictions: number
  engines: Record<StorageEngine, EngineStats>
}
```

### 性能优化方法

#### optimizeMemory()
手动触发内存优化，清理序列化缓存和事件节流映射。

```typescript
await cache.optimizeMemory()
```

此方法会：
- 清理序列化缓存中的过期条目
- 清理事件节流映射中的过期记录
- 触发内存引擎的清理操作

#### cleanup()
清理所有存储引擎中的过期项。

```typescript
await cache.cleanup()
```

#### destroy()
销毁缓存管理器，清理所有资源。

```typescript
await cache.destroy()
```

此方法会：
- 停止所有定时器
- 清空所有引擎
- 清空统计信息
- 清空事件监听器
- 清理性能优化相关的缓存

## 批量操作

### mset(items, options?)
批量设置缓存项。

```typescript
const results = await cache.mset({
  key1: 'value1',
  key2: 'value2',
  key3: 'value3'
}, { ttl: 3600000 })

// 返回: BatchSetResult
interface BatchSetResult {
  success: string[]
  failed: Array<{ key: string; error: Error }>
}
```

### mget(keys)
批量获取缓存项。

```typescript
const results = await cache.mget(['key1', 'key2', 'key3'])
// 返回: Record<string, any>
// { key1: 'value1', key2: 'value2', key3: null }
```

### mremove(keys)
批量删除缓存项。

```typescript
const results = await cache.mremove(['key1', 'key2'])
// 返回: BatchRemoveResult
interface BatchRemoveResult {
  success: string[]
  failed: Array<{ key: string; error: Error }>
}
```

### mhas(keys)
批量检查键是否存在。

```typescript
const results = await cache.mhas(['key1', 'key2', 'key3'])
// 返回: Record<string, boolean>
// { key1: true, key2: false, key3: true }
```

## 命名空间

### createNamespace(prefix, cache?)
创建命名空间。

```typescript
import { createNamespace } from '@ldesign/cache'

const appNs = createNamespace('app', cache)
const userNs = appNs.namespace('users')
```

### CacheNamespace 类

#### 属性

```typescript
interface CacheNamespace {
  prefix: string        // 命名空间前缀
  separator: string     // 分隔符（默认 ':'）
  cache: CacheManager   // 缓存管理器实例
}
```

#### 方法

所有 `CacheManager` 的方法在命名空间中都可用，键会自动添加前缀。

```typescript
// 设置值（实际键为 'app:users:current'）
await userNs.set('current', userData)

// 获取值
const user = await userNs.get('current')

// 创建子命名空间
const profileNs = userNs.namespace('profile')
```

#### export(filter?)
导出命名空间数据。

```typescript
const data = await userNs.export(
  key => key.startsWith('active')
)
// 返回: ExportedItem[]

interface ExportedItem {
  key: string
  value: any
  metadata?: Partial<CacheMetadata>
}
```

#### import(data, options?)
导入数据到命名空间。

```typescript
await userNs.import(data, {
  overwrite: false,     // 是否覆盖已存在的键
  prefix: 'imported_',  // 添加额外前缀
  transform: (item) => ({
    ...item,
    value: transform(item.value)
  })
})
```

#### clear(recursive?)
清空命名空间。

```typescript
// 只清空当前命名空间
await userNs.clear()

// 递归清空所有子命名空间
await userNs.clear(true)
```

## 数据压缩

### Compressor 类

```typescript
import { Compressor } from '@ldesign/cache'

const compressor = new Compressor({
  enabled: true,
  algorithm: 'gzip',     // 'gzip' | 'deflate' | 'brotli' | 'none'
  minSize: 1024,         // 最小压缩大小（字节）
  level: 6,              // 压缩级别 1-9
  customCompress: async (data) => compressed,
  customDecompress: async (data) => decompressed,
})
```

#### compress(data)
压缩数据。

```typescript
const result = await compressor.compress(jsonString)
// 返回: CompressionResult

interface CompressionResult {
  data: string          // 压缩后的数据
  originalSize: number  // 原始大小
  compressedSize: number // 压缩后大小
  ratio: number         // 压缩率
  algorithm: CompressionAlgorithm
}
```

#### decompress(data, algorithm)
解压数据。

```typescript
const original = await compressor.decompress(
  compressedData, 
  'gzip'
)
```

#### isCompressed(data)
检测数据是否已压缩。

```typescript
const compressed = compressor.isCompressed(data)
// 返回: boolean
```

#### getCompressionStats(data)
获取压缩建议。

```typescript
const stats = compressor.getCompressionStats(data)
// 返回: 
{
  originalSize: number
  potentialSavings: number
  recommendedAlgorithm: CompressionAlgorithm
}
```

### withCompression 装饰器

```typescript
import { withCompression } from '@ldesign/cache'

const compressedCache = withCompression(cache, {
  algorithm: 'gzip',
  minSize: 500,
})

// 使用方式与普通缓存相同，压缩透明处理
await compressedCache.set('data', largeObject)
const data = await compressedCache.get('data')
```

## 智能预取

### Prefetcher 类

```typescript
import { Prefetcher } from '@ldesign/cache'

const prefetcher = new Prefetcher(cacheMap, {
  maxConcurrent: 3,      // 最大并发预取数
  timeout: 5000,         // 预取超时
  enablePredictive: true, // 启用预测性预取
  predictionWindow: 5,   // 预测窗口大小
  minConfidence: 0.6,    // 最小置信度
  prefetchOnIdle: true,  // 空闲时预取
  idleThreshold: 2000,   // 空闲阈值
})
```

#### addRule(rule)
添加预取规则。

```typescript
prefetcher.addRule({
  id: 'product-details',
  trigger: (context) => {
    return context.currentKey?.startsWith('product-list')
  },
  keys: (context) => {
    // 基于上下文生成要预取的键
    return extractProductIds(context.currentKey)
      .map(id => `product-${id}`)
  },
  fetcher: async (key) => {
    return fetch(`/api/${key}`).then(r => r.json())
  },
  priority: 10,
  strategy: 'eager',     // 'eager' | 'lazy' | 'predictive'
  delay: 100,
})
```

#### removeRule(id)
移除预取规则。

```typescript
prefetcher.removeRule('product-details')
```

#### recordAccess(key)
记录访问（用于模式学习）。

```typescript
prefetcher.recordAccess('product-123')
```

#### prefetch(keys, fetcher, options?)
手动预取。

```typescript
await prefetcher.prefetch(
  ['data1', 'data2', 'data3'],
  async (key) => fetch(`/api/${key}`).then(r => r.json()),
  {
    priority: 5,
    strategy: 'lazy',
  }
)
```

#### getStats()
获取预取统计。

```typescript
const stats = prefetcher.getStats()
// 返回:
{
  totalTasks: number
  pendingTasks: number
  runningTasks: number
  completedTasks: number
  failedTasks: number
  patterns: number
  predictions: Array<{ key: string; confidence: number }>
}
```

### withPrefetching 装饰器

```typescript
import { withPrefetching } from '@ldesign/cache'

const smartCache = withPrefetching(cache, {
  enablePredictive: true,
  minConfidence: 0.7,
})

// 访问数据时自动触发预取
const data = await smartCache.get('page1')
// 系统学习访问模式，下次可能预取 page2
```

## 性能监控

### PerformanceMonitor 类

```typescript
import { PerformanceMonitor } from '@ldesign/cache'

const monitor = new PerformanceMonitor({
  enabled: true,
  slowThreshold: 100,    // 慢操作阈值（毫秒）
  samplingRate: 0.1,     // 采样率 (0-1)
  maxRecords: 1000,      // 最大记录数
  collector: (metrics) => {
    // 发送到监控系统
    sendToMonitoring(metrics)
  },
})
```

#### measure(operation, fn, metadata?)
测量操作性能。

```typescript
const result = await monitor.measure(
  'cache.set',
  async () => {
    return await cache.set('key', 'value')
  },
  { key: 'key', engine: 'memory' }
)
```

#### record(metrics)
手动记录性能指标。

```typescript
monitor.record({
  operation: 'custom',
  duration: 123,
  success: true,
  metadata: { custom: 'data' },
})
```

#### getStats(operation?)
获取性能统计。

```typescript
const stats = monitor.getStats('cache.set')
// 返回: PerformanceStats

interface PerformanceStats {
  count: number
  totalDuration: number
  avgDuration: number
  minDuration: number
  maxDuration: number
  successRate: number
}
```

#### getPercentiles(percentiles, operation?)
获取百分位数。

```typescript
const p = monitor.getPercentiles([50, 95, 99], 'cache.get')
// 返回: Record<number, number>
// { 50: 2.5, 95: 10.2, 99: 25.8 }
```

#### generateReport()
生成性能报告。

```typescript
const report = monitor.generateReport()
// 返回格式化的性能报告字符串
```

#### 事件

```typescript
monitor.on('slow', (metrics) => {
  console.warn(`慢操作: ${metrics.operation} 耗时 ${metrics.duration}ms`)
})

monitor.on('error', (metrics) => {
  console.error(`操作失败: ${metrics.operation}`, metrics.error)
})
```

## 错误处理

### RetryManager 类

```typescript
import { RetryManager } from '@ldesign/cache'

const retry = new RetryManager()
```

#### retry(fn, options?)
执行带重试的操作。

```typescript
const result = await retry.retry(
  async () => {
    return await riskyOperation()
  },
  {
    maxAttempts: 3,
    delay: 1000,
    strategy: 'exponential', // 'fixed' | 'linear' | 'exponential'
    maxDelay: 10000,
    jitter: true,
    shouldRetry: (error, attempt) => {
      return !error.message.includes('FATAL')
    },
    onRetry: (error, attempt) => {
      console.log(`重试 ${attempt}: ${error.message}`)
    },
  }
)
```

### CircuitBreaker 类

```typescript
import { CircuitBreaker } from '@ldesign/cache'

const breaker = new CircuitBreaker({
  failureThreshold: 5,    // 失败阈值
  resetTimeout: 60000,    // 重置超时
  halfOpenRequests: 3,    // 半开状态请求数
  monitoringPeriod: 10000, // 监控周期
})
```

#### execute(fn)
通过熔断器执行操作。

```typescript
try {
  const result = await breaker.execute(async () => {
    return await externalService.call()
  })
} catch (error) {
  if (error.message === 'Circuit breaker is OPEN') {
    // 服务不可用
  }
}
```

#### getState()
获取熔断器状态。

```typescript
const state = breaker.getState()
// 返回: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
```

#### reset()
重置熔断器。

```typescript
breaker.reset()
```

### FallbackHandler 类

```typescript
import { FallbackHandler } from '@ldesign/cache'

const fallback = new FallbackHandler<DataType>()
```

#### addFallback(fn)
添加降级方案。

```typescript
fallback
  .addFallback(async () => {
    // 方案1: 从缓存获取
    return await cache.get('backup')
  })
  .addFallback(async () => {
    // 方案2: 返回默认值
    return getDefaultValue()
  })
```

#### execute(primary, options?)
执行带降级的操作。

```typescript
const data = await fallback.execute(
  async () => {
    return await primaryDataSource.fetch()
  },
  {
    onFallback: (level, error) => {
      console.log(`降级到方案 ${level}: ${error.message}`)
    },
  }
)
```

### 装饰器函数

```typescript
import { withRetry, withCircuitBreaker, withFallback } from '@ldesign/cache'

// 添加重试
const retryableFn = withRetry(originalFn, {
  maxAttempts: 3,
})

// 添加熔断器
const protectedFn = withCircuitBreaker(originalFn, {
  failureThreshold: 5,
})

// 添加降级
const resilientFn = withFallback(
  primaryFn,
  fallbackFn1,
  fallbackFn2
)
```

## Vue 集成

### useCache
获取缓存实例。

```typescript
import { useCache } from '@ldesign/cache/vue'

export default {
  setup() {
    const cache = useCache()
    
    const loadData = async () => {
      const data = await cache.get('key')
      // ...
    }
    
    return { loadData }
  }
}
```

### useReactiveCache
创建响应式缓存。

```typescript
import { useReactiveCache } from '@ldesign/cache/vue'

export default {
  setup() {
    const userCache = useReactiveCache('user', {
      name: '',
      email: '',
    })
    
    // 自动保存到缓存
    userCache.value.name = 'Alice'
    
    // 启用自动保存
    const stopAutoSave = userCache.enableAutoSave({
      ttl: 3600000,
      throttle: 500,
    })
    
    onUnmounted(() => {
      stopAutoSave()
    })
    
    return { user: userCache.value }
  }
}
```

### CacheProvider
提供全局缓存上下文。

```vue
<template>
  <CacheProvider :options="cacheOptions">
    <App />
  </CacheProvider>
</template>

<script setup>
import { CacheProvider } from '@ldesign/cache/vue'

const cacheOptions = {
  defaultEngine: 'localStorage',
  // ...
}
</script>
```

## 类型定义

### 存储引擎类型

```typescript
type StorageEngine = 
  | 'memory' 
  | 'localStorage' 
  | 'sessionStorage' 
  | 'indexedDB' 
  | 'cookie'
```

### 淘汰策略类型

```typescript
type EvictionStrategyName = 
  | 'LRU'      // 最近最少使用
  | 'LFU'      // 最不常用
  | 'FIFO'     // 先进先出
  | 'MRU'      // 最近使用
  | 'Random'   // 随机
  | 'TTL'      // 基于过期时间
  | 'ARC'      // 自适应替换缓存
```

### 设置选项

```typescript
interface SetOptions {
  ttl?: number           // 过期时间（毫秒）
  encrypt?: boolean      // 是否加密
  compress?: boolean     // 是否压缩
  engine?: StorageEngine // 指定引擎
  tags?: string[]        // 标签
  priority?: number      // 优先级
}
```

### 缓存事件

```typescript
type CacheEventType = 
  | 'set' 
  | 'get' 
  | 'remove' 
  | 'clear' 
  | 'expire'
  | 'evict'

interface CacheEvent {
  type: CacheEventType
  key?: string
  value?: any
  metadata?: CacheMetadata
  timestamp: number
}
```

### 性能指标

```typescript
interface PerformanceMetrics {
  operation: string
  duration: number
  success: boolean
  timestamp: number
  metadata?: Record<string, any>
  error?: Error
}
```

## 错误处理

所有异步方法都可能抛出以下错误：

```typescript
class CacheError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message)
  }
}

// 错误代码
const ErrorCodes = {
  STORAGE_FULL: 'STORAGE_FULL',
  INVALID_KEY: 'INVALID_KEY',
  SERIALIZATION_ERROR: 'SERIALIZATION_ERROR',
  ENCRYPTION_ERROR: 'ENCRYPTION_ERROR',
  ENGINE_NOT_AVAILABLE: 'ENGINE_NOT_AVAILABLE',
  OPERATION_TIMEOUT: 'OPERATION_TIMEOUT',
} as const
```

## 浏览器兼容性

| 特性 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| Memory | ✅ | ✅ | ✅ | ✅ |
| LocalStorage | ✅ | ✅ | ✅ | ✅ |
| SessionStorage | ✅ | ✅ | ✅ | ✅ |
| IndexedDB | ✅ | ✅ | ✅ | ✅ |
| Cookie | ✅ | ✅ | ✅ | ✅ |
| BroadcastChannel | ✅ | ✅ | ❌ | ✅ |
| CompressionStream | ✅ | ✅ | ❌ | ✅ |

注：不支持的特性会自动降级到兼容方案。
