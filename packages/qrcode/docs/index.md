---
layout: home

hero:
  name: "LDesign QR Code"
  text: "通用二维码生成库"
  tagline: "支持多种前端框架，功能强大，使用简单"
  image:
    src: /logo.svg
    alt: LDesign QR Code
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/qrcode

features:
  - icon: 🚀
    title: 多框架支持
    details: 原生支持 Vue、React、Angular 和原生 JavaScript，提供一致的 API 体验

  - icon: ⚡️
    title: 高性能
    details: 内置缓存机制、批量处理和性能监控，确保最佳的生成性能

  - icon: 🎨
    title: 丰富样式
    details: 支持渐变色彩、自定义样式、Logo 嵌入等多种视觉效果

  - icon: 📱
    title: 响应式设计
    details: 完美适配各种屏幕尺寸，支持 SVG、Canvas 和 Image 多种输出格式

  - icon: 🛠️
    title: TypeScript
    details: 完整的 TypeScript 类型定义，提供优秀的开发体验

  - icon: 🔧
    title: 易于集成
    details: 简单的 API 设计，支持自动框架检测和跨框架兼容性
---

## 快速体验

### 原生 JavaScript

```javascript
import { generateQRCode } from '@ldesign/qrcode'

// 最简单的使用
const result = await generateQRCode('Hello World', {
  container: '#qrcode-container'
})
```

### Vue

```vue
<template>
  <QRCode
    text="Hello Vue!"
    :size="200"
    format="svg"
    :show-download-button="true"
  />
</template>

<script setup>
import { QRCode } from '@ldesign/qrcode/vue'
</script>
```

### React

```jsx
import { QRCode } from '@ldesign/qrcode/react'

function App() {
  return (
    <QRCode
      text="Hello React!"
      size={200}
      format="canvas"
      showDownloadButton={true}
    />
  )
}
```

### Angular

```html
<qr-code
  text="Hello Angular!"
  [size]="200"
  format="svg"
  [showDownloadButton]="true">
</qr-code>
```

## 主要特性

### 🎯 多种输出格式

- **Canvas** - 适合像素级操作和高性能场景
- **SVG** - 适合响应式设计和矢量图形
- **Image** - 适合直接显示和下载

### 🎨 丰富的样式选项

- **颜色配置** - 支持纯色和渐变色（线性/径向）
- **样式定制** - 点样式、角样式、圆角等
- **Logo 嵌入** - 支持多种形状和边框样式

### ⚡ 性能优化

- **智能缓存** - 自动缓存生成结果，避免重复计算
- **批量处理** - 支持并行生成多个二维码
- **性能监控** - 内置性能指标收集和分析

### 🔧 开发体验

- **TypeScript** - 完整的类型定义和智能提示
- **框架适配** - 自动检测框架并使用最佳实践
- **错误处理** - 详细的错误信息和恢复建议

## 安装

::: code-group

```bash [npm]
npm install @ldesign/qrcode
```

```bash [yarn]
yarn add @ldesign/qrcode
```

```bash [pnpm]
pnpm add @ldesign/qrcode
```

:::

## 许可证

[MIT License](https://github.com/ldesign/qrcode/blob/main/LICENSE) © 2024 LDesign


