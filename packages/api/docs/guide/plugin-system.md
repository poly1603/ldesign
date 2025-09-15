# 插件系统

@ldesign/api 通过插件系统实现 API 的模块化与可扩展。

## 基本结构

```ts
import type { ApiPlugin } from '@ldesign/api'

export const myPlugin: ApiPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  apis: {
    'project.list': {
      name: 'project.list',
      config: { method: 'GET', url: '/projects' },
      cache: { enabled: true, ttl: 120000 },
    },
  },
  install(engine) {
    // 可在此进行注册/包装/日志/埋点等
  },
}
```

## 依赖声明

```ts
const plugin: ApiPlugin = { name: 'a', dependencies: ['system-apis'] }
```

