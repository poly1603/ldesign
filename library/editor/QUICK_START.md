# 快速启动指南

## 安装依赖

```bash
npm install
# 或
pnpm install
# 或
yarn install
```

> **注意**: 图标已内置，无需安装额外的图标库。

## 开发

启动开发服务器查看示例：

```bash
npm run dev
```

访问 http://localhost:5173 查看演示示例。

## 构建

构建生产版本：

```bash
npm run build
```

构建输出将位于 `dist` 目录。

## 文档

### 开发文档

```bash
npm run docs:dev
```

访问 http://localhost:5173 查看文档。

### 构建文档

```bash
npm run docs:build
```

## 项目结构

```
editor/
├── src/                    # 源代码
│   ├── core/              # 核心模块
│   │   ├── Editor.ts      # 编辑器主类
│   │   ├── Document.ts    # 文档模型
│   │   ├── Selection.ts   # 选区管理
│   │   ├── Command.ts     # 命令系统
│   │   ├── Plugin.ts      # 插件系统
│   │   ├── Schema.ts      # 文档结构
│   │   └── EventEmitter.ts # 事件系统
│   ├── plugins/           # 内置插件
│   │   ├── formatting.ts  # 基础格式化
│   │   ├── heading.ts     # 标题
│   │   ├── list.ts        # 列表
│   │   ├── link.ts        # 链接
│   │   ├── image.ts       # 图片
│   │   ├── table.ts       # 表格
│   │   └── ...
│   ├── adapters/          # 框架适配器
│   │   ├── vue/          # Vue 3 适配器
│   │   └── react/        # React 适配器
│   ├── ui/               # UI 组件
│   │   └── Toolbar.ts    # 工具栏
│   ├── styles/           # 样式文件
│   │   └── editor.css    # 编辑器样式
│   ├── types/            # 类型定义
│   │   └── index.ts
│   └── index.ts          # 入口文件
├── examples/              # 示例
│   ├── index.html        # 示例页面
│   └── main.ts           # 示例代码
├── docs/                  # 文档
│   ├── .vitepress/       # VitePress 配置
│   ├── guide/            # 指南
│   ├── api/              # API 文档
│   ├── plugins/          # 插件文档
│   └── examples/         # 示例文档
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 基础使用

### 原生 JavaScript

```typescript
import { Editor, BoldPlugin, ItalicPlugin } from '@ldesign/editor'
import '@ldesign/editor/style.css'

const editor = new Editor({
  element: '#editor',
  content: '<p>Hello World!</p>',
  plugins: [BoldPlugin, ItalicPlugin]
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
import { BoldPlugin, ItalicPlugin } from '@ldesign/editor'
import '@ldesign/editor/style.css'

const content = ref('<p>Hello World!</p>')
const plugins = [BoldPlugin, ItalicPlugin]
</script>
```

### React

```tsx
import { useState } from 'react'
import { RichEditor } from '@ldesign/editor/react'
import { BoldPlugin, ItalicPlugin } from '@ldesign/editor'
import '@ldesign/editor/style.css'

function App() {
  const [content, setContent] = useState('<p>Hello World!</p>')

  return (
    <RichEditor
      value={content}
      onChange={setContent}
      plugins={[BoldPlugin, ItalicPlugin]}
    />
  )
}
```

## 可用插件

- **基础格式化**: BoldPlugin, ItalicPlugin, UnderlinePlugin, StrikePlugin, CodePlugin
- **标题**: HeadingPlugin
- **列表**: BulletListPlugin, OrderedListPlugin, TaskListPlugin
- **块级元素**: BlockquotePlugin, CodeBlockPlugin
- **媒体**: LinkPlugin, ImagePlugin
- **表格**: TablePlugin
- **历史记录**: HistoryPlugin
- **对齐**: AlignPlugin

## 快捷键

- `Ctrl/Cmd + B` - 粗体
- `Ctrl/Cmd + I` - 斜体
- `Ctrl/Cmd + U` - 下划线
- `Ctrl/Cmd + K` - 插入链接
- `Ctrl/Cmd + Z` - 撤销
- `Ctrl/Cmd + Shift + Z` - 重做

## 更多信息

- [完整文档](./docs)
- [API 参考](./docs/api)
- [插件开发](./docs/plugins/custom.md)

## 许可证

MIT
