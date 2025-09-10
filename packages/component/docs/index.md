---
layout: home

hero:
  name: "LDesign Component"
  text: "现代化 Vue 3 组件库"
  tagline: "基于 TypeScript + Vite + ESM 构建，遵循 TDesign 设计规范"
  image:
    src: /logo.svg
    alt: LDesign Component
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看组件
      link: /components/button
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/ldesign

features:
  - icon: ⚡️
    title: 现代化技术栈
    details: 基于 Vue 3 + TypeScript + Vite + ESM，提供最佳的开发体验和性能表现
  - icon: 🎨
    title: 设计系统
    details: 遵循 TDesign 设计规范，提供完整的设计令牌和主题定制能力
  - icon: 📦
    title: 开箱即用
    details: 提供丰富的组件库，支持按需引入，零配置即可使用
  - icon: 🔧
    title: TypeScript 支持
    details: 完整的 TypeScript 类型定义，提供优秀的开发体验和类型安全
  - icon: 🧪
    title: 测试覆盖
    details: 基于 Vitest 的完整测试覆盖，确保组件的稳定性和可靠性
  - icon: 📚
    title: 详细文档
    details: 提供详细的使用文档、API 说明和示例代码，快速上手
  - icon: 🌙
    title: 主题切换
    details: 支持亮色/暗色主题切换，以及自定义主题配置
  - icon: 🚀
    title: 高性能
    details: 优化的构建配置和运行时性能，确保应用的流畅体验
  - icon: 🔄
    title: 响应式设计
    details: 完全响应式的组件设计，适配各种屏幕尺寸和设备
---

## 快速体验

### 安装

::: code-group

```bash [pnpm]
pnpm add @ldesign/component
```

```bash [npm]
npm install @ldesign/component
```

```bash [yarn]
yarn add @ldesign/component
```

:::

### 使用

```vue
<template>
  <div>
    <l-button type="primary" @click="handleClick">
      点击我
    </l-button>
  </div>
</template>

<script setup lang="ts">
import { LButton } from '@ldesign/component'
import '@ldesign/component/styles'

const handleClick = () => {
  console.log('按钮被点击了！')
}
</script>
```

## 特性亮点

### 🎯 设计理念

LDesign Component 遵循 **简洁、一致、高效** 的设计理念，为开发者提供：

- **简洁**：API 设计简洁明了，易于理解和使用
- **一致**：统一的设计语言和交互规范
- **高效**：优化的性能和开发体验

### 🛠️ 技术特色

- **现代化构建**：使用 @ldesign/builder 和 @ldesign/launcher 构建
- **ESM 优先**：原生支持 ES 模块，更好的 Tree Shaking
- **类型安全**：完整的 TypeScript 类型定义
- **测试驱动**：基于 Vitest 的全面测试覆盖

### 🎨 设计系统

基于 LDESIGN 设计系统，提供：

- 完整的色彩体系（品牌色、功能色、中性色）
- 统一的字体和排版规范
- 标准化的间距和布局系统
- 丰富的图标库

## 浏览器支持

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Safari |
| --- | --- | --- | --- |
| Edge 79+ | Firefox 78+ | Chrome 70+ | Safari 12+ |

## 开源协议

[MIT License](https://github.com/ldesign/ldesign/blob/main/LICENSE) © 2025 LDesign Team
