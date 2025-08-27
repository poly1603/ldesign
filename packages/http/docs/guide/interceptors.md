# 拦截器

拦截器是 @ldesign/http 的核心功能之一，允许你在请求发送前和响应返回后执行自定义逻辑。

## 概述

拦截器分为三种类型：

- **请求拦截器** - 在请求发送前执行
- **响应拦截器** - 在响应返回后执行  
- **错误拦截器** - 在请求出错时执行

## 请求拦截器

请求拦截器允许你在请求发送前修改请求配置。

### 基础用法

```typescript
import { createHttpClient } from '@ldesign/http'

const http = createHttpClient({
  baseURL: 'https://api.example.com'
})

// 添加请求拦截器
http.interceptors.request.use((config) => {
  // 添加认证头
  config.headers.Authorization = `Bearer ${getToken()}`
  
  // 添加请求时间戳
  config.headers['X-Request-Time'] = Date.now().toString()
  
  return config
})
```

### 异步请求拦截器

```typescript
// 异步获取token
http.interceptors.request.use(async (config) => {
  const token = await getTokenAsync()
  config.headers.Authorization = `Bearer ${token}`
  return config
})
```

### 条件拦截

```typescript
http.interceptors.request.use((config) => {
  // 只对特定路径添加认证
  if (config.url?.startsWith('/api/auth/')) {
    config.headers.Authorization = `Bearer ${getToken()}`
  }
  return config
})
```

## 响应拦截器

响应拦截器允许你在响应返回后处理响应数据。

### 基础用法

```typescript
// 添加响应拦截器
http.interceptors.response.use((response) => {
  // 记录响应时间
  console.log(`Request to ${response.config.url} took ${Date.now() - startTime}ms`)
  
  // 处理业务错误码
  if (response.data.code !== 0) {
    throw new Error(response.data.message)
  }
  
  return response
})
```

### 数据转换

```typescript
// 自动解包响应数据
http.interceptors.response.use((response) => {
  // 如果响应格式是 { code: 0, data: {...}, message: 'success' }
  // 直接返回 data 部分
  if (response.data.code === 0) {
    response.data = response.data.data
  }
  return response
})
```

### 响应缓存

```typescript
http.interceptors.response.use((response) => {
  // 缓存GET请求的响应
  if (response.config.method === 'GET') {
    cacheResponse(response.config.url, response.data)
  }
  return response
})
```

## 错误拦截器

错误拦截器用于统一处理请求错误。

### 基础用法

```typescript
http.interceptors.error.use((error) => {
  // 统一错误处理
  if (error.response?.status === 401) {
    // 未授权，跳转到登录页
    redirectToLogin()
  } else if (error.response?.status === 403) {
    // 权限不足
    showErrorMessage('权限不足')
  } else if (error.isNetworkError) {
    // 网络错误
    showErrorMessage('网络连接失败，请检查网络设置')
  }
  
  return error
})
```

### 错误重试

```typescript
http.interceptors.error.use((error) => {
  // 对特定错误进行重试
  if (error.response?.status >= 500 && error.config.retryCount < 3) {
    error.config.retryCount = (error.config.retryCount || 0) + 1
    return http.request(error.config)
  }
  
  return error
})
```

## 内置拦截器

@ldesign/http 提供了一些常用的内置拦截器：

### 认证拦截器

```typescript
import { createAuthInterceptor } from '@ldesign/http'

const authInterceptor = createAuthInterceptor({
  getToken: () => localStorage.getItem('token'),
  tokenType: 'Bearer'
})

http.interceptors.request.use(authInterceptor)
```

### 响应时间拦截器

```typescript
import { createResponseTimeInterceptor } from '@ldesign/http'

const responseTimeInterceptor = createResponseTimeInterceptor({
  onResponseTime: (time, config) => {
    console.log(`${config.method} ${config.url} - ${time}ms`)
  }
})

http.interceptors.response.use(responseTimeInterceptor)
```

### 请求日志拦截器

```typescript
import { requestLoggerInterceptor, responseLoggerInterceptor } from '@ldesign/http'

// 记录请求日志
http.interceptors.request.use(requestLoggerInterceptor)

// 记录响应日志
http.interceptors.response.use(responseLoggerInterceptor)
```

## 拦截器管理

### 移除拦截器

```typescript
// 添加拦截器时会返回一个ID
const interceptorId = http.interceptors.request.use(myInterceptor)

// 使用ID移除拦截器
http.interceptors.request.eject(interceptorId)
```

### 清空所有拦截器

```typescript
// 清空所有请求拦截器
http.interceptors.request.clear()

// 清空所有响应拦截器
http.interceptors.response.clear()

// 清空所有错误拦截器
http.interceptors.error.clear()
```

## 拦截器执行顺序

拦截器按照添加顺序执行：

- **请求拦截器**：按添加顺序执行
- **响应拦截器**：按添加顺序执行
- **错误拦截器**：按添加顺序执行

```typescript
// 执行顺序：interceptor1 -> interceptor2 -> interceptor3
http.interceptors.request.use(interceptor1)
http.interceptors.request.use(interceptor2)
http.interceptors.request.use(interceptor3)
```

## 最佳实践

### 1. 统一错误处理

```typescript
// 创建统一的错误处理拦截器
const errorHandler = (error) => {
  // 记录错误日志
  console.error('HTTP Error:', error)
  
  // 根据错误类型进行处理
  switch (error.response?.status) {
    case 401:
      handleUnauthorized()
      break
    case 403:
      handleForbidden()
      break
    case 500:
      handleServerError()
      break
    default:
      handleGenericError(error)
  }
  
  return Promise.reject(error)
}

http.interceptors.error.use(errorHandler)
```

### 2. 请求去重

```typescript
const pendingRequests = new Map()

// 请求拦截器 - 检查重复请求
http.interceptors.request.use((config) => {
  const requestKey = `${config.method}:${config.url}`
  
  if (pendingRequests.has(requestKey)) {
    // 取消重复请求
    throw new Error('Duplicate request cancelled')
  }
  
  pendingRequests.set(requestKey, true)
  return config
})

// 响应拦截器 - 清理请求记录
http.interceptors.response.use((response) => {
  const requestKey = `${response.config.method}:${response.config.url}`
  pendingRequests.delete(requestKey)
  return response
})
```

### 3. 动态配置

```typescript
// 根据环境动态添加拦截器
if (process.env.NODE_ENV === 'development') {
  // 开发环境添加详细日志
  http.interceptors.request.use(requestLoggerInterceptor)
  http.interceptors.response.use(responseLoggerInterceptor)
}

if (process.env.NODE_ENV === 'production') {
  // 生产环境添加错误上报
  http.interceptors.error.use(errorReportingInterceptor)
}
```

## 下一步

- [错误处理](./error-handling) - 深入了解错误处理机制
- [缓存](./caching) - 学习缓存功能
- [最佳实践](./best-practices) - 了解使用最佳实践
