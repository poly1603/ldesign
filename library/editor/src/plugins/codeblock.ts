/**
 * 代码块插件
 */

import { createPlugin } from '../core/Plugin'
import type { Plugin, Command } from '../types'

/**
 * 创建代码编辑器对话框
 */
function createCodeEditorDialog(onInsert: (code: string, language: string) => void) {
  // 创建遮罩层
  const overlay = document.createElement('div')
  overlay.className = 'code-editor-overlay'
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
  `

  // 创建对话框
  const dialog = document.createElement('div')
  dialog.className = 'code-editor-dialog'
  dialog.style.cssText = `
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 800px;
    height: 600px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  `

  // 对话框头部
  const header = document.createElement('div')
  header.style.cssText = `
    padding: 16px 20px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  `

  const title = document.createElement('h3')
  title.textContent = '插入代码块'
  title.style.cssText = `
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
  `

  // 语言选择器容器
  const languageContainer = document.createElement('div')
  languageContainer.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
  `

  const languageLabel = document.createElement('label')
  languageLabel.textContent = '语言：'
  languageLabel.style.cssText = `
    font-size: 14px;
    color: #6b7280;
  `

  // 语言选择下拉框
  const languageSelect = document.createElement('select')
  languageSelect.style.cssText = `
    padding: 6px 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    background: white;
    color: #374151;
    cursor: pointer;
    outline: none;
    min-width: 150px;
  `

  // 常用编程语言列表
  const languages = [
    { value: 'plaintext', label: '纯文本' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'csharp', label: 'C#' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'sql', label: 'SQL' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'bash', label: 'Bash/Shell' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'yaml', label: 'YAML' },
  ]

  languages.forEach(lang => {
    const option = document.createElement('option')
    option.value = lang.value
    option.textContent = lang.label
    languageSelect.appendChild(option)
  })

  languageContainer.appendChild(languageLabel)
  languageContainer.appendChild(languageSelect)

  header.appendChild(title)
  header.appendChild(languageContainer)

  // 代码编辑区域
  const editorContainer = document.createElement('div')
  editorContainer.style.cssText = `
    flex: 1;
    padding: 20px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `

  const codeTextarea = document.createElement('textarea')
  codeTextarea.placeholder = '在此输入或粘贴代码...'
  codeTextarea.style.cssText = `
    width: 100%;
    flex: 1;
    padding: 16px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.6;
    resize: none;
    outline: none;
    background: #f9fafb;
    color: #1f2937;
  `

  // 聚焦时改变边框颜色
  codeTextarea.addEventListener('focus', () => {
    codeTextarea.style.borderColor = '#3b82f6'
    codeTextarea.style.background = '#fff'
  })

  codeTextarea.addEventListener('blur', () => {
    codeTextarea.style.borderColor = '#d1d5db'
    codeTextarea.style.background = '#f9fafb'
  })

  editorContainer.appendChild(codeTextarea)

  // 按钮容器
  const footer = document.createElement('div')
  footer.style.cssText = `
    padding: 16px 20px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    flex-shrink: 0;
  `

  const cancelButton = document.createElement('button')
  cancelButton.textContent = '取消'
  cancelButton.style.cssText = `
    padding: 8px 20px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: white;
    color: #374151;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  `

  cancelButton.addEventListener('mouseenter', () => {
    cancelButton.style.background = '#f3f4f6'
  })

  cancelButton.addEventListener('mouseleave', () => {
    cancelButton.style.background = 'white'
  })

  const insertButton = document.createElement('button')
  insertButton.textContent = '插入代码'
  insertButton.style.cssText = `
    padding: 8px 20px;
    border: none;
    border-radius: 6px;
    background: #3b82f6;
    color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  `

  insertButton.addEventListener('mouseenter', () => {
    insertButton.style.background = '#2563eb'
  })

  insertButton.addEventListener('mouseleave', () => {
    insertButton.style.background = '#3b82f6'
  })

  // 关闭对话框
  const closeDialog = () => {
    overlay.remove()
  }

  // 插入代码
  const handleInsert = () => {
    const code = codeTextarea.value.trim()
    if (code) {
      onInsert(code, languageSelect.value)
      closeDialog()
    } else {
      // 如果没有输入代码，提示用户
      codeTextarea.style.borderColor = '#ef4444'
      codeTextarea.placeholder = '请输入代码内容'
      setTimeout(() => {
        codeTextarea.style.borderColor = '#d1d5db'
        codeTextarea.placeholder = '在此输入或粘贴代码...'
      }, 2000)
    }
  }

  // 绑定事件
  cancelButton.addEventListener('click', closeDialog)
  insertButton.addEventListener('click', handleInsert)

  // 点击遮罩层关闭
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeDialog()
    }
  })

  // ESC键关闭
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeDialog()
    } else if (e.key === 'Enter' && e.ctrlKey) {
      // Ctrl+Enter 插入代码
      handleInsert()
    }
  }
  document.addEventListener('keydown', handleKeydown)

  // 清理事件监听器
  const originalRemove = overlay.remove
  overlay.remove = function() {
    document.removeEventListener('keydown', handleKeydown)
    originalRemove.call(overlay)
  }

  footer.appendChild(cancelButton)
  footer.appendChild(insertButton)

  dialog.appendChild(header)
  dialog.appendChild(editorContainer)
  dialog.appendChild(footer)
  overlay.appendChild(dialog)

  document.body.appendChild(overlay)

  // 自动聚焦到文本框
  setTimeout(() => {
    codeTextarea.focus()
  }, 50)

  return { overlay, codeTextarea, languageSelect }
}

/**
 * 应用语法高亮
 */
function applySyntaxHighlighting(codeElement: HTMLElement, language: string) {
  const code = codeElement.textContent || ''
  
  // 基础的语法高亮规则
  const highlighters: Record<string, (code: string) => string> = {
    javascript: highlightJavaScript,
    typescript: highlightJavaScript, // TypeScript uses similar highlighting
    python: highlightPython,
    html: highlightHTML,
    css: highlightCSS,
    json: highlightJSON,
    sql: highlightSQL,
    java: highlightJava,
    cpp: highlightCpp,
    csharp: highlightCSharp,
  }

  const highlighter = highlighters[language]
  if (highlighter) {
    codeElement.innerHTML = highlighter(code)
  }
}

// JavaScript/TypeScript 高亮
function highlightJavaScript(code: string): string {
  // 保存字符串和注释，避免内部内容被高亮
  const strings: string[] = []
  const comments: string[] = []
  let stringIndex = 0
  let commentIndex = 0

  // 提取字符串
  code = code.replace(/(["'`])(?:(?=(\\?))\2[\s\S])*?\1/g, (match) => {
    strings.push(match)
    return `__STRING_${stringIndex++}__`
  })

  // 提取注释
  code = code.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, (match) => {
    comments.push(match)
    return `__COMMENT_${commentIndex++}__`
  })

  // 关键字
  const keywords = /\b(async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|function|if|import|in|instanceof|let|new|of|return|super|switch|this|throw|try|typeof|var|void|while|with|yield|enum|implements|interface|package|private|protected|public|static|from|as)\b/g
  code = code.replace(keywords, '<span style="color: #c678dd; font-weight: 600;">$1</span>')

  // 内置对象和方法
  const builtins = /\b(console|window|document|Math|Array|Object|String|Number|Boolean|Date|RegExp|Error|JSON|Promise|Map|Set|Symbol|parseInt|parseFloat|isNaN|isFinite)\b/g
  code = code.replace(builtins, '<span style="color: #e06c75;">$1</span>')

  // 函数名
  code = code.replace(/(\w+)(?=\s*\()/g, '<span style="color: #61afef;">$1</span>')

  // 数字
  code = code.replace(/\b(\d+(\.\d+)?([eE][+-]?\d+)?)\b/g, '<span style="color: #d19a66;">$1</span>')

  // 操作符
  code = code.replace(/([+\-*/%=<>!&|^~?:]+)/g, '<span style="color: #56b6c2;">$1</span>')

  // 还原注释
  for (let i = 0; i < comments.length; i++) {
    code = code.replace(`__COMMENT_${i}__`, `<span style="color: #5c6370; font-style: italic;">${escapeHtml(comments[i])}</span>`)
  }

  // 还原字符串
  for (let i = 0; i < strings.length; i++) {
    code = code.replace(`__STRING_${i}__`, `<span style="color: #98c379;">${escapeHtml(strings[i])}</span>`)
  }

  return code
}

// Python 高亮
function highlightPython(code: string): string {
  // 保存字符串和注释
  const strings: string[] = []
  const comments: string[] = []
  let stringIndex = 0
  let commentIndex = 0

  // 提取字符串
  code = code.replace(/(["'])(?:(?=(\\?))\2[\s\S])*?\1/g, (match) => {
    strings.push(match)
    return `__STRING_${stringIndex++}__`
  })

  // 提取注释
  code = code.replace(/(#.*$)/gm, (match) => {
    comments.push(match)
    return `__COMMENT_${commentIndex++}__`
  })

  // 关键字
  const keywords = /\b(and|as|assert|break|class|continue|def|del|elif|else|except|False|finally|for|from|global|if|import|in|is|lambda|None|nonlocal|not|or|pass|raise|return|True|try|while|with|yield)\b/g
  code = code.replace(keywords, '<span style="color: #c678dd; font-weight: 600;">$1</span>')

  // 内置函数
  const builtins = /\b(print|len|range|int|float|str|list|dict|set|tuple|bool|input|open|file|abs|all|any|bin|chr|dir|eval|exec|filter|format|help|hex|id|map|max|min|oct|ord|pow|round|sorted|sum|type|zip)\b/g
  code = code.replace(builtins, '<span style="color: #e06c75;">$1</span>')

  // 函数名
  code = code.replace(/def\s+(\w+)/g, 'def <span style="color: #61afef;">$1</span>')
  code = code.replace(/(\w+)(?=\s*\()/g, '<span style="color: #61afef;">$1</span>')

  // 数字
  code = code.replace(/\b(\d+(\.\d+)?([eE][+-]?\d+)?)\b/g, '<span style="color: #d19a66;">$1</span>')

  // 还原注释
  for (let i = 0; i < comments.length; i++) {
    code = code.replace(`__COMMENT_${i}__`, `<span style="color: #5c6370; font-style: italic;">${escapeHtml(comments[i])}</span>`)
  }

  // 还原字符串
  for (let i = 0; i < strings.length; i++) {
    code = code.replace(`__STRING_${i}__`, `<span style="color: #98c379;">${escapeHtml(strings[i])}</span>`)
  }

  return code
}

// HTML 高亮
function highlightHTML(code: string): string {
  // HTML标签
  code = code.replace(/(&lt;\/?)(\w+)(.*?)(&gt;)/g, (match, open, tag, attrs, close) => {
    let highlighted = `<span style="color: #56b6c2;">${open}</span>`
    highlighted += `<span style="color: #e06c75;">${tag}</span>`
    
    // 高亮属性
    if (attrs) {
      attrs = attrs.replace(/(\w+)(=)(["'])(.*?)\3/g, 
        '<span style="color: #d19a66;">$1</span><span style="color: #56b6c2;">$2</span><span style="color: #98c379;">$3$4$3</span>'
      )
      highlighted += attrs
    }
    
    highlighted += `<span style="color: #56b6c2;">${close}</span>`
    return highlighted
  })

  // HTML注释
  code = code.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span style="color: #5c6370; font-style: italic;">$1</span>')

  return code
}

// CSS 高亮
function highlightCSS(code: string): string {
  // CSS选择器
  code = code.replace(/([.#]?[\w-]+)(?=\s*\{)/g, '<span style="color: #e06c75;">$1</span>')
  
  // CSS属性
  code = code.replace(/([\w-]+)(?=\s*:)/g, '<span style="color: #61afef;">$1</span>')
  
  // CSS值
  code = code.replace(/:\s*([^;]+)/g, ': <span style="color: #98c379;">$1</span>')
  
  // 注释
  code = code.replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #5c6370; font-style: italic;">$1</span>')

  return code
}

// JSON 高亮
function highlightJSON(code: string): string {
  // 属性名
  code = code.replace(/"([^"]+)"(?=\s*:)/g, '<span style="color: #e06c75;">"$1"</span>')
  
  // 字符串值
  code = code.replace(/:\s*"([^"]*)"/g, ': <span style="color: #98c379;">"$1"</span>')
  
  // 数字
  code = code.replace(/\b(\d+(\.\d+)?([eE][+-]?\d+)?)\b/g, '<span style="color: #d19a66;">$1</span>')
  
  // 布尔值和null
  code = code.replace(/\b(true|false|null)\b/g, '<span style="color: #56b6c2;">$1</span>')

  return code
}

// SQL 高亮
function highlightSQL(code: string): string {
  // SQL关键字
  const keywords = /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DROP|ALTER|ADD|COLUMN|PRIMARY|KEY|FOREIGN|REFERENCES|INDEX|UNIQUE|NOT|NULL|DEFAULT|AUTO_INCREMENT|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|UNION|ALL|DISTINCT|COUNT|SUM|AVG|MIN|MAX|CASE|WHEN|THEN|ELSE|END|AND|OR|IN|EXISTS|BETWEEN|LIKE|IS)\b/gi
  code = code.replace(keywords, '<span style="color: #c678dd; font-weight: 600; text-transform: uppercase;">$1</span>')

  // 字符串
  code = code.replace(/(["'])(?:(?=(\\?))\2[\s\S])*?\1/g, '<span style="color: #98c379;">$&</span>')

  // 数字
  code = code.replace(/\b(\d+(\.\d+)?)\b/g, '<span style="color: #d19a66;">$1</span>')

  // 注释
  code = code.replace(/(--.*$)/gm, '<span style="color: #5c6370; font-style: italic;">$1</span>')

  return code
}

// Java 高亮
function highlightJava(code: string): string {
  // 保存字符串和注释
  const strings: string[] = []
  const comments: string[] = []
  let stringIndex = 0
  let commentIndex = 0

  // 提取字符串
  code = code.replace(/(["'])(?:(?=(\\?))\2[\s\S])*?\1/g, (match) => {
    strings.push(match)
    return `__STRING_${stringIndex++}__`
  })

  // 提取注释
  code = code.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, (match) => {
    comments.push(match)
    return `__COMMENT_${commentIndex++}__`
  })

  // 关键字
  const keywords = /\b(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|if|goto|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while)\b/g
  code = code.replace(keywords, '<span style="color: #c678dd; font-weight: 600;">$1</span>')

  // 类型
  code = code.replace(/\b(String|Integer|Double|Float|Boolean|Character|Byte|Short|Long|Object|Class|System|Math|Thread|Exception|RuntimeException)\b/g, '<span style="color: #e06c75;">$1</span>')

  // 函数名
  code = code.replace(/(\w+)(?=\s*\()/g, '<span style="color: #61afef;">$1</span>')

  // 数字
  code = code.replace(/\b(\d+(\.\d+)?[fFlLdD]?)\b/g, '<span style="color: #d19a66;">$1</span>')

  // 还原注释
  for (let i = 0; i < comments.length; i++) {
    code = code.replace(`__COMMENT_${i}__`, `<span style="color: #5c6370; font-style: italic;">${escapeHtml(comments[i])}</span>`)
  }

  // 还原字符串
  for (let i = 0; i < strings.length; i++) {
    code = code.replace(`__STRING_${i}__`, `<span style="color: #98c379;">${escapeHtml(strings[i])}</span>`)
  }

  return code
}

// C++ 高亮
function highlightCpp(code: string): string {
  // 保存字符串和注释
  const strings: string[] = []
  const comments: string[] = []
  let stringIndex = 0
  let commentIndex = 0

  // 提取字符串
  code = code.replace(/(["'])(?:(?=(\\?))\2[\s\S])*?\1/g, (match) => {
    strings.push(match)
    return `__STRING_${stringIndex++}__`
  })

  // 提取注释
  code = code.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, (match) => {
    comments.push(match)
    return `__COMMENT_${commentIndex++}__`
  })

  // 关键字
  const keywords = /\b(alignas|alignof|and|and_eq|asm|auto|bitand|bitor|bool|break|case|catch|char|char16_t|char32_t|class|compl|const|constexpr|const_cast|continue|decltype|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|false|float|for|friend|goto|if|inline|int|long|mutable|namespace|new|noexcept|not|not_eq|nullptr|operator|or|or_eq|private|protected|public|register|reinterpret_cast|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|true|try|typedef|typeid|typename|union|unsigned|using|virtual|void|volatile|wchar_t|while|xor|xor_eq)\b/g
  code = code.replace(keywords, '<span style="color: #c678dd; font-weight: 600;">$1</span>')

  // 预处理指令
  code = code.replace(/(#\w+)/g, '<span style="color: #e06c75;">$1</span>')

  // 函数名
  code = code.replace(/(\w+)(?=\s*\()/g, '<span style="color: #61afef;">$1</span>')

  // 数字
  code = code.replace(/\b(\d+(\.\d+)?[fFlLuU]?)\b/g, '<span style="color: #d19a66;">$1</span>')

  // 还原注释
  for (let i = 0; i < comments.length; i++) {
    code = code.replace(`__COMMENT_${i}__`, `<span style="color: #5c6370; font-style: italic;">${escapeHtml(comments[i])}</span>`)
  }

  // 还原字符串
  for (let i = 0; i < strings.length; i++) {
    code = code.replace(`__STRING_${i}__`, `<span style="color: #98c379;">${escapeHtml(strings[i])}</span>`)
  }

  return code
}

// C# 高亮
function highlightCSharp(code: string): string {
  // 保存字符串和注释
  const strings: string[] = []
  const comments: string[] = []
  let stringIndex = 0
  let commentIndex = 0

  // 提取字符串
  code = code.replace(/(["'])(?:(?=(\\?))\2[\s\S])*?\1/g, (match) => {
    strings.push(match)
    return `__STRING_${stringIndex++}__`
  })

  // 提取注释
  code = code.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, (match) => {
    comments.push(match)
    return `__COMMENT_${commentIndex++}__`
  })

  // 关键字
  const keywords = /\b(abstract|as|base|bool|break|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|do|double|else|enum|event|explicit|extern|false|finally|fixed|float|for|foreach|goto|if|implicit|in|int|interface|internal|is|lock|long|namespace|new|null|object|operator|out|override|params|private|protected|public|readonly|ref|return|sbyte|sealed|short|sizeof|stackalloc|static|string|struct|switch|this|throw|true|try|typeof|uint|ulong|unchecked|unsafe|ushort|using|var|virtual|void|volatile|while)\b/g
  code = code.replace(keywords, '<span style="color: #c678dd; font-weight: 600;">$1</span>')

  // 类型
  code = code.replace(/\b(String|Int32|Int64|Double|Float|Boolean|Char|Byte|Object|Decimal|DateTime|TimeSpan|Guid|Array|List|Dictionary|Task|Action|Func)\b/g, '<span style="color: #e06c75;">$1</span>')

  // 函数名
  code = code.replace(/(\w+)(?=\s*\()/g, '<span style="color: #61afef;">$1</span>')

  // 数字
  code = code.replace(/\b(\d+(\.\d+)?[fFmMdD]?)\b/g, '<span style="color: #d19a66;">$1</span>')

  // 还原注释
  for (let i = 0; i < comments.length; i++) {
    code = code.replace(`__COMMENT_${i}__`, `<span style="color: #5c6370; font-style: italic;">${escapeHtml(comments[i])}</span>`)
  }

  // 还原字符串
  for (let i = 0; i < strings.length; i++) {
    code = code.replace(`__STRING_${i}__`, `<span style="color: #98c379;">${escapeHtml(strings[i])}</span>`)
  }

  return code
}

// HTML转义函数
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

/**
 * 插入代码块
 */
const insertCodeBlock: Command = (state, dispatch) => {
  // dispatch 参数存在时才执行，这里直接执行
  
  // 保存当前的选区
  const editorContent = document.querySelector('.ldesign-editor-content') as HTMLElement
  if (!editorContent) {
    console.error('[CodeBlock] Editor content not found')
    return false
  }

  const selection = window.getSelection()
  let savedRange: Range | null = null

  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    if (editorContent.contains(range.commonAncestorContainer)) {
      savedRange = range.cloneRange()
    }
  }

  // 获取选中的文本（如果有）
  const selectedText = selection?.toString() || ''

  // 显示代码编辑器对话框
  const { codeTextarea } = createCodeEditorDialog((codeContent, language) => {
    // 恢复焦点到编辑器
    editorContent.focus()

    // 恢复或创建选区
    const currentSelection = window.getSelection()
    if (!currentSelection) return

    let range: Range
    if (savedRange && currentSelection) {
      range = savedRange
      currentSelection.removeAllRanges()
      currentSelection.addRange(range)
    } else {
      // 如果没有保存的选区，在编辑器末尾插入
      range = document.createRange()
      range.selectNodeContents(editorContent)
      range.collapse(false)
      currentSelection.removeAllRanges()
      currentSelection.addRange(range)
    }

    // 创建代码块容器
    const codeBlockContainer = document.createElement('div')
    codeBlockContainer.className = 'code-block-container'
    codeBlockContainer.style.cssText = `
      position: relative;
      margin: 16px 0;
      border-radius: 8px;
      overflow: hidden;
      background: #282c34;
      border: 1px solid #3a3f4a;
    `

    // 创建头部（显示语言和复制按钮）
    const header = document.createElement('div')
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      background: #21252b;
      border-bottom: 1px solid #3a3f4a;
      user-select: none;
    `

    // 语言标签
    const langLabel = document.createElement('span')
    langLabel.textContent = language && language !== 'plaintext' ? language.toUpperCase() : 'CODE'
    langLabel.style.cssText = `
      font-size: 12px;
      font-weight: 600;
      color: #7f848e;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    `

    // 复制按钮
    const copyButton = document.createElement('button')
    copyButton.textContent = '复制'
    copyButton.style.cssText = `
      padding: 4px 12px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      color: #abb2bf;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    `
    
    copyButton.onmouseover = () => {
      copyButton.style.background = 'rgba(255, 255, 255, 0.2)'
      copyButton.style.color = '#fff'
    }
    
    copyButton.onmouseout = () => {
      copyButton.style.background = 'rgba(255, 255, 255, 0.1)'
      copyButton.style.color = '#abb2bf'
    }

    copyButton.onclick = () => {
      const codeText = code.textContent || ''
      navigator.clipboard.writeText(codeText).then(() => {
        const originalText = copyButton.textContent
        copyButton.textContent = '已复制！'
        copyButton.style.background = '#4caf50'
        copyButton.style.borderColor = '#4caf50'
        copyButton.style.color = '#fff'
        setTimeout(() => {
          copyButton.textContent = originalText
          copyButton.style.background = 'rgba(255, 255, 255, 0.1)'
          copyButton.style.borderColor = 'rgba(255, 255, 255, 0.2)'
          copyButton.style.color = '#abb2bf'
        }, 2000)
      })
    }

    header.appendChild(langLabel)
    header.appendChild(copyButton)

    // 创建代码容器（包含行号和代码）
    const codeWrapper = document.createElement('div')
    codeWrapper.style.cssText = `
      display: flex;
      position: relative;
      overflow: auto;
      max-height: 600px;
    `

    // 行号容器
    const lineNumbers = document.createElement('div')
    lineNumbers.className = 'line-numbers'
    lineNumbers.style.cssText = `
      padding: 16px 8px;
      background: #21252b;
      color: #5c6370;
      text-align: right;
      user-select: none;
      font-family: Consolas, Monaco, "Courier New", monospace;
      font-size: 14px;
      line-height: 1.6;
      min-width: 40px;
      border-right: 1px solid #3a3f4a;
    `

    // 创建 pre 和 code 元素
    const pre = document.createElement('pre')
    const code = document.createElement('code')
    
    // 设置语言类（用于语法高亮）
    if (language && language !== 'plaintext') {
      code.className = `language-${language}`
      pre.setAttribute('data-language', language)
    }
    
    // 设置 pre 样式
    pre.style.cssText = `
      margin: 0;
      padding: 16px;
      background: transparent;
      overflow: visible;
      flex: 1;
    `
    
    // 设置 code 样式
    code.style.cssText = `
      display: block;
      color: #abb2bf;
      font-family: Consolas, Monaco, "Courier New", monospace;
      font-size: 14px;
      line-height: 1.6;
      white-space: pre;
      tab-size: 2;
      outline: none;
    `

    // 设置代码内容
    code.textContent = codeContent
    
    // 应用语法高亮
    if (language && language !== 'plaintext') {
      applySyntaxHighlighting(code, language)
    }

    // 更新行号
    function updateLineNumbers() {
      const lines = (code.textContent || '').split('\n')
      const lineNumbersHtml = lines.map((_, i) => `<div style="line-height: 1.6;">${i + 1}</div>`).join('')
      lineNumbers.innerHTML = lineNumbersHtml
    }

    // 初始化行号
    updateLineNumbers()

    // 使代码可编辑
    code.setAttribute('contenteditable', 'true')
    code.spellcheck = false

    // 组装代码块
    pre.appendChild(code)
    codeWrapper.appendChild(lineNumbers)
    codeWrapper.appendChild(pre)
    codeBlockContainer.appendChild(header)
    codeBlockContainer.appendChild(codeWrapper)
    
    // 处理代码块中的键盘事件
    code.addEventListener('keydown', (e) => {
      // 处理 Enter 键，插入换行符而不是新段落
      if (e.key === 'Enter') {
        e.preventDefault()
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          const textNode = document.createTextNode('\n')
          range.deleteContents()
          range.insertNode(textNode)
          range.setStartAfter(textNode)
          range.collapse(true)
          selection.removeAllRanges()
          selection.addRange(range)
        }
        // 更新行号
        setTimeout(updateLineNumbers, 0)
      }
      // 处理 Tab 键，插入制表符
      else if (e.key === 'Tab') {
        e.preventDefault()
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          const textNode = document.createTextNode('  ') // 使用2个空格代替制表符
          range.deleteContents()
          range.insertNode(textNode)
          range.setStartAfter(textNode)
          range.collapse(true)
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }
    })

    // 监听内容变化以更新行号和语法高亮
    code.addEventListener('input', () => {
      updateLineNumbers()
      // 保存光标位置
      const selection = window.getSelection()
      const range = selection?.getRangeAt(0)
      const offset = range?.startOffset || 0
      
      // 重新应用语法高亮
      if (language && language !== 'plaintext') {
        const plainText = code.textContent || ''
        applySyntaxHighlighting(code, language)
        
        // 恢复光标位置（简化版本）
        try {
          const newRange = document.createRange()
          if (code.firstChild) {
            newRange.setStart(code.firstChild, Math.min(offset, code.textContent?.length || 0))
            newRange.collapse(true)
            selection?.removeAllRanges()
            selection?.addRange(newRange)
          }
        } catch (e) {
          // 忽略光标恢复错误
        }
      }
    })
    
    // 删除选中的内容并插入代码块
    range.deleteContents()
    range.insertNode(codeBlockContainer)

    // 插入一个段落在代码块后面，以便可以继续编辑
    const p = document.createElement('p')
    p.innerHTML = '<br>'
    if (codeBlockContainer.nextSibling) {
      codeBlockContainer.parentNode?.insertBefore(p, codeBlockContainer.nextSibling)
    } else {
      codeBlockContainer.parentNode?.appendChild(p)
    }

    // 将光标移到段落中
    const newRange = document.createRange()
    newRange.selectNodeContents(p)
    newRange.collapse(true)
    currentSelection.removeAllRanges()
    currentSelection.addRange(newRange)

    // 触发输入事件以更新编辑器状态
    setTimeout(() => {
      const event = new Event('input', { bubbles: true, cancelable: true })
      editorContent.dispatchEvent(event)
    }, 0)
  })

  // 如果有选中的文本，自动填充到编辑器中
  if (selectedText) {
    codeTextarea.value = selectedText
  }

  return true
}

/**
 * 检查是否在代码块中
 */
function isCodeBlockActive() {
  return () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return false

    let node = selection.anchorNode
    while (node && node !== document.body) {
      if (node.nodeName === 'PRE') return true
      node = node.parentNode
    }
    return false
  }
}

/**
 * 代码块插件
 */
export const CodeBlockPlugin: Plugin = createPlugin({
  name: 'codeBlock',
  commands: {
    insertCodeBlock
  },
  keys: {
    'Mod-Alt-C': insertCodeBlock
  },
  toolbar: [{
    name: 'codeBlock',
    title: '代码块',
    icon: 'code-xml',
    command: insertCodeBlock,
    active: isCodeBlockActive()
  }]
})
