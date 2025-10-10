---
layout: home

hero:
  name: "@ldesign/editor"
  text: "富文本编辑器"
  tagline: 功能强大、扩展性强、支持多框架
  image:
    src: /logo.svg
    alt: LDesign Editor
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/basic
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/editor

features:
  - icon: 🚀
    title: 高性能
    details: 优化的虚拟 DOM 和增量更新机制，确保流畅的编辑体验

  - icon: 🔌
    title: 插件化
    details: 灵活的插件系统，易于扩展和定制功能

  - icon: 🎨
    title: 可定制
    details: 完全可定制的样式和行为，适应各种使用场景

  - icon: 🌐
    title: 框架无关
    details: 支持 Vue 3、React 18+ 和原生 JavaScript

  - icon: 📝
    title: 功能全面
    details: 支持所有常见的富文本编辑功能，开箱即用

  - icon: 🎯
    title: TypeScript
    details: 完整的类型定义，提供更好的开发体验

  - icon: 🎭
    title: Lucide 图标
    details: 使用现代化的 Lucide 图标库，美观且可定制

  - icon: 📦
    title: 轻量级
    details: Tree-shaking 友好，按需加载，减小打包体积
---

## 快速开始

### 安装

::: code-group

```bash [npm]
npm install @ldesign/editor
```

```bash [yarn]
yarn add @ldesign/editor
```

```bash [pnpm]
pnpm add @ldesign/editor
```

:::

### 基础使用

::: code-group

```typescript [原生 JavaScript]
import { Editor } from '@ldesign/editor'
import '@ldesign/editor/style.css'

const editor = new Editor({
  element: '#editor',
  content: '<p>Hello World!</p>',
  plugins: ['bold', 'italic', 'underline']
})
```

```vue [Vue 3]
<template>
  <RichEditor v-model="content" :plugins="plugins" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RichEditor } from '@ldesign/editor/vue'
import '@ldesign/editor/style.css'

const content = ref('<p>Hello World!</p>')
const plugins = ['bold', 'italic', 'underline']
</script>
```

```tsx [React]
import { useState } from 'react'
import { RichEditor } from '@ldesign/editor/react'
import '@ldesign/editor/style.css'

function App() {
  const [content, setContent] = useState('<p>Hello World!</p>')

  return (
    <RichEditor
      value={content}
      onChange={setContent}
      plugins={['bold', 'italic', 'underline']}
    />
  )
}
```

:::

## 为什么选择 @ldesign/editor？

### 🎯 简单易用

提供简洁的 API 和丰富的文档，让你快速上手。

### 🔧 高度可扩展

灵活的插件系统和完善的扩展机制，满足各种定制需求。

### ⚡️ 性能优越

经过优化的核心算法，确保在处理大量内容时依然流畅。

### 🌍 国际化支持

内置国际化支持，轻松适配多语言环境。

## 社区

- [GitHub Issues](https://github.com/ldesign/editor/issues) - 报告问题和建议
- [GitHub Discussions](https://github.com/ldesign/editor/discussions) - 讨论和交流

## 许可证

[MIT License](https://github.com/ldesign/editor/blob/main/LICENSE)
