---
title: TypeScript 插件
description: 提供类型检查、tsconfig 定制与构建集成
---

# TypeScript 插件

提供 TS 能力增强（类型检查等），在开发与构建阶段进行更严格的校验。

## 安装
```bash
pnpm add -D @ldesign/plugin-typescript
```

## 使用
```ts path=null start=null
import { defineConfig } from '@ldesign/launcher'
import typescript from '@ldesign/plugin-typescript'

export default defineConfig({
  plugins: [
    typescript({
      check: true,                          // 启用类型检查
      tsconfigPath: './tsconfig.build.json',// 指定 tsconfig
      include: ['src/**/*.ts', 'src/**/*.vue']
    })
  ]
})
```

## 选项（常见）
- check：boolean，是否在 dev/build 中执行类型检查
- tsconfigPath：string，自定义 tsconfig 路径
- include / exclude：文件匹配范围

## 故障排查
- 若检查缓慢，排查是否包含了体积很大的目录（如生成代码目录），必要时用 `exclude` 排除
