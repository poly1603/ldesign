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
- 🔍 **查找替换** - 强大的查找替换功能，支持正则表达式
- 🎨 **颜色选择** - 改进的颜色选择器，支持 HEX 输入和最近使用的颜色
- 📏 **行高调整** - 灵活的行高选项
- 🔤 **文本转换** - 大小写转换、全角半角转换等

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
import { Editor, Toolbar } from '@ldesign/editor'
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  HeadingPlugin,
  LinkPlugin,
  TablePlugin
} from '@ldesign/editor'
import '@ldesign/editor/style.css'

const editor = new Editor({
  element: document.getElementById('editor'),
  content: '<p>Hello World!</p>',
  plugins: [
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin,
    HeadingPlugin,
    LinkPlugin,
    TablePlugin
  ]
})

// 创建工具栏
const toolbar = new Toolbar(editor, {})
document.getElementById('toolbar').appendChild(toolbar.getElement())
```

### Vue 3

```vue
<template>
  <RichEditor v-model="content" :plugins="plugins" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RichEditor } from '@ldesign/editor/vue'
import {
  BoldPlugin,
  ItalicPlugin,
  HeadingPlugin,
  TablePlugin,
  FindReplacePlugin
} from '@ldesign/editor'
import '@ldesign/editor/style.css'

const content = ref('<p>Hello World!</p>')
const plugins = [
  BoldPlugin,
  ItalicPlugin,
  HeadingPlugin,
  TablePlugin,
  FindReplacePlugin
]
</script>
```

### React

```tsx
import { useState } from 'react'
import { RichEditor } from '@ldesign/editor/react'
import {
  BoldPlugin,
  ItalicPlugin,
  HeadingPlugin,
  TablePlugin
} from '@ldesign/editor'
import '@ldesign/editor/style.css'

function App() {
  const [content, setContent] = useState('<p>Hello World!</p>')

  return (
    <RichEditor
      value={content}
      onChange={setContent}
      plugins={[BoldPlugin, ItalicPlugin, HeadingPlugin, TablePlugin]}
    />
  )
}
```

## 📚 文档

访问 [完整文档](./docs) 了解更多信息。

## 🔌 内置插件

编辑器支持以下内置插件：

### 基础格式化
- `BoldPlugin` - 粗体 (Ctrl/Cmd + B)
- `ItalicPlugin` - 斜体 (Ctrl/Cmd + I)
- `UnderlinePlugin` - 下划线 (Ctrl/Cmd + U)
- `StrikePlugin` - 删除线
- `CodePlugin` - 行内代码
- `ClearFormatPlugin` - 清除格式

### 标题
- `HeadingPlugin` - 标题 (H1-H6)

### 列表
- `BulletListPlugin` - 无序列表
- `OrderedListPlugin` - 有序列表
- `TaskListPlugin` - 任务列表

### 块级元素
- `BlockquotePlugin` - 引用块
- `CodeBlockPlugin` - 代码块
- `HorizontalRulePlugin` - 分割线

### 内联元素
- `LinkPlugin` - 链接 (Ctrl/Cmd + K)
- `ImagePlugin` - 图片
- `SuperscriptPlugin` - 上标
- `SubscriptPlugin` - 下标

### 表格
- `TablePlugin` - 表格插入和编辑
  - 可视化表格选择器
  - 添加/删除行和列
  - 表格样式自定义

### 样式和格式
- `TextColorPlugin` - 文本颜色
- `BackgroundColorPlugin` - 背景颜色
- `FontSizePlugin` - 字体大小
- `FontFamilyPlugin` - 字体家族
- `LineHeightPlugin` - 行高调整 ⭐新增
- `AlignPlugin` - 文本对齐
- `IndentPlugin` - 缩进

### 文本转换 ⭐新增
- `TextTransformPlugin` - 综合文本转换
- `UpperCasePlugin` - 转大写
- `LowerCasePlugin` - 转小写
- `CapitalizePlugin` - 首字母大写
- 支持全角半角转换

### 工具功能
- `FindReplacePlugin` - 查找替换 (Ctrl/Cmd + F) ⭐新增
  - 支持正则表达式
  - 区分大小写
  - 全字匹配
  - 批量替换
- `HistoryPlugin` - 撤销/重做 (Ctrl/Cmd + Z / Ctrl/Cmd + Shift + Z)
- `FullscreenPlugin` - 全屏模式

## 🎨 高级功能

### 改进的颜色选择器 ⭐新增

颜色选择器现在支持：
- HEX 颜色输入
- 最近使用的颜色历史
- 预设颜色面板
- 系统颜色选择器

```typescript
import { TextColorPlugin, BackgroundColorPlugin } from '@ldesign/editor'

const editor = new Editor({
  plugins: [TextColorPlugin, BackgroundColorPlugin]
})
```

### 表格功能

使用友好的可视化界面插入表格：

```typescript
import { TablePlugin } from '@ldesign/editor'

const editor = new Editor({
  plugins: [TablePlugin]
})

// 通过命令插入表格
editor.commands.execute('insertTable')

// 表格操作
editor.commands.execute('addTableRow')
editor.commands.execute('addTableColumn')
editor.commands.execute('deleteTable')
```

### 查找替换 ⭐新增

强大的查找替换功能：

```typescript
import { FindReplacePlugin } from '@ldesign/editor'

const editor = new Editor({
  plugins: [FindReplacePlugin]
})

// 打开查找替换对话框
editor.commands.execute('openFindReplace')

// 或使用快捷键 Ctrl/Cmd + F
```

### 行高调整 ⭐新增

调整段落行高：

```typescript
import { LineHeightPlugin, LINE_HEIGHTS } from '@ldesign/editor'

const editor = new Editor({
  plugins: [LineHeightPlugin]
})

// 设置行高
editor.commands.execute('setLineHeight', '1.5')

// 可用的行高值
console.log(LINE_HEIGHTS) // ['1.0', '1.15', '1.5', '1.75', '2.0', '2.5', '3.0']
```

### 文本转换 ⭐新增

各种文本格式转换：

```typescript
import { TextTransformPlugin } from '@ldesign/editor'

const editor = new Editor({
  plugins: [TextTransformPlugin]
})

// 转换为大写
editor.commands.execute('toUpperCase')

// 转换为小写
editor.commands.execute('toLowerCase')

// 首字母大写
editor.commands.execute('toCapitalize')

// 句子大小写
editor.commands.execute('toSentenceCase')

// 全角转半角
editor.commands.execute('toHalfWidth')

// 半角转全角
editor.commands.execute('toFullWidth')
```

## 🛠️ 自定义插件

创建自定义插件非常简单：

```typescript
import { createPlugin } from '@ldesign/editor'

const EmojiPlugin = createPlugin({
  name: 'emoji',
  commands: {
    insertEmoji: (state, dispatch, emoji: string) => {
      if (!dispatch) return true
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return false

      const range = selection.getRangeAt(0)
      range.insertNode(document.createTextNode(emoji))
      return true
    }
  },
  toolbar: [{
    name: 'emoji',
    title: '插入表情',
    icon: 'smile',
    command: (state, dispatch) => {
      // 自定义命令逻辑
      return true
    }
  }]
})

const editor = new Editor({
  plugins: [EmojiPlugin]
})

// 使用自定义命令
editor.commands.execute('insertEmoji', '😀')
```

## ⌨️ 快捷键

编辑器支持以下快捷键：

| 快捷键 | 功能 |
|--------|------|
| Ctrl/Cmd + B | 粗体 |
| Ctrl/Cmd + I | 斜体 |
| Ctrl/Cmd + U | 下划线 |
| Ctrl/Cmd + K | 插入链接 |
| Ctrl/Cmd + Z | 撤销 |
| Ctrl/Cmd + Shift + Z | 重做 |
| Ctrl/Cmd + F | 查找替换 ⭐新增 |
| Ctrl/Cmd + \\ | 清除格式 |
| Ctrl/Cmd + Alt + 1-6 | 设置标题 1-6 |
| Ctrl/Cmd + Shift + 7 | 有序列表 |
| Ctrl/Cmd + Shift + 8 | 无序列表 |

## 🎯 TypeScript 支持

编辑器提供完整的 TypeScript 类型定义：

```typescript
import type { Editor, Plugin, Command, EditorOptions } from '@ldesign/editor'

const options: EditorOptions = {
  element: document.getElementById('editor'),
  content: '<p>Hello World!</p>',
  plugins: []
}
```

## 🌈 主题定制

编辑器支持完全自定义样式：

```css
/* 自定义编辑器样式 */
.ldesign-editor {
  border: 2px solid #3b82f6;
  border-radius: 12px;
}

.ldesign-editor-toolbar {
  background: linear-gradient(to right, #3b82f6, #8b5cf6);
}

.ldesign-editor-content {
  font-family: 'Georgia', serif;
  font-size: 16px;
  line-height: 1.8;
}

/* 暗色主题 */
.ldesign-editor.dark {
  background: #1f2937;
  color: #f9fafb;
}
```

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

## 🤝 贡献

欢迎贡献！请查看 [贡献指南](./CONTRIBUTING.md) 了解更多信息。

## 📄 License

MIT © LDesign

---

## 更新日志

### v1.1.0 (最新)

**新增功能：**
- ⭐ 查找替换功能 - 支持正则表达式、区分大小写、全字匹配
- ⭐ 行高调整 - 7 种行高选项
- ⭐ 文本转换 - 大���写转换、全角半角转换
- ⭐ 改进的颜色选择器 - HEX 输入、最近使用颜色
- ⭐ 可视化表格插入 - 替换原有的 prompt 方式

**改进：**
- 优化工具栏布局和分隔符
- 改进对话框 UI 设计
- 增强颜色选择体验
- 更好的快捷键支持

### v1.0.0

初始发布
