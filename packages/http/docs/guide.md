# 使用指南

## 快速开始

### 安装

```bash
# 使用 pnpm（推荐）
pnpm add @ldesign/http

# 使用 npm
npm install @ldesign/http

# 使用 yarn
yarn add @ldesign/http
```

### 基础使用

```typescript
import { createHttpClient } from '@ldesign/http'

// 创建客户端实例
const client = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000
})

// 发送请求
const response = await client.get('/users')
console.log(response.data)
```

## 配置客户端

### 基础配置

```typescript
const client = createHttpClient({
  // 基础 URL
  baseURL: 'https://api.example.com',
  
  // 请求超时时间
  timeout: 10000,
  
  // 默认请求头
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // 默认查询参数
  params: {
    version: 'v1'
  }
})
```

### 启用缓存

```typescript
const client = createHttpClient({
  baseURL: 'https://api.example.com',
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5分钟
    maxSize: 100,       // 最大缓存100个条目
    tags: ['api']       // 缓存标签
  }
})
```

### 启用重试

```typescript
const client = createHttpClient({
  baseURL: 'https://api.example.com',
  retry: {
    enabled: true,
    maxAttempts: 3,
    delay: 1000,
    backoff: 'exponential',
    shouldRetry: (error, attempt) => {
      // 只重试网络错误和5xx错误
      return error.type === 'network' || 
             (error.status >= 500 && error.status < 600)
    }
  }
})
```

### 并发控制

```typescript
const client = createHttpClient({
  baseURL: 'https://api.example.com',
  concurrency: {
    maxConcurrent: 10,    // 最大并发数
    deduplication: true,  // 启用请求去重
    priority: true        // 启用优先级队列
  }
})
```

## 发送请求

### GET 请求

```typescript
// 基础 GET 请求
const users = await client.get<User[]>('/users')

// 带查询参数
const filteredUsers = await client.get<User[]>('/users', {
  params: {
    status: 'active',
    page: 1,
    limit: 10
  }
})

// 带自定义配置
const users = await client.get<User[]>('/users', {
  timeout: 5000,
  cache: { ttl: 60000 },
  headers: { 'X-Custom': 'value' }
})
```

### POST 请求

```typescript
// 创建用户
const newUser = await client.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
})

// 发送 FormData
const formData = new FormData()
formData.append('name', 'John')
formData.append('avatar', file)

const result = await client.post('/users', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
```

### PUT/PATCH 请求

```typescript
// 更新用户（PUT - 完整更新）
const updatedUser = await client.put<User>(`/users/${userId}`, {
  name: 'Jane Doe',
  email: 'jane@example.com',
  age: 25
})

// 部分更新用户（PATCH）
const patchedUser = await client.patch<User>(`/users/${userId}`, {
  age: 26
})
```

### DELETE 请求

```typescript
// 删除用户
await client.delete(`/users/${userId}`)

// 批量删除
await client.delete('/users', {
  data: {
    ids: [1, 2, 3, 4, 5]
  }
})
```

## 文件上传下载

### 文件上传

```typescript
// 基础文件上传
const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
const file = fileInput.files[0]

const result = await client.upload('/upload', file, {
  onProgress: (progress) => {
    console.log(`上传进度: ${progress.percentage}%`)
    console.log(`已上传: ${progress.loaded} / ${progress.total} 字节`)
  }
})

// 带元数据的上传
const result = await client.upload('/upload', file, {
  metadata: {
    category: 'avatar',
    userId: 123
  },
  onProgress: (progress) => {
    updateProgressBar(progress.percentage)
  }
})
```

### 文件下载

```typescript
// 基础文件下载
const result = await client.download('/files/document.pdf')

// 指定文件名和进度回调
const result = await client.download('/files/document.pdf', {
  filename: 'my-document.pdf',
  onProgress: (progress) => {
    console.log(`下载进度: ${progress.percentage}%`)
  }
})

// 下载到指定位置（Node.js）
const result = await client.download('/files/data.csv', {
  savePath: './downloads/data.csv'
})
```

## 拦截器

### 请求拦截器

```typescript
// 添加认证头
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 请求日志
client.interceptors.request.use(
  (config) => {
    console.log(`发送请求: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  }
)
```

### 响应拦截器

```typescript
// 统一错误处理
client.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.status === 401) {
      // 未授权，跳转到登录页
      window.location.href = '/login'
    } else if (error.status === 403) {
      // 权限不足
      showErrorMessage('权限不足')
    } else if (error.status >= 500) {
      // 服务器错误
      showErrorMessage('服务器错误，请稍后重试')
    }
    return Promise.reject(error)
  }
)

// 响应数据转换
client.interceptors.response.use(
  (response) => {
    // 统一处理响应格式
    if (response.data && response.data.code === 0) {
      return {
        ...response,
        data: response.data.data
      }
    }
    return response
  }
)
```

## 错误处理

### 基础错误处理

```typescript
try {
  const users = await client.get<User[]>('/users')
  console.log(users.data)
} catch (error) {
  if (error.type === 'network') {
    console.error('网络错误:', error.message)
  } else if (error.type === 'timeout') {
    console.error('请求超时')
  } else if (error.type === 'http') {
    console.error(`HTTP错误 ${error.status}: ${error.message}`)
  }
}
```

### 全局错误处理

```typescript
// 设置全局错误处理器
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // 记录错误日志
    console.error('请求失败:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.status,
      message: error.message
    })
    
    // 显示用户友好的错误信息
    const userMessage = getUserFriendlyErrorMessage(error)
    showNotification(userMessage, 'error')
    
    return Promise.reject(error)
  }
)

function getUserFriendlyErrorMessage(error: HttpError): string {
  switch (error.type) {
    case 'network':
      return '网络连接失败，请检查网络设置'
    case 'timeout':
      return '请求超时，请稍后重试'
    case 'http':
      if (error.status === 404) {
        return '请求的资源不存在'
      } else if (error.status >= 500) {
        return '服务器错误，请稍后重试'
      }
      return `请求失败 (${error.status})`
    default:
      return '未知错误，请稍后重试'
  }
}
```

## 缓存管理

### 基础缓存

```typescript
// 启用缓存的请求
const users = await client.get('/users', {
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000 // 5分钟
  }
})
```

### 缓存标签

```typescript
// 使用缓存标签
await client.get('/users', {
  cache: {
    enabled: true,
    tags: ['users', 'list']
  }
})

// 清除特定标签的缓存
client.cache.clearByTags(['users'])
```

### 手动缓存管理

```typescript
// 手动设置缓存
await client.cache.set('users:list', userData, 300000)

// 获取缓存
const cached = await client.cache.get('users:list')

// 删除缓存
await client.cache.delete('users:list')

// 清空所有缓存
await client.cache.clear()
```

## 性能优化

### 请求去重

```typescript
// 启用请求去重
const client = createHttpClient({
  concurrency: {
    deduplication: true
  }
})

// 同时发送相同请求，只会执行一次
const [result1, result2] = await Promise.all([
  client.get('/users'),
  client.get('/users') // 这个请求会被去重
])
```

### 优先级队列

```typescript
// 高优先级请求
const criticalData = await client.get('/critical-data', {
  priority: 'high'
})

// 低优先级请求
const backgroundData = await client.get('/background-data', {
  priority: 'low'
})
```

### 并发控制

```typescript
// 限制并发数
const client = createHttpClient({
  concurrency: {
    maxConcurrent: 5 // 最多同时5个请求
  }
})
```
