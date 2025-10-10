# 基础示例

这里展示了 @ldesign/editor 的基础使用方法。

## 最简示例

创建一个最简单的编辑器：

```typescript
import { Editor } from '@ldesign/editor'
import '@ldesign/editor/style.css'

const editor = new Editor({
  element: '#editor'
})
```

## 带初始内容

设置初始内容：

```typescript
const editor = new Editor({
  element: '#editor',
  content: `
    <h1>欢迎使用编辑器</h1>
    <p>这是一段初始内容。</p>
  `
})
```

## 添加占位符

添加占位符文本：

```typescript
const editor = new Editor({
  element: '#editor',
  placeholder: '请输入内容...'
})
```

## 监听内容变化

监听编辑器内容变化：

```typescript
const editor = new Editor({
  element: '#editor',
  onChange: (content) => {
    console.log('内容变化:', content)

    // 可以将内容保存到服务器
    saveToServer(content)
  }
})
```

## 只读模式

创建只读编辑器：

```typescript
const editor = new Editor({
  element: '#editor',
  content: '<p>这是只读内容</p>',
  editable: false
})
```

动态切换可编辑状态：

```typescript
// 切换为只读
editor.setEditable(false)

// 切换为可编辑
editor.setEditable(true)
```

## 自动聚焦

创建时自动聚焦：

```typescript
const editor = new Editor({
  element: '#editor',
  autofocus: true
})
```

手动控制聚焦：

```typescript
// 聚焦
editor.focus()

// 失焦
editor.blur()
```

## 完整示例

一个包含所有基础功能的完整示例：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>编辑器示例</title>
  <style>
    #app {
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
    }

    .actions {
      margin-top: 20px;
      display: flex;
      gap: 10px;
    }

    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background: #3b82f6;
      color: white;
      cursor: pointer;
    }

    button:hover {
      background: #2563eb;
    }

    .output {
      margin-top: 20px;
      padding: 16px;
      background: #f3f4f6;
      border-radius: 4px;
      max-height: 300px;
      overflow: auto;
    }
  </style>
</head>
<body>
  <div id="app">
    <h1>编辑器示例</h1>
    <div id="editor"></div>

    <div class="actions">
      <button onclick="getContent()">获取内容</button>
      <button onclick="setContent()">设置内容</button>
      <button onclick="clearContent()">清空</button>
      <button onclick="toggleEditable()">切换可编辑</button>
    </div>

    <div id="output" class="output" style="display: none;">
      <pre></pre>
    </div>
  </div>

  <script type="module">
    import { Editor } from '@ldesign/editor'
    import '@ldesign/editor/style.css'

    const editor = new Editor({
      element: '#editor',
      content: '<p>试着编辑这段文字...</p>',
      placeholder: '请输入内容...',
      onChange: (content) => {
        console.log('内容变化:', content)
      },
      onFocus: () => {
        console.log('编辑器获得焦点')
      },
      onBlur: () => {
        console.log('编辑器失去焦点')
      }
    })

    // 全局方法
    window.getContent = () => {
      const output = document.getElementById('output')
      const pre = output.querySelector('pre')
      output.style.display = 'block'
      pre.textContent = editor.getHTML()
    }

    window.setContent = () => {
      editor.setHTML('<h2>新内容</h2><p>这是通过 setHTML() 设置的内容。</p>')
    }

    window.clearContent = () => {
      editor.clear()
    }

    window.toggleEditable = () => {
      const isEditable = editor.isEditable()
      editor.setEditable(!isEditable)
      alert(isEditable ? '已设为只读' : '已设为可编辑')
    }
  </script>
</body>
</html>
```

## 使用插件

添加基础格式化插件：

```typescript
import {
  Editor,
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin
} from '@ldesign/editor'

const editor = new Editor({
  element: '#editor',
  plugins: [
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin
  ]
})
```

现在你可以使用快捷键：

- `Ctrl/Cmd + B` - 粗体
- `Ctrl/Cmd + I` - 斜体
- `Ctrl/Cmd + U` - 下划线

## 添加工具栏

创建带工具栏的编辑器：

```typescript
import { Editor, Toolbar, BoldPlugin, ItalicPlugin } from '@ldesign/editor'

const editor = new Editor({
  element: '#editor',
  plugins: [BoldPlugin, ItalicPlugin]
})

const toolbar = new Toolbar(editor, {
  container: document.getElementById('toolbar')
})
```

HTML 结构：

```html
<div id="toolbar"></div>
<div id="editor"></div>
```

## 下一步

- [Vue 示例](/examples/vue) - 在 Vue 中使用
- [React 示例](/examples/react) - 在 React 中使用
- [自定义插件](/examples/custom-plugin) - 开发自定义插件
