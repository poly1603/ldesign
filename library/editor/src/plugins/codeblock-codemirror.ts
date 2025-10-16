/**
 * 代码块插件 - 使用 CodeMirror 编辑器
 */

import { createPlugin } from '../core/Plugin'
import type { Plugin, Command } from '../types'

// CodeMirror imports
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching, foldGutter, foldKeymap } from '@codemirror/language'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { lintKeymap } from '@codemirror/lint'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { json } from '@codemirror/lang-json'
import { sql } from '@codemirror/lang-sql'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'

/**
 * 获取语言支持
 */
function getLanguageSupport(language: string) {
  const langMap: Record<string, any> = {
    javascript: javascript(),
    typescript: javascript({ typescript: true }),
    jsx: javascript({ jsx: true }),
    tsx: javascript({ jsx: true, typescript: true }),
    python: python(),
    java: java(),
    cpp: cpp(),
    c: cpp(),
    csharp: java(), // 使用 Java 语法高亮
    html: html(),
    xml: html(),
    css: css(),
    scss: css(),
    json: json(),
    sql: sql(),
    markdown: markdown(),
  }

  return langMap[language.toLowerCase()] || null
}

/**
 * 创建代码编辑器对话框
 * @param onInsert 插入回调
 * @param initialCode 初始代码
 * @param initialLanguage 初始语言
 */
function createCodeEditorDialog(
  onInsert: (code: string, language: string, editor: EditorView) => void,
  initialCode: string = '',
  initialLanguage: string = 'javascript'
) {
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
    backdrop-filter: blur(4px);
    z-index: 10000;
    display: flex;
    animation: fadeIn 0.2s ease-out;
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
    max-width: 900px;
    height: 70vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease-out;
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
    { value: 'plaintext', label: '纯文本' },
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

  // 代码编辑器容器
  const editorContainer = document.createElement('div')
  editorContainer.style.cssText = `
    flex: 1;
    overflow: hidden;
    position: relative;
  `

  // 设置初始语言
  languageSelect.value = initialLanguage
  
  // 初始化 CodeMirror
  let editorView: EditorView | null = null

  const initEditor = (language: string = 'javascript', code: string = '') => {
    // 清除旧的编辑器
    if (editorView) {
      editorView.destroy()
    }

    // 获取语言支持
    const langSupport = getLanguageSupport(language)
    
    // 基础扩展配置
    const basicExtensions = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        ...lintKeymap
      ])
    ]
    
    const extensions = [
      ...basicExtensions,
      oneDark,
      EditorView.theme({
        '&': { height: '100%' },
        '.cm-scroller': { overflow: 'auto' },
        '.cm-content': { padding: '16px' },
        '.cm-focused': { outline: 'none' },
        '.cm-editor.cm-focused': { outline: 'none' },
      }),
    ]

    if (langSupport) {
      extensions.push(langSupport)
    }

    // 创建新的编辑器
    const state = EditorState.create({
      doc: code,
      extensions
    })

    editorView = new EditorView({
      state,
      parent: editorContainer
    })

    // 聚焦编辑器
    setTimeout(() => {
      editorView?.focus()
    }, 100)
  }

  // 语言改变时重新初始化编辑器
  languageSelect.addEventListener('change', () => {
    const currentCode = editorView?.state.doc.toString() || ''
    initEditor(languageSelect.value, currentCode)
  })

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
    // 添加关闭动画
    overlay.style.animation = 'fadeIn 0.2s ease-out reverse'
    dialog.style.animation = 'slideUp 0.2s ease-out reverse'
    
    setTimeout(() => {
      if (editorView) {
        editorView.destroy()
      }
      overlay.remove()
      // 清理动画样式
      const animStyle = document.querySelector('.code-editor-animations')
      if (animStyle) {
        animStyle.remove()
      }
    }, 200)
  }

  // 插入代码
  const handleInsert = () => {
    if (!editorView) return
    
    const code = editorView.state.doc.toString().trim()
    if (code) {
      onInsert(code, languageSelect.value, editorView)
      closeDialog()
    } else {
      // 提示输入代码
      alert('请输入代码内容')
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

  // ESC键关闭，Ctrl+Enter插入
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeDialog()
    } else if (e.key === 'Enter' && e.ctrlKey) {
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

  // 添加动画样式
  const style = document.createElement('style')
  style.className = 'code-editor-animations'
  style.textContent = `
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `
  document.head.appendChild(style)

  // 初始化编辑器
  initEditor(initialLanguage, initialCode)

  return { overlay, editorView, languageSelect }
}

/**
 * 插入代码块到编辑器
 */
const insertCodeBlock: Command = (state, dispatch) => {
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
  createCodeEditorDialog((codeContent, language, cmEditor) => {
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
      range = document.createRange()
      range.selectNodeContents(editorContent)
      range.collapse(false)
      currentSelection.removeAllRanges()
      currentSelection.addRange(range)
    }

    // 创建代码块容器
    const codeBlockContainer = document.createElement('div')
    codeBlockContainer.className = 'code-block-container'
    codeBlockContainer.contentEditable = 'false'
    codeBlockContainer.style.cssText = `
      position: relative;
      margin: 16px 0;
      border-radius: 8px;
      overflow: hidden;
      background: #282c34;
      border: 1px solid #3a3f4a;
    `

    // 创建头部
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

    // 按钮容器
    const buttonContainer = document.createElement('div')
    buttonContainer.style.cssText = `
      display: flex;
      gap: 8px;
    `

    // 编辑按钮
    const editButton = document.createElement('button')
    editButton.textContent = '编辑'
    editButton.style.cssText = `
      padding: 4px 12px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      color: #abb2bf;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
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

    // CodeMirror 容器
    const cmContainer = document.createElement('div')
    cmContainer.style.cssText = `
      height: 300px;
      overflow: auto;
    `

    // 初始化 CodeMirror 只读视图
    const langSupport = getLanguageSupport(language)
    
    // 只读视图的基础扩展
    const readOnlyExtensions = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      foldGutter(),
      drawSelection(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      bracketMatching(),
      EditorView.editable.of(false), // 设置为只读
    ]
    
    const extensions = [
      ...readOnlyExtensions,
      oneDark,
      EditorView.theme({
        '&': { height: '100%' },
        '.cm-scroller': { overflow: 'auto' },
        '.cm-content': { padding: '12px 16px' },
        '.cm-focused': { outline: 'none' },
        '.cm-editor.cm-focused': { outline: 'none' },
      }),
    ]

    if (langSupport) {
      extensions.push(langSupport)
    }

    const readOnlyState = EditorState.create({
      doc: codeContent,
      extensions
    })

    const readOnlyView = new EditorView({
      state: readOnlyState,
      parent: cmContainer
    })

    // 存储当前语言
    let currentLanguage = language
    
    // 编辑按钮事件
    editButton.addEventListener('click', (e) => {
      e.stopPropagation()
      e.preventDefault()
      
      // 获取当前代码和语言
      const currentCode = readOnlyView.state.doc.toString()
      
      // 打开编辑对话框，传入当前代码和语言
      createCodeEditorDialog((newCode, newLang, editor) => {
        // 如果语言改变了，需要重新创建只读视图
        if (newLang !== currentLanguage) {
          currentLanguage = newLang
          
          // 获取新的语言支持
          const newLangSupport = getLanguageSupport(newLang)
          
          // 重新创建扩展数组
          const newExtensions = [
            lineNumbers(),
            highlightActiveLineGutter(),
            highlightSpecialChars(),
            foldGutter(),
            drawSelection(),
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
            bracketMatching(),
            EditorView.editable.of(false),
            oneDark,
            EditorView.theme({
              '&': { height: '100%' },
              '.cm-scroller': { overflow: 'auto' },
              '.cm-content': { padding: '12px 16px' },
              '.cm-focused': { outline: 'none' },
              '.cm-editor.cm-focused': { outline: 'none' },
            }),
          ]
          
          if (newLangSupport) {
            newExtensions.push(newLangSupport)
          }
          
          // 销毁旧视图
          readOnlyView.destroy()
          
          // 创建新视图
          const newState = EditorState.create({
            doc: newCode,
            extensions: newExtensions
          })
          
          const newView = new EditorView({
            state: newState,
            parent: cmContainer
          })
          
          // 更新引用
          Object.assign(readOnlyView, newView)
        } else {
          // 只更新内容
          const transaction = readOnlyView.state.update({
            changes: { from: 0, to: readOnlyView.state.doc.length, insert: newCode }
          })
          readOnlyView.dispatch(transaction)
        }
        
        // 更新语言标签
        langLabel.textContent = newLang && newLang !== 'plaintext' ? newLang.toUpperCase() : 'CODE'
      }, currentCode, currentLanguage)
    })

    // 复制按钮事件
    copyButton.addEventListener('click', (e) => {
      e.stopPropagation()
      e.preventDefault()
      
      const codeText = readOnlyView.state.doc.toString()
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
    })

    buttonContainer.appendChild(editButton)
    buttonContainer.appendChild(copyButton)
    header.appendChild(langLabel)
    header.appendChild(buttonContainer)

    codeBlockContainer.appendChild(header)
    codeBlockContainer.appendChild(cmContainer)

    // 插入代码块
    range.deleteContents()
    range.insertNode(codeBlockContainer)

    // 插入一个段落在代码块后面
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

    // 触发输入事件
    setTimeout(() => {
      const event = new Event('input', { bubbles: true, cancelable: true })
      editorContent.dispatchEvent(event)
    }, 0)
  }, selectedText) // 传入选中的文本作为初始代码

  return true
}

/**
 * 代码块插件 - CodeMirror 版本
 */
export const CodeBlockCodeMirrorPlugin: Plugin = createPlugin({
  name: 'codeBlockCodeMirror',
  commands: {
    insertCodeBlock
  },
  keys: {
    'Mod-Alt-C': insertCodeBlock
  }
})