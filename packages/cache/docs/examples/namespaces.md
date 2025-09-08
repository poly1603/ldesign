# 示例：命名空间（Namespace）

本示例展示如何使用命名空间进行模块化管理、批量操作、导出导入与递归清理。

## 基础例子

```ts
import { createCache, createNamespace } from '@ldesign/cache'

const cache = createCache()
const appNs = createNamespace('app')
const userNs = appNs.namespace('user')
const profileNs = userNs.namespace('profile')

await profileNs.set('name', 'Alice')
await userNs.mset([
  { key: 'id', value: 1 },
  { key: 'role', value: 'admin' },
])

console.log(await userNs.get('role')) // 'admin'
```

## 导出/导入（含子命名空间）

```ts
const snapshot = await appNs.export(true)
await appNs.clear(true)
await appNs.import(snapshot)
```

## 与批量 API

```ts
// 批量存在性判断
const results = await appNs.mhas(['k1', 'k2', 'k3'])
// e.g. { k1: true, k2: false, k3: true }

// 批量删除
await appNs.mremove(['k1', 'k3'])
```

## 与 WarmupManager（可选）

```ts
import { WarmupManager } from '@ldesign/cache'

const snapshot = await appNs.export(true)
const warmup = new WarmupManager()
await warmup.importSnapshot?.(snapshot)
```

## 与 SyncManager（可选）

```ts
import { SyncManager } from '@ldesign/cache'

const sync = new SyncManager()
sync.start?.()
// 建议在实现中按命名空间前缀过滤，例如仅广播 'app:' 前缀。
```

## 注意
- 递归清理 clear(true) 会删除子命名空间的数据，谨慎使用；
- 建议对大批量操作采用 mset/mget/mremove/mhas；
- 对大快照导入建议分页处理以避免阻塞。

