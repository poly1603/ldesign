# @ldesign/http

<div align="center">

![ldesign HTTP](https://img.shields.io/badge/@ldesign-http-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vue 3](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)
![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

**🚀 现代化的 HTTP 请求库，为 TypeScript 和 Vue 3 而生**

_功能强大 • 类型安全 • 开箱即用_

[快速开始](#快速开始) • [文档](./docs) • [示例](./examples) • [API 参考](./docs/api)

</div>

---

## ✨ 特性亮点

🎯 **多适配器架构** - 支持 fetch、axios、alova，自动选择最佳适配器 🔧 **强大拦截器** - 完整的请求/响
应拦截器链，支持异步处理 💾 **智能缓存** - 内置缓存系统，支持内存和本地存储 🔄 **自动重试** - 可配置
的重试机制，指数退避算法 ❌ **请求取消** - 基于 AbortController 的优雅取消机制 ⚡ **并发控制** - 内
置并发限制和请求去重 🎯 **TypeScript 优先** - 完整类型支持，智能提示 🌟 **Vue 3 深度集成** - 专为
Vue 3 设计的 Composition API 🛠️ **高度可配置** - 灵活的配置选项，满足各种需求

## 🚀 快速开始

### 安装

```bash
# 使用 pnpm（推荐）
pnpm add @ldesign/http

# 使用 npm
npm install @ldesign/http

# 使用 yarn
yarn add @ldesign/http
```

### 基础用法

```typescript
import { createHttpClient } from '@ldesign/http'

// 创建客户端
const http = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
})

// 发送请求
const response = await http.get('/users')
console.log(response.data)
```

### Vue 3 集成

```vue
<script setup lang="ts">
import { useRequest } from '@ldesign/http/vue'

interface User {
  id: number
  name: string
  email: string
}

const { data, loading, error } = useRequest<User[]>({
  url: '/api/users',
  method: 'GET',
})
</script>

<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <div v-else>
      <h2>用户列表</h2>
      <ul>
        <li v-for="user in data" :key="user.id">
          {{ user.name }}
        </li>
      </ul>
    </div>
  </div>
</template>
```

## 🎯 核心概念

### HTTP 客户端

```typescript
import { createHttpClient } from '@ldesign/http'

const http = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 支持所有 HTTP 方法
await http.get('/users')
await http.post('/users', userData)
await http.put('/users/1', updateData)
await http.delete('/users/1')
```

### 类型安全

```typescript
interface User {
  id: number
  name: string
  email: string
}

// 类型安全的请求
const response = await http.get<User[]>('/users')
const users: User[] = response.data // 自动类型推断

// 类型安全的 POST 请求
const newUser = await http.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com',
})
```

### 拦截器

```typescript
// 请求拦截器 - 自动添加认证头
http.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器 - 统一处理响应
http.interceptors.response.use(response => {
  return response.data // 直接返回数据
})

// 错误拦截器 - 统一错误处理
http.interceptors.error.use(error => {
  if (error.response?.status === 401) {
    // 处理未授权错误
    window.location.href = '/login'
  }
  return error
})
```

### 缓存策略

```typescript
const http = createHttpClient({
  cache: {
    enabled: true,
    ttl: 300000, // 5 分钟缓存
    storage: 'memory', // 或 'localStorage'
  },
})

// 第一次请求 - 从网络获取
const users1 = await http.get('/users')

// 第二次请求 - 从缓存返回（5分钟内）
const users2 = await http.get('/users') // 瞬间返回
```

### 重试机制

```typescript
const http = createHttpClient({
  retry: {
    retries: 3,
    retryDelay: 1000,
    retryCondition: error => {
      // 只重试网络错误和 5xx 错误
      return error.isNetworkError || error.response?.status >= 500
    },
  },
})
```

## 🌟 Vue 3 集成

### 安装插件

```typescript
import { createHttpClient, HttpPlugin } from '@ldesign/http'
import { createApp } from 'vue'

const app = createApp({})

app.use(HttpPlugin, {
  client: createHttpClient({
    baseURL: 'https://api.example.com',
  }),
})
```

### useRequest Hook

```vue
<script setup lang="ts">
import { useRequest } from '@ldesign/http/vue'

// 基础用法
const { data, loading, error, execute, refresh } = useRequest(
  {
    url: '/api/users',
    method: 'GET',
  },
  {
    immediate: true, // 立即执行
    onSuccess: data => console.log('成功:', data),
    onError: error => console.error('错误:', error),
  }
)

// 手动触发
function handleRefresh() {
  refresh()
}
</script>
```

### useQuery Hook（带缓存）

```vue
<script setup lang="ts">
import { useQuery } from '@ldesign/http/vue'

const { data, loading, error, isStale } = useQuery(
  'users', // 查询键
  { url: '/api/users' },
  {
    staleTime: 300000, // 5分钟内不重新请求
    cacheTime: 600000, // 缓存10分钟
    refetchOnWindowFocus: true, // 窗口聚焦时重新获取
  }
)
</script>
```

### useMutation Hook（变更操作）

```vue
<script setup lang="ts">
import { useMutation } from '@ldesign/http/vue'

const { mutate, loading, error } = useMutation(userData => http.post('/api/users', userData), {
  onSuccess: () => {
    // 刷新用户列表
    queryClient.invalidateQueries('users')
  },
})

function handleSubmit(formData) {
  mutate(formData)
}
</script>
```

### useResource Hook（RESTful API）

```vue
<script setup lang="ts">
import { useResource } from '@ldesign/http/vue'

const userResource = useResource('/api/users')

// 获取列表
const { data: users } = userResource.useList()

// 创建用户
const { mutate: createUser } = userResource.useCreate({
  onSuccess: () => {
    // 自动刷新列表
  },
})

// 更新用户
const { mutate: updateUser } = userResource.useUpdate()

// 删除用户
const { mutate: deleteUser } = userResource.useDelete()
</script>
```

## 🔧 高级功能

### 并发控制

```typescript
const http = createHttpClient({
  concurrency: {
    maxConcurrent: 5, // 最大并发数
    maxQueueSize: 100, // 最大队列大小
  },
})

// 发送多个请求，自动排队处理
const promises = Array.from({ length: 10 }, (_, i) => http.get(`/api/data/${i}`))

const results = await Promise.all(promises)
```

### 请求取消

```typescript
// 使用 AbortController
const controller = new AbortController()

const request = http.get('/api/data', {
  signal: controller.signal,
})

// 取消请求
controller.abort()

// 或者使用内置的取消功能
const { cancel } = useRequest('/api/data')
cancel() // 取消请求
```

### 自定义适配器

```typescript
import { BaseAdapter } from '@ldesign/http'

class CustomAdapter extends BaseAdapter {
  name = 'custom'

  isSupported() {
    return true
  }

  async request(config) {
    // 自定义请求逻辑
    return customFetch(config)
  }
}

// 注册适配器
const http = createHttpClient({
  adapter: new CustomAdapter(),
})
```

## 📚 API 参考

### HttpClient

| 方法                         | 描述        | 类型                       |
| ---------------------------- | ----------- | -------------------------- |
| `get(url, config?)`          | GET 请求    | `Promise<ResponseData<T>>` |
| `post(url, data?, config?)`  | POST 请求   | `Promise<ResponseData<T>>` |
| `put(url, data?, config?)`   | PUT 请求    | `Promise<ResponseData<T>>` |
| `delete(url, config?)`       | DELETE 请求 | `Promise<ResponseData<T>>` |
| `patch(url, data?, config?)` | PATCH 请求  | `Promise<ResponseData<T>>` |
| `request(config)`            | 通用请求    | `Promise<ResponseData<T>>` |

### Vue Hooks

| Hook                                | 描述         | 返回值                                                    |
| ----------------------------------- | ------------ | --------------------------------------------------------- |
| `useRequest(config, options?)`      | 基础请求     | `{ data, loading, error, execute, refresh }`              |
| `useQuery(key, config, options?)`   | 带缓存查询   | `{ data, loading, error, isStale, invalidate }`           |
| `useMutation(mutationFn, options?)` | 变更操作     | `{ mutate, loading, error, reset }`                       |
| `useResource(baseUrl)`              | RESTful 资源 | `{ useList, useDetail, useCreate, useUpdate, useDelete }` |

## 🎨 示例项目

我们提供了丰富的示例来帮助你快速上手：

- **[Vanilla JavaScript 示例](./examples/vanilla)** - 纯 JavaScript 使用示例
- **[Vue 3 示例](./examples/vue3)** - Vue 3 完整应用示例
- **[TypeScript 示例](./examples/typescript)** - TypeScript 最佳实践

## 🤝 贡献指南

我们欢迎所有形式的贡献！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

本项目基于 [MIT 许可证](./LICENSE) 开源。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

<div align="center">

**如果这个项目对你有帮助，请给我们一个 ⭐️**

[GitHub](https://github.com/ldesign/http) • [文档](./docs) •
[问题反馈](https://github.com/ldesign/http/issues)

</div>
