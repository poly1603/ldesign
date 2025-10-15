# HTTP 客户端

HTTP 客户端是 @ldesign/http 的核心，负责发送请求和处理响应。

## 创建客户端

使用 `createHttpClient` 函数创建客户端实例：

```typescript
import { createHttpClient } from '@ldesign/http'

const client = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Custom-Header': 'value'
  }
})
```

## 配置选项

完整的配置选项：

```typescript
interface HttpClientConfig {
  // 基础 URL
  baseURL?: string

  // 超时时间（毫秒）
  timeout?: number

  // 默认请求头
  headers?: Record<string, string>

  // 适配器选择
  adapter?: 'fetch' | 'axios' | 'alova' | HttpAdapter

  // 缓存配置
  cache?: {
    enabled: boolean
    ttl?: number
    strategy?: 'lru' | 'fifo'
  }

  // 重试配置
  retry?: {
    enabled: boolean
    maxAttempts?: number
    delay?: number
    backoff?: 'linear' | 'exponential'
  }

  // 并发控制
  concurrency?: {
    maxConcurrent?: number
    deduplication?: boolean
  }

  // 性能监控
  monitor?: {
    enabled?: boolean
    slowRequestThreshold?: number
  }

  // 优先级队列
  priorityQueue?: {
    enabled?: boolean
  }

  // 连接池
  connectionPool?: {
    maxConnections?: number
    keepAlive?: boolean
  }
}
```

## HTTP 方法

客户端支持所有标准 HTTP 方法：

### GET 请求

```typescript
// 简单 GET 请求
const response = await client.get('/users')

// 带查询参数
const response = await client.get('/users', {
  params: {
    page: 1,
    limit: 10,
    sort: 'name'
  }
})

// 类型安全
interface User {
  id: number
  name: string
}
const response = await client.get<User[]>('/users')
```

### POST 请求

```typescript
// 发送 JSON 数据
const response = await client.post('/users', {
  name: 'John Doe',
  email: 'john@example.com'
})

// 类型安全
interface CreateUserRequest {
  name: string
  email: string
}
interface User {
  id: number
  name: string
  email: string
}
const response = await client.post<User, CreateUserRequest>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
})
```

### PUT 请求

```typescript
// 更新资源
await client.put('/users/1', {
  name: 'Jane Doe',
  email: 'jane@example.com'
})
```

### PATCH 请求

```typescript
// 部分更新
await client.patch('/users/1', {
  name: 'Jane Doe'
})
```

### DELETE 请求

```typescript
// 删除资源
await client.delete('/users/1')
```

### HEAD 请求

```typescript
// 获取响应头
const response = await client.head('/users/1')
console.log(response.headers)
```

### OPTIONS 请求

```typescript
// 获取支持的方法
const response = await client.options('/users')
```

## 请求配置

每个请求都可以单独配置：

```typescript
const response = await client.get('/users', {
  // 请求超时
  timeout: 5000,

  // 请求头
  headers: {
    'Authorization': 'Bearer token'
  },

  // 查询参数
  params: {
    page: 1,
    limit: 10
  },

  // 缓存配置
  cache: {
    enabled: true,
    ttl: 60000,
    tags: ['users']
  },

  // 重试配置
  retry: {
    enabled: true,
    maxAttempts: 3
  },

  // 优先级
  priority: 'high',

  // 取消信号
  signal: abortController.signal
})
```

## 响应对象

所有请求返回统一的响应对象：

```typescript
interface ResponseData<T> {
  // 响应数据
  data: T

  // HTTP 状态码
  status: number

  // 状态文本
  statusText: string

  // 响应头
  headers: Record<string, string>

  // 请求配置
  config: RequestConfig
}
```

使用示例：

```typescript
const response = await client.get<User[]>('/users')

console.log(response.data)      // 用户数组
console.log(response.status)     // 200
console.log(response.statusText)   // "OK"
console.log(response.headers)    // 响应头对象
```

## 错误处理

```typescript
import { HttpError, isHttpError } from '@ldesign/http'

try {
  const response = await client.get('/users')
} catch (error) {
  if (isHttpError(error)) {
    // HTTP 错误
    console.error('状态码:', error.response?.status)
    console.error('错误信息:', error.message)
    console.error('响应数据:', error.response?.data)
  } else {
    // 网络错误或其他错误
    console.error('错误:', error)
  }
}
```

## 拦截器

添加请求和响应拦截器：

```typescript
// 请求拦截器
const requestInterceptorId = client.addRequestInterceptor(
  config => {
    // 修改请求配置
    config.headers.Authorization = `Bearer ${getToken()}`
    return config
  },
  error => {
    // 处理请求错误
    return Promise.reject(error)
  }
)

// 响应拦截器
const responseInterceptorId = client.addResponseInterceptor(
  response => {
    // 处理响应数据
    return response
  },
  error => {
    // 处理响应错误
    if (error.response?.status === 401) {
      // 重定向到登录页
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 移除拦截器
client.removeRequestInterceptor(requestInterceptorId)
client.removeResponseInterceptor(responseInterceptorId)
```

## 实例方法

### 配置管理

```typescript
// 设置配置
client.setConfig({
  timeout: 15000,
  headers: {
    'X-Custom': 'value'
  }
})

// 获取配置
const config = client.getConfig()
```

### 缓存管理

```typescript
// 清空缓存
await client.clearCache()
```

### 取消请求

```typescript
// 取消所有请求
client.cancelAll('用户取消')

// 获取活跃请求数
const count = client.getActiveRequestCount()
```

### 并发状态

```typescript
// 获取并发状态
const status = client.getConcurrencyStatus()
console.log('活跃请求:', status.activeCount)
console.log('队列请求:', status.queuedCount)
```

### 性能统计

```typescript
// 获取性能统计
const stats = client.getPerformanceStats()
console.log('请求总数:', stats.totalRequests)
console.log('平均响应时间:', stats.averageResponseTime)

// 获取慢请求
const slowRequests = client.getSlowRequests()

// 获取失败请求
const failedRequests = client.getFailedRequests()

// 导出所有指标
const metrics = client.exportMetrics()
```

### 销毁客户端

```typescript
// 销毁客户端，清理所有资源
client.destroy()
```

## 文件操作

### 上传文件

```typescript
// 上传单个文件
const file = document.querySelector('input[type="file"]').files[0]

const result = await client.upload('/upload', file, {
  onProgress: (progress) => {
    console.log(`上传进度: ${progress.percentage}%`)
  },
  // 文件验证
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png']
})

// 上传多个文件
const files = Array.from(document.querySelector('input[type="file"]').files)
await client.upload('/upload', files)
```

### 下载文件

```typescript
const result = await client.download('/files/document.pdf', {
  onProgress: (progress) => {
    console.log(`下载进度: ${progress.percentage}%`)
  },
  filename: 'my-document.pdf',
  autoSave: true // 自动保存到本地
})

console.log('文件名:', result.filename)
console.log('文件大小:', result.size)
console.log('文件类型:', result.type)
```

## 完整示例

```typescript
import { createHttpClient } from '@ldesign/http'

// 创建客户端
const client = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  cache: { enabled: true },
  retry: { enabled: true, maxAttempts: 3 },
  concurrency: { maxConcurrent: 10, deduplication: true }
})

// 添加认证拦截器
client.addRequestInterceptor(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 添加错误处理
client.addResponseInterceptor(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 使用客户端
async function fetchData() {
  try {
    // 获取用户列表
    const users = await client.get<User[]>('/users')

    // 创建新用户
    const newUser = await client.post<User>('/users', {
      name: 'John Doe',
      email: 'john@example.com'
    })

    // 更新用户
    await client.put(`/users/${newUser.data.id}`, {
      name: 'Jane Doe'
    })

    // 删除用户
    await client.delete(`/users/${newUser.data.id}`)

    // 查看统计
    const stats = client.getPerformanceStats()
    console.log('性能统计:', stats)
  } catch (error) {
    console.error('操作失败:', error)
  }
}
```

## 下一步

- [适配器](/guide/adapters) - 了解如何选择和配置适配器
- [拦截器](/guide/interceptors) - 深入学习拦截器的使用
- [缓存](/guide/cache) - 掌握高级缓存功能
- [文件操作](/guide/file-operations) - 文件上传和下载
