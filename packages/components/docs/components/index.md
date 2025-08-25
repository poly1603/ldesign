# 组件总览

LDesign Web Components 提供了丰富的组件，支持在 HTML、Vue、React、Angular 等框架中使用。

## 基础组件

### Button 按钮
用于开始一个即时操作。

```html
<ldesign-button type="primary">主要按钮</ldesign-button>
```

[查看详情 →](/components/button)

### Input 输入框
通过鼠标或键盘输入字符。

```html
<ldesign-input placeholder="请输入内容"></ldesign-input>
```

[查看详情 →](/components/input)

### Card 卡片
卡片容器，可以包含标题、内容、操作区域等。

```html
<ldesign-card title="卡片标题">
  这是卡片内容
</ldesign-card>
```

[查看详情 →](/components/card)

## 组件特性

### 🚀 跨框架支持
基于 Web Components 标准，可以在任何框架中使用：
- ✅ HTML
- ✅ Vue 3
- ✅ React
- ✅ Angular
- ✅ Svelte
- ✅ 其他支持 Web Components 的框架

### 🎨 设计系统
- 遵循现代设计原则
- 提供一致的用户体验
- 支持主题定制
- 响应式设计

### ⚡ 高性能
- 使用 StencilJS 构建
- 优秀的性能表现
- 较小的包体积
- 按需加载支持

### 🔧 易于使用
- 简单的 API 设计
- 完整的 TypeScript 支持
- 丰富的文档和示例
- 快速上手

## 快速开始

### 安装

```bash
npm install @ldesign/web-components
```

### 引入

```html
<!-- HTML -->
<script type="module" src="https://unpkg.com/@ldesign/web-components@latest/dist/ldesign/ldesign.esm.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@ldesign/web-components@latest/dist/css/index.css">
```

```typescript
// Vue/React/Angular
import '@ldesign/web-components/dist/css/index.css'
```

### 使用

```html
<ldesign-button type="primary">点击我</ldesign-button>
<ldesign-input placeholder="请输入内容"></ldesign-input>
<ldesign-card title="卡片标题">
  这是卡片内容
</ldesign-card>
```

## 设计原则

### 一致性
所有组件都遵循统一的设计语言，确保在不同场景下都能提供一致的用户体验。

### 可访问性
组件内置了可访问性支持，包括键盘导航、屏幕阅读器支持等。

### 可定制性
通过 CSS 变量和插槽，可以轻松定制组件的外观和行为。

### 性能优化
组件经过性能优化，确保在各种环境下都能流畅运行。

## 贡献指南

我们欢迎社区贡献！如果你想要：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码

请查看我们的 [贡献指南](https://github.com/ldesign/ldesign/blob/main/CONTRIBUTING.md)。

## 许可证

MIT License - 查看 [LICENSE](https://github.com/ldesign/ldesign/blob/main/LICENSE) 文件了解详情。






