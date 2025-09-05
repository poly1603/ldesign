---
title: Monorepo 项目
description: 在 pnpm/yarn workspaces 下的多包项目结构与配置
---

# Monorepo 项目

在 pnpm/yarn workspace 下的多包项目结构与配置。

## 目录结构示例（pnpm）

```
repo/
├── packages/
│   ├── app/           # 应用
│   ├── ui/            # 组件库
│   └── utils/         # 工具库
├── pnpm-workspace.yaml
└── package.json
```

## 根目录配置

```json
// pnpm-workspace.yaml
packages:
  - "packages/*"
```

```json
// package.json
{
  "private": true,
  "workspaces": ["packages/*"]
}
```

## 应用侧配置（packages/app）

```ts
// packages/app/launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  resolve: {
    alias: {
      '@ui': '../../packages/ui/src',
      '@utils': '../../packages/utils/src'
    },
    dedupe: ['vue', 'react']
  },
  optimizeDeps: {
    include: ['@ui', '@utils']
  }
})
```

## 本地开发

- 在 repo 根执行 `pnpm install`
- 进入 packages/app 执行 `pnpm dev`
- 对 ui/utils 改动将被增量编译（建议开启 HMR 或使用 `--debug` 排查）

## 注意事项

- 依赖去重（dedupe）以避免多个框架副本
- 使用路径别名直连源码（或将包构建输出供 app 引用）
- 适度配置 optimizeDeps，提高冷启动与热更新性能
