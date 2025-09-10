# 缓存管理器（CacheManager）

提供内存缓存（LRU + TTL）、命名空间、统计信息，并支持智能预加载与预热。

## 快速上手

```ts
// 基础缓存
engine.cache.set('user:1', { id: 1 }, 60_000)
const user = engine.cache.get('user:1')

// 命名空间
const userCache = engine.cache.namespace('user')
userCache.set('1', { id: 1 })

// 预热（启动时加载常用数据）
await engine.cache.warmup([
  { key: 'config', loader: loadConfig, ttl: 3600_000 },
  { key: 'stats', loader: () => fetch('/stats').then(r => r.json()) },
])

// 智能预加载（按需提前拉取，将来可能会访问的键）
await engine.cache.preload(['user:2', 'user:3'], (key) => fetchUser(key))

// 统计信息
const stats = engine.cache.getStats()
console.log(stats.hitRate, stats.size, stats.memoryUsage)
```

## API

- set(key, value, ttl?)
- get(key)
- has(key)
- delete(key)
- clear()
- size()
- keys()
- values()
- entries()
- namespace(name): CacheManager
- getStats(): { size, hits, misses, evictions, hitRate, memoryUsage, averageItemSize }
- resetStats()
- preload(keys, loader, options?)
- warmup(warmupData)

## 说明

- TTL 单位为毫秒；ttl<=0 视为不过期
- values()/entries() 会在返回前自动清理过期项
- 命名空间返回的管理器方法与主缓存一致，键会自动加上前缀

## 最佳实践

- 给网络数据设置合理 TTL
- 使用命名空间隔离不同业务缓存
- 启动时使用 warmup 预热关键数据，运行中使用 preload 提前准备热点数据
