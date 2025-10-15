# API 参考

完整的 API 文档，包括所有导出的类、函数和类型。

## 核心 API

### 工厂函数

- [`createHttpClient`](/api/create-http-client) - 创建 HTTP 客户端实例

### 客户端类

- [`HttpClient`](/api/http-client) - HTTP 客户端核心类

## 适配器

- [`FetchAdapter`](/api/fetch-adapter) - 基于 Fetch API 的适配器
- [`AxiosAdapter`](/api/axios-adapter) - 基于 Axios 的适配器
- [`AlovaAdapter`](/api/alova-adapter) - 基于 Alova 的适配器
- `BaseAdapter` - 适配器基类
- `AdapterFactory` - 适配器工厂

## 拦截器

- [`InterceptorManager`](/api/interceptor-manager) - 拦截器管理器
- [`内置拦截器`](/api/built-in-interceptors) - 预定义的拦截器

### 内置拦截器列表

- `authInterceptor` - 认证拦截器
- `loggingInterceptor` - 日志拦截器
- `retryInterceptor` - 重试拦截器
- `cacheInterceptor` - 缓存拦截器
- `errorHandlingInterceptor` - 错误处理拦截器

## 工具类

### 缓存

- [`CacheManager`](/api/cache-manager) - 基础缓存管理器
- `AdvancedCacheManager` - 高级缓存管理器
- `MemoryCacheStorage` - 内存缓存存储
- `LocalStorageCacheStorage` - 本地存储缓存

### 并发控制

- [`ConcurrencyManager`](/api/concurrency-manager) - 并发管理器
- `DeduplicationManager` - 请求去重管理器
- `RateLimitManager` - 速率限制管理器

### 错误处理

- [`ErrorHandler`](/api/error-handler) - 错误处理器
- `ErrorAnalyzer` - 错误分析器
- `ErrorClassifier` - 错误分类器
- `RetryManager` - 重试管理器

### 性能监控

- [`RequestMonitor`](/api/request-monitor) - 请求监控器
- `RequestPool` - 连接池
- `PriorityQueue` - 优先级队列

### 其他工具

- `CancelManager` - 请求取消管理器
- `BatchManager` - 批处理管理器
- `OfflineQueueManager` - 离线队列管理器
- `SignatureManager` - 签名管理器
- `MemoryMonitor` - 内存监控器
- `HttpDebugger` - 调试器
- `Logger` - 日志记录器
- `SmartRetryManager` - 智能重试管理器
- `DataTransformer` - 数据转换器
- `RequestTracer` - 请求追踪器
- `NetworkMonitor` - 网络状态监控器

## 特性功能

### GraphQL

- `GraphQLClient` - GraphQL 客户端
- `createGraphQLClient` - 创建 GraphQL 客户端

### WebSocket

- `WebSocketClient` - WebSocket 客户端
- `createWebSocketClient` - 创建 WebSocket 客户端

### SSE

- `SSEClient` - SSE 客户端
- `createSSEClient` - 创建 SSE 客户端
- `SimpleSSEClient` - 简单 SSE 客户端

### Mock

- `MockAdapter` - Mock 适配器
- `createMockAdapter` - 创建 Mock 适配器
- `createMockInterceptor` - 创建 Mock 拦截器

## Vue 集成

### 插件

- `HttpPlugin` - Vue 插件
- `createHttpPlugin` - 创建插件实例

### 基础 Composables

- `useHttp` - HTTP 客户端 hook
- `useGet` - GET 请求 hook
- `usePost` - POST 请求 hook
- `usePut` - PUT 请求 hook
- `useDelete` - DELETE 请求 hook
- `usePatch` - PATCH 请求 hook
- `useQuery` - 查询 hook
- `useMutation` - 变更 hook
- `useRequest` - 通用请求 hook

### 高级 Composables

- `useResource` - 资源管理 hook
- `useForm` - 表单处理 hook
- `useRequestQueue` - 请求队列 hook
- `useOptimisticUpdate` - 乐观更新 hook
- `usePolling` - 轮询 hook
- `useNetworkStatus` - 网络状态 hook
- `useDebouncedRequest` - 防抖请求 hook
- `useThrottledRequest` - 节流请求 hook

## 类型定义

### 核心类型

```typescript
// 请求配置
interface RequestConfig {
  url?: string
  method?: HttpMethod
  baseURL?: string
  headers?: Record<string, string>
  params?: Record<string, any>
  data?: any
  timeout?: number
  signal?: AbortSignal
  // ...更多选项
}

// 响应数据
interface ResponseData<T> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: RequestConfig
}

// HTTP 错误
interface HttpError extends Error {
  config: RequestConfig
  response?: ResponseData<any>
  isHttpError: true
}
```

### 适配器类型

```typescript
interface HttpAdapter {
  name: string
  isSupported(): boolean
  request<T>(config: RequestConfig): Promise<ResponseData<T>>
}
```

### 拦截器类型

```typescript
type RequestInterceptor = {
  fulfilled: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
  rejected?: (error: HttpError) => HttpError | Promise<HttpError>
}

type ResponseInterceptor = {
  fulfilled: (response: ResponseData) => ResponseData | Promise<ResponseData>
  rejected?: (error: HttpError) => HttpError | Promise<HttpError>
}
```

## 工具函数

### URL 处理

- `buildURL` - 构建完整 URL
- `buildQueryString` - 构建查询字符串
- `combineURLs` - 合并 URL
- `isAbsoluteURL` - 判断是否为绝对 URL

### 错误处理

- `createHttpError` - 创建 HTTP 错误
- `isHttpError` - 判断是否为 HTTP 错误
- `isNetworkError` - 判断是否为网络错误
- `isTimeoutError` - 判断是否为超时错误

### 类型工具

- `isObject` - 判断是否为对象
- `isArray` - 判断是否为数组
- `isString` - 判断是否为字符串
- `isNumber` - 判断是否为数字
- `isFunction` - 判断是否为函数
- `typedKeys` - 类型安全的 Object.keys
- `typedValues` - 类型安全的 Object.values
- `typedEntries` - 类型安全的 Object.entries
- `deepClone` - 深度克隆
- `safeJsonParse` - 安全的 JSON 解析

### 文件操作

- `formatFileSize` - 格式化文件大小
- `getFileExtension` - 获取文件扩展名
- `getMimeTypeFromFilename` - 从文件名获取 MIME 类型
- `createFileChunks` - 创建文件分片
- `generateFileHash` - 生成文件哈希
- `validateFile` - 验证文件

## 常量

### HTTP 状态码

```typescript
enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  // ...更多状态码
}
```

### 优先级

```typescript
enum Priority {
  CRITICAL = 5,
  HIGH = 4,
  NORMAL = 3,
  LOW = 2,
  IDLE = 1
}
```

### 日志级别

```typescript
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4
}
```

## 下一步

- 浏览具体的 [API 文档](/api/create-http-client)
- 查看 [使用示例](/examples/)
- 阅读 [指南](/guide/) 了解详细用法
