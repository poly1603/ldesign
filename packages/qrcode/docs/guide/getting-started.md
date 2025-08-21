# 快速上手

## 安装

```bash
npm i @ldesign/qrcode
# 或
pnpm add @ldesign/qrcode
# 或
yarn add @ldesign/qrcode
```

## 在浏览器 / Node 使用

```ts
import { QRCodeGenerator } from '@ldesign/qrcode'

const generator = new QRCodeGenerator({ size: 200, format: 'canvas' })
const result = await generator.generate('Hello LDesign')

// 访问结果
console.log(result.format, result.dataURL)
// 也可以把 result.element 插到 DOM
```

## 在 Vue 中使用组件

```ts
import { createApp } from 'vue'
import { QRCode } from '@ldesign/qrcode'

createApp({}).component('QRCode', QRCode).mount('#app')
```

```vue
<template>
  <QRCode text="https://ldesign.dev/qrcode" :width="200" :showDownloadButton="true" />
</template>
```

## 在 Vue 中使用 Hook

```ts
import { useQRCode } from '@ldesign/qrcode'

const { generate, result, download } = useQRCode({ size: 200, format: 'canvas' })
await generate('From Hook')
await download(undefined, 'my-qrcode')
```

## VitePress 文档中直接使用（本站示例）

在 `.vitepress/theme/index.ts` 中注册：

```ts
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import QRCode from '../../src/vue/QRCode.vue'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('LQRCode', QRCode)
  }
} satisfies Theme
```

然后在任意 Markdown：

```md
<LQRCode :width="200" text="https://ldesign.dev/qrcode" />
```

> 组件渲染在文档站点前端运行时完成，不需要额外构建步骤。

