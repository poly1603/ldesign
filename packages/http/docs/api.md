# API 参考文档

## 核心 API

### createHttpClient

创建 HTTP 客户端实例。

```typescript
function createHttpClient(config?: HttpClientConfig, adapter?: HttpAdapter): HttpClient
```

**参数：**
- `config` - 客户端配置对象（可选）
- `adapter` - HTTP 适配器（可选，自动选择最佳适配器）

**返回值：**
- `HttpClient` - HTTP 客户端实例

**示例：**
```typescript
import { createHttpClient } from '@ldesign/http'

const client = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### HttpClient 接口

HTTP 客户端主要接口，提供所有 HTTP 方法。

#### 基础方法

##### get<T>(url, config?)

发送 GET 请求。

```typescript
get<T = any>(url: string, config?: RequestConfig): Promise<ResponseData<T>>
```

**示例：**
```typescript
// 获取用户列表
const users = await client.get<User[]>('/users')

// 带查询参数
const filteredUsers = await client.get<User[]>('/users', {
  params: { status: 'active', page: 1 }
})
```

##### post<T>(url, data?, config?)

发送 POST 请求。

```typescript
post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>>
```

**示例：**
```typescript
// 创建用户
const newUser = await client.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
})
```

##### put<T>(url, data?, config?)

发送 PUT 请求。

```typescript
put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>>
```

##### patch<T>(url, data?, config?)

发送 PATCH 请求。

```typescript
patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>>
```

##### delete<T>(url, config?)

发送 DELETE 请求。

```typescript
delete<T = any>(url: string, config?: RequestConfig): Promise<ResponseData<T>>
```

#### 高级方法

##### upload(url, file, config?)

上传文件。

```typescript
upload(url: string, file: File | Blob, config?: UploadConfig): Promise<UploadResult>
```

**示例：**
```typescript
const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
const file = fileInput.files[0]

const result = await client.upload('/upload', file, {
  onProgress: (progress) => {
    console.log(`上传进度: ${progress.percentage}%`)
  },
  metadata: {
    category: 'avatar'
  }
})
```

##### download(url, config?)

下载文件。

```typescript
download(url: string, config?: DownloadConfig): Promise<DownloadResult>
```

**示例：**
```typescript
const result = await client.download('/files/document.pdf', {
  filename: 'my-document.pdf',
  onProgress: (progress) => {
    console.log(`下载进度: ${progress.percentage}%`)
  }
})
```

## 配置选项

### HttpClientConfig

HTTP 客户端配置接口。

```typescript
interface HttpClientConfig {
  /** 基础 URL */
  baseURL?: string
  
  /** 请求超时时间（毫秒） */
  timeout?: number
  
  /** 默认请求头 */
  headers?: Record<string, string>
  
  /** 默认查询参数 */
  params?: Record<string, any>
  
  /** 缓存配置 */
  cache?: CacheConfig
  
  /** 重试配置 */
  retry?: RetryConfig
  
  /** 并发控制配置 */
  concurrency?: ConcurrencyConfig
  
  /** 监控配置 */
  monitor?: MonitorConfig
}
```

### CacheConfig

缓存配置接口。

```typescript
interface CacheConfig {
  /** 是否启用缓存 */
  enabled?: boolean
  
  /** 默认 TTL（毫秒） */
  ttl?: number
  
  /** 最大缓存条目数 */
  maxSize?: number
  
  /** 缓存存储实现 */
  storage?: CacheStorage
  
  /** 缓存键生成函数 */
  keyGenerator?: (config: RequestConfig) => string
  
  /** 缓存标签 */
  tags?: string[]
}
```

### RetryConfig

重试配置接口。

```typescript
interface RetryConfig {
  /** 是否启用重试 */
  enabled?: boolean
  
  /** 最大重试次数 */
  maxAttempts?: number
  
  /** 重试延迟（毫秒） */
  delay?: number
  
  /** 退避策略 */
  backoff?: 'linear' | 'exponential' | 'fixed'
  
  /** 重试条件函数 */
  shouldRetry?: (error: HttpError, attempt: number) => boolean
}
```

## 拦截器

### 请求拦截器

```typescript
// 添加请求拦截器
client.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    config.headers.Authorization = `Bearer ${getToken()}`
    return config
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)
```

### 响应拦截器

```typescript
// 添加响应拦截器
client.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    return response
  },
  (error) => {
    // 对响应错误做点什么
    if (error.status === 401) {
      // 处理未授权错误
      redirectToLogin()
    }
    return Promise.reject(error)
  }
)
```

## 错误处理

### HttpError

HTTP 错误对象。

```typescript
interface HttpError extends Error {
  /** 错误类型 */
  type: ErrorType
  
  /** HTTP 状态码 */
  status?: number
  
  /** 错误代码 */
  code?: string
  
  /** 请求配置 */
  config?: RequestConfig
  
  /** 响应数据 */
  response?: ResponseData
}
```

### 错误类型

```typescript
enum ErrorType {
  NETWORK = 'network',      // 网络错误
  TIMEOUT = 'timeout',      // 超时错误
  CANCEL = 'cancel',        // 取消错误
  HTTP = 'http',           // HTTP 错误
  PARSE = 'parse',         // 解析错误
  UNKNOWN = 'unknown'      // 未知错误
}
```

## 工具函数

### 类型检查

```typescript
// 检查是否为 FormData
isFormData(value: any): boolean

// 检查是否为 Blob
isBlob(value: any): boolean

// 检查是否为 ArrayBuffer
isArrayBuffer(value: any): boolean

// 检查是否为 URLSearchParams
isURLSearchParams(value: any): boolean
```

### URL 处理

```typescript
// 构建完整 URL
buildURL(baseURL: string, relativeURL?: string, params?: Record<string, any>): string

// 组合 URL
combineURLs(baseURL: string, relativeURL: string): string

// 检查是否为绝对 URL
isAbsoluteURL(url: string): boolean
```

### 配置合并

```typescript
// 合并配置对象
mergeConfig(defaultConfig: RequestConfig, customConfig?: RequestConfig): RequestConfig
```

### 深度克隆

```typescript
// 深度克隆对象
deepClone<T>(obj: T): T
```
