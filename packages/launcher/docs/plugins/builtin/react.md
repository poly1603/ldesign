---
title: React 插件
description: 提供 React JSX、Fast Refresh 与常见 Babel 配置能力
---

# React 插件

内置对 React 的支持（与 @vitejs/plugin-react 生态兼容）。

## 安装
```bash
pnpm add -D @ldesign/plugin-react
# 或 npm / yarn 同理
```

## 使用
```ts path=null start=null
import { defineConfig } from '@ldesign/launcher'
import react from '@ldesign/plugin-react'

export default defineConfig({
  plugins: [react({
    // 透传常见编译选项（如需要）
    // babel: { plugins: [] }
  })]
})
```

## 常用能力
- JSX/TSX 支持
- Fast Refresh 热更新
- 常见 Babel 生态兼容

## 提示
- 某些大型项目可考虑减少 Babel 插件数量以提升增量编译速度
