# 安装

本页介绍如何在不同环境下安装和使用 @ldesign/color。

## 安装包

```bash
# pnpm
pnpm add @ldesign/color

# npm
echo Installing... && npm install @ldesign/color

# yarn
yarn add @ldesign/color
```

## 基础用法（Vanilla）

```ts
import { generateColorConfig, generateColorScales } from '@ldesign/color'

const colors = generateColorConfig('#1890ff')
const scales = generateColorScales(colors, 'light')

console.log(colors.primary) // '#1890ff'
console.log(scales.primary.indices[5]) // 主色 5 级
```

## 在 Vue 3 中使用

推荐以插件 + 组合式 API 的方式接入。

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { createColorPlugin } from '@ldesign/color/vue'

const app = createApp(App)

app.use(
  createColorPlugin({
    defaultTheme: 'default',
    defaultMode: 'light',
  })
)

app.mount('#app')
```

在组件中使用组合式 API：

```vue
<script setup lang="ts">
import { useTheme } from '@ldesign/color/vue'

const { currentTheme, currentMode, setTheme, toggleMode } = useTheme()
</script>

<template>
  <div>
    <p>主题: {{ currentTheme }}</p>
    <p>模式: {{ currentMode }}</p>
    <button @click="toggleMode">切换模式</button>
  </div>
</template>
```

## ESM / CJS / UMD

- 默认提供 ESM 与 CJS 双格式导出，浏览器可使用 UMD：`dist/index.umd.js`
- Tree Shaking 友好，按需导入工具函数可减少体积。

## TypeScript 支持

- 包含完整的 d.ts 类型定义
- `strict: true` 环境下可获得完善的类型提示
