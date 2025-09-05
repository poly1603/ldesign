---
title: 示例：插件合集
description: 常见自定义插件的写法与用法示例
---

# 示例：插件合集

几个常见的自定义插件样例与用法。

## 1) 虚拟模块插件

```ts
// plugins/virtual.ts
import type { Plugin } from '@ldesign/launcher'

export default function virtual(mods: Record<string, string>): Plugin {
  const prefix = 'virtual:'
  return {
    name: 'virtual-mods',
    resolveId(id) { if (id.startsWith(prefix)) return id },
    load(id) {
      if (id.startsWith(prefix)) {
        const key = id.slice(prefix.length)
        return mods[key]
      }
    }
  }
}
```

```ts
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'
import virtual from './plugins/virtual'

export default defineConfig({
  plugins: [
    virtual({
      'config': 'export default { api: "/api" }',
      'flags': 'export const __DEV__ = true'
    })
  ]
})
```

## 2) Banner 注入插件（构建阶段）

```ts
// plugins/banner.ts
import type { Plugin } from '@ldesign/launcher'

export default function banner(text: string): Plugin {
  return {
    name: 'banner',
    enforce: 'post',
    generateBundle(_, bundle) {
      for (const [, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk') {
          chunk.code = `/* ${text} */\n` + chunk.code
        }
      }
    }
  }
}
```

## 3) 条件启用插件

```ts
import type { Plugin } from '@ldesign/launcher'

export default function onlyBuild(): Plugin {
  return {
    name: 'only-build',
    apply: 'build' // 只在构建/预览时生效
  }
}
```

## 4) 环境变量注入（transformIndexHtml）

```ts
// plugins/html-env.ts
import type { Plugin } from '@ldesign/launcher'

export default function htmlEnv(vars: Record<string, string>): Plugin {
  return {
    name: 'html-env',
    transformIndexHtml(html) {
      const tags = Object.keys(vars).map((k) => (
        `<meta name="${k}" content="${vars[k]}">`
      )).join('\n')
      return html.replace('</head>', `${tags}\n</head>`)
    }
  }
}
```

## 5) HMR 守护（遇到特定文件全量刷新）

```ts
// plugins/hmr-guard.ts
import type { Plugin } from '@ldesign/launcher'

export default function hmrGuard(): Plugin {
  return {
    name: 'hmr-guard',
    handleHotUpdate(ctx) {
      if (ctx.file.endsWith('.schema.json')) return [] // 触发 full-reload
    }
  }
}
```
