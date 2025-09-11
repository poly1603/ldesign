---
layout: home

hero:
  name: "@ldesign/chart"
  text: "通用图表组件库"
  tagline: "基于 ECharts 的框架无关图表库，数据驱动，简化配置"
  image:
    src: /logo.svg
    alt: LDesign Chart
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/chart

features:
  - icon: 🎯
    title: 数据驱动
    details: 只需提供数据和基本配置，无需深入了解 ECharts 复杂配置项
  - icon: 🔧
    title: 框架无关
    details: 可在 React、Vue、原生 JavaScript 等任意框架中使用
  - icon: 🎨
    title: 主题系统
    details: 内置多种主题，支持自定义主题和运行时切换
  - icon: 📱
    title: 响应式设计
    details: 自动适应容器大小变化，完美支持移动端
  - icon: ⚡
    title: 高性能
    details: 优化的渲染性能，支持大数据量和实时更新
  - icon: 🛠️
    title: TypeScript
    details: 完整的类型定义，提供优秀的开发体验
---

## 快速开始

### 安装

```bash
# 使用 npm
npm install @ldesign/chart echarts

# 使用 pnpm
pnpm add @ldesign/chart echarts

# 使用 yarn
yarn add @ldesign/chart echarts
```

### 基础用法

```typescript
import { Chart } from '@ldesign/chart'

// 创建图表
const chart = new Chart(container, {
  type: 'line',
  data: [
    { name: '1月', value: 100 },
    { name: '2月', value: 200 },
    { name: '3月', value: 150 }
  ],
  title: '月度销售额',
  theme: 'light'
})
```

### 多系列数据

```typescript
const chart = new Chart(container, {
  type: 'bar',
  data: {
    categories: ['1月', '2月', '3月'],
    series: [
      { name: '销售额', data: [100, 200, 150] },
      { name: '利润', data: [30, 60, 45] }
    ]
  },
  title: '销售数据对比'
})
```

## 特性亮点

### 🎯 简化的 API

传统的 ECharts 配置复杂，需要深入了解各种配置项。@ldesign/chart 提供了简化的 API，让你专注于数据本身。

### 🔧 框架无关

核心库不依赖任何特定框架，可以在任何 JavaScript 环境中使用。同时提供了各种框架的适配器。

### 🎨 强大的主题系统

内置多种精美主题，支持自定义主题，可以运行时动态切换，完美适配你的设计系统。

### 📱 响应式设计

自动监听容器大小变化，图表会自动调整尺寸，完美支持响应式布局和移动端。

## 生态系统

| 项目 | 状态 | 描述 |
| --- | --- | --- |
| [@ldesign/chart](/) | ✅ 稳定 | 核心图表库 |
| [@ldesign/chart-react](/react) | 🚧 开发中 | React 组件 |
| [@ldesign/chart-vue](/vue) | 🚧 开发中 | Vue 组件 |
| [@ldesign/chart-themes](/themes) | 🚧 开发中 | 主题包 |

## 贡献

我们欢迎所有形式的贡献。请阅读我们的[贡献指南](https://github.com/ldesign/chart/blob/main/CONTRIBUTING.md)了解详情。

## 许可证

[MIT License](https://github.com/ldesign/chart/blob/main/LICENSE) © 2024 ldesign
