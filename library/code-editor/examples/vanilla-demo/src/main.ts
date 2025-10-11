import { createCodeEditor } from '@ldesign/code-editor'
import type { ICodeEditor } from '@ldesign/code-editor'
import './style.css'

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

// 初始化编辑器
let editor1: ICodeEditor | null = null
let editor2: ICodeEditor | null = null
let editor3: ICodeEditor | null = null
let editor4: ICodeEditor | null = null
let editor5: ICodeEditor | null = null

// 示例 1: 基础示例
editor1 = createCodeEditor('#editor1', {
  value: jsCode,
  language: 'javascript',
  theme: 'vs-dark',
  height: '300px'
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

// 示例 2: 主题和��言切换
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
      case 'typescript':
        editor2.setValue(language === 'javascript' ? jsCode : tsCode)
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
  editor1?.dispose()
  editor2?.dispose()
  editor3?.dispose()
  editor4?.dispose()
  editor5?.dispose()
})
