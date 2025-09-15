# 基础用法

本页展示最小可运行的示例，帮助你快速理解 @ldesign/api 的核心用法。

## 创建引擎并注册系统 API

```ts
import { createApiEngine, systemApiPlugin } from '@ldesign/api'

const api = createApiEngine({
  http: { baseURL: '/api' },
})
await api.use(systemApiPlugin)

const user = await api.call('getUserInfo')
```

## 使用中间件与重试

```ts
const api = createApiEngine({
  retry: { enabled: true, retries: 2, delay: 200 },
  middlewares: {
    request: [ cfg => ({ ...cfg, headers: { ...(cfg.headers||{}), 'X-From': 'docs' } }) ],
    response: [ res => (res.data?.data ? ({ ...res, data: res.data.data }) : res) ],
  },
})
```

## 使用 REST 插件

```ts
import { createRestApiPlugin } from '@ldesign/api'

await api.use(createRestApiPlugin({ resource: 'user', basePath: '/users' }))
const list = await api.call('user.list', { page: 1, pageSize: 10 })
```

