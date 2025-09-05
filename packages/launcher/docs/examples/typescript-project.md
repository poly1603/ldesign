---
title: TypeScript 项目
description: 在纯 TypeScript 项目中使用 @ldesign/launcher 的最小配置
---

# TypeScript 项目

如何把 @ldesign/launcher 用在纯 TS 项目。

## 配置文件

```ts
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  esbuild: {
    target: 'es2020'
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

## 类型检查（可选）

```ts
import typescript from '@ldesign/plugin-typescript'
export default defineConfig({
  plugins: [typescript({ check: true })]
})
```
