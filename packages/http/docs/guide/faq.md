# 常见问题解答 (FAQ)

## 🚀 安装和配置

### Q: 如何安装 @ldesign/http？

A: 使用你喜欢的包管理器：

```bash
# pnpm (推荐)
pnpm add @ldesign/http

# npm
npm install @ldesign/http

# yarn
yarn add @ldesign/http
```

### Q: 支持哪些环境？

A: @ldesign/http 支持：

- **浏览器**: 现代浏览器 (Chrome 63+, Firefox 57+, Safari 12+)
- **Node.js**: 16.0+
- **框架**: Vue 3, React, Angular 等
- **构建工具**: Vite, Webpack, Rollup 等

### Q: 如何在 TypeScript 项目中使用？

A: @ldesign/http 原生支持 TypeScript，无需额外配置：

```typescript
import { createHttpClient } from '@ldesign/http'

interface User {
  id: number
  name: string
}

const http = createHttpClient()
const response = await http.get<User[]>('/users')
// response.data 的类型是 User[]
```

## 🔧 基础使用

### Q: 如何设置全局配置？

A: 在创建客户端时传入配置：

```typescript
const http = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token',
  },
  retry: {
    retries: 3,
    retryDelay: 1000,
  },
})
```

### Q: 如何处理不同的响应格式？

A: 使用响应拦截器统一处理：

```typescript
// 如果 API 返回 { data: T, message: string } 格式
http.interceptors.response.use((response) => {
  if (response.data && 'data' in response.data) {
    return {
      ...response,
      data: response.data.data,
    }
  }
  return response
})
```

### Q: 如何取消请求？

A: 使用 AbortController：

```typescript
const controller = new AbortController()

const response = await http.get('/users', {
  signal: controller.signal,
})

// 取消请求
controller.abort()
```

## 🎯 适配器相关

### Q: 如何选择适配器？

A: @ldesign/http 会自动选择最佳适配器，你也可以手动指定：

```typescript
import { createHttpClient, FetchAdapter } from '@ldesign/http'

// 自动选择
const http = createHttpClient()

// 手动指定
const http = createHttpClient({}, new FetchAdapter())

// 或者使用字符串
const http = createHttpClient({}, 'fetch')
```

### Q: 各个适配器有什么区别？

A:

- **FetchAdapter**: 基于原生 fetch API，现代浏览器原生支持
- **AxiosAdapter**: 基于 axios，功能丰富，兼容性好
- **AlovaAdapter**: 基于 alova，轻量级，性能优秀

### Q: 如何创建自定义适配器？

A: 实现 HttpAdapter 接口：

```typescript
import { BaseAdapter } from '@ldesign/http'

class MyAdapter extends BaseAdapter {
  name = 'my-adapter'

  async request(config) {
    // 实现请求逻辑
    return {
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }
  }

  isSupported() {
    return true
  }
}

const http = createHttpClient({}, new MyAdapter())
```

## 🔄 拦截器

### Q: 拦截器的执行顺序是什么？

A:

- **请求拦截器**: 后添加的先执行 (LIFO)
- **响应拦截器**: 先添加的先执行 (FIFO)

```typescript
http.interceptors.request.use((config) => {
  console.log('第二个执行')
  return config
})

http.interceptors.request.use((config) => {
  console.log('第一个执行')
  return config
})
```

### Q: 如何移除拦截器？

A: 使用返回的 ID：

```typescript
const interceptorId = http.interceptors.request.use(config => config)

// 移除拦截器
http.interceptors.request.eject(interceptorId)
```

### Q: 拦截器中可以修改请求吗？

A: 可以，但要返回修改后的配置：

```typescript
http.interceptors.request.use((config) => {
  // 修改配置
  config.headers.Authorization = 'Bearer new-token'
  config.timeout = 5000

  // 必须返回配置
  return config
})
```

## 💾 缓存

### Q: 缓存是如何工作的？

A: 缓存基于请求的 URL、方法和参数生成键：

```typescript
// 这两个请求会使用相同的缓存
await http.get('/users?page=1')
await http.get('/users?page=1') // 从缓存返回

// 这个请求会创建新的缓存条目
await http.get('/users?page=2')
```

### Q: 如何清除缓存？

A: 使用缓存管理器：

```typescript
// 清除所有缓存
await http.cache.clear()

// 清除特定缓存
await http.cache.delete('/users')
```

### Q: 缓存支持哪些存储方式？

A:

- **内存缓存**: 默认，页面刷新后丢失
- **localStorage**: 持久化存储
- **sessionStorage**: 会话级存储

```typescript
const http = createHttpClient({
  cache: {
    enabled: true,
    storage: 'localStorage', // 或 'memory', 'sessionStorage'
  },
})
```

## 🌟 Vue 3 集成

### Q: useQuery 和 useRequest 有什么区别？

A:

- **useQuery**: 自动执行，适合获取数据
- **useRequest**: 手动执行，适合用户操作

```typescript
// useQuery - 组件挂载时自动执行
const { data } = useQuery(http, () => http.get('/users'))

// useRequest - 需要手动调用 execute
const { data, execute } = useRequest(http, () => http.get('/users'))
```

### Q: 如何在 Vue 中处理错误？

A: 使用 onError 回调或 error 状态：

```typescript
const { data, error } = useQuery(http, () => http.get('/users'), {
  onError: (error) => {
    console.error('请求失败:', error)
    showNotification(error.message, 'error')
  },
})

// 或者在模板中处理
// <div v-if="error">错误: {{ error.message }}</div>
```

### Q: 如何实现条件请求？

A: 使用 enabled 选项：

```typescript
const userId = ref(null)

const { data } = useQuery(http, () => http.get(`/users/${userId.value}`), {
  enabled: computed(() => userId.value !== null),
})
```

## ⚡ 性能优化

### Q: 如何避免重复请求？

A: 启用请求去重：

```typescript
const http = createHttpClient({
  concurrency: {
    deduplication: true,
  },
})
```

### Q: 如何限制并发请求数？

A: 设置并发限制：

```typescript
const http = createHttpClient({
  concurrency: {
    maxConcurrent: 6,
  },
})
```

### Q: 大量数据如何分页加载？

A: 使用分页 hook：

```typescript
const { data, loading, loadMore, hasMore } = usePagination(
  http,
  page => http.get(`/users?page=${page}`),
  {
    pageSize: 20,
  }
)
```

## 🔒 安全相关

### Q: 如何防止 CSRF 攻击？

A: 添加 CSRF 令牌：

```typescript
http.interceptors.request.use((config) => {
  const token = document.querySelector('meta[name="csrf-token"]')?.content
  if (token) {
    config.headers['X-CSRF-Token'] = token
  }
  return config
})
```

### Q: 如何处理认证过期？

A: 在响应拦截器中处理：

```typescript
http.interceptors.response.use(
  response => response,
  (error) => {
    if (error.response?.status === 401) {
      // 清除本地认证信息
      localStorage.removeItem('token')
      // 重定向到登录页
      window.location.href = '/login'
    }
    throw error
  }
)
```

## 🐛 调试和故障排除

### Q: 如何调试请求？

A: 启用调试模式：

```typescript
if (process.env.NODE_ENV === 'development') {
  http.interceptors.request.use((config) => {
    console.log('Request:', config)
    return config
  })

  http.interceptors.response.use(
    (response) => {
      console.log('Response:', response)
      return response
    },
    (error) => {
      console.error('Error:', error)
      throw error
    }
  )
}
```

### Q: 请求超时如何处理？

A: 设置合理的超时时间和重试：

```typescript
const http = createHttpClient({
  timeout: 10000, // 10秒超时
  retry: {
    retries: 2,
    retryCondition: error => error.isTimeoutError,
  },
})
```

### Q: 网络错误如何处理？

A: 使用错误类型判断：

```typescript
try {
  await http.get('/users')
}
catch (error) {
  if (error.isNetworkError) {
    showMessage('网络连接失败，请检查网络')
  }
  else if (error.isTimeoutError) {
    showMessage('请求超时，请稍后重试')
  }
  else {
    showMessage(`请求失败: ${error.message}`)
  }
}
```

## 📚 更多资源

- [完整文档](../index)
- [API 参考](../api/)
- [示例代码](../examples/)
- [GitHub 仓库](https://github.com/ldesign/http)

如果你的问题没有在这里找到答案，欢迎提交 Issue 或参与讨论！
