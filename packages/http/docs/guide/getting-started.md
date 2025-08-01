# 快速开始

欢迎使用 @ldesign/http！这是一个现代化的 HTTP 请求库，专为 TypeScript 和 Vue 3 设计。

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

### 创建 HTTP 客户端

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

### 发送请求

```typescript
// GET 请求
const users = await http.get('/users')
console.log(users.data)

// POST 请求
const newUser = await http.post('/users', {
  name: 'John Doe',
  email: 'john@example.com'
})

// PUT 请求
const updatedUser = await http.put('/users/1', {
  name: 'Jane Doe'
})

// DELETE 请求
await http.delete('/users/1')
```

### 类型安全

使用 TypeScript 泛型获得类型安全：

```typescript
interface User {
  id: number
  name: string
  email: string
}

interface CreateUserRequest {
  name: string
  email: string
}

// 类型安全的请求
const response = await http.get<User[]>('/users')
const users: User[] = response.data

const newUser = await http.post<User, CreateUserRequest>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
})
```

## Vue 3 集成

### 安装 Vue 插件

```typescript
import { createHttpClient, HttpPlugin } from '@ldesign/http'
import { createApp } from 'vue'

const app = createApp({})

// 创建 HTTP 客户端
const httpClient = createHttpClient({
  baseURL: 'https://api.example.com'
})

// 安装插件
app.use(HttpPlugin, {
  client: httpClient
})
```

### 使用 Composition API

```vue
<script setup lang="ts">
import { useRequest } from '@ldesign/http/vue'

interface User {
  id: number
  name: string
  email: string
}

const { data, loading, error, refresh } = useRequest<User[]>({
  url: '/users',
  method: 'GET'
}, {
  immediate: true
})
</script>

<template>
  <div>
    <div v-if="loading">
      加载中...
    </div>
    <div v-else-if="error" class="error">
      错误: {{ error.message }}
    </div>
    <div v-else>
      <h2>用户列表</h2>
      <ul>
        <li v-for="user in data" :key="user.id">
          {{ user.name }} - {{ user.email }}
        </li>
      </ul>
    </div>
    <button @click="refresh">
      刷新
    </button>
  </div>
</template>
```

### 使用查询 Hook

```vue
<script setup lang="ts">
import { useQuery } from '@ldesign/http/vue'

const { data, loading, error, refresh } = useQuery<User[]>(
  'users', // 查询键
  { url: '/users', method: 'GET' },
  {
    staleTime: 300000, // 5 分钟内不重新请求
    cacheTime: 600000, // 缓存 10 分钟
  }
)
</script>
```

### 使用变更 Hook

```vue
<script setup lang="ts">
import { useMutation } from '@ldesign/http/vue'
import { ref } from 'vue'

const form = ref({
  name: '',
  email: ''
})

const { mutate, loading, error } = useMutation(
  (data: typeof form.value) => http.post('/users', data),
  {
    onSuccess: (data) => {
      console.log('用户创建成功:', data)
      form.value = { name: '', email: '' }
    },
    onError: (error) => {
      console.error('创建失败:', error)
    }
  }
)

function handleSubmit() {
  mutate(form.value)
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="form.name" placeholder="姓名" required>
    <input v-model="form.email" type="email" placeholder="邮箱" required>
    <button type="submit" :disabled="loading">
      {{ loading ? '提交中...' : '提交' }}
    </button>
  </form>
</template>
```

## 配置选项

### 全局配置

```typescript
const http = createHttpClient({
  // 基础 URL
  baseURL: 'https://api.example.com',

  // 超时时间（毫秒）
  timeout: 10000,

  // 默认请求头
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },

  // 缓存配置
  cache: {
    enabled: true,
    ttl: 300000, // 5 分钟
  },

  // 重试配置
  retry: {
    retries: 3,
    retryDelay: 1000,
    retryCondition: error => error.isNetworkError
  },

  // 并发控制
  concurrency: {
    maxConcurrent: 10,
    maxQueueSize: 100
  }
})
```

### 请求级配置

```typescript
// 覆盖全局配置
const response = await http.get('/users', {
  timeout: 5000,
  headers: {
    Authorization: 'Bearer token'
  },
  cache: {
    enabled: false
  }
})
```

## 下一步

现在你已经了解了基础用法，可以继续学习：

- [HTTP 客户端详解](/guide/http-client) - 深入了解客户端配置
- [适配器系统](/guide/adapters) - 了解不同的 HTTP 适配器
- [拦截器使用](/guide/interceptors) - 学习如何使用拦截器
- [错误处理](/guide/error-handling) - 掌握错误处理最佳实践
- [Vue 集成指南](/guide/vue-plugin) - 深入了解 Vue 3 集成

或者查看更多[示例](/examples/basic)来学习具体的使用场景。
