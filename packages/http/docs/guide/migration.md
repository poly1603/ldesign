# 迁移指南

本指南帮助你从其他 HTTP 库迁移到 `@ldesign/http`。

## 从 Axios 迁移

### 基础用法

**Axios:**

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
})

const response = await api.get('/users')
```

**@ldesign/http:**

```typescript
import { createHttpClient } from '@ldesign/http'

const http = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
})

const response = await http.get('/users')
```

### 拦截器

**Axios:**

```typescript
// 请求拦截器
api.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${token}`
  return config
})

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error)
)
```

**@ldesign/http:**

```typescript
// 请求拦截器
http.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${token}`
  return config
})

// 响应拦截器
http.interceptors.response.use(
  response => response,
  error => {
    throw error
  }
)
```

### 错误处理

**Axios:**

```typescript
try {
  const response = await api.get('/users')
} catch (error) {
  if (error.response) {
    console.error('HTTP Error:', error.response.status)
  } else if (error.request) {
    console.error('Network Error')
  }
}
```

**@ldesign/http:**

```typescript
try {
  const response = await http.get('/users')
} catch (error) {
  if (error.response) {
    console.error('HTTP Error:', error.response.status)
  } else if (error.isNetworkError) {
    console.error('Network Error')
  } else if (error.isTimeoutError) {
    console.error('Timeout Error')
  }
}
```

## 从 Fetch 迁移

### 基础用法

**Fetch:**

```typescript
const response = await fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
})

if (!response.ok) {
  throw new Error('Request failed')
}

const result = await response.json()
```

**@ldesign/http:**

```typescript
const http = createHttpClient({
  baseURL: 'https://api.example.com',
})

const response = await http.post('/users', data)
// 自动处理 JSON 序列化和错误检查
```

### 请求取消

**Fetch:**

```typescript
const controller = new AbortController()

fetch('/users', {
  signal: controller.signal,
})

// 取消请求
controller.abort()
```

**@ldesign/http:**

```typescript
const controller = new AbortController()

http.get('/users', {
  signal: controller.signal,
})

// 取消请求
controller.abort()
```

## 从 Vue 2 + Axios 迁移到 Vue 3 + @ldesign/http

### Vue 2 方式

```vue
<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else>
      <div v-for="user in users" :key="user.id">
        {{ user.name }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      users: [],
      loading: false,
      error: null,
    }
  },
  async mounted() {
    await this.fetchUsers()
  },
  methods: {
    async fetchUsers() {
      try {
        this.loading = true
        this.error = null
        const response = await this.$http.get('/users')
        this.users = response.data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
```

### Vue 3 + @ldesign/http 方式

```vue
<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else>
      <div v-for="user in data" :key="user.id">
        {{ user.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createHttpClient, useQuery } from '@ldesign/http'

const http = createHttpClient({
  baseURL: 'https://api.example.com',
})

const { data, loading, error } = useQuery(http, () => http.get('/users'), { immediate: true })
</script>
```

## 从 SWR 迁移

### SWR 方式

```typescript
import useSWR from 'swr'

const fetcher = url => fetch(url).then(res => res.json())

function Profile() {
  const { data, error, mutate } = useSWR('/api/user', fetcher)

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>

  return (
    <div>
      <h1>{data.name}</h1>
      <button onClick={() => mutate()}>Refresh</button>
    </div>
  )
}
```

### @ldesign/http 方式

```vue
<script setup lang="ts">
import { createHttpClient, useQuery } from '@ldesign/http'

const http = createHttpClient()

const { data, error, loading, refresh } = useQuery(http, () => http.get('/api/user'), {
  immediate: true,
})
</script>

<template>
  <div>
    <div v-if="error">Failed to load</div>
    <div v-else-if="loading">Loading...</div>
    <div v-else>
      <h1>{{ data.name }}</h1>
      <button @click="refresh">Refresh</button>
    </div>
  </div>
</template>
```

## 从 React Query 迁移

### React Query 方式

```typescript
import { useQuery, useMutation } from 'react-query'

function Users() {
  const { data, isLoading, error } = useQuery('users', () =>
    fetch('/api/users').then(res => res.json())
  )

  const mutation = useMutation(
    newUser =>
      fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(newUser),
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users')
      },
    }
  )

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {data && data.map(user => <div key={user.id}>{user.name}</div>)}
    </div>
  )
}
```

### @ldesign/http 方式

```vue
<script setup lang="ts">
import { createHttpClient, useQuery, useMutation } from '@ldesign/http'

const http = createHttpClient()

const { data, loading, error, refresh } = useQuery(http, () => http.get('/api/users'), {
  immediate: true,
})

const { mutate } = useMutation(http, newUser => http.post('/api/users', newUser), {
  onSuccess: () => {
    refresh() // 刷新用户列表
  },
})
</script>

<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else>
      <div v-for="user in data" :key="user.id">
        {{ user.name }}
      </div>
    </div>
  </div>
</template>
```

## 迁移检查清单

### 1. 依赖更新

- [ ] 移除旧的 HTTP 库依赖
- [ ] 安装 @ldesign/http
- [ ] 更新类型定义

### 2. 代码更新

- [ ] 更新导入语句
- [ ] 替换客户端创建代码
- [ ] 更新拦截器配置
- [ ] 更新错误处理逻辑

### 3. Vue 特定

- [ ] 将 Options API 改为 Composition API
- [ ] 使用 useQuery/useMutation 替换手动状态管理
- [ ] 更新模板中的状态引用

### 4. 测试

- [ ] 更新单元测试
- [ ] 更新集成测试
- [ ] 验证错误处理
- [ ] 验证缓存行为

### 5. 性能优化

- [ ] 配置缓存策略
- [ ] 设置并发控制
- [ ] 启用请求去重
- [ ] 配置重试机制

## 常见迁移问题

### 1. 响应数据结构不同

如果原来的库自动提取 `response.data`，而 @ldesign/http 返回完整响应：

```typescript
// 使用响应拦截器统一处理
http.interceptors.response.use(response => {
  // 如果需要自动提取 data 字段
  return response.data
})
```

### 2. 错误处理差异

不同库的错误对象结构可能不同，需要更新错误处理逻辑：

```typescript
// 统一错误处理
http.interceptors.response.use(
  response => response,
  error => {
    // 转换为统一的错误格式
    const normalizedError = {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    }
    throw normalizedError
  }
)
```

### 3. 缓存行为差异

如果原来使用了其他缓存库，需要配置 @ldesign/http 的缓存：

```typescript
const http = createHttpClient({
  cache: {
    enabled: true,
    ttl: 300000, // 5分钟
    storage: 'memory', // 或 'localStorage'
  },
})
```

## 获取帮助

如果在迁移过程中遇到问题：

1. 查看 [完整文档](../README.md)
2. 参考 [示例代码](../examples/README.md)
3. 查看 [常见问题](./faq.md)
4. 提交 [GitHub Issue](https://github.com/ldesign/http/issues)

迁移愉快！🚀
