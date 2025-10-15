# 介绍

@ldesign/http 是一个现代化、功能强大的 HTTP 客户端库，专为 TypeScript 和 Vue 3 应用设计。

## 为什么选择 @ldesign/http？

### 🎯 功能全面

- **多适配器架构** - 支持 Fetch、Axios、Alova 三种主流适配器
- **智能缓存系统** - 支持标签失效、依赖管理、LRU 策略
- **自动重试机制** - 智能重试，支持指数退避和自定义策略
- **并发控制** - 请求去重、队列管理、并发限制
- **完整的拦截器** - 请求/响应/错误拦截器链
- **文件操作** - 上传/下载进度、分片上传、断点续传
- **错误处理** - 自动恢复策略、错误分析
- **性能监控** - 实时统计、慢请求检测

### 🌟 Vue 3 深度集成

- **丰富的 Composables** - useGet、usePost、useQuery、useMutation 等
- **资源管理** - useResource 提供完整的 CRUD 操作
- **表单处理** - useForm 简化表单提交和验证
- **高级功能** - 轮询、乐观更新、网络状态监听

### 🎯 TypeScript 优先

- **完整的类型支持** - 所有 API 都有完整的类型定义
- **类型推断** - 自动推断请求和响应类型
- **类型工具** - 丰富的类型工具函数和类型守卫

### ⚡ 性能优越

- **核心性能提升 20-80%** - 优化的拦截器、缓存、监控
- **内存占用减少 35%** - 优化的数据结构
- **智能采样** - 高负载下自动降低监控开销
- **连接池化** - 连接复用，减少握手开销

## 核心概念

### HTTP 客户端

HTTP 客户端是库的核心，负责发送请求、处理响应：

```typescript
import { createHttpClient } from '@ldesign/http'

const client = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000
})
```

### 适配器

适配器是实际执行 HTTP 请求的模块，支持多种实现：

- **FetchAdapter** - 基于浏览器原生 Fetch API
- **AxiosAdapter** - 基于 Axios 库
- **AlovaAdapter** - 基于 Alova 库

### 拦截器

拦截器允许你在请求发送前和响应返回后执行自定义逻辑：

```typescript
// 请求拦截器
client.addRequestInterceptor(config => {
  config.headers.Authorization = `Bearer ${token}`
  return config
})

// 响应拦截器
client.addResponseInterceptor(response => {
  return response.data
})
```

### 缓存

智能缓存系统可以显著提升应用性能：

```typescript
const client = createHttpClient({
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5分钟
    strategy: 'lru'
  }
})
```

## 下一步

- [快速开始](/guide/getting-started) - 开始使用 @ldesign/http
- [HTTP 客户端](/guide/client) - 了解客户端的详细用法
- [Vue 集成](/vue/) - 在 Vue 3 中使用
