# 安装

本指南将帮助你在不同环境下安装和配置 LDesign Router。

## 📦 包管理器安装

### 推荐：使用 pnpm

```bash
pnpm add @ldesign/router
```

::: tip 为什么推荐 pnpm？

- **更快的安装速度** - 比 npm 快 2-3 倍
- **更少的磁盘空间** - 通过硬链接共享依赖
- **更好的依赖管理** - 严格的依赖解析
- **Monorepo 友好** - 原生支持工作空间 :::

### 使用 npm

```bash
npm install @ldesign/router
```

### 使用 yarn

```bash
yarn add @ldesign/router
```

## 🌐 CDN 引入

如果你不使用构建工具，可以通过 CDN 直接引入：

### 最新版本

```html
<!-- 开发版本 -->
<script src="https://unpkg.com/@ldesign/router@latest/dist/index.js"></script>

<!-- 生产版本（压缩） -->
<script src="https://unpkg.com/@ldesign/router@latest/dist/index.min.js"></script>
```

### 指定版本

```html
<!-- 指定版本号，避免意外更新 -->
<script src="https://unpkg.com/@ldesign/router@1.0.0/dist/index.min.js"></script>
```

### ES 模块

```html
<script type="module">
  import {
    createRouter,
    createWebHistory,
  } from 'https://unpkg.com/@ldesign/router@latest/dist/index.esm.js'

  // 你的代码...
</script>
```

## 🔧 环境要求

### Node.js 版本

- **Node.js 16+** （推荐 18+）
- **npm 7+** 或 **pnpm 7+** 或 **yarn 1.22+**

### Vue 版本

- **Vue 3.2+** （必需）
- **TypeScript 4.5+** （可选，但强烈推荐）

### 浏览器支持

| 浏览器  | 版本 | 说明        |
| ------- | ---- | ----------- |
| Chrome  | 88+  | ✅ 完全支持 |
| Firefox | 78+  | ✅ 完全支持 |
| Safari  | 14+  | ✅ 完全支持 |
| Edge    | 88+  | ✅ 完全支持 |
| IE      | ❌   | 不支持      |

::: warning 关于 IE 支持 LDesign Router 使用了现代 JavaScript 特性（如 Proxy、ES6 模块等），不支持
Internet Explorer。如果需要支持 IE，请考虑使用 Vue Router 4。 :::

## ⚙️ 构建工具配置

### Vite

LDesign Router 与 Vite 完美兼容，无需额外配置：

```typescript
import vue from '@vitejs/plugin-vue'
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  // LDesign Router 开箱即用
})
```

### Webpack

如果使用 Webpack，确保配置了 Vue 3 支持：

```javascript
// webpack.config.js
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
      },
    ],
  },
  plugins: [new VueLoaderPlugin()],
}
```

### Rollup

```javascript
import typescript from '@rollup/plugin-typescript'
// rollup.config.js
import vue from 'rollup-plugin-vue'

export default {
  plugins: [vue(), typescript()],
}
```

## 🎯 TypeScript 配置

### tsconfig.json

为了获得最佳的 TypeScript 体验，推荐以下配置：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

### 类型声明

LDesign Router 提供了完整的 TypeScript 类型定义：

```typescript
// 全局类型增强
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $router: Router
    $route: RouteLocationNormalized
  }
}
```

## 🚀 快速验证

安装完成后，创建一个简单的示例来验证安装：

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

// 创建路由
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./views/Home.vue'),
    },
  ],
})

// 创建应用
const app = createApp(App)
app.use(router)
app.mount('#app')
```

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <RouterView />
  </div>
</template>
```

```vue
<!-- views/Home.vue -->
<template>
  <div>
    <h1>🎉 LDesign Router 安装成功！</h1>
    <p>当前路径：{{ $route.path }}</p>
  </div>
</template>
```

如果页面正常显示，说明安装成功！

## 🔍 故障排除

### 常见问题

#### 1. 模块解析错误

```
Cannot resolve module '@ldesign/router'
```

**解决方案：**

- 确认已正确安装：`pnpm list @ldesign/router`
- 重新安装：`pnpm install`
- 清除缓存：`pnpm store prune`

#### 2. TypeScript 类型错误

```
Cannot find module '@ldesign/router' or its corresponding type declarations
```

**解决方案：**

- 确认 TypeScript 版本 ≥ 4.5
- 重新安装类型定义：`pnpm add -D typescript`
- 检查 `tsconfig.json` 配置

#### 3. Vue 版本不兼容

```
Vue packages version mismatch
```

**解决方案：**

- 确认 Vue 版本 ≥ 3.2：`pnpm list vue`
- 升级 Vue：`pnpm add vue@latest`
- 确保所有 Vue 相关包版本一致

#### 4. 构建错误

```
Failed to resolve import "@ldesign/router"
```

**解决方案：**

- 检查构建工具配置
- 确认支持 ES 模块
- 尝试重新构建：`pnpm build`

### 获取帮助

如果遇到其他问题，可以通过以下方式获取帮助：

- 📖 [查看文档](/guide/)
- 🐛 [提交 Issue](https://github.com/ldesign/ldesign/issues)
- 💬 [GitHub 讨论](https://github.com/ldesign/ldesign/discussions)
- 📧 [邮件支持](mailto:support@ldesign.dev)

## 🎯 下一步

安装完成后，建议按以下顺序学习：

1. **[快速开始](/guide/getting-started)** - 5 分钟上手指南
2. **[基础概念](/guide/concepts)** - 理解核心概念
3. **[路由配置](/guide/routes)** - 学习路由配置
4. **[导航](/guide/navigation)** - 掌握页面导航

---

<div style="text-align: center; margin: 2rem 0;">
  <a href="/guide/getting-started" style="display: inline-block; padding: 12px 24px; background: #1890ff; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
    🚀 开始使用
  </a>
</div>
