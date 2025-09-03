# HTTP 插件集成指南

本文档详细介绍了如何将 `@ldesign/http` 包集成到 LDesign 应用中，包括插件配置、使用方法和演示页面的实现。

## 📋 集成概述

HTTP 插件为 LDesign 应用提供了完整的 HTTP 客户端功能，包括：

- **多适配器支持**: Fetch、Axios、Alova 等多种 HTTP 客户端
- **智能缓存系统**: LRU 缓存策略，自动缓存管理
- **自动重试机制**: 指数退避策略，智能重试条件
- **请求去重**: 自动识别和合并相同请求
- **错误处理**: 完善的错误恢复和处理机制
- **Vue 3 集成**: 深度集成 Vue 3 组合式 API

## 🚀 集成步骤

### 1. 创建插件配置

在 `app/src/http/index.ts` 中创建 HTTP 插件配置：

```typescript
import { createHttpClient } from '@ldesign/http'
import type { HttpClientConfig, Plugin } from '@ldesign/http'

// HTTP 客户端配置
const httpClientConfig: HttpClientConfig = {
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000,
  adapter: 'fetch',
  cache: {
    enabled: true,
    ttl: 300000, // 5分钟缓存
    maxSize: 100,
    strategy: 'lru',
  },
  retry: {
    enabled: true,
    maxAttempts: 3,
    delay: 1000,
    backoff: 'exponential',
  },
  // ... 更多配置
}

// 创建自定义 HTTP 插件
export const httpPlugin: Plugin = {
  name: 'http',
  version: '1.0.0',
  dependencies: [],

  async install(engine) {
    // 监听 app:created 事件
    engine.events.once('app:created', async (vueApp: any) => {
      // 创建 HTTP 客户端
      const { createHttpClient } = await import('@ldesign/http')
      const httpClient = createHttpClient(httpClientConfig)

      // 安装 Vue 插件
      const { HttpPlugin } = await import('@ldesign/http/vue')
      vueApp.use(HttpPlugin, {
        client: httpClient,
        globalConfig: httpClientConfig,
        globalProperty: '$http',
      })

      // 将客户端实例添加到 engine
      engine.httpClient = httpClient
    })
  }
}
```

### 2. 注册插件

在 `app/src/bootstrap.ts` 中注册 HTTP 插件：

```typescript
import { httpPlugin } from './http'

// 在 plugins 数组中添加 httpPlugin
const engine = createAndMountApp(App, '#app', {
  plugins: [routerPlugin, templatePlugin, colorPlugin, i18nPlugin, sizePlugin, httpPlugin],
})
```

### 3. 添加路由配置

在 `app/src/router/routes.ts` 中添加 HTTP 演示页面路由：

```typescript
{
  path: '/http-demo',
  name: 'http-demo',
  component: () => import('../pages/HttpDemo.vue'),
  meta: {
    title: 'HTTP 演示',
    description: '@ldesign/http 包功能演示页面',
    cache: true,
    preload: true,
    animation: 'fade',
  },
}
```

## 🎯 使用方法

### 在组件中使用

```vue
<template>
  <div>
    <button @click="fetchData">获取数据</button>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <div v-else>{{ data }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'

// 获取全局 HTTP 客户端
const instance = getCurrentInstance()
const $http = instance?.appContext.config.globalProperties.$http

const data = ref(null)
const loading = ref(false)
const error = ref(null)

const fetchData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await $http.get('/posts/1')
    data.value = response.data
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
}
</script>
```

### 支持的 HTTP 方法

```typescript
// GET 请求
const response = await $http.get('/posts')
const post = await $http.get('/posts/1')

// POST 请求
const newPost = await $http.post('/posts', {
  title: '新文章',
  body: '文章内容',
  userId: 1
})

// PUT 请求
const updatedPost = await $http.put('/posts/1', {
  id: 1,
  title: '更新的标题',
  body: '更新的内容',
  userId: 1
})

// PATCH 请求
const patchedPost = await $http.patch('/posts/1', {
  title: '部分更新的标题'
})

// DELETE 请求
await $http.delete('/posts/1')
```

## 🎨 演示页面功能

HTTP 演示页面 (`/http-demo`) 包含以下功能：

### 1. 统计信息面板
- 总请求数
- 成功请求数
- 失败请求数
- 缓存命中数

### 2. GET 请求演示
- 获取文章列表
- 获取单篇文章
- 获取用户列表

### 3. POST 请求演示
- 创建新文章
- 表单验证
- 成功反馈

### 4. PUT/PATCH 请求演示
- 完整更新 (PUT)
- 部分更新 (PATCH)
- 数据验证

### 5. DELETE 请求演示
- 删除文章
- 确认反馈

### 6. 错误处理演示
- 404 错误处理
- 超时错误处理
- 错误信息显示

### 7. 缓存功能演示
- 带缓存的请求
- 缓存命中检测
- 清除缓存

### 8. 请求日志
- 实时请求日志
- 请求方法和状态
- 响应时间统计

## ⚙️ 配置选项

### 基础配置

```typescript
const config: HttpClientConfig = {
  baseURL: 'https://api.example.com',    // API 基础地址
  timeout: 10000,                        // 请求超时时间
  adapter: 'fetch',                      // 使用的适配器
  headers: {                             // 默认请求头
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}
```

### 缓存配置

```typescript
cache: {
  enabled: true,        // 启用缓存
  ttl: 300000,         // 缓存时间 (毫秒)
  maxSize: 100,        // 最大缓存条目数
  strategy: 'lru',     // 缓存策略
}
```

### 重试配置

```typescript
retry: {
  enabled: true,                    // 启用重试
  maxAttempts: 3,                  // 最大重试次数
  delay: 1000,                     // 初始延迟时间
  backoff: 'exponential',          // 退避策略
  retryCondition: (error) => {     // 重试条件
    return !error.response || (error.response.status >= 500)
  }
}
```

### 请求去重配置

```typescript
deduplication: {
  enabled: true,                           // 启用请求去重
  keyGenerator: (config) => {              // 去重键生成器
    return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`
  }
}
```

## 🔧 高级功能

### 拦截器

```typescript
interceptors: {
  request: [
    (config) => {
      console.log('发送请求:', config.url)
      return config
    }
  ],
  response: [
    (response) => {
      console.log('响应成功:', response.status)
      return response
    },
    (error) => {
      console.error('请求失败:', error.message)
      return Promise.reject(error)
    }
  ]
}
```

### 生命周期回调

```typescript
{
  onClientCreated: (client) => {
    console.log('HTTP 客户端已创建')
  },
  onRequestStart: (config) => {
    console.log('开始请求:', config.url)
  },
  onRequestEnd: (response, error) => {
    if (error) {
      console.error('请求失败:', error.message)
    } else {
      console.log('请求完成:', response.status)
    }
  },
  onCacheHit: (key) => {
    console.log('缓存命中:', key)
  },
  onRetry: (attempt, error) => {
    console.warn('重试请求:', attempt, error.message)
  }
}
```

## 🐛 故障排除

### 常见问题

1. **插件安装失败**
   - 确保 Vue 应用已创建
   - 检查插件依赖是否正确安装

2. **HTTP 请求失败**
   - 检查网络连接
   - 验证 API 地址和参数
   - 查看控制台错误信息

3. **缓存不工作**
   - 确认缓存配置已启用
   - 检查缓存键生成逻辑
   - 验证 TTL 设置

### 调试技巧

1. **启用调试模式**
   ```typescript
   enableDebugMode: process.env.NODE_ENV === 'development'
   ```

2. **查看请求日志**
   - 打开浏览器开发者工具
   - 查看 Network 面板
   - 检查控制台日志

3. **监控性能**
   ```typescript
   enablePerformanceMonitoring: true
   ```

## 📚 相关文档

- [@ldesign/http 包文档](../../../packages/http/README.md)
- [HTTP 客户端 API 文档](../../../packages/http/docs/)
- [Vue 3 集成指南](../../../packages/http/docs/vue.md)
- [错误处理指南](../../../packages/http/docs/error-handling.md)

## 🎉 总结

通过以上步骤，你已经成功将 HTTP 插件集成到 LDesign 应用中。现在你可以：

1. ✅ 使用完整的 HTTP 客户端功能
2. ✅ 享受智能缓存和自动重试
3. ✅ 处理各种错误场景
4. ✅ 监控请求性能和状态
5. ✅ 在演示页面中测试所有功能

HTTP 插件为你的应用提供了强大而灵活的网络请求能力，让你能够轻松构建现代化的 Web 应用。
