# 高级使用案例

## 完整的生产环境配置

```ts
// api/index.ts
import { createSystemApiEngineByEnv, authMiddleware, createRestPlugin } from '@ldesign/api'

// 1. 创建引擎，自动加载系统API（登录、注册、用户信息等）
const engine = createSystemApiEngineByEnv('production')

// 2. 安装认证中间件
engine.use(authMiddleware({
  tokenGetter: () => localStorage.getItem('token'),
  tokenSetter: (token) => localStorage.setItem('token', token),
  refreshToken: async () => {
    const res = await engine.call('refreshToken')
    return res.token
  },
  shouldRefresh: (error) => error.status === 401,
}))

// 3. 安装 REST 插件，快速创建 CRUD API
engine.use(createRestPlugin({
  resources: [
    { name: 'user', baseUrl: '/api/users' },
    { name: 'post', baseUrl: '/api/posts', cache: { ttl: 60000 } },
    { name: 'comment', baseUrl: '/api/comments' },
  ],
}))

// 4. 自定义业务 API
engine.registerMethod('dashboard.stats', { url: '/api/dashboard/stats', cache: { ttl: 300000 } })
engine.registerMethod('search', { url: '/api/search', method: 'POST' })

export default engine
```

## Vue 3 应用集成

```ts
// main.ts
import { createApp } from 'vue'
import { ApiVuePlugin } from '@ldesign/api/vue'
import engine from './api'
import App from './App.vue'

const app = createApp(App)
app.use(ApiVuePlugin, { engine })
app.mount('#app')
```

```vue
<!-- UserList.vue -->
<template>
  <div>
    <!-- 搜索 -->
    <input v-model="keyword" @input="debounceSearch" placeholder="搜索用户">
    
    <!-- 用户列表 -->
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">{{ error.message }}</div>
    <ul v-else>
      <li v-for="user in items" :key="user.id">
        {{ user.name }}
        <button @click="deleteUser(user.id)">删除</button>
      </li>
    </ul>
    
    <!-- 分页 -->
    <div v-if="hasMore">
      <button @click="prevPage" :disabled="page === 1">上一页</button>
      <span>{{ page }} / {{ Math.ceil(total / pageSize) }}</span>
      <button @click="nextPage">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePaginatedApi, useApiCall } from '@ldesign/api/vue'

const keyword = ref('')

// 分页列表
const {
  items, total, page, pageSize,
  loading, error,
  run, nextPage, prevPage, hasMore,
} = usePaginatedApi('user.list', {
  page: 1,
  pageSize: 20,
  immediate: true,
})

// 删除用户
const { execute: deleteUserApi } = useApiCall('user.delete', {
  immediate: false,
  onSuccess: () => {
    // 刷新列表
    run()
  },
})

const deleteUser = (id: string) => {
  if (confirm('确认删除？')) {
    deleteUserApi({ id })
  }
}

// 搜索（防抖）
const debounceSearch = debounce(() => {
  run({ keyword: keyword.value })
}, 500)
</script>
```

## React 应用集成

```tsx
// hooks/useApi.ts
import { useState, useEffect, useCallback } from 'react'
import engine from '../api'

export function useApiCall<T = any>(methodName: string, options?: any) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async (params?: any) => {
    setLoading(true)
    setError(null)
    try {
      const result = await engine.call(methodName, params)
      setData(result)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [methodName])

  useEffect(() => {
    if (options?.immediate) {
      execute(options.params)
    }
  }, [])

  return { data, loading, error, execute }
}
```

```tsx
// UserList.tsx
import React from 'react'
import { useApiCall } from '../hooks/useApi'

export function UserList() {
  const { data: users, loading, error, execute } = useApiCall('user.list', {
    immediate: true,
  })

  const deleteUser = async (id: string) => {
    await engine.call('user.delete', { id })
    execute() // 刷新列表
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>
          {user.name}
          <button onClick={() => deleteUser(user.id)}>Delete</button>
        </li>
      ))}
    </ul>
  )
}
```

## 复杂的中间件组合

```ts
// 请求日志中间件
const loggingMiddleware: ApiMiddleware = {
  request: async (config) => {
    console.log(`[API] ${config.method} ${config.url}`, config.data)
    return config
  },
  response: async (response) => {
    console.log(`[API] Response:`, response.data)
    return response
  },
  error: async (error) => {
    console.error(`[API] Error:`, error)
    throw error
  },
}

// 性能监控中间件
const performanceMiddleware: ApiMiddleware = {
  request: async (config) => {
    config.metadata = { startTime: Date.now() }
    return config
  },
  response: async (response, config) => {
    const duration = Date.now() - config.metadata.startTime
    console.log(`[Performance] ${config.url} took ${duration}ms`)
    
    // 上报到监控系统
    if (duration > 1000) {
      reportSlowApi(config.url, duration)
    }
    
    return response
  },
}

// 错误上报中间件
const errorReportingMiddleware: ApiMiddleware = {
  error: async (error) => {
    // 上报到错误追踪系统
    Sentry.captureException(error, {
      tags: {
        api_url: error.config?.url,
        api_method: error.config?.method,
      },
    })
    throw error
  },
}

// 组合使用
engine.use(loggingMiddleware)
engine.use(performanceMiddleware)
engine.use(errorReportingMiddleware)
```

## 动态 API 注册与命名空间

```ts
// 根据后端配置动态注册 API
async function registerDynamicApis() {
  const apiConfig = await fetch('/api/config').then(r => r.json())
  
  apiConfig.endpoints.forEach(endpoint => {
    engine.registerMethod(endpoint.name, {
      url: endpoint.url,
      method: endpoint.method,
      cache: endpoint.cacheable ? { ttl: endpoint.cacheTtl } : undefined,
    })
  })
}

// 使用命名空间组织 API
engine.registerNamespace('admin', {
  'users.list': { url: '/admin/users' },
  'users.create': { url: '/admin/users', method: 'POST' },
  'users.update': { url: '/admin/users/:id', method: 'PUT' },
  'users.delete': { url: '/admin/users/:id', method: 'DELETE' },
  'logs.list': { url: '/admin/logs' },
  'settings.get': { url: '/admin/settings' },
  'settings.update': { url: '/admin/settings', method: 'PUT' },
})

// 调用
await engine.call('admin.users.list')
await engine.call('admin.settings.update', { theme: 'dark' })
```

## 批量操作与并发控制

```ts
// 批量删除，带并发限制
async function batchDelete(ids: string[]) {
  const batchSize = 5 // 每次最多删除 5 个
  
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize)
    await Promise.all(
      batch.map(id => engine.call('user.delete', { id }))
    )
  }
}

// 使用 p-limit 控制并发
import pLimit from 'p-limit'

const limit = pLimit(3) // 最多 3 个并发请求

async function fetchAllUserDetails(userIds: string[]) {
  const promises = userIds.map(id =>
    limit(() => engine.call('user.get', { id }))
  )
  return Promise.all(promises)
}
```

## 缓存策略与清理

```ts
// 智能缓存清理
engine.on('user.update', (data) => {
  // 清理相关缓存
  engine.clearCache('user.get', { id: data.id })
  engine.clearCache('user.list') // 列表也需要更新
})

// 定时清理过期缓存
setInterval(() => {
  engine.cacheManager.clearExpired()
}, 60000) // 每分钟清理一次

// 根据内存使用情况清理缓存
if (performance.memory.usedJSHeapSize > threshold) {
  engine.cacheManager.clear()
}
```

## WebSocket 集成

```ts
// 扩展引擎支持 WebSocket
class WebSocketApiEngine extends ApiEngine {
  private ws: WebSocket | null = null

  connectWebSocket(url: string) {
    this.ws = new WebSocket(url)
    
    this.ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data)
      
      // 根据消息类型清理缓存或触发更新
      if (type === 'user.updated') {
        this.clearCache('user.get', { id: data.id })
        this.emit('user.updated', data)
      }
    }
  }

  // 通过 WebSocket 发送请求
  async callWebSocket(method: string, data?: any) {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36)
      
      const handler = (event: MessageEvent) => {
        const response = JSON.parse(event.data)
        if (response.id === id) {
          this.ws!.removeEventListener('message', handler)
          response.error ? reject(response.error) : resolve(response.data)
        }
      }
      
      this.ws!.addEventListener('message', handler)
      this.ws!.send(JSON.stringify({ id, method, data }))
    })
  }
}
```
