# HttpClient API

`HttpClient` 是 @ldesign/http 的核心类，提供了完整的 HTTP 请求功能。

## 创建客户端

### createHttpClient

创建一个新的 HTTP 客户端实例。

```typescript
function createHttpClient(config?: HttpClientConfig): HttpClient
```

**参数:**

- `config` - 可选的客户端配置

**示例:**

```typescript
import { createHttpClient } from '@ldesign/http'

const http = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
})
```

## 配置选项

### HttpClientConfig

```typescript
interface HttpClientConfig extends RequestConfig {
  /** 适配器名称或实例 */
  adapter?: string | HttpAdapter
  /** 重试配置 */
  retry?: RetryConfig
  /** 缓存配置 */
  cache?: CacheConfig
  /** 并发控制配置 */
  concurrency?: ConcurrencyConfig
}
```

### RequestConfig

```typescript
interface RequestConfig {
  /** 请求 URL */
  url?: string
  /** HTTP 方法 */
  method?: HttpMethod
  /** 请求头 */
  headers?: Record<string, string>
  /** 请求参数（GET 请求的查询参数） */
  params?: Record<string, any>
  /** 请求体数据 */
  data?: any
  /** 超时时间（毫秒） */
  timeout?: number
  /** 基础 URL */
  baseURL?: string
  /** 响应类型 */
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'stream'
  /** 是否携带凭证 */
  withCredentials?: boolean
  /** 取消令牌 */
  signal?: AbortSignal
}
```

## 请求方法

### request

发送 HTTP 请求的通用方法。

```typescript
request<T = any>(config: RequestConfig): Promise<ResponseData<T>>
```

**示例:**

```typescript
const response = await http.request({
  url: '/users',
  method: 'GET',
  params: { page: 1 },
})
```

### get

发送 GET 请求。

```typescript
get<T = any>(url: string, config?: RequestConfig): Promise<ResponseData<T>>
```

**示例:**

```typescript
const users = await http.get('/users')
const user = await http.get('/users/1')
```

### post

发送 POST 请求。

```typescript
post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>>
```

**示例:**

```typescript
const newUser = await http.post('/users', {
  name: 'John Doe',
  email: 'john@example.com',
})
```

### put

发送 PUT 请求。

```typescript
put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>>
```

### delete

发送 DELETE 请求。

```typescript
delete<T = any>(url: string, config?: RequestConfig): Promise<ResponseData<T>>
```

### patch

发送 PATCH 请求。

```typescript
patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>>
```

### head

发送 HEAD 请求。

```typescript
head<T = any>(url: string, config?: RequestConfig): Promise<ResponseData<T>>
```

### options

发送 OPTIONS 请求。

```typescript
options<T = any>(url: string, config?: RequestConfig): Promise<ResponseData<T>>
```

## 拦截器

### interceptors

拦截器管理器，用于添加请求和响应拦截器。

```typescript
interface Interceptors {
  request: InterceptorManager<RequestInterceptor>
  response: InterceptorManager<ResponseInterceptor>
  error: InterceptorManager<ErrorInterceptor>
}
```

**示例:**

```typescript
// 请求拦截器
http.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${token}`
  return config
})

// 响应拦截器
http.interceptors.response.use(response => {
  return response.data
})

// 错误拦截器
http.interceptors.error.use(error => {
  console.error('请求错误:', error)
  return error
})
```

## 控制方法

### cancelAll

取消所有活跃的请求。

```typescript
cancelAll(reason?: string): void
```

### clearCache

清空所有缓存。

```typescript
clearCache(): Promise<void>
```

### getActiveRequestCount

获取当前活跃的请求数量。

```typescript
getActiveRequestCount(): number
```

### getConcurrencyStatus

获取并发控制状态。

```typescript
getConcurrencyStatus(): {
  activeCount: number
  queuedCount: number
  maxConcurrent: number
  maxQueueSize: number
}
```

### updateRetryConfig

更新重试配置。

```typescript
updateRetryConfig(config: Partial<RetryConfig>): void
```

### getConfig

获取当前客户端配置。

```typescript
getConfig(): HttpClientConfig
```

## 响应格式

### ResponseData

```typescript
interface ResponseData<T = any> {
  /** 响应数据 */
  data: T
  /** 状态码 */
  status: number
  /** 状态文本 */
  statusText: string
  /** 响应头 */
  headers: Record<string, string>
  /** 请求配置 */
  config: RequestConfig
  /** 原始响应对象 */
  raw?: any
}
```

## 错误处理

### HttpError

```typescript
interface HttpError extends Error {
  /** 错误代码 */
  code?: string
  /** 请求配置 */
  config?: RequestConfig
  /** 响应数据 */
  response?: ResponseData
  /** 是否为网络错误 */
  isNetworkError?: boolean
  /** 是否为超时错误 */
  isTimeoutError?: boolean
  /** 是否为取消错误 */
  isCancelError?: boolean
}
```

**示例:**

```typescript
try {
  const response = await http.get('/users')
} catch (error) {
  if (error.isNetworkError) {
    console.log('网络错误')
  } else if (error.isTimeoutError) {
    console.log('请求超时')
  } else if (error.response) {
    console.log('服务器错误:', error.response.status)
  }
}
```
