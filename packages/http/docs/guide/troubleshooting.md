# 故障排除

本指南帮助你解决使用 @ldesign/http 时可能遇到的常见问题。

## 安装问题

### 依赖冲突

**问题**: 安装时出现依赖冲突错误

```bash
npm ERR! peer dep missing: vue@^3.3.0
```

**解决方案**:

1. 确保安装了正确版本的 Vue 3:
```bash
pnpm add vue@^3.3.0
```

2. 如果不使用 Vue，可以跳过 peer dependencies:
```bash
pnpm add @ldesign/http --ignore-peer-deps
```

### TypeScript 类型错误

**问题**: TypeScript 编译时出现类型错误

```
Cannot find module '@ldesign/http' or its corresponding type declarations
```

**解决方案**:

1. 确保安装了类型定义:
```bash
pnpm add -D @types/node
```

2. 在 `tsconfig.json` 中添加类型声明:
```json
{
  "compilerOptions": {
    "types": ["@ldesign/http"]
  }
}
```

## 请求问题

### CORS 错误

**问题**: 浏览器控制台显示 CORS 错误

```
Access to fetch at 'https://api.example.com' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**解决方案**:

1. **服务端解决** (推荐):
```javascript
// Express.js 示例
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true
}))
```

2. **开发环境代理**:
```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
}
```

3. **使用代理模式**:
```typescript
const http = createHttpClient({
  baseURL: '/api', // 使用相对路径
  adapter: 'fetch'
})
```

### 请求超时

**问题**: 请求经常超时

**解决方案**:

1. **增加超时时间**:
```typescript
const http = createHttpClient({
  timeout: 30000, // 30秒
  retry: {
    retries: 3,
    retryDelay: 2000
  }
})
```

2. **使用流式请求** (大文件):
```typescript
const response = await http.get('/api/large-file', {
  responseType: 'stream',
  timeout: 0 // 禁用超时
})
```

### 请求被取消

**问题**: 请求意外被取消

**解决方案**:

1. **检查组件卸载**:
```vue
<script setup>
import { onUnmounted } from 'vue'
import { useRequest } from '@ldesign/http'

const { execute, cancel } = useRequest('/api/data', {
  immediate: false
})

// 组件卸载时取消请求
onUnmounted(() => {
  cancel()
})
</script>
```

2. **检查重复请求**:
```typescript
// 禁用请求去重
const http = createHttpClient({
  concurrency: {
    deduplication: false
  }
})
```

## 缓存问题

### 缓存不生效

**问题**: 设置了缓存但请求仍然发送到服务器

**解决方案**:

1. **检查缓存配置**:
```typescript
const http = createHttpClient({
  cache: {
    enabled: true,
    ttl: 300000, // 5分钟
    storage: 'memory' // 或 'localStorage'
  }
})
```

2. **检查请求方法**:
```typescript
// 只有 GET 请求默认启用缓存
const response = await http.get('/api/data', {
  cache: true // 显式启用缓存
})
```

3. **检查缓存键**:
```typescript
const http = createHttpClient({
  cache: {
    enabled: true,
    keyGenerator: (config) => {
      // 自定义缓存键生成
      return `${config.method}:${config.url}:${JSON.stringify(config.params)}`
    }
  }
})
```

### 缓存数据过期

**问题**: 缓存的数据已经过期但仍在使用

**解决方案**:

1. **手动清除缓存**:
```typescript
// 清除所有缓存
await http.clearCache()

// 清除特定缓存
await http.cache.delete('/api/users')
```

2. **设置合适的 TTL**:
```typescript
const http = createHttpClient({
  cache: {
    ttl: 60000, // 1分钟，根据数据更新频率调整
  }
})
```

## 拦截器问题

### 拦截器不执行

**问题**: 添加的拦截器没有被执行

**解决方案**:

1. **检查拦截器添加顺序**:
```typescript
// 确保在发送请求前添加拦截器
http.interceptors.request.use(myInterceptor)

// 然后发送请求
const response = await http.get('/api/data')
```

2. **检查拦截器返回值**:
```typescript
// 请求拦截器必须返回 config
http.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${token}`
  return config // 必须返回
})

// 响应拦截器必须返回 response
http.interceptors.response.use((response) => {
  console.log('Response received')
  return response // 必须返回
})
```

### 拦截器错误处理

**问题**: 拦截器中的错误没有被正确处理

**解决方案**:

```typescript
// 错误拦截器
http.interceptors.error.use((error) => {
  console.error('Request failed:', error)
  
  // 处理特定错误
  if (error.response?.status === 401) {
    // 重定向到登录页
    window.location.href = '/login'
  }
  
  // 必须返回 Promise.reject 或抛出错误
  return Promise.reject(error)
})
```

## Vue 集成问题

### 插件安装失败

**问题**: Vue 插件安装时出错

```
Cannot read property 'use' of undefined
```

**解决方案**:

1. **检查 Vue 版本**:
```bash
pnpm list vue
```

2. **正确安装插件**:
```typescript
import { createApp } from 'vue'
import { HttpPlugin, createHttpClient } from '@ldesign/http'

const app = createApp(App)

app.use(HttpPlugin, {
  client: createHttpClient({
    baseURL: 'https://api.example.com'
  })
})
```

### Composition API 问题

**问题**: `useRequest` 等 hooks 不可用

**解决方案**:

1. **确保在 setup 函数中使用**:
```vue
<script setup>
// ✅ 正确
import { useRequest } from '@ldesign/http'

const { data, loading } = useRequest('/api/data')
</script>
```

2. **不要在条件语句中使用**:
```vue
<script setup>
// ❌ 错误
if (someCondition) {
  const { data } = useRequest('/api/data')
}

// ✅ 正确
const { data, execute } = useRequest('/api/data', {
  immediate: false
})

if (someCondition) {
  execute()
}
</script>
```

## 性能问题

### 请求过多

**问题**: 应用发送了太多请求

**解决方案**:

1. **启用请求去重**:
```typescript
const http = createHttpClient({
  concurrency: {
    deduplication: true,
    maxConcurrent: 6
  }
})
```

2. **使用缓存**:
```typescript
const http = createHttpClient({
  cache: {
    enabled: true,
    ttl: 300000 // 5分钟缓存
  }
})
```

3. **合并请求**:
```typescript
// 使用 Promise.all 并发请求
const [users, posts, comments] = await Promise.all([
  http.get('/api/users'),
  http.get('/api/posts'),
  http.get('/api/comments')
])
```

### 内存泄漏

**问题**: 长时间运行后内存使用过高

**解决方案**:

1. **清理缓存**:
```typescript
// 定期清理缓存
setInterval(() => {
  http.clearCache()
}, 30 * 60 * 1000) // 每30分钟清理一次
```

2. **取消未完成的请求**:
```vue
<script setup>
import { onUnmounted } from 'vue'

const { execute, cancel } = useRequest('/api/data', {
  immediate: false
})

onUnmounted(() => {
  cancel() // 组件卸载时取消请求
})
</script>
```

## 调试技巧

### 启用调试日志

```typescript
const http = createHttpClient({
  debug: true, // 启用调试模式
  interceptors: {
    request: [requestLoggerInterceptor],
    response: [responseLoggerInterceptor]
  }
})
```

### 使用浏览器开发工具

1. **Network 面板**: 查看实际的网络请求
2. **Console 面板**: 查看错误日志和调试信息
3. **Application 面板**: 检查缓存数据

### 自定义调试拦截器

```typescript
// 调试拦截器
http.interceptors.request.use((config) => {
  console.group(`🚀 Request: ${config.method?.toUpperCase()} ${config.url}`)
  console.log('Config:', config)
  console.groupEnd()
  return config
})

http.interceptors.response.use((response) => {
  console.group(`✅ Response: ${response.status} ${response.config.url}`)
  console.log('Data:', response.data)
  console.log('Headers:', response.headers)
  console.groupEnd()
  return response
})

http.interceptors.error.use((error) => {
  console.group(`❌ Error: ${error.config?.url}`)
  console.error('Error:', error)
  console.groupEnd()
  return Promise.reject(error)
})
```

## 获取帮助

如果以上解决方案都无法解决你的问题，可以通过以下方式获取帮助：

1. **查看文档**: [完整文档](../guide/)
2. **查看示例**: [示例代码](../examples/)
3. **提交 Issue**: [GitHub Issues](https://github.com/ldesign/http/issues)
4. **社区讨论**: [GitHub Discussions](https://github.com/ldesign/http/discussions)

提交问题时，请包含以下信息：

- @ldesign/http 版本
- Vue 版本 (如果使用 Vue)
- 浏览器版本
- 完整的错误信息
- 最小复现代码

## 下一步

- [最佳实践](./best-practices) - 了解使用最佳实践
- [API 参考](../api/) - 查看完整的 API 文档
- [示例](../examples/) - 查看更多示例代码
