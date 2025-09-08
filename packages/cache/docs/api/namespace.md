# 命名空间（Namespace）

命名空间用于对键进行分组隔离（如 app:user:profile），便于按模块批量管理、清理与迁移。

## 快速上手

```ts
import { createCache, createNamespace } from '@ldesign/cache'

const cache = createCache()
const appNs = createNamespace('app', { defaultEngine: 'localStorage' })

// 子命名空间
const userNs = appNs.namespace('user')
const profileNs = userNs.namespace('profile')

// 写入/读取（自动加前缀）
await profileNs.set('name', 'Alice')        // 实际键: app:user:profile:name
const name = await profileNs.get('name')

// 批量操作
await userNs.mset([
  { key: 'id', value: 1 },
  { key: 'role', value: 'admin' },
])

// 清理
await userNs.clear(true) // 递归清空 user 与其子命名空间
```

## API 参考

### createNamespace(name, options?)
- 入参：命名空间名、可选 CacheOptions（将作为此命名空间的默认选项）
- 返回：`CacheNamespace`

### CacheNamespace

#### set/get/remove/clear/has/keys
与 CacheManager 相同，但键会自动附加命名空间前缀。

```ts
await appNs.set('global', 1)               // app:global
const keys = await appNs.keys()            // ['global', ...]（去除前缀后的键）
```

#### mset/mget/mremove/mhas
与 CacheManager 的批量操作一致，键为命名空间内的相对键。

```ts
await appNs.mset([
  { key: 'k1', value: 'v1' },
  { key: 'k2', value: 'v2' },
])
```

#### namespace(childName, options?)
创建子命名空间。

```ts
const ns = appNs.namespace('settings')     // app:settings
```

#### export(includeChildren = true)
导出命名空间数据与（可选）子命名空间数据。

```ts
const snapshot = await appNs.export(true)
// {
//   namespace: 'app',
//   data: { key: any, ... },
//   children?: {
//     sub: { namespace: 'app:sub', data: {...}, children?: ... }
//   }
// }
```

#### import(snapshot)
导入数据。支持 children 递归导入。

```ts
await appNs.import({
  data: { key1: 'value1' },
  children: {
    user: { data: { id: 1 } },
  },
})
```

#### getStats(includeChildren = false)
获取命名空间统计信息。

```ts
const stats = await appNs.getStats(true)
// { namespace, stats, children? }
```

## 最佳实践
- 采用固定分隔符（默认 :）并约定层级：app:module:sub:key
- 业务模块创建独立命名空间，降低键冲突与清理复杂度
- 导出/导入用于跨环境迁移与“冷启动预热”

## 快照结构说明（Snapshot Schema）
命名空间导出默认包含当前命名空间的数据与可选的子命名空间树。

```json
{
  "namespace": "app",
  "data": {
    "k1": "v1",
    "k2": { "nested": true }
  },
  "children": {
    "user": {
      "namespace": "app:user",
      "data": { "id": 1 },
      "children": {
        "profile": {
          "namespace": "app:user:profile",
          "data": { "name": "Alice" }
        }
      }
    }
  }
}
```

> 注意：具体字段可能因实现演进而调整，请以实际导出结果为准。

## 与 WarmupManager 搭配（预热）
当你希望在应用启动时快速“冷启动预热”，可以将命名空间快照作为预热源：

```ts
import { WarmupManager } from '@ldesign/cache'

const snapshot = await appNs.export(true)
const warmup = new WarmupManager({ /* 传入你的 cache/engine 等配置 */ })
await warmup.importSnapshot?.(snapshot)
// 或者，如果支持从 URL 预热：await warmup.prewarmFromUrl?.('/prewarm/app.json')
```

- 建议结合批量 API（mset/mget/mremove）进行大体量数据的写入/读取。
- 对于巨量快照，考虑分页导入（分批 import）以避免阻塞主线程。

## 与 SyncManager 搭配（跨标签页同步）
开启跨标签页同步后，命名空间内的 set/remove/mset/mremove 等操作会以命名空间前缀为粒度被广播，提升多页一致性：

```ts
import { SyncManager } from '@ldesign/cache'

const sync = new SyncManager({ /* BroadcastChannel 或 localStorage 模式配置 */ })
sync.start?.()
// 建议在实现侧对命名空间前缀进行过滤，只同步相关前缀（如 'app:'）。
```

- 在高频写场景启用节流/去抖，避免广播风暴。
- 对关键写操作可配合错误处理（重试、熔断、降级）与幂等等策略。

## 常见问题（FAQ）与注意事项
- 分隔符：默认使用 ':'；如需自定义，请确保不会与业务键值冲突。
- 重命名：若需要重命名命名空间，推荐导出旧空间 -> 转换 -> 导入新空间，再清空旧空间。
- 深度清空：clear(true) 会递归清理子命名空间，谨慎操作。
- 批量优先：成批写/删/查优先使用 mset/mremove/mget，可显著减少开销。
- 与淘汰策略：命名空间仅影响键前缀与管理粒度，不改变淘汰策略（LRU/LFU/...）的工作方式。
- SSR/Node：确保在无浏览器存储环境下有相容引擎（如内存引擎）并避免直接依赖 DOM API。

