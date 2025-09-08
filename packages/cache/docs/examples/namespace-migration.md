# 示例：命名空间迁移

本示例展示如何将旧命名空间的数据迁移到新命名空间（包括键名转换与筛选）。

## 迁移思路
- 通过旧空间导出快照；
- 对快照进行转换（重命名键、过滤无用项、重构值结构）；
- 导入到新空间；
- 验证后清空旧空间。

## 迁移脚本示例

```ts
import { createNamespace } from '@ldesign/cache'

const oldNs = createNamespace('app:v1')
const newNs = createNamespace('app:v2')

// 1) 导出旧空间（含子命名空间）
const snapshot = await oldNs.export(true)

// 2) 转换：示例对 keys 进行重命名与过滤
function transformSnapshot(node) {
  const out = { namespace: node.namespace.replace('app:v1', 'app:v2'), data: {}, children: {} as any }

  // 键重命名/过滤规则示例
  for (const [k, v] of Object.entries(node.data || {})) {
    if (k.startsWith('temp:')) continue // 过滤临时键
    const newKey = k.replace(/^profile:/, 'user:profile:')
    out.data[newKey] = v
  }

  // 子树转换
  for (const [child, snap] of Object.entries(node.children || {})) {
    out.children[child] = transformSnapshot(snap as any)
  }
  return out
}

const transformed = transformSnapshot(snapshot)

// 3) 导入到新空间
await newNs.import(transformed)

// 4) 验证（示例）
const ok = await newNs.has('user:profile:name')
console.log('migrated?', ok)

// 5) 清理旧空间（谨慎）
// await oldNs.clear(true)
```

## 提示
- 先在测试环境验证脚本；
- 对大体量数据建议分批导入（分页转换后导入）；
- 如果需要回滚策略，建议先备份快照到远端。

