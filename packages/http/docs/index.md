---
layout: home

hero:
 name: '@ldesign/http'
 text: '强大的 TypeScript HTTP 客户端'
 tagline: '类型安全 • 多适配器 • 智能重试 • 链路追踪 • Vue 集成
 actions:
  - theme: brand
   text: 快速开始
   link: /guide/quick-start
  - theme: alt
   text: 查看示例
   link: /examples/
  - theme: alt
   text: GitHub
   link: https://github.com/ldesign-lab/ldesign

features:
 - icon: 🚀
  title: 零配置开始
  details: 开箱即用，无需复杂配置。同时支持 Fetch、Axios、Alova 三种适配器，自动选择最佳方案。

 - icon: 🎯
  title: 完整 TypeScript 支持
  details: 全面的类型定义和类型推导，智能代码提示，编译时类型检查，让你的代码更安全。

 - icon: ⚡
  title: 智能重试策略
  details: 根据 HTTP 状态码和错误类型智能决定重试策略，支持指数退避、线性退避等多种策略。

 - icon: 🔍
  title: 请求链路追踪
  details: 完整的 trace 系统，生成 trace ID 和 span ID，轻松追踪请求全链路，快速定位问题。

 - icon: 📡
  title: 网络状态感知
  details: 实时监听网络状态变化，离线时自动暂停请求，在线时自动重试，智能判断网络质量。

 - icon: 🔄
  title: 自动数据转换
  details: 自动转换日期字符串为 Date 对象，大数字转 BigInt，null/undefined 转换，开发更便捷。

 - icon: 💾
  title: 强大的缓存系统
  details: 支持内存缓存和 LocalStorage 缓存，自动去重相同请求，LRU 策略，过期时间控制。

 - icon: 🎪
  title: 乐观更新
  details: 先更新 UI，后发请求，失败自动回滚。提供列表专用的 useOptimisticList，增删改开箱即用。

 - icon: 🔌
  title: 丰富的拦截器
  details: 内置 10+ 种常用拦截器：认证、日志、重试、缓存、超时等，轻松扩展自定义拦截器。

 - icon: 📦
  title: Vue 3 深度集成
  details: 提供 20+ 个 Composables，useGet、usePost、usePolling、useNetworkStatus 等，开发体验极佳。

 - icon: 🌐
  title: GraphQL & WebSocket
  details: 不仅支持 RESTful API，还内置 GraphQL 客户端和 WebSocket 支持，满足各种场景需求。

 - icon: 📊
  title: 性能监控
  details: 内置请求监控、性能统计、DevTools 集成，实时查看请求状态、耗时、错误率等指标。
---

## 快速体验

### 安装

::: code-group
```bash [pnpm]
pnpm add @ldesign/http
```

```bash [npm]
npm install @ldesign/http
```

```bash [yarn]
yarn add @ldesign/http
```
:::

### 基础使用

```typescript
import { createHttpClient } from '@ldesign/http'

// 创建客户端
const client = createHttpClient({
 baseURL: 'https://api.example.com',
})

// 发起请求
const response = await client.get('/users')
console.log(response.data)
```

### Vue 集成

```vue
<script setup lang="ts">
import { useGet, usePost } from '@ldesign/http'

// GET 请求 - 自动执行
const { data: users, loading, error } = useGet('/api/users')

// POST 请求 - 手动触发
const { execute: createUser } = usePost('/api/users', {}, { immediate: false })

async function handleCreate() {
 await createUser({ name: 'John', age: 25 })
}
</script>

<template>
 <div v-if="loading">加载中...</div>
 <div v-else-if="error">错误: {{ error.message }}</div>
 <ul v-else>
  <li v-for="user in users" :key="user.id">{{ user.name }}</li>
 </ul>
 <button @click="handleCreate">添加用户</button>
</template>
```

## 核心特性

### 🎯 智能重试

```typescript
import { createHttpClient, createSmartRetryInterceptor } from '@ldesign/http'

const client = createHttpClient()

// 添加智能重试拦截器
const retryInterceptor = createSmartRetryInterceptor({
 maxRetries: 3,
 checkNetworkStatus: true, // 离线时不重试
})

// 现在所有请求都会智能重试
// - 429 Too Many Requests: 指数退避重试
// - 503 Service Unavailable: 线性退避重试
// - 504 Gateway Timeout: 固定延迟重试
// - 网络错误: 指数退避重试
```

### 🔍 链路追踪

```typescript
import { createHttpClient, createTraceInterceptor, consoleExporter } from '@ldesign/http'

const client = createHttpClient()

// 添加追踪拦截器
const traceInterceptor = createTraceInterceptor({
 exporter: consoleExporter, // 输出到控制台
 propagateTraceId: true, // 在 Header 中传递 trace ID
})

// 每个请求都会生成唯一的 trace ID
// 🔍 Trace: trace-abc123-1634567890
//  ✅ GET /api/users (150ms)
//   Type: http
//   Tags: { http.method: 'GET', http.url: '/api/users', http.status: 200 }
```

### 📡 网络状态感知

```vue
<script setup>
import { useNetworkStatus } from '@ldesign/http'

const {
 isOnline,
 isOffline,
 isSuitableForLargeTransfer,
 isWifi,
 isCellular,
 isMetered
} = useNetworkStatus()
</script>

<template>
 <div v-if="isOffline" class="alert alert-warning">
  ⚠️ 您当前处于离线状态
 </div>
 <div v-if="!isSuitableForLargeTransfer" class="alert alert-info">
  ℹ️ 当前网络状况不佳，建议稍后上传文件
 </div>
 <div v-if="isMetered" class="alert alert-warning">
  📱 当前使用移动数据网络
 </div>
</template>
```

### 🔄 自动数据转换

```typescript
import { createHttpClient, createDataTransformInterceptor } from '@ldesign/http'

const client = createHttpClient()

// 添加数据转换拦截器
const transformInterceptor = createDataTransformInterceptor({
 transformDates: true,   // '2024-01-01T00:00:00Z' → Date 对象
 transformBigInt: true,  // '9007199254740991' → BigInt
 nullToUndefined: true,  // null → undefined
})

// 响应数据自动转换
const response = await client.get('/api/user/123')
console.log(response.data.createdAt) // Date 对象，而不是字符串
console.log(response.data.balance)  // BigInt，而不是字符串
```

### 🎪 乐观更新

```typescript
import { useOptimisticList } from '@ldesign/http'

const todos = ref([])
const { add, update, remove } = useOptimisticList(client, todos)

// 点击添加 - UI 立即显示，失败自动回滚
await add(
 { url: '/api/todos', method: 'POST', data: newTodo },
 newTodo
)

// 点击删除 - UI 立即移除，失败自动恢复
await remove(
 { url: '/api/todos/1', method: 'DELETE' },
 1
)
```

### 📊 轮询请求

```vue
<script setup>
import { usePolling } from '@ldesign/http'

// 每3秒轮询任务状态，直到完成
const { data: task, isPolling, stop } = usePolling(
 { url: '/api/tasks/123' },
 {
  interval: 3000,
  stopWhen: (task) => task.status === 'completed',
  pauseWhenHidden: true, // 页面不可见时暂停
  pauseWhenOffline: true, // 离线时暂停
 }
)
</script>

<template>
 <div>
  <div v-if="task">
   进度: {{ task.progress }}%
   <progress :value="task.progress" max="100" />
  </div>
  <button v-if="isPolling" @click="stop">停止轮询</button>
 </div>
</template>
```

## 为什么选择 @ldesign/http？

### vs Axios

| 特性 | @ldesign/http | Axios |
|------|----------------|---------|
| TypeScript 支持 | ✅ 完整 | ⚠️ 基础 |
| 适配器系统 | ✅ 3 种 | ❌ 1 种 |
| 智能重试 | ✅ 内置 | ❌ 需插件 |
| 链路追踪 | ✅ 内置 | ❌ 无 |
| 网络感知 | ✅ 内置 | ❌ 无 |
| 数据转换 | ✅ 自动 | ❌ 手动 |
| Vue 集成 | ✅ 20+ Hooks | ❌ 无 |
| 包大小 | ~100KB | ~13KB |

### vs Fetch

| 特性 | @ldesign/http | Fetch |
|------|----------------|---------|
| 拦截器 | ✅ 内置 | ❌ 无 |
| 重试 | ✅ 智能 | ❌ 无 |
| 缓存 | ✅ 高级 | ⚠️ 简单 |
| 超时 | ✅ 内置 | ⚠️ 需 AbortController |
| 进度 | ✅ 内置 | ⚠️ 复杂 |
| 错误处理 | ✅ 统一 | ❌ 繁琐 |

## 生态系统

- **[@ldesign/api](/packages/api)** - API 层封装，提供插件化能力
- **[@ldesign/crypto](/packages/crypto)** - 加密工具库
- **[@ldesign/device](/packages/device)** - 设备信息检测
- **[@ldesign/color](/packages/color)** - 颜色处理工具

## 社区

- [GitHub 仓库](https://github.com/ldesign-lab/ldesign)
- [问题反馈](https://github.com/ldesign-lab/ldesign/issues)
- [变更日志](https://github.com/ldesign-lab/ldesign/blob/master/packages/http/CHANGELOG.md)

## 许可证

[MIT License](https://github.com/ldesign-lab/ldesign/blob/master/LICENSE) © 2024 LDesign Lab
