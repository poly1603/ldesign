# 基础示例

本页面提供了 @ldesign/http 的基础使用示例，帮助你快速上手。

## 创建客户端

### 简单客户端

```typescript
import { createHttpClient } from '@ldesign/http'

const http = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com',
})
```

### 完整配置

```typescript
import { createHttpClient } from '@ldesign/http'

const http = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  cache: {
    enabled: true,
    ttl: 300000, // 5 分钟缓存
  },
  retry: {
    retries: 3,
    retryDelay: 1000,
  },
})
```

## 基础请求

### GET 请求

```typescript
// 简单 GET 请求
const response = await http.get('/posts')
console.log(response.data)

// 带参数的 GET 请求
const posts = await http.get('/posts', {
  params: {
    userId: 1,
    _limit: 10,
  },
})

// 类型安全的 GET 请求
interface Post {
  id: number
  title: string
  body: string
  userId: number
}

const typedResponse = await http.get<Post[]>('/posts')
const posts: Post[] = typedResponse.data
```

### POST 请求

```typescript
// 创建新文章
const newPost = await http.post('/posts', {
  title: 'My New Post',
  body: 'This is the content of my post.',
  userId: 1,
})

console.log('Created post:', newPost.data)

// 类型安全的 POST 请求
interface CreatePostRequest {
  title: string
  body: string
  userId: number
}

interface Post {
  id: number
  title: string
  body: string
  userId: number
}

const createResponse = await http.post<Post, CreatePostRequest>('/posts', {
  title: 'TypeScript Post',
  body: 'This post was created with TypeScript.',
  userId: 1,
})
```

### PUT 请求

```typescript
// 更新文章
const updatedPost = await http.put('/posts/1', {
  id: 1,
  title: 'Updated Title',
  body: 'Updated content.',
  userId: 1,
})

console.log('Updated post:', updatedPost.data)
```

### DELETE 请求

```typescript
// 删除文章
await http.delete('/posts/1')
console.log('Post deleted')

// 批量删除
await http.delete('/posts', {
  data: {
    ids: [1, 2, 3, 4, 5],
  },
})
```

## 错误处理

### 基础错误处理

```typescript
try {
  const response = await http.get('/posts/999')
  console.log(response.data)
} catch (error) {
  console.error('Request failed:', error.message)

  if (error.response) {
    // 服务器返回了错误状态码
    console.log('Status:', error.response.status)
    console.log('Data:', error.response.data)
  } else if (error.isNetworkError) {
    // 网络错误
    console.log('Network error occurred')
  } else if (error.isTimeoutError) {
    // 超时错误
    console.log('Request timed out')
  }
}
```

### 详细错误处理

```typescript
async function handleRequest() {
  try {
    const response = await http.get('/api/data')
    return response.data
  } catch (error) {
    // 根据错误类型进行不同处理
    if (error.response) {
      switch (error.response.status) {
        case 400:
          throw new Error('请求参数错误')
        case 401:
          // 重定向到登录页
          window.location.href = '/login'
          break
        case 403:
          throw new Error('没有权限访问')
        case 404:
          throw new Error('资源不存在')
        case 500:
          throw new Error('服务器内部错误')
        default:
          throw new Error(`请求失败: ${error.response.status}`)
      }
    } else if (error.isNetworkError) {
      throw new Error('网络连接失败，请检查网络设置')
    } else if (error.isTimeoutError) {
      throw new Error('请求超时，请稍后重试')
    } else if (error.isCancelError) {
      console.log('请求已取消')
    } else {
      throw new Error('未知错误')
    }
  }
}
```

## 拦截器

### 请求拦截器

```typescript
// 添加认证头
http.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 添加请求 ID
http.interceptors.request.use(config => {
  config.headers['X-Request-ID'] = generateRequestId()
  return config
})

// 记录请求日志
http.interceptors.request.use(config => {
  console.log(`发送请求: ${config.method?.toUpperCase()} ${config.url}`)
  return config
})
```

### 响应拦截器

```typescript
// 统一处理响应数据
http.interceptors.response.use(response => {
  // 如果响应包含 code 字段，检查业务状态码
  if (response.data.code && response.data.code !== 200) {
    throw new Error(response.data.message || '业务错误')
  }

  // 返回实际数据
  return response.data.data || response.data
})

// 记录响应日志
http.interceptors.response.use(response => {
  console.log(`收到响应: ${response.status} ${response.config.url}`)
  return response
})
```

### 错误拦截器

```typescript
// 全局错误处理
http.interceptors.error.use(error => {
  if (error.response?.status === 401) {
    // 清除本地存储的认证信息
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    // 重定向到登录页
    window.location.href = '/login'
  } else if (error.response?.status >= 500) {
    // 显示服务器错误提示
    showNotification('服务器错误，请稍后重试', 'error')
  }

  return error
})
```

## 并发请求

### Promise.all

```typescript
// 并发获取多个资源
async function loadDashboardData() {
  try {
    const [users, posts, comments] = await Promise.all([
      http.get('/users'),
      http.get('/posts'),
      http.get('/comments'),
    ])

    return {
      users: users.data,
      posts: posts.data,
      comments: comments.data,
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
    throw error
  }
}
```

### Promise.allSettled

```typescript
// 并发请求，处理部分失败
async function loadOptionalData() {
  const requests = [http.get('/users'), http.get('/posts'), http.get('/comments')]

  const results = await Promise.allSettled(requests)

  const data = {}

  results.forEach((result, index) => {
    const keys = ['users', 'posts', 'comments']

    if (result.status === 'fulfilled') {
      data[keys[index]] = result.value.data
    } else {
      console.warn(`Failed to load ${keys[index]}:`, result.reason)
      data[keys[index]] = []
    }
  })

  return data
}
```

## 请求取消

### 使用 AbortController

```typescript
// 创建可取消的请求
const controller = new AbortController()

const requestPromise = http.get('/api/data', {
  signal: controller.signal,
})

// 5 秒后取消请求
setTimeout(() => {
  controller.abort()
}, 5000)

try {
  const response = await requestPromise
  console.log(response.data)
} catch (error) {
  if (error.isCancelError) {
    console.log('请求已取消')
  } else {
    console.error('请求失败:', error)
  }
}
```

### 自动取消

```typescript
class DataService {
  private currentRequest: AbortController | null = null

  async searchUsers(query: string) {
    // 取消之前的请求
    if (this.currentRequest) {
      this.currentRequest.abort()
    }

    // 创建新的请求
    this.currentRequest = new AbortController()

    try {
      const response = await http.get('/users/search', {
        params: { q: query },
        signal: this.currentRequest.signal,
      })

      this.currentRequest = null
      return response.data
    } catch (error) {
      if (!error.isCancelError) {
        this.currentRequest = null
        throw error
      }
    }
  }
}
```

## 文件上传

### 单文件上传

```typescript
async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('description', 'Uploaded file')

  try {
    const response = await http.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    console.log('Upload successful:', response.data)
    return response.data
  } catch (error) {
    console.error('Upload failed:', error)
    throw error
  }
}
```

### 多文件上传

```typescript
async function uploadMultipleFiles(files: FileList) {
  const formData = new FormData()

  Array.from(files).forEach((file, index) => {
    formData.append(`files[${index}]`, file)
  })

  try {
    const response = await http.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  } catch (error) {
    console.error('Multiple upload failed:', error)
    throw error
  }
}
```

## 实用工具函数

### API 服务类

```typescript
class ApiService {
  constructor(private http: HttpClient) {}

  // 用户相关 API
  async getUsers(page = 1, limit = 10) {
    return this.http.get('/users', {
      params: { page, limit },
    })
  }

  async getUserById(id: number) {
    return this.http.get(`/users/${id}`)
  }

  async createUser(userData: any) {
    return this.http.post('/users', userData)
  }

  async updateUser(id: number, userData: any) {
    return this.http.put(`/users/${id}`, userData)
  }

  async deleteUser(id: number) {
    return this.http.delete(`/users/${id}`)
  }

  // 文章相关 API
  async getPosts(userId?: number) {
    return this.http.get('/posts', {
      params: userId ? { userId } : {},
    })
  }

  async getPostById(id: number) {
    return this.http.get(`/posts/${id}`)
  }

  async createPost(postData: any) {
    return this.http.post('/posts', postData)
  }
}

// 使用示例
const api = new ApiService(http)

// 获取用户列表
const users = await api.getUsers(1, 20)

// 创建新用户
const newUser = await api.createUser({
  name: 'John Doe',
  email: 'john@example.com',
})
```

这些基础示例涵盖了 @ldesign/http 的主要功能，你可以根据实际需求进行调整和扩展。
