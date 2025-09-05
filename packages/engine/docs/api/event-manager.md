# 事件管理器（EventManager）

事件系统提供发布/订阅功能，支持优先级、一致性清理、一次性监听等。

## 快速上手

```ts
// 监听
engine.events.on('user:login', (user) => {
  console.log('登录', user)
}, 5) // 优先级 5

// 一次性监听
engine.events.once('app:ready', () => {
  console.log('首次就绪')
})

// 触发
engine.events.emit('user:login', { id: 1, name: 'Alice' })

// 取消
const off = engine.events.on('task:done', () => {})
off()
```

## API

- on(event, handler, priority?)
- once(event, handler, priority?)
- off(event, handler?)
- emit(event, ...args)
- listenerCount(event)
- eventNames()
- listeners(event)
- removeAllListeners(event?)
- prependListener(event, handler, priority?)

## 最佳实践

- 使用命名空间：`user:*`、`app:*`
- 合理设置优先级，避免性能问题
- 在组件卸载时清理监听器
