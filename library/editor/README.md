# @ldesign/editor

一个功能强大、扩展性强的富文本编辑器，支持 Vue、React 和原生 JavaScript。

## ✨ 特性

- 🚀 **高性能** - 优化的虚拟 DOM 和增量更新
- 🔌 **插件化** - 灵活的插件系统，易于扩展
- 🎨 **可定制** - 完全可定制的样式和行为
- 🌐 **框架无关** - 支持 Vue 3、React 18+ 和原生 JavaScript
- 📝 **功能全面** - 支持所有常见的富文本编辑功能
- 🎯 **TypeScript** - 完整的类型定义
- 🎭 **Lucide 图标** - 使用现代化的 Lucide 图标库
- 📦 **轻量级** - Tree-shaking 友好，按需加载

## 📦 安装

```bash
npm install @ldesign/editor
# 或
yarn add @ldesign/editor
# 或
pnpm add @ldesign/editor
```

## 🚀 快速开始

### 原生 JavaScript

```typescript
import { Editor } from '@ldesign/editor'
import '@ldesign/editor/style.css'

const editor = new Editor({
  element: document.getElementById('editor'),
  content: '<p>Hello World!</p>',
  plugins: ['bold', 'italic', 'underline']
})
```

### Vue 3

```vue
<template>
  <RichEditor v-model="content" :plugins="plugins" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RichEditor } from '@ldesign/editor/vue'
import '@ldesign/editor/style.css'

const content = ref('<p>Hello World!</p>')
const plugins = ['bold', 'italic', 'underline', 'link', 'image']
</script>
```

### React

```tsx
import { useState } from 'react'
import { RichEditor } from '@ldesign/editor/react'
import '@ldesign/editor/style.css'

function App() {
  const [content, setContent] = useState('<p>Hello World!</p>')

  return (
    <RichEditor
      value={content}
      onChange={setContent}
      plugins={['bold', 'italic', 'underline', 'link', 'image']}
    />
  )
}
```

## 📚 文档

访问 [完整文档](./docs) 了解更多信息。

## 🔌 插件

编辑器支持以下内置插件：

- **基础格式化**: bold, italic, underline, strikethrough, code
- **标题**: h1, h2, h3, h4, h5, h6
- **列表**: bulletList, orderedList, taskList
- **块级元素**: blockquote, codeBlock, horizontalRule
- **内联元素**: link, image
- **表格**: table
- **历史记录**: undo, redo
- **对齐**: textAlign

## 🛠️ 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 文档开发
pnpm docs:dev

# 文档构建
pnpm docs:build
```

## 📄 License

MIT
