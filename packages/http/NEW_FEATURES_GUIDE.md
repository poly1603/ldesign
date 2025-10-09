# 新功能使用指南

## 🎯 快速开始

### 1. 请求批处理

将多个请求合并为一个批量请求，减少网络开销。

```typescript
import { createBatchManager } from '@ldesign/http'

// 创建批处理管理器
const batchManager = createBatchManager({
  windowMs: 50,        // 批处理窗口 50ms
  maxBatchSize: 10,    // 最大批处理 10 个请求
  endpoint: '/api/batch'
})

// 添加请求到批处理队列
const response1 = batchManager.add({ url: '/users/1', method: 'GET' })
const response2 = batchManager.add({ url: '/users/2', method: 'GET' })
const response3 = batchManager.add({ url: '/users/3', method: 'GET' })

// 这三个请求会被合并为一个批量请求
const [user1, user2, user3] = await Promise.all([response1, response2, response3])

// 查看统计
console.log(batchManager.getStats())
// {
//   totalRequests: 3,
//   batchCount: 1,
//   savedRequests: 2,
//   averageBatchSize: 3,
//   efficiency: 0.67
// }
```

### 2. 离线队列

自动处理离线场景，网络恢复后自动重试。

```typescript
import { createOfflineQueueManager } from '@ldesign/http'

// 创建离线队列管理器
const offlineQueue = createOfflineQueueManager({
  enabled: true,
  maxQueueSize: 100,
  persistent: true,      // 持久化到 localStorage
  retryInterval: 5000,   // 5秒重试间隔
  maxRetries: 3
})

// 添加请求到离线队列
try {
  const response = await offlineQueue.enqueue({
    url: '/api/data',
    method: 'POST',
    data: { message: 'Hello' }
  })
  console.log('请求成功:', response)
} catch (error) {
  console.error('请求失败:', error)
}

// 检查网络状态
if (offlineQueue.isNetworkOnline()) {
  console.log('网络在线')
} else {
  console.log('网络离线，请求已加入队列')
}

// 查看统计
console.log(offlineQueue.getStats())
// {
//   queuedCount: 5,
//   processedCount: 10,
//   failedCount: 1,
//   successRate: 0.91
// }
```

### 3. 请求签名

为 API 请求添加签名，提高安全性。

```typescript
import { createSignatureInterceptor, createHttpClient } from '@ldesign/http'

// 方法 1: 使用拦截器（推荐）
const client = createHttpClient({
  baseURL: 'https://api.example.com'
})

const signatureInterceptor = createSignatureInterceptor({
  secret: 'your-secret-key',
  algorithm: 'sha256',
  expiresIn: 300  // 5分钟有效期
})

client.addRequestInterceptor(signatureInterceptor)

// 所有请求都会自动签名
const response = await client.get('/api/data')

// 方法 2: 手动签名
import { createSignatureManager } from '@ldesign/http'

const signatureManager = createSignatureManager({
  secret: 'your-secret-key',
  algorithm: 'sha256'
})

const requestConfig = {
  url: '/api/data',
  method: 'GET'
}

// 为请求签名
const signedConfig = await signatureManager.sign(requestConfig)

console.log(signedConfig.headers)
// {
//   'X-Signature': 'abc123...',
//   'X-Timestamp': '1234567890',
//   'X-Nonce': 'xyz789...'
// }

// 验证签名
const isValid = await signatureManager.verify(signedConfig)
console.log('签名有效:', isValid)
```

### 4. 内存监控

监控内存使用，防止内存泄漏。

```typescript
import { createMemoryMonitor, globalMemoryCleaner } from '@ldesign/http'

// 创建内存监控器
const memoryMonitor = createMemoryMonitor({
  enabled: true,
  interval: 10000,           // 10秒检查一次
  warningThreshold: 100,     // 100MB 警告
  dangerThreshold: 200,      // 200MB 危险
  autoCleanup: true,
  onWarning: (usage) => {
    console.warn('内存使用警告:', usage)
    // {
    //   used: 120,
    //   total: 256,
    //   percentage: 46.88,
    //   timestamp: 1234567890
    // }
  },
  onDanger: (usage) => {
    console.error('内存使用危险:', usage)
  }
})

// 启动监控
memoryMonitor.start()

// 注册清理处理器
const unregister = globalMemoryCleaner.register(() => {
  // 清理缓存
  cache.clear()
  // 清理其他资源
  pool.clear()
})

// 获取内存统计
const stats = memoryMonitor.getStats()
console.log(stats)
// {
//   current: { used: 80, total: 256, percentage: 31.25, timestamp: ... },
//   peak: { used: 150, total: 256, percentage: 58.59, timestamp: ... },
//   average: 95,
//   warningCount: 2,
//   dangerCount: 0,
//   cleanupCount: 1
// }

// 停止监控
memoryMonitor.stop()

// 取消注册清理处理器
unregister()
```

## 🔧 高级用法

### 组合使用

```typescript
import {
  createHttpClient,
  createBatchManager,
  createOfflineQueueManager,
  createSignatureInterceptor,
  createMemoryMonitor
} from '@ldesign/http'

// 创建 HTTP 客户端
const client = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000
})

// 添加签名拦截器
const signatureInterceptor = createSignatureInterceptor({
  secret: process.env.API_SECRET
})
client.addRequestInterceptor(signatureInterceptor)

// 创建批处理管理器
const batchManager = createBatchManager({
  windowMs: 50,
  maxBatchSize: 10
})

// 创建离线队列
const offlineQueue = createOfflineQueueManager({
  enabled: true,
  persistent: true
})

// 启动内存监控
const memoryMonitor = createMemoryMonitor({
  enabled: true,
  autoCleanup: true
})
memoryMonitor.start()

// 使用示例
async function fetchData() {
  try {
    // 如果在线，使用批处理
    if (offlineQueue.isNetworkOnline()) {
      return await batchManager.add({
        url: '/api/data',
        method: 'GET'
      })
    }
    // 如果离线，加入离线队列
    else {
      return await offlineQueue.enqueue({
        url: '/api/data',
        method: 'GET'
      })
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
```

### 自定义配置

```typescript
// 自定义批处理请求构建器
const batchManager = createBatchManager({
  requestBuilder: (requests) => ({
    method: 'POST',
    url: '/custom/batch',
    data: {
      batch: requests.map(req => ({
        id: generateId(),
        ...req
      }))
    }
  }),
  responseParser: (response) => {
    return response.data.results.map(result => ({
      data: result.data,
      status: result.status,
      statusText: 'OK',
      headers: {},
      config: {}
    }))
  }
})

// 自定义签名生成器
const signatureManager = createSignatureManager({
  secret: 'your-secret',
  customGenerator: async (data, secret) => {
    // 使用自定义算法
    const hmac = await crypto.subtle.sign(
      'HMAC',
      await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ),
      new TextEncoder().encode(data)
    )
    return Array.from(new Uint8Array(hmac))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }
})
```

## 📊 性能建议

### 1. 批处理
- ✅ 适用于频繁发送小请求的场景
- ✅ 可以减少 50-70% 的网络请求
- ⚠️ 不适用于大文件上传

### 2. 离线队列
- ✅ 适用于需要离线支持的应用
- ✅ 提高用户体验
- ⚠️ 注意队列大小限制

### 3. 请求签名
- ✅ 适用于需要高安全性的 API
- ✅ 防止重放攻击
- ⚠️ 会增加少量性能开销

### 4. 内存监控
- ✅ 适用于长时间运行的应用
- ✅ 防止内存泄漏
- ⚠️ 监控间隔不要太短

## 🎉 总结

这些新功能可以帮助你：
- 🚀 提高性能（批处理）
- 💪 提高可靠性（离线队列）
- 🔒 提高安全性（请求签名）
- 🛡️ 防止内存泄漏（内存监控）

根据你的实际需求选择合适的功能组合使用！

