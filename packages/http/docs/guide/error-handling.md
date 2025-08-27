# 错误处理

@ldesign/http 提供了完善的错误处理机制，帮助你优雅地处理各种网络请求错误。

## 错误类型

### HTTP 错误

HTTP 错误是指服务器返回的非 2xx 状态码：

```typescript
try {
  const response = await http.get('/api/users/999')
} catch (error) {
  if (error.response) {
    // 服务器返回了错误状态码
    console.log('Status:', error.response.status)
    console.log('Data:', error.response.data)
    console.log('Headers:', error.response.headers)
  }
}
```

### 网络错误

网络错误是指请求无法到达服务器：

```typescript
try {
  const response = await http.get('/api/data')
} catch (error) {
  if (error.isNetworkError) {
    console.log('网络连接失败')
    // 显示网络错误提示
    showNetworkErrorMessage()
  }
}
```

### 超时错误

请求超时错误：

```typescript
try {
  const response = await http.get('/api/slow-endpoint', {
    timeout: 5000 // 5秒超时
  })
} catch (error) {
  if (error.isTimeoutError) {
    console.log('请求超时')
    // 提示用户重试
    showTimeoutMessage()
  }
}
```

### 取消错误

请求被取消的错误：

```typescript
const cancelToken = http.createCancelToken()

try {
  const response = await http.get('/api/data', {
    signal: cancelToken.signal
  })
} catch (error) {
  if (error.isCancelError) {
    console.log('请求被取消')
  }
}

// 取消请求
cancelToken.cancel('用户取消了请求')
```

## 错误对象结构

@ldesign/http 的错误对象包含以下属性：

```typescript
interface HttpError extends Error {
  /** 错误代码 */
  code?: string
  /** 请求配置 */
  config?: RequestConfig
  /** 响应数据 */
  response?: ResponseData
  /** 是否为网络错误 */
  isNetworkError?: boolean
  /** 是否为超时错误 */
  isTimeoutError?: boolean
  /** 是否为取消错误 */
  isCancelError?: boolean
  /** 原始错误 */
  cause?: Error
}
```

## 统一错误处理

### 使用错误拦截器

```typescript
import { createHttpClient } from '@ldesign/http'

const http = createHttpClient({
  baseURL: 'https://api.example.com'
})

// 添加全局错误处理
http.interceptors.error.use((error) => {
  // 根据错误类型进行处理
  if (error.response) {
    // HTTP 错误
    handleHttpError(error)
  } else if (error.isNetworkError) {
    // 网络错误
    handleNetworkError(error)
  } else if (error.isTimeoutError) {
    // 超时错误
    handleTimeoutError(error)
  } else if (error.isCancelError) {
    // 取消错误
    handleCancelError(error)
  } else {
    // 其他错误
    handleGenericError(error)
  }
  
  return Promise.reject(error)
})

function handleHttpError(error) {
  const status = error.response.status
  
  switch (status) {
    case 400:
      showMessage('请求参数错误')
      break
    case 401:
      showMessage('未授权，请重新登录')
      redirectToLogin()
      break
    case 403:
      showMessage('权限不足')
      break
    case 404:
      showMessage('请求的资源不存在')
      break
    case 422:
      showMessage('数据验证失败')
      break
    case 429:
      showMessage('请求过于频繁，请稍后重试')
      break
    case 500:
      showMessage('服务器内部错误')
      break
    case 502:
      showMessage('网关错误')
      break
    case 503:
      showMessage('服务暂时不可用')
      break
    default:
      showMessage(`请求失败 (${status})`)
  }
}

function handleNetworkError(error) {
  showMessage('网络连接失败，请检查网络设置')
}

function handleTimeoutError(error) {
  showMessage('请求超时，请重试')
}

function handleCancelError(error) {
  // 通常不需要显示取消错误
  console.log('请求被取消:', error.message)
}

function handleGenericError(error) {
  showMessage('请求失败，请重试')
  console.error('Unknown error:', error)
}
```

### 业务错误处理

```typescript
// 处理业务层面的错误
http.interceptors.response.use((response) => {
  const { code, message, data } = response.data
  
  // 假设 API 返回格式为 { code: number, message: string, data: any }
  if (code !== 0) {
    // 业务错误
    const error = new Error(message)
    error.code = code
    error.response = response
    throw error
  }
  
  // 成功响应，返回数据部分
  response.data = data
  return response
})
```

## 重试机制

### 自动重试配置

```typescript
const http = createHttpClient({
  baseURL: 'https://api.example.com',
  retry: {
    retries: 3, // 最多重试3次
    retryDelay: 1000, // 重试延迟1秒
    retryCondition: (error) => {
      // 只重试网络错误和5xx错误
      return error.isNetworkError || 
             (error.response && error.response.status >= 500)
    }
  }
})
```

### 指数退避重试

```typescript
const http = createHttpClient({
  retry: {
    retries: 3,
    retryDelayFunction: (retryCount, error) => {
      // 指数退避：1s, 2s, 4s
      return Math.pow(2, retryCount) * 1000
    },
    retryCondition: (error) => {
      return error.isNetworkError || error.response?.status >= 500
    }
  }
})
```

### 手动重试

```typescript
async function fetchWithRetry(url, maxRetries = 3) {
  let lastError
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await http.get(url)
      return response
    } catch (error) {
      lastError = error
      
      // 如果是最后一次尝试，或者不应该重试，则抛出错误
      if (i === maxRetries || !shouldRetry(error)) {
        throw error
      }
      
      // 等待后重试
      await delay(Math.pow(2, i) * 1000)
    }
  }
  
  throw lastError
}

function shouldRetry(error) {
  return error.isNetworkError || 
         error.isTimeoutError ||
         (error.response && error.response.status >= 500)
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
```

## 错误恢复策略

### 降级处理

```typescript
async function fetchUserData(userId) {
  try {
    // 尝试从主API获取数据
    const response = await http.get(`/api/users/${userId}`)
    return response.data
  } catch (error) {
    if (error.response?.status === 503) {
      // 服务不可用，尝试从缓存获取
      const cachedData = await getCachedUserData(userId)
      if (cachedData) {
        return cachedData
      }
    }
    
    // 如果缓存也没有，返回默认数据
    return getDefaultUserData()
  }
}
```

### 断路器模式

```typescript
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.threshold = threshold // 失败阈值
    this.timeout = timeout // 超时时间
    this.failureCount = 0
    this.lastFailureTime = null
    this.state = 'CLOSED' // CLOSED, OPEN, HALF_OPEN
  }
  
  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN'
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }
    
    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }
  
  onSuccess() {
    this.failureCount = 0
    this.state = 'CLOSED'
  }
  
  onFailure() {
    this.failureCount++
    this.lastFailureTime = Date.now()
    
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN'
    }
  }
}

// 使用断路器
const circuitBreaker = new CircuitBreaker()

async function fetchData() {
  return circuitBreaker.execute(() => http.get('/api/data'))
}
```

## 错误监控和上报

### 错误上报

```typescript
// 错误上报拦截器
http.interceptors.error.use((error) => {
  // 只上报非用户取消的错误
  if (!error.isCancelError) {
    reportError({
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    })
  }
  
  return Promise.reject(error)
})

function reportError(errorInfo) {
  // 发送错误信息到监控服务
  fetch('/api/errors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(errorInfo)
  }).catch(() => {
    // 错误上报失败，记录到本地
    console.error('Failed to report error:', errorInfo)
  })
}
```

### 性能监控

```typescript
// 性能监控拦截器
http.interceptors.request.use((config) => {
  config.startTime = Date.now()
  return config
})

http.interceptors.response.use((response) => {
  const duration = Date.now() - response.config.startTime
  
  // 记录慢请求
  if (duration > 3000) {
    reportSlowRequest({
      url: response.config.url,
      method: response.config.method,
      duration,
      timestamp: Date.now()
    })
  }
  
  return response
})
```

## 最佳实践

### 1. 分层错误处理

```typescript
// 全局错误处理
http.interceptors.error.use(globalErrorHandler)

// 业务层错误处理
async function fetchUserList() {
  try {
    const response = await http.get('/api/users')
    return response.data
  } catch (error) {
    // 业务特定的错误处理
    if (error.response?.status === 404) {
      return [] // 返回空列表
    }
    throw error // 其他错误继续抛出
  }
}

// 组件层错误处理
function UserListComponent() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)
  
  useEffect(() => {
    fetchUserList()
      .then(setUsers)
      .catch(setError) // 组件层处理错误状态
  }, [])
  
  if (error) {
    return <ErrorComponent error={error} />
  }
  
  return <UserList users={users} />
}
```

### 2. 错误类型化

```typescript
// 定义错误类型
enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR'
}

// 创建类型化的错误
function createTypedError(code: ErrorCode, message: string, originalError?: Error) {
  const error = new Error(message)
  error.code = code
  error.cause = originalError
  return error
}

// 在拦截器中使用
http.interceptors.error.use((error) => {
  if (error.isNetworkError) {
    throw createTypedError(ErrorCode.NETWORK_ERROR, '网络连接失败', error)
  }
  
  if (error.response?.status === 401) {
    throw createTypedError(ErrorCode.PERMISSION_ERROR, '未授权访问', error)
  }
  
  return Promise.reject(error)
})
```

## 下一步

- [重试机制](./retry) - 深入了解重试配置
- [拦截器](./interceptors) - 学习拦截器的使用
- [最佳实践](./best-practices) - 了解更多最佳实践
