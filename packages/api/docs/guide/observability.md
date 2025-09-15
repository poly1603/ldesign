# 可观测性（日志 / 性能）

使用 Logging 插件输出请求与响应日志、计算耗时并注入请求 ID。

```ts
import { createLoggingPlugin } from '@ldesign/api'
await api.use(createLoggingPlugin({ logLevel: 'debug' }))
```

结合中间件还能统一上报错误、注入埋点 ID、链路追踪信息等。
