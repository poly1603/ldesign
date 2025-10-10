# 快速开始

本指南将帮助你快速上手 @ldesign/editor。

## 安装

首先，使用你喜欢的包管理器安装 @ldesign/editor：

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

## 基础使用

### 原生 JavaScript

创建一个基础的编辑器实例：

```typescript
import { Editor } from '@ldesign/editor'
import '@ldesign/editor/style.css'

const editor = new Editor({
  element: '#editor',
  content: '<p>Hello World!</p>',
  placeholder: '请输入内容...'
})
```

### Vue 3

在 Vue 3 项目中使用组件：

```vue
<template>
  <RichEditor
    v-model="content"
    placeholder="请输入内容..."
    @update="handleUpdate"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RichEditor } from '@ldesign/editor/vue'
import '@ldesign/editor/style.css'

const content = ref('<p>Hello World!</p>')

function handleUpdate(state) {
  console.log('Editor updated:', state)
}
</script>
```

### React

在 React 项目中使用组件：

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
      placeholder="请输入内容..."
      onUpdate={(state) => {
        console.log('Editor updated:', state)
      }}
    />
  )
}
```

## 添加插件

@ldesign/editor 通过插件系统提供各种功能。以下是如何添加插件：

```typescript
import {
  Editor,
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  HeadingPlugin,
  LinkPlugin
} from '@ldesign/editor'

const editor = new Editor({
  element: '#editor',
  plugins: [
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin,
    HeadingPlugin,
    LinkPlugin
  ]
})
```

## 显示工具栏

工具栏提供了可视化的编辑按钮：

```typescript
import { Editor, Toolbar } from '@ldesign/editor'
import { BoldPlugin, ItalicPlugin } from '@ldesign/editor'

const editor = new Editor({
  element: '#editor',
  plugins: [BoldPlugin, ItalicPlugin]
})

// 创建工具栏
const toolbar = new Toolbar(editor, {
  container: document.getElementById('toolbar')
})
```

在 Vue 和 React 中，工具栏会自动显示：

::: code-group

```vue [Vue]
<template>
  <RichEditor
    v-model="content"
    :show-toolbar="true"
  />
</template>
```

```tsx [React]
<RichEditor
  value={content}
  onChange={setContent}
  showToolbar={true}
/>
```

:::

## 完整示例

这是一个包含所有常用功能的完整示例：

```typescript
import {
  Editor,
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikePlugin,
  CodePlugin,
  HeadingPlugin,
  BulletListPlugin,
  OrderedListPlugin,
  BlockquotePlugin,
  CodeBlockPlugin,
  LinkPlugin,
  ImagePlugin,
  TablePlugin,
  HistoryPlugin,
  AlignPlugin
} from '@ldesign/editor'
import '@ldesign/editor/style.css'

const editor = new Editor({
  element: '#editor',
  content: '<p>开始编辑...</p>',
  placeholder: '请输入内容...',
  autofocus: true,
  editable: true,

  // 注册所有插件
  plugins: [
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin,
    StrikePlugin,
    CodePlugin,
    HeadingPlugin,
    BulletListPlugin,
    OrderedListPlugin,
    BlockquotePlugin,
    CodeBlockPlugin,
    LinkPlugin,
    ImagePlugin,
    TablePlugin,
    HistoryPlugin,
    AlignPlugin
  ],

  // 事件监听
  onChange: (content) => {
    console.log('内容变化:', content)
  },

  onUpdate: (state) => {
    console.log('状态更新:', state)
  },

  onFocus: () => {
    console.log('编辑器获得焦点')
  },

  onBlur: () => {
    console.log('编辑器失去焦点')
  }
})
```

## 常用操作

### 获取和设置内容

```typescript
// 获取 HTML 内容
const html = editor.getHTML()

// 设置 HTML 内容
editor.setHTML('<p>新内容</p>')

// 获取 JSON 数据
const json = editor.getJSON()

// 设置 JSON 数据
editor.setJSON(json)

// 清空内容
editor.clear()
```

### 聚焦和失焦

```typescript
// 聚焦编辑器
editor.focus()

// 失焦编辑器
editor.blur()
```

### 控制可编辑状态

```typescript
// 设置为只读
editor.setEditable(false)

// 设置为可编辑
editor.setEditable(true)

// 检查是否可编辑
const isEditable = editor.isEditable()
```

## 快捷键

@ldesign/editor 内置了常用的快捷键：

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + B` | 粗体 |
| `Ctrl/Cmd + I` | 斜体 |
| `Ctrl/Cmd + U` | 下划线 |
| `Ctrl/Cmd + Shift + X` | 删除线 |
| `Ctrl/Cmd + K` | 插入链接 |
| `Ctrl/Cmd + Z` | 撤销 |
| `Ctrl/Cmd + Shift + Z` | 重做 |
| `Ctrl/Cmd + \\` | 清除格式 |
| `Ctrl/Cmd + Alt + 1-6` | 标题 1-6 |
| `Ctrl/Cmd + Shift + 7` | 有序列表 |
| `Ctrl/Cmd + Shift + 8` | 无序列表 |

## 下一步

- [编辑器实例](/guide/editor-instance) - 深入了解编辑器 API
- [插件系统](/plugins/overview) - 了解如何使用和开发插件
- [示例](/examples/basic) - 查看更多实际示例
