# 基础用法

本指南将介绍 @ldesign/http 的基本使用方法，帮助你快速上手。

## 创建 HTTP 客户端

首先，你需要创建一个 HTTP 客户端实例：

```typescript
import { createHttpClient } from '@ldesign/http'

const http = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})
```

### 配置选项

| 选项      | 类型                    | 默认值    | 描述             |
| --------- | ----------------------- | --------- | ---------------- |
| `baseURL` | `string`                | -         | 基础 URL         |
| `timeout` | `number`                | `10000`   | 超时时间（毫秒） |
| `headers` | `object`                | `{}`      | 默认请求头       |
| `adapter` | `string \| HttpAdapter` | `'fetch'` | HTTP 适配器      |

## 发送请求

### GET 请求

```typescript
// 简单的 GET 请求
const response = await http.get('/users')
console.log(response.data)

// 带查询参数的 GET 请求
const users = await http.get('/users', {
  params: {
    page: 1,
    limit: 10,
    search: 'john',
  },
})
```

### POST 请求

```typescript
// 创建新用户
const newUser = await http.post('/users', {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
})

// 上传文件
const formData = new FormData()
formData.append('file', file)
formData.append('description', 'Profile picture')

const uploadResponse = await http.post('/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})
```

### PUT 请求

```typescript
// 更新用户信息
const updatedUser = await http.put('/users/1', {
  name: 'Jane Doe',
  email: 'jane@example.com',
})
```

### DELETE 请求

```typescript
// 删除用户
await http.delete('/users/1')

// 批量删除
await http.delete('/users', {
  data: {
    ids: [1, 2, 3, 4, 5],
  },
})
```

### PATCH 请求

```typescript
// 部分更新用户信息
const patchedUser = await http.patch('/users/1', {
  email: 'newemail@example.com',
})
```

## 类型安全

使用 TypeScript 泛型获得类型安全：

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

// 类型安全的 GET 请求
const response = await http.get<User[]>('/users')
const users: User[] = response.data // 自动类型推断

// 类型安全的 POST 请求
const newUser = await http.post<User, CreateUserRequest>('/users', {
  name: 'John Doe',
  email: 'john@example.com',
})
```

## 请求配置

每个请求都可以单独配置：

```typescript
const response = await http.get('/users', {
  timeout: 5000, // 覆盖全局超时设置
  headers: {
    'Authorization': 'Bearer token123',
    'X-Custom-Header': 'value',
  },
  params: {
    include: 'profile,settings',
  },
})
```

## 响应格式

所有请求都返回标准的响应格式：

```typescript
interface ResponseData<T> {
  data: T // 响应数据
  status: number // HTTP 状态码
  statusText: string // 状态文本
  headers: object // 响应头
  config: object // 请求配置
  raw?: any // 原始响应对象
}
```

示例：

```typescript
const response = await http.get('/users/1')

console.log(response.data) // 用户数据
console.log(response.status) // 200
console.log(response.statusText) // "OK"
console.log(response.headers) // 响应头对象
```

## 错误处理

使用 try-catch 处理错误：

```typescript
try {
  const response = await http.get('/users/999')
  console.log(response.data)
}
catch (error) {
  if (error.response) {
    // 服务器返回了错误状态码
    console.log('错误状态:', error.response.status)
    console.log('错误数据:', error.response.data)
  }
  else if (error.isNetworkError) {
    // 网络错误
    console.log('网络连接失败')
  }
  else if (error.isTimeoutError) {
    // 超时错误
    console.log('请求超时')
  }
  else {
    // 其他错误
    console.log('未知错误:', error.message)
  }
}
```

## 并发请求

发送多个并发请求：

```typescript
// 使用 Promise.all
const [users, posts, comments] = await Promise.all([
  http.get('/users'),
  http.get('/posts'),
  http.get('/comments'),
])

// 使用 Promise.allSettled（处理部分失败）
const results = await Promise.allSettled([
  http.get('/users'),
  http.get('/posts'),
  http.get('/comments'),
])

results.forEach((result, index) => {
  if (result.status === 'fulfilled') {
    console.log(`请求 ${index} 成功:`, result.value.data)
  }
  else {
    console.log(`请求 ${index} 失败:`, result.reason.message)
  }
})
```

## 请求取消

使用 AbortController 取消请求：

```typescript
const controller = new AbortController()

// 发送可取消的请求
const requestPromise = http.get('/users', {
  signal: controller.signal,
})

// 5 秒后取消请求
setTimeout(() => {
  controller.abort()
}, 5000)

try {
  const response = await requestPromise
  console.log(response.data)
}
catch (error) {
  if (error.isCancelError) {
    console.log('请求已取消')
  }
}
```

## 实际应用示例

### 用户管理 API

```typescript
class UserService {
  private http = createHttpClient({
    baseURL: 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  async getUsers(page = 1, limit = 10) {
    return this.http.get<User[]>('/users', {
      params: { page, limit },
    })
  }

  async getUserById(id: number) {
    return this.http.get<User>(`/users/${id}`)
  }

  async createUser(userData: CreateUserRequest) {
    return this.http.post<User>('/users', userData)
  }

  async updateUser(id: number, userData: Partial<User>) {
    return this.http.put<User>(`/users/${id}`, userData)
  }

  async deleteUser(id: number) {
    return this.http.delete(`/users/${id}`)
  }
}

// 使用示例
const userService = new UserService()

// 获取用户列表
const users = await userService.getUsers(1, 20)

// 创建新用户
const newUser = await userService.createUser({
  name: 'Alice Smith',
  email: 'alice@example.com',
})
```

### 文件上传

```typescript
async function uploadFile(file: File, onProgress?: (progress: number) => void) {
  const formData = new FormData()
  formData.append('file', file)

  return http.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = (progressEvent.loaded / progressEvent.total) * 100
        onProgress(Math.round(progress))
      }
    },
  })
}

// 使用示例
const fileInput = document.querySelector('input[type="file"]')
const file = fileInput.files[0]

await uploadFile(file, (progress) => {
  console.log(`上传进度: ${progress}%`)
})
```

## 下一步

现在你已经掌握了基础用法，可以继续学习：

- [拦截器](./interceptors) - 学习如何使用拦截器
- [缓存](./caching) - 了解缓存功能
- [错误处理](./error-handling) - 深入了解错误处理
- [Vue 集成](./vue-plugin) - 在 Vue 3 中使用
