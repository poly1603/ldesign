# 请求队列与限流

通过队列限制并发、控制排队与优先级，避免瞬时风暴。

## 全局启用
```ts
const api = createApiEngine({
  queue: { enabled: true, concurrency: 5, maxQueue: 100 },
})
```

## 方法级/调用级覆盖
```ts
api.register('searchUsers', {
  name: 'searchUsers',
  config: { method: 'GET', url: '/users/search' },
  queue: { enabled: true, concurrency: 2 },
})

await api.call('searchUsers', { q: 'tom' }, { queue: { enabled: true }, priority: 10 })
```

优先级：数值越大越先执行；同优先级按先入先出。
