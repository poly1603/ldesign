---
title: Mock 插件
description: 在开发环境提供本地 API Mock，支持按环境开关与代理回退
---

# Mock 插件

在开发环境下提供 API Mock 能力，可与代理结合使用。

## 使用
```ts path=null start=null
import { defineConfig } from '@ldesign/launcher'
import mock from '@ldesign/plugin-mock'

export default defineConfig({
  plugins: [mock({
    mockPath: './mock',   // mock 文件目录
    enable: true          // 仅在开发环境启用
  })]
})
```

## 目录结构示例
```text path=null start=null
mock/
  users.ts
  health.ts
```

```ts path=null start=null
// mock/users.ts
export default [
  {
    method: 'GET',
    path: '/api/users',
    handler: (req, res) => res.end(JSON.stringify([{ id: 1, name: 'Tom' }]))
  }
]
```

## 与代理结合
- 命中本地 Mock 则直接返回
- 未命中时回退到后端代理（避免影响联调）
