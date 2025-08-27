# 性能优化指南

本指南介绍如何优化 @ldesign/crypto 的性能，提高加密操作的效率。

## 1. 缓存策略

### 启用内置缓存

```typescript
import { cryptoManager } from '@ldesign/crypto'

// 配置缓存
cryptoManager.configure({
  enableCache: true,
  maxCacheSize: 1000,
  cacheTimeout: 300000, // 5分钟
})

// 缓存会自动应用于重复的加密操作
const data = 'Hello, World!'
const key = 'my-secret-key'

// 第一次调用会执行加密并缓存结果
const encrypted1 = cryptoManager.encryptData(data, key, 'AES')

// 第二次调用会从缓存返回结果（如果参数相同）
const encrypted2 = cryptoManager.encryptData(data, key, 'AES')
```

### 自定义缓存实现

```typescript
import { LRUCache } from 'lru-cache'

class CustomCryptoCache {
  private cache = new LRUCache<string, any>({
    max: 500,
    ttl: 1000 * 60 * 10, // 10分钟
  })

  generateKey(data: string, key: string, algorithm: string): string {
    return `${algorithm}:${key}:${data.length}:${this.hashData(data)}`
  }

  private hashData(data: string): string {
    // 使用快速哈希算法生成缓存键
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // 转换为32位整数
    }
    return hash.toString(36)
  }

  get(cacheKey: string) {
    return this.cache.get(cacheKey)
  }

  set(cacheKey: string, value: any) {
    this.cache.set(cacheKey, value)
  }

  clear() {
    this.cache.clear()
  }
}

// 使用自定义缓存
const customCache = new CustomCryptoCache()

function cachedEncrypt(data: string, key: string, algorithm: string) {
  const cacheKey = customCache.generateKey(data, key, algorithm)

  // 检查缓存
  let result = customCache.get(cacheKey)
  if (result) {
    return result
  }

  // 执行加密
  result = cryptoManager.encryptData(data, key, algorithm)

  // 存储到缓存
  customCache.set(cacheKey, result)

  return result
}
```

## 2. 批量处理

### 批量加密

```typescript
import { PerformanceOptimizer } from '@ldesign/crypto'

class BatchCryptoProcessor {
  private optimizer = new PerformanceOptimizer()

  async batchEncrypt(
    items: Array<{
      data: string
      key: string
      algorithm: string
    }>
  ) {
    // 使用批量操作优化性能
    const operations = items.map(item => ({
      type: 'encrypt' as const,
      data: item.data,
      key: item.key,
      algorithm: item.algorithm,
    }))

    return await this.optimizer.processBatch(operations)
  }

  async batchHash(data: string[], algorithm: string = 'SHA256') {
    const operations = data.map(item => ({
      type: 'hash' as const,
      data: item,
      algorithm,
    }))

    return await this.optimizer.processBatch(operations)
  }
}

// 使用示例
const processor = new BatchCryptoProcessor()

const items = [
  { data: 'data1', key: 'key1', algorithm: 'AES' },
  { data: 'data2', key: 'key2', algorithm: 'AES' },
  { data: 'data3', key: 'key3', algorithm: 'AES' },
]

const results = await processor.batchEncrypt(items)
```

### 并行处理

```typescript
class ParallelCryptoProcessor {
  private maxConcurrency = navigator.hardwareConcurrency || 4

  async processInParallel<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    concurrency: number = this.maxConcurrency
  ): Promise<R[]> {
    const results: R[] = []
    const executing: Promise<void>[] = []

    for (const item of items) {
      const promise = processor(item).then((result) => {
        results.push(result)
      })

      executing.push(promise)

      if (executing.length >= concurrency) {
        await Promise.race(executing)
        executing.splice(
          executing.findIndex(p => p === promise),
          1
        )
      }
    }

    await Promise.all(executing)
    return results
  }

  async encryptMultiple(
    items: Array<{
      data: string
      key: string
    }>
  ) {
    return this.processInParallel(
      items,
      async (item) => {
        return aes.encrypt(item.data, item.key, { keySize: 256 })
      },
      4 // 并发数
    )
  }
}

// 使用示例
const parallelProcessor = new ParallelCryptoProcessor()

const largeDataSet = Array.from({ length: 1000 }, (_, i) => ({
  data: `data-${i}`,
  key: `key-${i}`,
}))

const results = await parallelProcessor.encryptMultiple(largeDataSet)
```

## 3. 内存优化

### 内存池管理

```typescript
class MemoryPool {
  private bufferPool: ArrayBuffer[] = []
  private maxPoolSize = 100

  getBuffer(size: number): ArrayBuffer {
    // 尝试从池中获取合适大小的缓冲区
    const index = this.bufferPool.findIndex(buffer => buffer.byteLength >= size)

    if (index !== -1) {
      return this.bufferPool.splice(index, 1)[0]
    }

    // 创建新的缓冲区
    return new ArrayBuffer(size)
  }

  returnBuffer(buffer: ArrayBuffer) {
    // 将缓冲区返回到池中
    if (this.bufferPool.length < this.maxPoolSize) {
      this.bufferPool.push(buffer)
    }
  }

  clear() {
    this.bufferPool = []
  }
}

// 使用内存池的加密器
class OptimizedEncryptor {
  private memoryPool = new MemoryPool()

  encrypt(data: string, key: string): string {
    // 获取缓冲区
    const buffer = this.memoryPool.getBuffer(data.length * 2)

    try {
      // 执行加密操作
      const result = this.performEncryption(data, key, buffer)
      return result
    }
    finally {
      // 返回缓冲区到池中
      this.memoryPool.returnBuffer(buffer)
    }
  }

  private performEncryption(data: string, key: string, buffer: ArrayBuffer): string {
    // 实际的加密逻辑
    return aes.encrypt(data, key).data || ''
  }
}
```

### 大文件处理

```typescript
class StreamCryptoProcessor {
  private chunkSize = 64 * 1024 // 64KB 块大小

  async encryptLargeData(
    data: string,
    key: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const chunks = this.splitIntoChunks(data, this.chunkSize)
    const encryptedChunks: string[] = []

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]

      // 加密块
      const encrypted = aes.encrypt(chunk, key, { keySize: 256 })
      if (encrypted.success && encrypted.data) {
        encryptedChunks.push(encrypted.data)
      }

      // 报告进度
      if (onProgress) {
        onProgress(((i + 1) / chunks.length) * 100)
      }

      // 让出控制权，避免阻塞UI
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    }

    return encryptedChunks.join('|')
  }

  private splitIntoChunks(data: string, chunkSize: number): string[] {
    const chunks: string[] = []
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize))
    }
    return chunks
  }

  async decryptLargeData(
    encryptedData: string,
    key: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const encryptedChunks = encryptedData.split('|')
    const decryptedChunks: string[] = []

    for (let i = 0; i < encryptedChunks.length; i++) {
      const chunk = encryptedChunks[i]

      // 解密块
      const decrypted = aes.decrypt(chunk, key, { keySize: 256 })
      if (decrypted.success && decrypted.data) {
        decryptedChunks.push(decrypted.data)
      }

      // 报告进度
      if (onProgress) {
        onProgress(((i + 1) / encryptedChunks.length) * 100)
      }

      // 让出控制权
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    }

    return decryptedChunks.join('')
  }
}

// 使用示例
const streamProcessor = new StreamCryptoProcessor()

const largeData = 'x'.repeat(1024 * 1024) // 1MB 数据
const encrypted = await streamProcessor.encryptLargeData(largeData, 'secret-key', progress =>
  console.log(`加密进度: ${progress.toFixed(1)}%`))
```

## 4. 算法选择优化

### 性能基准测试

```typescript
class AlgorithmBenchmark {
  async benchmarkEncryption(data: string, iterations: number = 1000) {
    const algorithms = ['AES', 'DES', 'Blowfish']
    const results: Record<string, number> = {}

    for (const algorithm of algorithms) {
      const startTime = performance.now()

      for (let i = 0; i < iterations; i++) {
        switch (algorithm) {
          case 'AES':
            aes.encrypt(data, 'test-key')
            break
          case 'DES':
            des.encrypt(data, 'test-key')
            break
          case 'Blowfish':
            blowfish.encrypt(data, 'test-key')
            break
        }
      }

      const endTime = performance.now()
      results[algorithm] = endTime - startTime
    }

    return results
  }

  async benchmarkHashing(data: string, iterations: number = 1000) {
    const algorithms = ['MD5', 'SHA1', 'SHA256', 'SHA512']
    const results: Record<string, number> = {}

    for (const algorithm of algorithms) {
      const startTime = performance.now()

      for (let i = 0; i < iterations; i++) {
        switch (algorithm) {
          case 'MD5':
            hash.md5(data)
            break
          case 'SHA1':
            hash.sha1(data)
            break
          case 'SHA256':
            hash.sha256(data)
            break
          case 'SHA512':
            hash.sha512(data)
            break
        }
      }

      const endTime = performance.now()
      results[algorithm] = endTime - startTime
    }

    return results
  }

  recommendAlgorithm(dataSize: number, securityLevel: 'low' | 'medium' | 'high'): string {
    if (securityLevel === 'high') {
      return dataSize > 1024 * 1024 ? 'AES' : 'AES' // 总是推荐AES用于高安全性
    }
    else if (securityLevel === 'medium') {
      return dataSize > 1024 * 100 ? 'AES' : 'Blowfish'
    }
    else {
      return dataSize > 1024 * 10 ? 'Blowfish' : 'DES'
    }
  }
}

// 使用示例
const benchmark = new AlgorithmBenchmark()

const testData = 'x'.repeat(1024) // 1KB 测试数据
const encryptionResults = await benchmark.benchmarkEncryption(testData)
const hashingResults = await benchmark.benchmarkHashing(testData)

console.log('加密性能:', encryptionResults)
console.log('哈希性能:', hashingResults)

const recommended = benchmark.recommendAlgorithm(1024, 'medium')
console.log('推荐算法:', recommended)
```

## 5. Web Worker 优化

### 在 Web Worker 中执行加密

```typescript
// crypto-worker.ts
import { aes, hash } from '@ldesign/crypto'

self.onmessage = function (e) {
  const { type, data, key, algorithm, id } = e.data

  try {
    let result

    switch (type) {
      case 'encrypt':
        result = aes.encrypt(data, key, { keySize: 256 })
        break
      case 'decrypt':
        result = aes.decrypt(data, key, { keySize: 256 })
        break
      case 'hash':
        result = hash[algorithm](data)
        break
      default:
        throw new Error('未知操作类型')
    }

    self.postMessage({ id, success: true, result })
  }
  catch (error) {
    self.postMessage({
      id,
      success: false,
      error: error.message,
    })
  }
}

// main thread
class WorkerCryptoManager {
  private worker: Worker
  private pendingOperations = new Map<
    string,
    {
      resolve: (value: any) => void
      reject: (error: Error) => void
    }
  >()

  constructor() {
    this.worker = new Worker('/crypto-worker.js')
    this.worker.onmessage = this.handleWorkerMessage.bind(this)
  }

  private handleWorkerMessage(e: MessageEvent) {
    const { id, success, result, error } = e.data
    const operation = this.pendingOperations.get(id)

    if (operation) {
      this.pendingOperations.delete(id)

      if (success) {
        operation.resolve(result)
      }
      else {
        operation.reject(new Error(error))
      }
    }
  }

  async encrypt(data: string, key: string): Promise<any> {
    const id = Math.random().toString(36)

    return new Promise((resolve, reject) => {
      this.pendingOperations.set(id, { resolve, reject })

      this.worker.postMessage({
        type: 'encrypt',
        data,
        key,
        id,
      })
    })
  }

  async hash(data: string, algorithm: string): Promise<string> {
    const id = Math.random().toString(36)

    return new Promise((resolve, reject) => {
      this.pendingOperations.set(id, { resolve, reject })

      this.worker.postMessage({
        type: 'hash',
        data,
        algorithm,
        id,
      })
    })
  }

  destroy() {
    this.worker.terminate()
    this.pendingOperations.clear()
  }
}

// 使用示例
const workerManager = new WorkerCryptoManager()

// 在后台线程中执行加密，不阻塞主线程
const encrypted = await workerManager.encrypt('sensitive data', 'secret-key')
const hashed = await workerManager.hash('data to hash', 'sha256')
```

## 6. 性能监控

### 性能指标收集

```typescript
class CryptoPerformanceMonitor {
  private metrics: Array<{
    operation: string
    algorithm: string
    dataSize: number
    duration: number
    timestamp: number
  }> = []

  async measureOperation<T>(
    operation: string,
    algorithm: string,
    dataSize: number,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now()

    try {
      const result = await fn()
      const duration = performance.now() - startTime

      this.metrics.push({
        operation,
        algorithm,
        dataSize,
        duration,
        timestamp: Date.now(),
      })

      return result
    }
    catch (error) {
      const duration = performance.now() - startTime

      this.metrics.push({
        operation: `${operation}_error`,
        algorithm,
        dataSize,
        duration,
        timestamp: Date.now(),
      })

      throw error
    }
  }

  getAveragePerformance(operation: string, algorithm: string) {
    const relevantMetrics = this.metrics.filter(
      m => m.operation === operation && m.algorithm === algorithm
    )

    if (relevantMetrics.length === 0)
      return null

    const totalDuration = relevantMetrics.reduce((sum, m) => sum + m.duration, 0)
    const averageDuration = totalDuration / relevantMetrics.length

    const totalDataSize = relevantMetrics.reduce((sum, m) => sum + m.dataSize, 0)
    const averageDataSize = totalDataSize / relevantMetrics.length

    return {
      averageDuration,
      averageDataSize,
      throughput: averageDataSize / averageDuration, // bytes per ms
      sampleCount: relevantMetrics.length,
    }
  }

  exportMetrics() {
    return {
      metrics: this.metrics,
      summary: this.generateSummary(),
    }
  }

  private generateSummary() {
    const operations = [...new Set(this.metrics.map(m => m.operation))]
    const algorithms = [...new Set(this.metrics.map(m => m.algorithm))]

    const summary: Record<string, any> = {}

    for (const operation of operations) {
      summary[operation] = {}
      for (const algorithm of algorithms) {
        const perf = this.getAveragePerformance(operation, algorithm)
        if (perf) {
          summary[operation][algorithm] = perf
        }
      }
    }

    return summary
  }
}

// 使用示例
const monitor = new CryptoPerformanceMonitor()

// 监控加密操作
const encrypted = await monitor.measureOperation('encrypt', 'AES', 1024, () =>
  aes.encrypt('test data', 'secret-key'))

// 获取性能报告
const report = monitor.exportMetrics()
console.log('性能报告:', report)
```

## 最佳实践总结

1. **启用缓存**：对于重复的加密操作，启用内置缓存或实现自定义缓存
2. **批量处理**：对于大量数据，使用批量操作和并行处理
3. **内存管理**：使用内存池和流式处理处理大文件
4. **算法选择**：根据数据大小和安全需求选择合适的算法
5. **Web Worker**：将耗时的加密操作移到后台线程
6. **性能监控**：持续监控和优化性能瓶颈

通过这些优化策略，可以显著提高 @ldesign/crypto 的性能表现。
