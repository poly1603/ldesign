# 命名空间（Namespace）

命名空间用于对缓存键进行分组隔离与层级管理，通过统一前缀（如 `app:user:profile:key`）实现：
- 降低键冲突：不同模块/租户/用户的键互不干扰；
- 易于批量维护：可按命名空间递归导出、清理、迁移；
- 便于协作：为团队约定统一的键组织规范；
- 便于扩展：结合预热、同步、淘汰策略等能力构建更强的缓存体系。

## 何时使用命名空间
- 大型/中型前端项目，模块较多且缓存项丰富；
- 多租户/多账户/多环境（dev/stage/prod）隔离；
- 需要“分区清理/迁移/导出导入”的场景；
- 需要跨标签页同步、预热等高级能力按域控制。

## 基础用法

```ts
import { createCache, createNamespace } from '@ldesign/cache'

const cache = createCache()
const appNs = createNamespace('app')
const userNs = appNs.namespace('user')

await userNs.set('id', 1)         // 实际键: app:user:id
const id = await userNs.get('id') // 1

await userNs.mset([
  { key: 'role', value: 'admin' },
  { key: 'name', value: 'Alice' },
])

const snapshot = await appNs.export(true) // 包含子命名空间
await appNs.clear(true)                    // 递归清空
await appNs.import(snapshot)               // 递归导入
```

## 组织约定与命名规范
- 分隔符默认 `:`，推荐层级：`app:module:submodule:key`；
- 尽量避免在 key 中再使用分隔符，或建立统一转义/映射；
- 对多租户/多用户：`app:tenant:{tenantId}:user:{userId}:key`；
- 对多环境：`{env}:app:module:key`（或在 createNamespace 时通过选项注入环境前缀）。

## 与批量 API 配合
- 大量操作优先使用 mset/mget/mremove/mhas；
- 导入/导出与预热时，尽量批量读写，减少异步往返。

## 与淘汰策略/多级缓存
- 命名空间与淘汰策略（LRU/LFU/FIFO/...）互不冲突；
- 可按命名空间划分不同引擎/策略/容量；
- 可作为 L1（内存）+ L2（localStorage/IndexedDB）组合的键前缀统一管理。

## 与预热/同步结合
- 预热：将某命名空间快照作为 WarmupManager 预热源，快速冷启动；
- 同步：开启 SyncManager 后，按命名空间前缀广播更新，提升多标签页一致性；
- 注意：高频场景考虑节流与冲突避免（如引入锁/版本号）。

## 迁移与演进
- 重命名命名空间：导出旧 -> 转换 -> 导入新 -> 清空旧；
- 跨环境迁移：结合导出/导入与过滤/转换（如仅迁移白名单键、转换值结构）。

## 常见问题
- 与 SSR：无浏览器存储时使用内存引擎，避免直接访问 DOM；
- 清理风险：`clear(true)` 递归删除，请二次确认；
- 大体量导入：建议分页导入，避免主线程长时间阻塞。

