# 批量操作（Batch Operations）

批量 API 能在高并发/大量键场景下显著提升吞吐与稳定性。

## 能力概览
- mset：并行写入多个键
- mget：并行读取多个键
- mremove：并行删除多个键
- mhas：并行判断多个键是否存在

所有批量操作默认在内部进行并发控制和错误隔离，即单个键失败不会影响其他键。

## 快速上手

```ts
import { createCache } from '@ldesign/cache'

const cache = createCache({ defaultEngine: 'memory' })

// 批量设置
await cache.mset([
  { key: 'user:1', value: { id: 1, name: 'Alice' } },
  { key: 'user:2', value: { id: 2, name: 'Bob' } },
  { key: 'user:3', value: { id: 3, name: 'Charlie' }, options: { ttl: 60_000 } },
])

// 批量获取
const users = await cache.mget(['user:1', 'user:2', 'user:3', 'user:404'])
// users => { 'user:1': {...}, 'user:2': {...}, 'user:3': {...}, 'user:404': null }

// 批量存在性
const exists = await cache.mhas(['user:1', 'user:404'])
// exists => { 'user:1': true, 'user:404': false }

// 批量删除
const removed = await cache.mremove(['user:2', 'user:404'])
// [{ key: 'user:2', success: true }, { key: 'user:404', success: true }]
```

## API 参考

### mset(items)
- 入参：`Array<{ key: string; value: any; options?: SetOptions }>`
- 返回：`Promise<Array<{ key: string; success: boolean; error?: Error }>>`
- 说明：每个键独立执行 set；失败项会在结果中返回 error。

```ts
await cache.mset([
  { key: 'k1', value: 'v1' },
  { key: 'k2', value: 123, options: { ttl: 5_000 } },
])
```

### mget(keys)
- 入参：`string[]`
- 返回：`Promise<Record<string, any | null>>`
- 说明：若键不存在或过期，值为 `null`。

```ts
const data = await cache.mget(['a', 'b'])
// { a: null, b: { ... } }
```

### mremove(keys)
- 入参：`string[]`
- 返回：`Promise<Array<{ key: string; success: boolean; error?: Error }>>`
- 说明：删除不存在的键视为成功（幂等）。

```ts
const result = await cache.mremove(['a', 'b'])
// [ { key: 'a', success: true }, { key: 'b', success: true } ]
```

### mhas(keys)
- 入参：`string[]`
- 返回：`Promise<Record<string, boolean>>`

```ts
const exists = await cache.mhas(['a', 'b'])
// { a: false, b: true }
```

## 最佳实践
- 批量包大小建议 50~200 项（结合吞吐与单次耗时权衡）
- 小心批量写入 TTL：确保业务允许统一 TTL 或为每项单独传入
- 将 mget/mset 用于列表页与聚合接口缓存，可显著降低后端压力

