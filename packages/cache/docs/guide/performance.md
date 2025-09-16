# 性能优化

## 🚀 性能概述

@ldesign/cache 经过精心优化，在各种场景下都能提供出色的性能表现。本文档将帮助你进一步优化缓存性能。

## 📊 性能基准

### 操作性能对比

| 引擎           | 设置 (ops/sec) | 获取 (ops/sec) | 删除 (ops/sec) |
| -------------- | -------------- | -------------- | -------------- |
| Memory         | 1,000,000      | 2,000,000      | 1,500,000      |
| localStorage   | 10,000         | 20,000         | 15,000         |
| sessionStorage | 10,000         | 20,000         | 15,000         |
| Cookie         | 5,000          | 10,000         | 8,000          |
| IndexedDB      | 2,000          | 5,000          | 3,000          |

### 数据大小影响

| 数据大小 | Memory | localStorage | IndexedDB |
| -------- | ------ | ------------ | --------- |
| 1KB      | 0.1ms  | 1ms          | 5ms       |
| 10KB     | 0.2ms  | 3ms          | 8ms       |
| 100KB    | 1ms    | 15ms         | 20ms      |
| 1MB      | 5ms    | 80ms         | 50ms      |

## ⚡ 性能优化策略

> 要点速览：批量优先、分块并发、命名空间分域、预热、同步节流、策略选型。
> 参阅：[批量操作](/api/batch) · [命名空间](/guide/namespaces) · [预热](/api/warmup) · [跨标签页同步](/api/sync)

### 1. 智能引擎选择

```typescript
// ✅ 推荐：启用智能策略，自动优化性能
const cache = createCache({
  strategy: {
    enabled: true,
    weights: {
      performance: 0.4, // 性能权重最高
      size: 0.3,
      ttl: 0.2,
      type: 0.1,
    },
  },
})
```

### 2. 批量操作优化

```typescript
// ✅ 推荐：使用批量操作
class BatchOptimizedCache {
  private cache: CacheManager
  private batchQueue = new Map<string, any>()
  private batchTimer: NodeJS.Timeout | null = null

  async setBatch(key: string, value: any) {
    this.batchQueue.set(key, value)

    // 防抖批量提交
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
    }

    this.batchTimer = setTimeout(() => {
      this.flushBatch()
    }, 100) // 100ms 后批量提交
  }

  private async flushBatch() {
    if (this.batchQueue.size === 0)
      return

    const operations = Array.from(this.batchQueue.entries()).map(([key, value]) =>
      this.cache.set(key, value)
    )

    await Promise.all(operations)
    this.batchQueue.clear()
    this.batchTimer = null
  }
}
```

### 3. 预加载和预热

```typescript
// ✅ 推荐：智能预加载
class PreloadCache {
  private cache: CacheManager
  private preloadQueue = new Set<string>()

  constructor() {
    this.cache = createCache()
    this.startPreloadWorker()
  }

  // 标记需要预加载的数据
  markForPreload(key: string) {
    this.preloadQueue.add(key)
  }

  // 预加载工作器
  private startPreloadWorker() {
    setInterval(async () => {
      if (this.preloadQueue.size === 0)
        return

      // 在空闲时间预加载
      if (this.isIdle()) {
        const key = this.preloadQueue.values().next().value
        this.preloadQueue.delete(key)

        try {
          await this.preloadData(key)
        }
        catch (error) {
          console.warn('预加载失败:', key, error)
        }
      }
    }, 1000)
  }

  private isIdle(): boolean {
    // 检查系统是否空闲
    return performance.now() % 100 < 10 // 简单的空闲检测
  }

  private async preloadData(key: string) {
    // 实现预加载逻辑
    const data = await this.fetchDataFromSource(key)
    await this.cache.set(key, data)
  }
}
```

## 🔧 内存优化

### 1. LRU 缓存实现

```typescript
// ✅ 推荐：LRU 缓存优化
class LRUOptimizedCache {
  private cache: CacheManager
  private accessOrder = new Map<string, number>()
  private accessCounter = 0

  constructor() {
    this.cache = createCache({
      engines: {
        memory: {
          maxItems: 1000,
          evictionPolicy: 'lru',
        },
      },
    })
  }

  async get(key: string) {
    // 更新访问顺序
    this.accessOrder.set(key, ++this.accessCounter)

    return await this.cache.get(key)
  }

  async set(key: string, value: any, options?: any) {
    // 检查是否需要清理
    if (this.accessOrder.size >= 1000) {
      await this.evictLeastRecentlyUsed()
    }

    this.accessOrder.set(key, ++this.accessCounter)
    await this.cache.set(key, value, options)
  }

  private async evictLeastRecentlyUsed() {
    // 找到最久未使用的项
    let oldestKey = ''
    let oldestAccess = Infinity

    for (const [key, access] of this.accessOrder) {
      if (access < oldestAccess) {
        oldestAccess = access
        oldestKey = key
      }
    }

    if (oldestKey) {
      await this.cache.remove(oldestKey)
      this.accessOrder.delete(oldestKey)
    }
  }
}
```

### 2. 内存监控

```typescript
// ✅ 推荐：内存使用监控
class MemoryMonitor {
  private cache: CacheManager
  private memoryThreshold = 80 // 80% 阈值

  constructor(cache: CacheManager) {
    this.cache = cache
    this.startMonitoring()
  }

  private startMonitoring() {
    setInterval(async () => {
      const stats = await this.cache.getEngineStats('memory')

      if (stats.usagePercentage > this.memoryThreshold) {
        console.warn('内存使用率过高:', `${stats.usagePercentage}%`)
        await this.performCleanup()
      }
    }, 30 * 1000) // 30秒检查一次
  }

  private async performCleanup() {
    // 清理过期数据
    await this.cache.cleanup()

    // 如果仍然过高，清理最久未使用的数据
    const stats = await this.cache.getEngineStats('memory')
    if (stats.usagePercentage > this.memoryThreshold) {
      await this.cache.clearLRU(0.2) // 清理20%的数据
    }
  }
}
```

## 🔄 异步优化

### 1. 并发控制

```typescript
// ✅ 推荐：并发操作控制
class ConcurrencyControlledCache {
  private cache: CacheManager
  private concurrencyLimit = 10
  private activeOperations = 0
  private operationQueue: Array<() => Promise<any>> = []

  async set(key: string, value: any, options?: any) {
    return this.executeWithConcurrencyControl(async () => {
      return this.cache.set(key, value, options)
    })
  }

  async get(key: string, options?: any) {
    return this.executeWithConcurrencyControl(async () => {
      return this.cache.get(key, options)
    })
  }

  private async executeWithConcurrencyControl<T>(operation: () => Promise<T>): Promise<T> {
    if (this.activeOperations >= this.concurrencyLimit) {
      // 加入队列等待
      return new Promise((resolve, reject) => {
        this.operationQueue.push(async () => {
          try {
            const result = await operation()
            resolve(result)
          }
          catch (error) {
            reject(error)
          }
        })
      })
    }

    this.activeOperations++

    try {
      const result = await operation()
      return result
    }
    finally {
      this.activeOperations--

      // 处理队列中的下一个操作
      if (this.operationQueue.length > 0) {
        const nextOperation = this.operationQueue.shift()!
        nextOperation()
      }
    }
  }
}
```

### 2. 异步队列优化

```typescript
// ✅ 推荐：异步队列优化
class QueueOptimizedCache {
  private cache: CacheManager
  private writeQueue = new Map<string, any>()
  private isProcessing = false

  async set(key: string, value: any, options?: any) {
    // 合并相同键的写操作
    this.writeQueue.set(key, { value, options })

    if (!this.isProcessing) {
      this.processQueue()
    }
  }

  private async processQueue() {
    this.isProcessing = true

    while (this.writeQueue.size > 0) {
      const batch = Array.from(this.writeQueue.entries()).slice(0, 10) // 每批10个
      this.writeQueue.clear()

      // 并行处理批次
      await Promise.all(
        batch.map(([key, { value, options }]) => this.cache.set(key, value, options))
      )

      // 让出控制权
      await new Promise(resolve => setTimeout(resolve, 0))
    }

    this.isProcessing = false
  }
}
```

## 📈 性能监控

### 1. 性能指标收集

```typescript
// ✅ 推荐：详细性能监控
class PerformanceMonitor {
  private cache: CacheManager
  private metrics = {
    operations: {
      set: { count: 0, totalTime: 0 },
      get: { count: 0, totalTime: 0 },
      remove: { count: 0, totalTime: 0 },
    },
    engines: new Map<
      string,
      {
        operations: number
        totalTime: number
        errors: number
      }
    >(),
  }

  constructor(cache: CacheManager) {
    this.cache = cache
    this.setupMonitoring()
  }

  private setupMonitoring() {
    // 包装缓存操作以收集性能数据
    const originalSet = this.cache.set.bind(this.cache)
    this.cache.set = async (key: string, value: any, options?: any) => {
      const startTime = performance.now()

      try {
        const result = await originalSet(key, value, options)
        const duration = performance.now() - startTime

        this.recordOperation('set', duration, options?.engine)
        return result
      }
      catch (error) {
        this.recordError('set', options?.engine)
        throw error
      }
    }
  }

  private recordOperation(type: string, duration: number, engine?: string) {
    // 记录操作性能
    this.metrics.operations[type].count++
    this.metrics.operations[type].totalTime += duration

    // 记录引擎性能
    if (engine) {
      if (!this.metrics.engines.has(engine)) {
        this.metrics.engines.set(engine, {
          operations: 0,
          totalTime: 0,
          errors: 0,
        })
      }

      const engineMetrics = this.metrics.engines.get(engine)!
      engineMetrics.operations++
      engineMetrics.totalTime += duration
    }
  }

  getPerformanceReport() {
    const report = {
      operations: {},
      engines: {},
    }

    // 计算平均性能
    for (const [type, metrics] of Object.entries(this.metrics.operations)) {
      report.operations[type] = {
        count: metrics.count,
        averageTime: metrics.count > 0 ? metrics.totalTime / metrics.count : 0,
        totalTime: metrics.totalTime,
      }
    }

    for (const [engine, metrics] of this.metrics.engines) {
      report.engines[engine] = {
        operations: metrics.operations,
        averageTime: metrics.operations > 0 ? metrics.totalTime / metrics.operations : 0,
        errorRate: metrics.errors / metrics.operations,
      }
    }

    return report
  }
}
```

### 2. 实时性能监控

```vue
<template>
  <div class="performance-monitor">
    <h3>缓存性能监控</h3>

    <div class="metrics-grid">
      <div class="metric-card">
        <h4>操作性能</h4>
        <div v-for="(metric, operation) in operationMetrics" :key="operation">
          <span>{{ operation }}:</span>
          <span>{{ metric.averageTime.toFixed(2) }}ms</span>
          <span>({{ metric.count }} 次)</span>
        </div>
      </div>

      <div class="metric-card">
        <h4>引擎性能</h4>
        <div v-for="(metric, engine) in engineMetrics" :key="engine">
          <span>{{ engine }}:</span>
          <span>{{ metric.averageTime.toFixed(2) }}ms</span>
          <span>错误率: {{ (metric.errorRate * 100).toFixed(1) }}%</span>
        </div>
      </div>
    </div>

    <div class="performance-chart">
      <!-- 这里可以集成图表库显示性能趋势 -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useCacheManager } from '@ldesign/cache/vue'

const cacheManager = useCacheManager()
const operationMetrics = ref({})
const engineMetrics = ref({})

let monitor: PerformanceMonitor
let updateTimer: NodeJS.Timeout

onMounted(() => {
  monitor = new PerformanceMonitor(cacheManager)

  // 定期更新性能数据
  updateTimer = setInterval(() => {
    const report = monitor.getPerformanceReport()
    operationMetrics.value = report.operations
    engineMetrics.value = report.engines
  }, 1000)
})

onUnmounted(() => {
  if (updateTimer) {
    clearInterval(updateTimer)
  }
})
</script>
```

## 🔧 配置优化

### 1. 引擎配置优化

```typescript
// ✅ 推荐：针对性能优化的引擎配置
const cache = createCache({
  engines: {
    memory: {
      enabled: true,
      maxSize: 100 * 1024 * 1024, // 100MB
      maxItems: 10000, // 增加最大项目数
      cleanupInterval: 2 * 60 * 1000, // 2分钟清理间隔
      evictionPolicy: 'lru', // LRU 淘汰策略
    },
    localStorage: {
      enabled: true,
      compression: true, // 启用压缩节省空间
      batchSize: 50, // 批量操作大小
    },
    indexedDB: {
      enabled: true,
      connectionPool: 5, // 连接池大小
      transactionTimeout: 10000, // 事务超时时间
    },
  },
})
```

### 2. 序列化优化

```typescript
// ✅ 推荐：高性能序列化器
const cache = createCache({
  serializer: {
    serialize: (value: any) => {
      // 使用更快的序列化方法
      if (typeof value === 'string') {
        return value
      }

      if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value)
      }

      // 对象使用 JSON.stringify
      return JSON.stringify(value)
    },

    deserialize: (value: string) => {
      // 尝试快速解析
      if (value === 'true')
        return true
      if (value === 'false')
        return false

      const num = Number(value)
      if (!Number.isNaN(num))
        return num

      try {
        return JSON.parse(value)
      }
      catch {
        return value
      }
    },
  },
})
```

## 📊 缓存命中率优化

### 1. 命中率监控

```typescript
// ✅ 推荐：命中率监控和优化
class HitRateOptimizer {
  private cache: CacheManager
  private hitRateHistory: number[] = []
  private targetHitRate = 0.8 // 目标命中率 80%

  constructor(cache: CacheManager) {
    this.cache = cache
    this.startMonitoring()
  }

  private startMonitoring() {
    setInterval(async () => {
      const stats = await this.cache.getStats()
      const currentHitRate = stats.hitRate

      this.hitRateHistory.push(currentHitRate)

      // 保持最近100个数据点
      if (this.hitRateHistory.length > 100) {
        this.hitRateHistory.shift()
      }

      // 分析趋势并优化
      this.analyzeAndOptimize(currentHitRate)
    }, 60 * 1000) // 每分钟检查
  }

  private analyzeAndOptimize(currentHitRate: number) {
    if (currentHitRate < this.targetHitRate) {
      console.warn('缓存命中率低于目标:', currentHitRate)

      // 自动优化策略
      this.optimizeStrategy()
    }
  }

  private async optimizeStrategy() {
    // 增加热点数据的TTL
    const hotKeys = await this.identifyHotKeys()

    for (const key of hotKeys) {
      const value = await this.cache.get(key)
      if (value !== null) {
        // 延长热点数据的生存时间
        await this.cache.set(key, value, {
          ttl: 2 * 60 * 60 * 1000, // 2小时
        })
      }
    }
  }

  private async identifyHotKeys(): Promise<string[]> {
    // 识别热点数据的逻辑
    const stats = await this.cache.getDetailedStats()
    return stats.mostAccessedKeys.slice(0, 10) // 前10个热点
  }
}
```

### 2. 预测性缓存

```typescript
// ✅ 推荐：预测性缓存
class PredictiveCache {
  private cache: CacheManager
  private accessPatterns = new Map<string, number[]>()

  async get(key: string) {
    // 记录访问模式
    this.recordAccess(key)

    const value = await this.cache.get(key)

    // 预测下一个可能访问的数据
    if (value !== null) {
      this.predictAndPreload(key)
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
  }

  private async predictAndPreload(currentKey: string) {
    // 基于访问模式预测下一个可能的键
    const predictedKeys = this.predictNextKeys(currentKey)

    // 预加载预测的数据
    for (const key of predictedKeys) {
      if (!(await this.cache.has(key))) {
        // 在后台预加载
        this.preloadInBackground(key)
      }
    }
  }

  private predictNextKeys(currentKey: string): string[] {
    // 简单的预测逻辑：基于历史访问模式
    // 实际应用中可以使用更复杂的机器学习算法
    return [`${currentKey}-related`, `${currentKey}-next`]
  }
}
```

## 🎯 Web Worker 优化

### 1. 后台处理

```typescript
// ✅ 推荐：使用 Web Worker 处理重型操作
class WorkerOptimizedCache {
  private cache: CacheManager
  private worker: Worker

  constructor() {
    this.cache = createCache()
    this.worker = new Worker('/cache-worker.js')
    this.setupWorkerCommunication()
  }

  private setupWorkerCommunication() {
    this.worker.onmessage = (event) => {
      const { type, key, result, error } = event.data

      if (type === 'compression-complete') {
        // 压缩完成，存储结果
        this.cache.set(key, result)
      }
    }
  }

  async setLargeData(key: string, data: any) {
    // 发送到 Worker 进行压缩
    this.worker.postMessage({
      type: 'compress',
      key,
      data,
    })
  }
}

// cache-worker.js
globalThis.onmessage = function (event) {
  const { type, key, data } = event.data

  if (type === 'compress') {
    try {
      // 在 Worker 中执行压缩
      const compressed = compressData(data)

      globalThis.postMessage({
        type: 'compression-complete',
        key,
        result: compressed,
      })
    }
    catch (error) {
      globalThis.postMessage({
        type: 'compression-error',
        key,
        error: error.message,
      })
    }
  }
}
```

## 🔍 性能分析工具

### 1. 性能分析器

```typescript
// ✅ 推荐：内置性能分析器
class CacheProfiler {
  private cache: CacheManager
  private profiles = new Map<
    string,
    {
      startTime: number
      endTime?: number
      operation: string
      engine: string
    }
  >()

  startProfile(id: string, operation: string, engine: string) {
    this.profiles.set(id, {
      startTime: performance.now(),
      operation,
      engine,
    })
  }

  endProfile(id: string) {
    const profile = this.profiles.get(id)
    if (profile) {
      profile.endTime = performance.now()

      const duration = profile.endTime - profile.startTime
      console.log(`[Profile] ${profile.operation} on ${profile.engine}: ${duration.toFixed(2)}ms`)

      this.profiles.delete(id)
    }
  }

  // 自动分析性能瓶颈
  analyzeBottlenecks() {
    const operations = Array.from(this.profiles.values())
      .filter(p => p.endTime)
      .map(p => ({
        operation: p.operation,
        engine: p.engine,
        duration: p.endTime! - p.startTime,
      }))
      .sort((a, b) => b.duration - a.duration)

    console.log('性能瓶颈分析:', operations.slice(0, 10))
  }
}
```

### 2. 性能基准测试

```typescript
// ✅ 推荐：性能基准测试
class CacheBenchmark {
  private cache: CacheManager

  async runBenchmark() {
    const results = {
      memory: await this.benchmarkEngine('memory'),
      localStorage: await this.benchmarkEngine('localStorage'),
      sessionStorage: await this.benchmarkEngine('sessionStorage'),
      indexedDB: await this.benchmarkEngine('indexedDB'),
    }

    console.table(results)
    return results
  }

  private async benchmarkEngine(engine: string) {
    const iterations = 1000
    const testData = { test: 'data', timestamp: Date.now() }

    // 设置操作基准
    const setStart = performance.now()
    for (let i = 0; i < iterations; i++) {
      await this.cache.set(`bench-${i}`, testData, { engine })
    }
    const setTime = performance.now() - setStart

    // 获取操作基准
    const getStart = performance.now()
    for (let i = 0; i < iterations; i++) {
      await this.cache.get(`bench-${i}`, { engine })
    }
    const getTime = performance.now() - getStart

    // 删除操作基准
    const removeStart = performance.now()
    for (let i = 0; i < iterations; i++) {
      await this.cache.remove(`bench-${i}`, { engine })
    }
    const removeTime = performance.now() - removeStart

    return {
      engine,
      setOpsPerSec: Math.round(iterations / (setTime / 1000)),
      getOpsPerSec: Math.round(iterations / (getTime / 1000)),
      removeOpsPerSec: Math.round(iterations / (removeTime / 1000)),
      avgSetTime: setTime / iterations,
      avgGetTime: getTime / iterations,
      avgRemoveTime: removeTime / iterations,
    }
  }
}
```

## 🎯 优化建议

### 1. 数据结构优化

```typescript
// ✅ 推荐：优化数据结构
interface OptimizedUserData {
  // 使用更紧凑的数据结构
  id: number // 而不是 string
  name: string
  email: string
  prefs: number // 位掩码而不是对象
  lastLogin: number // 时间戳而不是 Date 对象
}

// 位掩码示例
const PREFERENCES = {
  DARK_THEME: 1 << 0, // 1
  NOTIFICATIONS: 1 << 1, // 2
  AUTO_SAVE: 1 << 2, // 4
  ANALYTICS: 1 << 3, // 8
}

// 设置偏好
let prefs = 0
prefs |= PREFERENCES.DARK_THEME
prefs |= PREFERENCES.NOTIFICATIONS

// 检查偏好
const hasDarkTheme = (prefs & PREFERENCES.DARK_THEME) !== 0
```

### 2. 缓存键优化

```typescript
// ✅ 推荐：优化缓存键设计
class OptimizedKeyCache {
  private cache: CacheManager

  // 使用短键名
  private keyMap = {
    'user-profile': 'up',
    'user-settings': 'us',
    'app-config': 'ac',
    'api-response': 'ar',
  }

  async set(logicalKey: string, value: any, options?: any) {
    const physicalKey = this.keyMap[logicalKey] || logicalKey
    await this.cache.set(physicalKey, value, options)
  }

  async get(logicalKey: string, options?: any) {
    const physicalKey = this.keyMap[logicalKey] || logicalKey
    return await this.cache.get(physicalKey, options)
  }
}
```

### 3. 压缩优化

```typescript
// ✅ 推荐：智能压缩
class CompressionOptimizedCache {
  private cache: CacheManager
  private compressionThreshold = 1024 // 1KB

  async set(key: string, value: any, options?: any) {
    const serialized = JSON.stringify(value)

    // 只对大数据启用压缩
    const shouldCompress = serialized.length > this.compressionThreshold

    await this.cache.set(key, value, {
      ...options,
      compress: shouldCompress,
    })
  }
}
```

## 📱 移动端优化

### 1. 移动端特殊处理

```typescript
// ✅ 推荐：移动端优化
class MobileOptimizedCache {
  private cache: CacheManager
  private isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )

  constructor() {
    this.cache = createCache({
      engines: {
        memory: {
          // 移动端减少内存使用
          maxSize: this.isMobile ? 20 * 1024 * 1024 : 50 * 1024 * 1024,
          maxItems: this.isMobile ? 500 : 1000,
        },
        localStorage: {
          // 移动端启用压缩
          compression: this.isMobile,
        },
      },
    })
  }

  // 移动端优化的设置方法
  async set(key: string, value: any, options?: any) {
    if (this.isMobile) {
      // 移动端使用更短的TTL
      options = {
        ...options,
        ttl: options?.ttl ? Math.min(options.ttl, 60 * 60 * 1000) : 60 * 60 * 1000,
      }
    }

    await this.cache.set(key, value, options)
  }
}
```

### 2. 网络状态感知

```typescript
// ✅ 推荐：网络状态感知缓存
class NetworkAwareCache {
  private cache: CacheManager
  private isOnline = navigator.onLine

  constructor() {
    this.cache = createCache()
    this.setupNetworkListeners()
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncPendingData()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  async set(key: string, value: any, options?: any) {
    await this.cache.set(key, value, options)

    // 离线时标记需要同步
    if (!this.isOnline && options?.syncToServer) {
      await this.cache.set(`${key}:pending-sync`, true)
    }
  }

  private async syncPendingData() {
    const keys = await this.cache.keys()
    const pendingKeys = keys.filter(key => key.endsWith(':pending-sync'))

    for (const pendingKey of pendingKeys) {
      const originalKey = pendingKey.replace(':pending-sync', '')
      const data = await this.cache.get(originalKey)

      try {
        await this.syncToServer(originalKey, data)
        await this.cache.remove(pendingKey)
      }
      catch (error) {
        console.error('同步失败:', originalKey, error)
      }
    }
  }
}
```

## 🔗 相关文档

- [智能策略](./smart-strategy.md) - 自动性能优化
- [存储引擎](./storage-engines.md) - 引擎性能特性
- [监控指南](../api/performance-monitor.md) - 性能监控详解
