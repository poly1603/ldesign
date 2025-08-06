# 最佳实践

本指南提供了使用 `@ldesign/http` 的最佳实践和推荐模式。

## 🏗️ 项目结构

### 1. 创建 HTTP 服务层

建议创建一个专门的服务层来管理 HTTP 请求：

```typescript
// services/http.ts
import { createHttpClient } from '@ldesign/http'

export const http = createHttpClient({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 添加全局拦截器
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 处理认证失败
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    throw error
  }
)
```

### 2. 创建 API 服务

为不同的业务模块创建专门的 API 服务：

```typescript
// services/user.ts
import { http } from './http'

export interface User {
  id: number
  name: string
  email: string
}

export const userService = {
  async getUsers(): Promise<User[]> {
    const response = await http.get<User[]>('/users')
    return response.data
  },

  async getUser(id: number): Promise<User> {
    const response = await http.get<User>(`/users/${id}`)
    return response.data
  },

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const response = await http.post<User>('/users', user)
    return response.data
  },

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    const response = await http.put<User>(`/users/${id}`, user)
    return response.data
  },

  async deleteUser(id: number): Promise<void> {
    await http.delete(`/users/${id}`)
  }
}
```

## 🎯 类型安全

### 1. 定义接口类型

始终为 API 响应定义 TypeScript 接口：

```typescript
// types/api.ts
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  createdAt: string
  updatedAt: string
}
```

### 2. 使用泛型

充分利用 TypeScript 泛型获得类型安全：

```typescript
// 正确的做法
const response = await http.get<ApiResponse<User[]>>('/users')
// response.data 的类型是 ApiResponse<User[]>

// 避免使用 any
const response = await http.get('/users') as any // ❌ 不推荐
```

## 🔧 拦截器使用

### 1. 请求拦截器

```typescript
// 认证拦截器
http.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 请求 ID 拦截器
http.interceptors.request.use((config) => {
  config.headers['X-Request-ID'] = generateRequestId()
  return config
})

// 语言设置拦截器
http.interceptors.request.use((config) => {
  config.headers['Accept-Language'] = getCurrentLanguage()
  return config
})
```

### 2. 响应拦截器

```typescript
// 数据提取拦截器
http.interceptors.response.use((response) => {
  // 如果 API 总是返回 { data: T, message: string } 格式
  // 可以自动提取 data 字段
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return {
      ...response,
      data: response.data.data
    }
  }
  return response
})

// 错误处理拦截器
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // 统一错误处理
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          handleAuthError()
          break
        case 403:
          handlePermissionError()
          break
        case 500:
          handleServerError(data.message)
          break
        default:
          handleGenericError(data.message || error.message)
      }
    } else if (error.isNetworkError) {
      handleNetworkError()
    } else if (error.isTimeoutError) {
      handleTimeoutError()
    }
    
    throw error
  }
)
```

## 💾 缓存策略

### 1. 合理使用缓存

```typescript
// 为不经常变化的数据启用缓存
const staticDataHttp = createHttpClient({
  baseURL: '/api',
  cache: {
    enabled: true,
    ttl: 600000 // 10分钟
  }
})

// 为实时数据禁用缓存
const realtimeHttp = createHttpClient({
  baseURL: '/api',
  cache: {
    enabled: false
  }
})
```

### 2. 缓存键策略

```typescript
const http = createHttpClient({
  cache: {
    enabled: true,
    keyGenerator: (config) => {
      // 自定义缓存键生成
      const { method, url, params, data } = config
      const key = `${method}:${url}`
      
      if (params) {
        const sortedParams = Object.keys(params)
          .sort()
          .map(key => `${key}=${params[key]}`)
          .join('&')
        return `${key}?${sortedParams}`
      }
      
      return key
    }
  }
})
```

## 🔄 错误处理

### 1. 分层错误处理

```typescript
// 全局错误处理（拦截器层）
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // 记录错误日志
    console.error('HTTP Error:', error)
    
    // 显示全局错误提示
    if (error.isNetworkError) {
      showNotification('网络连接失败，请检查网络设置', 'error')
    }
    
    throw error
  }
)

// 业务层错误处理
export async function getUserWithErrorHandling(id: number): Promise<User | null> {
  try {
    return await userService.getUser(id)
  } catch (error) {
    // 业务特定的错误处理
    if (error.response?.status === 404) {
      console.warn(`用户 ${id} 不存在`)
      return null
    }
    throw error // 重新抛出其他错误
  }
}

// 组件层错误处理
const { data, error } = useQuery(
  http,
  () => getUserWithErrorHandling(userId.value),
  {
    onError: (error) => {
      // 组件特定的错误处理
      showErrorMessage(`获取用户信息失败: ${error.message}`)
    }
  }
)
```

### 2. 重试策略

```typescript
const http = createHttpClient({
  retry: {
    retries: 3,
    retryDelay: (retryCount) => Math.pow(2, retryCount) * 1000, // 指数退避
    retryCondition: (error) => {
      // 只重试网络错误和 5xx 错误
      return error.isNetworkError || 
             (error.response?.status >= 500 && error.response?.status < 600)
    }
  }
})
```

## 🌟 Vue 3 最佳实践

### 1. 组合式函数

创建可复用的组合式函数：

```typescript
// composables/useUsers.ts
export function useUsers() {
  const { data: users, loading, error, refresh } = useQuery(
    http,
    () => userService.getUsers(),
    { immediate: true }
  )

  const { mutate: createUser, loading: creating } = useMutation(
    http,
    (userData: Omit<User, 'id'>) => userService.createUser(userData),
    {
      onSuccess: () => {
        refresh() // 刷新用户列表
        showNotification('用户创建成功', 'success')
      }
    }
  )

  return {
    users,
    loading,
    error,
    refresh,
    createUser,
    creating
  }
}
```

### 2. 条件请求

```typescript
const userId = ref<number | null>(null)

const { data: user } = useQuery(
  http,
  () => userService.getUser(userId.value!),
  {
    immediate: false,
    enabled: computed(() => userId.value !== null)
  }
)

// 当 userId 变化时自动重新请求
watch(userId, (newId) => {
  if (newId) {
    // 请求会自动触发，因为 enabled 变为 true
  }
})
```

## 🚀 性能优化

### 1. 请求去重

```typescript
const http = createHttpClient({
  concurrency: {
    maxConcurrent: 6, // 限制并发数
    deduplication: true // 启用请求去重
  }
})
```

### 2. 预加载

```typescript
// 预加载关键数据
export function preloadCriticalData() {
  // 预加载用户信息
  userService.getUsers()
  
  // 预加载配置信息
  configService.getConfig()
}

// 在应用启动时调用
preloadCriticalData()
```

### 3. 懒加载

```typescript
// 只在需要时加载数据
const { data: details, execute: loadDetails } = useRequest(
  http,
  () => userService.getUserDetails(userId.value),
  { immediate: false }
)

function showDetails() {
  if (!details.value) {
    loadDetails()
  }
}
```

## 🔒 安全考虑

### 1. 敏感信息处理

```typescript
// 避免在 URL 中传递敏感信息
// ❌ 不安全
await http.get(`/users?token=${sensitiveToken}`)

// ✅ 安全
await http.get('/users', {
  headers: {
    Authorization: `Bearer ${sensitiveToken}`
  }
})
```

### 2. CSRF 保护

```typescript
// 添加 CSRF 令牌
http.interceptors.request.use((config) => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken
  }
  return config
})
```

## 📊 监控和调试

### 1. 请求日志

```typescript
if (import.meta.env.DEV) {
  http.interceptors.request.use((config) => {
    console.log('🚀 Request:', config)
    return config
  })

  http.interceptors.response.use(
    (response) => {
      console.log('✅ Response:', response)
      return response
    },
    (error) => {
      console.error('❌ Error:', error)
      throw error
    }
  )
}
```

### 2. 性能监控

```typescript
http.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() }
  return config
})

http.interceptors.response.use((response) => {
  const duration = Date.now() - response.config.metadata.startTime
  console.log(`Request to ${response.config.url} took ${duration}ms`)
  return response
})
```

遵循这些最佳实践，可以帮助你构建更加健壮、可维护和高性能的应用程序。
