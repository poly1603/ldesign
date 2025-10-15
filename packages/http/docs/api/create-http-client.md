# createHttpClient

创建 HTTP 客户端实例的工厂函数。

## 函数签名

```typescript
function createHttpClient(
  config?: HttpClientConfig,
  adapter?: HttpAdapter
): HttpClient
```

## 参数

### config

客户端配置对象，所有字段都是可选的。

```typescript
interface HttpClientConfig {
  // === 基础配置 ===
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  params?: Record<string, any>
  adapter?: 'fetch' | 'axios' | 'alova' | HttpAdapter

  // === 缓存配置 ===
  cache?: {
    enabled: boolean
    ttl?: number
    maxSize?: number
    strategy?: 'lru' | 'fifo'
    storage?: CacheStorage
    keyGenerator?: (config: RequestConfig) => string
  }

  // === 重试配置 ===
  retry?: {
    enabled: boolean
    maxAttempts?: number
    delay?: number
    backoff?: 'linear' | 'exponential'
    retryCondition?: (error: HttpError) => boolean
    onRetry?: (attempt: number, error: HttpError) => void
  }

  // === 并发配置 ===
  concurrency?: {
    maxConcurrent?: number
    maxQueueSize?: number
    deduplication?: boolean
    timeout?: number
  }

  // === 监控配置 ===
  monitor?: {
    enabled?: boolean
    slowRequestThreshold?: number
    maxMetricsSize?: number
    sampling?: boolean
    samplingRate?: number
  }

  // === 优先级队列配置 ===
  priorityQueue?: {
    enabled?: boolean
    maxQueueSize?: number
  }

  // === 连接池配置 ===
  connectionPool?: {
    maxConnections?: number
    maxConnectionsPerHost?: number
    keepAlive?: boolean
    keepAliveTimeout?: number
  }
}
```

### adapter

可选的适配器实例。如果不提供，将使用 config.adapter 指定的适配器类型，默认为 `'fetch'`。

## 返回值

返回一个 `HttpClient` 实例，提供以下方法：

- HTTP 请求方法：`get`、`post`、`put`、`patch`、`delete`、`head`、`options`
- 文件操作：`upload`、`download`
- 拦截器管理：`addRequestInterceptor`、`addResponseInterceptor`
- 缓存管理：`clearCache`
- 并发控制：`getConcurrencyStatus`、`cancelQueue`
- 性能监控：`getPerformanceStats`、`getSlowRequests`
- 配置管理：`setConfig`、`getConfig`
- 资源清理：`destroy`

## 使用示例

### 基础用法

```typescript
import { createHttpClient } from '@ldesign/http'

const client = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000
})

const response = await client.get('/users')
```

### 完整配置

```typescript
const client = createHttpClient({
  // 基础配置
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Version': '1.0.0'
  },

  // 启用缓存
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5分钟
    maxSize: 50 * 1024 * 1024, // 50MB
    strategy: 'lru'
  },

  // 启用重试
  retry: {
    enabled: true,
    maxAttempts: 3,
    delay: 1000,
    backoff: 'exponential',
    retryCondition: (error) => {
      // 只重试5xx错误和网络错误
      return error.response?.status >= 500 || !error.response
    }
  },

  // 并发控制
  concurrency: {
    maxConcurrent: 10,
    deduplication: true
  },

  // 性能监控
  monitor: {
    enabled: true,
    slowRequestThreshold: 3000,
    sampling: true,
    samplingRate: 0.5
  },

  // 优先级队列
  priorityQueue: {
    enabled: true,
    maxQueueSize: 100
  },

  // 连接池
  connectionPool: {
    maxConnections: 50,
    maxConnectionsPerHost: 10,
    keepAlive: true,
    keepAliveTimeout: 60000
  }
})
```

### 自定义适配器

```typescript
import { createHttpClient, AxiosAdapter } from '@ldesign/http'

// 使用 Axios 适配器
const client = createHttpClient(
  {
    baseURL: 'https://api.example.com'
  },
  new AxiosAdapter()
)
```

### 环境感知配置

```typescript
const isDev = import.meta.env.DEV

const client = createHttpClient({
  baseURL: isDev
    ? 'http://localhost:3000'
    : 'https://api.example.com',

  // 开发环境启用详细日志
  monitor: {
    enabled: isDev,
    slowRequestThreshold: isDev ? 1000 : 3000
  },

  // 生产环境启用更激进的缓存
  cache: {
    enabled: true,
    ttl: isDev ? 10000 : 5 * 60 * 1000
  }
})
```

## 注意事项

1. **适配器选择**：如果不指定适配器，将自动选择可用的适配器，优先级为：Fetch > Axios > Alova

2. **性能考虑**：
   - 启用缓存可以显著提升性能，但会占用内存
   - 监控功能在高负载时会有性能开销，可以启用采样
   - 连接池适合长连接场景

3. **内存管理**：
   - 定期调用 `clearCache()` 清理缓存
   - 使用完毕后调用 `destroy()` 释放资源

4. **TypeScript 支持**：完整的类型推断和检查

## 相关内容

- [HttpClient](/api/http-client) - 客户端实例 API
- [适配器](/guide/adapters) - 了解适配器系统
- [缓存](/guide/cache) - 缓存配置详解
- [重试](/guide/retry) - 重试机制详解
