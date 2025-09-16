# 缓存预热（WarmupManager）

WarmupManager 用于在应用启动或关键时刻批量填充缓存，降低冷启动延迟，提升首屏与高频读的响应速度。支持从内存快照导入、远程 URL 预热，以及结合批量 API 高效写入。

## 快速上手

```ts
import { WarmupManager, createNamespace } from '@ldesign/cache'

const appNs = createNamespace('app')

// 1) 从现有数据导出快照（含子命名空间）
const snapshot = await appNs.export(true)

// 2) 构建预热管理器并导入快照
const warmup = new WarmupManager({ /* 传入 cache/engine/并发/节流等可选项 */ })
await warmup.importSnapshot?.(snapshot)

// 3) 或者从远程 URL 直接预热（需后端提供 JSON 快照）
// await warmup.prewarmFromUrl?.('/prewarm/app.json')
```

## API 参考

### new WarmupManager(options?)
- options.cache / options.engine：指定缓存实例或引擎（可选）
- options.concurrency：并发写入上限（默认合适值）
- options.chunkSize：分块大小，避免长任务阻塞
- options.transform：导入前对快照条目进行转换（如键/值重写）
- options.filter：过滤需要导入的键（如白名单/黑名单）

> 实际可用项以实现为准，建议在构造时仅配置必要项。

#### 配置项

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| cache | CacheManager | （实现内置） | 指定使用的缓存实例；未提供时按实现默认处理 |
| engine | StorageEngine | （可选） | 覆盖目标引擎；与 cache 二选一或并用（以实现为准） |
| concurrency | number | （实现内置） | 并发写入上限；平衡速度与主线程占用 |
| chunkSize | number | （实现内置） | 分块导入的每批条数；避免长任务阻塞 |
| transform | (entry) => entry | - | 导入前对条目进行键/值转换（如重命名/结构升级） |
| filter | (key, value) => boolean | - | 返回 true 表示导入该条目；可用于白/黑名单 |

### importSnapshot(snapshot)
- 说明：将本地快照批量导入缓存，支持大体量分块与并发控制。
- 返回：`Promise<void>`

### prewarmFromUrl(url, fetchOptions?)
- 说明：从远程 URL 拉取快照并导入。
- 参数：url 为快照 JSON 地址；fetchOptions 透传到 fetch（如 headers）。
- 返回：`Promise<void>`

## 与命名空间配合
- 推荐使用命名空间导出的快照作为预热输入：await ns.export(true)
- 对于多租户/多环境，按命名空间分割快照，分别预热，避免互相污染。

## 进阶示例

### 使用 transform 与 filter 进行导入改写
```ts
const warmup = new WarmupManager({
  transform: (entry) => {
    // entry: { key, value } 或 { namespace, data, children }
    if ('key' in entry) {
      // 单条导入场景：重命名 key 或升级值结构
      return {
        ...entry,
        key: entry.key.replace(/^profile:/, 'user:profile:'),
        value: upgradeSchema(entry.value),
      }
    }
    return entry
  },
  filter: (key, value) => !key.startsWith('temp:'), // 过滤临时键
  concurrency: 6,   // 推荐 4~8
  chunkSize: 500,   // 推荐 200~1000
})

await warmup.importSnapshot(snapshot)
```

### 分批预热与错误处理
```ts
try {
  await warmup.importSnapshot(snapshot)
} catch (e) {
  // 建议结合重试/熔断/降级（参考错误处理模块）
  console.warn('预热失败，进入降级流程', e)
}
```

## 最佳实践
- 批量优先：配合 mset/mremove/mget 等批量 API，减少往返与序列化成本。
- 分块与并发：为大体量快照设置合理 chunkSize 与 concurrency，避免主线程长任务。
- 预热时机：应用冷启动、路由前置、用户态切换前（如租户/用户切换）。
- 转换与过滤：通过 transform 与 filter 仅导入必要数据，降低占用。

