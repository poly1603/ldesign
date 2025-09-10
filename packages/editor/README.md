# @ldesign/editor

LDesign 富文本编辑器 - 功能完整的富文本编辑器组件，支持模块化设计、插件系统、主题定制、响应式设计等特性。

## ✨ 特性

- 🎯 **框架无关** - 支持 Vue、React、Angular 等主流前端框架
- 🔌 **插件系统** - 强大的插件架构，支持第三方插件扩展
- 🎨 **主题定制** - 基于 CSS 变量的主题系统，支持深度定制
- 📱 **响应式设计** - 完美适配 PC、平板、手机等各种设备
- ⚡ **高性能** - 虚拟 DOM 渲染，支持大文档编辑
- 🛡️ **类型安全** - 完整的 TypeScript 类型定义
- 🧪 **测试覆盖** - 完整的单元测试和端到端测试

## 📦 安装

```bash
# 使用 npm
npm install @ldesign/editor

# 使用 yarn
yarn add @ldesign/editor

# 使用 pnpm
pnpm add @ldesign/editor
```

## 🚀 快速开始

### 原生 JavaScript

```javascript
import { LDesignEditor } from '@ldesign/editor'

// 创建编辑器实例
const editor = new LDesignEditor({
  container: '#editor',
  content: '<p>Hello World!</p>',
  plugins: ['bold', 'italic', 'underline']
})

// 初始化编辑器
editor.init()
```

### Vue 3

```vue
<template>
  <LDesignEditor
    v-model="content"
    :plugins="plugins"
    @change="handleChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import { LDesignEditor } from '@ldesign/editor/vue'

const content = ref('<p>Hello World!</p>')
const plugins = ['bold', 'italic', 'underline']

const handleChange = (newContent) => {
  console.log('Content changed:', newContent)
}
</script>
```

### React

```jsx
import React, { useState } from 'react'
import { LDesignEditor } from '@ldesign/editor/react'

function App() {
  const [content, setContent] = useState('<p>Hello World!</p>')
  
  return (
    <LDesignEditor
      value={content}
      onChange={setContent}
      plugins={['bold', 'italic', 'underline']}
    />
  )
}
```

## 🔧 配置选项

```javascript
const editor = new LDesignEditor({
  // 容器元素
  container: '#editor',
  
  // 初始内容
  content: '',
  
  // 启用的插件
  plugins: ['bold', 'italic', 'underline', 'heading', 'list'],
  
  // 主题配置
  theme: 'default',
  
  // 响应式断点
  breakpoints: {
    mobile: 768,
    tablet: 1024
  },
  
  // 工具栏配置
  toolbar: {
    position: 'top',
    sticky: true,
    items: ['bold', 'italic', 'heading']
  },
  
  // 事件回调
  onChange: (content) => console.log(content),
  onSelectionChange: (selection) => console.log(selection)
})
```

## 🔌 插件系统

### 内置插件

- **文本格式化**: `bold`, `italic`, `underline`, `strikethrough`
- **段落格式**: `heading`, `paragraph`, `blockquote`
- **列表**: `bulletList`, `orderedList`
- **插入功能**: `image`, `link`, `table`
- **工具功能**: `undo`, `redo`, `clear`

### 自定义插件

```javascript
import { Plugin } from '@ldesign/editor'

class CustomPlugin extends Plugin {
  name = 'custom'
  
  init() {
    // 插件初始化逻辑
  }
  
  execute(command, ...args) {
    // 命令执行逻辑
  }
  
  destroy() {
    // 插件销毁逻辑
  }
}

// 注册插件
editor.registerPlugin(new CustomPlugin())
```

## 🎨 主题定制

```css
/* 自定义主题变量 */
:root {
  --ldesign-editor-bg: #ffffff;
  --ldesign-editor-color: #333333;
  --ldesign-editor-border: #e5e5e5;
  --ldesign-toolbar-bg: #f8f9fa;
  --ldesign-button-hover: #e9ecef;
}
```

## 📱 响应式设计

编辑器自动适配不同设备：

- **PC 端** (>1024px): 完整功能工具栏
- **平板端** (768px-1024px): 简化工具栏
- **手机端** (<768px): 最小化工具栏，支持触摸操作

## 🛠️ API 参考

### 编辑器实例方法

```javascript
// 内容操作
editor.getContent()           // 获取内容
editor.setContent(content)    // 设置内容
editor.insertContent(content) // 插入内容

// 选区操作
editor.getSelection()         // 获取选区
editor.setSelection(range)    // 设置选区

// 命令执行
editor.executeCommand(name, ...args) // 执行命令

// 插件管理
editor.registerPlugin(plugin) // 注册插件
editor.unregisterPlugin(name) // 注销插件

// 生命周期
editor.init()                 // 初始化
editor.destroy()              // 销毁
```

### 事件系统

```javascript
// 监听事件
editor.on('change', (content) => {})
editor.on('selectionChange', (selection) => {})
editor.on('focus', () => {})
editor.on('blur', () => {})

// 移除事件监听
editor.off('change', handler)

// 触发事件
editor.emit('customEvent', data)
```

## 🧪 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test

# 测试覆盖率
pnpm test:coverage

# 端到端测试
pnpm test:e2e
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📚 文档

详细文档请访问：[LDesign Editor 文档](./docs/README.md)
