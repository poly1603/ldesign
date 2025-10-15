# 快速开始

本指南将帮助你在几分钟内开始使用 @ldesign/http。

## 安装

使用你喜欢的包管理器安装：

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

## 基础用法

### 创建客户端

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

### 发送请求

```typescript
// GET 请求
const users = await client.get('/users')
console.log(users.data)

// POST 请求
const newUser = await client.post('/users', {
  name: 'John Doe',
  email: 'john@example.com'
})

// PUT 请求
await client.put('/users/1', {
  name: 'Jane Doe'
})

// DELETE 请求
await client.delete('/users/1')
```

### 类型安全

使用 TypeScript 泛型获得完整的类型支持：

```typescript
interface User {
  id: number
  name: string
  email: string
}

// 类型安全的 GET 请求
const response = await client.get<User[]>('/users')
const users: User[] = response.data // 自动类型推断

// 类型安全的 POST 请求
const newUser = await client.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
})
```

## 启用缓存

添加缓存可以显著提升应用性能：

```typescript
const client = createHttpClient({
  baseURL: 'https://api.example.com',
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 缓存 5 分钟
  }
})

// 第一次请求会从服务器获取
const users1 = await client.get('/users')

// 第二次请求会从缓存获取
const users2 = await client.get('/users') // 立即返回，无需等待
```

## 启用重试

自动重试失败的请求：

```typescript
const client = createHttpClient({
  baseURL: 'https://api.example.com',
  retry: {
    enabled: true,
    maxAttempts: 3,
    delay: 1000,
    backoff: 'exponential' // 指数退避
  }
})

// 如果请求失败，会自动重试最多 3 次
const response = await client.get('/users')
```

## 使用拦截器

添加请求和响应拦截器：

```typescript
// 添加认证 token
client.addRequestInterceptor(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 处理响应
client.addResponseInterceptor(
  response => {
    // 成功响应
    return response
  },
  error => {
    // 错误响应
    if (error.response?.status === 401) {
      // 处理未授权
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

## Vue 3 集成

在 Vue 3 应用中使用：

```typescript
// main.ts
import { createApp } from 'vue'
import { createHttpPlugin } from '@ldesign/http'
import App from './App.vue'

const app = createApp(App)

app.use(createHttpPlugin({
  baseURL: 'https://api.example.com',
  cache: { enabled: true },
  retry: { enabled: true }
}))

app.mount('#app')
```

在组件中使用：

```vue
<script setup lang="ts">
import { useGet } from '@ldesign/http/vue'

interface User {
  id: number
  name: string
  email: string
}

const { data: users, loading, error, refetch } = useGet<User[]>('/users')
</script>

<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <ul v-else>
      <li v-for="user in users" :key="user.id">
        {{ user.name }} - {{ user.email }}
      </li>
    </ul>
    <button @click="refetch">刷新</button>
  </div>
</template>
```

## 完整示例

```typescript
import { createHttpClient } from '@ldesign/http'

// 创建配置完整的客户端
const client = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  // 启用缓存
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000,
    strategy: 'lru'
  },
  // 启用重试
  retry: {
    enabled: true,
    maxAttempts: 3,
    delay: 1000,
    backoff: 'exponential'
  },
  // 并发控制
  concurrency: {
    maxConcurrent: 10,
    deduplication: true // 自动去重相同请求
  }
})

// 添加认证拦截器
client.addRequestInterceptor(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 添加错误处理拦截器
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
async function fetchUsers() {
  try {
    const response = await client.get<User[]>('/users')
    console.log('用户列表:', response.data)
  } catch (error) {
    console.error('获取用户失败:', error)
  }
}

async function createUser(userData: CreateUserRequest) {
  try {
    const response = await client.post<User>('/users', userData)
    console.log('创建成功:', response.data)
    return response.data
  } catch (error) {
    console.error('创建失败:', error)
    throw error
  }
}
```

## 下一步

- [HTTP 客户端](/guide/client) - 详细了解客户端配置和方法
- [适配器](/guide/adapters) - 了解如何选择和配置适配器
- [拦截器](/guide/interceptors) - 深入学习拦截器的使用
- [缓存](/guide/cache) - 掌握高级缓存功能
- [Vue 集成](/vue/) - 在 Vue 3 中的最佳实践
