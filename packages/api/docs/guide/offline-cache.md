# 离线缓存（持久化）

通过离线缓存插件在网络不可用或请求失败时，从本地持久化存储返回上一次成功数据，实现降级体验。

## 快速开始

```ts
import { createApiEngine, createOfflineCachePlugin } from '@ldesign/api'

const api = createApiEngine()
await api.use(createOfflineCachePlugin({
  ttl: 10 * 60 * 1000, // 10 分钟
  onlyOnNetworkError: true,
}))

// 之后的成功响应会写入本地；若网络异常，会尝试从本地读取并“恢复”
```

## 选项
- enabled: 是否启用（默认 true）
- keyGenerator(methodName, params): 生成缓存键
- ttl: 过期时间（毫秒，<=0 表示不过期）
- include/exclude: 仅/排除应用于指定方法
- onlyOnNetworkError: 仅网络错误时才兜底（默认 true）

实现细节：优先使用 IndexedDB，降级至 localStorage；通过 error 中间件返回 ResponseData 恢复错误。
