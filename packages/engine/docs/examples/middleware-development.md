# 中间件开发示例

展示如何编写中间件（洋葱模型），实现日志与鉴权。

```ts
import { createEngine, creators } from '@ldesign/engine'

const logging = creators.middleware('logging', async (ctx, next) => {
  console.time('request')
  await next()
  console.timeEnd('request')
}, 10)

const auth = creators.middleware('auth', async (ctx, next) => {
  if (!ctx.engine.state.get('user')) throw new Error('Unauthenticated')
  await next()
}, 5)

const engine = createEngine({ middleware: [logging, auth] })

// 在业务流程中触发中间件执行
await engine.middleware.run({ engine })
```

要点：
- priority 数值越大越先执行
- 中间件宜职责单一，可组合
