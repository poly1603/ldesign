# @ldesign/editor 示例项目

这是一个使用 Vite + TypeScript 构建的完整富文本编辑器示例项目，展示了如何在不同场景下使用 @ldesign/editor。

## 📦 包含的示例

### 1. 基础示例（原生 JavaScript + TypeScript）
- 完整的富文本编辑器功能
- 所有内置插件的使用
- HTML 和 JSON 输出展示
- 实时内容更新

### 2. Vue 3 示例
- Vue 3 组件集成
- Composition API 使用
- 响应式数据绑定
- 模板加载功能
- 实时字数统计

### 3. React 示例
- React 18 组件集成
- Hooks API 使用
- 受控组件模式
- Ref 访问编辑器方法
- 模板切换功能

### 4. 高级功能示例
- 表格创建和编辑
- 自定义插件开发
- 快捷键参考
- 主题定制（亮色/暗色）

## 🚀 快速开始

### 安装依赖

```bash
npm install
# 或
pnpm install
# 或
yarn install
```

> **提示**: 编辑器图标已内置，无需额外安装 Lucide 或其他图标库。

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看示例。

### 构建

```bash
npm run build
```

## 📂 项目结构

```
examples/
├── src/
│   ├── main.ts                 # 主入口文件
│   ├── app.ts                  # 应用主文件（导航和路由）
│   ├── examples/               # 示例文件夹
│   │   ├── basic.ts           # 基础示例
│   │   ├── vue-example.ts     # Vue 3 示例
│   │   ├── react-example.tsx  # React 示例
│   │   └── advanced.ts        # 高级功能示例
│   └── styles/
│       └── main.css           # 主样式文件
├── index.html                  # HTML 入口
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## 💡 功能特性

### 文本格式化
- ✅ 粗体、斜体、下划线、删除线
- ✅ 行内代码
- ✅ 清除格式

### 标题和段落
- ✅ H1-H6 标题
- ✅ 普通段落
- ✅ 引用块

### 列表
- ✅ 无序列表
- ✅ 有序列表
- ✅ 任务列表

### 富媒体
- ✅ 插入链接
- ✅ 上传图片
- ✅ 图片预览

### 表格
- ✅ 创建表格
- ✅ 添加行/列
- ✅ 删除表格

### 代码
- ✅ 代码块
- ✅ 语法高亮

### 历史记录
- ✅ 撤销操作
- ✅ 重做操作

### 对齐
- ✅ 左对齐
- ✅ 居中对齐
- ✅ 右对齐
- ✅ 两端对齐

## ⌨️ 快捷键

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
| `Ctrl/Cmd + Shift + B` | 引用块 |
| `Ctrl/Cmd + Alt + C` | 代码块 |

## 🎨 自定义主题

编辑器支持主题定制。你可以通过 CSS 变量来自定义颜色：

```css
.ldesign-editor {
  --editor-border-color: #e5e7eb;
  --editor-bg-color: #fff;
  --editor-text-color: #1f2937;
  --editor-toolbar-bg: #f9fafb;
}

/* 暗色主题 */
.ldesign-editor.dark {
  --editor-border-color: #374151;
  --editor-bg-color: #1f2937;
  --editor-text-color: #f9fafb;
  --editor-toolbar-bg: #111827;
}
```

## 📚 示例代码

### 原生 JavaScript

```typescript
import { Editor, Toolbar } from '@ldesign/editor'
import { BoldPlugin, ItalicPlugin } from '@ldesign/editor'
import '@ldesign/editor/style.css'

const editor = new Editor({
  element: '#editor',
  content: '<p>Hello World!</p>',
  plugins: [BoldPlugin, ItalicPlugin]
})

const toolbar = new Toolbar(editor, {
  container: document.getElementById('toolbar')
})
```

### Vue 3

```vue
<template>
  <RichEditor
    v-model="content"
    :plugins="plugins"
    :show-toolbar="true"
    placeholder="开始编写..."
  />
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
      showToolbar={true}
    />
  )
}
```

## 🔧 自定义插件

创建自定义插件非常简单：

```typescript
import { createPlugin } from '@ldesign/editor'

const MyPlugin = createPlugin({
  name: 'myPlugin',
  commands: {
    myCommand: (state, dispatch) => {
      if (!dispatch) return true
      // 实现你的命令逻辑
      return true
    }
  },
  keys: {
    'Ctrl-M': (state, dispatch) => {
      // 处理快捷键
      return true
    }
  }
})

// 使用插件
const editor = new Editor({
  element: '#editor',
  plugins: [MyPlugin]
})
```

## 📖 更多资源

- [完整文档](../docs)
- [API 参考](../docs/api)
- [插件开发指南](../docs/plugins/custom.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
