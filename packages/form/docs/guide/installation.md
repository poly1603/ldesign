# 安装

本章节将指导你如何安装和配置 @ldesign/form。

## 环境要求

在开始之前，请确保你的开发环境满足以下要求：

- **Node.js** >= 16.0.0
- **Vue** >= 3.4.0
- **TypeScript** >= 5.0.0（可选，但推荐）

## 包管理器安装

### npm

```bash
npm install @ldesign/form
```

### yarn

```bash
yarn add @ldesign/form
```

### pnpm

```bash
pnpm add @ldesign/form
```

## CDN 引入

如果你不使用构建工具，可以通过 CDN 直接引入：

### 完整版本

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Vue 3 -->
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <!-- @ldesign/form -->
    <script src="https://unpkg.com/@ldesign/form/dist/index.umd.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/@ldesign/form/dist/style.css" />
  </head>
  <body>
    <div id="app"></div>

    <script>
      const { createApp } = Vue
      const { DynamicForm } = LDesignForm

      createApp({
        components: { DynamicForm },
        // 你的应用代码...
      }).mount('#app')
    </script>
  </body>
</html>
```

### ES 模块版本

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="https://unpkg.com/@ldesign/form/dist/style.css" />
  </head>
  <body>
    <div id="app"></div>

    <script type="module">
      import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
      import { DynamicForm } from 'https://unpkg.com/@ldesign/form/dist/index.mjs'

      createApp({
        components: { DynamicForm },
        // 你的应用代码...
      }).mount('#app')
    </script>
  </body>
</html>
```

## 项目配置

### Vue 3 项目

#### 1. 全局注册（推荐）

在你的 `main.js` 或 `main.ts` 文件中：

```javascript
import { createApp } from 'vue'
import App from './App.vue'

// 导入 @ldesign/form
import LDesignForm from '@ldesign/form'
import '@ldesign/form/style.css'

const app = createApp(App)

// 全局注册插件
app.use(LDesignForm)

app.mount('#app')
```

全局注册后，你可以在任何组件中直接使用：

```vue
<template>
  <DynamicForm v-model="formData" :options="formOptions" />
</template>
```

#### 2. 按需导入

如果你只需要特定的组件或功能：

```vue
<template>
  <DynamicForm v-model="formData" :options="formOptions" />
</template>

<script setup>
import { ref } from 'vue'
import { DynamicForm } from '@ldesign/form'
import '@ldesign/form/style.css'

const formData = ref({})
const formOptions = {
  // 你的表单配置...
}
</script>
```

#### 3. Composition API

使用 Composition API 方式：

```vue
<template>
  <component :is="renderForm" />
</template>

<script setup>
import { useForm } from '@ldesign/form'
import '@ldesign/form/style.css'

const { formData, renderForm, validate } = useForm({
  fields: [{ name: 'username', label: '用户名', component: 'FormInput' }],
})
</script>
```

### Vite 配置

如果你使用 Vite，可能需要添加以下配置：

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    include: ['@ldesign/form'],
  },
})
```

### Webpack 配置

如果你使用 Webpack，可能需要添加以下配置：

```javascript
// webpack.config.js
module.exports = {
  // 其他配置...
  resolve: {
    alias: {
      '@ldesign/form': '@ldesign/form/dist/index.mjs',
    },
  },
}
```

### TypeScript 配置

如果你使用 TypeScript，建议在 `tsconfig.json` 中添加类型声明：

```json
{
  "compilerOptions": {
    "types": ["@ldesign/form/types"]
  }
}
```

或者在你的 `.d.ts` 文件中：

```typescript
/// <reference types="@ldesign/form/types" />
```

## 样式配置

### 完整样式

导入完整的样式文件：

```javascript
import '@ldesign/form/style.css'
```

### 按需样式

如果你只需要特定组件的样式：

```javascript
// 只导入核心样式
import '@ldesign/form/dist/core.css'

// 按需导入组件样式
import '@ldesign/form/dist/components/form-input.css'
import '@ldesign/form/dist/components/form-select.css'
```

### 自定义样式

你可以覆盖默认样式变量：

```css
:root {
  --ldf-primary-color: #1890ff;
  --ldf-border-radius: 6px;
  --ldf-font-size: 14px;
}
```

## 验证安装

创建一个简单的测试页面来验证安装是否成功：

```vue
<template>
  <div>
    <h1>@ldesign/form 安装测试</h1>
    <DynamicForm v-model="formData" :options="formOptions" />
    <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { DynamicForm } from '@ldesign/form'

const formData = ref({})
const formOptions = {
  fields: [
    {
      name: 'test',
      label: '测试字段',
      component: 'FormInput',
      placeholder: '请输入测试内容',
    },
  ],
}
</script>
```

如果页面正常显示表单并且可以输入内容，说明安装成功！

## 常见问题

### Q: 为什么样式没有生效？

A: 请确保导入了样式文件：

```javascript
import '@ldesign/form/style.css'
```

### Q: TypeScript 类型提示不工作？

A: 请确保在 `tsconfig.json` 中包含了类型声明：

```json
{
  "compilerOptions": {
    "types": ["@ldesign/form/types"]
  }
}
```

### Q: 在 Vite 中出现模块解析错误？

A: 请在 `vite.config.js` 中添加优化依赖：

```javascript
export default defineConfig({
  optimizeDeps: {
    include: ['@ldesign/form'],
  },
})
```

### Q: 如何在 Nuxt 3 中使用？

A: 在 Nuxt 3 中，你需要创建一个插件：

```javascript
// plugins/ldesign-form.client.js
import LDesignForm from '@ldesign/form'
import '@ldesign/form/style.css'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(LDesignForm)
})
```

## 下一步

安装完成后，你可以：

1. [快速开始](/guide/getting-started) - 创建你的第一个表单
2. [基础概念](/guide/concepts) - 了解核心概念
3. [查看示例](/examples/basic) - 浏览实际示例
