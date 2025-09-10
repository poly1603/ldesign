# 快速开始

本指南将帮助你快速上手 LDesign Editor，在几分钟内创建一个功能完整的富文本编辑器。

## 安装

首先，使用你喜欢的包管理器安装 LDesign Editor：

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

### 1. 引入样式和脚本

```typescript
import { LDesignEditor } from '@ldesign/editor'
import '@ldesign/editor/dist/style.css'
```

### 2. 创建容器元素

```html
<div id="editor"></div>
```

### 3. 初始化编辑器

```typescript
// 创建编辑器实例
const editor = new LDesignEditor({
  container: '#editor',
  content: '<p>欢迎使用 LDesign Editor！</p>',
  placeholder: '请输入内容...'
})

// 初始化编辑器
editor.init()
```

## 完整示例

这是一个完整的 HTML 示例：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LDesign Editor 示例</title>
  <link rel="stylesheet" href="https://unpkg.com/@ldesign/editor/dist/style.css">
  <style>
    .editor-container {
      max-width: 800px;
      margin: 50px auto;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      min-height: 300px;
    }
  </style>
</head>
<body>
  <div id="editor" class="editor-container"></div>

  <script type="module">
    import { LDesignEditor } from 'https://unpkg.com/@ldesign/editor/dist/index.js'

    const editor = new LDesignEditor({
      container: '#editor',
      content: '<p>欢迎使用 LDesign Editor！</p><p>这是一个功能完整的富文本编辑器。</p>',
      placeholder: '请输入内容...',
      onChange: (content) => {
        console.log('内容变更:', content)
      }
    })

    editor.init()
  </script>
</body>
</html>
```

## 配置选项

LDesign Editor 提供了丰富的配置选项：

```typescript
const editor = new LDesignEditor({
  // 必需：容器元素
  container: '#editor',
  
  // 可选：初始内容
  content: '<p>初始内容</p>',
  
  // 可选：占位符文本
  placeholder: '请输入内容...',
  
  // 可选：启用的插件列表
  plugins: ['bold', 'italic', 'underline', 'heading', 'list'],
  
  // 可选：主题配置
  theme: 'default', // 'default' | 'dark' | 'minimal'
  
  // 可选：是否只读
  readonly: false,
  
  // 可选：是否启用拼写检查
  spellcheck: true,
  
  // 可选：响应式断点配置
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  },
  
  // 可选：事件回调
  onChange: (content) => {
    console.log('内容变更:', content)
  },
  
  onSelectionChange: (selection) => {
    console.log('选区变更:', selection)
  },
  
  onFocus: () => {
    console.log('编辑器获得焦点')
  },
  
  onBlur: () => {
    console.log('编辑器失去焦点')
  }
})
```

## 常用方法

### 内容操作

```typescript
// 获取内容
const content = editor.getContent()

// 设置内容
editor.setContent('<p>新的内容</p>')

// 插入内容
editor.insertContent('<strong>插入的文本</strong>')

// 清空内容
editor.clear()
```

### 状态控制

```typescript
// 设置只读模式
editor.setReadonly(true)

// 获取编辑器状态
const state = editor.state
console.log(state.readonly, state.content, state.deviceType)
```

### 主题切换

```typescript
// 切换到暗色主题
editor.themes.setTheme('dark')

// 获取当前主题
const currentTheme = editor.themes.getCurrentTheme()

// 获取所有可用主题
const themes = editor.themes.getAllThemes()
```

### 插件管理

```typescript
// 启用插件
editor.plugins.enable('bold')

// 禁用插件
editor.plugins.disable('bold')

// 检查插件状态
const isEnabled = editor.plugins.isEnabled('bold')
```

### 命令执行

```typescript
// 执行格式化命令
editor.commands.execute('bold')
editor.commands.execute('italic')
editor.commands.execute('heading1')

// 检查命令状态
const canExecute = editor.commands.canExecute('bold')
const isActive = editor.commands.isActive('bold')
```

## 事件监听

```typescript
// 监听内容变更
editor.events.on('contentChange', (data) => {
  console.log('内容变更:', data.content)
})

// 监听选区变更
editor.events.on('selectionChange', (data) => {
  console.log('选区变更:', data.selection)
})

// 监听主题变更
editor.events.on('themeChange', (data) => {
  console.log('主题变更:', data.theme)
})

// 监听设备变更
editor.events.on('deviceChange', (data) => {
  console.log('设备变更:', data.device)
})
```

## 销毁编辑器

当不再需要编辑器时，记得销毁它以释放资源：

```typescript
// 销毁编辑器
editor.destroy()
```

## 下一步

现在你已经掌握了 LDesign Editor 的基础使用方法。接下来你可以：

- 了解 [插件系统](/guide/plugins) 来扩展编辑器功能
- 学习 [主题系统](/guide/themes) 来定制编辑器外观
- 查看 [框架集成](/guide/vue-integration) 来在你的项目中使用
- 浏览 [API 文档](/api/editor) 了解更多高级功能

如果遇到问题，可以查看 [常见问题](/guide/faq) 或在 GitHub 上提交 Issue。
