# 快速开始

本指南将帮助您快速上手 LDesign Component，在几分钟内搭建一个基本的 Vue 3 应用。

## 环境要求

在开始之前，请确保您的开发环境满足以下要求：

- **Node.js**: >= 18.0.0
- **Vue**: >= 3.3.0
- **TypeScript**: >= 5.0.0 (可选，但推荐)

## 安装

### 使用包管理器安装

::: code-group

```bash [pnpm (推荐)]
pnpm add @ldesign/component
```

```bash [npm]
npm install @ldesign/component
```

```bash [yarn]
yarn add @ldesign/component
```

:::

### CDN 引入

如果您不想使用构建工具，也可以通过 CDN 的方式引入：

```html
<!-- 引入样式 -->
<link rel="stylesheet" href="https://unpkg.com/@ldesign/component/dist/style.css">

<!-- 引入 Vue 3 -->
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>

<!-- 引入 LDesign Component -->
<script src="https://unpkg.com/@ldesign/component/dist/ldesign-component.umd.js"></script>
```

## 完整引入

如果您对打包后的文件大小不是很在乎，那么使用完整导入会更方便。

### 全局注册

```typescript
// main.ts
import { createApp } from 'vue'
import LDesignComponent from '@ldesign/component'
import '@ldesign/component/styles'
import App from './App.vue'

const app = createApp(App)
app.use(LDesignComponent)
app.mount('#app')
```

### 使用组件

```vue
<template>
  <div>
    <l-button type="primary">主要按钮</l-button>
    <l-button type="default">默认按钮</l-button>
  </div>
</template>
```

## 按需引入

LDesign Component 支持基于 ES modules 的 tree shaking，当您使用支持 tree shaking 的打包工具时，可以按需引入组件。

### 手动按需引入

```vue
<template>
  <div>
    <l-button type="primary" @click="handleClick">
      点击我
    </l-button>
    <l-input v-model="inputValue" placeholder="请输入内容" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LButton, LInput } from '@ldesign/component'
// 引入样式
import '@ldesign/component/styles'

const inputValue = ref('')

const handleClick = () => {
  console.log('按钮被点击了！')
}
</script>
```

### 自动按需引入

推荐使用 [unplugin-vue-components](https://github.com/antfu/unplugin-vue-components) 实现自动按需引入：

#### 安装插件

```bash
pnpm add -D unplugin-vue-components
```

#### 配置 Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { LDesignResolver } from '@ldesign/component/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [LDesignResolver()]
    })
  ]
})
```

#### 配置 Webpack

```javascript
// webpack.config.js
const Components = require('unplugin-vue-components/webpack')
const { LDesignResolver } = require('@ldesign/component/resolvers')

module.exports = {
  plugins: [
    Components({
      resolvers: [LDesignResolver()]
    })
  ]
}
```

配置完成后，您可以直接在模板中使用组件，无需手动导入：

```vue
<template>
  <div>
    <!-- 自动导入，无需手动 import -->
    <l-button type="primary">主要按钮</l-button>
    <l-input placeholder="请输入内容" />
  </div>
</template>

<script setup lang="ts">
// 无需手动导入组件
</script>
```

## 样式引入

### 完整样式

如果您使用完整引入，建议引入完整的样式文件：

```typescript
import '@ldesign/component/styles'
```

### 按需样式

如果您使用按需引入，可以只引入需要的组件样式：

```typescript
import '@ldesign/component/styles/button'
import '@ldesign/component/styles/input'
```

### 样式定制

您也可以引入 LESS 源文件进行样式定制：

```less
// 引入基础变量
@import '@ldesign/component/styles/variables.less';

// 修改主题色
:root {
  --ldesign-brand-color: #1890ff; // 自定义主色
}

// 引入组件样式
@import '@ldesign/component/styles/index.less';
```

## TypeScript 支持

LDesign Component 使用 TypeScript 编写，提供完整的类型定义。

### 全局类型

如果您使用全局注册，可以在 `tsconfig.json` 中添加全局类型：

```json
{
  "compilerOptions": {
    "types": ["@ldesign/component/global"]
  }
}
```

### 组件类型

```typescript
import type { ButtonProps, InputProps } from '@ldesign/component'

// 使用组件类型
const buttonProps: ButtonProps = {
  type: 'primary',
  size: 'large',
  disabled: false
}
```

## 开发工具

### Volar 支持

如果您使用 VS Code 和 Volar 插件，可以获得更好的开发体验：

```json
// .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true
}
```

### ESLint 配置

推荐的 ESLint 配置：

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    '@vue/typescript/recommended'
  ],
  rules: {
    // 您的自定义规则
  }
}
```

## 示例项目

我们提供了一些示例项目帮助您快速上手：

- [基础示例](https://github.com/ldesign/ldesign/tree/main/examples/basic)
- [TypeScript 示例](https://github.com/ldesign/ldesign/tree/main/examples/typescript)
- [Vite 示例](https://github.com/ldesign/ldesign/tree/main/examples/vite)

## 下一步

现在您已经成功安装并配置了 LDesign Component，可以：

- 查看 [组件文档](/components/button) 了解各个组件的用法
- 学习 [主题定制](/guide/theming) 来定制您的设计系统
- 了解 [最佳实践](/guide/best-practices) 来优化您的开发体验

如果您在使用过程中遇到问题，请查看 [常见问题](/guide/faq) 或在 [GitHub](https://github.com/ldesign/ldesign/issues) 上提交 issue。
