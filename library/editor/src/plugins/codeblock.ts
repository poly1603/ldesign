/**
 * 代码块插件
 */

import { createPlugin } from '../core/Plugin'
import type { Plugin, Command } from '../types'
import { showCodeBlockDialog } from '../ui/CodeBlockDialog'

// 扩展 Window 类型
declare global {
  interface Window {
    CodeMirror?: any
  }
}

// 代码编辑器主题配置
const CODE_THEMES = {
  oneDark: {
    name: 'One Dark',
    background: '#282c34',
    color: '#abb2bf',
    border: '#3a3f4a',
    lineNumber: '#5c6370',
    lineNumberBg: '#21252b',
  },
  vsLight: {
    name: 'VS Light',
    background: '#ffffff',
    color: '#000000',
    border: '#e5e7eb',
    lineNumber: '#6b7280',
    lineNumberBg: '#f9fafb',
  },
  monokai: {
    name: 'Monokai',
    background: '#272822',
    color: '#f8f8f2',
    border: '#49483e',
    lineNumber: '#75715e',
    lineNumberBg: '#1e1f1c',
  },
  dracula: {
    name: 'Dracula',
    background: '#282a36',
    color: '#f8f8f2',
    border: '#44475a',
    lineNumber: '#6272a4',
    lineNumberBg: '#1e1f29',
  },
}

// 不再需要内置的对话框代码，已移至 CodeBlockDialog.ts

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
    c: highlightCpp, // C uses similar highlighting to C++
    php: highlightJavaScript, // PHP uses similar highlighting for now
    ruby: highlightPython, // Ruby uses similar highlighting for now
    go: highlightJavaScript, // Go uses similar highlighting for now
    rust: highlightJavaScript, // Rust uses similar highlighting for now
    swift: highlightJavaScript, // Swift uses similar highlighting for now
    kotlin: highlightJava, // Kotlin uses similar highlighting to Java
    yaml: highlightJSON, // YAML uses similar highlighting to JSON
    bash: highlightBash,
    shell: highlightBash,
    sh: highlightBash,
    xml: highlightHTML, // XML uses similar highlighting to HTML
    markdown: highlightMarkdown,
  }

  // 转换为小写以确保匹配
  const lowerLang = language.toLowerCase()
  const highlighter = highlighters[lowerLang]
  
  console.log('[CodeBlock] Language:', language, 'Lowercase:', lowerLang, 'Highlighter found:', !!highlighter)
  
  if (highlighter) {
    codeElement.innerHTML = highlighter(code)
  } else {
    console.warn('[CodeBlock] No highlighter found for language:', language)
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

// Bash/Shell 高亮
function highlightBash(code: string): string {
  // 保存字符串和注释
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
  code = code.replace(/(#.*$)/gm, (match) => {
    comments.push(match)
    return `__COMMENT_${commentIndex++}__`
  })

  // 关键字
  const keywords = /\b(if|then|else|elif|fi|for|do|done|while|until|case|esac|function|return|break|continue|exit|export|source|alias|echo|read|cd|ls|mkdir|rm|cp|mv|cat|grep|sed|awk|find|chmod|chown|sudo|apt|yum|npm|git|docker|kubectl)\b/g
  code = code.replace(keywords, '<span style="color: #c678dd; font-weight: 600;">$1</span>')

  // 变量
  code = code.replace(/(\$\w+|\${[^}]+})/g, '<span style="color: #e06c75;">$1</span>')

  // 数字
  code = code.replace(/\b(\d+)\b/g, '<span style="color: #d19a66;">$1</span>')

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

// Markdown 高亮
function highlightMarkdown(code: string): string {
  // 代码块
  code = code.replace(/```[\s\S]*?```/g, (match) => {
    return `<span style="color: #98c379; background: rgba(0,0,0,0.2); padding: 2px 4px; border-radius: 3px;">${escapeHtml(match)}</span>`
  })

  // 内联代码
  code = code.replace(/`[^`]+`/g, (match) => {
    return `<span style="color: #98c379; background: rgba(0,0,0,0.2); padding: 2px 4px; border-radius: 3px;">${escapeHtml(match)}</span>`
  })

  // 标题
  code = code.replace(/^(#{1,6})\s+(.*)$/gm, (match, hashes, title) => {
    return `<span style="color: #e06c75; font-weight: 600;">${escapeHtml(hashes)}</span> <span style="color: #61afef; font-weight: 600;">${escapeHtml(title)}</span>`
  })

  // 链接
  code = code.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    return `<span style="color: #61afef;">[${escapeHtml(text)}]</span><span style="color: #56b6c2;">(${escapeHtml(url)})</span>`
  })

  // 加粗
  code = code.replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, (match, bold1, bold2) => {
    const text = bold1 || bold2
    return `<span style="color: #d19a66; font-weight: 600;">${escapeHtml(match)}</span>`
  })

  // 斜体
  code = code.replace(/\*([^*]+)\*|_([^_]+)_/g, (match) => {
    return `<span style="color: #d19a66; font-style: italic;">${escapeHtml(match)}</span>`
  })

  // 列表
  code = code.replace(/^(\s*[-*+]|\s*\d+\.)\s+/gm, (match) => {
    return `<span style="color: #c678dd;">${escapeHtml(match)}</span>`
  })

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
  console.log('[CodeBlock] insertCodeBlock called', { state, dispatch })
  
  // 保存当前的选区
  const editorContent = document.querySelector('.ldesign-editor-content') as HTMLElement
  if (!editorContent) {
    console.error('[CodeBlock] Editor content not found')
    return false
  }
  
  console.log('[CodeBlock] Editor content found', editorContent)

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

  // 显示代码编辑器对话框（使用统一的对话框组件）
  showCodeBlockDialog({
    selectedText,
    onConfirm: (codeContent, language, theme) => {
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

    // 获取选择的主题
    const currentTheme = CODE_THEMES[theme as keyof typeof CODE_THEMES] || CODE_THEMES.oneDark
    
    // 创建代码块容器
    const codeBlockContainer = document.createElement('div')
    codeBlockContainer.className = 'code-block-container'
    codeBlockContainer.setAttribute('data-theme', theme)
    codeBlockContainer.style.cssText = `
      position: relative;
      margin: 16px 0;
      border-radius: 8px;
      overflow: hidden;
      background: ${currentTheme.background};
      border: 1px solid ${currentTheme.border};
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
      // 调试信息
      console.log('[CodeBlock] Applying syntax highlighting for language:', language)
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

    // 监听内容变化以更新行号
    code.addEventListener('input', () => {
      updateLineNumbers()
      // 暂时禁用实时语法高亮，因为它会干扰编辑
      // 可以考虑在失去焦点时或通过按钮手动触发高亮
    })
    
    // 在失去焦点时重新应用语法高亮
    code.addEventListener('blur', () => {
      if (language && language !== 'plaintext') {
        console.log('[CodeBlock] Reapplying syntax highlighting on blur')
        applySyntaxHighlighting(code, language)
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
    }
  })

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
