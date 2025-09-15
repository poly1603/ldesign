# API 引擎

本文介绍 API 引擎的关键能力与常用方法。

## 创建与配置

```ts
import { createApiEngine } from '@ldesign/api'

const api = createApiEngine({
  debug: import.meta.env.DEV,
  http: { baseURL: '/api', timeout: 10000 },
  cache: { enabled: true, ttl: 300000, storage: 'memory' },
  debounce: { enabled: true, delay: 300 },
  deduplication: { enabled: true },
})
```

## 方法注册与调用

```ts
api.register('getUserProfile', {
  name: 'getUserProfile',
  config: { method: 'GET', url: '/user/profile' },
  cache: { enabled: true, ttl: 600000 },
})

const profile = await api.call('getUserProfile')
```

## 批量调用

```ts
const [info, menus, perms] = await api.callBatch([
  { methodName: 'getUserInfo' },
  { methodName: 'getMenus' },
  { methodName: 'getPermissions' },
])
```

## 缓存与统计

```ts
api.clearCache('getUserInfo')
const stats = api.getCacheStats()
```

