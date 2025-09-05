# 中间件类型（Middleware Types）

中间件提供请求/响应或任务处理管道，按顺序执行，支持异步。

## Middleware

```ts
interface MiddlewareContext {
  engine: Engine
  [k: string]: any
}

interface Middleware {
  name: string
  handler: (ctx: MiddlewareContext, next: () => Promise<void>) => Promise<void>
  priority?: number
}
```

## MiddlewareManager（片段）

```ts
interface MiddlewareManager {
  use(mw: Middleware): void
  remove(name: string): boolean
  get(name: string): Middleware | undefined
  getAll(): Middleware[]
  run<T = any>(ctx: MiddlewareContext): Promise<void>
}
```

更多：src/types/middleware.ts、src/middleware/middleware-manager.ts。
