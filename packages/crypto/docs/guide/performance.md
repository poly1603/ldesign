# 性能优化

本指南提供了优化 @ldesign/crypto 性能的最佳实践和技巧。

## 算法选择优化

### AES 算法优化

```typescript
import { decrypt, encrypt } from '@ldesign/crypto'

// ✅ 推荐：根据数据大小选择合适的密钥长度
function optimizeAESKeySize(dataSize: number) {
  if (dataSize < 1024) {
    return 128 // 小数据使用 AES-128
  }
  else if (dataSize < 10240) {
    return 192 // 中等数据使用 AES-192
  }
  else {
    return 256 // 大数据使用 AES-256
  }
}

const data = 'Hello, World!'
const key = 'my-secret-key'
const keySize = optimizeAESKeySize(data.length)

const encrypted = encrypt.aes(data, key, { keySize })
```

### 加密模式性能对比

```typescript
// 性能测试：不同 AES 模式的性能对比
async function performanceBenchmark() {
  const data = 'A'.repeat(10000) // 10KB 数据
  const key = 'benchmark-key'
  const modes = ['ECB', 'CBC', 'CFB', 'OFB', 'CTR']

  const results = {}

  for (const mode of modes) {
    const startTime = performance.now()

    for (let i = 0; i < 100; i++) {
      const encrypted = encrypt.aes(data, key, { mode })
      decrypt.aes(encrypted, key, { mode })
    }

    const endTime = performance.now()
    results[mode] = endTime - startTime
  }

  console.log('AES 模式性能对比 (100次操作):', results)
  // 通常结果：ECB > CTR > CBC > CFB > OFB
}
```

### 哈希算法性能优化

```typescript
import { hash } from '@ldesign/crypto'

// 根据用途选择合适的哈希算法
function selectHashAlgorithm(purpose: string) {
  switch (purpose) {
    case 'checksum':
      return 'MD5' // 最快，仅用于校验和
    case 'general':
      return 'SHA256' // 平衡性能和安全性
    case 'security':
      return 'SHA512' // 最安全，性能较慢
    default:
      return 'SHA256'
  }
}

// 批量哈希优化
function batchHash(dataList: string[], algorithm = 'SHA256') {
  const startTime = performance.now()

  const results = dataList.map((data) => {
    switch (algorithm) {
      case 'MD5':
        return hash.md5(data)
      case 'SHA1':
        return hash.sha1(data)
      case 'SHA256':
        return hash.sha256(data)
      case 'SHA512':
        return hash.sha512(data)
      default:
        return hash.sha256(data)
    }
  })

  const endTime = performance.now()
  console.log(`批量哈希 ${dataList.length} 项耗时: ${endTime - startTime}ms`)

  return results
}
```

## 内存优化

### 大数据处理优化

```typescript
// 分块处理大数据
class ChunkedCrypto {
  private chunkSize: number

  constructor(chunkSize = 64 * 1024) {
    // 64KB 块
    this.chunkSize = chunkSize
  }

  async encryptLargeData(data: string, key: string): Promise<any[]> {
    const chunks = this.splitIntoChunks(data)
    const encryptedChunks = []

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const encrypted = encrypt.aes(chunk, key)
      encryptedChunks.push({
        index: i,
        data: encrypted,
        size: chunk.length,
      })

      // 释放内存
      chunks[i] = null

      // 避免阻塞主线程
      if (i % 10 === 0) {
        await this.sleep(0)
      }
    }

    return encryptedChunks
  }

  async decryptLargeData(encryptedChunks: any[], key: string): Promise<string> {
    const decryptedChunks = Array.from({ length: encryptedChunks.length })

    for (const chunk of encryptedChunks) {
      const decrypted = decrypt.aes(chunk.data, key)
      decryptedChunks[chunk.index] = decrypted.data

      // 避免阻塞主线程
      await this.sleep(0)
    }

    return decryptedChunks.join('')
  }

  private splitIntoChunks(data: string): string[] {
    const chunks = []
    for (let i = 0; i < data.length; i += this.chunkSize) {
      chunks.push(data.slice(i, i + this.chunkSize))
    }
    return chunks
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 使用示例
const chunkedCrypto = new ChunkedCrypto()
const largeData = 'A'.repeat(1024 * 1024) // 1MB 数据

const encryptedChunks = await chunkedCrypto.encryptLargeData(largeData, 'key')
const decryptedData = await chunkedCrypto.decryptLargeData(encryptedChunks, 'key')
```

### 内存池管理

```typescript
// 内存池优化
class CryptoMemoryPool {
  private bufferPool: ArrayBuffer[] = []
  private maxPoolSize: number

  constructor(maxPoolSize = 100) {
    this.maxPoolSize = maxPoolSize
  }

  getBuffer(size: number): ArrayBuffer {
    // 尝试从池中获取合适大小的缓冲区
    const index = this.bufferPool.findIndex(buffer => buffer.byteLength >= size)

    if (index !== -1) {
      return this.bufferPool.splice(index, 1)[0]
    }

    // 创建新缓冲区
    return new ArrayBuffer(size)
  }

  returnBuffer(buffer: ArrayBuffer): void {
    if (this.bufferPool.length < this.maxPoolSize) {
      this.bufferPool.push(buffer)
    }
  }

  clear(): void {
    this.bufferPool = []
  }
}

const memoryPool = new CryptoMemoryPool()
```

## 缓存优化

### 结果缓存

```typescript
// LRU 缓存实现
class LRUCache<K, V> {
  private cache = new Map<K, V>()
  private maxSize: number

  constructor(maxSize = 1000) {
    this.maxSize = maxSize
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // 移到最前面（最近使用）
      this.cache.delete(key)
      this.cache.set(key, value)
    }
    return value
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    else if (this.cache.size >= this.maxSize) {
      // 删除最久未使用的项
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, value)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// 加密结果缓存
class CachedCrypto {
  private encryptCache = new LRUCache<string, any>(500)
  private hashCache = new LRUCache<string, string>(1000)

  private generateCacheKey(data: string, key: string, algorithm: string): string {
    return `${algorithm}:${this.simpleHash(data)}:${this.simpleHash(key)}`
  }

  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // 转换为32位整数
    }
    return hash.toString(36)
  }

  async cachedEncrypt(data: string, key: string, options: any = {}): Promise<any> {
    const cacheKey = this.generateCacheKey(data, key, 'AES')

    let result = this.encryptCache.get(cacheKey)
    if (result) {
      return result
    }

    result = encrypt.aes(data, key, options)
    this.encryptCache.set(cacheKey, result)

    return result
  }

  async cachedHash(data: string, algorithm = 'SHA256'): Promise<string> {
    const cacheKey = this.generateCacheKey(data, '', algorithm)

    let result = this.hashCache.get(cacheKey)
    if (result) {
      return result
    }

    switch (algorithm) {
      case 'MD5':
        result = hash.md5(data)
        break
      case 'SHA1':
        result = hash.sha1(data)
        break
      case 'SHA256':
        result = hash.sha256(data)
        break
      case 'SHA512':
        result = hash.sha512(data)
        break
      default:
        result = hash.sha256(data)
    }

    this.hashCache.set(cacheKey, result)
    return result
  }

  clearCache(): void {
    this.encryptCache.clear()
    this.hashCache.clear()
  }

  getCacheStats() {
    return {
      encryptCacheSize: this.encryptCache.size(),
      hashCacheSize: this.hashCache.size(),
    }
  }
}

// 使用示例
const cachedCrypto = new CachedCrypto()
```

## Web Worker 优化

### 后台处理

```typescript
// crypto-worker.ts
self.onmessage = function (e) {
  const { type, data, key, options, id } = e.data

  try {
    let result

    switch (type) {
      case 'encrypt':
        result = encrypt.aes(data, key, options)
        break
      case 'decrypt':
        result = decrypt.aes(data, key, options)
        break
      case 'hash':
        result = hash.sha256(data, options)
        break
      default:
        throw new Error(`Unknown operation: ${type}`)
    }

    self.postMessage({ id, success: true, result })
  }
  catch (error) {
    self.postMessage({ id, success: false, error: error.message })
  }
}

// 主线程中使用 Worker
class CryptoWorkerPool {
  private workers: Worker[] = []
  private taskQueue: any[] = []
  private activeWorkers = 0
  private maxWorkers: number

  constructor(maxWorkers = navigator.hardwareConcurrency || 4) {
    this.maxWorkers = maxWorkers
  }

  private createWorker(): Worker {
    const worker = new Worker('/crypto-worker.js')

    worker.onmessage = (e) => {
      const { id, success, result, error } = e.data
      const task = this.taskQueue.find(t => t.id === id)

      if (task) {
        if (success) {
          task.resolve(result)
        }
        else {
          task.reject(new Error(error))
        }

        this.taskQueue = this.taskQueue.filter(t => t.id !== id)
        this.activeWorkers--
        this.processQueue()
      }
    }

    return worker
  }

  private processQueue(): void {
    if (this.taskQueue.length === 0 || this.activeWorkers >= this.maxWorkers) {
      return
    }

    const task = this.taskQueue.find(t => !t.processing)
    if (!task)
      return

    task.processing = true
    this.activeWorkers++

    let worker = this.workers.pop()
    if (!worker) {
      worker = this.createWorker()
    }

    worker.postMessage({
      type: task.type,
      data: task.data,
      key: task.key,
      options: task.options,
      id: task.id,
    })
  }

  async execute(type: string, data: string, key: string, options: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substr(2, 9)

      this.taskQueue.push({
        id,
        type,
        data,
        key,
        options,
        resolve,
        reject,
        processing: false,
      })

      this.processQueue()
    })
  }

  terminate(): void {
    this.workers.forEach(worker => worker.terminate())
    this.workers = []
    this.taskQueue = []
    this.activeWorkers = 0
  }
}

// 使用示例
const workerPool = new CryptoWorkerPool()

// 在后台执行加密
const encrypted = await workerPool.execute('encrypt', 'Hello, World!', 'key')
```

## 批处理优化

### 批量操作

```typescript
// 批量加密处理
class BatchCrypto {
  private batchSize: number
  private processingQueue: any[] = []
  private batchTimeout: number
  private timeoutId: NodeJS.Timeout | null = null

  constructor(batchSize = 10, batchTimeout = 100) {
    this.batchSize = batchSize
    this.batchTimeout = batchTimeout
  }

  async batchEncrypt(items: Array<{ data: string, key: string }>): Promise<any[]> {
    return new Promise((resolve) => {
      const batchId = Math.random().toString(36).substr(2, 9)

      this.processingQueue.push({
        batchId,
        items,
        resolve,
        timestamp: Date.now(),
      })

      this.scheduleBatchProcessing()
    })
  }

  private scheduleBatchProcessing(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }

    if (this.processingQueue.length >= this.batchSize) {
      this.processBatch()
    }
    else {
      this.timeoutId = setTimeout(() => {
        this.processBatch()
      }, this.batchTimeout)
    }
  }

  private async processBatch(): void {
    if (this.processingQueue.length === 0)
      return

    const batch = this.processingQueue.splice(0, this.batchSize)

    // 并行处理批次中的所有项目
    const promises = batch.map(async (batchItem) => {
      const results = await Promise.all(
        batchItem.items.map(item => encrypt.aes(item.data, item.key))
      )

      batchItem.resolve(results)
    })

    await Promise.all(promises)

    // 如果还有待处理的项目，继续处理
    if (this.processingQueue.length > 0) {
      this.scheduleBatchProcessing()
    }
  }
}

// 使用示例
const batchCrypto = new BatchCrypto()

const items = [
  { data: 'data1', key: 'key1' },
  { data: 'data2', key: 'key2' },
  { data: 'data3', key: 'key3' },
]

const results = await batchCrypto.batchEncrypt(items)
```

## 性能监控

### 性能指标收集

```typescript
// 性能监控器
class CryptoPerformanceMonitor {
  private metrics: Map<string, any[]> = new Map()

  startTiming(operation: string): string {
    const timingId = `${operation}_${Date.now()}_${Math.random()}`
    const startTime = performance.now()

    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, [])
    }

    this.metrics.get(operation)!.push({
      id: timingId,
      startTime,
      endTime: null,
      duration: null,
    })

    return timingId
  }

  endTiming(timingId: string): number {
    for (const [operation, timings] of this.metrics.entries()) {
      const timing = timings.find(t => t.id === timingId)
      if (timing) {
        timing.endTime = performance.now()
        timing.duration = timing.endTime - timing.startTime
        return timing.duration
      }
    }
    return 0
  }

  getStats(operation: string) {
    const timings = this.metrics.get(operation) || []
    const durations = timings.filter(t => t.duration !== null).map(t => t.duration)

    if (durations.length === 0) {
      return null
    }

    const sorted = durations.sort((a, b) => a - b)

    return {
      count: durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      avg: durations.reduce((a, b) => a + b, 0) / durations.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    }
  }

  getAllStats() {
    const stats = {}
    for (const operation of this.metrics.keys()) {
      stats[operation] = this.getStats(operation)
    }
    return stats
  }

  clear(): void {
    this.metrics.clear()
  }
}

// 使用示例
const monitor = new CryptoPerformanceMonitor()

// 监控加密操作
const timingId = monitor.startTiming('aes_encrypt')
const encrypted = encrypt.aes('Hello, World!', 'key')
monitor.endTiming(timingId)

// 获取统计信息
const stats = monitor.getStats('aes_encrypt')
console.log('AES 加密性能统计:', stats)
```

## Vue 3 性能优化

### 响应式优化

```typescript
import { useCrypto } from '@ldesign/crypto/vue'
import { markRaw, nextTick, ref, shallowRef } from 'vue'
// 优化的 Vue composable

export function useOptimizedCrypto() {
  const crypto = useCrypto()

  // 使用 shallowRef 避免深度响应式
  const encryptionResults = shallowRef([])
  const processingQueue = shallowRef([])

  // 使用 markRaw 标记不需要响应式的对象
  const cryptoInstance = markRaw(crypto)

  // 批量处理优化
  const batchProcess = async (operations: any[]) => {
    const results = []

    // 分批处理避免阻塞
    for (let i = 0; i < operations.length; i += 10) {
      const batch = operations.slice(i, i + 10)
      const batchResults = await Promise.all(
        batch.map(op => cryptoInstance.encryptAES(op.data, op.key))
      )

      results.push(...batchResults)

      // 让出控制权给 Vue 更新 DOM
      await nextTick()
    }

    return results
  }

  return {
    ...crypto,
    encryptionResults,
    batchProcess,
  }
}
```

通过这些性能优化技巧，您可以显著提升 @ldesign/crypto 在各种场景下的性能表现。
