# 缓存管理器（CacheManager）

提供多级缓存、TTL、命名空间和策略控制。

## 快速上手

```ts
// 基础缓存
engine.cache.set('user:1', { id: 1 }, 60_000)
const user = engine.cache.get('user:1')

// 命名空间
const userCache = engine.cache.namespace('user')
userCache.set('1', { id: 1 })
```

## API

- set(key, value, ttl?)
- get(key)
- has(key)
- remove(key)
- clear()
- keys()
- namespace(name)
- setStrategy(name, options)

## 最佳实践

- 给网络数据设置合理 TTL
- 使用命名空间隔离不同业务缓存
