# 自定义存储引擎

本节介绍如何扩展 @ldesign/cache，编写自定义存储引擎以适配你的特殊需求（如加密存储、远程 KV、WebSQL 等）。

## 引擎接口与基类

实现一个存储引擎需要遵循 IStorageEngine 接口。推荐继承 BaseStorageEngine，它已经实现了常用的辅助逻辑（TTL 包装、size 统计、cleanup 框架等）。

```ts path=null start=null
import { BaseStorageEngine } from '@ldesign/cache'
import type { StorageEngine } from '@ldesign/cache'

export class MyCustomEngine extends BaseStorageEngine {
  readonly name: StorageEngine = 'memory' // 注意：名称仅用于识别，非实际内存引擎
  readonly maxSize = 10 * 1024 * 1024

  get available(): boolean {
    // 返回当前环境是否可用
    return true
  }

  async setItem(key: string, value: string, ttl?: number): Promise<void> {
    // 如果需要 TTL，可使用 this.createTTLData(value, ttl)
    // ... 写入逻辑
  }

  async getItem(key: string): Promise<string | null> {
    // ... 读取逻辑，并使用 this.parseTTLData(data) 解析并判断过期
    return null
  }

  async removeItem(key: string): Promise<void> {
    // ... 删除逻辑
  }

  async clear(): Promise<void> {
    // ... 清空逻辑
  }

  async keys(): Promise<string[]> {
    // ... 列出键
    return []
  }

  async length(): Promise<number> {
    // ... 返回项目数
    return 0
  }
}
```

## 工厂注册与使用

引擎可以直接实例化并在 CacheOptions.engines 中传入配置，或自行维护实例。若要让智能策略选择该引擎，可在 `StorageEngineFactory` 基础上扩展（目前内置工厂不支持动态注册，你可以封装 createCache 时注入自定义逻辑）。

```ts path=null start=null
import { createCache } from '@ldesign/cache'

const cache = createCache({
  defaultEngine: 'localStorage',
  // 通过策略选择或在 set 时显式指定 engine
})

// 显式在 set 时使用自定义引擎（示例：你将实例挂在全局或封装在 manager 中）
await cache.set('key', 'value', { engine: 'memory' })
```

## 注意事项

- 尽量实现 updateUsedSize 与 keys，以便统计和清理工作有效运行。
- 若你的引擎支持 TTL，请使用 BaseStorageEngine 提供的 createTTLData/parseTTLData 以保持一致性。
- 引擎命名应与 StorageEngine 枚举之一一致，或在你的业务中通过自定义策略映射。
- SSR/Node 环境下请避免直接使用浏览器 API。
