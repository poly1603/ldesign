# 性能优化指南

本指南介绍如何优化 @ldesign/crypto 的性能。

## 概述

@ldesign/crypto 内置了多种性能优化机制：

- **LRU 缓存**：缓存加密结果，避免重复计算
- **密钥派生缓存**：PBKDF2 结果缓存，提升 2.11x 性能
- **批量处理**：并行处理多个加密操作
- **Worker 线程**：利用多核 CPU 进行并行计算
- **内存优化**：智能内存管理，防止泄漏

## 缓存机制

### LRU 缓存

```typescript
import { cryptoManager } from '@ldesign/crypto'

// 启用缓存（默认启用）
const encrypted = cryptoManager.encrypt('data', 'key', 'AES')

// 第二次调用会从缓存读取（如果参数相同）
const encrypted2 = cryptoManager.encrypt('data', 'key', 'AES')

// 获取缓存统计
const stats = cryptoManager.getCacheStats()
console.log('缓存命中率:', stats.hitRate)
console.log('缓存大小:', stats.size)
console.log('缓存命中次数:', stats.hits)
console.log('缓存未命中次数:', stats.misses)
```

### 缓存配置

```typescript
import { PerformanceOptimizer } from '@ldesign/crypto'

const optimizer = new PerformanceOptimizer({
 maxCacheSize: 1000,           // 最大缓存项数
 cacheTTL: 5 * 60 * 1000,     // 5分钟过期
 enableCache: true,             // 启用缓存
 autoCleanupInterval: 60 * 1000, // 自动清理间隔
 memoryThreshold: 50 * 1024 * 1024 // 内存阈值 50MB
})
```

### 手动管理缓存

```typescript
import { cryptoManager } from '@ldesign/crypto'

// 清理过期缓存
const cleaned = cryptoManager.cleanupCache()
console.log(`清理了 ${cleaned} 个过期缓存项`)

// 完全清空缓存
cryptoManager.clearCache()

// 获取性能指标
const metrics = cryptoManager.getPerformanceMetrics()
console.log('每秒操作数:', metrics.operationsPerSecond)
console.log('平均延迟:', metrics.averageLatency, 'ms')
console.log('内存使用:', metrics.memoryUsage, 'bytes')
console.log('缓存命中率:', metrics.cacheHitRate)
```

## 批量处理

### 批量加密

```typescript
import { cryptoManager } from '@ldesign/crypto'

// 准备批量操作
const operations = [
 { id: '1', data: 'data1', key: 'key1', algorithm: 'AES' as const },
 { id: '2', data: 'data2', key: 'key2', algorithm: 'AES' as const },
 { id: '3', data: 'data3', key: 'key3', algorithm: 'AES' as const }
]

// 批量加密（自动并行）
const results = await cryptoManager.batchEncrypt(operations)

results.forEach(result => {
 console.log(`ID: ${result.id}`)
 console.log(`成功: ${result.result.success}`)
 console.log(`数据: ${result.result.data}`)
})
```

### 批量解密

```typescript
import { cryptoManager } from '@ldesign/crypto'

// 批量解密
const decryptOps = encryptedResults.map((item, index) => ({
 id: String(index),
 data: item.data,
 key: item.key,
 algorithm: 'AES' as const,
 options: { iv: item.iv }
}))

const decrypted = await cryptoManager.batchDecrypt(decryptOps)
```

### 并发控制

```typescript
import { PerformanceOptimizer } from '@ldesign/crypto'

// 配置最大并发数
const optimizer = new PerformanceOptimizer({
 maxConcurrency: 10, // 最多同时执行10个操作
 enableParallel: true
})
```

## Worker 线程

### 启用 Worker 池

```typescript
import { getGlobalWorkerPool } from '@ldesign/crypto'

// 创建 Worker 池
const pool = getGlobalWorkerPool({
 maxWorkers: 4,  // Worker 数量
 timeout: 30000   // 超时时间
})

// 在 Worker 中加密
const result = await pool.execute({
 type: 'encrypt',
 algorithm: 'aes',
 data: 'large data',
 key: 'secret-key'
})

console.log(result)
```

### 批量 Worker 处理

```typescript
import { getGlobalWorkerPool } from '@ldesign/crypto'

const pool = getGlobalWorkerPool({ maxWorkers: 4 })

// 批量加密
const operations = [
 { data: 'data1', key: 'key1', algorithm: 'aes' },
 { data: 'data2', key: 'key2', algorithm: 'aes' },
 { data: 'data3', key: 'key3', algorithm: 'aes' }
]

const results = await pool.batchEncrypt(operations)

// 清理 Worker 池
await pool.terminate()
```

## 密钥派生优化

### PBKDF2 缓存

密钥派生是耗时操作，库会自动缓存结果：

```typescript
import { deriveKey } from '@ldesign/crypto'

// 第一次调用（慢）
const derived1 = deriveKey('password', 'salt', {
 iterations: 100000,
 keyLength: 32,
 digest: 'SHA256'
})

// 第二次调用相同参数（快，从缓存读取）
const derived2 = deriveKey('password', 'salt', {
 iterations: 100000,
 keyLength: 32,
 digest: 'SHA256'
})

// 性能提升约 2.11x
```

### 预生成密钥

```typescript
import { RandomUtils } from '@ldesign/crypto'

// 提前生成密钥，避免运行时生成
const keys = {
 aes256: RandomUtils.generateKey(32),
 aes192: RandomUtils.generateKey(24),
 aes128: RandomUtils.generateKey(16)
}

// 使用预生成的密钥
const encrypted = aes.encrypt('data', keys.aes256)
```

## 流式处理

### 大文件加密

```typescript
import { ChunkEncryptor } from '@ldesign/crypto'

// 创建流式加密器
const encryptor = new ChunkEncryptor({
 algorithm: 'aes',
 key: 'secret-key',
 chunkSize: 64 * 1024 // 64KB 分块
})

// 分块加密大数据
const largeData = 'very large data...'
const chunks = splitIntoChunks(largeData, 64 * 1024)

for (const chunk of chunks) {
 const encrypted = encryptor.encryptChunk(chunk)
 // 处理加密后的块
}

const final = encryptor.finalize()
```

### 文件流加密

```typescript
import { encryptFile, decryptFile } from '@ldesign/crypto'

// 流式加密文件
await encryptFile('large-file.txt', 'output.enc', 'key', {
 algorithm: 'aes',
 chunkSize: 64 * 1024,
 onProgress: (progress) => {
  console.log(`进度: ${progress.percentage}%`)
  console.log(`处理: ${progress.processed} / ${progress.total} bytes`)
 }
})
```

## 内存优化

### 内存监控

```typescript
import { cryptoManager } from '@ldesign/crypto'

// 获取内存使用情况
const metrics = cryptoManager.getPerformanceMetrics()
console.log('内存使用:', metrics.memoryUsage, 'bytes')

// 内存使用 MB
const memoryMB = metrics.memoryUsage / (1024 * 1024)
console.log(`内存使用: ${memoryMB.toFixed(2)} MB`)
```

### 自动内存清理

```typescript
import { PerformanceOptimizer } from '@ldesign/crypto'

const optimizer = new PerformanceOptimizer({
 // 自动清理配置
 autoCleanupInterval: 60 * 1000,     // 1分钟清理一次
 memoryThreshold: 50 * 1024 * 1024, // 50MB 阈值

 // 超过阈值时自动清理一半缓存
 enableCache: true
})
```

### 手动内存管理

```typescript
// 处理大量数据后清理
async function processLargeDataset(data: string[]) {
 for (const item of data) {
  await processItem(item)

  // 每100项清理一次
  if (data.indexOf(item) % 100 === 0) {
   cryptoManager.cleanupCache()
  }
 }

 // 完成后清空缓存
 cryptoManager.clearCache()
}
```

## 性能测试

### 基准测试

```typescript
import { benchmark } from '@ldesign/crypto'

// 测试加密性能
const results = await benchmark({
 name: 'AES-256 Encryption',
 fn: () => aes.encrypt('test data', 'key', { keySize: 256 }),
 iterations: 1000
})

console.log(`平均时间: ${results.avgTime}ms`)
console.log(`最小时间: ${results.minTime}ms`)
console.log(`最大时间: ${results.maxTime}ms`)
console.log(`每秒操作数: ${results.opsPerSecond}`)
```

### 性能对比

```typescript
import { aes } from '@ldesign/crypto'

// 测试不同配置的性能
const configs = [
 { name: 'AES-128', keySize: 128 },
 { name: 'AES-192', keySize: 192 },
 { name: 'AES-256', keySize: 256 }
]

for (const config of configs) {
 const start = performance.now()

 for (let i = 0; i < 1000; i++) {
  aes.encrypt('test', 'key', { keySize: config.keySize })
 }

 const duration = performance.now() - start
 console.log(`${config.name}: ${duration.toFixed(2)}ms`)
}
```

## 优化建议

### 算法选择

```typescript
// 对称加密：优先 AES
// 快速：AES-128
const fast = aes.encrypt('data', 'key', { keySize: 128 })

// 平衡：AES-192
const balanced = aes.encrypt('data', 'key', { keySize: 192 })

// 安全：AES-256（推荐）
const secure = aes.encrypt('data', 'key', { keySize: 256 })
```

### 缓存策略

```typescript
// 高频操作：启用缓存
const optimizer1 = new PerformanceOptimizer({
 enableCache: true,
 maxCacheSize: 1000,
 cacheTTL: 5 * 60 * 1000
})

// 低频操作：禁用缓存
const optimizer2 = new PerformanceOptimizer({
 enableCache: false
})
```

### 批量优化

```typescript
// 避免：逐个加密
for (const item of items) {
 const encrypted = aes.encrypt(item, 'key')
 // 处理...
}

// 推荐：批量加密
const operations = items.map((item, index) => ({
 id: String(index),
 data: item,
 key: 'key',
 algorithm: 'AES' as const
}))

const results = await cryptoManager.batchEncrypt(operations)
```

## 性能监控

### 实时监控

```typescript
import { cryptoManager } from '@ldesign/crypto'

// 定期获取性能指标
setInterval(() => {
 const metrics = cryptoManager.getPerformanceMetrics()

 console.log('性能指标:')
 console.log('- 操作数/秒:', metrics.operationsPerSecond.toFixed(2))
 console.log('- 平均延迟:', metrics.averageLatency.toFixed(2), 'ms')
 console.log('- 内存使用:', (metrics.memoryUsage / 1024 / 1024).toFixed(2), 'MB')
 console.log('- 缓存命中率:', (metrics.cacheHitRate * 100).toFixed(2), '%')
 console.log('- 缓存大小:', metrics.cacheSize)
}, 10000) // 每10秒
```

### 性能日志

```typescript
class PerformanceLogger {
 private logs: any[] = []

 log(operation: string, duration: number) {
  this.logs.push({
   operation,
   duration,
   timestamp: Date.now()
  })

  // 保持最近100条记录
  if (this.logs.length > 100) {
   this.logs.shift()
  }
 }

 getStats() {
  const durations = this.logs.map(l => l.duration)
  return {
   count: this.logs.length,
   avg: durations.reduce((a, b) => a + b, 0) / durations.length,
   min: Math.min(...durations),
   max: Math.max(...durations)
  }
 }
}

// 使用
const logger = new PerformanceLogger()

const start = performance.now()
const result = aes.encrypt('data', 'key')
const duration = performance.now() - start

logger.log('AES Encrypt', duration)
```

## Vue 性能优化

### 防抖加密

```vue
<script setup>
import { ref, watch } from 'vue'
import { useEncryption } from '@ldesign/crypto/vue'
import { useDebounceFn } from '@vueuse/core'

const encryption = useEncryption()
const input = ref('')
const encrypted = ref('')

// 防抖加密
const debouncedEncrypt = useDebounceFn(async (value) => {
 encrypted.value = await encryption.encryptText(value, 'password')
}, 500)

watch(input, debouncedEncrypt)
</script>
```

### 懒加载

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

// 懒加载加密组件
const CryptoComponent = defineAsyncComponent(() =>
 import('./components/CryptoComponent.vue')
)
</script>
```

## 实战案例

### 高性能批量加密

```typescript
import { cryptoManager } from '@ldesign/crypto'

async function encryptLargeDataset(data: string[]): Promise<any[]> {
 const BATCH_SIZE = 100

 const results: any[] = []

 // 分批处理
 for (let i = 0; i < data.length; i += BATCH_SIZE) {
  const batch = data.slice(i, i + BATCH_SIZE)

  const operations = batch.map((item, index) => ({
   id: String(i + index),
   data: item,
   key: 'encryption-key',
   algorithm: 'AES' as const
  }))

  // 批量加密
  const batchResults = await cryptoManager.batchEncrypt(operations)
  results.push(...batchResults)

  // 定期清理缓存
  if (i % 1000 === 0) {
   cryptoManager.cleanupCache()
  }
 }

 return results
}

// 使用
const data = Array(10000).fill('test data')
const encrypted = await encryptLargeDataset(data)
```

## 性能测试结果

根据内部测试，优化后的性能提升：

- **密钥派生缓存**：2.11x 加速
- **批量并行处理**：3-5x 加速（取决于并发数）
- **LRU 缓存**：10-100x 加速（缓存命中时）
- **Worker 线程**：1.5-2x 加速（CPU 密集型任务）

## 下一步

- [配置指南](/guide/configuration) - 优化配置
- [安全性](/guide/security) - 安全最佳实践
- [故障排查](/guide/troubleshooting) - 性能问题排查
