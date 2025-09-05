---
title: 配置文件详解
description: 如何编写与组织 launcher.config.*，文件优先级、动态配置与类型安全
---

# 配置文件详解

如何编写和组织 launcher.config.* 配置文件。

## 基本结构

```ts
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  server: { port: 3000, open: true },
  build: { outDir: 'dist' }
})
```

## 文件命名与优先级

优先级（高 → 低），当同目录下存在多个配置时仅取第一个匹配：

1. launcher.config.ts
2. launcher.config.mjs
3. launcher.config.js
4. launcher.config.cjs
5. vite.config.ts
6. vite.config.mjs
7. vite.config.js
8. vite.config.cjs

可通过 `--config` 指定任意路径的配置文件。

## 动态配置（按模式/命令）

```ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig(({ command, mode }) => {
  const isBuild = command === 'build'
  const isDev = command === 'serve' || mode === 'development'

  return {
    server: { port: isDev ? 3000 : 4173 },
    build: { sourcemap: !isBuild ? true : mode !== 'production' }
  }
})
```

## 多文件组织

```text
config/
  base.ts
  dev.ts
  prod.ts
launcher.config.ts
```

```ts
// launcher.config.ts
import base from './config/base'
import dev from './config/dev'
import prod from './config/prod'

export default defineConfig(({ mode }) => ({
  ...(mode === 'production' ? prod : dev),
  ...base
}))
```

## 类型安全与提示

```ts
// 享受完整 TS 提示
export default defineConfig({
  server: { port: 3000 },
  build: { outDir: 'dist' }
})
```

更多详见：[配置参考](../config/index.md)。
