# 跨标签页同步（SyncManager）

SyncManager 用于在同源的不同标签页/窗口之间同步缓存变更，确保多页面数据一致性。支持 BroadcastChannel 与 localStorage 事件两种模式，自动降级。

## 快速上手

```ts
import { SyncManager, createNamespace } from '@ldesign/cache'

const appNs = createNamespace('app')

const sync = new SyncManager({
  channel: 'cache-sync',     // 同步通道名
  mode: 'auto',              // 'auto' | 'bc' | 'ls'，默认自动选择
  keyFilter: (key) => key.startsWith('app:'), // 可选：仅同步特定前缀
})

sync.start?.()

// 常规读写
await appNs.set('k', 'v')
// 其他标签页会接收到变更通知并更新本地缓存
```

## API 参考

### new SyncManager(options?)
- options.channel：通道名称，使用 BroadcastChannel 或作为 localStorage key 的前缀
- options.mode：'auto'（默认）| 'bc'（强制 BroadcastChannel）| 'ls'（强制 localStorage）
- options.keyFilter：(fullKey: string) => boolean，用于过滤同步的键
- options.debounce：去抖时间，用于高频写场景降噪
- options.throttle：节流时间，限制广播频率
- options.serialize/deserialize：自定义序列化（localStorage 模式时使用）

> 实际可用项以实现为准。

#### 配置项

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| channel | string | 'cache-sync'（建议值） | 同步通道名；多应用并存时请自定义 |
| mode | 'auto' | 'auto' | 同步模式：自动选择或强制 'bc'/'ls' |
| keyFilter | (fullKey: string) => boolean | - | 仅同步满足条件的键（推荐按命名空间前缀过滤） |
| debounce | number(ms) | 0 | 去抖时间；高频写场景降噪 |
| throttle | number(ms) | 0 | 节流时间；限制广播频率 |
| serialize | (payload: any) => string | JSON.stringify | 本地存储模式序列化函数 |
| deserialize | (raw: string) => any | JSON.parse | 本地存储模式反序列化函数 |

### start()
- 开启同步监听与广播

### stop()
- 停止同步

### on(event, handler)
- 订阅事件：如 'change'、'error' 等（以实现为准）
- 变更事件载荷建议包含：{ key, newValue, oldValue, namespace?, originTabId? }

## 与命名空间配合
- 推荐在 keyFilter 中按命名空间前缀过滤（如 `app:`），仅广播必要的键
- 子命名空间变更会自然包含在父级前缀内（如 `app:user:` / `app:user:profile:`）

## 进阶示例

### 选择合适的去抖/节流参数
```ts
const sync = new SyncManager({
  keyFilter: (k) => k.startsWith('app:'),
  debounce: 80, // 高频写入建议 50~100ms
  throttle: 120, // 大批量广播建议 50~200ms
})

sync.start()
```

### 事件负载示例（以实现为准）
```ts
sync.on('change', (payload) => {
  // { key, newValue, oldValue, namespace, originTabId }
  if (payload.namespace?.startsWith('app:user:')) {
    // 针对用户域的变更处理
  }
})
```

## 最佳实践
- 高频写入：启用 debounce/throttle，避免广播风暴
- 冲突避免：可引入简易锁或版本号，避免多源写冲突
- SSR/Node 环境：避免启用浏览器通道，或使用内存替代实现

