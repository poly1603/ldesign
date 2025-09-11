# 介绍

@ldesign/chart 是一个基于 ECharts 的通用图表组件库，采用数据驱动的设计理念，提供简化的 API 接口，让开发者能够快速创建美观、交互性强的图表。

## 设计理念

### 数据驱动

传统的图表库往往需要开发者深入了解复杂的配置项。@ldesign/chart 采用数据驱动的设计理念，开发者只需要提供数据和基本配置，库会自动生成合适的图表配置。

```typescript
// 简单的数据格式
const data = [
  { name: '1月', value: 100 },
  { name: '2月', value: 200 },
  { name: '3月', value: 150 }
]

// 自动生成图表
const chart = new Chart(container, {
  type: 'line',
  data,
  title: '月度数据'
})
```

### 框架无关

核心库不依赖任何特定的前端框架，可以在 React、Vue、Angular、原生 JavaScript 等任何环境中使用。

```typescript
// 在任何框架中都可以这样使用
import { Chart } from '@ldesign/chart'

const chart = new Chart(document.getElementById('chart'), config)
```

### 简化配置

ECharts 的配置项非常丰富，但也很复杂。@ldesign/chart 提供了简化的配置接口，同时保留了足够的灵活性。

```typescript
// 简化的配置
const config = {
  type: 'bar',
  data: myData,
  title: '销售数据',
  theme: 'dark',
  responsive: true
}

// 等价于复杂的 ECharts 配置
const echartsOption = {
  title: { text: '销售数据', ... },
  xAxis: { type: 'category', data: [...], ... },
  yAxis: { type: 'value', ... },
  series: [{ type: 'bar', data: [...], ... }],
  // ... 更多配置
}
```

## 核心特性

### 🎯 多种图表类型

支持常见的图表类型：

- **折线图** - 展示数据趋势
- **柱状图** - 比较不同类别的数据
- **饼图** - 展示数据占比
- **散点图** - 展示数据分布
- **面积图** - 强调数据量级

### 🎨 主题系统

内置多种主题，支持自定义：

- **预设主题** - light、dark、colorful 等
- **自定义主题** - 完全可定制的主题系统
- **运行时切换** - 动态切换主题
- **CSS 变量** - 基于 CSS 变量的主题系统

### 📱 响应式设计

自动适应容器大小变化：

- **自动调整** - 监听容器大小变化
- **移动端优化** - 完美支持移动设备
- **防抖处理** - 优化性能，避免频繁重绘

### ⚡ 高性能

优化的渲染性能：

- **按需加载** - 只加载需要的图表类型
- **增量更新** - 数据更新时只重绘必要部分
- **内存管理** - 自动清理资源，避免内存泄漏

### 🛠️ TypeScript 支持

完整的类型定义：

- **类型安全** - 完整的 TypeScript 类型定义
- **智能提示** - IDE 中的智能代码提示
- **编译时检查** - 在编译时发现潜在问题

## 架构设计

@ldesign/chart 采用模块化的架构设计：

```
@ldesign/chart
├── core/           # 核心图表类
├── adapters/       # 数据适配器
├── themes/         # 主题系统
├── events/         # 事件管理
├── config/         # 配置构建
├── responsive/     # 响应式管理
└── utils/          # 工具函数
```

### 核心模块

- **Chart** - 主图表类，管理 ECharts 实例
- **DataAdapter** - 数据适配器，转换用户数据为 ECharts 配置
- **ThemeManager** - 主题管理器，处理主题切换
- **EventManager** - 事件管理器，统一处理图表事件
- **ResponsiveManager** - 响应式管理器，处理容器大小变化

## 兼容性

### 浏览器支持

- Chrome >= 60
- Firefox >= 60
- Safari >= 12
- Edge >= 79

### 框架支持

- React >= 16.8
- Vue >= 3.0
- Angular >= 12
- 原生 JavaScript

### ECharts 版本

- ECharts >= 5.0

## 下一步

- [快速开始](/guide/getting-started) - 学习如何安装和使用
- [图表类型](/guide/chart-types) - 了解支持的图表类型
- [配置系统](/guide/configuration) - 深入了解配置选项
- [主题系统](/guide/themes) - 学习如何使用和自定义主题
