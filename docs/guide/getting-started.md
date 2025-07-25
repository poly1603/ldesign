# 快速开始

本节将帮助你快速上手 LDesign。

## 安装

### 使用包管理器

我们推荐使用 pnpm 作为包管理器：

```bash
# pnpm (推荐)
pnpm add @ldesign/core

# npm
npm install @ldesign/core

# yarn
yarn add @ldesign/core
```

### CDN 引入

你也可以通过 CDN 的方式引入 LDesign：

```html
<!-- 引入样式 -->
<link rel="stylesheet" href="https://unpkg.com/@ldesign/core/dist/style.css">

<!-- 引入组件库 -->
<script src="https://unpkg.com/@ldesign/core/dist/ldesign.umd.js"></script>
```

## 完整引入

在 main.ts 中写入以下内容：

```typescript
import { createApp } from 'vue'
import LDesign from '@ldesign/core'
import '@ldesign/core/dist/style.css'
import App from './App.vue'

const app = createApp(App)
app.use(LDesign)
app.mount('#app')
```

以上代码便完成了 LDesign 的引入。需要注意的是，样式文件需要单独引入。

## 按需引入

LDesign 支持基于 ES modules 的 tree shaking，可以只引入需要的组件：

```typescript
import { createApp } from 'vue'
import { Button, Input } from '@ldesign/core'
import App from './App.vue'

const app = createApp(App)
app.use(Button).use(Input)
app.mount('#app')
```

### 自动按需引入

推荐使用 [unplugin-vue-components](https://github.com/antfu/unplugin-vue-components) 实现自动按需引入：

```bash
pnpm add -D unplugin-vue-components
```

然后在 `vite.config.ts` 中配置：

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { LDesignResolver } from '@ldesign/resolver'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [LDesignResolver()]
    })
  ]
})
```

## 全局配置

在引入 LDesign 时，可以传入一个全局配置对象：

```typescript
import { createApp } from 'vue'
import LDesign from '@ldesign/core'
import App from './App.vue'

const app = createApp(App)
app.use(LDesign, {
  // 全局配置
  size: 'large', // 组件默认尺寸
  zIndex: 3000, // 弹出层的初始 z-index
  locale: 'zh-CN' // 语言设置
})
app.mount('#app')
```

## 开始使用

现在你可以在组件中使用 LDesign 了：

```vue
<template>
  <div>
    <l-button type="primary">
      主要按钮
    </l-button>
    <l-button type="success">
      成功按钮
    </l-button>
    <l-button type="warning">
      警告按钮
    </l-button>
    <l-button type="danger">
      危险按钮
    </l-button>
  </div>
</template>
```

## TypeScript 支持

LDesign 完全使用 TypeScript 编写，提供了完整的类型定义。

如果你使用 Volar，可以在 `tsconfig.json` 中配置类型声明：

```json
{
  "compilerOptions": {
    "types": ["@ldesign/core/global"]
  }
}
```

## 开发工具

### Vetur 支持

如果你使用 Vetur，可以安装 `@ldesign/vetur` 来获得组件的智能提示：

```bash
pnpm add -D @ldesign/vetur
```

### Volar 支持

如果你使用 Volar，可以安装 `@ldesign/volar` 来获得更好的开发体验：

```bash
pnpm add -D @ldesign/volar
```

## 下一步

- 查看 [组件总览](/components/overview) 了解所有可用组件
- 阅读 [主题定制](/guide/theming) 学习如何自定义主题
- 探索 [工具集](/utils/overview) 了解实用工具函数
