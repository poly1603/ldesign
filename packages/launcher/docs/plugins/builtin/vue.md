---
title: Vue 插件
description: 为 Vue 3 提供开箱即用的 SFC 支持、HMR 与常见选项
---

# Vue 插件

内置对 Vue 3 的支持（基于 @vitejs/plugin-vue 能力）。

## 安装
```bash
# 任选其一
pnpm add -D @ldesign/plugin-vue
npm i -D @ldesign/plugin-vue
yarn add -D @ldesign/plugin-vue
```

## 使用
```ts path=null start=null
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'
import vue from '@ldesign/plugin-vue'

export default defineConfig({
  plugins: [vue({
    // 传递给底层 Vue 插件的选项
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith('ion-')
      }
    }
  })]
})
```

## 常用能力
- .vue 单文件组件编译
- HMR 热更新
- <script lang="ts"> TypeScript 支持
- 自定义元素识别（isCustomElement）

## 调试与排查
- 若 HMR 不生效，检查是否存在自定义构建步骤引入的缓存/代理拦截
- 若类型提示异常，确保编辑器启用 Vue 官方扩展并指向正确的 tsconfig
