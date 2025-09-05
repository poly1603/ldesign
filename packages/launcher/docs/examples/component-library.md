---
title: 组件库开发
description: 使用库模式构建、输出类型声明并发布到 npm
---

# 组件库开发

如何基于 launcher 搭建并发布组件库。

## 配置

```ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  launcher: {
    lib: {
      entry: './src/index.ts',
      name: 'MyLib',
      formats: ['es', 'cjs', 'umd'],
      dts: { outDir: 'dist/types' }
    }
  },
  build: {
    sourcemap: true,
    minify: 'esbuild'
  }
})
```

## 发布

- 更新 package.json 的 `name`、`version`、`main/module/types`
- 执行 `pnpm publish --access public`
- 推荐在 CI 中构建并发布（确保仅打 tag 时执行）
