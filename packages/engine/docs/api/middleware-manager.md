# 中间件管理器（MiddlewareManager）

中间件以洋葱模型（onion model）执行，适合记录日志、鉴权、埋点等横切关注点。

## 快速上手

```ts
import { createEngine } from '@ldesign/engine'

const engine = createEngine()

const auth = {
  name: 'auth',
  handler: async (ctx, next) => {
    if (!ctx.engine.state.get('user')) {
      throw new Error('Unauthenticated')
    }
    await next()
  },
}

const logging = {
  name: 'logging',
  handler: async (ctx, next) => {
    console.time('mw')
    await next()
    console.timeEnd('mw')
  },
}

engine.middleware.use(logging)
engine.middleware.use(auth)

await engine.middleware.run({ engine })
```

## API

- use(mw)
- remove(name)
- get(name)
- getAll()
- run(ctx)

## 最佳实践

- 对异常路径尽早失败（fail-fast）
- 将性能敏感的中间件置于靠前位置，减少不必要计算
- 在错误处理中间件中统一兜底

