# 适配器系统

@ldesign/http 采用适配器模式，支持多种 HTTP 客户端库，让你可以根据项目需求选择最合适的底层实现。

## 内置适配器

### Fetch 适配器（默认）

基于浏览器原生 `fetch` API 的适配器，是默认选择。

**优点：**

- 🌐 浏览器原生支持，无需额外依赖
- 🚀 性能优秀，体积小
- 🔄 支持流式响应
- ✅ 完整的 Promise 支持

**使用方式：**

```typescript
import { createHttpClient } from '@ldesign/http'

// 默认使用 fetch 适配器
const http = createHttpClient({
  baseURL: 'https://api.example.com',
})

// 显式指定 fetch 适配器
const http2 = createHttpClient({
  adapter: 'fetch',
  baseURL: 'https://api.example.com',
})
```

### Axios 适配器

基于流行的 axios 库的适配器。

**优点：**

- 📦 功能丰富，生态成熟
- 🔧 配置选项多样
- 📊 内置请求/响应拦截器
- 🌍 Node.js 和浏览器通用

**安装依赖：**

```bash
pnpm add axios
```

**使用方式：**

```typescript
import { createHttpClient } from '@ldesign/http'

const http = createHttpClient({
  adapter: 'axios',
  baseURL: 'https://api.example.com',
})
```

### Alova 适配器

基于新兴的 alova 库的适配器。

**优点：**

- ⚡ 轻量级，性能优秀
- 🎯 专为现代前端设计
- 🔄 内置缓存和状态管理
- 📱 支持多端开发

**安装依赖：**

```bash
pnpm add alova
```

**使用方式：**

```typescript
import { createHttpClient } from '@ldesign/http'

const http = createHttpClient({
  adapter: 'alova',
  baseURL: 'https://api.example.com',
})
```

## 适配器选择

### 自动选择

如果不指定适配器，库会按以下优先级自动选择：

1. **fetch** - 如果环境支持
2. **axios** - 如果已安装
3. **alova** - 如果已安装

```typescript
// 自动选择最佳适配器
const http = createHttpClient({
  baseURL: 'https://api.example.com',
})
```

### 手动指定

你可以明确指定要使用的适配器：

```typescript
// 使用字符串指定
// 使用适配器实例
import { AxiosAdapter } from '@ldesign/http'

const http = createHttpClient({
  adapter: 'axios',
  baseURL: 'https://api.example.com',
})

const http2 = createHttpClient({
  adapter: new AxiosAdapter(),
  baseURL: 'https://api.example.com',
})
```

### 检查适配器可用性

```typescript
import { isAdapterAvailable } from '@ldesign/http'

console.log('Fetch 可用:', isAdapterAvailable('fetch'))
console.log('Axios 可用:', isAdapterAvailable('axios'))
console.log('Alova 可用:', isAdapterAvailable('alova'))
```

## 适配器对比

| 特性           | Fetch         | Axios | Alova      |
| -------------- | ------------- | ----- | ---------- |
| 包大小         | 0KB (原生)    | ~13KB | ~8KB       |
| 浏览器支持     | 现代浏览器    | IE11+ | 现代浏览器 |
| Node.js 支持   | 需要 polyfill | ✅    | ✅         |
| 流式响应       | ✅            | ❌    | ✅         |
| 请求取消       | ✅            | ✅    | ✅         |
| 上传进度       | ❌            | ✅    | ✅         |
| 自动 JSON 解析 | 手动          | ✅    | ✅         |
| 拦截器         | 手动实现      | ✅    | ✅         |

## 自定义适配器

你可以创建自己的适配器来支持其他 HTTP 库：

```typescript
import type { RequestConfig, ResponseData } from '@ldesign/http'
import { BaseAdapter } from '@ldesign/http'

// 注册自定义适配器
import { AdapterFactory } from '@ldesign/http'

class CustomAdapter extends BaseAdapter {
  name = 'custom'

  isSupported(): boolean {
    // 检查是否支持当前环境
    return typeof window !== 'undefined'
  }

  async request<T = any>(config: RequestConfig): Promise<ResponseData<T>> {
    // 处理请求配置
    const processedConfig = this.processConfig(config)

    try {
      // 使用你的 HTTP 库发送请求
      const response = await yourHttpLibrary.request(processedConfig)

      // 转换为标准响应格式
      return this.processResponse(
        response.data,
        response.status,
        response.statusText,
        response.headers,
        processedConfig,
        response
      )
    }
    catch (error) {
      // 处理错误
      throw this.processError(error, processedConfig)
    }
  }
}

AdapterFactory.register('custom', () => new CustomAdapter())

// 使用自定义适配器
const http = createHttpClient({
  adapter: 'custom',
  baseURL: 'https://api.example.com',
})
```

### 适配器接口

自定义适配器需要实现 `HttpAdapter` 接口：

```typescript
interface HttpAdapter {
  /** 适配器名称 */
  name: string

  /** 检查是否支持当前环境 */
  isSupported: () => boolean

  /** 发送 HTTP 请求 */
  request: <T = any>(config: RequestConfig) => Promise<ResponseData<T>>
}
```

### 基础适配器类

继承 `BaseAdapter` 可以获得一些实用方法：

```typescript
abstract class BaseAdapter implements HttpAdapter {
  abstract name: string
  abstract request<T>(config: RequestConfig): Promise<ResponseData<T>>
  abstract isSupported(): boolean

  // 实用方法
  protected processConfig(config: RequestConfig): RequestConfig
  protected processResponse<T>(...args): ResponseData<T>
  protected processError(error: any, config: RequestConfig): HttpError
  protected createTimeoutController(timeout?: number): { signal: AbortSignal, cleanup: () => void }
  protected mergeAbortSignals(signals: AbortSignal[]): AbortSignal
  protected parseHeaders(headers: Headers | Record<string, string>): Record<string, string>
}
```

## 适配器配置

### Fetch 适配器配置

```typescript
const http = createHttpClient({
  adapter: 'fetch',
  // Fetch 特定配置
  credentials: 'include', // 发送 cookies
  mode: 'cors', // CORS 模式
  cache: 'no-cache', // 缓存策略
})
```

### Axios 适配器配置

```typescript
const http = createHttpClient({
  adapter: 'axios',
  // Axios 特定配置
  maxRedirects: 5, // 最大重定向次数
  validateStatus: status => status < 400, // 状态验证
  transformRequest: [data => JSON.stringify(data)], // 请求转换
  transformResponse: [data => JSON.parse(data)], // 响应转换
})
```

### Alova 适配器配置

```typescript
const http = createHttpClient({
  adapter: 'alova',
  // Alova 特定配置
  cacheFor: 300000, // 缓存时间
  staleTime: 60000, // 数据过期时间
  enableCache: true, // 启用缓存
})
```

## 最佳实践

### 1. 根据环境选择适配器

```typescript
// 开发环境使用 axios（调试友好）
// 生产环境使用 fetch（体积小）
const adapter = process.env.NODE_ENV === 'development' ? 'axios' : 'fetch'

const http = createHttpClient({
  adapter,
  baseURL: 'https://api.example.com',
})
```

### 2. 条件加载适配器

```typescript
// 只在需要时加载 axios
let adapter: string

if (needsAdvancedFeatures) {
  await import('axios')
  adapter = 'axios'
}
else {
  adapter = 'fetch'
}

const http = createHttpClient({ adapter })
```

### 3. 适配器降级

```typescript
import { createHttpClient, isAdapterAvailable } from '@ldesign/http'

function createOptimalClient() {
  const adapters = ['fetch', 'axios', 'alova']

  for (const adapter of adapters) {
    if (isAdapterAvailable(adapter)) {
      return createHttpClient({ adapter })
    }
  }

  throw new Error('No available HTTP adapter')
}
```

## 故障排除

### 适配器不可用

```typescript
import { AdapterFactory } from '@ldesign/http'

// 检查可用适配器
const available = AdapterFactory.getAvailable()
console.log('可用适配器:', available)

if (available.length === 0) {
  console.error('没有可用的 HTTP 适配器')
}
```

### 适配器冲突

如果多个适配器都可用，但行为不一致：

```typescript
// 明确指定适配器
const http = createHttpClient({
  adapter: 'fetch', // 强制使用 fetch
  baseURL: 'https://api.example.com',
})
```

### 性能优化

```typescript
// 预创建适配器实例（避免重复创建）
import { FetchAdapter } from '@ldesign/http'

const adapter = new FetchAdapter()

const http1 = createHttpClient({ adapter })
const http2 = createHttpClient({ adapter }) // 复用同一个适配器
```

适配器系统让 @ldesign/http 具有极大的灵活性，你可以根据项目需求选择最合适的底层实现，同时保持 API 的
一致性。
