---
layout: home

hero:
  name: 'LDesign'
  text: '现代化 Web Components 组件库'
  tagline: '基于 Stencil 构建，支持跨框架使用的高质量组件库'
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
      link: https://github.com/ldesign-org/ldesign

features:
  - icon: 🚀
    title: 现代化技术栈
    details: 基于 Stencil 构建，使用 TypeScript 开发，提供完整的类型支持和现代化的开发体验
  - icon: 🌐
    title: 跨框架兼容
    details: 支持 Vue、React、Angular 等主流框架，也可以在原生 HTML 中直接使用
  - icon: 🎨
    title: 精美设计
    details: 遵循现代设计规范，提供丰富的主题定制能力和响应式设计支持
  - icon: 📱
    title: 移动端优先
    details: 完美支持移动端设备，提供触摸友好的交互体验和自适应布局
  - icon: ♿
    title: 无障碍访问
    details: 严格遵循 WCAG 标准，提供完整的键盘导航和屏幕阅读器支持
  - icon: 🔧
    title: 开发友好
    details: 提供完整的开发工具链，包括热重载、类型检查、单元测试等
  - icon: 📦
    title: 按需加载
    details: 支持 Tree Shaking，只打包使用的组件，有效减少包体积
  - icon: 🌙
    title: 主题定制
    details: 支持亮色/暗色主题切换，提供丰富的 CSS 变量用于深度定制
  - icon: 🧪
    title: 测试覆盖
    details: 提供完整的单元测试和 E2E 测试，确保组件的稳定性和可靠性
---

## 快速体验

你可以直接在 HTML 中使用我们的组件：

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="https://unpkg.com/@ldesign/component/dist/ldesign/ldesign.esm.js"></script>
</head>
<body>
  <ld-button type="primary">Hello LDesign!</ld-button>
  <ld-input placeholder="请输入内容"></ld-input>
  <ld-card title="卡片标题">
    <p>这是卡片内容</p>
  </ld-card>
</body>
</html>
```

## 在 Vue 中使用

```bash
npm install @ldesign/component @ldesign/component-vue
```

```vue
<template>
  <div>
    <ld-button type="primary" @click="handleClick">
      点击我
    </ld-button>
    <ld-input v-model="inputValue" placeholder="请输入内容" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const inputValue = ref('')

const handleClick = () => {
  console.log('按钮被点击了！')
}
</script>
```

## 在 React 中使用

```bash
npm install @ldesign/component @ldesign/component-react
```

```jsx
import React, { useState } from 'react'
import { LdButton, LdInput } from '@ldesign/component-react'

function App() {
  const [inputValue, setInputValue] = useState('')

  const handleClick = () => {
    console.log('按钮被点击了！')
  }

  return (
    <div>
      <LdButton type="primary" onClick={handleClick}>
        点击我
      </LdButton>
      <LdInput
        value={inputValue}
        onInput={(e) => setInputValue(e.target.value)}
        placeholder="请输入内容"
      />
    </div>
  )
}

export default App
```

## 特性亮点

### 🎯 Web Components 标准

基于 Web Components 标准构建，确保组件在任何现代浏览器中都能正常工作，无需额外的运行时依赖。

### 🔥 现代化开发体验

- **TypeScript 支持**：完整的类型定义，提供优秀的开发体验
- **热重载**：开发时支持热重载，提高开发效率
- **代码提示**：智能的代码提示和自动补全

### 🎨 丰富的组件生态

- **基础组件**：Button、Input、Card 等常用组件
- **高级组件**：Modal、Table、Form 等复杂组件
- **持续更新**：定期发布新组件和功能更新

### 📚 完善的文档

- **详细的 API 文档**：每个组件都有完整的属性、事件、方法说明
- **丰富的示例**：提供大量的使用示例和最佳实践
- **框架集成指南**：详细的框架集成说明

## 浏览器支持

LDesign 支持所有现代浏览器：

- Chrome >= 60
- Firefox >= 63
- Safari >= 11
- Edge >= 79

## 📚 学习资源

- [📖 完整文档](./guide/introduction) - 详细的使用指南和 API 参考
- [🎯 组件文档](./components/button) - 丰富的组件示例和最佳实践
- [🎮 在线示例](./examples/basic-app) - 交互式功能演示
- [🤝 贡献指南](https://github.com/ldesign-org/ldesign/blob/main/CONTRIBUTING.md) - 如何参与项目开发

## 🤝 社区支持

- [GitHub Issues](https://github.com/ldesign-org/ldesign/issues) - 问题反馈和功能建议
- [GitHub Discussions](https://github.com/ldesign-org/ldesign/discussions) - 社区讨论

## 📄 许可证

[MIT License](https://github.com/ldesign-org/ldesign/blob/main/LICENSE) © 2024 LDesign Team
