# 事件管理器（EventManager）

事件系统提供发布/订阅功能，支持优先级、一致性清理、一次性监听等，并提供命名空间、批量监听、事件管道、条件监听、防抖与节流等增强能力。

## 快速上手

```ts
// 监听（支持优先级）
engine.events.on('user:login', (user) => {
  console.log('登录', user)
}, 5)

// 一次性监听
engine.events.once('app:ready', () => {
  console.log('首次就绪')
})

// 触发
engine.events.emit('user:login', { id: 1, name: 'Alice' })

// 取消
const off = engine.events.on('task:done', () => {})
off()

// 命名空间
const userNS = engine.events.namespace('user')
userNS.on('login', (u) => console.log('ns login', u))
userNS.emit('login', { id: 1 })

// 批量监听
engine.events.addListeners([
  { event: 'a', handler: () => {} },
  { event: 'b', handler: () => {}, options: { once: true, priority: 10 } },
])

// 事件管道（可选转换）
engine.events.pipe('source', 'target', (d) => ({ wrapped: d }))

// 条件监听
engine.events.onWhen('order:paid', (d) => d.amount > 0, (d) => {
  console.log('有效付款', d)
})

// 防抖与节流
const debouncer = engine.events.debounce('search', 200)
const throttler = engine.events.throttle('scroll', 100)

debouncer.emit('hello')
throttler.emit({ y: 100 })
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
- namespace(ns): EventNamespace
- addListeners(listeners)
- pipe(sourceEvent, targetEvent, transform?)
- onWhen(event, condition, handler, options?)
- debounce(event, delay?): EventDebouncer
- throttle(event, interval?): EventThrottler

## 最佳实践

- 使用命名空间：`user:*`、`app:*` 或使用 `engine.events.namespace('user')`
- 合理设置优先级，避免性能问题
- 在组件卸载时清理监听器
