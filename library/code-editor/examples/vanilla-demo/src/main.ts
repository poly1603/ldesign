import { createCodeEditor, createEnhancedCodeEditor } from '@ldesign/code-editor'
import type { ICodeEditor, LoadingState } from '@ldesign/code-editor'
import './style.css'
import './advanced-demo' // 导入高级功能演示

// 示例代码
const jsCode = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 打印前 10 个斐波那契数
for (let i = 0; i < 10; i++) {
  console.log(\`fibonacci(\${i}) = \${fibonacci(i)}\`);
}
`

const tsCode = `interface User {
  id: number;
  name: string;
  email: string;
}

class UserService {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  getUserById(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }
}

const service = new UserService();
service.addUser({ id: 1, name: 'Alice', email: 'alice@example.com' });
`

const vueCode = `<template>
  <div class="hello">
    <h1>{{ message }}</h1>
    <button @click="handleClick">点击我</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const message = ref('Hello Vue 3!')

const handleClick = () => {
  message.value = 'You clicked the button!'
}
</script>

<style scoped>
.hello {
  text-align: center;
  padding: 20px;
}
</style>
`

const tsxCode = `import React, { useState } from 'react'

interface Props {
  title: string
}

const Counter: React.FC<Props> = ({ title }) => {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}

export default Counter
`

const htmlCode = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>示例页面</title>
  <style>
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello World</h1>
  </div>
</body>
</html>
`

const emmetExample = `<!-- 试试输入以下 Emmet 缩写: -->
<!-- div.container -->
<!-- ul>li*3 -->
<!-- table>tr*2>td*3 -->

<div class="example">
  <!-- 在这里输入 Emmet 缩写 -->
</div>
`

// 初始化编辑器
let editorEnhanced: ICodeEditor | null = null
let editorVue: ICodeEditor | null = null
let editorTsx: ICodeEditor | null = null
let editorEmmet: ICodeEditor | null = null
let editor1: ICodeEditor | null = null
let editor2: ICodeEditor | null = null
let editorSnippets: ICodeEditor | null = null
let editor3: ICodeEditor | null = null
let editor4: ICodeEditor | null = null
let editor5: ICodeEditor | null = null

// 示例: 增强型编辑器（带 Loading）
editorEnhanced = createEnhancedCodeEditor('#editor-enhanced', {
  value: jsCode,
  language: 'javascript',
  theme: 'vs-dark',
  showLoading: true,
  loadingText: '正在初始化编辑器...',
  plugins: {
    emmet: true,
    snippets: true,
    bracketMatching: true,
    autoClosingTags: true
  },
  onLoadingChange: (state: LoadingState) => {
    const statusEl = document.getElementById('loadingStatus')
    const progressEl = document.getElementById('loadingProgress')
    const messageEl = document.getElementById('loadingMessage')

    if (statusEl) statusEl.textContent = state.isLoading ? '加载中' : '完成'
    if (progressEl) progressEl.textContent = `${state.progress}%`
    if (messageEl) messageEl.textContent = state.message
  }
})

// 示例: Vue 代码高亮
editorVue = createEnhancedCodeEditor('#editor-vue', {
  value: vueCode,
  language: 'vue',
  theme: 'vs-dark',
  plugins: {
    emmet: true
  }
})

// 示例: TSX 代码高亮
editorTsx = createEnhancedCodeEditor('#editor-tsx', {
  value: tsxCode,
  language: 'tsx',
  theme: 'vs-dark'
})

// 示例: Emmet 代码补全
editorEmmet = createEnhancedCodeEditor('#editor-emmet', {
  value: emmetExample,
  language: 'html',
  theme: 'vs-dark',
  plugins: {
    emmet: true
  }
})

// 示例 1: 基础示例
editor1 = createCodeEditor('#editor1', {
  value: jsCode,
  language: 'javascript',
  theme: 'vs-dark'
})

// 基础操作按钮
document.getElementById('getValue')?.addEventListener('click', () => {
  if (editor1) {
    alert(editor1.getValue())
  }
})

document.getElementById('setValue')?.addEventListener('click', () => {
  if (editor1) {
    editor1.setValue('console.log("Hello from setValue!")')
  }
})

document.getElementById('format')?.addEventListener('click', async () => {
  if (editor1) {
    await editor1.format()
  }
})

document.getElementById('undo')?.addEventListener('click', () => {
  if (editor1) {
    editor1.undo()
  }
})

document.getElementById('redo')?.addEventListener('click', () => {
  if (editor1) {
    editor1.redo()
  }
})

// 示例 2: 主题和语言切换
editor2 = createCodeEditor('#editor2', {
  value: tsCode,
  language: 'typescript',
  theme: 'vs-dark'
})

document.getElementById('themeSelect')?.addEventListener('change', (e) => {
  const theme = (e.target as HTMLSelectElement).value
  if (editor2) {
    editor2.setTheme(theme as any)
  }
})

document.getElementById('languageSelect')?.addEventListener('change', (e) => {
  const language = (e.target as HTMLSelectElement).value
  if (editor2) {
    editor2.setLanguage(language as any)
    // 根据语言设置示例代码
    switch (language) {
      case 'javascript':
        editor2.setValue(jsCode)
        break
      case 'typescript':
        editor2.setValue(tsCode)
        break
      case 'vue':
        editor2.setValue(vueCode)
        break
      case 'tsx':
      case 'jsx':
        editor2.setValue(tsxCode)
        break
      case 'html':
        editor2.setValue(htmlCode)
        break
      case 'json':
        editor2.setValue('{\n  "name": "example",\n  "version": "1.0.0"\n}')
        break
      default:
        editor2.setValue(`// ${language} code here`)
    }
  }
})

// 示例: 代码片段补全
editorSnippets = createEnhancedCodeEditor('#editor-snippets', {
  value: '// 试试输入: log, func, arrow, foreach, map, filter, promise, async\n',
  language: 'javascript',
  theme: 'vs-dark',
  plugins: {
    snippets: true
  }
})

// 示例 3: 只读模式
editor3 = createCodeEditor('#editor3', {
  value: '// 这是只读模式的编辑器\n// 切换复选框可以改变只读状态',
  language: 'javascript',
  theme: 'vs-dark',
  readOnly: false
})

document.getElementById('readOnlyCheckbox')?.addEventListener('change', (e) => {
  const readOnly = (e.target as HTMLInputElement).checked
  if (editor3) {
    editor3.setReadOnly(readOnly)
  }
})

// 示例 4: 自定义配置
editor4 = createCodeEditor('#editor4', {
  value: jsCode,
  language: 'javascript',
  theme: 'vs-dark',
  minimap: true,
  lineNumbers: 'on',
  folding: true,
  fontSize: 14
})

document.getElementById('minimapCheckbox')?.addEventListener('change', (e) => {
  const enabled = (e.target as HTMLInputElement).checked
  if (editor4) {
    editor4.updateOptions({ minimap: enabled })
  }
})

document.getElementById('lineNumbersCheckbox')?.addEventListener('change', (e) => {
  const enabled = (e.target as HTMLInputElement).checked
  if (editor4) {
    editor4.updateOptions({ lineNumbers: enabled ? 'on' : 'off' })
  }
})

document.getElementById('foldingCheckbox')?.addEventListener('change', (e) => {
  const enabled = (e.target as HTMLInputElement).checked
  if (editor4) {
    editor4.updateOptions({ folding: enabled })
  }
})

document.getElementById('fontSizeInput')?.addEventListener('input', (e) => {
  const fontSize = parseInt((e.target as HTMLInputElement).value)
  if (editor4 && fontSize >= 10 && fontSize <= 30) {
    editor4.updateOptions({ fontSize })
  }
})

// 示例 5: 事件监听
const eventLog = document.getElementById('eventLog')
let eventCount = 0

function logEvent(event: string, data?: any) {
  eventCount++
  const logEntry = document.createElement('div')
  logEntry.className = 'log-entry'
  logEntry.textContent = `[${eventCount}] ${event}${data ? ': ' + JSON.stringify(data) : ''}`
  eventLog?.prepend(logEntry)

  // 只保留最近 10 条日志
  while (eventLog && eventLog.children.length > 10) {
    eventLog.removeChild(eventLog.lastChild!)
  }
}

editor5 = createCodeEditor('#editor5', {
  value: '// 在编辑器中输入内容，查看下方的事件日志',
  language: 'javascript',
  theme: 'vs-dark',
  on: {
    change: (value) => {
      logEvent('change', { length: value.length })
    },
    cursorChange: (position) => {
      logEvent('cursorChange', { line: position.lineNumber, column: position.column })
    },
    focus: () => {
      logEvent('focus')
    },
    blur: () => {
      logEvent('blur')
    },
    ready: () => {
      logEvent('ready')
    }
  }
})

// 清理
window.addEventListener('beforeunload', () => {
  editorEnhanced?.dispose()
  editorVue?.dispose()
  editorTsx?.dispose()
  editorEmmet?.dispose()
  editor1?.dispose()
  editor2?.dispose()
  editorSnippets?.dispose()
  editor3?.dispose()
  editor4?.dispose()
  editor5?.dispose()
})
