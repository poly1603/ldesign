# 编辑器标题功能修复方案

## 问题诊断

1. **命令未找到错误**：`Command 'setHeading3' not found`
2. **原因**：HeadingPlugin 未被正确加载到编辑器实例中
3. **根本原因**：当用户在编辑器选项中指定了 `plugins` 数组时，只有指定的插件会被加载，默认插件不会自动加载

## 解决方案

### 方案一：不指定插件列表（推荐）

让编辑器自动加载所有默认插件：

```javascript
import { Editor } from './src/index.ts'

const editor = new Editor({
  element: document.getElementById('editor'),
  // 不要指定 plugins 选项，让编辑器加载所有默认插件
  placeholder: '开始输入内容...',
  content: '<h1>标题</h1><p>段落内容</p>'
})
```

### 方案二：手动包含 HeadingPlugin

如果需要自定义插件列表，必须显式包含 HeadingPlugin：

```javascript
import { Editor } from './src/index.ts'
import { HeadingPlugin, BoldPlugin, ItalicPlugin } from './src/plugins/index.ts'

const editor = new Editor({
  element: document.getElementById('editor'),
  plugins: [
    HeadingPlugin,        // 必须包含此插件才能使用标题功能
    BoldPlugin,
    ItalicPlugin,
    // ... 其他需要的插件
  ],
  placeholder: '开始输入内容...'
})
```

### 方案三：使用所有插件加自定义插件

获取所有默认插件并添加自定义插件：

```javascript
import { Editor } from './src/index.ts'
import * as AllPlugins from './src/plugins/index.ts'

// 获取所有默认插件
const defaultPlugins = [
  AllPlugins.HeadingPlugin,
  AllPlugins.BoldPlugin,
  AllPlugins.ItalicPlugin,
  AllPlugins.UnderlinePlugin,
  AllPlugins.LinkPlugin,
  AllPlugins.ImagePlugin,
  AllPlugins.TablePlugin,
  // ... 添加所有需要的插件
]

const editor = new Editor({
  element: document.getElementById('editor'),
  plugins: defaultPlugins,
  placeholder: '开始输入内容...'
})
```

## 验证插件是否加载

加载后验证插件和命令：

```javascript
// 检查插件
console.log('已加载插件:', editor.plugins.getPlugins().map(p => p.name))

// 检查命令
console.log('已注册命令:', editor.commands.getCommands())

// 验证标题命令
const headingCommands = [
  'setParagraph',
  'setHeading1', 
  'setHeading2',
  'setHeading3',
  'setHeading4', 
  'setHeading5',
  'setHeading6'
]

headingCommands.forEach(cmd => {
  if (editor.commands.hasCommand(cmd)) {
    console.log(`✅ ${cmd} 命令已注册`)
  } else {
    console.error(`❌ ${cmd} 命令未找到`)
  }
})
```

## 动态标题级别显示

监听选区变化，更新工具栏显示：

```javascript
editor.on('selectionUpdate', (selection) => {
  const sel = window.getSelection()
  if (sel && sel.rangeCount > 0) {
    const node = sel.anchorNode
    if (node) {
      const block = node.nodeType === Node.TEXT_NODE 
        ? node.parentElement 
        : node
      
      if (block) {
        const tagName = block.tagName?.toLowerCase()
        let levelText = '段落'
        
        if (tagName && tagName.startsWith('h')) {
          const level = tagName.charAt(1)
          levelText = `标题 ${level}`
        }
        
        // 更新工具栏标题按钮
        const headingButton = document.querySelector('.ldesign-toolbar button[data-command="heading"]')
        if (headingButton) {
          const buttonText = headingButton.querySelector('.button-text')
          if (buttonText) {
            buttonText.textContent = levelText
          }
        }
      }
    }
  }
})
```

## 测试代码

完整的测试示例：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>编辑器标题功能测试</title>
</head>
<body>
  <div id="editor"></div>
  
  <script type="module">
    import { Editor } from './src/index.ts'
    
    // 创建编辑器，自动加载所有插件
    const editor = new Editor({
      element: document.getElementById('editor'),
      placeholder: '开始输入...',
      autofocus: true
    })
    
    // 验证功能
    window.editor = editor
    
    // 测试命令
    setTimeout(() => {
      editor.commands.execute('setHeading3')
      console.log('标题 3 命令执行成功')
    }, 1000)
  </script>
</body>
</html>
```

## 重要提示

1. **默认行为**：如果不指定 `plugins` 选项，编辑器会自动加载所有默认插件
2. **自定义插件**：一旦指定了 `plugins` 数组，只有数组中的插件会被加载
3. **HeadingPlugin 依赖**：标题和段落功能依赖 HeadingPlugin，必须确保它被加载
4. **命令注册**：插件的命令在插件加载时自动注册到 CommandManager

## 错误排查清单

- [ ] 确认没有在编辑器选项中指定空的或不完整的 `plugins` 数组
- [ ] 如果指定了 `plugins`，确认包含了 `HeadingPlugin`
- [ ] 检查控制台是否有插件加载错误
- [ ] 使用 `editor.commands.getCommands()` 验证命令是否注册
- [ ] 确保导入路径正确（使用 `.ts` 扩展名用于 Vite，或编译后的 `.js`）