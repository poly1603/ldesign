---
title: 自定义插件
description: 在项目中编写并注册自定义插件的最小范例
---

# 自定义插件

如何在项目中编写并注册自定义插件。

```ts
// plugins/my-plugin.ts
import type { Plugin } from '@ldesign/launcher'

export default function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    transform(code, id) {
      if (id.endsWith('.demo')) return code.replace(/__X__/g, 'ok')
    }
  }
}
```

```ts
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'
import myPlugin from './plugins/my-plugin'

export default defineConfig({
  plugins: [myPlugin()]
})
```
