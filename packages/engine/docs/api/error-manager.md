# 错误管理器（ErrorManager）

统一捕获、记录与恢复错误，支持全局处理与定制处理器。

## 快速上手

```ts
// 捕获错误
engine.errors.captureError(new Error('Oops'))

// 自定义处理器
engine.errors.setErrorHandler((err) => {
  engine.logger.error('Global error:', err)
})

// 获取与清理
const list = engine.errors.getErrors()
engine.errors.clearErrors()
```

## API

- captureError(error, component?, info?)
- onError(callback)
- setErrorHandler(handler)
- getErrors()
- getErrorsByType(type)
- clearErrors()
- recoverFromError(id)

## 最佳实践

- 在生命周期钩子与中间件中调用 captureError
- 配合集成通知系统给用户友好的反馈
- 在生产环境中上报错误
