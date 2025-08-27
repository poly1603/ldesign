# API 参考

@ldesign/http 提供了完整的 TypeScript API，本文档详细介绍了所有可用的接口和方法。

## 核心 API

### createHttpClient

创建 HTTP 客户端实例的工厂函数。

```typescript
function createHttpClient(config?: HttpClientConfig): HttpClient
```

**参数**:
- `config` - 可选的客户端配置

**返回值**:
- `HttpClient` - HTTP 客户端实例

**示例**:
```typescript
import { createHttpClient } from '@ldesign/http'

const http = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### HttpClient

HTTP 客户端类，提供所有 HTTP 请求方法。

#### 请求方法

##### request

发送自定义请求。

```typescript
request<T = any>(config: RequestConfig): Promise<ResponseData<T>>
```

##### get

发送 GET 请求。

```typescript
get<T = any>(url: string, config?: RequestConfig): Promise<ResponseData<T>>
```

##### post

发送 POST 请求。

```typescript
post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>>
```

##### put

发送 PUT 请求。

```typescript
put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>>
```

##### delete

发送 DELETE 请求。

```typescript
delete<T = any>(url: string, config?: RequestConfig): Promise<ResponseData<T>>
```

##### patch

发送 PATCH 请求。

```typescript
patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>>
```

##### head

发送 HEAD 请求。

```typescript
head<T = any>(url: string, config?: RequestConfig): Promise<ResponseData<T>>
```

##### options

发送 OPTIONS 请求。

```typescript
options<T = any>(url: string, config?: RequestConfig): Promise<ResponseData<T>>
```

#### 拦截器

##### interceptors.request

请求拦截器管理器。

```typescript
interceptors.request: InterceptorManager<RequestInterceptor>
```

**方法**:
- `use(fulfilled, rejected?)` - 添加拦截器
- `eject(id)` - 移除拦截器
- `clear()` - 清空所有拦截器

##### interceptors.response

响应拦截器管理器。

```typescript
interceptors.response: InterceptorManager<ResponseInterceptor>
```

##### interceptors.error

错误拦截器管理器。

```typescript
interceptors.error: InterceptorManager<ErrorInterceptor>
```

#### 实用方法

##### cancelAll

取消所有进行中的请求。

```typescript
cancelAll(reason?: string): void
```

##### getActiveRequestCount

获取当前活跃请求数量。

```typescript
getActiveRequestCount(): number
```

##### clearCache

清空所有缓存。

```typescript
clearCache(): Promise<void>
```

##### updateRetryConfig

更新重试配置。

```typescript
updateRetryConfig(config: Partial<RetryConfig>): void
```

##### getConfig

获取当前配置。

```typescript
getConfig(): HttpClientConfig
```

##### getConcurrencyStatus

获取并发状态。

```typescript
getConcurrencyStatus(): {
  activeCount: number
  queuedCount: number
  maxConcurrent: number
  maxQueueSize: number
}
```

## 类型定义

### HttpClientConfig

HTTP 客户端配置接口。

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

请求配置接口。

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

### ResponseData

响应数据接口。

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

### HttpError

HTTP 错误接口。

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
  /** 原始错误 */
  cause?: Error
}
```

### RetryConfig

重试配置接口。

```typescript
interface RetryConfig {
  /** 重试次数 */
  retries?: number
  /** 重试延迟（毫秒） */
  retryDelay?: number
  /** 重试条件函数 */
  retryCondition?: (error: HttpError) => boolean
  /** 重试延迟函数 */
  retryDelayFunction?: (retryCount: number, error: HttpError) => number
}
```

### CacheConfig

缓存配置接口。

```typescript
interface CacheConfig {
  /** 是否启用缓存 */
  enabled?: boolean
  /** 缓存时间（毫秒） */
  ttl?: number
  /** 缓存键生成函数 */
  keyGenerator?: (config: RequestConfig) => string
  /** 缓存存储接口 */
  storage?: CacheStorage
}
```

### ConcurrencyConfig

并发控制配置接口。

```typescript
interface ConcurrencyConfig {
  /** 最大并发数 */
  maxConcurrent?: number
  /** 队列大小限制 */
  maxQueueSize?: number
}
```

## 适配器 API

### HttpAdapter

HTTP 适配器接口。

```typescript
interface HttpAdapter {
  /** 适配器名称 */
  name: string
  /** 发送请求 */
  request: <T = any>(config: RequestConfig) => Promise<ResponseData<T>>
  /** 是否支持该环境 */
  isSupported: () => boolean
}
```

### createAdapter

创建适配器实例。

```typescript
function createAdapter(name?: string | HttpAdapter): HttpAdapter
```

### 内置适配器

#### FetchAdapter

基于 Fetch API 的适配器。

```typescript
class FetchAdapter implements HttpAdapter {
  name: 'fetch'
  request<T>(config: RequestConfig): Promise<ResponseData<T>>
  isSupported(): boolean
}
```

#### AxiosAdapter

基于 Axios 的适配器。

```typescript
class AxiosAdapter implements HttpAdapter {
  name: 'axios'
  request<T>(config: RequestConfig): Promise<ResponseData<T>>
  isSupported(): boolean
}
```

#### AlovaAdapter

基于 Alova 的适配器。

```typescript
class AlovaAdapter implements HttpAdapter {
  name: 'alova'
  request<T>(config: RequestConfig): Promise<ResponseData<T>>
  isSupported(): boolean
}
```

## 拦截器 API

### 内置拦截器

#### createAuthInterceptor

创建认证拦截器。

```typescript
function createAuthInterceptor(options: {
  getToken: () => string | Promise<string>
  tokenType?: string
  headerName?: string
}): RequestInterceptor
```

#### createResponseTimeInterceptor

创建响应时间拦截器。

```typescript
function createResponseTimeInterceptor(options: {
  onResponseTime: (time: number, config: RequestConfig) => void
}): ResponseInterceptor
```

#### requestLoggerInterceptor

请求日志拦截器。

```typescript
const requestLoggerInterceptor: RequestInterceptor
```

#### responseLoggerInterceptor

响应日志拦截器。

```typescript
const responseLoggerInterceptor: ResponseInterceptor
```

#### errorLoggerInterceptor

错误日志拦截器。

```typescript
const errorLoggerInterceptor: ErrorInterceptor
```

## 缓存 API

### CacheManager

缓存管理器类。

```typescript
class CacheManager {
  constructor(config: CacheConfig)
  
  get<T>(config: RequestConfig): Promise<ResponseData<T> | null>
  set<T>(config: RequestConfig, response: ResponseData<T>): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  has(key: string): Promise<boolean>
  size(): Promise<number>
}
```

### createCacheManager

创建缓存管理器。

```typescript
function createCacheManager(config: CacheConfig): CacheManager
```

### 缓存存储

#### MemoryCacheStorage

内存缓存存储。

```typescript
class MemoryCacheStorage implements CacheStorage {
  get(key: string): any
  set(key: string, value: any, ttl?: number): void
  delete(key: string): void
  clear(): void
}
```

#### LocalStorageCacheStorage

本地存储缓存。

```typescript
class LocalStorageCacheStorage implements CacheStorage {
  get(key: string): Promise<any>
  set(key: string, value: any, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}
```

## 并发控制 API

### ConcurrencyManager

并发控制管理器。

```typescript
class ConcurrencyManager {
  constructor(config: ConcurrencyConfig)
  
  execute<T>(fn: () => Promise<T>, config: RequestConfig): Promise<T>
  getStatus(): {
    activeCount: number
    queuedCount: number
    maxConcurrent: number
    maxQueueSize: number
  }
}
```

### DeduplicationManager

请求去重管理器。

```typescript
class DeduplicationManager {
  execute<T>(fn: () => Promise<T>, key: string): Promise<T>
  clear(): void
}
```

## 工具函数

### buildURL

构建完整的 URL。

```typescript
function buildURL(baseURL: string, url: string, params?: Record<string, any>): string
```

### combineURLs

合并 URL。

```typescript
function combineURLs(baseURL: string, relativeURL: string): string
```

### isAbsoluteURL

检查是否为绝对 URL。

```typescript
function isAbsoluteURL(url: string): boolean
```

### createHttpError

创建 HTTP 错误。

```typescript
function createHttpError(
  message: string,
  config?: RequestConfig,
  response?: ResponseData
): HttpError
```

### generateId

生成唯一 ID。

```typescript
function generateId(): string
```

### delay

延迟函数。

```typescript
function delay(ms: number): Promise<void>
```

## 下一步

- [HTTP 客户端详细文档](./http-client) - 深入了解 HTTP 客户端
- [Vue Hooks 文档](./use-request) - 了解 Vue 集成 API
- [示例代码](../examples/) - 查看实际使用示例
