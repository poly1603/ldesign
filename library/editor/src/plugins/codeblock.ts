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

    // 创建代码块元素
    const pre = document.createElement('pre')
    const code = document.createElement('code')
    
    // 设置语言类（用于语法高亮）
    if (language && language !== 'plaintext') {
      code.className = `language-${language}`
      pre.setAttribute('data-language', language)
    }
    
    // 设置样式
    pre.style.backgroundColor = '#2d2d2d'
    pre.style.border = '1px solid #3a3a3a'
    pre.style.borderRadius = '6px'
    pre.style.padding = '16px'
    pre.style.margin = '16px 0'
    pre.style.fontFamily = 'Consolas, Monaco, "Courier New", monospace'
    pre.style.fontSize = '14px'
    pre.style.lineHeight = '1.6'
    pre.style.overflow = 'auto'
    pre.style.whiteSpace = 'pre'
    pre.style.position = 'relative'
    // 不设置 pre 为 contenteditable，只设置 code
    
    code.textContent = codeContent
    code.setAttribute('contenteditable', 'true')
    code.style.display = 'block'
    code.style.color = '#f8f8f2'
    code.style.background = 'transparent'
    code.style.border = 'none'
    code.style.outline = 'none'
    code.style.padding = '0'
    code.style.margin = '0'
    code.style.fontFamily = 'inherit'
    code.style.fontSize = 'inherit'
    code.style.lineHeight = 'inherit'
    code.style.whiteSpace = 'pre-wrap'
    code.style.wordWrap = 'break-word'
    code.style.overflowWrap = 'break-word'

    // 如果支持语法高京，添加语言标签
    if (language && language !== 'plaintext') {
      const langLabel = document.createElement('span')
      langLabel.textContent = language.toUpperCase()
      langLabel.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        padding: 4px 10px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        color: #a0a0a0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        user-select: none;
        backdrop-filter: blur(4px);
      `
      pre.appendChild(langLabel)
    }

    pre.appendChild(code)
    
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
    
    // 删除选中的内容并插入代码块
    range.deleteContents()
    range.insertNode(pre)

    // 插入一个段落在代码块后面，以便可以继续编辑
    const p = document.createElement('p')
    p.innerHTML = '<br>'
    if (pre.nextSibling) {
      pre.parentNode?.insertBefore(p, pre.nextSibling)
    } else {
      pre.parentNode?.appendChild(p)
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
