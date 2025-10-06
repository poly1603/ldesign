# @ldesign/http

<div align="center">

![ldesign HTTP](https://img.shields.io/badge/@ldesign-http-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vue 3](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)
![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)
![Test Coverage](https://img.shields.io/badge/Coverage-51.1%25-yellow?style=for-the-badge)

**🚀 现代化、类型安全的 HTTP 客户端库**

_功能强大 • 类型安全 • 开箱即用 • 372+ 测试用例_

[快速开始](#-快速开始) • [完整文档](./docs) • [API 参考](./docs/api) • [示例项目](./examples)

</div>

---

## 🎉 v0.2.0 性能优化版本

本版本进行了全面的性能优化和功能增强：

### 🚀 性能提升
- ⚡ **核心性能提升 20-80%** - 拦截器、缓存、监控等核心模块全面优化
- 💾 **内存占用减少 35%** - 优化数据结构，减少不必要的对象创建
- 🔧 **更好的资源管理** - 自动清理机制，防止内存泄漏
- 📊 **智能采样** - 高负载下自动降低监控开销

### ✨ 新增功能
- 🎯 **请求优先级管理** - 5级优先级系统，智能调度
- 🔄 **连接池化** - 连接复用，减少握手开销
- 📈 **性能监控增强** - 实时性能指标，慢请求检测

详见：
- [性能优化报告](./PERFORMANCE_IMPROVEMENTS.md)
- [功能改进说明](./IMPROVEMENTS.md)
- [优化方案](./OPTIMIZATION.md)

---

## ✨ 特性亮点

🎯 **多适配器架构** - 支持 Fetch、Axios、Alova，自动选择最佳适配器
🔧 **强大拦截器** - 完整的请求/响应拦截器链，支持异步处理
💾 **智能缓存** - 高级缓存系统，支持标签失效、依赖管理、LRU策略
🔄 **自动重试** - 智能重试机制，支持指数退避和自定义策略
🛡️ **错误恢复** - 内置错误恢复策略，自动处理网络异常
⚡ **并发控制** - 内置并发限制、请求去重和队列管理
🎯 **TypeScript 优先** - 完整类型支持，丰富的类型工具
🌟 **Vue 3 深度集成** - 专为 Vue 3 设计的 Composition API
📊 **性能监控** - 内置统计分析和性能监控
🧪 **测试友好** - 372+ 测试用例，51.1% 代码覆盖率

## 🚀 快速开始

### 📦 安装

```bash
# 使用 pnpm（推荐）
pnpm add @ldesign/http

# 使用 npm
npm install @ldesign/http

# 使用 yarn
yarn add @ldesign/http
```

### 🌟 基础用法

```typescript
import { createHttpClient } from '@ldesign/http'

// 创建客户端实例
const client = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  // 启用智能缓存
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5分钟
  },
  // 启用自动重试
  retry: {
    enabled: true,
    maxAttempts: 3,
    backoff: 'exponential',
  },
  // 并发控制和去重
  concurrency: {
    maxConcurrent: 10,
    deduplication: true,
  }
})

// 类型安全的请求
interface User {
  id: number
  name: string
  email: string
}

// GET 请求
const users = await client.get<User[]>('/users')
console.log(users.data)

// POST 请求
const newUser = await client.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
})
```

### 🌟 Vue 3 集成

```typescript
// main.ts
import { createApp } from 'vue'
import { createHttpPlugin } from '@ldesign/http'
import App from './App.vue'

const app = createApp(App)

// 安装 HTTP 插件
app.use(createHttpPlugin({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  cache: { enabled: true },
  retry: { enabled: true },
}))

app.mount('#app')
```

```vue
<!-- 在组件中使用 -->
<template>
  <div>
    <button @click="fetchUsers">获取用户</button>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <ul v-else>
      <li v-for="user in users" :key="user.id">
        {{ user.name }} - {{ user.email }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

const $http = inject('http')
const users = ref<User[]>([])
const loading = ref(false)
const error = ref<Error | null>(null)

const fetchUsers = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await $http.get<User[]>('/users')
    users.value = response.data
  } catch (err) {
    error.value = err as Error
  } finally {
    loading.value = false
  }
}
</script>
```

### 🎨 Vue 组合式函数（新增）

我们新增了一系列简化的组合式函数，让Vue开发更加便捷：

#### 简化的HTTP请求hooks

```typescript
import { useGet, usePost, usePut, useDelete, usePatch } from '@ldesign/http/vue'

// 简单的GET请求
const { data, loading, error, execute } = useGet<User[]>('/api/users')

// POST请求
const { data, loading, error, execute } = usePost<User>('/api/users')
await execute({ name: 'John', email: 'john@example.com' })

// 支持响应式URL和配置
const userId = ref(1)
const { data: user } = useGet(() => `/api/users/${userId.value}`)
```

#### 资源管理hook

```typescript
import { useResource } from '@ldesign/http/vue'

const {
  items,        // 资源列表
  current,      // 当前资源
  loading,      // 加载状态
  list,         // 获取列表
  get,          // 获取单个
  create,       // 创建
  update,       // 更新
  remove        // 删除
} = useResource<User>('/api/users')

// 使用示例
await list()                    // 获取用户列表
await get(1)                   // 获取ID为1的用户
await create({ name: 'John' }) // 创建用户
await update(1, { name: 'Jane' }) // 更新用户
await remove(1)                // 删除用户
```

#### 表单管理hook

```typescript
import { useForm } from '@ldesign/http/vue'

const {
  data,           // 表单数据
  submitting,     // 提交状态
  errors,         // 验证错误
  submit,         // 提交表单
  validate,       // 验证表单
  setValidationRules // 设置验证规则
} = useForm<User>({
  initialData: { name: '', email: '' }
})

// 设置验证规则
setValidationRules({
  name: [{ required: true, message: '姓名不能为空' }],
  email: [
    { required: true, message: '邮箱不能为空' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' }
  ]
})

// 提交表单
const handleSubmit = async () => {
  if (validate()) {
    await submit('/api/users')
  }
}
```

## 🎯 核心功能

### 🌐 HTTP 客户端

```typescript
import { createHttpClient } from '@ldesign/http'

const client = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  },
  // 适配器选择
  adapter: 'fetch', // 'fetch' | 'axios' | 'alova'
})

// 支持所有 HTTP 方法
await client.get('/users')
await client.post('/users', userData)
await client.put('/users/1', updateData)
await client.patch('/users/1', partialData)
await client.delete('/users/1')
await client.head('/users/1')
await client.options('/users')
```

### 🔒 类型安全

```typescript
interface User {
  id: number
  name: string
  email: string
  createdAt: string
}

interface CreateUserRequest {
  name: string
  email: string
}

// 完全类型安全的请求
const response = await client.get<User[]>('/users')
const users: User[] = response.data // 自动类型推断

// 类型安全的 POST 请求
const newUser = await client.post<User, CreateUserRequest>('/users', {
  name: 'John Doe',
  email: 'john@example.com',
})

// 使用类型工具
import { isHttpError, isNetworkError } from '@ldesign/http'

try {
  const result = await client.get<User>('/users/1')
} catch (error) {
  if (isHttpError(error)) {
    console.log('HTTP错误:', error.response?.status)
  } else if (isNetworkError(error)) {
    console.log('网络错误')
  }
}
```

### 🎯 拦截器系统

```typescript
import {
  authInterceptor,
  loggingInterceptor,
  errorHandlingInterceptor
} from '@ldesign/http'

// 内置认证拦截器
client.addRequestInterceptor(authInterceptor({
  tokenKey: 'accessToken',
  headerName: 'Authorization',
  tokenPrefix: 'Bearer'
}))

// 内置日志拦截器
client.addRequestInterceptor(loggingInterceptor({
  level: 'info',
  includeHeaders: true
}))

// 内置错误处理拦截器
client.addResponseInterceptor(errorHandlingInterceptor({
  showUserFriendlyMessage: true,
  autoRetryOn: [500, 502, 503, 504]
}))

// 自定义请求拦截器
client.addRequestInterceptor((config) => {
  // 添加时间戳和请求ID
  config.headers['X-Timestamp'] = Date.now().toString()
  config.headers['X-Request-ID'] = crypto.randomUUID()
  return config
})

// 自定义响应拦截器
client.addResponseInterceptor(
  (response) => {
    // 处理成功响应
    console.log(`请求 ${response.config.url} 成功`)
    return response
  },
  (error) => {
    // 处理错误响应
    if (error.response?.status === 401) {
      // 自动跳转登录
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      // 权限不足提示
      alert('权限不足')
    }
    return Promise.reject(error)
  }
)
```

### 💾 高级缓存系统

```typescript
import { createAdvancedCacheManager } from '@ldesign/http'

// 创建高级缓存管理器
const cacheManager = createAdvancedCacheManager({
  strategy: 'lru', // LRU 策略
  maxSize: 50 * 1024 * 1024, // 50MB
  compression: true, // 启用压缩
  stats: true, // 启用统计
  invalidation: {
    tags: true, // 支持标签失效
    dependencies: true // 支持依赖失效
  }
})

const client = createHttpClient({
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5分钟
    manager: cacheManager
  }
})

// 带标签的缓存
await client.get('/users', {
  cache: {
    tags: ['users', 'user-list'],
    ttl: 10 * 60 * 1000
  }
})

// 带依赖的缓存
await client.get('/user/profile', {
  cache: {
    dependencies: ['user:123'],
    ttl: 5 * 60 * 1000
  }
})

// 按标签失效缓存
await cacheManager.invalidateByTag('users')

// 获取缓存统计
const stats = cacheManager.getStats()
console.log('缓存命中率:', stats.hitRate)
console.log('热门键:', stats.hotKeys)
```

### 🔄 智能重试机制

```typescript
const client = createHttpClient({
  retry: {
    enabled: true,
    maxAttempts: 3,
    delay: 1000,
    backoff: 'exponential', // 指数退避
    // 自定义重试条件
    condition: (error) => {
      // 只重试网络错误和5xx错误
      return error.isNetworkError ||
             (error.response?.status >= 500)
    },
    // 自定义延迟函数
    delayFn: (attempt) => Math.min(1000 * Math.pow(2, attempt), 10000)
  }
})

// 请求级别的重试控制
const response = await client.get('/users', {
  retry: {
    enabled: true,
    maxAttempts: 5,
    delay: 2000
  }
})
```

## 🔧 高级功能

### 📊 并发控制和请求去重

```typescript
import { ConcurrencyManager } from '@ldesign/http'

// 创建并发管理器
const concurrencyManager = new ConcurrencyManager({
  maxConcurrent: 5, // 最大并发数
  maxQueueSize: 100, // 队列大小
  deduplication: true // 启用去重
})

const client = createHttpClient({
  concurrency: {
    maxConcurrent: 5,
    deduplication: true
  }
})

// 同时发起多个相同请求，只会执行一次
const promises = [
  client.get('/users'),
  client.get('/users'), // 会被去重
  client.get('/users'), // 会被去重
]

const results = await Promise.all(promises)
// 所有结果都相同，但只发起了一次实际请求

// 获取并发状态
const status = concurrencyManager.getStatus()
console.log('活跃请求数:', status.activeCount)
console.log('队列中请求数:', status.queuedCount)
console.log('去重统计:', status.deduplication)
```

### 🛡️ 错误处理和恢复

```typescript
import {
  ErrorHandler,
  ErrorAnalyzer,
  builtinRecoveryStrategies
} from '@ldesign/http'

// 添加内置恢复策略
ErrorHandler.addRecoveryStrategy(builtinRecoveryStrategies.networkReconnect)
ErrorHandler.addRecoveryStrategy(builtinRecoveryStrategies.authRefresh)
ErrorHandler.addRecoveryStrategy(builtinRecoveryStrategies.serviceFallback)

// 自定义恢复策略
ErrorHandler.addRecoveryStrategy({
  name: 'custom-recovery',
  priority: 15,
  canHandle: (error) => error.response?.status === 429,
  recover: async (error) => {
    // 等待一段时间后重试
    await new Promise(resolve => setTimeout(resolve, 5000))
    return true
  }
})

try {
  const response = await client.get('/users')
} catch (error) {
  // 尝试错误恢复
  const recovered = await ErrorHandler.tryRecover(error)

  if (!recovered) {
    // 记录错误统计
    ErrorHandler.recordError(error)

    // 获取用户友好的错误消息
    const userMessage = ErrorHandler.getUserFriendlyMessage(error)
    console.error(userMessage)
  }
}

// 错误分析
const errors = ErrorHandler.getErrorHistory()
const analysis = ErrorAnalyzer.analyzeErrorPatterns(errors)
console.log('错误模式:', analysis.patterns)
console.log('改进建议:', analysis.recommendations)
```

### 📁 文件操作

```typescript
// 文件上传
const formData = new FormData()
formData.append('file', file)
formData.append('name', 'avatar')

const response = await client.upload('/upload', formData, {
  onUploadProgress: (progress) => {
    console.log(`上传进度: ${progress.percentage}%`)
    console.log(`已上传: ${progress.loaded} / ${progress.total} 字节`)
  },
  timeout: 30000 // 30秒超时
})

// 文件下载
const response = await client.download('/files/document.pdf', {
  onDownloadProgress: (progress) => {
    console.log(`下载进度: ${progress.percentage}%`)
  }
})

console.log('文件名:', response.filename)
console.log('文件大小:', response.size)
console.log('文件类型:', response.type)

// 自动保存文件
const url = URL.createObjectURL(response.data)
const a = document.createElement('a')
a.href = url
a.download = response.filename
document.body.appendChild(a)
a.click()
document.body.removeChild(a)
URL.revokeObjectURL(url)
```

### 🔧 类型工具

```typescript
import {
  isHttpError,
  isNetworkError,
  isTimeoutError,
  typedKeys,
  safeJsonParse,
  createTypedError
} from '@ldesign/http'

// 类型守卫
if (isHttpError(error)) {
  console.log('HTTP错误:', error.response?.status)
}

if (isNetworkError(error)) {
  console.log('网络错误')
}

if (isTimeoutError(error)) {
  console.log('超时错误')
}

// 类型安全的工具函数
const obj = { a: 1, b: 2, c: 3 }
const keys = typedKeys(obj) // 类型为 ('a' | 'b' | 'c')[]

// 安全的JSON解析
const data = safeJsonParse<User>('{"id":1,"name":"John"}')
if (data) {
  console.log(data.name) // 类型安全
}

// 创建类型化错误
const error = createTypedError('VALIDATION_ERROR', '数据验证失败')
```

### ⚡ 请求取消

```typescript
// 使用 AbortController
const controller = new AbortController()

const request = client.get('/api/data', {
  signal: controller.signal,
})

// 取消请求
controller.abort()

// 批量取消
const controllers = []
for (let i = 0; i < 5; i++) {
  const controller = new AbortController()
  controllers.push(controller)

  client.get(`/api/data/${i}`, {
    signal: controller.signal,
  })
}

// 取消所有请求
controllers.forEach(controller => controller.abort())
```

### 🔌 自定义适配器

```typescript
import { BaseAdapter } from '@ldesign/http'

class CustomAdapter extends BaseAdapter {
  name = 'custom'

  isSupported() {
    return typeof window !== 'undefined' && 'fetch' in window
  }

  async request(config) {
    // 自定义请求逻辑
    const response = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.data,
      signal: config.signal,
    })

    return {
      data: await response.json(),
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      config,
    }
  }
}

// 注册适配器
const client = createHttpClient({
  adapter: new CustomAdapter(),
})
```

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行特定测试文件
npm test -- tests/unit/client.test.ts

# 监听模式运行测试
npm run test:watch

# 运行端到端测试
npm run test:e2e
```

## 📊 性能监控

```typescript
// 获取性能统计
const stats = client.getStats()
console.log('请求总数:', stats.totalRequests)
console.log('成功率:', stats.successRate)
console.log('平均响应时间:', stats.averageResponseTime)
console.log('缓存命中率:', stats.cacheHitRate)

// 获取错误统计
const errorStats = ErrorHandler.getStats()
console.log('错误总数:', errorStats.total)
console.log('错误率:', errorStats.errorRate)
console.log('最常见错误:', errorStats.mostCommon)

// 获取缓存统计
const cacheStats = cacheManager.getStats()
console.log('缓存命中率:', cacheStats.hitRate)
console.log('缓存大小:', cacheStats.size)
console.log('热门键:', cacheStats.hotKeys)
```

## 🔗 生态系统

- **@ldesign/http-vue** - Vue 3 专用插件和组合式函数
- **@ldesign/http-react** - React 专用 Hooks
- **@ldesign/http-mock** - 测试和开发用的 Mock 服务器
- **@ldesign/http-devtools** - 浏览器开发者工具扩展

## 📚 API 参考

### HttpClient 核心方法

| 方法                         | 描述        | 类型                       |
| ---------------------------- | ----------- | -------------------------- |
| `get<T>(url, config?)`       | GET 请求    | `Promise<ResponseData<T>>` |
| `post<T>(url, data?, config?)` | POST 请求   | `Promise<ResponseData<T>>` |
| `put<T>(url, data?, config?)` | PUT 请求    | `Promise<ResponseData<T>>` |
| `delete<T>(url, config?)`    | DELETE 请求 | `Promise<ResponseData<T>>` |
| `patch<T>(url, data?, config?)` | PATCH 请求  | `Promise<ResponseData<T>>` |
| `upload(url, data, config?)` | 文件上传    | `Promise<UploadResponse>` |
| `download(url, config?)`     | 文件下载    | `Promise<DownloadResponse>` |
| `request<T>(config)`         | 通用请求    | `Promise<ResponseData<T>>` |

### 配置接口

```typescript
interface HttpConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  adapter?: 'fetch' | 'axios' | 'alova' | HttpAdapter
  cache?: CacheConfig
  retry?: RetryConfig
  concurrency?: ConcurrencyConfig
  errorRecovery?: ErrorRecoveryConfig
}
```

## 📝 更新日志

### v2.0.0 (最新)

- ✨ **新增请求去重功能** - 自动合并相同请求，避免重复发送
- ✨ **新增高级缓存管理器** - 支持标签失效、依赖管理、LRU策略
- ✨ **新增错误恢复策略系统** - 自动处理网络异常和服务故障
- ✨ **新增错误分析和统计功能** - 智能分析错误模式，提供改进建议
- ✨ **新增丰富的 TypeScript 类型工具** - 类型守卫、工具函数等
- 🚀 **性能优化** - 减少内存占用，提升请求处理速度
- 🐛 **修复多个已知问题** - 提升稳定性和可靠性
- 📚 **完善文档和示例** - 新增220+测试用例，69%代码覆盖率

### v1.5.0

- ✨ 新增文件上传下载功能
- ✨ 新增并发控制机制
- 🚀 优化缓存性能
- 📚 完善 Vue 3 集成

### v1.0.0

- 🎉 首次发布
- 🎯 多适配器支持
- 💾 基础缓存功能
- 🔄 重试机制
- 🎯 TypeScript 支持

查看 [CHANGELOG.md](./CHANGELOG.md) 了解完整的更新历史。

## 🤝 贡献指南

欢迎贡献代码！请查看 [贡献指南](./CONTRIBUTING.md) 了解如何参与项目开发。

### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/ldesign/http.git
cd http

# 安装依赖
pnpm install

# 运行测试
pnpm test

# 构建项目
pnpm build

# 启动文档开发服务器
pnpm docs:dev
```

### 贡献流程

1. **Fork 本仓库** 到你的 GitHub 账户
2. **创建特性分支** (`git checkout -b feature/amazing-feature`)
3. **编写代码和测试** 确保测试通过
4. **提交更改** (`git commit -m 'feat: add amazing feature'`)
5. **推送分支** (`git push origin feature/amazing-feature`)
6. **创建 Pull Request** 详细描述你的更改

### 代码规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 和 Prettier 配置
- 编写单元测试，确保覆盖率
- 更新相关文档

## 📄 许可证

MIT License - 查看 [LICENSE](./LICENSE) 文件了解详情。

## 🔗 相关链接

- [📚 完整文档](https://ldesign.github.io/http)
- [🐙 GitHub 仓库](https://github.com/ldesign/http)
- [🐛 问题反馈](https://github.com/ldesign/http/issues)
- [💬 讨论区](https://github.com/ldesign/http/discussions)
- [📦 NPM 包](https://www.npmjs.com/package/@ldesign/http)

---

<div align="center">
  <p>如果这个项目对你有帮助，请给它一个 ⭐️</p>
  <p>Made with ❤️ by the LDesign team</p>
</div>
