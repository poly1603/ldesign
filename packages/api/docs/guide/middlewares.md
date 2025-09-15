# 中间件与重试

本文档介绍如何使用全新的中间件系统、请求重试机制、认证中间件插件以及 Vue 轮询钩子来统一与简化你的 API 使用体验。

## 中间件（request/response/error）

- 作用域优先级：调用级 > 方法级 > 全局
- 触发顺序：
  - 请求：request[] 依次执行，最后发起 HTTP
  - 响应：response[] 依次执行，最后进入 transform/validate
  - 错误：error[] 依次执行，如返回 ResponseData 则视为恢复成功

示例：全局中间件
```ts
import { createApiEngine } from '@ldesign/api'

const api = createApiEngine({
  middlewares: {
    request: [
      (cfg) => { cfg.headers = { ...(cfg.headers||{}), 'X-App': 'ldesign' }; return cfg },
    ],
    response: [
      (res) => { if (res.data && res.data.data) res.data = res.data.data; return res },
    ],
    error: [
      (err) => { /* 可选择性返回一个 { data, status, ... } 来恢复错误 */ },
    ]
  }
})
```

方法级/调用级与上面结构一致，分别写在 ApiMethodConfig.middlewares 与 call(..., { middlewares }) 上即可。

## 请求重试

- 配置项：enabled, retries, delay, backoff('fixed'|'exponential'), maxDelay, jitter, retryOn(error, attempt), circuitBreaker
- 错误中间件优先于重试（若中间件已恢复，则不再重试）

示例：方法级重试
```ts
api.register('fetchData', {
  name: 'fetchData',
  config: { method: 'GET', url: '/data' },
  retry: {
    enabled: true,
    retries: 3,
    delay: 200,
    backoff: 'exponential',
    maxDelay: 2000,
    jitter: 0.2, // ±20% 抖动
    circuitBreaker: { enabled: true, failureThreshold: 5, halfOpenAfter: 30000, successThreshold: 1 },
  },
})
```

示例：调用级覆写
```ts
await api.call('fetchData', null, {
  retry: { retries: 1, delay: 100, backoff: 'fixed', retryOn: (e,a) => a < 1 }
})
```

## 认证中间件插件

使用认证插件可统一注入 Authorization，并在 401 时尝试刷新 token：
```ts
import { createApiEngine, authMiddlewaresPlugin, systemApiPlugin } from '@ldesign/api'

const api = createApiEngine({
  // 若你未设置全局重试，插件会默认启用最小重试（1次）以便刷新后重放请求
})

await api.use(authMiddlewaresPlugin)      // 启用认证中间件
await api.use(systemApiPlugin)            // 启用系统 API（内置 refreshToken）
```

自定义存取逻辑：
```ts
import { createAuthMiddlewaresPlugin } from '@ldesign/api'

await api.use(createAuthMiddlewaresPlugin({
  getAccessToken: () => sessionStorage.getItem('atk'),
  setAccessToken: v => v ? sessionStorage.setItem('atk', v) : sessionStorage.removeItem('atk'),
  isUnauthorized: (err) => (err as any)?.code === 'UNAUTHORIZED',
}))
```

## Vue 轮询钩子 useApiPolling

```ts
import { useApiPolling } from '@ldesign/api/vue'

const { data, loading, error, start, stop, isActive } = useApiPolling('getUserInfo', {
  interval: 30000,
  autoStart: true,
  onError: (e) => console.error(e),
})
```

## 类型增强：withTypedApi

为引擎添加“方法名到返回值类型”的注册表，让调用时自动推断类型：
```ts
import { createApiEngine, withTypedApi, type TypedApiEngine } from '@ldesign/api'

type Registry = {
  getUserInfo: { id: string, username: string }
  getMenus: Array<{ id: number, title: string }>
}

const api = createApiEngine()
const typed = withTypedApi<Registry>(api) // 仅类型标注，无运行时成本

const user = await typed.call('getUserInfo')  // user 类型自动推断
```

