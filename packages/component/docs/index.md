---
layout: home

hero:
  name: "LDesign"
  text: "现代化组件库"
  tagline: "基于 Web Components 的高性能 UI 组件库"
  image:
    src: /logo.svg
    alt: LDesign
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看组件
      link: /components/button
    - theme: alt
      text: GitHub
      link: https://github.com/your-org/ldesign

features:
  - icon: 🚀
    title: 高性能
    details: 基于 Stencil 编译器，生成优化的原生 Web Components，运行时性能卓越
  - icon: 🎯
    title: 框架无关
    details: 支持 React、Vue、Angular 等所有主流框架，真正的跨框架解决方案
  - icon: 💪
    title: TypeScript
    details: 完整的 TypeScript 支持，提供优秀的开发体验和类型安全
  - icon: 🎨
    title: 主题定制
    details: 基于 CSS 变量的灵活主题系统，支持亮色/暗色模式切换
  - icon: 📱
    title: 响应式
    details: 移动端友好的设计，支持各种屏幕尺寸和设备
  - icon: ♿
    title: 无障碍
    details: 遵循 WCAG 2.1 标准，支持键盘导航和屏幕阅读器
  - icon: 📦
    title: 按需加载
    details: 支持 Tree Shaking 和懒加载，只打包使用的组件
  - icon: 🌙
    title: 暗色模式
    details: 内置完整的暗色主题支持，提供一致的用户体验
---

## 快速体验

在下面的演示中体验 LDesign 组件：

<div class="demo-container">
  <div class="demo-showcase">
    <ld-button type="primary">主要按钮</ld-button>
    <ld-button type="default">默认按钮</ld-button>
    <ld-button type="dashed">虚线按钮</ld-button>
    <ld-button type="text">文本按钮</ld-button>
    <ld-button type="link">链接按钮</ld-button>
  </div>
</div>

<div class="demo-container">
  <div class="demo-showcase">
    <ld-input placeholder="请输入内容"></ld-input>
    <ld-input placeholder="禁用状态" disabled></ld-input>
  </div>
</div>

<div class="demo-container">
  <div class="demo-showcase">
    <ld-card card-title="卡片标题" style="width: 300px;">
      <p>这是卡片的内容区域，可以放置任何内容。</p>
      <div slot="footer">
        <ld-button type="primary" size="small">确定</ld-button>
        <ld-button size="small">取消</ld-button>
      </div>
    </ld-card>
  </div>
</div>

## 安装

```bash
# 使用 npm
npm install @ldesign/components

# 使用 yarn
yarn add @ldesign/components

# 使用 pnpm
pnpm add @ldesign/components
```

## 使用

### 在 HTML 中使用

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="https://unpkg.com/@ldesign/components/dist/ldesign/ldesign.esm.js"></script>
</head>
<body>
  <ld-button type="primary">Hello LDesign!</ld-button>
</body>
</html>
```

### 在 React 中使用

```tsx
import React from 'react';
import { defineCustomElements } from '@ldesign/components/loader';

// 注册组件
defineCustomElements();

function App() {
  return (
    <div>
      <ld-button type="primary">点击我</ld-button>
    </div>
  );
}

export default App;
```

### 在 Vue 中使用

```vue
<template>
  <div>
    <ld-button type="primary">点击我</ld-button>
  </div>
</template>

<script>
import { defineCustomElements } from '@ldesign/components/loader';

// 注册组件
defineCustomElements();

export default {
  name: 'App'
}
</script>
```

## 特性亮点

### 🎯 框架无关

LDesign 基于 Web Components 标准构建，可以在任何前端框架中使用，包括但不限于：

- React
- Vue
- Angular
- Svelte
- 原生 HTML/JavaScript

### 🚀 高性能

- 基于 Stencil 编译器，生成高度优化的原生代码
- 支持 Tree Shaking，只打包使用的组件
- 懒加载和按需加载支持
- 最小化运行时开销

### 🎨 设计系统

- 统一的设计语言和视觉风格
- 完整的组件体系和交互规范
- 灵活的主题定制能力
- 响应式设计和移动端优化

### 💪 开发体验

- 完整的 TypeScript 类型定义
- 优秀的 IDE 智能提示
- 详细的文档和示例
- 完善的测试覆盖

## 浏览器支持

LDesign 支持所有现代浏览器：

- Chrome 60+
- Firefox 63+
- Safari 11+
- Edge 79+

## 开源协议

LDesign 基于 [MIT 协议](https://github.com/your-org/ldesign/blob/main/LICENSE) 开源，欢迎贡献代码！
